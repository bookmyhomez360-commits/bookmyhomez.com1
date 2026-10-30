import React from 'react';
import { Property } from '../types';

// Moving ticker strip: real current listings (BHK · area · rent) plus the contact line.
// Pure CSS animation; pauses on hover; reduced motion shows it still.
interface TickerProps {
  properties: Property[];
  formatCurrency: (n: number) => string;
}

export const Ticker: React.FC<TickerProps> = ({ properties, formatCurrency }) => {
  const items: string[] = properties.slice(0, 10).map((p) => {
    const sale = p.category === 'Buy' || p.category === 'Plots';
    const per = sale ? '' : p.rentType === 'Daily' ? '/day' : '/month';
    return `${p.bhk || p.category} · ${String(p.title || '').trim()} · ₹${formatCurrency(p.price)}${per}`;
  });
  items.push('Flats & PGs for rent in Bangalore', 'Call / WhatsApp 99164 75749 to book a visit');
  const row = (ghost: boolean) => (
    <div className="bmh-ticker-row" aria-hidden={ghost || undefined}>
      {items.map((t, i) => (
        <span key={i} className="bmh-ticker-item">
          <span className="bmh-ticker-dot" aria-hidden="true">🏠</span>
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <div className="bmh-ticker" role="region" aria-label="Current listings">
      <div className="bmh-ticker-track" style={{ animationDuration: `${Math.max(30, items.length * 4)}s` }}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
};
