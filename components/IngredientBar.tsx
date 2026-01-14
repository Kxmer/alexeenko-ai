
import React, { useState, useMemo } from 'react';
import { BAR_INGREDIENTS, BAR_CATEGORIES } from '../data/barIngredients';
import { GlassCard } from './GlassCard';

interface IngredientBarProps {
  onAdd: (ingredient: string) => void;
  onRemove: (ingredient: string) => void;
  selectedIngredients: string[];
}

const formatIngredientName = (name: string) => {
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return { brand: match[1], type: match[2] };
  }
  return { brand: name, type: null };
};

export const IngredientBar: React.FC<IngredientBarProps> = ({ onAdd, onRemove, selectedIngredients }) => {
  const [selectedTab, setSelectedTab] = useState<string>(BAR_CATEGORIES[0].id);
  const [renderedCategory, setRenderedCategory] = useState<string>(BAR_CATEGORIES[0].id);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = (id: string) => {
    if (id === selectedTab || isAnimating) return;
    setSearchQuery(''); 
    setSelectedTab(id);
    setIsAnimating(true);
    setTimeout(() => {
      setRenderedCategory(id);
      setIsAnimating(false);
    }, 200);
  };

  const handleIngredientClick = (ing: string) => {
    if (selectedIngredients.includes(ing)) {
      onRemove(ing);
    } else {
      onAdd(ing);
    }
  };

  const allIngredients = useMemo(() => {
    const list: { name: string, catId: string }[] = [];
    Object.entries(BAR_INGREDIENTS).forEach(([catId, items]) => {
      items.forEach(name => list.push({ name, catId }));
    });
    return list;
  }, []);

  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) {
      return BAR_INGREDIENTS[renderedCategory]?.map(name => ({ name, catId: renderedCategory })) || [];
    }
    const q = searchQuery.toLowerCase();
    return allIngredients.filter(item => item.name.toLowerCase().includes(q));
  }, [searchQuery, renderedCategory, allIngredients]);

  return (
    <div className="w-full max-w-full flex flex-col min-h-0 overflow-hidden box-border">
      
      {/* Search Bar - Added px-6 to compensate for removed global padding */}
      <div className="px-6 mb-6 w-full max-w-2xl mx-auto box-border">
        <GlassCard className="p-1.5 flex items-center border-black/5 dark:border-white/10 focus-within:border-black/20 dark:focus-within:border-white/30 focus-within:bg-white/50 dark:focus-within:bg-white/[0.04] transition-all duration-500 shadow-2xl">
           <input 
             type="text" 
             placeholder="Поиск по всему бару..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 py-3.5 pl-6 pr-6 text-[15px] font-light tracking-wide"
           />
           
           <div className="flex items-center gap-1 pr-2 flex-shrink-0">
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="p-3 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-110 active:scale-90"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
           </div>
        </GlassCard>
      </div>

      {!searchQuery && (
        <div className="relative mb-8 z-40 w-full h-[72px] flex justify-center overflow-hidden flex-shrink-0 box-border">
          <div 
            className="flex overflow-x-auto scrollbar-hide items-center gap-3 px-6 py-4 w-full max-w-full box-border touch-pan-x"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
            }}
          >
            {BAR_CATEGORIES.map((cat) => {
              const isActive = selectedTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`
                    relative flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500 ease-out
                    flex items-center justify-center min-w-[120px] border backdrop-blur-md
                    ${isActive 
                      ? 'border-black/10 dark:border-white/20 text-slate-900 dark:text-white bg-white/40 dark:bg-white/10 shadow-sm scale-105 z-10' 
                      : 'border-black/5 dark:border-white/5 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 hover:bg-white/20 dark:hover:bg-white/5 shadow-none'}
                  `}
                >
                  <span className="relative z-10 whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid Container - Added wrapper with px-6 for padding */}
      <div className="w-full px-6 box-border">
          <div className="bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.06] rounded-[2.5rem] border border-black/5 dark:border-white/10 p-2 shadow-[inset_0_2px_40px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_40px_rgba(0,0,0,0.5)] min-h-[420px] relative overflow-hidden z-10 w-full box-border">
            <div 
              className={`
                relative z-10 transition-all duration-200 ease-in-out w-full
                ${isAnimating ? 'opacity-0 blur-sm pointer-events-none' : 'opacity-100 blur-0'}
              `}
            >
              {filteredIngredients.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-1 w-full box-border">
                  {filteredIngredients.map((item, idx) => {
                    const isSelected = selectedIngredients.includes(item.name);
                    const { brand, type } = formatIngredientName(item.name);
                    const isBrandCategory = item.catId === 'brands';
                    
                    return (
                      <button
                        key={`${item.name}-${idx}`}
                        onClick={() => handleIngredientClick(item.name)}
                        className={`
                          relative group overflow-hidden px-4 py-5 rounded-[1.8rem] text-left transition-all duration-300
                          border backdrop-blur-md flex flex-col justify-between min-h-[110px] w-full cursor-pointer box-border
                          ${isSelected 
                            ? 'bg-indigo-500/[0.1] dark:bg-indigo-500/[0.15] border-indigo-400/30 shadow-[0_15px_35px_rgba(99,102,241,0.1)] dark:shadow-[0_15px_35px_rgba(99,102,241,0.15)] scale-[1.01]' 
                            : 'bg-white/60 dark:bg-white/[0.03] border-white/40 dark:border-white/[0.06] shadow-sm dark:shadow-xl dark:shadow-black/20 hover:bg-white/80 dark:hover:bg-white/[0.08] hover:border-black/10 dark:hover:border-white/20 active:scale-98'}
                        `}
                      >
                        <div className="relative z-10 flex flex-col h-full justify-between w-full min-w-0">
                          <div className="flex flex-col gap-0.5 w-full">
                            <span className={`text-[13px] font-semibold tracking-wide leading-tight break-words transition-colors duration-500 ${isSelected ? 'text-indigo-600 dark:text-indigo-50' : 'text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                              {isBrandCategory ? brand : item.name}
                            </span>
                            {isBrandCategory && type && (
                              <span className={`text-[9px] font-medium tracking-wide uppercase opacity-40 transition-opacity group-hover:opacity-60 truncate w-full`}>
                                {type}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex justify-end items-center mt-4">
                            {isSelected ? (
                               <div className="flex items-center gap-1.5 animate-available-pop">
                                  <span className="text-[8px] font-black text-indigo-500/60 dark:text-indigo-400/60 uppercase tracking-widest whitespace-nowrap">В Баре</span>
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
                               </div>
                            ) : (
                               <div className="w-4 h-[1px] bg-black/10 dark:bg-white/10 group-hover:bg-black/20 dark:group-hover:bg-white/40 transition-all duration-500" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center fade-in w-full">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 flex items-center justify-center mb-6 shadow-2xl mx-auto">
                     <span className="text-3xl opacity-20">🔎</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-white/60 uppercase tracking-[0.4em] mb-3 whitespace-nowrap">Ничего не найдено</h3>
                  <p className="text-[11px] font-light text-slate-400 dark:text-white/20 max-w-[200px] leading-relaxed mx-auto">
                     Попробуй другое название или проверь опечатки.
                  </p>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};
