import React, { useState } from 'react';

interface DoorIntroProps {
  onUnlock: () => void;
}

export const DoorIntro: React.FC<DoorIntroProps> = ({ onUnlock }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [keyInserted, setKeyInserted] = useState(false);

  const handleUnlockAction = () => {
    setKeyInserted(true);
    setTimeout(() => {
      setUnlocked(true);
    }, 600); // కీ ఇన్సర్ట్ అయిన యానిమేషన్ తర్వాత డోర్స్ ఓపెన్ అవుతాయి

    setTimeout(() => {
      onUnlock();
    }, 1600); // మొత్తం యానిమేషన్ అయ్యాక మెయిన్ వెబ్‌సైట్ కి వెళ్తుంది
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-[#05070B]">
      
      {/* ఎడమ వైపు గ్రాండ్ డోర్ */}
      <div 
        className={`absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#111827] via-[#1F2937] to-[#111827] border-r-4 border-amber-900/60 shadow-2xl flex items-center justify-end transition-transform duration-1000 ease-in-out z-20 origin-left ${
          unlocked ? '-translate-x-full rotate-y-[-15deg]' : 'translate-x-0'
        }`}
        style={{
          boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.8)'
        }}
      >
        {/* వుడెన్ ప్యానెల్ డిజైన్ టెక్స్చర్ */}
        <div className="absolute inset-4 border-2 border-amber-600/30 rounded-lg flex flex-col justify-around p-8 opacity-40">
          <div className="h-full border-b border-amber-600/20 my-4"></div>
          <div className="h-full border-b border-amber-600/20 my-4"></div>
        </div>
        <div className="absolute right-12 text-right opacity-30 select-none pointer-events-none">
          <h1 className="text-7xl font-serif font-bold text-amber-500 tracking-widest drop-shadow-md">BOOK MY</h1>
        </div>
      </div>

      {/* కుడి వైపు గ్రాండ్ డోర్ */}
      <div 
        className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#111827] via-[#1F2937] to-[#111827] border-l-4 border-amber-900/60 shadow-2xl flex items-center justify-start transition-transform duration-1000 ease-in-out z-20 origin-right ${
          unlocked ? 'translate-x-full rotate-y-[15deg]' : 'translate-x-0'
        }`}
        style={{
          boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.8)'
        }}
      >
        {/* వుడెన్ ప్యానెల్ డిజైన్ టెక్స్చర్ */}
        <div className="absolute inset-4 border-2 border-amber-600/30 rounded-lg flex flex-col justify-around p-8 opacity-40">
          <div className="h-full border-b border-amber-600/20 my-4"></div>
          <div className="h-full border-b border-amber-600/20 my-4"></div>
        </div>
        <div className="absolute left-12 text-left opacity-30 select-none pointer-events-none">
          <h1 className="text-7xl font-serif font-bold text-amber-500 tracking-widest drop-shadow-md">HOMEZ</h1>
        </div>
      </div>

      {/* మధ్యలో రియల్ హౌస్ 3D లుక్ మరియు కీ లాక్ సిస్టమ్ */}
      <div className={`relative z-30 flex flex-col items-center justify-center transition-all duration-700 ${unlocked ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        
        {/* రియల్ హౌస్ గ్లాస్ కార్డ్ */}
        <div className="bg-[#0b0f19]/90 border border-amber-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col items-center max-w-md w-full mx-4 backdrop-blur-2xl relative overflow-hidden">
          
          {/* రియల్ హౌస్ రియలిస్టిక్ ఇమేజ్ / బ్యానర్ (3D Real House) */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 shadow-xl border border-slate-700">
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" 
              alt="Real Luxury House" 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent"></div>
            <span className="absolute bottom-3 left-3 bg-indigo-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              Luxury Real Estate
            </span>
          </div>

          <h2 className="text-3xl font-serif font-bold text-white mb-2 text-center tracking-wide">BookMyHomez</h2>
          <p className="text-slate-400 text-xs mb-6 text-center">Insert your key into the lock to open your dream home</p>

          {/* కీ హోల్ మరియు ఇంటరాక్టివ్ కీ మెకానిజమ్ */}
          <div className="flex items-center gap-4 bg-[#05070B] px-6 py-4 rounded-2xl border border-slate-800 w-full justify-between shadow-inner">
            <div className="flex items-center gap-3">
              {/* కీ హోల్ గ్రాఫిక్ */}
              <div className={`w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-500/60 flex items-center justify-center shadow-lg transition-all ${keyInserted ? 'bg-amber-500/20 border-amber-400 scale-110' : ''}`}>
                <div className="w-1.5 h-3 bg-amber-400 rounded-sm"></div>
              </div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {keyInserted ? 'Key Inserted & Unlocked!' : 'Insert Key'}
              </span>
            </div>
            
            <button
              onClick={handleUnlockAction}
              disabled={keyInserted}
              className={`group relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 ${
                keyInserted ? 'translate-x-3 opacity-80' : ''
              }`}
            >
              {/* కీ ఐకాన్ */}
              <svg className={`w-5 h-5 transform -rotate-45 transition-transform duration-500 ${keyInserted ? 'rotate-0 scale-125' : 'group-hover:rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="text-xs font-extrabold">{keyInserted ? 'Opening...' : 'Unlock'}</span>
            </button>
          </div>
        </div>

        {/* స్కిప్ ఆప్షన్ */}
        <button
          onClick={handleUnlockAction}
          className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer underline tracking-wider"
        >
          Skip intro →
        </button>

      </div>
    </div>
  );
};
