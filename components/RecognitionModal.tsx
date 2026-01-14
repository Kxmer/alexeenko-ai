
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';

interface RecognitionModalProps {
  ingredients: string[];
  onConfirm: (finalIngredients: string[]) => void;
  onCancel: () => void;
}

export const RecognitionModal: React.FC<RecognitionModalProps> = ({ 
  ingredients: initialIngredients, 
  onConfirm, 
  onCancel 
}) => {
  const [items, setItems] = useState<string[]>(initialIngredients);
  const [newItem, setNewItem] = useState('');

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleEditItem = (idx: number, val: string) => {
    const newItems = [...items];
    newItems[idx] = val;
    setItems(newItems);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-hidden h-[100dvh]">
      {/* Liquid Glass Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-200/40 dark:bg-black/60 backdrop-blur-[20px] animate-fade-in transition-all duration-500"
        onClick={onCancel}
      />
      
      {/* Modal Container - Flexible Height with max-height constraint */}
      <div className="relative w-full max-w-md liquid-reveal flex flex-col max-h-full shadow-2xl rounded-[2.5rem]">
        <GlassCard className="flex flex-col p-6 sm:p-8 border-white/20 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-[#121214]/80 max-h-full">
          
          {/* Header */}
          <div className="text-center mb-6 flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-400/30 flex items-center justify-center text-2xl mx-auto mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              🔍
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-2">Распознано</h3>
            <p className="text-xs text-slate-500 dark:text-white/50 font-light max-w-[250px] mx-auto">
              Проверь список перед добавлением в бар.
            </p>
          </div>

          {/* Scrollable List - Key for mobile fix: min-h-0 and flex-1 */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-6 scrollbar-hide min-h-0 -mr-2 pr-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 group animate-card-enter" style={{ animationDelay: `${idx * 50}ms` }}>
                <input 
                  type="text" 
                  value={item}
                  onChange={(e) => handleEditItem(idx, e.target.value)}
                  className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:border-indigo-500/50 outline-none transition-all placeholder-slate-400 dark:placeholder-white/20"
                />
                <button 
                  onClick={() => removeItem(idx)}
                  className="p-3 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-all border border-red-500/10 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Добавить еще..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 border-dashed rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-white/60 placeholder-slate-400 dark:placeholder-white/20 focus:border-indigo-500/30 outline-none transition-all italic"
              />
              <button 
                onClick={addItem}
                disabled={!newItem.trim()}
                className="p-3 rounded-xl bg-black/5 dark:bg-white/10 text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-all border border-black/5 dark:border-white/10 disabled:opacity-0 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Footer - Fixed at bottom of card */}
          <div className="flex gap-3 flex-shrink-0 pt-2 border-t border-black/5 dark:border-white/5">
            <button 
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl bg-transparent border border-black/10 dark:border-white/10 text-slate-500 dark:text-white/60 text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              Отмена
            </button>
            <button 
              onClick={() => onConfirm(items)}
              className="flex-[1.5] py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            >
              Добавить
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
