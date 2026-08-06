import React, { useState, useEffect } from 'react';

interface DoorIntroProps {
  onComplete: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleDoorClick = () => {
    if (isOpen) return;
    setIsOpen(true);

    setTimeout(() => {
      setShowBanner(true);
      startSpeech();
    }, 1200);
  };

  // Madhu గారి పేరుతో ప్రమోషనల్ వాయిస్ ఓవర్ ప్లే అవ్వడం
  const startSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const text = "Welcome to BookMyHomez, this is Madhu! In Bookmyhomez, the properties are available for rent and short stays. List your property FOR FREE, and publish your property on Bookmyhomez at no cost and connect with genuine tenants and guests. Your Property, Your Choice, Our Platform!";
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setTimeout(onComplete, 800);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        onComplete();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(onComplete, 7000);
    }
  };

  const handleSkip = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden w-screen h-screen select-none font-sans">
      {!showBanner ? (
        /* --- 1. 3D Wooden Door Screen --- */
        <div 
          onClick={handleDoorClick} 
          className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center bg-slate-950 [perspective:1200px]"
        >
          {/* Outer Frame */}
          <div className="absolute inset-2 sm:inset-4 border-[10px] border-[#2b170c] rounded-3xl z-10 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.9)]" />

          {/* Left Door Panel */}
          <div 
            className={`absolute top-0 left-0 w-1/2 h-full bg-[#4a2e1b] border-r-4 border-[#26150b] transition-transform duration-1000 ease-in-out origin-left flex items-center justify-end pr-2 sm:pr-6 shadow-2xl ${
              isOpen ? '[transform:rotateY(-105deg)]' : '[transform:rotateY(0deg)]'
            }`}
            style={{
              backgroundImage: 'linear-gradient(135deg, #5c3a23 0%, #2e1a0e 100%)',
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8)'
            }}
          >
            <div className="w-5/6 h-5/6 border-4 border-[#2b170c] rounded-xl bg-[#361e10]/80 shadow-inner flex flex-col justify-between p-4">
              <div className="w-full h-1/4 border-2 border-[#200f07] bg-[#29150b] rounded-lg shadow-inner" />
              <div className="w-full h-1/4 border-2 border-[#200f07] bg-[#29150b] rounded-lg shadow-inner" />
              <div className="w-full h-1/4 border-2 border-[#200f07] bg-[#29150b] rounded-lg shadow-inner" />
            </div>
          </div>

          {/* Right Door Panel */}
          <div 
            className={`absolute top-0 right-0 w-1/2 h-full bg-[#4a2e1b] border-l-4 border-[#26150b] transition-transform duration-1000 ease-in-out origin-right flex items-center justify-start pl-2 sm:pl-6 shadow-2xl ${
              isOpen ? '[transform:rotateY(105deg)]' : '[transform:rotateY(0deg)]'
            }`}
            style={{
              backgroundImage: 'linear-gradient(135deg, #5c3a23 0%, #2e1a0e 100%)',
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8)'
            }}
          >
            <div className="w-5/6 h-5/6 border-4 border-[#2b170c] rounded-xl bg-[#361e10]/80 shadow-inner flex flex-col justify-between p-4">
              <div className="w-full h-1/4 border-2 border-[#200f07] bg-[#29150b] rounded-lg shadow-inner" />
              <div className="w-full h-1/4 border-2 border-[#200f07] bg-[#29150b] rounded-lg shadow-inner" />
              <div className="w-full h-1/4 border-2 border-[#200f07] bg-[#29150b] rounded-lg shadow-inner" />
            </div>
          </div>

          {/* Attached 3D Golden Key Handle in Center */}
          {!isOpen && (
            <div className="absolute z-30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 animate-pulse">
              <div className="relative flex items-center justify-center bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 px-6 py-3.5 rounded-full border-2 border-yellow-200 shadow-[0_0_35px_rgba(245,158,11,0.75)]">
                <div className="w-6 h-6 border-4 border-amber-950 rounded-full mr-2 bg-yellow-300 shadow-sm" />
                <span className="text-base sm:text-2xl md:text-3xl font-black tracking-widest text-amber-950 uppercase font-serif drop-shadow-sm">
                  TAP ON DOOR
                </span>
                <div className="w-4 h-6 border-r-4 border-b-4 border-amber-950 ml-2" />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* --- 2. As-It-Is Recreated Poster UI --- */
        <div className="relative w-full h-full bg-white flex flex-col lg:flex-row items-center justify-between overflow-hidden">
          
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-full z-50 shadow-xl transition active:scale-95 cursor-pointer border border-purple-300"
          >
            Skip Intro ➔
          </button>

          {/* Left Purple & White Curve Poster Section */}
          <div className="relative w-full lg:w-[60%] h-full bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10 overflow-y-auto">
            
            {/* Background Purple Curved Shape */}
            <div className="absolute top-0 right-0 w-[120%] h-full bg-[#4c1d95] -z-10 rounded-br-[100%] hidden lg:block opacity-10" />

            {/* Header / Logo */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center bg-purple-900 text-yellow-400 font-black px-3 py-1.5 rounded-lg text-xl border-2 border-amber-400">
                <span>🏠 BMH</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-purple-900">
                BOOK <span className="bg-purple-900 text-white px-2 py-0.5 rounded">MY</span> HOMEZ
              </span>
            </div>

            {/* Main Headlines */}
            <div className="space-y-4 my-auto">
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                In Bookmyhomez the properties <br />
                are available for <span className="text-purple-700 font-black underline">RENT</span> and <br />
                <span className="text-purple-700 font-black underline">SHORT STAYS</span>.
              </h2>

              <hr className="border-t-2 border-purple-800 w-1/3 my-4" />

              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900">
                  List Your Property
                </h1>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-purple-800 tracking-tight">
                  FOR FREE
                </h1>
              </div>

              <p className="text-sm sm:text-lg font-bold text-slate-700 max-w-lg leading-normal">
                and publish your property on Bookmyhomez at no cost and connect with genuine tenants and guests.
              </p>
            </div>

            {/* Bottom Badges & URL Box */}
            <div className="space-y-4 mt-6">
              <div className="bg-[#4c1d95] text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold">
                  <span className="bg-white/20 p-2 rounded-xl">🏡</span>
                  <span>Rent or Short Stay Options</span>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold">
                  <span className="bg-white/20 p-2 rounded-xl">🏷️</span>
                  <span>Free Property Listing</span>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold">
                  <span className="bg-white/20 p-2 rounded-xl">👥</span>
                  <span>Connect with Genuine Tenants</span>
                </div>
              </div>

              <div className="bg-amber-400 text-slate-950 font-black text-base sm:text-xl px-6 py-3 rounded-2xl flex items-center justify-center space-x-3 shadow-md w-full sm:w-max">
                <span>🌐</span>
                <span>Visit Now: www.bookmyhomez.com</span>
              </div>
            </div>

          </div>

          {/* Right Person / Presenter Section */}
          <div className="relative w-full lg:w-[40%] h-full bg-slate-100 flex flex-col items-center justify-end p-6 lg:p-0 overflow-hidden border-t-4 lg:border-t-0 lg:border-l-4 border-purple-800">
            
            {/* Background Room/Office Styling */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-300 -z-10" />

            {/* Code-Generated Person Representation with Lip-Sync */}
            <div className="relative w-64 sm:w-80 h-96 sm:h-[450px] flex flex-col items-center justify-end">
              
              {/* Person Head & Hair */}
              <div className="relative w-36 h-48 bg-[#f5d0a9] rounded-3xl flex flex-col items-center justify-center shadow-2xl border-2 border-amber-200">
                
                {/* Hair Bun */}
                <div className="absolute -top-6 w-16 h-12 bg-slate-900 rounded-full border-b-2 border-slate-700" />
                
                {/* Beard & Moustache */}
                <div className="absolute bottom-1 w-28 h-20 bg-slate-900 rounded-b-3xl opacity-90" />
                
                {/* Eyes */}
                <div className="flex space-x-8 mb-6 z-10">
                  <div className="w-3 h-3 bg-slate-900 rounded-full" />
                  <div className="w-3 h-3 bg-slate-900 rounded-full" />
                </div>

                {/* Animated Lips for Speech */}
                <div 
                  className={`z-20 bg-rose-900 border border-rose-950 rounded-full transition-all duration-150 ${
                    isSpeaking ? 'w-8 h-5 animate-bounce' : 'w-6 h-1.5'
                  }`}
                />
              </div>

              {/* Blazer & Suit */}
              <div className="w-64 sm:w-80 h-64 bg-slate-900 rounded-t-3xl border-t-4 border-amber-600 flex justify-center shadow-2xl">
                <div className="w-16 h-full bg-white flex justify-center pt-2">
                  <div className="w-4 h-4 bg-slate-900" />
                </div>
              </div>

              {/* Speech Indicator with Madhu's Name */}
              {isSpeaking && (
                <div className="absolute top-2 bg-purple-900 text-yellow-300 font-extrabold text-xs px-4 py-1.5 rounded-full shadow-2xl border border-yellow-400 animate-pulse">
                  🎙️ Madhu Speaking...
                </div>
              )}
            </div>

            {/* Bottom Right Tag */}
            <div className="absolute bottom-4 right-4 bg-purple-900 text-white text-xs font-bold p-3 rounded-2xl shadow-xl border border-purple-400 text-right">
              <p className="text-yellow-400 font-black">Your Property.</p>
              <p>Your Choice.</p>
              <p className="text-purple-300">Our Platform.</p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
