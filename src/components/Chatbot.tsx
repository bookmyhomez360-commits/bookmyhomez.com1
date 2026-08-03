import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css'; // Optional: if you want separate styles

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');

    // Process bot response based on your rules
    setTimeout(() => {
      generateResponse(userMessage);
    }, 500);
  };

  const generateResponse = (userText: string) => {
    const text = userText.toLowerCase();
    let reply = "";

    if (text.includes('buy') || text.includes('rent')) {
      reply = "Great! Let's find the right option for you.\n\n**Step 1:** Please enter your target **Location** (e.g., Area, City).";
    } else if (text.includes('property visit') || text.includes('visit')) {
      reply = "Awesome! Let's schedule your visit.\n\n**Step 1:** Which property or project name would you like to visit?";
    } else if (text.includes('site') || text.includes('website')) {
      reply = "You can explore our full gallery, interactive maps, and virtual tours directly on our main website: [https://bookmyhomez.com](https://bookmyhomez.com).\n\nDo you need help finding anything specific?";
    } else {
      reply = "Thanks for reaching out! To proceed further, please select from our main options:\n- Buy\n- Rent\n- Property Visit\n- Visit Site";
    }

    setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
  };

  return (
    <div className="realestate-chat-widget">
      <button className="chat-toggle-btn" onClick={toggleChat}>
        💬
      </button>

      {isOpen && (
        <div className="chat-box-container">
          <div className="chat-header">
            <span>Real Estate Assistant</span>
            <button className="chat-close-btn" onClick={toggleChat}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
            />
            <button onClick={handleSend}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};
