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
    
    // డోర్ ఓపెన్ కాగానే వీడియో స్టార్ట్ అవుతుంది
    setTimeout(() => {
      setIsPlayingVideo(true);
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.log("Autoplay issue handled: ", err);
        });
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden w-screen h-screen">
      {!isPlayingVideo ? (
        /* --- Door Intro Screen --- */
        <div 
          onClick={handleDoorClick} 
          className={`relative w-full h-full cursor-pointer flex items-center justify-center bg-cover bg-center bg-no-repeat select-none transition-transform duration-1000 ease-in-out ${
            isOpen ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
          }`}
          /* మీ క్రొత్త కార్టూన్ డోర్ ఇమేజ్ ని public/door-cartoon.jpg లేదా తగిన నేమ్‌తో సేవ్ చేసుకోండి */
          style={{ backgroundImage: "url('/door-cartoon.jpg')" }}
        >
          {/* Subtle Overlay to make text legible */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Tap On Door Hint - Fully responsive text */}
          {!isOpen && (
            <div className="z-10 animate-pulse text-center px-4 pointer-events-none">
              <span className="inline-block bg-black/60 backdrop-blur-md border border-yellow-400/50 text-yellow-400 font-extrabold text-xl sm:text-3xl md:text-5xl px-6 py-3 rounded-2xl shadow-2xl tracking-widest">
                TAP ON DOOR
              </span>
            </div>
          )}
        </div>
      ) : (
        /* --- Native Website-like Video Layer --- */
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          <video
            ref={videoRef}
            src="/intro-video.mp4"
            autoPlay
            playsInline
            muted={false}
            onEnded={onComplete}
            /* object-cover ఉపయోగించడం వలన ల్యాప్‌టాప్ లేదా మొబైల్ దేంట్లోనైనా నార్మల్ వీడియోలా కాకుండా ఒక వెబ్‌సైట్ లేఅవుట్‌లా ఫుల్ స్క్రీన్‌ను కవర్ చేస్తుంది */
            className="w-full h-full object-cover pointer-events-none select-none"
          />
          
          {/* Custom Skip Button (వెబ్‌సైట్ లుక్ రావడానికి వీలుగా) */}
          <button
            onClick={onComplete}
            className="absolute top-5 right-5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/30 font-semibold text-xs sm:text-sm px-4 py-2 rounded-full z-20 shadow-lg transition active:scale-95"
          >
            Skip Intro ➔
          </button>
        </div>
      )}
    </div>
  );
};
