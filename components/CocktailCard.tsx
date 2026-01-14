
import React, { useState } from 'react';
import { Cocktail } from '../types';
import { GlassCard } from './GlassCard';

interface CocktailCardProps {
  cocktail: Cocktail;
  delay?: number;
  userIngredients: string[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const translateGlass = (glass: string) => {
  const g = glass.toLowerCase();
  if (g.includes('coupe') || g.includes('купе')) return "Купе";
  if (g.includes('rocks') || g.includes('рокс')) return "Рокс";
  if (g.includes('highball') || g.includes('хайбол')) return "Хайбол";
  if (g.includes('collins') || g.includes('коллинз')) return "Коллинз";
  if (g.includes('martini') || g.includes('мартини')) return "Мартинка";
  if (g.includes('nick') || g.includes('ник')) return "Ник и Нора";
  if (g.includes('flute') || g.includes('флюте')) return "Флюте";
  if (g.includes('copper') || g.includes('кружка')) return "Кружка";
  if (g.includes('wine') || g.includes('винный')) return "Винный";
  if (g.includes('hurricane') || g.includes('харрикейн')) return "Харрикейн";
  return glass;
};

const getMethodDescription = (method: string) => {
  const lower = method.toLowerCase();
  if (lower.includes('шейк')) return "Шейк: энергичное охлаждение и аэрация для создания плотной пены и ледяной текстуры.";
  if (lower.includes('стир')) return "Стир: деликатное смешивание в смесительном бокале для сохранения кристальной чистоты.";
  if (lower.includes('билд')) return "Билд: приготовление напитка слоями или простым смешиванием прямо в бокале подачи.";
  if (lower.includes('мадл')) return "Мадл: разминание фруктов или трав для извлечения сока и эфирных масел.";
  if (lower.includes('бленд')) return "Бленд: взбивание в блендере с дробленым льдом до состояния густого снега.";
  return "Профессиональная техника для достижения идеального баланса вкуса.";
};

const getMethodAnimationClass = (method: string) => {
  const lower = method.toLowerCase();
  if (lower.includes('шейк')) return "method-shake";
  if (lower.includes('стир')) return "method-stir";
  if (lower.includes('билд')) return "method-build";
  if (lower.includes('мадл')) return "method-muddle";
  if (lower.includes('бленд')) return "method-blend";
  return "method-build"; 
};

export const CocktailCard: React.FC<CocktailCardProps> = ({ 
  cocktail, 
  delay = 0, 
  userIngredients = [], 
  isFavorite = false,
  onToggleFavorite
}) => {
  const [isAnimate, setIsAnimate] = useState(false);

  const checkAvailability = (recipeIngredient: string) => {
    const normalizedRecipe = recipeIngredient.toLowerCase();
    return userIngredients.some(userIng => {
      const normalizedUser = userIng.toLowerCase().trim();
      if (!normalizedUser) return false;
      if (normalizedRecipe.includes(normalizedUser)) return true;
      const userWords = normalizedUser.split(/[\s,]+/).filter(w => w.length > 2);
      if (userWords.length > 0) {
        return userWords.some(word => normalizedRecipe.includes(word));
      }
      return false;
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimate(true);
    onToggleFavorite?.();
    setTimeout(() => setIsAnimate(false), 500);
  };

  const methodDescription = getMethodDescription(cocktail.method);
  const animationClass = getMethodAnimationClass(cocktail.method);
  const translatedGlassName = translateGlass(cocktail.glassType);

  return (
    <div 
      className="card-enter w-full opacity-0 translate-y-4" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <GlassCard className="flex flex-col p-6 sm:p-8 group transition-all duration-700 relative border-black/[0.05] dark:border-white/[0.03] bg-white/70 dark:bg-white/[0.01] hover:z-[500]">
        
        {/* Rounded Glow Background */}
        <div 
          className="absolute -top-32 -right-32 w-80 h-80 blur-[140px] opacity-[0.12] rounded-full transition-all duration-[3s] pointer-events-none group-hover:opacity-[0.22] group-hover:scale-125 mix-blend-multiply dark:mix-blend-normal"
          style={{ backgroundColor: cocktail.colorHex }}
        />

        {/* Top Minimal Actions - HIGH Z-INDEX */}
        <div className="flex justify-between items-start mb-8 relative z-[100]">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Tooltip container */}
            <div className="group/tooltip relative z-[110] px-3.5 py-2 rounded-full bg-black/5 dark:bg-white/[0.08] border border-black/5 dark:border-white/[0.15] backdrop-blur-3xl cursor-help hover:bg-black/10 dark:hover:bg-white/[0.15] transition-all">
              <span className="text-[9px] font-black tracking-[0.25em] text-slate-600 dark:text-white/70 uppercase flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 ${animationClass}`}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
                {cocktail.method}
              </span>
              
              {/* Actual Tooltip Box */}
              <div className="absolute top-[calc(100%+12px)] left-0 w-72 p-6 rounded-[2.2rem] bg-white dark:bg-[#0c0c0e]/95 border border-black/5 dark:border-white/20 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible translate-y-2 group-hover/tooltip:translate-y-0 transition-all duration-500 z-[999] shadow-[0_40px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.95)] backdrop-blur-[80px] pointer-events-none select-none">
                <div className="absolute top-[-8px] left-6 w-4 h-4 bg-white dark:bg-[#0c0c0e] border-t border-l border-black/5 dark:border-white/20 transform rotate-45" />
                <div className="relative">
                  <p className="text-[9px] font-black tracking-[0.3em] text-slate-400 dark:text-white/30 uppercase mb-3">Техника</p>
                  <p className="text-[13px] text-slate-800 dark:text-white/95 font-light leading-relaxed">
                    {methodDescription}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-3.5 py-2 rounded-full bg-black/5 dark:bg-white/[0.04] border border-black/5 dark:border-white/[0.1] backdrop-blur-3xl">
              <span className="text-[9px] font-black tracking-[0.25em] text-slate-400 dark:text-white/40 uppercase">{translatedGlassName}</span>
            </div>

            {/* Favorite Badge */}
            {isFavorite && (
              <div className="px-3.5 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 backdrop-blur-3xl animate-fade-in flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.15)] relative z-[80]">
                <svg className="w-2.5 h-2.5 text-rose-500 fill-current" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-[9px] font-black tracking-[0.1em] text-rose-500 dark:text-rose-400 uppercase">Избранное</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleToggle}
            className={`
              p-3.5 rounded-full border transition-all duration-500 active:scale-75 relative z-[60]
              ${isFavorite 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)]' 
                : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-400 dark:text-white/30 hover:text-rose-400 hover:border-rose-500/30'}
              ${isAnimate ? 'heart-pop' : ''}
            `}
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${isFavorite ? 'scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'scale-100'}`} fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Hero Section - LOWER Z-INDEX */}
        <div className="mb-8 relative z-[1]">
          <h3 className="text-3xl sm:text-4xl font-extralight text-slate-900 dark:text-white leading-tight tracking-tight mb-4 group-hover:text-black dark:group-hover:text-white/90 transition-colors">
            {cocktail.name}
          </h3>
          <p className="text-[14px] text-slate-500 dark:text-white/40 font-light italic leading-relaxed border-l border-black/10 dark:border-white/10 pl-5">
            "{cocktail.description}"
          </p>
        </div>

        <div className="h-[1px] w-full bg-gradient-to-r from-black/5 dark:from-white/15 via-transparent to-transparent mb-10" />

        {/* Content Section - LOWER Z-INDEX */}
        <div className="space-y-12 relative z-[1] flex-1">
          {/* Ingredients */}
          <section>
            <h4 className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.5em] mb-5">Ингредиенты</h4>
            <div className="space-y-3.5">
              {cocktail.ingredients.map((ing, i) => {
                const isAvailable = checkAvailability(ing);
                return (
                  <div key={i} className={`flex items-center transition-all duration-700 ${isAvailable ? 'available-pop' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-4 transition-all duration-700 ${isAvailable ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] dark:shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-black/10 dark:bg-white/10'}`} />
                    <span className={`text-[14px] font-light tracking-wide transition-colors duration-700 ${isAvailable ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-white/50'}`}>
                      {ing}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reasoning Section (New) */}
          {cocktail.mixologistReasoning && (
            <section className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-[1px] bg-indigo-500/40" />
                <h4 className="text-[9px] font-black text-indigo-500/60 dark:text-indigo-400/60 uppercase tracking-[0.4em]">Анализ баланса</h4>
              </div>
              <div className="p-5 rounded-3xl bg-indigo-500/[0.05] dark:bg-indigo-500/[0.03] border border-indigo-500/10 relative overflow-hidden group/reason">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/reason:opacity-30 transition-opacity">
                  <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-white/50 font-light leading-relaxed italic">
                  {cocktail.mixologistReasoning}
                </p>
              </div>
            </section>
          )}

          {/* Instructions */}
          <section className="pb-8">
            <h4 className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.5em] mb-6">Ритуал приготовления</h4>
            <div className="space-y-6 relative">
              <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-black/[0.05] dark:bg-white/[0.08]" />
              {cocktail.instructions.map((step, i) => (
                <div key={i} className="relative pl-7 group/step">
                  <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-black border border-black/20 dark:border-white/30 group-hover/step:border-indigo-500 dark:group-hover/step:border-white group-hover/step:scale-125 transition-all duration-500 z-10" />
                  <p className="text-[13px] text-slate-600 dark:text-white/60 font-light leading-relaxed group-hover/step:text-slate-900 dark:group-hover/step:text-white/90 transition-all">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </GlassCard>
    </div>
  );
};
