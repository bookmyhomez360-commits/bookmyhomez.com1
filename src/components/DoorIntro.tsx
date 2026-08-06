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
        {/* Door Carvings/Decorations in Brown */}
        <div className="door-carving top-carving">
          <div className="carving-house"></div>
          <div className="carving-flower"></div>
        </div>
        <div className="door-carving bottom-carving">
          <div className="carving-flower"></div>
        </div>
        <div className="door-handle"></div>
      </div>
      
      {/* Center Logo/Badge */}
      <div className="door-center-badge" onClick={handleOpenDoors}>
        <div className="logo-circle">
          <div className="center-logo-icon"></div>
        </div>
      </div>

      <div className="door right-door" onClick={handleOpenDoors}>
        {/* Door Carvings/Decorations in Brown */}
        <div className="door-carving top-carving">
          <div className="carving-house"></div>
          <div className="carving-flower"></div>
        </div>
        <div className="door-carving bottom-carving">
          <div className="carving-flower"></div>
        </div>
        <div className="door-handle"></div>
      </div>
    </div>
  );
}
