import React, { useState, useRef, useEffect } from 'react';

interface DoorIntroProps {
  onComplete: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDoorClick = () => {
    setIsOpen(true);
    
    // డోర్ క్లిక్ చేయగానే 0.8 సెకన్లలో వీడియోకి మారుతుంది
    setTimeout(() => {
      setIsPlayingVideo(true);
    }, 800);
  };

  useEffect(() => {
    if (isPlayingVideo && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay handled:", err);
      });
    }
  }, [isPlayingVideo]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden w-screen h-screen">
      {!isPlayingVideo ? (
        /* --- 1. Door Intro Screen --- */
        <div 
          onClick={handleDoorClick} 
          className="relative w-full h-full cursor-pointer flex items-center justify-center bg-black overflow-hidden select-none"
        >
          <img 
            src="/door-cartoon.jpg" 
            alt="Door Intro" 
            className={`w-full h-full object-contain transition-all duration-1000 ease-in-out ${
              isOpen ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
            }`}
          />

          {!isOpen && (
            <div className="absolute z-10 animate-pulse text-center px-4 pointer-events-none">
              <span className="inline-block bg-black/70 backdrop-blur-md border border-yellow-400 text-yellow-400 font-extrabold text-xl sm:text-3xl md:text-5xl px-6 py-3 rounded-2xl shadow-2xl tracking-widest">
                TAP ON DOOR
              </span>
            </div>
          )}
        </div>
      ) : (
        /* --- 2. Intro Video Screen --- */
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          <video
            ref={videoRef}
            src="/intro-video.mp4"
            autoPlay
            playsInline
            controls={false}
            onEnded={onComplete} /* <-- వీడియో పూర్తయిన వెంటనే మెయిన్ వెబ్‌సైట్ ఓపెన్ అవుతుంది */
            className="w-full h-full object-contain max-w-full max-h-full"
          />
          
          {/* Skip Button */}
          <button
            onClick={onComplete} /* <-- బటన్ క్లిక్ చేసినా వెంటనే మెయిన్ వెబ్‌సైట్‌కి వెళ్తుంది */
            className="absolute top-5 right-5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs sm:text-sm px-4 py-2 rounded-full z-20 shadow-lg transition active:scale-95"
          >
            Skip Intro ➔
          </button>
        </div>
      )}
    </div>
  );
};
