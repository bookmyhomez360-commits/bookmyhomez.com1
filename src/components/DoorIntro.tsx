import React, { useState } from 'react';

interface DoorIntroProps {
  onComplete?: () => void; // తలుపులు తెరుచుకున్న తర్వాత రన్ అయ్యే ఫంక్షన్
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handleDoorClick = () => {
    if (isOpen) return;
    setIsOpen(true);

    // యానిమేషన్ పూర్తయిన తర్వాత (1.5 సెకన్లలో) component ని దాచడానికి
    setTimeout(() => {
      setIsHidden(true);
      if (onComplete) onComplete();
    }, 1500);
  };

  if (isHidden) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black flex items-center justify-center select-none"
      style={{ perspective: '1200px' }} // 3D Effect కోసం
    >
      {/* Left Door */}
      <div
        onClick={handleDoorClick}
        className={`absolute top-0 left-0 w-1/2 h-full cursor-pointer transition-transform duration-1000 ease-in-out origin-left z-10 ${
          isOpen ? '-rotate-y-90 opacity-0 pointer-events-none' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200')`, // మీ Door Image URL ఇక్కడ మార్చుకోవచ్చు
          backgroundSize: '200% 100%',
          backgroundPosition: 'left center',
        }}
      >
        <div className="absolute inset-0 bg-black/20" /> {/* Light Overlay */}
      </div>

      {/* Right Door */}
      <div
        onClick={handleDoorClick}
        className={`absolute top-0 right-0 w-1/2 h-full cursor-pointer transition-transform duration-1000 ease-in-out origin-right z-10 ${
          isOpen ? 'rotate-y-90 opacity-0 pointer-events-none' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200')`, // మీ Door Image URL ఇక్కడ మార్చుకోవచ్చు
          backgroundSize: '200% 100%',
          backgroundPosition: 'right center',
        }}
      >
        <div className="absolute inset-0 bg-black/20" /> {/* Light Overlay */}
      </div>

      {/* Key and Text Center Button */}
      <div
        onClick={handleDoorClick}
        className={`absolute z-20 cursor-pointer transition-all duration-700 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="relative flex items-center justify-center drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
          {/* Golden Key SVG */}
          <svg
            className="w-48 sm:w-72 md:w-96 h-auto text-yellow-600 filter drop-shadow-lg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 .34-.04.67-.11 1H15v2h2v2h2v2h2v2h-3v-2h-2v-2h-2v-2H10.9c-.8 1.2-2.1 2-3.9 2zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          
          {/* Text inside / overlaying Key */}
          <span className="absolute font-serif text-yellow-200 font-bold tracking-widest text-xs sm:text-base md:text-xl uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ml-12 sm:ml-20">
            TAP ON DOOR
          </span>
        </div>
      </div>
    </div>
  );
};

export default DoorIntro;
