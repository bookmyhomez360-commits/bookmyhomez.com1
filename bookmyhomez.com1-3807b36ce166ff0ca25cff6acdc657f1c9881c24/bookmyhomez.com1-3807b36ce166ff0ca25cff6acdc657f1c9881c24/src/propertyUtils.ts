// Small helpers shared by the property card and the property page.
import { Property } from './types';
import { SITE_URL, propertyPath } from './seo';

export const PHONE_TEL = 'tel:+919916475749';
export const PHONE_TEXT = '99164 75749';
export const WA_NUMBER = '919916475749';

export const isBooked = (p: Property) => String(p.status || '').trim().toLowerCase() === 'booked';

const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

// "Hsrlayout ", "HSR LAYOUT sector 2" -> "HSR Layout", "HSR Layout Sector 2"
export function niceLocality(raw?: string): string {
  const s = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  if (/hsr/i.test(s)) {
    const sector = s.match(/sector\s*-?\s*(\d+)/i);
    return sector ? `HSR Layout Sector ${sector[1]}` : 'HSR Layout';
  }
  return titleCase(s);
}

export const cleanTitle = (t?: string) => String(t || '').replace(/\s+/g, ' ').trim();

export function propertyUrl(p: Property): string {
  const id = (p as any).id || (p as any)._id || '';
  return id ? `${SITE_URL}${propertyPath(id)}` : SITE_URL;
}

export function propertyImages(p: Property): string[] {
  const imgs = Array.isArray(p.images) ? p.images : [];
  const list = imgs.filter((u) => typeof u === 'string' && u.length > 0);
  if (!list.length && typeof (p as any).image === 'string') list.push((p as any).image);
  return list;
}

// Videos are stored as a `videos` array (older entries: videoUrl / video).
export function propertyVideos(p: Property): string[] {
  const raw: unknown[] = [
    ...(Array.isArray((p as any).videos) ? (p as any).videos : []),
    (p as any).videoUrl,
    (p as any).video,
  ];
  return Array.from(new Set(raw.filter((u): u is string => typeof u === 'string' && /^https?:\/\//.test(u))));
}

// Cloudinary: phones get a 720p MP4 (also converts .mov uploads, which many Android browsers can't play).
export function playableVideo(url: string): string {
  if (url.includes('res.cloudinary.com') && url.includes('/video/upload/')) {
    return url.replace('/video/upload/', '/video/upload/q_auto,w_720,c_limit/').replace(/\.(mov|qt|avi|mkv|webm)$/i, '.mp4');
  }
  return url;
}
export function videoPoster(url: string): string | undefined {
  if (url.includes('res.cloudinary.com') && url.includes('/video/upload/')) {
    return url.replace('/video/upload/', '/video/upload/so_1,w_720,c_limit,q_auto/').replace(/\.[a-z0-9]+$/i, '.jpg');
  }
  return undefined;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

// "2026-08-01" -> "1 Aug 2026"; "Immediate" stays as written.
export function availableFrom(p: Property): string {
  const v = String(p.availDate || '').trim();
  if (!v) return '';
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return fmtDate(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return v;
}

// When the listing was posted: createdAt, else the listing id (the wizard uses the creation time in ms as id).
export function postedOn(p: Property): string {
  const c = (p as any).createdAt;
  let d: Date | null = null;
  if (typeof c === 'string' && !Number.isNaN(Date.parse(c))) d = new Date(c);
  else if (c && typeof c === 'object' && typeof c.seconds === 'number') d = new Date(c.seconds * 1000);
  else {
    const id = Number((p as any).id);
    if (Number.isFinite(id) && id > 1.7e12 && id < Date.now() + 864e5) d = new Date(id);
  }
  return d ? fmtDate(d) : '';
}

export const priceSuffix = (p: Property) =>
  p.category === 'Buy' || p.category === 'Plots' ? '' : p.rentType === 'Daily' ? '/day' : '/month';

export function waLink(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

// Same BHK, same category; same area first, available before booked.
export function similarProperties(p: Property, all: Property[], max = 6): Property[] {
  const id = String((p as any).id || (p as any)._id);
  const loc = niceLocality(p.locality).toLowerCase();
  const bhk = String(p.bhk || '').toLowerCase();
  const scored = all
    .filter((x) => String((x as any).id || (x as any)._id) !== id)
    .map((x) => {
      let s = 0;
      if (String(x.bhk || '').toLowerCase() === bhk) s += 3;
      if (loc && niceLocality(x.locality).toLowerCase().startsWith(loc.split(' sector')[0])) s += 2;
      if (x.category === p.category) s += 1;
      if (!isBooked(x)) s += 1;
      return { x, s };
    })
    .filter(({ s }) => s >= 4)
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, max).map(({ x }) => x);
}
