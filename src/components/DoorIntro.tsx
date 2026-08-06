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
      speechText: "నమస్కారం, ఇది మధు, bookmyhomez నుండి పరిచయం చేసుకుంటున్నాను. మన వెబ్‌సైట్‌లో ప్రాపర్టీస్ రెంట్ కోసం మరియు షార్ట్ స్టే కోసం అందుబాటులో ఉన్నాయి. మీ ప్రాపర్టీస్‌ని మీరు ఉచితంగా లిస్ట్ చేసుకోవచ్చు."
    },
    en: {
      speechText: "Hello, this is Madhu from bookmyhomez. Properties for rent and short stay are available on our website. You can also list your properties for free."
    },
    kn: {
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
      
      {/* తలుపులు తెరుచుకున్నాక వచ్చే వీడియో / లగ్జరీ బ్యానర్ వ్యూ */}
      <div className={`absolute inset-0 z-0 flex items-center justify-center bg-black transition-opacity duration-1000 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* టాప్-రైట్ కార్నర్‌లో 'Skip' బటన్ */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinalUnlock();
          }}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold px-4 py-2 rounded-full backdrop-blur-md border border-amber-500/40 transition-all cursor-pointer shadow-lg"
        >
          Skip ⏭
        </button>

        {/* మీరు పంపిన వీడియో ఫైల్ (లేదా యానిమేటెడ్ బ్యానర్) */}
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-6 bg-[#0c0a09]">
          <video 
            src="/path-to-your-video.mp4" 
            autoPlay 
            playsInline
            controls
            className="w-full h-full object-contain max-w-6xl max-h-[90vh] rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)]"
            onEnded={handleFinalUnlock}
          >
            Your browser does not support the video tag.
          </video>
        </div>

      </div>

      {/* Left Cartoon Door Leaf */}
      <div
        onClick={handleDoorClick}
        className={`absolute top-0 left-0 w-1/2 h-full cursor-pointer transition-transform duration-1200 ease-in-out origin-left z-10 ${
          isOpen ? '-translate-x-full opacity-0 pointer-events-none' : ''
        }`}
        style={{
          backgroundImage: `url('https://i.ibb.co/6y4G8v3/cartoon-door.png')`, // మీ కార్టూన్ డోర్ ఇమేజ్ లింక్ (లేదా లోకల్ అసెట్)
          backgroundSize: '200% 100%',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat',
          boxShadow: 'inset -30px 0 60px rgba(0,0,0,0.8)'
        }}
      ></div>

      {/* Right Cartoon Door Leaf */}
      <div
        onClick={handleDoorClick}
        className={`absolute top-0 right-0 w-1/2 h-full cursor-pointer transition-transform duration-1200 ease-in-out origin-right z-10 ${
          isOpen ? 'translate-x-full opacity-0 pointer-events-none' : ''
        }`}
        style={{
          backgroundImage: `url('https://i.ibb.co/6y4G8v3/cartoon-door.png')`, // మీ కార్టూన్ డోర్ ఇమేజ్ లింక్ (లేదా లోకల్ అసెట్)
          backgroundSize: '200% 100%',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          boxShadow: 'inset 30px 0 60px rgba(0,0,0,0.8)'
        }}
      ></div>

      {/* Center Clickable Trigger Overlay (కార్టూన్ డోర్ మధ్యలో ఉన్న కీ మరియు టెక్స్ట్ కోసం) */}
      <div
        onClick={handleDoorClick}
        className={`absolute z-20 cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center w-full h-full pointer-events-auto ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* ఇక్కడ యూజర్ డోర్ మీద ఎక్కడ క్లిక్ చేసినా ఓపెన్ అయ్యేలా ఫుల్ స్క్రీన్ క్లిక్ జోన్ ఉంటుంది */}
      </div>

    </div>
  );
};

export default DoorIntro;
