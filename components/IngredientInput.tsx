
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { GlassCard } from './GlassCard';
import { COCKTAIL_FACTS } from '../data/barIngredients';

interface IngredientInputProps {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (ingredient: string) => void;
  onImageAnalysis: (base64: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isAnalyzingImage: boolean;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({ 
  ingredients, 
  onAdd, 
  onRemove, 
  onImageAnalysis,
  onSubmit,
  isLoading,
  isAnalyzingImage
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [factIndex, setFactIndex] = useState(0);
  const [factOpacity, setFactOpacity] = useState(1);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isLoading || isAnalyzingImage) {
      setFactIndex(Math.floor(Math.random() * COCKTAIL_FACTS.length));
      
      interval = setInterval(() => {
        setFactOpacity(0);
        setTimeout(() => {
          setFactIndex((prev) => (prev + 1) % COCKTAIL_FACTS.length);
          setFactOpacity(1);
        }, 300);
      }, 4000);
    } else {
      setFactOpacity(1);
    }

    return () => clearInterval(interval);
  }, [isLoading, isAnalyzingImage]);

  const processAndAdd = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;

    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map(p => p.trim()).filter(p => p.length > 0);
      parts.forEach(p => onAdd(p));
    } else {
      onAdd(trimmed);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      processAndAdd(inputValue);
      setInputValue('');
    }
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      processAndAdd(inputValue);
      setInputValue('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (base64) {
          onImageAnalysis(base64);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Ваш браузер не поддерживает голосовой ввод.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        const cleanText = transcript.replace(/\.$/, '');
        setInputValue(cleanText);
      }
    };

    recognition.start();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      
      <GlassCard className="p-1.5 flex items-center group focus-within:border-black/20 dark:focus-within:border-white/30 transition-all duration-500">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Слушаю..." : isAnalyzingImage ? "Смотрю на фото..." : "Водка, Лайм..."}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/20 py-4 pl-6 pr-2 text-base font-light tracking-wide"
            disabled={isLoading || isAnalyzingImage}
          />

          <div className="flex items-center gap-1 pr-1">
            <button 
              onClick={startListening}
              className={`p-3 rounded-2xl transition-all duration-300 ${isListening ? 'text-indigo-500 dark:text-indigo-400 bg-indigo-500/10' : 'text-slate-400 dark:text-white/30 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="Голосовой ввод"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl text-slate-400 dark:text-white/30 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              title="Анализ по фото"
              disabled={isAnalyzingImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </button>
            
            <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 mx-1" />

            <button 
              onClick={handleAddClick}
              disabled={!inputValue.trim() || isLoading || isAnalyzingImage}
              className={`p-3 rounded-2xl transition-all duration-300 ${inputValue.trim() ? 'text-white bg-slate-800 dark:bg-white/10' : 'text-slate-300 dark:text-white/10 cursor-default'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2.5 min-h-[40px] justify-center px-2">
        {ingredients.map((ing, idx) => (
          <div 
            key={`${ing}-${idx}`}
            className="card-enter inline-flex items-center pl-4 pr-3 py-2 rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/5 dark:border-white/[0.08] backdrop-blur-md text-sm text-slate-700 dark:text-white/80 font-light hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer shadow-sm"
            onClick={() => !isLoading && !isAnalyzingImage && onRemove(ing)}
          >
            <span className="mr-2">{ing}</span>
            <div className="bg-black/5 dark:bg-white/10 rounded-full p-1">
              <svg className="w-3 h-3 text-slate-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={ingredients.length === 0 || isLoading || isAnalyzingImage}
        className={`w-full py-5 rounded-3xl font-light tracking-[0.2em] text-sm uppercase transition-all duration-500 border min-h-[72px] ${ingredients.length > 0 && !isLoading && !isAnalyzingImage ? 'bg-slate-900 dark:bg-white/[0.05] border-black/10 dark:border-white/20 text-white' : 'bg-transparent border-black/5 dark:border-white/5 text-slate-300 dark:text-white/10'}`}
      >
        {isLoading || isAnalyzingImage ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-slate-500 dark:text-white/50" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs font-bold tracking-[0.2em] text-slate-600 dark:text-white/60">{isAnalyzingImage ? 'Сканирую фото...' : 'Изучаю вкусы...'}</span>
            </div>
            <div className="text-[10px] normal-case font-light text-slate-400 dark:text-white/40 max-w-xs text-center leading-tight transition-opacity duration-300" style={{ opacity: factOpacity }}>
              {COCKTAIL_FACTS[factIndex]}
            </div>
          </div>
        ) : "Создать меню"}
      </button>
    </div>
  );
};
