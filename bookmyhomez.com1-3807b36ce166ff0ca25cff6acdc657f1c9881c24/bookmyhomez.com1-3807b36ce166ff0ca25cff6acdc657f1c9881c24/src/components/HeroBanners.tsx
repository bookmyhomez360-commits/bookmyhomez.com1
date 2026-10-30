import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarCheck, Phone, Users } from 'lucide-react';
import { Property } from '../types';
import { optimizeImage } from '../seo';

// Home hero banners: 4 auto-sliding slides (swipe on phones, dots, ~4.5 s each, pauses on touch/hover
// and while off-screen). Backgrounds are the site's own listing photos (from the live listings);
// the words are real HTML and only state real facts — no offers, prices, counts or ratings.
// Fixed height box → no layout shift while photos load (a brand-colour gradient shows first).
const FORM_URL = 'https://forms.gle/bGpgrHnc1FT4mdmBA';
const WA_GROUP_URL = 'https://chat.whatsapp.com/LcEDpa2Np17E1uc2L0M2kR?s=cl&p=a&mlu=4&ilr=4';
const SLIDE_MS = 4600;

interface HeroBannersProps {
  properties: Property[];
  rentalsHref: string;
  onRentals: () => void;
}

type Slide = {
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
  kind: 'rentals' | 'form' | 'call' | 'group';
};

const SLIDES: Slide[] = [
  { kicker: 'BookMyHomez', title: 'Flats & PGs for Rent in Bangalore', sub: '1BHK, 2BHK & 3BHK flats', cta: 'View Rentals', href: '/rentals', icon: <ArrowRight className="w-4 h-4" />, kind: 'rentals' },
  { kicker: 'Your Happy Home Partner', title: 'Find your happy home', sub: 'Fill a short form and our team will contact you', cta: 'Book a visit', href: FORM_URL, icon: <CalendarCheck className="w-4 h-4" />, kind: 'form' },
  { kicker: 'Talk to us', title: 'Questions about a home?', sub: 'Call us about any home on BookMyHomez', cta: 'Call 9916475749', href: 'tel:+919916475749', icon: <Phone className="w-4 h-4" />, kind: 'call' },
  { kicker: 'WhatsApp group', title: 'Join our WhatsApp group for new listings', sub: 'New homes shared in the group', cta: 'Join the group', href: WA_GROUP_URL, icon: <Users className="w-4 h-4" />, kind: 'group' },
];

export const HeroBanners: React.FC<HeroBannersProps> = ({ properties, rentalsHref, onRentals }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [reduce, setReduce] = useState(false);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const touch = useRef<{ x: number; y: number; axis: '' | 'x' | 'y'; dx: number } | null>(null);
  const [introOn, setIntroOn] = useState(true);

  const photos = properties
    .map((p) => (p.images || []).find((x) => typeof x === 'string' && x.startsWith('http')) || '')
    .filter(Boolean)
    .slice(0, 8);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onMq = () => setReduce(mq.matches);
    mq.addEventListener?.('change', onMq);
    // start the slide clock only after the logo intro overlay has gone (so slide 1 is seen)
    const root = document.documentElement;
    const syncIntro = () => setIntroOn(root.classList.contains('bmh-intro-on'));
    syncIntro();
    const mo = new MutationObserver(syncIntro);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    const el = ref.current;
    let io: IntersectionObserver | null = null;
    if (el && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
      io.observe(el);
    }
    return () => {
      mq.removeEventListener?.('change', onMq);
      io?.disconnect();
      mo.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduce || paused || dragging || !onScreen || introOn) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, dragging, onScreen, reduce, introOn]);

  const go = (d: number) => setIndex((i) => (i + d + SLIDES.length) % SLIDES.length);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, axis: '', dx: 0 };
    setPaused(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = touch.current;
    if (!s) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (!s.axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (s.axis === 'x') {
      s.dx = dx;
      setDragging(true);
      setDrag(dx);
    }
  };
  const onTouchEnd = () => {
    const s = touch.current;
    touch.current = null;
    if (s?.axis === 'x') {
      const w = ref.current?.offsetWidth || 360;
      if (Math.abs(s.dx) > Math.min(60, w * 0.18)) go(s.dx < 0 ? 1 : -1);
    }
    setDrag(0);
    setDragging(false);
    // resume auto-slide shortly after the finger lifts
    window.setTimeout(() => setPaused(false), 1200);
  };

  return (
    <section
      ref={ref}
      className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6"
      aria-roledescription="carousel"
      aria-label="BookMyHomez banners"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="bmh-hero" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
        <div
          className={`bmh-hero-track ${dragging ? 'is-dragging' : ''}`}
          style={{ transform: `translate3d(calc(${-index * 100}% + ${drag}px),0,0)` }}
        >
          {SLIDES.map((s, i) => {
            const img = photos.length ? photos[i % photos.length] : '';
            const active = i === index;
            const linkProps =
              s.kind === 'rentals'
                ? {
                    href: rentalsHref,
                    onClick: (e: React.MouseEvent) => {
                      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                      e.preventDefault();
                      onRentals();
                    },
                  }
                : s.kind === 'call'
                  ? { href: s.href }
                  : { href: s.href, target: '_blank', rel: 'noopener' };
            return (
              <div
                key={s.kind}
                className={`bmh-hero-slide bmh-hero-slide--${s.kind} ${active ? 'is-active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${SLIDES.length}`}
                aria-hidden={!active}
              >
                {img && (
                  <img
                    src={optimizeImage(img, 1200)}
                    alt={`Rental home listed on BookMyHomez, Bangalore`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    width={1200}
                    height={520}
                    onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
                  />
                )}
                <div className="bmh-hero-shade" />
                <div className="bmh-hero-copy">
                  <span className="bmh-hero-kicker">{s.kicker}</span>
                  <p className="bmh-hero-title">{s.title}</p>
                  <p className="bmh-hero-sub">{s.sub}</p>
                  <a {...linkProps} tabIndex={active ? 0 : -1} className="bmh-hero-btn">
                    {s.icon}
                    <span>{s.cta}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bmh-hero-dots">
          {SLIDES.map((s, i) => (
            <button
              key={s.kind}
              type="button"
              className={i === index ? 'is-on' : ''}
              onClick={() => setIndex(i)}
              aria-label={`Show banner ${i + 1}`}
              aria-current={i === index}
            >
              <span style={i === index && !reduce && !paused && !introOn ? { animationDuration: `${SLIDE_MS}ms` } : undefined} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
