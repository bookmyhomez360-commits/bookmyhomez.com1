import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Property } from '../types';
import { NavLink } from './NavLink';
import { optimizeImage, propertyPath, niceArea } from '../seo';

// Home page "Homes available now" strip: real listings (real photos) gliding sideways.
// Pauses on hover/touch/focus and while off-screen. With reduced motion it is a plain
// swipeable row. Fixed card sizes, so nothing jumps while photos load.
interface PropertyShowcaseProps {
  properties: Property[];
  loaded: boolean;
  formatCurrency: (n: number) => string;
  onOpen: (p: Property) => void;
  viewAllHref: string;
  onViewAll: () => void;
}

const Card: React.FC<{ p: Property; formatCurrency: (n: number) => string; onOpen: (p: Property) => void; ghost?: boolean }> = ({ p, formatCurrency, onOpen, ghost }) => {
  const img = (p.images || []).find((i) => typeof i === 'string' && i.startsWith('http')) || '';
  const area = niceArea(p.locality || p.city || '');
  const daily = p.rentType === 'Daily';
  const sale = p.category === 'Buy' || p.category === 'Plots';
  return (
    <NavLink
      href={propertyPath(p.id)}
      onNavigate={() => onOpen(p)}
      className="bmh-show-card group"
      tabIndex={ghost ? -1 : undefined}
      aria-hidden={ghost ? true : undefined}
    >
      <span className="bmh-show-img">
        <img
          src={optimizeImage(img, 480)}
          alt={ghost ? '' : `${p.bhk || ''} ${p.title || ''} in ${area}`.trim()}
          loading="lazy"
          decoding="async"
          width={480}
          height={320}
        />
        <span className="bmh-show-badge">{p.bhk || p.category}</span>
      </span>
      <span className="block p-3">
        <span className="block text-sm font-extrabold text-white truncate">{p.title}</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 truncate">
          <MapPin className="w-3 h-3 shrink-0 text-indigo-400" /> {area}
        </span>
        <span className="block text-sm font-black text-emerald-400 mt-2">
          ₹{formatCurrency(p.price)}
          {!sale && <span className="text-[10px] font-bold text-slate-400"> {daily ? '/ day' : '/ month'}</span>}
        </span>
      </span>
    </NavLink>
  );
};

export const PropertyShowcase: React.FC<PropertyShowcaseProps> = ({ properties, loaded, formatCurrency, onOpen, viewAllHref, onViewAll }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const el = wrapRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (loaded && properties.length === 0) return null;
  const animate = !reduce && properties.length >= 3;
  // seconds per full loop scale with the number of cards, so the speed stays calm
  const duration = Math.max(24, properties.length * 5);

  return (
    <section className="max-w-7xl mx-auto px-4 pt-12" aria-labelledby="bmh-show-h">
      <div className="flex items-end justify-between gap-3 mb-5" data-reveal="">
        <div>
          <h2 id="bmh-show-h" className="text-xl sm:text-2xl font-black text-white">
            Homes available now
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real photos from our current listings</p>
        </div>
        <NavLink
          href={viewAllHref}
          onNavigate={onViewAll}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-400 hover:text-indigo-300"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>
      <div ref={wrapRef} className={`bmh-show ${animate ? 'is-marquee' : 'is-static'}`}>
        {properties.length === 0 ? (
          <div className="bmh-show-track">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="bmh-show-card bmh-show-skel" aria-hidden="true">
                <span className="bmh-show-img" />
                <span className="block p-3 h-[86px]" />
              </span>
            ))}
          </div>
        ) : (
          <div
            className="bmh-show-track"
            style={animate ? ({ animationDuration: `${duration}s`, animationPlayState: onScreen ? undefined : 'paused' } as React.CSSProperties) : undefined}
          >
            {properties.map((p) => (
              <Card key={p.id} p={p} formatCurrency={formatCurrency} onOpen={onOpen} />
            ))}
            {animate && properties.map((p) => (
              <Card key={`dup-${p.id}`} p={p} formatCurrency={formatCurrency} onOpen={onOpen} ghost />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
