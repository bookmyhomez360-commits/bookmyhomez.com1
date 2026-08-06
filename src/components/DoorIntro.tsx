import React, { useState, useEffect, useRef } from 'react';

interface DoorIntroProps {
  onComplete?: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const introText = "Hello, this is Madhu from BookMyHomez. Properties for rent and short stay are available on our website. You can also list your properties for free.";

  const speakIntro = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(introText);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDoorClick = () => {
    if (isOpen) return;
    setIsOpen(true);
    speakIntro();
  };

  const handleFinalUnlock = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsHidden(true);
    if (onComplete) onComplete();
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (isHidden) return null;

  return (
    <div className="fixed inset-0 z-[999999] overflow-hidden bg-[#0c0a09] flex items-center justify-center select-none w-screen h-screen">
      
      {/* తలుపులు తెరుచుకున్నాక వచ్చే పోస్టర్ డిజైన్ & పర్సన్ ఇంట్రో వ్యూ */}
      <div className={`absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-[#0c0a09] via-[#1c1917] to-[#292524] p-4 sm:p-8 transition-opacity duration-1000 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* టాప్-రైట్ కార్నర్‌లో 'Skip' బటన్ */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinalUnlock();
          }}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold px-5 py-2 rounded-full backdrop-blur-md border border-amber-500/40 transition-all cursor-pointer shadow-lg font-sans"
        >
          Skip ⏭
        </button>

        {/* పోస్టర్ స్టైల్ లగ్జరీ కార్డ్ */}
        <div className="w-full max-w-5xl bg-gradient-to-r from-slate-950/95 to-zinc-900/95 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-[0_0_70px_rgba(245,158,11,0.25)] flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-2xl">
          
          {/* లెఫ్ట్ సైడ్: లోగో, టెక్స్ట్ & ఆఫర్స్ */}
          <div className="flex-1 text-white flex flex-col space-y-6 text-center lg:text-left z-10 font-sans">
            
            {/* లోగో */}
            <div className="flex justify-center lg:justify-start">
              <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-amber-500/50 inline-block">
                <div className="text-slate-950 font-black tracking-wider text-lg sm:text-xl flex items-center gap-2">
                  <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded">BMH</span> BOOK MY HOMEZ
                </div>
              </div>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-amber-300 leading-snug tracking-wide">
              Hello, this is Madhu from BookMyHomez.
            </h1>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Properties for rent and short stay are available on our website. You can also list your properties for free.
            </p>

            {/* వెబ్‌సైట్‌లోకి ప్రవేశించే బటన్ */}
            <div className="pt-2 flex justify-center lg:justify-start">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleFinalUnlock(); 
                }}
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all hover:scale-105 active:scale-95 uppercase text-xs sm:text-sm tracking-wider cursor-pointer border border-amber-200"
              >
                Enter Website →
              </button>
            </div>
          </div>

          {/* రైట్ సైడ్: ఫౌండర్ (Madhu) ప్రొఫెషనల్ ఫోటో పోస్టర్ */}
          <div className="flex-shrink-0 flex items-center justify-center relative font-sans">
            <div className="relative w-52 h-68 sm:w-64 sm:h-84 rounded-2xl overflow-hidden border-2 border-amber-500/70 shadow-[0_0_50px_rgba(245,158,11,0.4)] bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" 
                alt="Madhu - BookMyHomez Founder" 
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                <span className="text-white font-black text-base sm:text-lg">Madhu</span>
                <span className="text-amber-400 text-xs font-semibold tracking-wider">Founder, BookMyHomez</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Left Cartoon/Wooden Door Leaf */}
      <div
        onClick={handleDoorClick}
        className={`absolute top-0 left-0 w-1/2 h-full cursor-pointer transition-transform duration-1200 ease-in-out origin-left z-10 ${
          isOpen ? '-translate-x-full opacity-0 pointer-events-none' : ''
        }`}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: '200% 100%',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat',
          boxShadow: 'inset -40px 0 80px rgba(0,0,0,0.9)'
        }}
      ></div>

      {/* Right Cartoon/Wooden Door Leaf */}
      <div
        onClick={handleDoorClick}
        className={`absolute top-0 right-0 w-1/2 h-full cursor-pointer transition-transform duration-1200 ease-in-out origin-right z-10 ${
          isOpen ? 'translate-x-full opacity-0 pointer-events-none' : ''
        }`}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: '200% 100%',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          boxShadow: 'inset 40px 0 80px rgba(0,0,0,0.9)'
        }}
      ></div>

      {/* Center Golden Key & TAP ON DOOR Text */}
      <div
        onClick={handleDoorClick}
        className={`absolute z-20 cursor-pointer transition-all duration-500 transform hover:scale-105 active:scale-95 flex items-center justify-center ${
          isOpen ? 'scale-75 opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="relative flex items-center justify-center">
          
          <img 
            src="https://png.pngtree.com/png-vector/20240125/ourmid/pngtree-vintage-golden-key-png-image_11494883.png" 
            alt="Vintage Golden Key" 
            className="w-[300px] sm:w-[420px] md:w-[520px] h-auto filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] select-none pointer-events-none"
          />

          <span className="absolute font-serif text-[#ffd700] font-bold tracking-[4px] text-xs sm:text-sm md:text-lg uppercase drop-shadow-[2px_3px_6px_rgba(0,0,0,0.98)] whitespace-nowrap">
            TAP ON DOOR
          </span>

        </div>
      </div>

    </div>
  );
};

export default DoorIntro;
