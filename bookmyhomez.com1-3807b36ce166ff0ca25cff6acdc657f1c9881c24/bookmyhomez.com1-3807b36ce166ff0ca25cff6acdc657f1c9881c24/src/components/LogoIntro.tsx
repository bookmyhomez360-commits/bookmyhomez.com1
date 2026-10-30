import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import markImg from '../assets/images/brand/logo-mark.webp';
import wordImg from '../assets/images/brand/logo-word.webp';
import tagImg from '../assets/images/brand/logo-tag.webp';

// Short branded logo moment: on first load and whenever the visitor moves to another page.
// The BookMyHomez logo (Ammu's exact artwork, split into its own three parts: house + hand + key,
// "BOOK MY HOMEZ", "YOUR HAPPY HOME PARTNER") builds itself up, then the overlay fades away.
// Purely visual: aria-hidden, the page content underneath is already in the HTML; a tap skips it;
// nothing is shown at all for prefers-reduced-motion.
interface LogoIntroProps {
  variant: 'first' | 'nav';
  onDone: () => void;
}

const TIMING = {
  first: { hold: 1150, fade: 260 },
  nav: { hold: 640, fade: 220 },
};

export const LogoIntro: React.FC<LogoIntroProps> = ({ variant, onDone }) => {
  const [leaving, setLeaving] = useState(false);
  const [reduce] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (reduce) {
      onDone();
      return;
    }
    // keep the floating call widget out of the way for this moment
    const root = document.documentElement;
    root.classList.add('bmh-intro-on');
    const t = TIMING[variant];
    const a = window.setTimeout(() => setLeaving(true), t.hold);
    const b = window.setTimeout(onDone, t.hold + t.fade);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
      root.classList.remove('bmh-intro-on');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reduce) return null;

  const skip = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onDone, 160);
  };

  // Rendered on <body> so it sits above every other floating bar of the page.
  return createPortal(
    <div
      className={`bmh-intro bmh-intro--${variant} ${leaving ? 'is-leaving' : ''}`}
      aria-hidden="true"
      onClick={skip}
    >
      <div className="bmh-intro-card">
        <img className="bmh-intro-layer bmh-intro-mark" src={markImg} alt="" width={560} height={517} decoding="async" />
        <img className="bmh-intro-layer bmh-intro-word" src={wordImg} alt="" width={560} height={517} decoding="async" />
        <img className="bmh-intro-layer bmh-intro-tag" src={tagImg} alt="" width={560} height={517} decoding="async" />
        <span className="bmh-intro-shine" />
      </div>
    </div>,
    document.body,
  );
};
