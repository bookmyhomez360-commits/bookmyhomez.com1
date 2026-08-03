import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<'main' | 'buy_rent' | 'location' | 'bhk' | 'budget' | 'visit_property' | 'visit_date' | 'contact'>('main');
  const [category, setCategory] = useState<'Buy' | 'Rent'>('Buy');
  const [location, setLocation] = useState('');
  const [bhk, setBhk] = useState('');
  const [visitProp, setVisitProp] = useState('');
  const [visitDate, setVisitDate] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: '👋 Namaste! Welcome to BookMyHomez — Your Happy Home Partner. Ela help cheyali? Kinda options lo okati select cheyandi:\n\n1️⃣ Buy\n2️⃣ Rent\n3️⃣ Property Visit\n4️⃣ Visit Site' 
    }
  ]);

  const propertiesDatabase = [
    { id: "1785042100498", title: "Luxury Villa in Indiranagar", type: "Villa", category: "Buy", location: "Bengaluru", bhk: "4 BHK", price: "₹4.5 Cr", link: "https://www.bookmyhomez.com/?propertyId=1785042100498" },
    { id: "1785044344797", title: "Modern Apartment", type: "Apartment", category: "Rent", location: "Hyderabad", bhk: "3 BHK", price: "₹45,000/mo", link: "https://www.bookmyhomez.com/?propertyId=1785044344797" },
    { id: "1785141027798", title: "Independent House", type: "Independent House", category: "Buy", location: "Chennai", bhk: "3 BHK", price: "₹1.8 Cr", link: "https://www.bookmyhomez.com/?propertyId=1785141027798" }
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const newMessages = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      let botReply = "";

      if (step === 'main') {
        const lower = userText.toLowerCase();
        if (lower.includes('1') || lower.includes('buy')) {
          setCategory('Buy');
          setStep('location');
          botReply = "Great! Meeru ekkada property chusthunnaro (Location/City) teliyajeyandi?";
        } else if (lower.includes('2') || lower.includes('rent')) {
          setCategory('Rent');
          setStep('location');
          botReply = "Sure! Meeru rent kosam ekkadikina area/city lo chusthunnaro type cheyandi?";
        } else if (lower.includes('3') || lower.includes('visit')) {
          setStep('visit_property');
          botReply = "Meer ఏ property ki / project ki visit cheyalanukuntunnaro daani name or location chepandi?";
        } else if (lower.includes('4') || lower.includes('site')) {
          botReply = "🌐 Mee kosam direct website link:\n👉 [BookMyHomez Website](https://www.bookmyhomez.com)\n\nIkkada meeru full gallery, maps, mariyu virtual tours chudachu! Inka emina specific help kavala?";
          setStep('main');
        } else {
          botReply = "Dayachesi sariyna option select cheyandi:\n1️⃣ Buy\n2️⃣ Rent\n3️⃣ Property Visit\n4️⃣ Visit Site";
        }
      } else if (step === 'location') {
        setLocation(userText);
        setStep('bhk');
        botReply = "Super! Mee preferred Property Type enti? (e.g., 2BHK, 3BHK, Villa, Plot)";
      } else if (step === 'bhk') {
        setBhk(userText);
        setStep('budget');
        botReply = "Mee budget range ent anedi chepandi? (e.g., 50 Lakhs - 1 Cr)";
      } else if (step === 'budget') {
        setStep('main');
        // Filter properties
        const matches = propertiesDatabase.filter(p => p.category.toLowerCase() === category.toLowerCase());
        
        if (matches.length > 0) {
          botReply = `🎉 Mee requirements ki taggattu konni properties ikkada unnai:\n\n`;
          matches.forEach(p => {
            botReply += `🏠 **${p.title}**\n📍 Location: ${p.location}\n🛏️ Config: ${p.bhk} (${p.type})\n💰 Price: ${p.price}\n🔗 [View Property Direct](${p.link})\n\n`;
          });
        } else {
          botReply = "Currently, no exact matches are available, but our team will curate options for you soon. Ma team memu ventane connect avthamu!";
        }
        botReply += "\n\nInka emina help kavala? Options:\n1️⃣ Buy\n2️⃣ Rent\n3️⃣ Property Visit\n4️⃣ Visit Site";
      } else if (step === 'visit_property') {
        setVisitProp(userText);
        setStep('visit_date');
        botReply = "Meru visit cheyalanukuntunna preferred Date & Time (e.g., Tomorrow @ 4 PM) enter cheyandi.";
      } else if (step === 'visit_date') {
        setVisitDate(userText);
        setStep('contact');
        botReply = "Thank you! Mee Full Name mariyu Phone Number ivvandi, ma team mimmalni contact chesi visit confirm chestharu.";
      } else if (step === 'contact') {
        setStep('main');
        botReply = `✅ Done! Mee Property Visit successfully request aindi (${visitProp} on ${visitDate}). Ma team short lo mi phone ki call chestharu!\n\nMeru malli emina chudalanukunte options choose cheyandi:\n1️⃣ Buy\n2️⃣ Rent\n3️⃣ Property Visit\n4️⃣ Visit Site`;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition transform hover:scale-105"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> BookMyHomez Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}>
                  {msg.text.includes('http') ? (
                    <div>
                      {msg.text.split('\n').map((line, i) => {
                        if (line.includes('http')) {
                          const parts = line.split('](');
                          const url = parts[1]?.replace(')', '');
                          const label = parts[0]?.replace('[', '');
                          return (
                            <div key={i} className="mt-1">
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-semibold hover:text-indigo-300">
                                {label || url} 🔗
                              </a>
                            </div>
                          );
                        }
                        return <div key={i}>{line}</div>;
                      })}
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your option or details..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl cursor-pointer transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
