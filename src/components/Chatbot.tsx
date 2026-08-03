import React, { useState } from 'react';
import './Chatbot.css';

export default function Chatbot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot'; isHtml?: boolean }>>([
    { text: "Hello! Welcome to Bookmyhomez. How can I help you find your dream property today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const toggleChat = () => setChatOpen(!chatOpen);

  const sendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    // యూజర్ మెసేజ్ యాడ్ చేయడం
    const newMessages = [...messages, { text: messageText, sender: 'user' as const }];
    setMessages(newMessages);
    if (!textToSend) setInput('');

    try {
      // ఒకవేళ Railway బ్యాకెండ్ లైవ్ URL ఉంటే ఇక్కడ ఇవ్వండి లేదా '/api/chat' వాడండి
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });
      const data = await response.json();

      let botResponses = [];
      if (data.reply) {
        botResponses.push({ text: data.reply, sender: 'bot' as const });
      }
      
      // ప్రాపర్టీ కార్డ్స్ ఉంటే వాటిని HTML రూపంలో యాడ్ చేయడం
      if (data.properties && data.properties.length > 0) {
        data.properties.forEach((prop: any) => {
          const cardHtml = `
            <div class="bmh-property-card">
              <img src="${prop.image}" alt="${prop.title}" />
              <strong>${prop.title}</strong><br/>
              <span>${prop.configuration} | ₹${prop.price}</span><br/>
            </div>
          `;
          botResponses.push({ text: cardHtml, sender: 'bot' as const, isHtml: true });
        });
      }

      setMessages(prev => [...prev, ...botResponses]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Sorry, something went wrong.", sender: 'bot' }]);
    }
  };

  return (
    <div id="bmh-chat-container">
      <button id="bmh-chat-toggle" onClick={toggleChat}>💬 Chat with us</button>

      {chatOpen && (
        <div id="bmh-chat-window">
          <div className="bmh-chat-header">
            <span>Bookmyhomez Assistant</span>
            <button onClick={toggleChat}>X</button>
          </div>
          
          <div id="bmh-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`bmh-message bmh-${msg.sender}`}>
                {msg.isHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                  msg.text
                )}
              </div>
            ))}
          </div>

          <div id="bmh-quick-replies">
            <button onClick={() => sendMessage('Buy')}>Buy</button>
            <button onClick={() => sendMessage('Rent')}>Rent</button>
            <button onClick={() => sendMessage('Short Stay')}>Short Stay</button>
            <button onClick={() => sendMessage('Visit a Site')}>Visit a Site</button>
          </div>

          <div className="bmh-chat-input-area">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              placeholder="Type your requirement..." 
            />
            <button onClick={() => sendMessage()}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
