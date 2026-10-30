import React, { useState, useEffect } from 'react';

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
  // The floating "Featured home" bar that sat at the bottom of the screen was removed (Oct 30 2026);
  // the background photos keep cycling on their own.

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
    if (count < 2) return;

    const timer = setInterval(() => {
      setActiveIndex((activeIndex + 1) % count);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeIndex, count]);

  // No real photos yet (or not on the home page): plain dark background, nothing else.
  if (!count) {
    return <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#090D16]" aria-hidden="true" />;
  }

  return (
    <>
      {/* Background photos of real listings with a smooth crossfade */}
      <div
        className="fixed inset-0 w-full h-full transition-all duration-700 overflow-hidden pointer-events-none z-0"
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
                className="absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-[#090D16] via-[#090D16]/60 to-[#090D16]/40"
              />
            </div>
          );
        })}
      </div>
    </>
  );
};
