
import React from 'react';

interface BottomNavProps {
  currentView: 'mixer' | 'bar' | 'chat' | 'settings';
  onChangeView: (view: 'mixer' | 'bar' | 'chat' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      {/* Main Container - Floating Pill */}
      <div className="pointer-events-auto bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full p-1 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-[340px] flex relative group hover:border-black/10 dark:hover:border-white/20 transition-colors duration-300">
        
        {/* Liquid Slider Background */}
        <div 
          className={`
            absolute top-1 bottom-1 left-1 w-[calc(25%-2px)] 
            bg-black/5 dark:bg-white/15 border border-black/5 dark:border-white/5 rounded-full
            shadow-inner
            transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)
            ${currentView === 'mixer' ? 'translate-x-0' : ''}
            ${currentView === 'bar' ? 'translate-x-[100%]' : ''}
            ${currentView === 'chat' ? 'translate-x-[200%]' : ''}
            ${currentView === 'settings' ? 'translate-x-[300%]' : ''}
          `}
        >
          {/* Subtle inner gloss/gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 dark:to-white/5 rounded-full" />
        </div>

        {/* Mixer Button */}
        <button 
          onClick={() => onChangeView('mixer')}
          className={`
            flex-1 flex flex-col items-center justify-center py-2.5 rounded-full relative z-10 
            transition-colors duration-500
            ${currentView === 'mixer' ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70'}
          `}
        >
          <div className="relative">
            <svg 
              className={`w-4 h-4 transition-transform duration-500 ${currentView === 'mixer' ? 'animate-nav-shake drop-shadow-md' : 'scale-100 opacity-60'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-[8px] font-bold tracking-[0.15em] uppercase mt-1">Миксер</span>
        </button>

        {/* My Bar Button */}
        <button 
          onClick={() => onChangeView('bar')}
          className={`
            flex-1 flex flex-col items-center justify-center py-2.5 rounded-full relative z-10 
            transition-colors duration-500
            ${currentView === 'bar' ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70'}
          `}
        >
          <div className="relative">
            <svg 
              className={`w-4 h-4 transition-transform duration-500 ${currentView === 'bar' ? 'animate-nav-pop drop-shadow-md' : 'scale-100 opacity-60'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span className="text-[8px] font-bold tracking-[0.15em] uppercase mt-1">Бар</span>
        </button>

         {/* Chat Button */}
         <button 
          onClick={() => onChangeView('chat')}
          className={`
            flex-1 flex flex-col items-center justify-center py-2.5 rounded-full relative z-10 
            transition-colors duration-500
            ${currentView === 'chat' ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70'}
          `}
        >
          <div className="relative">
            <svg 
              className={`w-4 h-4 transition-transform duration-500 ${currentView === 'chat' ? 'animate-nav-bubble drop-shadow-md' : 'scale-100 opacity-60'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="text-[8px] font-bold tracking-[0.15em] uppercase mt-1">Чат</span>
        </button>

         {/* Settings Button */}
         <button 
          onClick={() => onChangeView('settings')}
          className={`
            flex-1 flex flex-col items-center justify-center py-2.5 rounded-full relative z-10 
            transition-colors duration-500
            ${currentView === 'settings' ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70'}
          `}
        >
          <div className="relative">
            <svg 
              className={`w-4 h-4 transition-transform duration-500 ${currentView === 'settings' ? 'animate-nav-spin drop-shadow-md' : 'scale-100 opacity-60'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-[8px] font-bold tracking-[0.15em] uppercase mt-1">Настройки</span>
        </button>
      </div>
    </div>
  );
};
