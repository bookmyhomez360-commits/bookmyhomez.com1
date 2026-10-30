import React, { useEffect, useRef, useState } from 'react';
import bodyImg from '../assets/images/brand/logo-mascot.webp';

// The BookMyHomez logo as a little walking mascot: arms + legs drawn in SVG in the logo's own
// colours (purple with the gold outline) around the real logo artwork, shown exactly as it is
// on a white card. It walks in, waves, and walks along the bottom of the
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
        <svg className="bmh-masc-svg" viewBox="0 0 300 345" focusable="false">
          {/* legs (behind the body) */}
          <g className="bmh-leg bmh-leg--l">
            <path className="bmh-limb-o" d="M118 250 C116 274 114 296 110 314" />
            <path className="bmh-limb" d="M118 250 C116 274 114 296 110 314" />
            <path className="bmh-shoe" d="M84 328 C84 312 98 306 112 308 C124 310 130 318 130 328 Z" />
          </g>
          <g className="bmh-leg bmh-leg--r">
            <path className="bmh-limb-o" d="M182 250 C184 274 186 296 190 314" />
            <path className="bmh-limb" d="M182 250 C184 274 186 296 190 314" />
            <path className="bmh-shoe" d="M170 328 C170 318 176 310 188 308 C202 306 216 312 216 328 Z" />
          </g>
          {/* arms */}
          <g className="bmh-arm bmh-arm--l">
            <path className="bmh-limb-o" d="M40 132 C26 148 18 168 14 190" />
            <path className="bmh-limb" d="M40 132 C26 148 18 168 14 190" />
            <circle className="bmh-glove" cx="13" cy="198" r="13" />
          </g>
          <g className="bmh-arm bmh-arm--r">
            <path className="bmh-limb-o" d="M260 132 C274 148 282 168 286 190" />
            <path className="bmh-limb" d="M260 132 C274 148 282 168 286 190" />
            <circle className="bmh-glove" cx="287" cy="198" r="13" />
          </g>
          {/* body = the real BookMyHomez logo, exactly as it is, on a white card */}
          <g className="bmh-body">
            <rect className="bmh-card" x="34" y="20" width="232" height="236" rx="26" />
            <image href={bodyImg} x="44" y="40" width="212" height="196" />
          </g>
        </svg>
      </span>
    </a>
  );
};
