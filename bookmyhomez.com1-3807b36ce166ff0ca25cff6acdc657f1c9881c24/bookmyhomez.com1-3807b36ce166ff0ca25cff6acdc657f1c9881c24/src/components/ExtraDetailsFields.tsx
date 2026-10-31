import React from 'react';

// Optional listing details (Ammu, Oct 31 2026): maintenance, floor, parking, preferred tenant.
// All optional — leave blank and nothing shows on the property page.
export interface ExtraDetails {
  maintenance?: string;
  floor?: string;
  totalFloors?: string;
  parking?: string;
  preferredTenant?: string;
}

export const EXTRA_KEYS: (keyof ExtraDetails)[] = ['maintenance', 'floor', 'totalFloors', 'parking', 'preferredTenant'];

// keep only the filled-in extras (so blank fields never get written as "")
export function filledExtras(d: ExtraDetails): ExtraDetails {
  const out: ExtraDetails = {};
  EXTRA_KEYS.forEach((k) => {
    const v = String(d[k] ?? '').trim();
    if (v) out[k] = v;
  });
  return out;
}

interface Props {
  value: ExtraDetails;
  onChange: (next: ExtraDetails) => void;
  dense?: boolean; // smaller inputs for the card's quick-edit drawer
}

export const ExtraDetailsFields: React.FC<Props> = ({ value, onChange, dense }) => {
  const set = (k: keyof ExtraDetails, v: string) => onChange({ ...value, [k]: v });
  const included = /^included$/i.test(String(value.maintenance || ''));
  const box = dense
    ? 'w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none'
    : 'w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-indigo-500';
  const label = 'block text-[10px] uppercase font-bold text-slate-400 mb-1';
  const chip = (on: boolean) =>
    `px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
      on ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
    }`;

  return (
    <div className="space-y-3" data-extra-details="">
      <p className="text-[10px] text-slate-500">Optional — fill only what you know. Empty fields are not shown on the website.</p>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={label + ' !mb-0'}>Maintenance (₹ / month)</label>
          <button type="button" onClick={() => set('maintenance', included ? '' : 'Included')} className={chip(included)}>
            Included in rent
          </button>
        </div>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="e.g. 2500"
          disabled={included}
          value={included ? '' : value.maintenance || ''}
          onChange={(e) => set('maintenance', e.target.value)}
          className={box + (included ? ' opacity-50' : '')}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label}>Floor</label>
          <select value={value.floor || ''} onChange={(e) => set('floor', e.target.value)} className={box}>
            <option value="">—</option>
            <option value="Ground">Ground</option>
            {Array.from({ length: 30 }, (_, i) => String(i + 1)).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Total floors</label>
          <select value={value.totalFloors || ''} onChange={(e) => set('totalFloors', e.target.value)} className={box}>
            <option value="">—</option>
            {Array.from({ length: 30 }, (_, i) => String(i + 1)).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Parking</label>
        <div className="flex flex-wrap gap-1.5">
          {['None', 'Bike', 'Car', 'Bike & Car'].map((o) => (
            <button key={o} type="button" onClick={() => set('parking', value.parking === o ? '' : o)} className={chip(value.parking === o)}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={label}>Preferred tenant</label>
        <div className="flex flex-wrap gap-1.5">
          {['Family', 'Bachelors', 'Any'].map((o) => (
            <button key={o} type="button" onClick={() => set('preferredTenant', value.preferredTenant === o ? '' : o)} className={chip(value.preferredTenant === o)}>
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
