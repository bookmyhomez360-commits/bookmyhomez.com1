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
        {/* Gruhapravesam Toranam */}
        <div className="toranam-container">
          <div className="mango-leaf"></div>
          <div className="marigold-bunch"></div>
          <div className="mango-leaf"></div>
          <div className="marigold-bunch"></div>
          <div className="mango-leaf"></div>
        </div>
        {/* Rich Carved Wooden Panels */}
        <div className="door-panel p-top">
          <div className="carving-pattern"></div>
        </div>
        <div className="door-panel p-bottom">
          <div className="carving-pattern"></div>
        </div>
        <div className="door-handle"></div>
      </div>
      
      {/* Center 3D House Logo Badge */}
      <div className="door-center-badge" onClick={handleOpenDoors}>
        <div className="badge-3d-wrapper">
          <div className="badge-3d-front">
            <div className="badge-house-icon"></div>
          </div>
        </div>
      </div>

      <div className="door right-door" onClick={handleOpenDoors}>
        {/* Gruhapravesam Toranam */}
        <div className="toranam-container">
          <div className="mango-leaf"></div>
          <div className="marigold-bunch"></div>
          <div className="mango-leaf"></div>
          <div className="marigold-bunch"></div>
          <div className="mango-leaf"></div>
        </div>
        {/* Rich Carved Wooden Panels */}
        <div className="door-panel p-top">
          <div className="carving-pattern"></div>
        </div>
        <div className="door-panel p-bottom">
          <div className="carving-pattern"></div>
        </div>
        <div className="door-handle"></div>
      </div>
    </div>
  );
}
