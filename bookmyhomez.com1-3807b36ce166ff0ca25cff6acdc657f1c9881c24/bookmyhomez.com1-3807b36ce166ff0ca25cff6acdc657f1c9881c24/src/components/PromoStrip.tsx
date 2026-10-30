import React from 'react';

// Slim moving strip under the header: real lines only. Pure CSS marquee (pauses on hover/touch);
// still for reduced motion. The second copy is aria-hidden so screen readers hear it once.
const FORM_URL = 'https://forms.gle/bGpgrHnc1FT4mdmBA';

export const PromoStrip: React.FC = () => {
  const row = (ghost: boolean) => (
    <div className="bmh-strip-row" aria-hidden={ghost || undefined}>
      <span className="bmh-strip-item">🏠 New listings added regularly</span>
      <span className="bmh-strip-sep" aria-hidden="true">✦</span>
      <a className="bmh-strip-item" href={FORM_URL} target="_blank" rel="noopener" tabIndex={ghost ? -1 : 0}>📅 Book a visit</a>
      <span className="bmh-strip-sep" aria-hidden="true">✦</span>
      <a className="bmh-strip-item" href="tel:+919916475749" tabIndex={ghost ? -1 : 0}>📞 Call 9916475749</a>
      <span className="bmh-strip-sep" aria-hidden="true">✦</span>
      <span className="bmh-strip-item">Flats &amp; PGs for rent in Bangalore</span>
      <span className="bmh-strip-sep" aria-hidden="true">✦</span>
    </div>
  );
  return (
    <div className="bmh-strip" role="region" aria-label="BookMyHomez updates">
      <div className="bmh-strip-track">
        {row(false)}
        {row(true)}
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
};
