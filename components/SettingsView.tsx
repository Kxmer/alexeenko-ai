
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GlassCard } from './GlassCard';

interface SettingsViewProps {
    toggleTheme: () => void;
    currentTheme: string;
    onReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ toggleTheme, currentTheme, onReset }) => {
  const [memory, setMemory] = useState<string>('');
  const [chatCount, setChatCount] = useState<number>(0);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    // Load data
    const savedMemory = localStorage.getItem('alexeenko_user_persona') || '';
    setMemory(savedMemory);

    const savedHistory = localStorage.getItem('alexeenko_chat_history_v2');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatCount(parsed.length);
      } catch (e) {
        setChatCount(0);
      }
    }
  }, []);

  const handleResetData = () => {
    if (confirmDelete) {
        setIsResetting(true);
        
        // Use a slight delay to allow the UI to update to the loading state
        setTimeout(() => {
            try {
                // Clear all app specific data
                const keysToRemove = [
                    'alexeenko_chat_history_v2',
                    'alexeenko_user_persona',
                    'la_ai_favorites',
                    'alexeenko_theme'
                ];
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
            } catch (e) {
                console.error("Failed to clear storage:", e);
            }
            
            // Call parent reset instead of reload to avoid browser crashes
            setTimeout(() => {
                onReset();
            }, 500);
        }, 500);
    } else {
        setConfirmDelete(true);
        // Сброс подтверждения через 3 секунды
        setTimeout(() => {
            setConfirmDelete(false);
        }, 4000);
    }
  };

  if (isResetting) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in px-6 text-center">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
              <h2 className="text-xl font-light text-slate-800 dark:text-white tracking-[0.2em] uppercase mb-3">Перезагрузка системы</h2>
              <p className="text-sm text-slate-500 dark:text-white/40 font-light leading-relaxed max-w-xs mx-auto">
                  Стираем память и готовим бар к новому открытию...
              </p>
          </div>
      );
  }

  return (
    <div className={`flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-40 px-6 w-full max-w-2xl mx-auto transition-all duration-500 opacity-100 scale-100`}>
      
      <div className="text-center mb-10 mt-6 animate-fade-in">
        <h2 className="text-2xl font-light text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-2">Настройки</h2>
        <p className="text-xs text-slate-500 dark:text-white/40 font-light">Управление памятью и данными</p>
      </div>

      <div className="space-y-6">

        {/* Theme Toggle */}
        <div className="animate-card-enter" style={{ animationDelay: '50ms' }}>
            <button 
                onClick={toggleTheme}
                className="w-full relative overflow-hidden rounded-[2.5rem] bg-white/60 dark:bg-white/[0.01] border border-black/[0.05] dark:border-white/[0.08] p-1 group transition-all duration-300 active:scale-[0.98] shadow-lg hover:bg-white/80 dark:hover:bg-white/[0.04]"
            >
                <div className="relative z-10 p-5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-500 ${currentTheme === 'dark' ? 'bg-indigo-500/20 border border-indigo-500/40 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'}`}>
                            {currentTheme === 'dark' ? '🌙' : '☀️'}
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Оформление</h3>
                            <p className="text-[10px] text-slate-500 dark:text-white/40 mt-1">{currentTheme === 'dark' ? 'Ночной режим включен' : 'Светлая тема включена'}</p>
                        </div>
                     </div>
                     
                     <div className="w-14 h-8 rounded-full bg-black/10 dark:bg-white/10 relative transition-all duration-300">
                        <div className={`absolute top-1 bottom-1 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${currentTheme === 'dark' ? 'translate-x-7 bg-indigo-500' : 'translate-x-1 bg-amber-500'}`} />
                     </div>
                </div>
            </button>
        </div>
        
        {/* Profile Card */}
        <div className="animate-card-enter" style={{ animationDelay: '100ms' }}>
            <GlassCard className="p-8 border-indigo-500/20 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.03]">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 dark:border-indigo-500/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        👤
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Цифровой портрет</h3>
                        <p className="text-[10px] text-indigo-500/80 dark:text-indigo-300/80 mt-1">Что бармен знает о вас</p>
                    </div>
                </div>
                
                <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-5 border border-black/5 dark:border-white/5 min-h-[100px]">
                    {memory ? (
                        <div className="text-[14px] text-slate-700 dark:text-white/80 font-normal leading-relaxed whitespace-pre-line markdown">
                           <ReactMarkdown>{memory}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-4 opacity-50">
                            <span className="text-2xl mb-2">😶‍🌫️</span>
                            <p className="text-[11px] text-slate-500 dark:text-white/50 text-center">Мы пока мало знакомы.<br/>Пообщайтесь с барменом, чтобы сформировать портрет.</p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>

        {/* Stats Card */}
        <div className="animate-card-enter" style={{ animationDelay: '200ms' }}>
             <GlassCard className="p-6 border-black/10 dark:border-white/10">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-white/60 uppercase tracking-widest">Сообщений в истории</span>
                    <span className="text-xl font-thin text-slate-900 dark:text-white font-mono">{chatCount}</span>
                </div>
             </GlassCard>
        </div>

        {/* Danger Zone */}
        <div className="animate-card-enter relative z-20 pt-4" style={{ animationDelay: '300ms' }}>
            <button 
                onClick={handleResetData}
                className={`w-full relative overflow-hidden rounded-[2rem] p-1 group transition-all duration-300 active:scale-[0.98] shadow-lg border ${confirmDelete ? 'bg-red-500 border-red-400' : 'bg-black/5 dark:bg-black/40 border-red-500/20 dark:border-red-500/30 hover:border-red-500/60 hover:bg-red-500/[0.05]'}`}
            >
                <div className="relative z-10 p-5 flex flex-col items-center gap-3">
                    <div className={`p-3 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.15)] ${confirmDelete ? 'bg-white text-red-500 scale-110' : 'bg-red-500/10 text-red-500 group-hover:scale-110'}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <span className={`block text-[11px] font-black uppercase tracking-[0.2em] mb-1 transition-colors ${confirmDelete ? 'text-white' : 'text-red-500 dark:text-red-400 group-hover:text-red-400 dark:group-hover:text-red-300'}`}>
                            {confirmDelete ? 'НАЖМИТЕ ЕЩЕ РАЗ' : 'Удалить все данные'}
                        </span>
                        <span className={`block text-[9px] font-light leading-relaxed max-w-[200px] mx-auto transition-colors ${confirmDelete ? 'text-white/80' : 'text-red-500/50 dark:text-red-300/40'}`}>
                            {confirmDelete ? 'Для окончательного подтверждения' : 'Нажмите, чтобы стереть память и сбросить приложение'}
                        </span>
                    </div>
                </div>
            </button>
        </div>

        <div className="text-center pt-8 opacity-20 hover:opacity-50 transition-opacity animate-fade-in" style={{ animationDelay: '500ms' }}>
            <p className="text-[9px] uppercase tracking-[0.3em] font-light text-slate-800 dark:text-white">Alexeenko AI v2.5</p>
        </div>

      </div>
    </div>
  );
};
