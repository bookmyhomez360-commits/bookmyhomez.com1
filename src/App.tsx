import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Building, MapPin, Search, Heart, User, Sparkles, 
  ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2, 
  X, ShieldCheck, Star, Bed, Bath, Square, SlidersHorizontal, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { ThreeBackground, REAL_VILLA_LIST } from './components/ThreeBackground';

export default function App() {
  const [activeVillaIndex, setActiveVillaIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [city, setCity] = useState('All Cities (India)');
  const [keyword, setKeyword] = useState('');
  const [bhk, setBhk] = useState('Any BHK');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  // Chatbase & Make.com Webhook Integration
  useEffect(() => {
    // 1. Chatbase Script Load చేసుట
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.setAttribute('domain', 'www.chatbase.co');
    document.body.appendChild(script);

    // 2. Chat/Lead డేటాను Make.com వెబ్‌హుక్‌కు పంపే ఈవెంట్ లిజనర్
    const handleChatbaseMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CHATBASE_LEAD_SUBMITTED') {
        fetch('https://hook.eu1.make.com/88j6fdn4rxco2o05vj2z3dyewuyhj8a2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event.data),
        }).catch((err) => console.error('Webhook error:', err));
      }
    };

    window.addEventListener('message', handleChatbaseMessage);

    return () => {
      window.removeEventListener('message', handleChatbaseMessage);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // ప్రస్తుత విల్లా వివరాలు టెక్స్ట్ కోసం
  const currentVilla = REAL_VILLA_LIST[activeVillaIndex] || REAL_VILLA_LIST[0];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 relative font-sans selection:bg-indigo-500 selection:text-white">
      {/* 3D / Background Villa Showcase Component (విడ్జెట్ ఎడమవైపు ఉంటుంది) */}
      <ThreeBackground 
        activeVillaIndex={activeVillaIndex} 
        onVillaChange={setActiveVillaIndex} 
      />

      {/* Header / Navbar */}
      <header className="relative z-30 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">BookMyHomez</span>
              <span className="block text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Luxury Real Estate</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-full border border-slate-800">
            <button className="px-4 py-2 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">Home</button>
            <button className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition">Buy</button>
            <button className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition">Rent</button>
            <button className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition">Short Stay</button>
            <button className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition">Land & Plots</button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>List Property FREE</span>
            </button>
            <button className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition relative">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black flex items-center justify-center text-white">2</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold transition">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Log In / Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Dynamic Villa Text (ఇమేజ్‌తో పాటు టెక్స్ట్ కూడా మారుతుంది) */}
      <section className="relative z-20 pt-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold mb-6 shadow-xl backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>{currentVilla.badgeText}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 max-w-5xl mx-auto drop-shadow-2xl">
          {currentVilla.heroHeadline}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-400 bg-clip-text text-transparent">
            {currentVilla.heroHighlight}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 font-medium drop-shadow-md">
          {currentVilla.heroSubtext}
        </p>

        {/* Search Box Widget */}
        <div className="max-w-4xl mx-auto bg-slate-950/85 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-indigo-500/40 shadow-2xl">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-800 pb-3">
            {['All Categories', 'Buy', 'Rent', 'Short Stay', 'Plots'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Location / City</label>
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <select 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-transparent w-full outline-none cursor-pointer text-white"
                >
                  <option className="bg-slate-900" value="All Cities (India)">All Cities (India)</option>
                  <option className="bg-slate-900" value="Bengaluru">Bengaluru</option>
                  <option className="bg-slate-900" value="Hyderabad">Hyderabad</option>
                  <option className="bg-slate-900" value="Mumbai">Mumbai</option>
                  <option className="bg-slate-900" value="Chennai">Chennai</option>
                  <option className="bg-slate-900" value="Gurgaon">Gurgaon</option>
                  <option className="bg-slate-900" value="Pune">Pune</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Keywords</label>
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Search className="w-4 h-4 text-indigo-400" />
                <input 
                  type="text" 
                  placeholder="Society, locality, BHK..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="bg-transparent w-full outline-none text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">BHK Config</label>
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Home className="w-4 h-4 text-indigo-400" />
                <select 
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  className="bg-transparent w-full outline-none cursor-pointer text-white"
                >
                  <option className="bg-slate-900" value="Any BHK">Any BHK</option>
                  <option className="bg-slate-900" value="3 BHK">3 BHK</option>
                  <option className="bg-slate-900" value="4 BHK">4 BHK</option>
                  <option className="bg-slate-900" value="5 BHK">5 BHK</option>
                </select>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            <span>Search Verified Properties</span>
          </button>
        </div>
      </section>
    </div>
  );
}
