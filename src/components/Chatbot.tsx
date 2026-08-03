import React, { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "👋 Hello! Welcome to **BookMyHomez**. How can I help you today? Please choose an option:\n\n- 🏠 Buy\n- 🔑 Rent\n- 📅 Property Visit\n- 🌐 Visit Site",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');

    setTimeout(() => {
      const text = userMessage.toLowerCase();
      let reply = "";
      if (text.includes('buy') || text.includes('rent')) {
        reply = "Great! Let's find the right option for you.\n\n**Step 1:** Please enter your target **Location** (e.g., Area, City).";
      } else if (text.includes('property visit') || text.includes('visit')) {
        reply = "Awesome! Let's schedule your visit.\n\n**Step 1:** Which property or project name would you like to visit?";
      } else if (text.includes('site') || text.includes('website')) {
        reply = "You can explore our full gallery, interactive maps, and virtual tours directly on our main website: [https://bookmyhomez.com](https://bookmyhomez.com).";
      } else {
        reply = "Thanks for reaching out! Please select from our main options:\n- Buy\n- Rent\n- Property Visit\n- Visit Site";
      }
      setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    }, 500);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: 'Segoe UI, sans-serif' }}>
      <button 
        onClick={toggleChat}
        style={{ backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '50%', width: '60px', height: '60px', fontSize: '28px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        💬
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', bottom: '80px', right: '0', width: '350px', height: '500px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 5px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #ddd' }}>
          <div style={{ background: '#075E54', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Real Estate Assistant</span>
            <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#efeae2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.4', background: msg.sender === 'bot' ? '#ffffff' : '#dcf8c6', alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end', color: '#333', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: 'flex', padding: '10px', background: '#f0f0f0', borderTop: '1px solid #ddd' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '20px', outline: 'none', fontSize: '14px' }}
            />
            <button onClick={handleSend} style={{ background: '#075E54', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', marginLeft: '8px', cursor: 'pointer', fontWeight: 'bold' }}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};
