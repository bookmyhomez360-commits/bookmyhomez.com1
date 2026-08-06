import React, { useState, useRef, useEffect } from 'react';

import doorImg from '/door-cartoon.jpg'; 
import introVid from '/intro-video.mp4';

interface DoorIntroProps {
  onComplete: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDoorClick = () => {
    setIsOpen(true);
    
    // డోర్ క్లిక్ చేసాక వీడియో స్టార్ట్ అవుతుంది
    setTimeout(() => {
      setIsPlayingVideo(true);
    }, 800);
  };

  // వీడియో ప్లే కావడం మొదలయ్యాక, వీడియో ఎంత టైమ్ ఉందో దాని ప్రకారం ఆటో-ఎగ్జిట్ బ్యాకప్ టైమర్
  useEffect(() => {
    if (isPlayingVideo && videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        // వీడియో నిడివి (duration) తెలుసుకుని, పూర్తయ్యే సమయానికి ఆటోమేటిక్‌గా వెబ్‌సైట్‌కి పంపుతుంది
        const videoDuration = video.duration * 1000;
        setTimeout(() => {
          onComplete();
        }, videoDuration + 300); // 300ms Extra Safety
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.play().catch((err) => console.log("Autoplay error:", err));

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [isPlayingVideo, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden w-screen h-screen">
      {!isPlayingVideo ? (
        /* --- Door Intro Screen --- */
        <div 
          onClick={handleDoorClick} 
          className={`relative w-full h-full cursor-pointer flex items-center justify-center bg-black transition-all duration-1000 ease-in-out ${
            isOpen ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <div 
            className="w-full h-full bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url(${doorImg})` }}
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
        /* --- Intro Video Screen --- */
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          <video
            ref={videoRef}
            src={introVid}
            autoPlay
            playsInline
            onEnded={onComplete} // 1. వీడియో పూర్తవ్వగానే మెయిన్ వెబ్‌సైట్‌కి వెళ్తుంది
            className="w-full h-full object-contain max-w-full max-h-full"
          />
          
          {/* Skip Button */}
          <button
            onClick={onComplete} // 2. మ్యాన్యువల్‌గా దాటవేయడానికి
            className="absolute top-5 right-5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs sm:text-sm px-4 py-2 rounded-full z-20 shadow-lg transition active:scale-95"
          >
            Skip Intro ➔
          </button>
        </div>
      )}
    </div>
  );
};
