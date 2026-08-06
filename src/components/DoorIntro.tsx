import React, { useState, useEffect, useRef } from 'react';

interface DoorIntroProps {
  onUnlock: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onUnlock }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'te' | 'en' | 'kn'>('te');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const introContent = {
    te: {
      greeting: "నమస్కారం, ఇది మధు bookmyhomez నుండి పరిచయం చేసుకుంటున్నాను.",
      desc: "మన వెబ్‌సైట్‌లో ప్రాపర్టీస్ రెంట్ కోసం మరియు షార్ట్ స్టే కోసం అందుబాటులో ఉన్నాయి. మీ ప్రాపర్టీస్‌ని మీరు ఉచితంగా లిస్ట్ చేసుకోవచ్చు.",
      btnText: "వెబ్‌సైట్‌లోకి ప్రవేశించండి",
      skipText: "స్కిప్ (Skip)",
      speechText: "నమస్కారం, ఇది మధు, bookmyhomez నుండి పరిచయం చేసుకుంటున్నాను. మన వెబ్‌సైట్‌లో ప్రాపర్టీస్ రెంట్ కోసం మరియు షార్ట్ స్టే కోసం అందుబాటులో ఉన్నాయి. మీ ప్రాపర్టీస్‌ని మీరు ఉచితంగా లిస్ట్ చేసుకోవచ్చు."
    },
    en: {
      greeting: "Hello, this is Madhu from bookmyhomez.",
      desc: "Properties for rent and short stay are available on our website. You can also list your properties for free.",
      btnText: "Enter Website",
      skipText: "Skip",
      speechText: "Hello, this is Madhu from bookmyhomez. Properties for rent and short stay are available on our website. You can also list your properties for free."
    },
    kn: {
      greeting: "ನಮಸ್ಕಾರ, ಇದು ಮಧು bookmyhomez ನಿಂದ ಪರಿಚಯಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ.",
      desc: "ನಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಬಾಡಿಗೆಗೆ ಮತ್ತು ಶಾರ್ಟ್ ಸ್ಟೇಗಾಗಿ ಪ್ರಾಪರ್ಟೀಸ್ ಲಭ್ಯವಿವೆ. ನಿಮ್ಮ ಪ್ರಾಪರ್ಟೀಸ್‌ಗಳನ್ನು ನೀವು ಉಚಿತವಾಗಿ ಲಿಸ್ಟ್ ಮಾಡಬಹುದು.",
      btnText: "ವೆಬ್‌ಸೈಟ್‌ಗೆ ಪ್ರವೇಶಿಸಿ",
      skipText: "ಸ್ಕಿప్ (Skip)",
      speechText: "ನಮಸ್ಕಾರ, ಇದು ಮಧು bookmyhomez ನಿಂದ ಪರಿಚಯಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ. ನಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಬಾಡಿಗೆಗೆ ಮತ್ತು ಶಾರ್ಟ್ ಸ್ಟೇಗಾಗಿ ಪ್ರಾಪರ್ಟೀಸ್ ಲಭ್ಯವಿವೆ. ನಿಮ್ಮ ಪ್ರಾಪರ್ಟೀಸ್‌ಗಳನ್ನು ನೀವು ಉಚಿತವಾಗಿ ಲಿಸ್ಟ್ ಮಾಡಬಹುದು."
    }
  };

  const speakIntro = (lang: 'te' | 'en' | 'kn') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(introContent[lang].speechText);
      if (lang === 'te') utterance.lang = 'te-IN';
      else if (lang === 'kn') utterance.lang = 'kn-IN';
      else utterance.lang = 'en-US';

      utterance.rate = 0.95;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOpenDoors = () => {
    setIsOpen(true);
    speakIntro(currentLanguage);

    const timer = setTimeout(() => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      onUnlock();
    }, 9000);

    return () => clearTimeout(timer);
  };

  const handleLanguageChange = (lang: 'te' | 'en' | 'kn', e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentLanguage(lang);
    if (isOpen) {
      speakIntro(lang);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#020408] overflow-hidden font-sans w-screen h-screen">
      
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-pointer select-none perspective-[2000px] overflow-hidden"
        onClick={!isOpen ? handleOpenDoors : undefined}
      >
        
        {/* తలుపులు తెరుచుకున్నాక వచ్చే లగ్జరీ బ్యానర్ వ్యూ */}
        <div className={`absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-[#0c0a09] via-[#1c1917] to-[#292524] p-4 sm:p-8 transition-opacity duration-1000 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          
          {/* టాప్-రైట్ కార్నర్‌లో 'Skip' బటన్ */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onUnlock();
            }}
            className="absolute top-6 right-6 z-50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold px-5 py-2 rounded-full backdrop-blur-md border border-amber-500/40 transition-all cursor-pointer shadow-lg"
          >
            {introContent[currentLanguage].skipText} ⏭
          </button>

          {/* మెయిన్ లగ్జరీ బ్యానర్ కార్డ్ */}
          <div className="w-full max-w-5xl bg-gradient-to-r from-slate-950/90 to-zinc-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-2xl">
            
            {/* లెఫ్ట్ సైడ్: లోగో, భాషల బటన్లు, టెక్స్ట్ */}
            <div className="flex-1 text-white flex flex-col space-y-5 text-center lg:text-left z-10">
              
              {/* లోగో */}
              <div className="flex justify-center lg:justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-amber-500/50 inline-block">
                  <div className="text-slate-950 font-black tracking-wider text-lg sm:text-xl flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded">BMH</span> BOOK MY HOMEZ
                  </div>
                </div>
              </div>

              {/* లాంగ్వేజ్ సెలెక్షన్ */}
              <div className="flex items-center justify-center lg:justify-start gap-2 bg-black/60 p-2.5 rounded-2xl border border-amber-500/30 w-fit mx-auto lg:mx-0">
                <span className="text-xs text-amber-300 font-bold px-1">Language:</span>
                {(['te', 'en', 'kn'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={(e) => handleLanguageChange(lang, e)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer ${currentLanguage === lang ? 'bg-amber-500 text-slate-950 shadow-lg scale-105' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
                  >
                    {lang === 'te' ? 'తెలుగు' : lang === 'en' ? 'English' : 'ಕನ್ನಡ'}
                  </button>
                ))}
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-amber-300 leading-snug tracking-wide">
                {introContent[currentLanguage].greeting}
              </h1>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                {introContent[currentLanguage].desc}
              </p>

              {/* వెబ్‌సైట్‌లోకి ప్రవేశించే బటన్ */}
              <div className="pt-2 flex justify-center lg:justify-start">
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    onUnlock(); 
                  }}
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all hover:scale-105 active:scale-95 uppercase text-xs sm:text-sm tracking-wider cursor-pointer border border-amber-200"
                >
                  {introContent[currentLanguage].btnText} →
                </button>
              </div>
            </div>

            {/* రైట్ సైడ్: మీ ప్రొఫెషనల్ ఫోటో */}
            <div className="flex-shrink-0 flex items-center justify-center relative">
              <div className="relative w-52 h-68 sm:w-64 sm:h-84 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.4)] bg-slate-900">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" 
                  alt="Madhu - BookMyHomez" 
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

        {/* ఎడమ వైపు రిఫరెన్స్ ఇమేజ్ లాంటి ఒరిజినల్ వుడెన్ డోర్ */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full bg-[#4a2814] border-r-8 border-[#1f0e06] shadow-[inset_-40px_0_80px_rgba(0,0,0,0.85)] flex items-center justify-end origin-left transition-transform duration-[1800ms] ease-in-out z-20 ${
            isOpen ? 'rotate-y-[-110deg]' : 'rotate-y-0'
          }`}
          style={{ 
            backgroundImage: `
              linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 10%),
              repeating-linear-gradient(0deg, rgba(30,15,5,0.2), rgba(30,15,5,0.2) 3px, transparent 3px, transparent 6px),
              radial-gradient(ellipse at center, rgba(110,65,30,0.5) 0%, rgba(40,20,8,0.95) 100%)
            `,
            transformStyle: 'preserve-3d' 
          }}
        >
          {/* టాప్ గ్రిల్ (Iron Window Grille) */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 h-28 border-4 border-[#2b160b] bg-[#241208]/80 shadow-inner flex items-center justify-center">
            <div className="w-full h-full border border-amber-900/40 grid grid-cols-4 grid-rows-3 gap-1 p-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border border-black/60 bg-amber-950/40"></div>
              ))}
            </div>
          </div>

          {/* వుడెన్ ప్యానెల్స్ మరియు బ్రాస్ స్టడ్స్ (Rivets/Nails) */}
          <div className="absolute inset-8 top-44 border-4 border-[#241107] rounded-l-lg shadow-[inset_0_0_25px_rgba(0,0,0,0.9)] flex flex-col justify-around p-6 opacity-90 pointer-events-none">
            <div className="h-full border-b-4 border-[#241107] my-4 relative">
              <span className="absolute left-2 -top-2 w-2 h-2 rounded-full bg-amber-600/70 shadow"></span>
              <span className="absolute right-2 -top-2 w-2 h-2 rounded-full bg-amber-600/70 shadow"></span>
            </div>
          </div>
        </div>

        {/* కుడి వైపు రిఫరెన్స్ ఇమేజ్ లాంటి ఒరిజినల్ వుడెన్ డోర్ */}
        <div 
          className={`absolute top-0 right-0 w-1/2 h-full bg-[#4a2814] border-l-8 border-[#1f0e06] shadow-[inset_40px_0_80px_rgba(0,0,0,0.85)] flex items-center justify-start origin-right transition-transform duration-[1800ms] ease-in-out z-20 ${
            isOpen ? 'rotate-y-[110deg]' : 'rotate-y-0'
          }`}
          style={{ 
            backgroundImage: `
              linear-gradient(-90deg, rgba(0,0,0,0.4) 0%, transparent 10%),
              repeating-linear-gradient(0deg, rgba(30,15,5,0.2), rgba(30,15,5,0.2) 3px, transparent 3px, transparent 6px),
              radial-gradient(ellipse at center, rgba(110,65,30,0.5) 0%, rgba(40,20,8,0.95) 100%)
            `,
            transformStyle: 'preserve-3d' 
          }}
        >
          {/* టాప్ గ్రిల్ (Iron Window Grille) */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 h-28 border-4 border-[#2b160b] bg-[#241208]/80 shadow-inner flex items-center justify-center">
            <div className="w-full h-full border border-amber-900/40 grid grid-cols-4 grid-rows-3 gap-1 p-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border border-black/60 bg-amber-950/40"></div>
              ))}
            </div>
          </div>

          {/* వుడెన్ ప్యానెల్స్ */}
          <div className="absolute inset-8 top-44 border-4 border-[#241107] rounded-r-lg shadow-[inset_0_0_25px_rgba(0,0,0,0.9)] flex flex-col justify-around p-6 opacity-90 pointer-events-none">
            <div className="h-full border-b-4 border-[#241107] my-4 relative">
              <span className="absolute left-2 -top-2 w-2 h-2 rounded-full bg-amber-600/70 shadow"></span>
              <span className="absolute right-2 -top-2 w-2 h-2 rounded-full bg-amber-600/70 shadow"></span>
            </div>
          </div>
        </div>

        {/* మధ్యలో రిఫరెన్స్ ఇమేజ్ లాంటి పెద్ద ఆంటిక్ కీ మరియు దాని మీద 'TAP ON DOOR' టెక్స్ట్ */}
        <div className={`absolute z-30 flex items-center justify-center transition-all duration-500 cursor-pointer group ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div 
            onClick={handleOpenDoors}
            className="relative flex items-center bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#c59b27] p-3 sm:p-4 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.7)] border-2 border-amber-100/60 hover:scale-105 transition-all"
          >
            {/* లెఫ్ట్ సైడ్ హెవీ ఆర్నమెంటల్ కీ హెడ్ (Antique Scrollwork Handle) */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center text-[#3d2302] drop-shadow-md transform -rotate-12">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full filter drop-shadow-[2px_2px_2px_rgba(0,0,0,0.6)]">
                <path d="M50 10 C 30 10, 15 25, 15 45 C 15 55, 22 65, 30 70 L 30 85 L 45 85 L 45 72 C 48 73, 50 73, 52 72 L 52 85 L 65 85 L 65 70 C 73 65, 80 55, 80 45 C 80 25, 65 10, 50 10 Z M 50 20 C 60 20, 70 28, 70 45 C 70 55, 60 62, 50 62 C 40 62, 30 55, 30 45 C 30 28, 40 20, 50 20 Z" />
                <circle cx="50" cy="45" r="8" fill="#241303" />
                <path d="M 22 35 Q 10 35, 10 45 Q 10 55, 22 55" stroke="currentColor" strokeWidth="4" fill="none" />
                <path d="M 78 35 Q 90 35, 90 45 Q 90 55, 78 55" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </div>

            {/* మధ్యలో కీ బారెల్ షాఫ్ట్ మరియు దాని మీద 'TAP ON DOOR' టెక్స్ట్ */}
            <div className="relative flex items-center px-4 sm:px-6">
              {/* మెటల్ రాడ్ */}
              <div className="absolute inset-x-0 h-4 sm:h-5 bg-gradient-to-b from-[#8c6713] via-[#ffd700] to-[#634509] rounded-sm shadow-inner"></div>
              
              {/* టెక్స్ట్ */}
              <span className="relative z-10 text-slate-950 font-black text-sm sm:text-2xl tracking-[0.25em] uppercase px-4 py-1 drop-shadow-sm font-serif">
                TAP ON DOOR
              </span>
            </div>

            {/* రైట్ సైడ్ బిట్ (Key Bitting / Teeth) */}
            <div className="w-12 h-14 sm:w-16 sm:h-20 bg-gradient-to-br from-[#d4af37] to-[#8c6713] border border-amber-900/60 shadow-md flex flex-col justify-between p-1">
              <div className="w-full h-3 bg-[#3d2302] border border-amber-500/40"></div>
              <div className="w-2/3 h-3 bg-[#3d2302] border border-amber-500/40 self-end"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
