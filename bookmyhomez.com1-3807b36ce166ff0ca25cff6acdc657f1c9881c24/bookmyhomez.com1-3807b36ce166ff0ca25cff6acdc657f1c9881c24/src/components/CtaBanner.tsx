import React from 'react';
import { ArrowRight, CalendarCheck, Phone, Users } from 'lucide-react';

// Call-to-action banner just above the footer (every page). Real facts and the existing links only.
const FORM_URL = 'https://forms.gle/bGpgrHnc1FT4mdmBA';
const WA_GROUP_URL = 'https://chat.whatsapp.com/LcEDpa2Np17E1uc2L0M2kR?s=cl&p=a&mlu=4&ilr=4';

interface CtaBannerProps {
  rentalsHref: string;
  onRentals: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ rentalsHref, onRentals }) => (
  <section className="max-w-7xl mx-auto px-4 pt-6 pb-10" aria-labelledby="bmh-cta-title">
    <div className="bmh-cta">
      <div className="bmh-cta-glow" aria-hidden="true" />
      <div className="bmh-cta-copy">
        <span className="bmh-cta-kicker">Your Happy Home Partner</span>
        <h2 id="bmh-cta-title" className="bmh-cta-title">
          Find your happy home in <span>Bangalore</span>
        </h2>
        <p className="bmh-cta-sub">1BHK, 2BHK &amp; 3BHK flats and PGs for rent. Call or WhatsApp 99164 75749 to book a visit.</p>
      </div>
      <div className="bmh-cta-btns">
        <a
          href={rentalsHref}
          onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onRentals();
          }}
          className="bmh-cta-btn bmh-cta-btn--gold"
        >
          View Rentals <ArrowRight className="w-4 h-4" />
        </a>
        <a href={FORM_URL} target="_blank" rel="noopener" className="bmh-cta-btn">
          <CalendarCheck className="w-4 h-4" /> Book a visit
        </a>
        <a href="tel:+919916475749" className="bmh-cta-btn">
          <Phone className="w-4 h-4" /> Call 9916475749
        </a>
        <a href={WA_GROUP_URL} target="_blank" rel="noopener" className="bmh-cta-btn bmh-cta-btn--wa">
          <Users className="w-4 h-4" /> WhatsApp group
        </a>
      </div>
    </div>
  </section>
);
