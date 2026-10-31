// Build step: writes a crawlable HTML page for every route (/, /rentals, /property/<id>, ...)
// plus sitemap.xml and 404.html into dist/. Each page has its own <title>, description,
// canonical URL and real content + <a href> links, so Google can index listings without
// running JavaScript. The React app then takes over in the browser as before.
//
// Listings are read (read-only) from the public Firestore REST API at build time.
// If that fails, the build still succeeds with the static pages only.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://bookmyhomez.com';
const PHONE = '99164 75749';
const PHONE_LINK = 'tel:+919916475749';
const WHATSAPP = 'https://wa.me/919916475749';
const FIREBASE_PROJECT = 'bookmyhomez-72feb';
// Public web API key (the same one the site already ships in its JavaScript).
const FIREBASE_API_KEY = 'AIzaSyDb_M1SsUqhPsU1tYLtDXYyu01W4vpYUU8';

const CATEGORY_PAGES = [
  { cat: 'Rent', path: '/rentals', h1: 'Flats for Rent in Bangalore',
    intro: '1BHK, 2BHK and 3BHK flats for rent in HSR Layout and across Bangalore, with photos and monthly rent.',
    title: '1BHK & 2BHK Flats for Rent in HSR Layout, Bangalore | BookMyHomez',
    description: '1BHK, 2BHK and 3BHK flats for rent in HSR Layout and across Bangalore, with photos and monthly rent. Call or WhatsApp 99164 75749 to book a visit.' },
  { cat: 'All', path: '/properties', h1: 'All Properties in Bangalore',
    title: 'All Properties in Bangalore | BookMyHomez',
    description: 'All homes listed on BookMyHomez – flats and PGs for rent in Bangalore. Call or WhatsApp 99164 75749.' },
  { cat: 'Short Stay', path: '/short-stay', h1: 'Short Stay Flats in Bangalore',
    title: 'Short Stay Flats in Bangalore | BookMyHomez',
    description: 'Short stay and furnished flats in Bangalore listed by BookMyHomez. Call or WhatsApp 99164 75749.' },
  { cat: 'Buy', path: '/buy', h1: 'Homes for Sale in Bangalore',
    title: 'Homes for Sale in Bangalore | BookMyHomez',
    description: 'Flats and homes for sale listed by BookMyHomez, Bangalore. Call or WhatsApp 99164 75749 for details.' },
  { cat: 'Plots', path: '/plots', h1: 'Land & Residential Plots',
    title: 'Plots for Sale | BookMyHomez',
    description: 'Plots listed by BookMyHomez. Call or WhatsApp 99164 75749 for details.' },
  { cat: 'PG/Co-living', path: '/pg', h1: 'PGs & Co-living in Bangalore',
    title: 'PGs & Co-living in Bangalore | BookMyHomez',
    description: 'PG and co-living rooms in Bangalore listed by BookMyHomez. Call or WhatsApp 99164 75749.' },
];

const HOME = {
  path: '/',
  title: 'Flats & PGs for Rent in Bangalore – HSR Layout | BookMyHomez',
  description: '1BHK & 2BHK flats and PGs for rent in HSR Layout and across Bangalore (Bengaluru), with photos and monthly rent. Call or WhatsApp BookMyHomez on 99164 75749.',
};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const niceArea = (raw) => {
  let t = clean(raw);
  if (!t) return '';
  if (t === t.toUpperCase() || t === t.toLowerCase()) t = t.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
  return t.replace(/\bhsr\s*layout\b/gi, 'HSR Layout');
};
const inr = (n) => new Intl.NumberFormat('en-IN').format(Number(n) || 0);
const isSale = (p) => p.category === 'Buy' || p.category === 'Plots';
const propertyPath = (id) => `/property/${encodeURIComponent(String(id))}`;
const cloud = (url, w) =>
  typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/image/upload/') && !url.includes('/image/upload/f_auto')
    ? url.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${w}/`)
    : url;
const httpImages = (p) => (Array.isArray(p.images) ? p.images : []).filter((i) => typeof i === 'string' && /^https:\/\//.test(i));

// Demo listings that the old code seeded into the database (ids from src/data/initialProperties.ts):
// never give them pages or sitemap entries.
function demoIds() {
  try {
    const src = readFileSync(join(ROOT, 'src/data/initialProperties.ts'), 'utf8');
    const block = src.slice(src.indexOf('INITIAL_PROPERTIES'), src.indexOf('REGISTERED_USERS') > 0 ? src.indexOf('REGISTERED_USERS') : undefined);
    return new Set([...block.matchAll(/\bid:\s*(\d+)/g)].map((m) => m[1]));
  } catch {
    return new Set();
  }
}

function fromFirestore(v) {
  if (!v || typeof v !== 'object') return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFirestore);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromFirestore(x)]));
  return undefined;
}

async function loadListings() {
  const base = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/properties`;
  const out = [];
  let pageToken = '';
  for (let i = 0; i < 50; i++) {
    const url = `${base}?pageSize=300&key=${FIREBASE_API_KEY}` +
      `&mask.fieldPaths=title&mask.fieldPaths=category&mask.fieldPaths=status&mask.fieldPaths=city` +
      `&mask.fieldPaths=locality&mask.fieldPaths=bhk&mask.fieldPaths=price&mask.fieldPaths=deposit` +
      `&mask.fieldPaths=area&mask.fieldPaths=furnishing&mask.fieldPaths=description&mask.fieldPaths=images` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`Firestore answered ${res.status}`);
    const json = await res.json();
    for (const d of json.documents || []) {
      const f = Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, fromFirestore(v)]));
      out.push({ ...f, id: d.name.split('/').pop(), updated: d.updateTime });
    }
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }
  return out;
}

function head(html, { title, description, path, robots = 'index, follow', image }) {
  const url = SITE + path;
  const img = image || `${SITE}/og-image.jpg`;
  const set = (re, val) => { html = html.replace(re, val); };
  set(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  set(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}" />`);
  set(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(url)}" />`);
  set(/<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="${esc(robots)}" />`);
  set(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${esc(url)}" />`);
  set(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`);
  set(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(description)}" />`);
  set(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${esc(img)}" />`);
  set(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  set(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  set(/<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${esc(img)}" />`);
  if (image) {
    // Listing photos are not 1200x630, so drop the fixed size hints of the default image.
    html = html.replace(/\s*<meta property="og:image:width" content="[^"]*"\s*\/?>/, '').replace(/\s*<meta property="og:image:height" content="[^"]*"\s*\/?>/, '');
  }
  return html;
}

const WRAP = 'style="max-width:1100px;margin:0 auto;padding:32px 16px;font-family:Poppins,system-ui,sans-serif;color:#e2e8f0;background:#090D16"';
const A = 'style="color:#a5b4fc"';

function nav() {
  return `<nav aria-label="Main"><a href="/" ${A}>Home</a> · <a href="/rentals" ${A}>Flats for rent</a> · <a href="/short-stay" ${A}>Short stay</a> · <a href="/properties" ${A}>All properties</a> · <a href="/blog" ${A}>Blog</a></nav>`;
}

function contact() {
  return `<p>Call <a href="${PHONE_LINK}" ${A}>${PHONE}</a> or <a href="${WHATSAPP}" ${A}>WhatsApp us</a>. ` +
    `Office: 457/b, 25th Main Rd, Parangi Palaya, Sector 2, HSR Layout, Bengaluru 560102.</p>`;
}

function card(p) {
  const img = httpImages(p)[0];
  const price = p.price ? `₹${inr(p.price)}${isSale(p) ? '' : '/month'}` : '';
  return `<li style="margin:0 0 16px">` +
    (img ? `<img src="${esc(cloud(img, 480))}" alt="${esc(clean(p.title))} – ${esc(p.bhk)} in ${esc(niceArea(p.locality))}" width="240" height="160" loading="lazy" decoding="async" style="object-fit:cover;border-radius:12px;display:block;margin-bottom:6px" />` : '') +
    `<a href="${propertyPath(p.id)}" ${A}><strong>${esc(clean(p.title))}</strong></a> – ${esc(p.bhk)} ${isSale(p) ? 'for sale' : 'for rent'} in ${esc(niceArea(p.locality))}` +
    (price ? ` · ${esc(price)}` : '') + (p.status && String(p.status).toLowerCase() === 'booked' ? ' · Booked' : '') + `</li>`;
}

function listBlock(items) {
  if (!items.length) return '<p>No listings in this section right now. See <a href="/rentals" style="color:#a5b4fc">flats for rent in Bangalore</a>.</p>';
  return `<ul style="list-style:none;padding:0">${items.map(card).join('')}</ul>`;
}

// Extra structured data per page (breadcrumbs, website). The business JSON-LD stays in index.html.
function ldScript(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}
function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })),
  };
}

function page(template, meta, body, ld = []) {
  let html = head(template, meta);
  if (ld.length) html = html.replace('</head>', `    ${ld.map(ldScript).join('\n    ')}\n  </head>`);
  return html.replace('<div id="root"></div>', `<div id="root"><div ${WRAP}>${nav()}${body}${contact()}</div></div>`);
}

function write(path, html) {
  const file = path === '/' ? join(DIST, 'index.html') : join(DIST, `${path.replace(/^\//, '')}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

async function main() {
  const templatePath = join(DIST, 'index.html');
  if (!existsSync(templatePath)) throw new Error('dist/index.html missing – run vite build first');
  const template = readFileSync(templatePath, 'utf8');

  let listings = [];
  try {
    const demo = demoIds();
    listings = (await loadListings()).filter((p) => !demo.has(String(p.id)));
    console.log(`[prerender] ${listings.length} listings from Firestore`);
  } catch (err) {
    console.warn(`[prerender] could not read listings (${err.message}); writing static pages only`);
  }
  const newestFirst = [...listings].sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = [{ loc: `${SITE}/`, lastmod: today, priority: '1.0' }];

  // Home
  const rentals = newestFirst.filter((p) => p.category === 'Rent');
  write('/', page(template, HOME,
    `<h1>Flats &amp; PGs for Rent in Bangalore</h1>` +
    `<p>1BHK, 2BHK and 3BHK flats and PGs for rent in HSR Layout and across Bangalore.</p>` +
    `<h2>Latest flats for rent</h2>` + listBlock(rentals.slice(0, 12)) +
    `<p><a href="/rentals" ${A}>See all flats for rent in Bangalore →</a></p>`,
    [{ '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'BookMyHomez', url: `${SITE}/`, inLanguage: 'en-IN', publisher: { '@id': `${SITE}/#business` } }]));

  // Category pages
  for (const c of CATEGORY_PAGES) {
    const items = c.cat === 'All' ? newestFirst : newestFirst.filter((p) => p.category === c.cat);
    write(c.path, page(template, { ...c, robots: items.length ? 'index, follow' : 'noindex, follow' },
      `<p><a href="/" ${A}>Home</a> / ${esc(c.h1)}</p><h1>${esc(c.h1)}</h1>` +
      (c.intro ? `<p>${esc(c.intro)}</p>` : '') + `<p>${items.length} listing${items.length === 1 ? '' : 's'}.</p>` + listBlock(items),
      [breadcrumbs([['Home', '/'], [c.h1, c.path]])]));
    if (items.length) sitemap.push({ loc: SITE + c.path, lastmod: today, priority: c.cat === 'Rent' ? '0.9' : '0.6' });
  }

  // Blog (content loads in the browser)
  write('/blog', page(template, { path: '/blog', title: 'Blog – Renting in Bangalore | BookMyHomez',
    description: 'Tips and updates from BookMyHomez on renting flats and PGs in Bangalore.' },
    `<h1>BookMyHomez Blog</h1><p>Tips and updates on renting in Bangalore.</p>`));
  sitemap.push({ loc: `${SITE}/blog`, lastmod: today, priority: '0.4' });

  // One page per listing
  for (const p of newestFirst) {
    const name = clean(p.title) || `${p.bhk} flat`;
    const locality = niceArea(p.locality).split(',')[0].trim();
    const city = clean(p.city);
    const area = !locality ? city || 'Bengaluru' : city && !locality.toLowerCase().includes(city.toLowerCase()) ? `${locality}, ${city}` : locality;
    const kind = isSale(p) ? 'for Sale' : 'for Rent';
    const price = p.price ? `₹${inr(p.price)}${isSale(p) ? '' : '/month'}` : '';
    const title = `${name} – ${p.bhk ? p.bhk + ' ' : ''}${kind} in ${area} | BookMyHomez`;
    const description = `${[`${p.bhk || ''} ${kind.toLowerCase()} in ${area}`.trim(), price, p.furnishing].filter(Boolean).join(' · ')}. Photos and details on BookMyHomez – call or WhatsApp ${PHONE}.`;
    const imgs = httpImages(p);
    const desc = clean(p.description);
    const facts = [
      p.bhk && `<li>Type: ${esc(p.bhk)}</li>`,
      price && `<li>${isSale(p) ? 'Price' : 'Rent'}: ${esc(price)}</li>`,
      p.deposit && `<li>Deposit: ₹${inr(p.deposit)}</li>`,
      p.area && `<li>Area: ${esc(p.area)} sq.ft</li>`,
      p.furnishing && `<li>Furnishing: ${esc(p.furnishing)}</li>`,
      p.status && `<li>Status: ${esc(p.status)}</li>`,
    ].filter(Boolean).join('');
    const catPage = CATEGORY_PAGES.find((c) => c.cat === p.category) || CATEGORY_PAGES[1];
    write(propertyPath(p.id), page(template, { path: propertyPath(p.id), title, description, image: imgs[0] ? cloud(imgs[0], 1200) : undefined },
      `<p><a href="/" ${A}>Home</a> / <a href="${catPage.path}" ${A}>${esc(catPage.h1)}</a> / ${esc(name)}</p>` +
      `<h1>${esc(name)} – ${esc(p.bhk)} ${kind} in ${esc(area)}</h1>` +
      `<ul>${facts}</ul>` +
      (desc && !/posted via BookMyHomez multi-step listing wizard/i.test(desc) ? `<p>${esc(desc)}</p>` : '') +
      imgs.slice(0, 4).map((u, i) => `<img src="${esc(cloud(u, 800))}" alt="${esc(name)} photo ${i + 1}" width="400" height="300" loading="lazy" decoding="async" style="object-fit:cover;border-radius:12px;margin:4px" />`).join('') +
      `<p><a href="${WHATSAPP}?text=${encodeURIComponent(`Hi, I'm interested in ${name} (${p.bhk}) in ${area}`)}" ${A}>Ask about this home on WhatsApp</a></p>`,
      [breadcrumbs([['Home', '/'], [catPage.h1, catPage.path], [name, propertyPath(p.id)]])]));
    sitemap.push({ loc: SITE + propertyPath(p.id), lastmod: String(p.updated || today).slice(0, 10), priority: '0.7' });
  }

  // 404 page (used by hosts that serve dist/404.html for unknown URLs)
  write('/404', page(template, { path: '/404', title: 'Page not found | BookMyHomez', description: HOME.description, robots: 'noindex, follow' },
    `<h1>Page not found</h1><p>This page doesn't exist or the listing has been removed.</p><p><a href="/rentals" ${A}>See flats for rent in Bangalore →</a></p>`));

  writeFileSync(join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemap.map((u) => `  <url>\n    <loc>${esc(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
    `\n</urlset>\n`);
  console.log(`[prerender] wrote ${sitemap.length} sitemap URLs and ${CATEGORY_PAGES.length + 3 + newestFirst.length} pages`);
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
