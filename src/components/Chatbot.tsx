import React, { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

interface UserData {
  intent?: 'buy' | 'rent' | 'visit' | 'site';
  location?: string;
  propertyType?: string;
  budget?: string;
  name?: string;
  phone?: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "👋 Hello! Welcome to BookMyHomez. How can I help you today?\n\n- Buy\n- Rent\n- Property Visit\n- Visit Site",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<'MENU' | 'COLLECTING' | 'VISIT_PROPERTY' | 'VISIT_DATETIME' | 'VISIT_CONTACT'>('MENU');
  const [userData, setUserData] = useState<UserData>({});
  
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
      processSmartResponse(userMessage);
    }, 500);
  };

  const processSmartResponse = (text: string) => {
    const lower = text.toLowerCase();
    let reply = "";

    if (step === 'MENU') {
      if (lower.includes('buy') || lower.includes('rent') || lower.includes('konali') || lower.includes('bhk') || lower.includes('villa') || lower.includes('plot')) {
        const intent = lower.includes('rent') ? 'rent' : 'buy';
        setUserData({ ...userData, intent });
        setStep('COLLECTING');
        reply = `Great! Let's find your ${intent.toUpperCase()} property.\n\nStep 1: Please enter your target Location (e.g., Area, City).`;
      } 
      else if (lower.includes('property visit') || lower.includes('visit') || lower.includes('chudali')) {
        setStep('VISIT_PROPERTY');
        reply = "Awesome! Which property or project name would you like to visit?";
      } 
      else if (lower.includes('site') || lower.includes('website')) {
        reply = "You can explore our full gallery, interactive maps, and virtual tours directly on our main website: https://bookmyhomez.com";
      } 
      else {
        reply = "Please select from our main options:\n- Buy\n- Rent\n- Property Visit\n- Visit Site";
      }
    } 
    else if (step === 'COLLECTING') {
      if (!userData.location) {
        setUserData({ ...userData, location: text });
        reply = `Step 2: What is your preferred Property Type? (e.g., 1BHK, 2BHK, 3BHK, Villa, Plot).`;
      } else if (!userData.propertyType) {
        setUserData({ ...userData, propertyType: text });
        reply = `Step 3: What is your Budget range?`;
      } else if (!userData.budget) {
        setUserData({ ...userData, budget: text });
        reply = `Step 4: Please provide your Name and Phone Number so our team can share matching properties.`;
      } else if (!userData.phone) {
        setUserData({ ...userData, phone: text });
        setStep('MENU');
        reply = `✅ Thank you! We have received your requirements.\n\nOur team will curate the best options and call you shortly at ${text}!`;
      }
    }
    else if (step === 'VISIT_PROPERTY') {
      setUserData({ ...userData, location: text });
      setStep('VISIT_DATETIME');
      reply = `Great choice! What is your preferred Date & Time for the visit?`;
    }
    else if (step === 'VISIT_DATETIME') {
      setUserData({ ...userData, budget: text });
      setStep('VISIT_CONTACT');
      reply = `Please share your Full Name and Phone Number to confirm the appointment.`;
    }
    else if (step === 'VISIT_CONTACT') {
      setStep('MENU');
      reply = `🎉 Appointment Confirmed!\n\nOur team will reach out to you shortly. Thank you for choosing BookMyHomez!`;
    }

    setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999, fontFamily: 'Segoe UI, sans-serif' }}>
      <button 
        onClick={toggleChat}
        style={{ backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '50%', width: '60px', height: '60px', fontSize: '28px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        💬
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', bottom: '80px', right: '0', width: '350px', height: '500px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 5px 25px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #ccc', zIndex: 99999 }}>
          
          {/* Header */}
          <div style={{ background: '#075E54', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>BookMyHomez Assistant</span>
            <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#efeae2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.4', background: msg.sender === 'bot' ? '#ffffff' : '#dcf8c6', alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end', color: '#333', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ display: 'flex', padding: '10px', background: '#ffffff', borderTop: '1px solid #ddd', alignItems: 'center' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here..."
              style={{ flex: 1, padding: '10px 14px', border: '1px solid #bbb', borderRadius: '20px', outline: 'none', fontSize: '14px', background: '#fff', color: '#333' }}
            />
            <button onClick={handleSend} style={{ background: '#075E54', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', minWidth: '40px', marginLeft: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➤</button>
          </div>

        </div>
      )}
    </div>
  );
};
