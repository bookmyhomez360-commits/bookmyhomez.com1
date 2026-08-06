import React, { useState } from 'react';

interface DoorIntroProps {
  onComplete?: () => void;
  // మీ ప్రొజెక్ట్ లో ఉన్న door image path ని ఇక్కడ పాస్ చేయవచ్చు
  doorImageUrl?: string; 
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ 
  onComplete,
  doorImageUrl = "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600" // Replace with your image
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);

    // 1.8 సెకన్ల 3D యానిమేషన్ తర్వాత Intro స్క్రీన్ రిమూవ్ అవుతుంది
    setTimeout(() => {
      setIsHidden(true);
      if (onComplete) onComplete();
    }, 1800);
  };

  if (isHidden) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-stone-950 flex items-center justify-center select-none"
      style={{ perspective: '2000px' }} // High 3D Perspective Depth
    >
      {/* 3D Door Container */}
      <div 
        className="relative w-full h-full flex justify-center items-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Left Door Panel */}
        <div
          onClick={handleOpen}
          className={`absolute top-0 left-0 w-1/2 h-full cursor-pointer transition-all duration-[1600ms] cubic-bezier(0.4, 0, 0.2, 1) origin-left z-10 ${
            isOpen ? '[transform:rotateY(-115deg)] opacity-0' : '[transform:rotateY(0deg)]'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            backgroundImage: `url('${doorImageUrl}')`,
            backgroundSize: '200% 100%',
            backgroundPosition: 'left center',
            boxShadow: isOpen ? 'none' : 'inset -15px 0 30px rgba(0,0,0,0.6)'
          }}
        >
          {/* Inner 3D Edge Shadow */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Right Door Panel */}
        <div
          onClick={handleOpen}
          className={`absolute top-0 right-0 w-1/2 h-full cursor-pointer transition-all duration-[1600ms] cubic-bezier(0.4, 0, 0.2, 1) origin-right z-10 ${
            isOpen ? '[transform:rotateY(115deg)] opacity-0' : '[transform:rotateY(0deg)]'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            backgroundImage: `url('${doorImageUrl}')`,
            backgroundSize: '200% 100%',
            backgroundPosition: 'right center',
            boxShadow: isOpen ? 'none' : 'inset 15px 0 30px rgba(0,0,0,0.6)'
          }}
        >
          {/* Inner 3D Edge Shadow */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Center Key & TAP ON DOOR Graphic */}
        <div
          onClick={handleOpen}
          className={`absolute z-20 cursor-pointer transition-all duration-700 ease-out flex items-center justify-center ${
            isOpen 
              ? 'scale-150 opacity-0 pointer-events-none translate-z-20' 
              : 'scale-100 opacity-100 hover:scale-105 active:scale-95'
          }`}
        >
          <div className="relative flex items-center justify-center filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.9)]">
            
            {/* Vintage Golden Key (SVG) */}
            <svg
              className="w-[280px] sm:w-[450px] md:w-[600px] h-auto text-amber-500"
              viewBox="0 0 500 120"
              fill="currentColor"
            >
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="30%" stopColor="#d97706" />
                  <stop offset="70%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>
              </defs>
              
              {/* Key Shape */}
              <path
                fill="url(#goldGradient)"
                d="M100,20 C55,20 20,55 20,100 C20,145 55,180 100,180 C135,180 165,158 175,125 L380,125 L380,150 L410,150 L410,125 L430,125 L430,160 L470,160 L470,80 L175,80 C165,42 135,20 100,20 Z M100,60 C122,60 140,78 140,100 C140,122 122,140 100,140 C78,140 60,122 60,100 C60,78 78,60 100,60 Z"
                transform="scale(0.5) translate(50, 20)"
              />
            </svg>

            {/* Glowing Metallic Text */}
            <span 
              className="absolute font-serif font-extrabold tracking-[0.25em] text-amber-200 text-sm sm:text-xl md:text-2xl uppercase ml-12 sm:ml-24"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(217,119,6,0.5)',
              }}
            >
              TAP ON DOOR
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoorIntro;
