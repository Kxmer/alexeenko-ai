
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { createBarChatSession, extractUserMemory, transcribeAudio } from '../services/geminiService';
import { blobToBase64 } from '../services/audioUtils';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatInterfaceProps {
  isVisible?: boolean;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const HISTORY_KEY = 'alexeenko_chat_history_v2';
const MEMORY_KEY = 'alexeenko_user_persona';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isVisible = true, onScroll }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [{ id: 'welcome', role: 'model', text: 'Приветствую! Я твой персональный ИИ-бармен. Что смешаем сегодня?' }];
  });
  
  const [userMemory, setUserMemory] = useState<string>(() => localStorage.getItem(MEMORY_KEY) || "");
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatSessionRef = useRef<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Recorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 44), 140)}px`;
    }
  };

  useEffect(() => {
    const apiHistory = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    
    chatSessionRef.current = createBarChatSession(apiHistory, userMemory);
    
    setTimeout(adjustTextareaHeight, 0);
  }, []); 

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    if (messages.length > 1 && messages.length % 6 === 0 && !isLoading) {
      updatePersona();
    }
  }, [messages]);

  const updatePersona = async () => {
    const apiHistory = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    
    const newMemory = await extractUserMemory(apiHistory);
    if (newMemory) {
      setUserMemory(newMemory);
      localStorage.setItem(MEMORY_KEY, newMemory);
      console.log("Updated Persona:", newMemory);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isLoading, isTyping, isTranscribing]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          setIsTranscribing(true);
          try {
            const base64 = await blobToBase64(audioBlob);
            const text = await transcribeAudio(base64, 'audio/webm');
            if (text) {
              setInputValue(prev => (prev ? prev + ' ' + text : text));
              // Optional: adjust height after insertion
              setTimeout(adjustTextareaHeight, 0);
            }
          } catch (e) {
            console.error("Transcription error", e);
            alert("Не удалось распознать речь.");
          } finally {
            setIsTranscribing(false);
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error", err);
      alert("Доступ к микрофону запрещен или не поддерживается.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || isTyping || isRecording || isTranscribing) return;
    const userText = inputValue.trim();
    setInputValue('');
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: userText }]);
    
    setIsLoading(true);
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) {
          const apiHistory = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }));
          chatSessionRef.current = createBarChatSession(apiHistory, userMemory);
      }
      
      const result = await chatSessionRef.current.sendMessage({ message: userText });
      const fullResponse = result.text || '';
      
      setIsLoading(false); 
      const blocks = fullResponse.split('\n\n').filter(block => block.trim() !== '');
      
      for (const block of blocks) {
        const typingTime = Math.min(Math.max(block.length * 15 + Math.random() * 200, 400), 1500);
        await sleep(typingTime);
        const aiMsgId = Math.random().toString(36).substr(2, 9);
        setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: block.trim() }]);
        await sleep(300);
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Упс... Шейкер заклинило. Давай попробуем еще раз.' }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[40] bg-white/20 dark:bg-black/20 backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Messages Scroll Area */}
      <div ref={scrollContainerRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-hide flex flex-col pt-32 pb-10">
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col w-full message-pop-in ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`
              max-w-[85%] p-4 text-[14px] leading-relaxed relative overflow-hidden backdrop-blur-[60px] border transition-all duration-300 
              ${msg.role === 'user' 
                ? 'bg-indigo-500/[0.1] dark:bg-indigo-500/[0.15] border-indigo-400/30 text-indigo-900 dark:text-white rounded-[1.8rem] rounded-tr-none' 
                : 'bg-white/60 border-black/5 dark:bg-white/[0.05] dark:border-white/20 text-slate-700 dark:text-zinc-100 rounded-[1.8rem] rounded-tl-none shadow-sm dark:shadow-none'}
            `}>
              <div className="relative z-10 markdown prose prose-sm max-w-none text-inherit prose-p:text-inherit prose-strong:text-inherit">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
      </div>

      {/* Bottom Input Area */}
      <div className="flex-shrink-0 w-full bg-white/40 dark:bg-black/40 backdrop-blur-[40px] border-t border-black/5 dark:border-white/[0.05] px-4 pb-[96px] pt-4 relative z-50">
        
        {/* Indicators */}
        <div className={`absolute left-0 right-0 bottom-full mb-4 flex justify-center transition-all duration-500 ease-out ${(isLoading || isTyping || isTranscribing) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`}>
          <div className="px-5 py-2 rounded-full bg-white dark:bg-black/80 border border-black/5 dark:border-white/20 backdrop-blur-3xl shadow-xl flex items-center gap-3">
             <div className="flex gap-1.5 items-center">
               <div className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" />
               <div className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
               <div className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
             </div>
             <span className="text-[9px] font-black text-slate-500 dark:text-white/80 uppercase tracking-[0.3em]">
               {isTranscribing ? 'Распознаю голос...' : 'Бармен печатает...'}
             </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto flex items-end gap-3 bg-white/50 dark:bg-white/[0.08] border border-black/5 dark:border-white/20 backdrop-blur-[60px] rounded-[2.5rem] p-1.5 pl-2 pr-2 shadow-xl dark:shadow-2xl">
          
          {/* Microphone Button */}
          <button 
             onClick={isRecording ? stopRecording : startRecording}
             disabled={isLoading || isTyping || isTranscribing}
             className={`w-12 h-12 rounded-[1.4rem] flex items-center justify-center transition-all duration-300 flex-shrink-0 mb-1 ml-1
               ${isRecording 
                 ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                 : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:text-indigo-500 dark:hover:text-white'}
             `}
          >
             {isRecording ? (
               <div className="w-4 h-4 rounded-sm bg-white" />
             ) : (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
             )}
          </button>

          <textarea 
            ref={textareaRef} 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
            placeholder={isRecording ? "Говорите..." : "Спроси у бармена..."} 
            rows={1} 
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/20 px-1 py-4 text-[15px] resize-none scrollbar-hide font-light" 
            disabled={isLoading || isTyping || isRecording || isTranscribing} 
          />
          
          <button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isLoading || isTyping || isRecording || isTranscribing} 
            className={`w-12 h-12 rounded-[1.4rem] transition-all duration-500 flex items-center justify-center flex-shrink-0 mb-1 ${inputValue.trim() && !isLoading && !isTyping && !isRecording && !isTranscribing ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-black/5 dark:bg-white/5 text-slate-300 dark:text-white/5 opacity-0 pointer-events-none'}`}
          >
            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
