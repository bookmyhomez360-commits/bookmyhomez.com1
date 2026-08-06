import React, { useState, useEffect, useRef } from 'react';

interface DoorIntroProps {
  onComplete?: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
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

  const handleDoorClick = () => {
    if (isOpen) return;
    setIsOpen(true);
    speakIntro(currentLanguage);
  };

  const handleLanguageChange = (lang: 'te' | 'en' | 'kn', e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentLanguage(lang);
    if (isOpen) {
      speakIntro(lang);
    }
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
    <div 
      className="fixed inset-0 z-[999999] overflow-hidden bg-[#0a0502] flex items-center justify-center select-none w-screen h-screen"
      style={{ perspective: '2000px' }}
    >
      
      {/* తలుపులు తెరుచుకున్నాక వెనుక వచ్చే లగ్జరీ బ్యానర్ వ్యూ */}
      <div className={`absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-[#0c0a09] via-[#1c1917] to-[#292524] p-4 sm:p-8 transition-opacity duration-1000 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* టాప్-రైట్ కార్నర్‌లో 'Skip' బటన్ */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinalUnlock();
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
                  handleFinalUnlock(); 
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

      {/* 3D Left Wooden Door */}
      <div
        onClick={handleDoorClick}
        className={`absolute top-0 left-0 w-1/2 h-full cursor-pointer transition-transform duration-1200 ease-in-out origin-left z-10 ${
          isOpen ? '-rotate-y-100 opacity-90 pointer-events-none' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          backgroundColor: '#3d2314',
          backgroundImage: `
            linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 15%),
            radial-gradient(ellipse at center, rgba(120,66,35,0.8) 0%, rgba(35,18,8,0.95) 100%),
            repeating-linear-gradient(0deg, rgba(20,10,4,0.3), rgba(20,10,4,0.3) 4px, transparent 4px, transparent 8px)
          `,
          boxShadow: 'inset -30px 0 60px rgba(0,0,0,0.8)',
          borderRight: '6px solid #1a0c04'
        }}
      >
        {/* డోర్ డిజైన్ ప్యానెల్స్ */}
        <div className="absolute inset-8 border-4 border-[#221105] bg-[#2d190c]/40 flex flex-col justify-around p-6 shadow-inner">
          <div className="h-1/3 border-2 border-[#1a0c04] bg-[#241308]/60 shadow-inner"></div>
          <div className="h-1/3 border-2 border-[#1a0c04] bg-[#241308]/60 shadow-inner my-4"></div>
        </div>
      </div>

      {/* 3D Right Wooden Door */}
      <div
        onClick={handleDoorClick}
        className={`absolute top-0 right-0 w-1/2 h-full cursor-pointer transition-transform duration-1200 ease-in-out origin-right z-10 ${
          isOpen ? 'rotate-y-100 opacity-90 pointer-events-none' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          backgroundColor: '#3d2314',
          backgroundImage: `
            linear-gradient(-90deg, rgba(0,0,0,0.6) 0%, transparent 15%),
            radial-gradient(ellipse at center, rgba(120,66,35,0.8) 0%, rgba(35,18,8,0.95) 100%),
            repeating-linear-gradient(0deg, rgba(20,10,4,0.3), rgba(20,10,4,0.3) 4px, transparent 4px, transparent 8px)
          `,
          boxShadow: 'inset 30px 0 60px rgba(0,0,0,0.8)',
          borderLeft: '6px solid #1a0c04'
        }}
      >
        {/* డోర్ డిజైన్ ప్యానెల్స్ */}
        <div className="absolute inset-8 border-4 border-[#221105] bg-[#2d190c]/40 flex flex-col justify-around p-6 shadow-inner">
          <div className="h-1/3 border-2 border-[#1a0c04] bg-[#241308]/60 shadow-inner"></div>
          <div className="h-1/3 border-2 border-[#1a0c04] bg-[#241308]/60 shadow-inner my-4"></div>
        </div>
      </div>

      {/* Center Golden Key & TAP ON DOOR Button */}
      <div
        onClick={handleDoorClick}
        className={`absolute z-20 cursor-pointer transition-all duration-500 transform hover:scale-105 active:scale-95 flex items-center justify-center ${
          isOpen ? 'scale-75 opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="relative flex items-center bg-gradient-to-r from-[#b8860b] via-[#ffd700] to-[#b8860b] px-8 py-4 rounded-full shadow-[0_0_50px_rgba(255,215,0,0.6)] border-2 border-amber-200">
          
          {/* కీ హెడ్ */}
          <div className="w-16 h-16 rounded-full border-4 border-[#4a2e05] bg-gradient-to-br from-[#ffe259] via-[#d4af37] to-[#704214] flex items-center justify-center shadow-inner mr-4">
            <div className="w-6 h-6 rounded-full bg-[#1a0c04] border-2 border-amber-300"></div>
          </div>

          {/* టెక్స్ట్ */}
          <span className="font-serif text-[#1a0c04] font-black tracking-[0.25em] text-base sm:text-2xl uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            TAP ON DOOR
          </span>

          {/* కీ టీత్ */}
          <div className="ml-4 flex flex-col justify-between w-6 h-10 bg-gradient-to-b from-[#d4af37] to-[#704214] border-2 border-[#4a2e05] rounded-r p-0.5">
            <div className="w-full h-2 bg-[#1a0c04]"></div>
            <div className="w-1/2 h-2 bg-[#1a0c04] self-end"></div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default DoorIntro;
