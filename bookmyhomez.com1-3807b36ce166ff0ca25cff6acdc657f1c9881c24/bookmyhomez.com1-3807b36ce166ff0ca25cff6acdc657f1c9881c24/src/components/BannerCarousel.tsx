import React, { useEffect, useRef, useState } from 'react';
import { Phone, MessageCircle, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Property } from '../types';
import { optimizeImage, imageSrcSet, propertyPath } from '../seo';

// Sliding banner carousel on the home page: real listing photos with short, factual
// call-to-action lines (no invented offers or prices). Auto-slides every few seconds,
// pauses on hover/focus and while off-screen, manual arrows + dots, still for reduced motion.
const LINES: { kicker: string; title: string }[] = [
  { kicker: 'BookMyHomez', title: 'Flats & PGs for rent in Bangalore' },
  { kicker: 'Real photos', title: 'See the actual home before you visit' },
  { kicker: 'Book a visit', title: 'Call or WhatsApp 99164 75749' },
  { kicker: 'Bangalore', title: '1BHK, 2BHK & 3BHK homes for rent' },
];

interface BannerCarouselProps {
  properties: Property[];
  formatCurrency: (n: number) => string;
  onOpen: (p: Property) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ properties, formatCurrency, onOpen }) => {
  const slides = properties.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [reduce, setReduce] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || paused || !onScreen || slides.length < 2) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), 4200);
    return () => window.clearTimeout(t);
  }, [index, paused, onScreen, reduce, slides.length]);

  if (slides.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 pt-10" aria-hidden="true">
        <div className="bmh-banner bmh-banner-skel" />
      </section>
    );
  }

  const go = (d: number) => setIndex((i) => (i + d + slides.length) % slides.length);

  return (
    <section
      ref={ref}
      className="max-w-7xl mx-auto px-4 pt-10"
      aria-roledescription="carousel"
      aria-label="Featured homes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="bmh-banner">
        <div className="bmh-banner-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((p, i) => {
            const line = LINES[i % LINES.length];
            const img = (p.images || []).find((x) => typeof x === 'string' && x.startsWith('http')) || '';
            const sale = p.category === 'Buy' || p.category === 'Plots';
            return (
              <div
                key={p.id}
                className={`bmh-banner-slide ${i === index ? 'is-active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}`}
                aria-hidden={i !== index}
              >
                <img
                  src={optimizeImage(img, 1200)}
                  srcSet={imageSrcSet(img)}
                  sizes="100vw"
                  alt={`${String(p.title || '').trim()}${p.bhk ? ` – ${p.bhk}` : ''} for rent, listed on BookMyHomez`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  width={1200}
                  height={520}
                />
                <div className="bmh-banner-shade" />
                <div className="bmh-banner-copy">
                  <span className="bmh-banner-kicker">{line.kicker}</span>
                  <p className="bmh-banner-title">{line.title}</p>
                  <a
                    href={propertyPath(p.id)}
                    tabIndex={i === index ? 0 : -1}
                    onClick={(e) => {
                      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                      e.preventDefault();
                      onOpen(p);
                    }}
                    className="bmh-banner-home"
                  >
                    <Home className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {p.bhk ? `${p.bhk} · ` : ''}{String(p.title || '').trim()} · ₹{formatCurrency(p.price)}
                      {!sale ? (p.rentType === 'Daily' ? '/day' : '/month') : ''}
                    </span>
                  </a>
                  <div className="flex gap-2 mt-3">
                    <a href="tel:+919916475749" tabIndex={i === index ? 0 : -1} className="bmh-banner-btn bmh-banner-btn--call">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <a href="https://wa.me/919916475749" target="_blank" rel="noopener" tabIndex={i === index ? 0 : -1} className="bmh-banner-btn bmh-banner-btn--wa">
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {slides.length > 1 && (
          <>
            <button type="button" className="bmh-banner-arrow bmh-banner-arrow--l" onClick={() => go(-1)} aria-label="Previous banner">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" className="bmh-banner-arrow bmh-banner-arrow--r" onClick={() => go(1)} aria-label="Next banner">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="bmh-banner-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === index ? 'is-on' : ''}
                  onClick={() => setIndex(i)}
                  aria-label={`Show banner ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
