import React, { useState } from 'react';

interface DoorIntroProps {
  onUnlock: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onUnlock }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [keyDragging, setKeyDragging] = useState(false);

  const handleUnlockAction = () => {
    setUnlocked(true);
    // యానిమేషన్ పూర్తయిన తర్వాత మెయిన్ వెబ్‌సైట్ కనిపించడానికి 1 సెకండ్ టైమర్
    setTimeout(() => {
      onUnlock();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-[#090D16]">
      
      {/* ఎడమ వైపు డోర్ */}
      <div 
        className={`absolute top-0 left-0 w-1/2 h-full bg-[#0B0F19] border-r border-slate-800 flex items-center justify-end transition-transform duration-1000 ease-in-out z-20 ${
          unlocked ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="absolute right-8 text-right opacity-20 select-none">
          <h1 className="text-6xl font-black text-indigo-500 tracking-wider">BOOK MY</h1>
        </div>
      </div>

      {/* కుడి వైపు డోర్ */}
      <div 
        className={`absolute top-0 right-0 w-1/2 h-full bg-[#0B0F19] border-l border-slate-800 flex items-center justify-start transition-transform duration-1000 ease-in-out z-20 ${
          unlocked ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="absolute left-8 text-left opacity-20 select-none">
          <h1 className="text-6xl font-black text-indigo-500 tracking-wider">HOMEZ</h1>
        </div>
      </div>

      {/* మధ్యలో ఉండే ఇల్లు, లాక్ మరియు కీ సెటప్ */}
      <div className={`relative z-30 flex flex-col items-center justify-center transition-opacity duration-500 ${unlocked ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        
        {/* మధ్యలో ఇల్లు / లోగో కార్డ్ */}
        <div className="bg-[#131B2E] border border-slate-700 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 backdrop-blur-xl">
          <div className="w-24 h-24 bg-white rounded-2xl p-3 flex items-center justify-center shadow-lg border border-indigo-500/40 mb-6">
            <svg className="w-full h-full text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 text-center">BookMyHomez</h2>
          <p className="text-slate-400 text-sm mb-8 text-center">Insert key or click to unlock your dream home</p>

          {/* కీ హోల్ మరియు ఇంటరాక్టివ్ కీ */}
          <div className="flex items-center gap-6 bg-[#090D16] px-6 py-4 rounded-2xl border border-slate-800 w-full justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Insert Key</span>
            
            <button
              onClick={handleUnlockAction}
              className="group relative bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl shadow-lg shadow-indigo-600/40 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center gap-2"
              title="Click to Insert Key & Unlock"
            >
              {/* కీ ఐకాన్ */}
              <svg className="w-6 h-6 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="text-xs font-bold">Unlock</span>
            </button>
          </div>
        </div>

        {/* స్కిప్ ఆప్షన్ (ఒకవేళ యూజర్ నేరుగా వెళ్లాలనుకుంటే) */}
        <button
          onClick={handleUnlockAction}
          className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer underline"
        >
          Skip intro →
        </button>

      </div>
    </div>
  );
};
