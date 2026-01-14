
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { IngredientInput } from './components/IngredientInput';
import { IngredientBar } from './components/IngredientBar';
import { CocktailCard } from './components/CocktailCard';
import { BottomNav } from './components/BottomNav';
import { GlassCard } from './components/GlassCard';
import { ChatInterface } from './components/ChatInterface';
import { SettingsView } from './components/SettingsView';
import { RecognitionModal } from './components/RecognitionModal';
import { generateCocktails, generateAcademyItems, generateRandomFact, analyzeIngredientsFromImage } from './services/geminiService';
import { MixologyResponse, Cocktail } from './types';

interface AcademyItem {
  title: string;
  icon: string;
  text: string;
  category: string;
}

const BUTTON_VARIANTS = [
  "Понятно", "Запомнил", "Буду знать", "Интересно", "Ясно", 
  "Принято", "Полезно", "Записал", "Круто", "Ого!", 
  "Учту", "Вдохновляет", "Класс", "Погнали дальше"
];

function App() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingFact, setLoadingFact] = useState(false);
  const [loadingAcademy, setLoadingAcademy] = useState(false);
  const [result, setResult] = useState<MixologyResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'classics' | 'ai' | 'favorites'>('classics');
  const [academyItems, setAcademyItems] = useState<AcademyItem[]>([]);
  const [randomFact, setRandomFact] = useState<string>("Загружаю знания...");
  const [selectedAcademyItem, setSelectedAcademyItem] = useState<AcademyItem | null>(null);
  
  const [recognitionResults, setRecognitionResults] = useState<string[] | null>(null);
  
  const [favorites, setFavorites] = useState<Cocktail[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentView, setCurrentView] = useState<'mixer' | 'bar' | 'chat' | 'settings'>('mixer');
  const [scrolled, setScrolled] = useState(false);
  
  // New state to force remount of components on reset
  const [resetKey, setResetKey] = useState(0);

  // Theme Management
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('alexeenko_theme');
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('alexeenko_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('la_ai_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
    refreshAcademy();
    refreshFact();
  }, []);

  useEffect(() => {
    localStorage.setItem('la_ai_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    setScrolled(false);
  }, [currentView]);

  const toggleFavorite = (cocktail: Cocktail) => {
    setFavorites(prev => {
      const isFav = prev.find(f => f.name === cocktail.name);
      if (isFav) {
        return prev.filter(f => f.name !== cocktail.name);
      } else {
        return [cocktail, ...prev];
      }
    });
  };

  const handleClear = () => {
    setResult(null);
    setShowFavoritesOnly(false);
    setScrolled(false);
    setActiveTab('classics');
  };

  const openFavoritesInMixer = () => {
    setShowFavoritesOnly(true);
    setActiveTab('favorites');
    setScrolled(false);
  };

  const refreshAcademy = async () => {
    setLoadingAcademy(true);
    try {
      const items = await generateAcademyItems();
      if (items && items.length > 0) setAcademyItems(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAcademy(false);
    }
  };

  const refreshFact = async () => {
    setLoadingFact(true);
    try {
      const fact = await generateRandomFact();
      setRandomFact(fact || "Лайм плавает в воде, а лимон тонет.");
    } catch (e) {
      setRandomFact("Лед — самый важный ингредиент коктейля.");
    } finally {
      setLoadingFact(false);
    }
  };

  const handleAddIngredient = (ing: string) => {
    if (!ingredients.includes(ing)) {
      setIngredients([...ingredients, ing]);
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const handleImageAnalysis = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const recognized = await analyzeIngredientsFromImage(base64);
      if (recognized && recognized.length > 0) {
        setRecognitionResults(recognized);
      } else {
        alert("ИИ не смог распознать ингредиенты на фото. Попробуй другое фото или введи вручную.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirmRecognition = (final: string[]) => {
    const uniqueNew = final.filter(item => !ingredients.includes(item));
    setIngredients([...ingredients, ...uniqueNew]);
    setRecognitionResults(null);
  };

  const handleMix = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setResult(null);
    setShowFavoritesOnly(false);
    setCurrentView('mixer');
    try {
      const data = await generateCocktails(ingredients);
      setResult(data);
      setActiveTab('classics');
    } catch (error) {
      console.error("Failed to generate", error);
      alert("Не удалось создать меню. Проверьте соединение и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrolled(target.scrollTop > 5);
  };

  const handleFullReset = () => {
    // Reset all internal state
    setIngredients([]);
    setFavorites([]);
    setResult(null);
    setShowFavoritesOnly(false);
    setAcademyItems([]); // Will force refresh
    setRandomFact("Загружаю знания...");
    
    // Reset Theme to Default Dark for fresh feel
    setTheme('dark');
    document.documentElement.classList.add('dark');

    // Force components to unmount and remount (to clear their internal state like chat history)
    setResetKey(prev => prev + 1);
    
    // Go back to main screen
    setCurrentView('mixer');
    
    // Refresh content
    setTimeout(() => {
      refreshAcademy();
      refreshFact();
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-800 dark:text-white selection:bg-indigo-500/20 dark:selection:bg-white/20 relative w-full overflow-hidden transition-colors duration-500">
      <header className={`
        fixed top-0 left-0 right-0 z-[100] transition-all duration-700 w-full
        ${scrolled 
          ? 'bg-white/80 dark:bg-black/85 backdrop-blur-[50px] py-4 border-b border-black/5 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.9)]' 
          : 'bg-white/40 dark:bg-black/25 backdrop-blur-[15px] py-8 border-b border-black/5 dark:border-white/5 shadow-none'}
      `}>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent opacity-50 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 items-center h-full relative z-10 w-full box-border">
          <div className="flex justify-start"></div>
          <div className="flex justify-center">
            <h1 className={`font-light tracking-[0.45em] transition-all duration-700 uppercase whitespace-nowrap text-center ${scrolled ? 'text-[11px] opacity-100 text-slate-900 dark:text-white' : 'text-2xl opacity-100 text-slate-900 dark:text-white'}`}>
              ALEXEENKO AI
            </h1>
          </div>
          <div className="flex justify-end">
            {(result || showFavoritesOnly) && currentView === 'mixer' && (
              <button onClick={handleClear} className="p-2 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-slate-500 dark:text-white/60 transition-all hover:bg-black/10 dark:hover:bg-white/20 active:scale-90">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ChatInterface with key to force remount on reset */}
      <ChatInterface key={resetKey} isVisible={currentView === 'chat'} onScroll={handleScroll} />

      {/* Removed px-6 from the main container to prevent clipping of shadows in child views */}
      <main className="flex-1 relative z-10 pt-32 min-h-0 flex flex-col w-full overflow-hidden box-border">
        <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col min-h-0 min-w-0 overflow-hidden box-border">
          {currentView === 'mixer' && (
            <div onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden pb-40 scrollbar-hide fade-in w-full box-border">
              {/* Added px-6 here to content wrapper so shadows are not clipped by the overflow container */}
              <div className={`w-full px-6 transition-all duration-1000 box-border ${(result || showFavoritesOnly) ? 'mb-8' : 'min-h-[40vh] flex flex-col justify-center py-10'}`}>
                {!result && !loading && !showFavoritesOnly && (
                   <div className="text-center mb-12 space-y-4 w-full box-border">
                     <h2 className="text-3xl sm:text-4xl font-extralight text-slate-700 dark:text-white/90 tracking-tight">Твой личный <span className="font-semibold text-slate-900 dark:text-white">бармен</span></h2>
                     {favorites.length > 0 && (
                        <button onClick={openFavoritesInMixer} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-300 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-rose-500/20 transition-all active:scale-95">
                          ❤️ Мое Избранное ({favorites.length})
                        </button>
                     )}
                   </div>
                )}
                {!result && !showFavoritesOnly && (
                  <IngredientInput 
                    ingredients={ingredients} 
                    onAdd={handleAddIngredient} 
                    onRemove={handleRemoveIngredient} 
                    onImageAnalysis={handleImageAnalysis}
                    onSubmit={handleMix} 
                    isLoading={loading}
                    isAnalyzingImage={isAnalyzing}
                  />
                )}
                
                {!result && !loading && !showFavoritesOnly && (
                  <div className="mt-20 space-y-12 w-full box-border">
                    <div className="flex items-center gap-6 w-full box-border">
                      <div className="h-[1px] bg-gradient-to-r from-transparent to-black/10 dark:to-white/10 flex-1"></div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-white/30 font-medium whitespace-nowrap">Академия Вкуса</span>
                        <button 
                          onClick={refreshAcademy} 
                          disabled={loadingAcademy}
                          className="p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-all active:scale-90"
                        >
                          <svg className={`w-3.5 h-3.5 text-slate-400 dark:text-white/40 ${loadingAcademy ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                      <div className="h-[1px] bg-gradient-l from-transparent to-black/10 dark:to-white/10 flex-1"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full box-border">
                      {academyItems.map((item, idx) => (
                        <GlassCard key={idx} hoverEffect onClick={() => setSelectedAcademyItem(item)} className="p-6 border-black/5 dark:border-white/5 transition-all group active:scale-[0.98] w-full">
                          <div className="flex gap-5 w-full box-border">
                            <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner border border-black/5 dark:border-white/5 flex-shrink-0">{item.icon}</div>
                            <div className="flex flex-col flex-1 min-w-0 justify-center">
                              <h4 className="text-sm font-semibold text-slate-800 dark:text-white/95 mb-1.5 leading-tight truncate">{item.title}</h4>
                              <p className="text-[10px] text-slate-500 dark:text-white/40 font-light leading-relaxed line-clamp-2">{item.text}</p>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>

                    <div className="mt-12 pb-16 w-full box-border">
                       <GlassCard className="p-8 border-indigo-500/10 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.02] w-full box-border">
                          <div className="flex flex-col items-center text-center gap-5 w-full">
                            <span className="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-[0.3em] whitespace-nowrap">Факт дня от ИИ</span>
                            <div className="text-[15px] font-light text-slate-600 dark:text-white/80 leading-relaxed transition-opacity duration-300 w-full max-w-full overflow-hidden">
                               {randomFact && <ReactMarkdown>{randomFact}</ReactMarkdown>}
                            </div>
                            <button onClick={refreshFact} disabled={loadingFact} className="mt-3 p-3.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-90"><svg className={`w-4 h-4 text-indigo-500/60 dark:text-indigo-300/60 ${loadingFact ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                          </div>
                       </GlassCard>
                    </div>
                  </div>
                )}
              </div>

              {(result || showFavoritesOnly) && (
                <div className="fade-in pb-20 w-full box-border overflow-hidden px-6">
                  <div className="sticky top-0 z-[60] backdrop-blur-[20px] py-6 flex flex-col items-center gap-5 mb-12 box-border w-full">
                    {!showFavoritesOnly && (
                      <div className="bg-white/80 dark:bg-white/[0.03] p-1 rounded-full border border-black/5 dark:border-white/10 flex relative w-full max-w-[340px] shadow-sm dark:shadow-2xl box-border">
                        <button onClick={() => setActiveTab('classics')} className={`flex-1 py-2.5 text-[9px] font-black uppercase z-10 transition-all duration-300 tracking-[0.1em] ${activeTab === 'classics' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/30'}`}>Классика</button>
                        <button onClick={() => setActiveTab('ai')} className={`flex-1 py-2.5 text-[9px] font-black uppercase z-10 transition-all duration-300 tracking-[0.1em] ${activeTab === 'ai' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/30'}`}>Авторские</button>
                        <button onClick={() => setActiveTab('favorites')} className={`flex-1 py-2.5 text-[9px] font-black uppercase z-10 transition-all duration-300 tracking-[0.1em] ${activeTab === 'favorites' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/30'}`}>Избранное</button>
                        <div className={`absolute top-1 bottom-1 left-1 w-[calc(33.333%-2px)] rounded-full bg-white dark:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) ${activeTab === 'classics' ? 'translate-x-0' : activeTab === 'ai' ? 'translate-x-[100%]' : 'translate-x-[200%]'}`} />
                      </div>
                    )}
                    {showFavoritesOnly && <h3 className="text-sm font-black text-rose-500 dark:text-rose-300 uppercase tracking-[0.4em]">Мое Избранное</h3>}
                    <button onClick={handleClear} className="text-[8px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] py-2 px-6 rounded-full border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95">Вернуться к миксеру</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full items-start box-border overflow-hidden">
                    {!showFavoritesOnly && activeTab === 'classics' && result?.classics.map((c, i) => (
                      <CocktailCard key={c.name} cocktail={c} delay={i * 60} userIngredients={ingredients} isFavorite={!!favorites.find(f => f.name === c.name)} onToggleFavorite={() => toggleFavorite(c)} />
                    ))}
                    {!showFavoritesOnly && activeTab === 'ai' && result?.aiCreations.map((c, i) => (
                      <CocktailCard key={c.name} cocktail={c} delay={i * 60} userIngredients={ingredients} isFavorite={!!favorites.find(f => f.name === c.name)} onToggleFavorite={() => toggleFavorite(c)} />
                    ))}
                    {(showFavoritesOnly || activeTab === 'favorites') && (favorites.length > 0 ? favorites.map((c, i) => <CocktailCard key={c.name} cocktail={c} delay={i * 60} userIngredients={ingredients} isFavorite={true} onToggleFavorite={() => toggleFavorite(c)} />) : <div className="col-span-full py-24 text-center w-full"><h3 className="text-xl font-extralight text-slate-400 dark:text-white/20 tracking-tight">Избранных рецептов пока нет</h3></div>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'bar' && (
            <div onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden pb-40 pt-4 scrollbar-hide fade-in w-full max-w-full flex flex-col items-center box-border">
               <IngredientBar onAdd={handleAddIngredient} onRemove={handleRemoveIngredient} selectedIngredients={ingredients} />
            </div>
          )}

          {currentView === 'settings' && (
             <SettingsView toggleTheme={toggleTheme} currentTheme={theme} onReset={handleFullReset} />
          )}
        </div>
      </main>

      {recognitionResults && (
        <RecognitionModal 
          ingredients={recognitionResults} 
          onConfirm={confirmRecognition} 
          onCancel={() => setRecognitionResults(null)} 
        />
      )}

      {selectedAcademyItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-6 overflow-hidden">
           {/* Updated Modal Background: Semi-transparent + Blur */}
           <div className="absolute inset-0 bg-white/10 dark:bg-black/50 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedAcademyItem(null)} />
           <div className="relative w-full max-w-[340px] transform liquid-reveal overflow-hidden">
              <GlassCard className="p-6 sm:p-8 border-black/10 dark:border-white/20 bg-gradient-to-b from-white/90 to-white/60 dark:from-white/[0.12] dark:to-white/[0.02] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
                <div className="flex flex-col items-center text-center overflow-y-auto scrollbar-hide">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-black/5 to-transparent dark:from-white/10 dark:to-transparent border border-black/5 dark:border-white/10 flex items-center justify-center text-5xl mb-6 shadow-xl relative flex-shrink-0">
                    {selectedAcademyItem.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white mb-4 leading-tight tracking-tight flex-shrink-0">
                    {selectedAcademyItem.title}
                  </h3>
                  <p className="text-sm sm:text-base font-extralight text-slate-600 dark:text-white/70 leading-relaxed mb-8 overflow-y-auto">
                    {selectedAcademyItem.text}
                  </p>
                  <button 
                    onClick={() => setSelectedAcademyItem(null)} 
                    className="w-full py-4 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.25em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex-shrink-0"
                  >
                    {BUTTON_VARIANTS[Math.floor(Math.random() * BUTTON_VARIANTS.length)]}
                  </button>
                </div>
              </GlassCard>
           </div>
        </div>
      )}

      <BottomNav currentView={currentView} onChangeView={setCurrentView} />
    </div>
  );
}

export default App;
