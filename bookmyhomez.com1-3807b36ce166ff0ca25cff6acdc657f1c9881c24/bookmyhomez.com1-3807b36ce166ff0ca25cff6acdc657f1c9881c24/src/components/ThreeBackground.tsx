import React, { useState, useEffect } from 'react';
import { Home, ChevronLeft, ChevronRight, Sparkles, Maximize2, Minimize2, Play, Pause, MapPin, X } from 'lucide-react';

// One background slide = one real listing photo (built in App.tsx from the live listings).
export interface HeroSlide {
  id: string;
  name: string;
  location: string;
  image: string;
  thumb: string;
  onOpen?: () => void;
}

interface ThreeBackgroundProps {
  slides: HeroSlide[];
  activeVillaIndex?: number;
  onVillaChange?: (index: number) => void;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  slides,
  activeVillaIndex: propActiveIndex,
  onVillaChange,
}) => {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const count = slides.length;
  const rawIndex = propActiveIndex !== undefined ? propActiveIndex : internalActiveIndex;
  const activeIndex = count ? rawIndex % count : 0;

  const setActiveIndex = (idx: number) => {
    if (onVillaChange) {
      onVillaChange(idx);
    }
    setInternalActiveIndex(idx);
  };

  useEffect(() => {
    if (!isPlaying || count < 2) return;

    const timer = setInterval(() => {
      setActiveIndex((activeIndex + 1) % count);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, activeIndex, count]);

  // No real photos yet (or not on the home page): plain dark background, nothing else.
  if (!count) {
    return <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#090D16]" aria-hidden="true" />;
  }

  const handlePrev = () => {
    setActiveIndex((activeIndex - 1 + count) % count);
  };

  const handleNext = () => {
    setActiveIndex((activeIndex + 1) % count);
  };

  const current = slides[activeIndex];

  return (
    <>
      {/* Background photos of real listings with a smooth crossfade */}
      <div
        className={`fixed inset-0 w-full h-full transition-all duration-700 overflow-hidden ${
          isFocusMode ? 'z-40' : 'pointer-events-none z-0'
        }`}
      >
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;
          // Only load the current and next photo; the rest load when their turn comes.
          const shouldLoad = idx === activeIndex || idx === (activeIndex + 1) % count;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              {shouldLoad && (
                <img
                  src={slide.image}
                  alt={isActive ? `${slide.name}, ${slide.location}` : ''}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover brightness-[0.62] contrast-[1.12] transition-transform duration-[10000ms]"
                />
              )}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isFocusMode
                    ? 'bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/40'
                    : 'bg-gradient-to-t from-[#090D16] via-[#090D16]/60 to-[#090D16]/40'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Floating "Featured homes" bar */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-indigo-500/40 px-3.5 py-2 rounded-full shadow-xl transition-all hover:scale-105 cursor-pointer text-xs font-bold"
          style={{ pointerEvents: 'auto' }}
          title="Show featured homes"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Featured Homes</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
        </button>
      ) : (
        <div
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 hover:border-indigo-500/80 p-2 sm:p-2.5 rounded-2xl shadow-2xl transition duration-300 max-w-[calc(100vw-2rem)]"
          style={{ pointerEvents: 'auto' }}
        >
          <button
            onClick={current.onOpen}
            className="flex items-center gap-2.5 text-left cursor-pointer"
            title={`Open ${current.name}`}
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-400/50 shadow-sm flex-shrink-0 relative">
              <img src={current.thumb} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-indigo-950/20"></div>
              <Home className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-md" />
            </div>

            <div className="max-w-[150px] sm:max-w-[180px]">
              <div className="flex items-center gap-1 text-[9px] uppercase font-black tracking-wider text-amber-400">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="truncate">Featured Home</span>
              </div>
              <p className="text-xs font-bold text-white truncate">{current.name}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                <MapPin className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{current.location}</span>
              </div>
            </div>
          </button>

          {/* Compact Controls */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition cursor-pointer"
              title="Previous home"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition cursor-pointer"
              title="Next home"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isFocusMode
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-indigo-600 text-slate-200'
              }`}
              title={isFocusMode ? 'Exit Fullscreen' : 'Fullscreen photo'}
            >
              {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/80 text-slate-400 hover:text-white transition cursor-pointer ml-1"
              title="Minimize"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
