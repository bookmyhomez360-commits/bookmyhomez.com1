import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi! Mee BookMyHomez assistant ni. Property ID chepte details & link isthanu!' }
  ]);

  const propertyLinks: Record<string, string> = {
    "1785042100498": "https://www.bookmyhomez.com/?propertyId=1785042100498",
    "1785044344797": "https://www.bookmyhomez.com/?propertyId=1785044344797",
    "1785141027798": "https://www.bookmyhomez.com/?propertyId=1785141027798",
    "1785151068703": "https://www.bookmyhomez.com/?propertyId=1785151068703",
    "1785154199773": "https://www.bookmyhomez.com/?propertyId=1785154199773",
    "1785167105262": "https://www.bookmyhomez.com/?propertyId=1785167105262",
    "1785330116104": "https://www.bookmyhomez.com/?propertyId=1785330116104",
    "1785330531538": "https://www.bookmyhomez.com/?propertyId=1785330531538",
    "1785330932376": "https://www.bookmyhomez.com/?propertyId=1785330932376",
    "1785331458944": "https://www.bookmyhomez.com/?propertyId=1785331458944",
    "1785331759166": "https://www.bookmyhomez.com/?propertyId=1785331759166",
    "1785332617192": "https://www.bookmyhomez.com/?propertyId=1785332617192",
    "1785333197250": "https://www.bookmyhomez.com/?propertyId=1785333197250",
    "1785407237433": "https://www.bookmyhomez.com/?propertyId=1785407237433",
    "1785577785874": "https://www.bookmyhomez.com/?propertyId=1785577785874",
    "1785220950989": "https://www.bookmyhomez.com/?propertyId=1785220950989"
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const newMessages = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      let botReply = "Nenu aa property ID gurthu pattaledu. Dayachesi sariyna ID ivvandi.";
      
      const foundId = Object.keys(propertyLinks).find(id => userText.includes(id));
      
      if (foundId) {
        botReply = `Idiగోandi idi mee property direct link: ${propertyLinks[foundId]}`;
      } else if (userText.toLowerCase().includes('hi') || userText.toLowerCase().includes('hello')) {
        botReply = "Hello! Mee ki kavalsina property ID ikkada type cheyandi.";
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
        <div className="w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[450px] overflow-hidden">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> BookMyHomez Bot
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}>
                  {msg.text}
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
              placeholder="Property ID type cheyandi..."
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
