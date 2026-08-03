import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PROPERTIES } from '../data/initialProperties';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: 'Hello! I am your BookMyHomez Assistant. How can I help you find your dream home, rent, or schedule a visit today?' 
    }
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const newMessages = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(newMessages);
    setInput('');

    try {
      // Initialize Gemini AI client (using environment API key or safe fallback)
      const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || '' });

      // Prepare property database context for AI
      const propertyContext = JSON.stringify(INITIAL_PROPERTIES.map(p => ({
        id: p.id,
        title: p.title,
        location: p.location,
        price: p.price,
        type: p.bhk || p.type,
        listingType: p.listingType
      })));

      const prompt = `
        You are an intelligent, friendly Real Estate AI Assistant for BookMyHomez (https://www.bookmyhomez.com).
        Your goal is to help users find suitable properties, schedule property visits, or guide them.
        Here is our current available properties list in JSON format:
        ${propertyContext}

        Rules:
        1. Speak strictly in English. Keep it professional, polite, and helpful using emojis and bullet points.
        2. If the user asks for properties (Buy/Rent) with a location, BHK, or budget, search the provided database list and recommend matching properties. Include the direct link format for each match using: https://www.bookmyhomez.com/?propertyId=[id]
        3. If the user wants to schedule a property visit, ask for their preferred date, time, full name, and phone number.
        4. If no exact match is found, politely state that our team will curate options for them soon.

        Conversation History / User Message:
        "${userText}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const botReply = response.text || "I am here to help you find properties on BookMyHomez!";
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);

    } catch (error) {
      // Fallback response if API key is missing or encounters network issue
      let fallbackReply = "I can help you Buy, Rent, or Book a Property Visit on BookMyHomez! Please let me know your preferred location and requirements.";
      
      const lower = userText.toLowerCase();
      if (lower.includes('hyderabad') || lower.includes('bengaluru') || lower.includes('mumbai') || lower.includes('rent') || lower.includes('buy')) {
        const matches = INITIAL_PROPERTIES.slice(0, 2);
        fallbackReply = "Here are some matching properties from our website:\n\n";
        matches.forEach(p => {
          fallbackReply += `🏠 **${p.title}**\n📍 Location: ${p.location}\n💰 Price: ₹${p.price}\n🔗 https://www.bookmyhomez.com/?propertyId=${p.id}\n\n`;
        });
      }

      setMessages(prev => [...prev, { sender: 'bot', text: fallbackReply }]);
    }
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
                          const cleanUrl = line.replace('https://', '').trim();
                          return (
                            <div key={i} className="mt-1">
                              <a href={line.trim()} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-semibold hover:text-indigo-300">
                                View Property Direct 🔗
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
              placeholder="Ask anything about properties..."
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
