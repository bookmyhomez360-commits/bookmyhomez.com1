import React, { useState, useRef, useEffect } from 'react';

// శ్రద్ధ వహించండి: ఇక్కడ ఎలాంటి import doorImg / import introVid ఉండకూడదు!

interface DoorIntroProps {
  onComplete: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // public/ ఫోల్డర్ లో ఉన్న ఫైల్ పాత్‌లు
  const doorImgPath = '/door-cartoon.jpg';
  const introVidPath = '/intro-video.mp4';

  const handleDoorClick = () => {
    setIsOpen(true);
    
    setTimeout(() => {
      setIsPlayingVideo(true);
    }, 800);
  };

  useEffect(() => {
    if (isPlayingVideo && videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        const videoDuration = video.duration * 1000;
        setTimeout(() => {
          onComplete();
        }, videoDuration + 300);
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
            style={{ backgroundImage: `url(${doorImgPath})` }}
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
            src={introVidPath}
            autoPlay
            playsInline
            onEnded={onComplete}
            className="w-full h-full object-contain max-w-full max-h-full"
          />
          
          <button
            onClick={onComplete}
            className="absolute top-5 right-5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs sm:text-sm px-4 py-2 rounded-full z-20 shadow-lg transition active:scale-95"
          >
            Skip Intro ➔
          </button>
        </div>
      )}
    </div>
  );
};
