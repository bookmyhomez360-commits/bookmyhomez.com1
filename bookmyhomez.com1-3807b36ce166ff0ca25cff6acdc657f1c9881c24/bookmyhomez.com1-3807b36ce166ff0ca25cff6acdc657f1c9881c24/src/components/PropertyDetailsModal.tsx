import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  X, MapPin, MessageCircle, RefreshCw, Share2, ChevronLeft, ChevronRight, ChevronRight as Crumb,
  Phone, CalendarDays, Maximize2, Play, Check, Minus, BedDouble, Ruler, Sofa, Bath, Wind, Compass,
  Hourglass, Building2, Wallet, IndianRupee, Clock, Copy, Cctv, ArrowUpDown, Zap, Trees, Dumbbell,
  Waves, Tv, Refrigerator, AirVent, WashingMachine, Microwave, CookingPot, Shirt, Home, Star,
} from 'lucide-react';
import { Property, User } from '../types';
import { CATEGORY_PATHS, optimizeImage } from '../seo';
import {
  PHONE_TEL, PHONE_TEXT, availableFrom, cleanTitle, isBooked, niceLocality, playableVideo, postedOn,
  priceSuffix, propertyImages, propertyUrl, propertyVideos, similarProperties, videoPoster, waLink,
} from '../propertyUtils';

// Property page (opens over the list at /property/<id>).
// Built after looking at how NoBroker, MagicBricks, 99acres and Housing.com show a rental:
// swipeable photo gallery with a count + full screen, key facts with icons, furnishing checklist,
// amenities, video, map of the area, similar homes, share, and a sticky Call / WhatsApp / Visit bar.
// Shows ONLY what is stored for the listing - nothing is made up.

interface PropertyDetailsModalProps {
  property: Property | null;
  currentUser: User | null;
  onClose: () => void;
  onToggleStatus: (property: Property) => void;
  formatCurrency: (val: number) => string;
  onUpdateProperty?: (updatedProperty: Property) => void;
  allProperties?: Property[];
  onOpenProperty?: (p: Property) => void;
}

const AMENITY_ICONS: [RegExp, LucideIcon][] = [
  [/cctv|security|camera/i, Cctv],
  [/lift|elevator/i, ArrowUpDown],
  [/power|backup|generator/i, Zap],
  [/park|garden/i, Trees],
  [/gym/i, Dumbbell],
  [/intercom/i, Phone],
  [/pool|swim/i, Waves],
  [/club/i, Building2],
];
const FURNISH_ICONS: [RegExp, LucideIcon][] = [
  [/^tv|television/i, Tv],
  [/fridge|refrigerator/i, Refrigerator],
  [/^ac$|air ?con/i, AirVent],
  [/wardrobe|cupboard/i, Shirt],
  [/sofa/i, Sofa],
  [/chimney|stove|gas/i, CookingPot],
  [/washing/i, WashingMachine],
  [/microwave|oven/i, Microwave],
  [/bed/i, BedDouble],
];
const iconFor = (list: [RegExp, LucideIcon][], name: string, fallback: LucideIcon) =>
  (list.find(([re]) => re.test(name)) || [null, fallback])[1];

const GENERIC_DESC = /posted via BookMyHomez multi-step listing wizard/i;

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  currentUser,
  onClose,
  onToggleStatus,
  formatCurrency,
  allProperties = [],
  onOpenProperty,
}) => {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const fsRef = useRef<HTMLDivElement>(null);
  const similarRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLElement>(null);

  // new property -> back to the first photo and the top of the page
  useEffect(() => {
    setIndex(0);
    setFullscreen(null);
    galleryRef.current?.scrollTo({ left: 0 });
    scrollRef.current?.scrollTo({ top: 0 });
  }, [property]);

  // lock the page behind, Esc closes
  useEffect(() => {
    if (!property) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // the floating voice-call bubble would sit on top of the Call / WhatsApp / Visit bar
    document.documentElement.classList.add('bmh-pd-open');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreen !== null) setFullscreen(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove('bmh-pd-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [property, fullscreen, onClose]);

  // open the full-screen viewer on the tapped photo
  useEffect(() => {
    if (fullscreen === null || !fsRef.current) return;
    fsRef.current.scrollTo({ left: fullscreen * fsRef.current.clientWidth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen === null]);

  const similar = useMemo(
    () => (property ? similarProperties(property, allProperties) : []),
    [property, allProperties],
  );

  if (!property) return null;

  const title = cleanTitle(property.title) || `${property.bhk} home`;
  const locality = niceLocality(property.locality);
  const city = property.city || 'Bengaluru';
  const images = propertyImages(property);
  const videos = propertyVideos(property);
  const booked = isBooked(property);
  const url = propertyUrl(property);
  const suffix = priceSuffix(property);
  const avail = availableFrom(property);
  const posted = postedOn(property);
  const isAdmin = !!currentUser && (currentUser.role === 'Administrator' || currentUser.id === property.ownerId);
  const desc = property.description && !GENERIC_DESC.test(property.description) ? property.description.trim() : '';
  const categoryPath = CATEGORY_PATHS[property.category] || CATEGORY_PATHS.All;
  const categoryName = property.category === 'Rent' ? 'Rentals' : property.category === 'All' ? 'Properties' : property.category;
  const money = (v?: number | string) => (v === undefined || v === null || v === '' || Number(v) === 0 ? '' : `₹${formatCurrency(Number(v))}`);

  const furnishingsAll = Object.entries(property.furnishings || {}).map(([name, n]) => [name, Number(n) || 0] as const);
  // all items 0 usually means the checklist was never filled in - don't show a row of crosses then
  const furnishings = furnishingsAll.some(([, n]) => n > 0) ? furnishingsAll : [];
  const realReviews = Array.isArray((property as any).reviews) ? ((property as any).reviews as any[]) : [];

  const enquiry = `Hi, I'm interested in ${title}${locality ? `, ${locality}` : ''} (${property.bhk}${property.price ? `, ${money(property.price)}${suffix}` : ''}) — ${url}`;
  const visitMsg = `Hi, I'd like to schedule a visit for ${title}${locality ? `, ${locality}` : ''} — ${url}\nPreferred date & time: `;

  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: IndianRupee, label: suffix ? 'Rent' : 'Price', value: property.price ? `${money(property.price)}${suffix}` : '' },
    { icon: Wallet, label: 'Deposit', value: money(property.deposit) },
    { icon: BedDouble, label: 'Type', value: property.bhk || '' },
    { icon: Ruler, label: 'Area', value: property.area ? `${formatCurrency(Number(property.area))} sq.ft` : '' },
    { icon: Sofa, label: 'Furnishing', value: property.furnishing || '' },
    { icon: CalendarDays, label: 'Available from', value: booked ? '' : avail },
    { icon: Bath, label: 'Bathrooms', value: property.bathrooms ? String(property.bathrooms) : '' },
    { icon: Wind, label: 'Balconies', value: property.balconies ? String(property.balconies) : '' },
    { icon: Compass, label: 'Facing', value: (property as any).facing || '' },
    { icon: Hourglass, label: 'Property age', value: property.propertyAge || '' },
    { icon: Building2, label: 'Property type', value: property.subType || '' },
    { icon: Clock, label: 'Rent type', value: suffix && property.rentType ? property.rentType : '' },
  ].filter((f) => f.value);

  const onGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };
  const goTo = (i: number) => {
    const el = galleryRef.current;
    if (!el || !images.length) return;
    const n = (i + images.length) % images.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
    setIndex(n);
  };

  const share = async () => {
    const text = `${title} – ${property.bhk}${locality ? ` in ${locality}` : ''}${property.price ? `, ${money(property.price)}${suffix}` : ''} | BookMyHomez`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e: any) {
        if (e && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this link', url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const scrollToEl = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const img = (u: string, w: number) => (u.startsWith('data:') ? u : optimizeImage(u, w));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div
        ref={scrollRef}
        className="relative h-full w-full overflow-y-auto overscroll-contain bg-[#0d1220] sm:h-auto sm:max-h-[92vh] sm:max-w-3xl sm:rounded-3xl sm:border sm:border-slate-800 shadow-2xl"
      >
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center gap-2 bg-[#0d1220]/95 backdrop-blur px-3 py-2.5 border-b border-slate-800/80">
          <button type="button" onClick={onClose} aria-label="Back" className="p-2 rounded-full hover:bg-slate-800 text-slate-200 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1 text-[11px] text-slate-400">
            <ol className="flex items-center gap-1 overflow-hidden whitespace-nowrap">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li aria-hidden="true"><Crumb className="w-3 h-3" /></li>
              <li><a href={categoryPath} className="hover:text-white">{categoryName}</a></li>
              {locality && (<><li aria-hidden="true"><Crumb className="w-3 h-3" /></li><li className="truncate">{locality}</li></>)}
              <li aria-hidden="true" className="hidden sm:block"><Crumb className="w-3 h-3" /></li>
              <li className="hidden sm:block truncate text-slate-200">{title}</li>
            </ol>
          </nav>
          <button type="button" onClick={share} className="flex items-center gap-1.5 rounded-full bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer" aria-label="Share this home">
            {copied ? <Copy className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-indigo-300" />}
            {copied ? 'Link copied' : 'Share'}
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className="hidden sm:inline-flex p-2 rounded-full hover:bg-slate-800 text-slate-300 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo gallery: swipe, count, full screen */}
        <section aria-label="Photos" className="relative bg-black">
          {images.length > 0 ? (
            <div
              ref={galleryRef}
              onScroll={onGalleryScroll}
              className="flex overflow-x-auto snap-x snap-mandatory bmh-noscroll aspect-[4/3] sm:aspect-[16/9]"
            >
              {images.map((u, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFullscreen(i)}
                  className="relative shrink-0 w-full h-full snap-center cursor-zoom-in"
                  aria-label={`Open photo ${i + 1} of ${images.length} full screen`}
                >
                  <img
                    src={img(u, 800)}
                    srcSet={u.startsWith('data:') ? undefined : `${img(u, 480)} 480w, ${img(u, 800)} 800w, ${img(u, 1200)} 1200w`}
                    sizes="(min-width: 768px) 768px, 100vw"
                    alt={`${title} – photo ${i + 1}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="aspect-[4/3] sm:aspect-[16/9] flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
              <Home className="w-10 h-10" /> Photos coming soon
            </div>
          )}

          {images.length > 1 && (
            <>
              <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous photo" className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75 cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => goTo(index + 1)} aria-label="Next photo" className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75 cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
            {booked ? (
              <span className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">Booked</span>
            ) : null}
            {property.furnishing && (
              <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white">{property.furnishing}</span>
            )}
          </div>

          <div className="absolute right-3 bottom-3 flex gap-2">
            {videos.length > 0 && (
              <button type="button" onClick={() => scrollToEl(videoRef.current)} className="flex items-center gap-1 rounded-full bg-black/65 px-3 py-1.5 text-[11px] font-semibold text-white cursor-pointer">
                <Play className="w-3.5 h-3.5 fill-white" /> Video
              </button>
            )}
            {images.length > 0 && (
              <button type="button" onClick={() => setFullscreen(index)} className="flex items-center gap-1 rounded-full bg-black/65 px-3 py-1.5 text-[11px] font-semibold text-white cursor-pointer" aria-label="View photos full screen">
                <Maximize2 className="w-3.5 h-3.5" /> {Math.min(index + 1, images.length)} / {images.length}
              </button>
            )}
          </div>
        </section>

        {images.length > 1 && (
          <div className="hidden sm:flex gap-2 overflow-x-auto bmh-noscroll px-4 pt-3">
            {images.map((u, i) => (
              <button key={i} type="button" onClick={() => goTo(i)} aria-label={`Photo ${i + 1}`} className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 cursor-pointer ${i === index ? 'border-amber-400' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                <img src={img(u, 160)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="px-4 sm:px-6 pt-4 pb-6 space-y-6">
          {/* Title + price */}
          <header>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-300">{property.bhk}{property.subType ? ` · ${property.subType}` : ''}</span>
              {booked ? (
                <span className="rounded-full bg-rose-500/15 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">Booked</span>
              ) : avail ? (
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">Available from {avail}</span>
              ) : null}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">{title}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              {[locality, city].filter(Boolean).join(', ')}
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-1">
              {property.price ? (
                <p className="text-2xl font-extrabold text-amber-400">
                  {money(property.price)}<span className="text-sm font-semibold text-slate-400">{suffix}</span>
                </p>
              ) : null}
              {money(property.deposit) && (
                <p className="text-sm text-slate-300">Deposit <span className="font-bold text-white">{money(property.deposit)}</span></p>
              )}
            </div>
            {posted && <p className="mt-1 text-[11px] text-slate-400">Posted on {posted}</p>}
          </header>

          {/* Move-in cost (simple sum of what is stored: rent + deposit) */}
          {!booked && suffix === '/month' && Number(property.price) > 0 && Number(property.deposit) > 0 && (
            <section aria-labelledby="cost-h" className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
              <h2 id="cost-h" className="bmh-pd-h !mb-2">Move-in cost</h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-slate-400">First month rent</dt><dd className="font-semibold text-white">{money(property.price)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Security deposit (refundable)</dt><dd className="font-semibold text-white">{money(property.deposit)}</dd></div>
                <div className="flex justify-between border-t border-amber-500/20 pt-1.5"><dt className="font-semibold text-amber-200">Total to move in</dt><dd className="font-extrabold text-amber-400">{money(Number(property.price) + Number(property.deposit))}</dd></div>
              </dl>
              <p className="mt-2 text-[11px] text-slate-400">Maintenance and other charges, if any, will be confirmed by our team.</p>
            </section>
          )}

          {/* Quick questions -> WhatsApp */}
          {!booked && (
            <section aria-labelledby="ask-h">
              <h2 id="ask-h" className="bmh-pd-h">Ask us on WhatsApp</h2>
              <div className="flex flex-wrap gap-2">
                {['Is this home still available?', 'When can I visit?', 'Is parking available?', 'Are pets allowed?'].map((q) => (
                  <a
                    key={q}
                    href={waLink(`${q}\n${title}${locality ? `, ${locality}` : ''} — ${url}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-500/20"
                  >
                    {q}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Key facts */}
          {facts.length > 0 && (
            <section aria-labelledby="facts-h">
              <h2 id="facts-h" className="bmh-pd-h">Key details</h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {facts.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <Icon className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
                      <span className="block text-[13px] font-semibold text-white break-words">{value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Furnishing checklist */}
          {furnishings.length > 0 && (
            <section aria-labelledby="furn-h">
              <h2 id="furn-h" className="bmh-pd-h">What's in the home</h2>
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {furnishings.map(([name, n]) => {
                  const Icon = iconFor(FURNISH_ICONS, name, Check);
                  const has = n > 0;
                  return (
                    <li key={name} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] border ${has ? 'border-emerald-500/30 bg-emerald-500/5 text-white' : 'border-slate-800 bg-slate-900/30 text-slate-500'}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${has ? 'text-emerald-300' : 'text-slate-600'}`} />
                      <span className={`flex-1 ${has ? '' : 'line-through decoration-slate-600'}`}>{n > 1 ? `${n} × ${name}` : name}</span>
                      {has ? <Check className="w-4 h-4 text-emerald-400" aria-label="included" /> : <Minus className="w-4 h-4 text-slate-600" aria-label="not included" />}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <section aria-labelledby="amen-h">
              <h2 id="amen-h" className="bmh-pd-h">Amenities</h2>
              <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {property.amenities.map((a) => {
                  const Icon = iconFor(AMENITY_ICONS, a, Check);
                  return (
                    <li key={a} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-2 py-3 text-center text-[11px] font-medium text-indigo-100">
                      <Icon className="w-5 h-5 text-indigo-300" />
                      {a}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Video */}
          {videos.length > 0 && (
            <section ref={videoRef} aria-labelledby="video-h" className="scroll-mt-16">
              <h2 id="video-h" className="bmh-pd-h">Video tour</h2>
              <div className="space-y-3">
                {videos.map((v) => (
                  <video
                    key={v}
                    controls
                    playsInline
                    preload="none"
                    poster={videoPoster(v) || (images[0] ? img(images[0], 800) : undefined)}
                    className="w-full max-h-[70vh] rounded-2xl bg-black"
                  >
                    <source src={playableVideo(v)} type="video/mp4" />
                    <source src={v} />
                  </video>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          {desc && (
            <section aria-labelledby="desc-h">
              <h2 id="desc-h" className="bmh-pd-h">About this home</h2>
              <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">{desc}</p>
            </section>
          )}

          {/* Map of the area (locality only - no exact address is stored) */}
          {locality && (
            <section aria-labelledby="map-h">
              <h2 id="map-h" className="bmh-pd-h">Location</h2>
              <p className="mb-2 text-xs text-slate-400">{locality}, {city}. Exact address shared when you book a visit.</p>
              <div className="overflow-hidden rounded-2xl border border-slate-800 aspect-[16/10] bg-slate-900">
                <iframe
                  title={`Map of ${locality}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${locality}, ${city}`)}&z=14&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0"
                />
              </div>
            </section>
          )}

          {/* Reviews: only real ones stored on the listing */}
          {realReviews.length > 0 && (
            <section aria-labelledby="rev-h">
              <h2 id="rev-h" className="bmh-pd-h">Reviews</h2>
              <ul className="space-y-2">
                {realReviews.map((r, i) => (
                  <li key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      {r.userName || r.name}
                      {r.rating ? <span className="flex items-center gap-0.5 text-amber-400"><Star className="w-3 h-3 fill-amber-400" />{r.rating}/5</span> : null}
                    </div>
                    <p className="mt-1 text-slate-300">{r.comment}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Similar homes */}
          {similar.length > 0 && (
            <section ref={similarRef} aria-labelledby="sim-h" className="scroll-mt-16">
              <h2 id="sim-h" className="bmh-pd-h">Similar homes</h2>
              <div className="-mx-4 sm:-mx-6 flex gap-3 overflow-x-auto bmh-noscroll px-4 sm:px-6 snap-x">
                {similar.map((s) => {
                  const si = propertyImages(s)[0];
                  const sid = (s as any).id || (s as any)._id;
                  return (
                    <a
                      key={sid}
                      href={propertyUrl(s).replace(/^https?:\/\/[^/]+/, '')}
                      onClick={(e) => {
                        if (!onOpenProperty) return;
                        e.preventDefault();
                        onOpenProperty(s);
                      }}
                      className="snap-start shrink-0 w-48 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-indigo-500/50"
                    >
                      <div className="relative aspect-[4/3] bg-slate-800">
                        {si && <img src={img(si, 400)} alt={cleanTitle(s.title)} loading="lazy" decoding="async" className="w-full h-full object-cover" />}
                        {isBooked(s) && <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">Booked</span>}
                      </div>
                      <div className="p-2.5">
                        <p className="truncate text-[13px] font-semibold text-white">{cleanTitle(s.title)}</p>
                        <p className="truncate text-[11px] text-slate-400">{s.bhk} · {niceLocality(s.locality)}</p>
                        {s.price ? <p className="mt-0.5 text-sm font-bold text-amber-400">{money(s.price)}<span className="text-[10px] text-slate-400">{priceSuffix(s)}</span></p> : null}
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* Owner / admin only */}
          {isAdmin && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center justify-between gap-2">
              <span className="text-xs text-amber-200">Admin: status is <b>{property.status || 'Available'}</b></span>
              <button type="button" onClick={() => onToggleStatus(property)} className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500 hover:text-slate-950 cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /> Mark as {booked ? 'Available' : 'Booked'}
              </button>
            </div>
          )}
        </div>

        {/* Sticky action bar */}
        <div className="sticky bottom-0 z-20 border-t border-slate-800 bg-[#0d1220]/95 backdrop-blur px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          {booked ? (
            <div className="flex items-center gap-2">
              <span className="flex-1 rounded-xl bg-rose-500/10 border border-rose-500/30 py-3 text-center text-sm font-bold text-rose-300">This home is booked</span>
              {similar.length > 0 && (
                <button type="button" onClick={() => scrollToEl(similarRef.current)} className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white cursor-pointer">
                  See similar homes
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <a href={PHONE_TEL} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-[12px] sm:text-sm font-bold text-white" aria-label={`Call ${PHONE_TEXT}`}>
                <Phone className="w-4 h-4 text-amber-400" /> Call
              </a>
              <a href={waLink(enquiry)} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 py-2.5 text-[12px] sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href={waLink(visitMsg)} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-[12px] sm:text-sm font-bold text-white">
                <CalendarDays className="w-4 h-4" /> Book visit
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen photo viewer */}
      {fullscreen !== null && images.length > 0 && (
        <FullscreenViewer images={images.map((u) => img(u, 1600))} start={fullscreen} title={title} onClose={() => setFullscreen(null)} fsRef={fsRef} />
      )}
    </div>
  );
};

const FullscreenViewer: React.FC<{
  images: string[];
  start: number;
  title: string;
  onClose: () => void;
  fsRef: React.RefObject<HTMLDivElement | null>;
}> = ({ images, start, title, onClose, fsRef }) => {
  const [i, setI] = useState(start);
  useEffect(() => {
    const el = fsRef.current;
    if (el) el.scrollTo({ left: start * el.clientWidth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const go = (n: number) => {
    const el = fsRef.current;
    if (!el) return;
    const k = (n + images.length) % images.length;
    el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' });
  };
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" role="dialog" aria-label={`${title} photos`}>
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-semibold">{i + 1} / {images.length}</span>
        <button type="button" onClick={onClose} aria-label="Close photos" className="p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div
        ref={fsRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          setI(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory bmh-noscroll"
      >
        {images.map((u, k) => (
          <div key={k} className="shrink-0 w-full h-full snap-center flex items-center justify-center">
            <img src={u} alt={`${title} – photo ${k + 1}`} loading={Math.abs(k - start) <= 1 ? 'eager' : 'lazy'} decoding="async" className="max-w-full max-h-full object-contain" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="hidden sm:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-4 pointer-events-none">
          <button type="button" onClick={() => go(i - 1)} aria-label="Previous photo" className="pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"><ChevronLeft className="w-6 h-6" /></button>
          <button type="button" onClick={() => go(i + 1)} aria-label="Next photo" className="pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"><ChevronRight className="w-6 h-6" /></button>
        </div>
      )}
    </div>
  );
};
