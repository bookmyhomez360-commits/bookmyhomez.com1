import React, { useState, useEffect, useRef } from 'react';

interface DoorIntroProps {
  onUnlock: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onUnlock }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'te' | 'kn'>('te');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // భాషను బట్టి మధు చెప్పే ఇంట్రో కంటెంట్ మరియు మాటలు
  const introContent = {
    te: {
      greeting: "నమస్కారం, ఇది మధు bookmyhomez నుండి పరిచయం చేసుకుంటున్నాను.",
      desc: "మన వెబ్‌సైట్‌లో ప్రాపర్టీస్ రెంట్ కోసం మరియు షార్ట్ స్టే కోసం అందుబాటులో ఉన్నాయి. మీ ప్రాపర్టీస్‌ని మీరు ఉచితంగా లిస్ట్ చేసుకోవచ్చు.",
      btnText: "వెబ్‌సైట్‌లోకి ప్రవేశించండి",
      skipText: "స్కిప్ (Skip)",
      speechText: "నమస్కారం, ఇది మధు, bookmyhomez నుండి పరిచయం చేసుకుంటున్నాను. మన వెబ్‌సైట్‌లో ప్రాపర్టీస్ రెంట్ కోసం మరియు షార్ట్ స్టే కోసం అందుబాటులో ఉన్నాయి. మీ ప్రాపర్టీస్‌ని మీరు ఉచితంగా లిస్ట్ చేసుకోవచ్చు."
    },
    en: {
      greeting: "Hello, and starting this, I am introducing myself as Madhu from bookmyhomez.",
      desc: "Properties for rent and short stay are available on our website. You can also list your properties for free.",
      btnText: "Enter Website",
      skipText: "Skip",
      speechText: "Hello, and starting this, I am introducing myself as Madhu from bookmyhomez. Properties for rent and short stay are available on our website. You can also list your properties for free."
    },
    kn: {
      greeting: "ನಮಸ್ಕಾರ, ಇದು ಮಧು bookmyhomez ನಿಂದ ಪರಿಚಯಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ.",
      desc: "ನಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಬಾಡಿಗೆಗೆ ಮತ್ತು ಶಾರ್ಟ್ ಸ್ಟೇಗಾಗಿ ಪ್ರಾಪರ್ಟೀಸ್ ಲಭ್ಯವಿವೆ. ನಿಮ್ಮ ಪ್ರಾಪರ್ಟೀಸ್‌ಗಳನ್ನು ನೀವು ಉಚಿತವಾಗಿ ಲಿಸ್ಟ್ ಮಾಡಬಹುದು.",
      btnText: "ವೆಬ್‌ಸೈಟ್‌ಗೆ ಪ್ರವೇಶಿಸಿ",
      skipText: "ಸ್ಕಿಪ್ (Skip)",
      speechText: "ನಮಸ್ಕಾರ, ಇದು ಮಧು bookmyhomez ನಿಂದ ಪರಿಚಯಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ. ನಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಬಾಡಿಗೆಗೆ ಮತ್ತು ಶಾರ್ಟ್ ಸ್ಟೇಗಾಗಿ ಪ್ರಾಪರ್ಟೀಸ್ ಲಭ್ಯವಿವೆ. ನಿಮ್ಮ ಪ್ರಾಪರ್ಟೀಸ್‌ಗಳನ್ನು ನೀವು ಉಚಿತವಾಗಿ ಲಿಸ್ಟ್ ಮಾಡಬಹುದು."
    }
  };

  // వాయిస్ ఇంట్రో ప్లే చేసే ఫంక్షన్
  const speakIntro = (lang: 'en' | 'te' | 'kn') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // పాత వాయిస్ ఉంటే ఆపేయాలి
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

    // ఆడియో/వీడియో అయిపోయిన తర్వాత ఆటోమేటిక్‌గా వెబ్‌సైట్‌కి వెళ్ళడానికి టైమర్ (సుమారు 8 సెకండ్లు)
    const timer = setTimeout(() => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      onUnlock();
    }, 9000);

    return () => clearTimeout(timer);
  };

  const handleLanguageChange = (lang: 'en' | 'te' | 'kn') => {
    setCurrentLanguage(lang);
    if (isOpen) {
      speakIntro(lang); // భాష మార్చగానే ఆ భాషలోనే మధు మాట్లాడతారు
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
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#05070B] overflow-hidden font-sans">
      
      {/* గ్రాండ్ డోర్స్ కంటైనర్ */}
      <div 
        className="relative w-full max-w-md md:max-w-xl h-full max-h-[900px] flex items-center justify-center cursor-pointer select-none perspective-[1500px]"
        onClick={!isOpen ? handleOpenDoors : undefined}
      >
        
        {/* తలుపులు తెరుచుకున్నాక వచ్చే బ్యానర్ వ్యూ */}
        <div className={`absolute inset-0 z-0 flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-6 md:p-10 transition-opacity duration-1000 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          
          {/* టాప్-రైట్ కార్నర్‌లో 'Skip' బటన్ */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onUnlock();
            }}
            className="absolute top-4 right-4 z-40 bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer"
          >
            {introContent[currentLanguage].skipText} ⏭
          </button>

          {/* లెఫ్ట్ సైడ్: లోగో, భాష మార్చే బటన్లు & డీటెయిల్స్ */}
          <div className="flex-1 text-white flex flex-col justify-center space-y-4 z-10 text-center md:text-left mt-8 md:mt-0">
            
            {/* బుక్‌మైహోమ్జ్ లోగో */}
            <div className="flex justify-center md:justify-start mb-1">
              <div className="bg-white p-2 rounded-xl shadow-lg border border-amber-500/40 inline-block">
                <img 
                  src="https://i.ibb.co/68v3m3v1/Gemini-Generated-Image-8dz5r28dz5r28dz5.png" 
                  alt="BookMyHomez Logo" 
                  className="w-32 md:w-40 h-auto object-contain"
                />
              </div>
            </div>

            {/* లాంగ్వేజ్ సెలెక్షన్ (తెలుగు, ఇంగ్లీష్, కన్నడ) */}
            <div className="flex items-center justify-center md:justify-start gap-2 bg-black/40 p-2 rounded-xl border border-amber-500/30 w-fit mx-auto md:mx-0">
              <span className="text-xs text-amber-300 font-bold px-1">Language:</span>
              {(['te', 'en', 'kn'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleLanguageChange(lang); 
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${currentLanguage === lang ? 'bg-amber-500 text-slate-950 shadow-md scale-105' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
                >
                  {lang === 'te' ? 'తెలుగు' : lang === 'en' ? 'English' : 'ಕನ್ನಡ'}
                </button>
              ))}
            </div>

            <h1 className="text-lg md:text-2xl font-extrabold tracking-wide text-amber-300 leading-snug">
              {introContent[currentLanguage].greeting}
            </h1>

            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              {introContent[currentLanguage].desc}
            </p>

            {/* వెబ్‌సైట్‌లోకి వెళ్ళడానికి బటన్ */}
            <div className="pt-2 flex justify-center md:justify-start">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  onUnlock(); 
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95 uppercase text-xs md:text-sm tracking-wider cursor-pointer"
              >
                {introContent[currentLanguage].btnText} →
              </button>
            </div>
          </div>

          {/* రైట్ సైడ్: మీ ఫోటో */}
          <div className="flex-1 flex items-center justify-center relative mt-4 md:mt-0 z-10">
            <div className="relative w-48 h-64 md:w-64 md:h-84 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-slate-800">
              <img 
                src="https://i.ibb.co/hR4y1Qy2/WhatsApp-Image-2026-08-06-at-4-54-15-PM.jpg" 
                alt="Madhu - BookMyHomez" 
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="text-white font-bold text-base">Madhu</span>
                <span className="text-amber-400 text-xs">BookMyHomez</span>
              </div>
            </div>
          </div>

        </div>

        {/* ఎడమ వైపు గ్రాండ్ వుడెన్ డోర్ */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#2c160b] via-[#4a2511] to-[#2c160b] border-r-2 border-amber-900/80 shadow-[inset_-15px_0_30px_rgba(0,0,0,0.8)] flex items-center justify-end origin-left transition-transform duration-[1500ms] ease-in-out z-20 ${
            isOpen ? 'rotate-y-[-110deg]' : 'rotate-y-0'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-4 border border-amber-600/30 rounded-l-lg flex flex-col justify-around p-6 opacity-40 pointer-events-none">
            <div className="h-full border-b border-amber-600/20 my-4"></div>
            <div className="h-full border-b border-amber-600/20 my-4"></div>
          </div>
        </div>

        {/* కుడి వైపు గ్రాండ్ వుడెన్ డోర్ */}
        <div 
          className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#2c160b] via-[#4a2511] to-[#2c160b] border-l-2 border-amber-900/80 shadow-[inset_15px_0_30px_rgba(0,0,0,0.8)] flex items-center justify-start origin-right transition-transform duration-[1500ms] ease-in-out z-20 ${
            isOpen ? 'rotate-y-[110deg]' : 'rotate-y-0'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-4 border border-amber-600/30 rounded-r-lg flex flex-col justify-around p-6 opacity-40 pointer-events-none">
            <div className="h-full border-b border-amber-600/20 my-4"></div>
            <div className="h-full border-b border-amber-600/20 my-4"></div>
          </div>
        </div>

        {/* మధ్యలో ఉండే కీ మరియు 'Tap on Door' బటన్ */}
        <div className={`absolute z-30 flex flex-col items-center justify-center transition-all duration-500 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <button 
            onClick={handleOpenDoors}
            className="group relative bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-8 py-5 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-4 border-2 border-amber-200"
          >
            {/* కీ ఐకాన్ */}
            <svg className="w-7 h-7 text-slate-950 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="text-sm md:text-lg font-extrabold tracking-wider uppercase">
              Tap on Door
            </span>
          </button>

          <span className="mt-4 text-xs text-amber-200/80 tracking-widest font-medium drop-shadow uppercase bg-black/50 px-4 py-1.5 rounded-full border border-amber-500/30">
            Click anywhere on the doors to unlock
          </span>
        </div>

      </div>
    </div>
  );
};
