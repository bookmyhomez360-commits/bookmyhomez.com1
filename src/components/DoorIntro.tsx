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
      skipText: "ಸ್ಕಿಪ್ (Skip)",
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
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#110a05] overflow-hidden font-serif w-screen h-screen">
      
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-pointer select-none perspective-[2500px] overflow-hidden"
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
            className="absolute top-6 right-6 z-50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold px-5 py-2 rounded-full backdrop-blur-md border border-amber-500/40 transition-all cursor-pointer shadow-lg font-sans"
          >
            {introContent[currentLanguage].skipText} ⏭
          </button>

          {/* మెయిన్ లగ్జరీ బ్యానర్ కార్డ్ */}
          <div className="w-full max-w-5xl bg-gradient-to-r from-slate-950/90 to-zinc-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-2xl">
            
            {/* లెఫ్ట్ సైడ్: లోగో, భాషల బటన్లు, టెక్స్ట్ */}
            <div className="flex-1 text-white flex flex-col space-y-5 text-center lg:text-left z-10 font-sans">
              
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

            {/* రైట్ సైడ్: ప్రొఫెషనల్ ఫోటో */}
            <div className="flex-shrink-0 flex items-center justify-center relative font-sans">
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

        {/* ఎడమ వైపు డోర్ (Left Door Leaf) */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full border-r-4 border-black/60 shadow-[inset_-50px_0_100px_rgba(0,0,0,0.9)] flex items-center justify-end origin-left transition-transform duration-[1800ms] ease-in-out z-20 ${
            isOpen ? 'rotate-y-[-110deg]' : 'rotate-y-0'
          }`}
          style={{ 
            background: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url('https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat`,
            transformStyle: 'preserve-3d' 
          }}
        ></div>

        {/* కుడి వైపు డోర్ (Right Door Leaf) */}
        <div 
          className={`absolute top-0 right-0 w-1/2 h-full border-l-4 border-black/60 shadow-[inset_50px_0_100px_rgba(0,0,0,0.9)] flex items-center justify-start origin-right transition-transform duration-[1800ms] ease-in-out z-20 ${
            isOpen ? 'rotate-y-[110deg]' : 'rotate-y-0'
          }`}
          style={{ 
            background: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url('https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat`,
            transformStyle: 'preserve-3d' 
          }}
        ></div>

        {/* మధ్యలో వింటేజ్ గోల్డెన్ కీ మరియు 'TAP ON DOOR' టెక్స్ట్ */}
        <div className={`absolute z-30 flex items-center justify-center transition-all duration-500 cursor-pointer group ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div 
            onClick={handleOpenDoors}
            className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
          >
            {/* గోల్డెన్ కీ PNG ఇమేజ్ */}
            <img 
              src="https://png.pngtree.com/png-vector/20240125/ourmid/pngtree-vintage-golden-key-png-image_11494883.png" 
              alt="Golden Key" 
              className="w-72 sm:w-96 h-auto filter drop-shadow-[0_5px_20px_rgba(0,0,0,0.8)]"
            />
            
            {/* కీ మీద ఖచ్చితంగా సరిపోయేలా 'TAP ON DOOR' టెక్స్ట్ */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#ffd700] font-black text-sm sm:text-xl tracking-[3px] uppercase font-serif drop-shadow-[2px_2px_4px_rgba(0,0,0,0.95)] whitespace-nowrap">
              TAP ON DOOR
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
