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
    setTimeout(() => {
      setIsPlayingVideo(true);
    }, 800);
  };

  useEffect(() => {
    if (isPlayingVideo && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay issue handled:", err);
      });
    }
  }, [isPlayingVideo]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden w-screen h-screen select-none">
      {!isPlayingVideo ? (
        /* --- 1. Door Intro Screen --- */
        <div 
          onClick={handleDoorClick} 
          className={`relative w-full h-full cursor-pointer flex items-center justify-center bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out ${
            isOpen ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{ backgroundImage: "url('/door-background.jpg')" }}
        >
          {/* Key పైన సరిగ్గా గోల్డ్ రంగులో TAP ON DOOR టెక్స్ట్ */}
          {!isOpen && (
            <div className="absolute top-[49%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-20 pointer-events-none text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase font-serif">
                TAP ON DOOR
              </h1>
            </div>
          )}
        </div>
      ) : (
        /* --- 2. Intro Video Screen --- */
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          <video
            ref={videoRef}
            src="/publicintro-video.mp4"
            autoPlay
            playsInline
            controls={false}
            onEnded={onComplete}
            className="w-full h-full object-contain max-w-full max-h-full"
          />
          
          {/* Skip Button */}
          <button
            onClick={onComplete}
            className="absolute top-5 right-5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-full z-30 shadow-2xl transition-all duration-200 active:scale-95 cursor-pointer border border-yellow-200"
          >
            Skip Intro ➔
          </button>
        </div>
      )}
    </div>
  );
};
