import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { INITIAL_PROPERTIES } from '../data/initialProperties';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  // States to track conversation flow like an agent
  const [intent, setIntent] = useState<'none' | 'buy' | 'rent' | 'visit'>('none');
  const [location, setLocation] = useState('');
  const [bhk, setBhk] = useState('');
  const [step, setStep] = useState<'ask_intent' | 'ask_location' | 'ask_bhk' | 'ask_contact' | 'done'>('ask_intent');
  const [visitProp, setVisitProp] = useState('');
  const [visitDate, setVisitDate] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: 'Hello! Welcome to BookMyHomez — Your Happy Home Partner. Are you looking to **Buy**, **Rent**, or schedule a **Property Visit**?' 
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const lowerText = userText.toLowerCase();
    
    const newMessages = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      let botReply = "";

      if (step === 'ask_intent') {
        if (lowerText.includes('buy') || lowerText.includes('purchase')) {
          setIntent('buy');
          setStep('ask_location');
          botReply = "Great! Which location or city are you looking to buy in?";
        } else if (lowerText.includes('rent') || lowerText.includes('lease')) {
          setIntent('rent');
          setStep('ask_location');
          botReply = "Awesome! Which location, area, or city are you looking to rent in?";
        } else if (lowerText.includes('visit') || lowerText.includes('site')) {
          setIntent('visit');
          setStep('ask_contact');
          botReply = "Which property or project name would you like to visit?";
        } else {
          botReply = "Please select an option clearly: Are you looking to **Buy**, **Rent**, or do a **Property Visit**?";
        }
      } 
      else if (step === 'ask_location') {
        setLocation(userText);
        setStep('ask_bhk');
        botReply = `Got it (${userText}). What is your preferred configuration? (e.g., 1 BHK, 2 BHK, 3 BHK, Villa, Plot)`;
      } 
      else if (step === 'ask_bhk') {
        setBhk(userText);
        setStep('ask_contact');
        botReply = "Please share your **Full Name and Phone Number** so we can show you the matching properties.";
      } 
      else if (step === 'ask_contact') {
        setStep('done');

        if (intent === 'visit') {
          setVisitProp(userText);
          botReply = `✅ **Visit Request Received!** We have noted your request for **${userText}**. Our team will call you shortly to confirm the date and time.\n\nType anything to start a new search!`;
          setStep('ask_intent');
        } else {
          // Filter actual properties from INITIAL_PROPERTIES safely
          const matches = INITIAL_PROPERTIES.filter(p => {
            const matchesLoc = !location || p.location?.toLowerCase().includes(location.toLowerCase()) || p.title?.toLowerCase().includes(location.toLowerCase());
            const matchesType = !bhk || p.bhk?.toLowerCase().includes(bhk.toLowerCase()) || p.type?.toLowerCase().includes(bhk.toLowerCase()) || p.title?.toLowerCase().includes(bhk.toLowerCase());
            return matchesLoc || matchesType;
          }).slice(0, 3);

          if (matches.length > 0) {
            botReply = `Thank you! Here are the best matching properties from our website:\n\n`;
            matches.forEach(p => {
              const propertyLink = `https://www.bookmyhomez.com/?propertyId=${p.id}`;
              botReply += `🏠 **${p.title}**\n📍 Location: ${p.location || 'Prime Location'}\n🛏️ Type: ${p.bhk || p.type || 'Standard'}\n💰 Price: ₹${p.price || 'Contact for Price'}\n🔗 [View Property Direct](${propertyLink})\n\n`;
            });
          } else {
            botReply = `Thank you! Currently, no exact filters matched, but our team is curating the best options for your request and will call you shortly.\n\n👉 [Visit Website Catalog](https://www.bookmyhomez.com)`;
          }
          botReply += "\nWould you like to search again? (Type **Buy** or **Rent**)";
          setStep('ask_intent');
        }
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 500);
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
                                {label || 'View Property Direct'} 🔗
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
              placeholder="Type your answer here..."
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
