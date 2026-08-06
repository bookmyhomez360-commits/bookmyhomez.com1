import React, { useState } from 'react';
import './DoorIntro.css'; // CSS file kosam

export default function DoorIntro({ onEnter }: { onEnter: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const handleOpenDoors = () => {
    setIsOpen(true);
    setIsFading(true);
    setTimeout(() => {
      onEnter(); // Door open ayyaka main website chupinchadaniki
    }, 1500);
  };

  return (
    <div className={`door-container ${isOpen ? 'open' : ''} ${isFading ? 'fade-out' : ''}`}>
      <div className="door left-door" onClick={handleOpenDoors}>
        <div className="door-content">
          <div className="key-banner">
            <div className="golden-key"></div>
            <span className="tap-text">TAP ON DOOR</span>
          </div>
        </div>
      </div>
      <div className="door right-door" onClick={handleOpenDoors}></div>
    </div>
  );
}
