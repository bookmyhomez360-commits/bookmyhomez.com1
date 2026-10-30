import React, { useEffect, useRef, useState } from 'react';
import bodyImg from '../assets/images/mascot-body.webp';

// The BookMyHomez logo as a little walking mascot: cartoon arms + legs drawn in SVG
// around the real logo image. It walks in, waves, and walks along the bottom of the
// screen while the page scrolls. Purely decorative (aria-hidden); still for
// prefers-reduced-motion; small on phones; never covers modals (z-40).
type Pose = 'walk' | 'wave' | 'idle';

interface MascotProps {
  href: string;
  onNavigate: () => void;
}

export const Mascot: React.FC<MascotProps> = ({ href, onNavigate }) => {
  const [pose, setPose] = useState<Pose>('walk');
  const [bubble, setBubble] = useState(false);
  const rootRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPose('idle');
      return;
    }
    const timers: number[] = [];
    // walk in → wave + say hello → idle
    timers.push(window.setTimeout(() => { setPose('wave'); setBubble(true); }, 2300));
    timers.push(window.setTimeout(() => { setPose('idle'); }, 5200));
    timers.push(window.setTimeout(() => { setBubble(false); }, 6200));

    // Walk along the bottom while the page scrolls (position follows scroll progress).
    let stopTimer = 0;
    let raf = 0;
    let introDone = false;
    timers.push(window.setTimeout(() => { introDone = true; }, 2300));
    const place = () => {
      raf = 0;
      const el = rootRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty('--masc-x', progress.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(place);
      if (!introDone) return;
      setPose((p) => (p === 'walk' ? p : 'walk'));
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => setPose('idle'), 260);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    place();
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(stopTimer);
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <a
      ref={rootRef}
      href={href}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onNavigate();
      }}
      className={`bmh-masc bmh-masc--${pose}`}
      aria-label="See flats for rent"
      title="See flats for rent"
    >
      <span className={`bmh-masc-bubble ${bubble ? 'is-on' : ''}`} aria-hidden="true">
        Your Happy Home Partner 👋
      </span>
      <span className="bmh-masc-in" aria-hidden="true">
        <svg className="bmh-masc-svg" viewBox="0 0 260 330" focusable="false">
          {/* legs (behind the body) */}
          <g className="bmh-leg bmh-leg--l">
            <path d="M112 236 C110 262 108 284 104 302" />
            <ellipse className="bmh-shoe" cx="94" cy="308" rx="22" ry="11" />
          </g>
          <g className="bmh-leg bmh-leg--r">
            <path d="M152 236 C154 262 156 284 160 302" />
            <ellipse className="bmh-shoe" cx="170" cy="308" rx="22" ry="11" />
          </g>
          {/* arms */}
          <g className="bmh-arm bmh-arm--l">
            <path d="M58 132 C40 146 28 164 22 186" />
            <circle className="bmh-glove" cx="21" cy="192" r="12" />
          </g>
          <g className="bmh-arm bmh-arm--r">
            <path d="M208 120 C226 134 238 152 244 174" />
            <circle className="bmh-glove" cx="245" cy="180" r="12" />
          </g>
          {/* body = the real BookMyHomez logo */}
          <g className="bmh-body">
            <image href={bodyImg} x="27" y="0" width="206" height="260" />
          </g>
        </svg>
      </span>
    </a>
  );
};
