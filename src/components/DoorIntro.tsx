import React, { useState, useRef } from 'react';

interface DoorIntroProps {
  onComplete: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDoorClick = () => {
    setIsOpen(true);
    
    // డోర్ యానిమేషన్ కోసం 1 సెకన్ టైమ్
    setTimeout(() => {
      setIsPlayingVideo(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      {!isPlayingVideo ? (
        /* --- Door Intro Screen --- */
        <div 
          onClick={handleDoorClick} 
          className="relative w-full h-full cursor-pointer flex items-center justify-center bg-cover bg-center bg-no-repeat select-none"
          style={{ backgroundImage: "url('/door-background.jpg')" }}
        >
          {/* mobile optimization overlay */}
          <div 
            className={`absolute inset-0 bg-black/30 transition-opacity duration-1000 ${
              isOpen ? 'opacity-0 scale-105' : 'opacity-100'
            }`} 
          />
          
          {/* Tap On Door Button / Text */}
          {!isOpen && (
            <div className="z-10 animate-bounce text-center px-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-wider">
                TAP ON DOOR
              </h1>
            </div>
          )}
        </div>
      ) : (
        /* --- Video Screen --- */
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src="/intro-video.mp4"
            autoPlay
            playsInline
            controls={false}
            onEnded={onComplete}
            /* object-contain ఉపయోగించడం వల్ల మొబైల్ మరియు ల్యాప్‌టాప్‌లలో వీడియో కట్ అవ్వకుండా పూర్తి డిస్‌ప్లే అవుతుంది */
            className="w-full h-full object-contain max-h-screen"
          />
          
          {/* Skip Button - Mobile responsive padding */}
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm sm:text-base px-4 py-2 rounded-full z-20 shadow-lg transition"
          >
            Skip Intro
          </button>
        </div>
      )}
    </div>
  );
};
