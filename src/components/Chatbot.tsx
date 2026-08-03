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
      text: "👋 Hello! Welcome to BookMyHomez. How can I help you today? (Buy / Rent / Property Visit / Visit Site)",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
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
      processAIAgentResponse(userMessage);
    }, 500);
  };

  const processAIAgentResponse = (text: string) => {
    const lower = text.toLowerCase();
    let currentData = { ...userData };

    // 1. Detect Intent if not set
    if (!currentData.intent) {
      if (lower.includes('rent')) currentData.intent = 'rent';
      else if (lower.includes('buy') || lower.includes('konali') || lower.includes('purchase')) currentData.intent = 'buy';
      else if (lower.includes('visit') || lower.includes('chudali')) currentData.intent = 'visit';
      else if (lower.includes('site') || lower.includes('website')) currentData.intent = 'site';
    }

    // 2. Extract Phone Number (Any 6 to 12 digit number or sequence)
    const phoneMatch = text.match(/\d{6,}/);
    if (phoneMatch) {
      currentData.phone = phoneMatch[0];
      // If user typed name and phone together like "ammu, 123456789"
      const parts = text.split(',').map(p => p.trim());
      if (parts.length > 1) {
        currentData.name = parts[0];
      }
    } else if (currentData.phone && !currentData.name) {
      currentData.name = text;
    }

    // 3. Extract BHK
    const bhkMatch = lower.match(/(\d\s*bhk|1bhk|2bhk|3bhk|4bhk|villa|plot)/i);
    if (bhkMatch) {
      currentData.propertyType = bhkMatch[0].toUpperCase();
    }

    // 4. Extract Budget
    const budgetMatch = lower.match(/(rs\.?|inr)?\s*(\d+[\d,]*\s*(k|lakhs?|rs)?)/i);
    if (budgetMatch && (lower.includes('lakh') || lower.includes('rs') || lower.includes('k') || /\d{4,}/.test(lower)) && !phoneMatch) {
      currentData.budget = budgetMatch[0];
    }

    // 5. Extract Location
    if (text.includes(',') && !phoneMatch) {
      const parts = text.split(',').map(p => p.trim());
      if (parts[0] && !parts[0].toLowerCase().includes('bhk') && !parts[0].toLowerCase().includes('buy')) {
        currentData.location = parts[0];
      }
    } else if (!currentData.location && !currentData.intent && text.length > 2) {
      currentData.location = text;
    } else if (currentData.intent && !currentData.location && !bhkMatch && !budgetMatch && !phoneMatch && text.length > 2) {
      currentData.location = text;
    }

    setUserData(currentData);

    // 6. AI Agent Decision Flow
    let reply = "";

    if (currentData.intent === 'site') {
      reply = "You can explore our full gallery, interactive maps, and virtual tours directly on our main website: https://bookmyhomez.com";
    } else if (currentData.intent === 'visit') {
      if (!currentData.location) {
        reply = "Awesome! Which property or project name would you like to visit?";
      } else if (!currentData.budget) {
        reply = `Got it for ${currentData.location}. What is your preferred Date & Time for the visit?`;
      } else if (!currentData.phone) {
        reply = "Please share your Full Name and Phone Number to confirm the appointment.";
      } else {
        reply = `🎉 Appointment Confirmed for ${currentData.name || 'Client'} (${currentData.phone})! Our team will reach out to you shortly.`;
        setUserData({});
      }
    } else {
      // Buy / Rent Flow
      if (!currentData.intent) {
        reply = "Welcome to BookMyHomez! Are you looking to **Buy** or **Rent** a property?";
      } else if (!currentData.location) {
        reply = `Great! Let's find your ${currentData.intent.toUpperCase()} property. Which **Location** or area are you looking into?`;
      } else if (!currentData.propertyType) {
        reply = `Noted location: **${currentData.location}**. What is your preferred **Property Type** (e.g., 1BHK, 2BHK, 3BHK, Villa)?`;
      } else if (!currentData.budget) {
        reply = `Got it (**${currentData.propertyType}** in **${currentData.location}**). What is your **Budget** range?`;
      } else if (!currentData.phone) {
        reply = `Almost done! Please share your **Name and Phone Number** so our team can send matching properties directly to you.`;
      } else {
        reply = `✅ Thank you ${currentData.name || ''}! We have all your details:\n- Intent: ${currentData.intent.toUpperCase()}\n- Location: ${currentData.location}\n- Type: ${currentData.propertyType}\n- Budget: ${currentData.budget}\n\nOur team is curating matching properties and will call you at **${currentData.phone}** shortly!`;
        setUserData({}); // Reset after completion
      }
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
          
          <div style={{ background: '#075E54', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>BookMyHomez Assistant</span>
            <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#efeae2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.4', background: msg.sender === 'bot' ? '#ffffff' : '#dcf8c6', alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end', color: '#333', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

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
