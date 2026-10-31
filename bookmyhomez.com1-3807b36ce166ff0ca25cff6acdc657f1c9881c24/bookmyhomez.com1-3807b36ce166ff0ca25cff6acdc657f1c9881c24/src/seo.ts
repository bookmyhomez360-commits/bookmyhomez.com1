// SEO helpers: real URLs for each page, per-page <title>/description, image sizing.
import { CategoryType, Property } from './types';

export const SITE_URL = 'https://bookmyhomez.com';
export const SITE_NAME = 'BookMyHomez';
export const PHONE_DISPLAY = '99164 75749';

export type Tab = 'explore' | 'listings' | 'favorites' | 'my_properties' | 'blog' | 'not_found';

export interface RouteState {
  tab: Tab;
  category: CategoryType;
  propertyId: string | null;
}

// One URL per category page. "/rentals" is the main page we want Google to rank.
export const CATEGORY_PATHS: Record<CategoryType, string> = {
  All: '/properties',
  Rent: '/rentals',
  Buy: '/buy',
  'Short Stay': '/short-stay',
  Plots: '/plots',
  'PG/Co-living': '/pg',
};

const PATH_TO_CATEGORY: Record<string, CategoryType> = Object.fromEntries(
  Object.entries(CATEGORY_PATHS).map(([cat, path]) => [path, cat as CategoryType])
) as Record<string, CategoryType>;
PATH_TO_CATEGORY['/rent'] = 'Rent';

export function propertyPath(id: string | number): string {
  return `/property/${encodeURIComponent(String(id))}`;
}

export function pathForTab(tab: Tab, category: CategoryType = 'All'): string {
  switch (tab) {
    case 'explore':
      return '/';
    case 'listings':
      return CATEGORY_PATHS[category] || '/properties';
    case 'favorites':
      return '/saved';
    case 'my_properties':
      return '/my-properties';
    case 'blog':
      return '/blog';
    default:
      return '/';
  }
}

export function parseLocation(pathname: string, search: string): RouteState {
  let path = pathname.replace(/\/+$/, '') || '/';
  if (path.endsWith('.html')) path = path.slice(0, -5) || '/';
  if (path === '/index') path = '/';
  const legacyId = new URLSearchParams(search).get('propertyId');

  if (path === '/') {
    return { tab: 'explore', category: 'All', propertyId: legacyId };
  }
  if (PATH_TO_CATEGORY[path]) {
    return { tab: 'listings', category: PATH_TO_CATEGORY[path], propertyId: legacyId };
  }
  const m = path.match(/^\/property\/([^/]+)$/);
  if (m) {
    return { tab: 'listings', category: 'All', propertyId: decodeURIComponent(m[1]) };
  }
  if (path === '/blog') return { tab: 'blog', category: 'All', propertyId: null };
  if (path === '/saved') return { tab: 'favorites', category: 'All', propertyId: null };
  if (path === '/my-properties') return { tab: 'my_properties', category: 'All', propertyId: null };
  return { tab: 'not_found', category: 'All', propertyId: null };
}

const DEFAULT_DESCRIPTION =
  '1BHK & 2BHK flats and PGs for rent in HSR Layout and across Bangalore (Bengaluru), with photos and monthly rent. Call or WhatsApp BookMyHomez on 99164 75749.';

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string;
}

const CATEGORY_META: Record<CategoryType, { title: string; description: string }> = {
  Rent: {
    title: '1BHK & 2BHK Flats for Rent in HSR Layout, Bangalore | BookMyHomez',
    description:
      '1BHK, 2BHK and 3BHK flats for rent in HSR Layout and across Bangalore, with photos and monthly rent. Call or WhatsApp 99164 75749 to book a visit.',
  },
  All: {
    title: 'All Properties in Bangalore | BookMyHomez',
    description: 'All homes listed on BookMyHomez – flats and PGs for rent in Bangalore. Call or WhatsApp 99164 75749.',
  },
  Buy: {
    title: 'Homes for Sale in Bangalore | BookMyHomez',
    description: 'Flats and homes for sale listed by BookMyHomez, Bangalore. Call or WhatsApp 99164 75749 for details.',
  },
  'Short Stay': {
    title: 'Short Stay Flats in Bangalore | BookMyHomez',
    description: 'Short stay and furnished flats in Bangalore listed by BookMyHomez. Call or WhatsApp 99164 75749.',
  },
  Plots: {
    title: 'Plots for Sale | BookMyHomez',
    description: 'Plots listed by BookMyHomez. Call or WhatsApp 99164 75749 for details.',
  },
  'PG/Co-living': {
    title: 'PGs & Co-living in Bangalore | BookMyHomez',
    description: 'PG and co-living rooms in Bangalore listed by BookMyHomez. Call or WhatsApp 99164 75749.',
  },
};

// "HSR LAYOUT SECTOR 2" / "Hsrlayout" -> "HSR Layout Sector 2" for titles and descriptions.
export function niceArea(raw: string): string {
  let t = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  if (t === t.toUpperCase() || t === t.toLowerCase()) {
    t = t.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
  }
  return t.replace(/\bhsr\s*layout\b/gi, 'HSR Layout');
}

export function propertyTitle(p: Property): string {
  const name = String(p.title || '').trim();
  const bhk = p.bhk ? `${p.bhk} ` : '';
  const kind = p.category === 'Buy' || p.category === 'Plots' ? 'for Sale' : 'for Rent';
  const locality = niceArea(p.locality).split(',')[0].trim();
  const city = String(p.city || '').trim();
  const area = !locality ? city || 'Bengaluru' : city && !locality.toLowerCase().includes(city.toLowerCase()) ? `${locality}, ${city}` : locality;
  return `${name ? name + ' – ' : ''}${bhk}${kind} in ${area} | ${SITE_NAME}`;
}

export function propertyDescription(p: Property): string {
  const price = p.price ? `₹${new Intl.NumberFormat('en-IN').format(p.price)}${p.category === 'Rent' ? '/month' : ''}` : '';
  const parts = [
    `${p.bhk || ''} ${p.category === 'Buy' || p.category === 'Plots' ? 'for sale' : 'for rent'} in ${propertyTitle(p).split(' in ').slice(1).join(' in ').replace(/ \| BookMyHomez$/, '')}`.trim(),
    price,
    p.furnishing ? String(p.furnishing) : '',
  ].filter(Boolean);
  return `${parts.join(' · ')}. Photos and details on BookMyHomez – call or WhatsApp ${PHONE_DISPLAY}.`;
}

export function metaFor(state: RouteState, property: Property | null): PageMeta {
  if (property) {
    const firstImg = (property.images || []).find((i) => /^https?:/.test(i));
    return {
      title: propertyTitle(property),
      description: propertyDescription(property),
      path: propertyPath(property.id),
      image: firstImg ? optimizeImage(firstImg, 1200) : undefined,
    };
  }
  switch (state.tab) {
    case 'explore':
      return { title: 'Flats & PGs for Rent in Bangalore – HSR Layout | BookMyHomez', description: DEFAULT_DESCRIPTION, path: '/' };
    case 'listings':
      return { ...CATEGORY_META[state.category], path: CATEGORY_PATHS[state.category] };
    case 'blog':
      return { title: 'Blog – Renting in Bangalore | BookMyHomez', description: 'Tips and updates from BookMyHomez on renting flats and PGs in Bangalore.', path: '/blog' };
    case 'favorites':
      return { title: 'Saved Homes | BookMyHomez', description: DEFAULT_DESCRIPTION, path: '/saved', noindex: true };
    case 'my_properties':
      return { title: 'My Properties | BookMyHomez', description: DEFAULT_DESCRIPTION, path: '/my-properties', noindex: true };
    default:
      return { title: 'Page not found | BookMyHomez', description: DEFAULT_DESCRIPTION, path: '/', noindex: true };
  }
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export function applyMeta(meta: PageMeta) {
  const url = SITE_URL + (meta.path === '/' ? '/' : meta.path);
  document.title = meta.title;
  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', meta.noindex ? 'noindex, follow' : 'index, follow');
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);
  const image = meta.image || `${SITE_URL}/og-image.jpg`;
  setMeta('property', 'og:image', image);
  setMeta('name', 'twitter:image', image);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

// Responsive srcset for Cloudinary photos so phones download a smaller file (same look).
export function imageSrcSet(url: string, widths: number[] = [480, 800, 1200]): string | undefined {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return undefined;
  return widths.map((w) => `${optimizeImage(url, w)} ${w}w`).join(', ');
}

// Cloudinary photos: ask for a resized, auto-format/quality version instead of the original upload.
export function optimizeImage(url: string, width: number): string {
  if (typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/') && !url.includes('/image/upload/f_auto')) {
    return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
  }
  if (url.includes('images.unsplash.com')) {
    return url.replace(/([?&])w=\d+/, `$1w=${width}`);
  }
  return url;
}
