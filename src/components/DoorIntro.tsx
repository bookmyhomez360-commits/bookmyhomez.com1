import React, { useState } from 'react';
import './DoorIntro.css';

export default function DoorIntro({ onEnter }: { onEnter: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const handleOpenDoors = () => {
    setIsOpen(true);
    setIsFading(true);
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <div className={`door-container ${isOpen ? 'open' : ''} ${isFading ? 'fade-out' : ''}`}>
      <div className="door left-door" onClick={handleOpenDoors}>
        <div className="door-knocker left-knocker"></div>
      </div>
      
      {/* Center Circle with Your Official BookMyHomez Logo */}
      <div className="door-center-badge" onClick={handleOpenDoors}>
        <div className="logo-circle">
          <img src="/logo.png" alt="BookMyHomez" onError={(e) => {
            // Fallback to text if local logo image is not found
            const target = e.target as HTMLElement;
            target.style.display = 'none';
          }} />
          <div className="fallback-text">BMH</div>
        </div>
      </div>

      <div className="door right-door" onClick={handleOpenDoors}>
        <div className="door-knocker right-knocker"></div>
      </div>
    </div>
  );
}
