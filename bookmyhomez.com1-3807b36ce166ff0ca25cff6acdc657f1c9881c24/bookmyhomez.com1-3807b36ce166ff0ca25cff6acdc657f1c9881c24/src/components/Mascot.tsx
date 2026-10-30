import React, { useEffect, useRef } from 'react';
import bodyImg from '../assets/images/brand/logo-mascot.webp';

// The BookMyHomez logo as a little walking mascot: arms + legs drawn in SVG in the logo's own
// colours (purple with the gold outline) around the real logo artwork on a white card.
//
// The whole figure really walks: after the logo intro it walks in from the left edge across the
// screen to the right corner, waves ("Your Happy Home Partner 👋"), then keeps strolling back and
// forth along a lane just above the bottom bars (featured home strip / call button), idling in
// between (bob, look around, a wave every ~7 s). While the page scrolls it walks in the scroll
// direction (ping-pong at the lane ends). Motion is one requestAnimationFrame loop writing a single
// transform (translate3d + small rotate) — no layout work per frame, no React re-renders.
// Static only when the OS "reduce motion" setting is on. Decorative; tap → rentals.
type Pose = 'walk' | 'wave' | 'idle';

interface MascotProps {
  href: string;
  onNavigate: () => void;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const Mascot: React.FC<MascotProps> = ({ href, onNavigate }) => {
  const laneRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLAnchorElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const lane = laneRef.current;
    const el = rootRef.current;
    const bubble = bubbleRef.current;
    if (!lane || !el || !bubble) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    let pose: Pose = 'idle';
    const setPose = (p: Pose) => {
      if (p === pose) return;
      el.classList.remove(`bmh-masc--${pose}`);
      el.classList.add(`bmh-masc--${p}`);
      pose = p;
    };
    let bubbleOn = false;
    let bubbleRight = false;
    const showBubble = (on: boolean) => {
      if (on === bubbleOn) return;
      bubbleOn = on;
      bubble.classList.toggle('is-on', on);
    };

    // --- geometry (read rarely: on start, resize and every ~1 s; never per frame) ---
    let vw = window.innerWidth;
    let w = el.offsetWidth || 80;
    let minX = 6;
    let maxX = Math.max(minX, vw - w - 6);
    let laneBottom = -1;
    const measure = () => {
      vw = window.innerWidth;
      w = el.offsetWidth || w;
      minX = 6;
      maxX = Math.max(minX, vw - w - 6);
      // keep the lane above any fixed bar along the bottom edge (featured home strip, call button)
      const vh = window.innerHeight;
      const phone = vw <= 640;
      let bottom = phone ? 70 : 88; // the floating "Call me" button sits at the bottom centre
      const nodes = document.querySelectorAll<HTMLElement>('.fixed, [style*="position: fixed"]');
      nodes.forEach((n) => {
        if (n === lane || lane.contains(n) || n.closest('.bmh-lane')) return;
        const r = n.getBoundingClientRect();
        if (r.height <= 0 || r.width <= 0 || r.height > vh * 0.4) return;
        if (r.bottom < vh - 140 || r.top > vh) return;
        // only bars that share horizontal space with the lane matter (all of them on phones)
        bottom = Math.max(bottom, Math.round(vh - r.top + 8));
      });
      if (bottom !== laneBottom) {
        laneBottom = bottom;
        lane.style.setProperty('--lane-bottom', `${bottom}px`);
      }
      // hide (rather than cover things) if the bars ever take up too much of the screen
      lane.classList.toggle('is-hidden', bottom > vh * 0.45);
    };

    // --- reduced motion: static in the right corner ---
    let raf = 0;
    const placeStatic = () => {
      measure();
      setPose('idle');
      showBubble(false);
      el.style.transform = `translate3d(${maxX}px,0,0)`;
    };

    // --- motion state ---
    type Mode = 'wait' | 'enter' | 'hello' | 'idle' | 'stroll' | 'wave' | 'scroll';
    let mode: Mode = 'wait';
    let x = -w - 20; // starts off-screen left
    let target = 0;
    let modeUntil = 0;
    let nextWave = 0;
    let waves = 0;
    let stepPhase = 0; // advances with distance walked → body bob + sway
    let face = 1; // +1 walking right, -1 walking left
    let lean = 0;
    let look = 0;
    let lookPhase = 0;
    let pendingScroll = 0;
    let scrollDir = 1;
    let lastScrollAt = 0;
    let lastY = window.scrollY;
    let lastT = 0;
    let lastMeasure = 0;
    const SPEED = () => (vw <= 640 ? 92 : 120); // px per second, a relaxed walk
    const STEP = () => (vw <= 640 ? 46 : 60); // px per step

    const go = (m: Mode, now: number) => {
      mode = m;
      if (m === 'enter') { setPose('walk'); target = maxX; }
      if (m === 'hello') { setPose('wave'); bubbleRight = x < vw / 2; bubble.classList.toggle('is-right', bubbleRight); showBubble(true); modeUntil = now + 2900; nextWave = modeUntil + rand(6000, 8000); }
      if (m === 'idle') { setPose('idle'); showBubble(false); modeUntil = now + rand(2600, 4200); }
      if (m === 'wave') {
        setPose('wave');
        waves++;
        if (waves % 3 === 0) { bubbleRight = x < vw / 2; bubble.classList.toggle('is-right', bubbleRight); showBubble(true); }
        modeUntil = now + 1700;
        nextWave = now + rand(6000, 8000);
      }
      if (m === 'stroll') {
        setPose('walk');
        showBubble(false);
        const span = maxX - minX;
        let t = rand(minX, maxX);
        let guard = 0;
        while (Math.abs(t - x) < span * 0.35 && guard++ < 8) t = rand(minX, maxX);
        target = t;
      }
      if (m === 'scroll') { setPose('walk'); showBubble(false); }
    };

    const walkToward = (dt: number, speed: number) => {
      const d = target - x;
      const stepPx = Math.min(Math.abs(d), speed * dt);
      x += Math.sign(d) * stepPx;
      if (stepPx > 0) face = Math.sign(d);
      stepPhase += stepPx / STEP();
      return Math.abs(target - x) < 0.5;
    };

    const frame = (now: number) => {
      raf = window.requestAnimationFrame(frame);
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
      lastT = now;
      if (now - lastMeasure > 1000) {
        lastMeasure = now;
        measure();
        if (mode !== 'wait' && mode !== 'enter') x = Math.min(maxX, Math.max(minX, x));
      }

      let walking = false;
      if (mode === 'wait') {
        // walk in once the logo intro overlay has gone
        if (!document.documentElement.classList.contains('bmh-intro-on')) { x = -w - 20; go('enter', now); }
      } else if (mode === 'enter') {
        walking = true;
        if (walkToward(dt, SPEED() * 1.15)) go('hello', now);
      } else if (mode === 'hello' || mode === 'wave') {
        if (now > modeUntil) { showBubble(false); go('idle', now); }
      } else if (mode === 'idle') {
        if (nextWave && now > nextWave) go('wave', now);
        else if (now > modeUntil) go('stroll', now);
      } else if (mode === 'stroll') {
        walking = true;
        if (walkToward(dt, SPEED())) go('idle', now);
      } else if (mode === 'scroll') {
        // walk with the scroll: down → right, up → left, turning around at the lane ends
        const want = pendingScroll * 0.45;
        const cap = 420 * dt;
        const mv = Math.max(-cap, Math.min(cap, want));
        pendingScroll -= mv / 0.45;
        let nx = x + mv * scrollDir;
        if (nx > maxX) { nx = maxX - (nx - maxX); scrollDir = -scrollDir; }
        if (nx < minX) { nx = minX + (minX - nx); scrollDir = -scrollDir; }
        if (Math.abs(nx - x) > 0.01) { face = Math.sign(nx - x); walking = true; }
        stepPhase += Math.abs(nx - x) / STEP();
        x = Math.min(maxX, Math.max(minX, nx));
        if (now - lastScrollAt > 320 && Math.abs(pendingScroll) < 2) { pendingScroll = 0; go('idle', now); nextWave = now + rand(2500, 4000); }
      }

      // body: bob up on every step, sway/tilt with the stride, lean into the walk; idle look-around
      const bob = walking ? Math.abs(Math.sin(stepPhase * Math.PI)) * 7 : 0;
      const sway = walking ? Math.sin(stepPhase * Math.PI) * 3.2 : 0;
      lean += ((walking ? face * 4 : 0) - lean) * Math.min(1, dt * 8);
      if (mode === 'idle') {
        lookPhase += dt;
        look = Math.sin(lookPhase * 1.6) * 5 * (Math.sin(lookPhase * 0.45) > 0.2 ? 1 : 0.25);
      } else {
        look += (0 - look) * Math.min(1, dt * 6);
      }
      el.style.transform = `translate3d(${x.toFixed(1)}px,${(-bob).toFixed(1)}px,0) rotate(${(lean + sway + look).toFixed(2)}deg)`;
    };

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (mq.matches || mode === 'wait' || mode === 'enter') return;
      if (Math.abs(dy) > 600) return; // jumps (page change, anchor) are not walks
      // walk with it, but never run far behind a fast fling
      pendingScroll = Math.max(-260, Math.min(260, pendingScroll + dy));
      lastScrollAt = performance.now();
      if (mode !== 'scroll') go('scroll', lastScrollAt);
    };
    const onResize = () => { measure(); if (mq.matches) placeStatic(); };

    const start = () => {
      window.cancelAnimationFrame(raf);
      raf = 0;
      if (mq.matches) { placeStatic(); return; }
      measure();
      x = -w - 20;
      el.style.transform = `translate3d(${x}px,0,0)`;
      mode = 'wait';
      nextWave = 0;
      lastT = 0;
      raf = window.requestAnimationFrame(frame);
    };
    start();
    const onMq = () => start();
    mq.addEventListener?.('change', onMq);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(raf);
      mq.removeEventListener?.('change', onMq);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={laneRef} className="bmh-lane">
      <a
        ref={rootRef}
        href={href}
        onClick={(e) => {
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          onNavigate();
        }}
        className="bmh-masc bmh-masc--idle"
        aria-label="See flats for rent"
        title="See flats for rent"
      >
        <span ref={bubbleRef} className="bmh-masc-bubble" aria-hidden="true">
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
    </div>
  );
};
