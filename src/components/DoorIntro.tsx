import React, { useState, useRef, useEffect } from 'react';

interface DoorIntroProps {
  onComplete: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDoorClick = () => {
    if (isOpen) return;
    setIsOpen(true);

    // తలుపులు ఓపెన్ అయ్యే యానిమేషన్ కోసం 1.2 సెకన్లు (1200ms) టైమ్
    setTimeout(() => {
      setIsPlayingVideo(true);
    }, 1200);
  };

  useEffect(() => {
    if (isPlayingVideo && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay handled:", err);
      });
    }
  }, [isPlayingVideo]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden w-screen h-screen select-none">
      {!isPlayingVideo ? (
        /* --- CSS 3D Animated Doors (No Image Needed) --- */
        <div 
          onClick={handleDoorClick} 
          className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center bg-slate-950 [perspective:1200px]"
        >
          {/* Left Door Panel */}
          <div 
            className={`absolute top-0 left-0 w-1/2 h-full bg-[#3d2314] border-r-4 border-[#21120a] shadow-2xl transition-transform duration-1000 ease-in-out origin-left flex items-center justify-end pr-4 sm:pr-8 ${
              isOpen ? '[transform:rotateY(-105deg)]' : '[transform:rotateY(0deg)]'
            }`}
            style={{
              backgroundImage: 'radial-gradient(circle, #4a2c1b 0%, #2b170c 100%)',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
            }}
          >
            {/* Left Door Details / Panels */}
            <div className="w-3/4 h-5/6 border-4 border-[#21120a] rounded-lg bg-[#2e190e]/60 shadow-inner flex flex-col justify-between p-4">
              <div className="w-full h-1/3 border-2 border-[#1f1008] bg-[#22120a]/80 rounded" />
              <div className="w-full h-1/3 border-2 border-[#1f1008] bg-[#22120a]/80 rounded" />
            </div>
            {/* Door Handle / Lock Plate */}
            <div className="w-3 h-20 bg-amber-600 rounded-l border border-amber-300 shadow-md mr-1" />
          </div>

          {/* Right Door Panel */}
          <div 
            className={`absolute top-0 right-0 w-1/2 h-full bg-[#3d2314] border-l-4 border-[#21120a] shadow-2xl transition-transform duration-1000 ease-in-out origin-right flex items-center justify-start pl-4 sm:pl-8 ${
              isOpen ? '[transform:rotateY(105deg)]' : '[transform:rotateY(0deg)]'
            }`}
            style={{
              backgroundImage: 'radial-gradient(circle, #4a2c1b 0%, #2b170c 100%)',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
            }}
          >
            {/* Door Handle / Lock Plate */}
            <div className="w-3 h-20 bg-amber-600 rounded-r border border-amber-300 shadow-md ml-1" />
            
            {/* Right Door Details / Panels */}
            <div className="w-3/4 h-5/6 border-4 border-[#21120a] rounded-lg bg-[#2e190e]/60 shadow-inner flex flex-col justify-between p-4">
              <div className="w-full h-1/3 border-2 border-[#1f1008] bg-[#22120a]/80 rounded" />
              <div className="w-full h-1/3 border-2 border-[#1f1008] bg-[#22120a]/80 rounded" />
            </div>
          </div>

          {/* Central TAP ON DOOR Key Badge */}
          {!isOpen && (
            <div className="absolute z-30 animate-pulse text-center pointer-events-none px-4">
              <div className="bg-black/80 backdrop-blur-md border-2 border-amber-400/80 px-6 py-4 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                <span className="text-xl sm:text-3xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-600 uppercase font-serif drop-shadow-lg">
                  🔑 TAP ON DOOR
                </span>
              </div>
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
          
          {/* Skip Button - Direct Redirect to Main Site */}
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
