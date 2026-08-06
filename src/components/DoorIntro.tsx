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
        <div className="door-panel-design"></div>
        <div className="door-handle left-handle"></div>
      </div>
      
      {/* Center Round Logo Badge */}
      <div className="door-center-badge" onClick={handleOpenDoors}>
        <div className="logo-circle">
          {/* Replace this with your actual logo image path if hosted, or using public asset */}
          <img src="/logo.png" alt="BookMyHomez" onError={(e)=>{
            // Fallback if local logo.png is not found
            (e.target as HTMLElement).style.display = 'none';
          }} />
          <div className="fallback-logo-text">BMH</div>
        </div>
      </div>

      <div className="door right-door" onClick={handleOpenDoors}>
        <div className="door-panel-design"></div>
        <div className="door-handle right-handle"></div>
      </div>
    </div>
  );
}
