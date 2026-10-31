import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import markImg from '../assets/images/brand/logo-mark.webp';
import wordImg from '../assets/images/brand/logo-word.webp';
import tagImg from '../assets/images/brand/logo-tag.webp';

// Short branded logo moment.
// - First load: the logo splash is already in the HTML (index.html, #bmh-splash) and painted with
//   the very first frame, so there is no flash of the plain crawlable list. This component just
//   takes that splash over: once the app has drawn the real page it holds the logo until ~1 s after
//   the page started loading (at least 250 ms after the app is up) and fades it out. ONE logo moment.
// - Page changes ('nav'): the logo (Ammu's exact artwork in its three parts) builds itself up quickly.
// Purely visual: aria-hidden; a tap skips it; nothing is shown for prefers-reduced-motion.
interface LogoIntroProps {
  variant: 'first' | 'nav';
  onDone: () => void;
}

const TIMING = {
  first: { hold: 1000, fade: 260 },
  nav: { hold: 640, fade: 220 },
};

declare global {
  interface Window {
    __bmhHideSplash?: () => void;
  }
}

export const LogoIntro: React.FC<LogoIntroProps> = ({ variant, onDone }) => {
  const [leaving, setLeaving] = useState(false);
  const [reduce] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [staticSplash] = useState(
    () => variant === 'first' && typeof document !== 'undefined' && !!document.getElementById('bmh-splash'),
  );

  useEffect(() => {
    if (staticSplash) {
      const el = document.getElementById('bmh-splash');
      let done = false;
      const timers: number[] = [];
      const finish = () => {
        if (done) return;
        done = true;
        window.__bmhHideSplash?.();
        timers.push(window.setTimeout(onDone, TIMING.first.fade));
      };
      el?.addEventListener('click', finish, { once: true });
      // wait for the browser to actually paint the app underneath before uncovering it
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const sinceStart = performance.now();
          const wait = reduce ? 0 : Math.max(250, TIMING.first.hold - sinceStart);
          timers.push(window.setTimeout(finish, wait));
        }),
      );
      return () => {
        cancelAnimationFrame(raf);
        timers.forEach((t) => window.clearTimeout(t));
        el?.removeEventListener('click', finish);
      };
    }
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

  if (staticSplash || reduce) return null;

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
