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
        <div className="door-content">
          {/* Text box poyi direct ga Golden Key */}
          <div className="golden-key-container" title="Tap to Open">
            <div className="golden-key"></div>
          </div>
        </div>
      </div>
      <div className="door right-door" onClick={handleOpenDoors}></div>
    </div>
  );
}
