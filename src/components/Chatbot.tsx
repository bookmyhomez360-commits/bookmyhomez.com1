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
  const [step, setStep] = useState<'main' | 'collect_details' | 'visit_property' | 'visit_date' | 'visit_contact'>('main');
  
  const [category, setCategory] = useState<'Buy' | 'Rent'>('Buy');
  const [location, setLocation] = useState('');
  const [bhk, setBhk] = useState('');
  const [budget, setBudget] = useState('');
  
  const [visitProp, setVisitProp] = useState('');
  const [visitDate, setVisitDate] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: 'Hello! Welcome to BookMyHomez — Your Happy Home Partner. How can I help you today? Please choose an option or tell me what you are looking for (e.g., "I want to rent a 3BHK in Hyderabad under 50000").\n\n1️⃣ Buy\n2️⃣ Rent\n3️⃣ Property Visit\n4️⃣ Visit Site' 
    }
  ]);

  const parseUserIntent = (text: string) => {
    const lower = text.toLowerCase();
    
    // Detect Category
    if (lower.includes('rent') || lower.includes('lease')) {
      setCategory('Rent');
    } else if (lower.includes('buy') || lower.includes('purchase') || lower.includes('sale')) {
      setCategory('Buy');
    }

    // Detect BHK
    const bhkMatch = text.match(/(\d+)\s*(bhk|bed)/i);
    if (bhkMatch) {
      setBhk(bhkMatch[1] + ' BHK');
    }

    // Detect Numbers / Budget
    const numbers = text.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      // Find a number that looks like a budget (> 1000)
      const possibleBudget = numbers.find(n => parseInt(n) > 1000);
      if (possibleBudget) {
        setBudget(possibleBudget);
      }
    }

    // Detect Common Locations
    const knownLocations = ['hyderabad', 'bengaluru', 'bangalore', 'mumbai', 'pune', 'chennai', 'hsr', 'jubilee hills', 'indiranagar', 'koramangala'];
    for (const loc of knownLocations) {
      if (lower.includes(loc)) {
        setLocation(loc);
        break;
      }
    }
  };

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
        
        if (lower.includes('4') || lower.includes('site') || lower.includes('website')) {
          botReply = "Here is the direct link to our official website:\n👉 [BookMyHomez Website](https://www.bookmyhomez.com)\n\nYou can explore full galleries, maps, and virtual tours there!";
          setMessages(prev => [...prev, ...[{ sender: 'bot' as const, text: botReply }]]);
          return;
        }

        if (lower.includes('3') || lower.includes('visit')) {
          setStep('visit_property');
          botReply = "Which property or project name would you like to visit?";
          setMessages(prev => [...prev, ...[{ sender: 'bot' as const, text: botReply }]]);
          return;
        }

        // Smart agent parsing from natural sentence
        parseUserIntent(userText);
        setStep('collect_details');
        botReply = "Got it! Please share your **Full Name and Phone Number** so we can show you the matching properties right away.";

      } else if (step === 'collect_details') {
        const userName = userText;
        setStep('main');

        // Filter matching website properties dynamically
        const matches = INITIAL_PROPERTIES.filter(p => {
          const matchesCat = p.listingType?.toLowerCase() === category.toLowerCase();
          const matchesLoc = !location || p.location?.toLowerCase().includes(location.toLowerCase()) || p.title?.toLowerCase().includes(location.toLowerCase());
          const matchesBhk = !bhk || p.bhk?.toLowerCase().includes(bhk.toLowerCase()) || p.title?.toLowerCase().includes(bhk.toLowerCase());
          return matchesCat || matchesLoc || matchesBhk;
        }).slice(0, 3);

        if (matches.length > 0) {
          botReply = `Thank you ${userName}! Based on your requirements, here are matching properties from our website:\n\n`;
          matches.forEach(p => {
            const propertyLink = `https://www.bookmyhomez.com/?propertyId=${p.id}`;
            botReply += `🏠 **${p.title}**\n📍 Location: ${p.location}\n🛏️ Type: ${p.bhk || 'N/A'}\n💰 Price: ₹${p.price || 'Contact for Price'}\n🔗 [View Property Direct](${propertyLink})\n\n`;
          });
        } else {
          botReply = `Thank you ${userName}! Currently, no exact matches are available for your filters, but our team will curate options for you and reach out shortly.`;
        }
        botReply += "\nHow else can I help you? Choose Buy, Rent, or Property Visit.";

      } else if (step === 'visit_property') {
        setVisitProp(userText);
        setStep('visit_date');
        botReply = "What is your preferred date and time for the visit? (e.g., Tomorrow at 4 PM)";
      } else if (step === 'visit_date') {
        setVisitDate(userText);
        setStep('visit_contact');
        botReply = "Please provide your **Full Name and Phone Number** to finalize the visit schedule.";
      } else if (step === 'visit_contact') {
        setStep('main');
        botReply = `✅ Visit Confirmed! We have scheduled your visit for **${visitProp}** on **${visitDate}**. Our team will call you shortly.\n\nNeed anything else?`;
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
              placeholder="Type your requirements or message..."
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
