import { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { ThreeBackground, HeroSlide } from './components/ThreeBackground';
import { NavLink } from './components/NavLink';
import {
  parseLocation,
  pathForTab,
  propertyPath,
  metaFor,
  applyMeta,
  optimizeImage,
  CATEGORY_PATHS,
  Tab,
} from './seo';
import { LogoIntro } from './components/LogoIntro';
import { Header } from './components/Header';
import { PropertyCard } from './components/PropertyCard';
import { PropertyShowcase } from './components/PropertyShowcase';
import { Mascot } from './components/Mascot';
import { BannerCarousel } from './components/BannerCarousel';
import { Ticker } from './components/Ticker';
import { HeroBanners } from './components/HeroBanners';
import { PromoStrip } from './components/PromoStrip';
import { CtaBanner } from './components/CtaBanner';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import WizardModal from './components/WizardModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import Blog from './components/Blog';
import {
  Property,
  User,
  CategoryType,
  WizardData,
} from './types';
import {
  GOOGLE_ACCOUNTS,
  REGISTERED_USERS,
} from './data/initialProperties';
import {
  subscribeToProperties,
  savePropertyToFirestore,
  updatePropertyInFirestore,
  deletePropertyFromFirestore,
  saveUserToFirestore,
} from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  ShieldCheck,
  Sliders,
  Search,
  MapPin,
  ChevronDown,
  ArrowRight,
  House,
  Key,
  Umbrella,
  Grid3X3,
  SearchX,
  Heart,
  PlusCircle,
  ArrowLeft,
  Clock,
} from 'lucide-react';

export default function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  // Logo moment on every page change (bumped by navigation; 0 = none showing)
  const [navIntro, setNavIntro] = useState(0);
  const playNavIntro = () => setNavIntro((n) => n + 1);
  const [activeVillaIndex, setActiveVillaIndex] = useState(0);
  // The page shown comes from the URL, so every page has its own address (/rentals, /property/<id>, ...)
  const initialRoute = useMemo(() => parseLocation(window.location.pathname, window.location.search), []);
  const [currentTab, setCurrentTab] = useState<Tab>(initialRoute.tab);
  const [activeFilterCategory, setActiveFilterCategory] = useState<CategoryType>(initialRoute.category);
  const [requestedPropertyId, setRequestedPropertyId] = useState<string | null>(initialRoute.propertyId);
  const [propertiesLoaded, setPropertiesLoaded] = useState(false);
  const [selectedRentType, setSelectedRentType] = useState<'All' | 'Monthly' | 'Daily'>('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterBhk, setFilterBhk] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  const [isUrlLoading, setIsUrlLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bmh_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem('bmh_current_user');
      }
    }
    return null;
  });

  const [savedProperties, setSavedProperties] = useState<number[]>(() => {
    const saved = localStorage.getItem('bmh_saved_properties');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [1, 3];
  });

  const [properties, setProperties] = useState<Property[]>([]);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleToggleStatus = async (property: Property) => {
    const propertyId = String((property as any).id || (property as any)._id);
    const newStatus = property.status === 'Booked' ? 'Available' : 'Booked';

    try {
      const propertyRef = doc(db, "properties", propertyId);
      await updateDoc(propertyRef, { status: newStatus });

      setProperties((prev) =>
        prev.map((p) =>
          (String((p as any).id || (p as any)._id) === propertyId)
            ? { ...p, status: newStatus }
            : p
        )
      );

      if (selectedProperty && (String((selectedProperty as any).id || (selectedProperty as any)._id) === propertyId)) {
        setSelectedProperty({ ...selectedProperty, status: newStatus });
      }

      await updatePropertyInFirestore(propertyId, { status: newStatus });
    } catch (error) {
      console.error("Error toggling status in Firebase:", error);
    }
  };

  // Back/forward buttons: re-read the page from the URL.
  useEffect(() => {
    const onPop = () => {
      const route = parseLocation(window.location.pathname, window.location.search);
      if (!route.propertyId) playNavIntro();
      setCurrentTab(route.tab);
      if (route.tab === 'listings') setActiveFilterCategory(route.category);
      setRequestedPropertyId(route.propertyId);
      if (!route.propertyId) setSelectedProperty(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Open the property from the URL (/property/<id> or the older ?propertyId=<id> share links) once listings are loaded.
  useEffect(() => {
    if (!requestedPropertyId) return;
    const found = properties.find((p) => String(p.id) === requestedPropertyId);
    if (found) {
      setSelectedProperty(found);
      if (found.category) setActiveFilterCategory(found.category);
      setIsUrlLoading(false);
    } else if (propertiesLoaded) {
      setIsUrlLoading(false);
      setRequestedPropertyId(null);
      setCurrentTab('not_found');
    } else {
      setIsUrlLoading(true);
    }
  }, [requestedPropertyId, properties, propertiesLoaded]);

  // Per-page <title>, description, canonical and link-preview tags.
  useEffect(() => {
    applyMeta(metaFor({ tab: currentTab, category: activeFilterCategory, propertyId: null }, selectedProperty));
  }, [currentTab, activeFilterCategory, selectedProperty]);

  const pushPath = (path: string, withIntro = false) => {
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState({}, '', path);
      if (withIntro) playNavIntro();
    }
  };

  const openProperty = (prop: Property) => {
    setSelectedProperty(prop);
    setRequestedPropertyId(String(prop.id));
    pushPath(propertyPath(prop.id));
  };

  const closeProperty = () => {
    setSelectedProperty(null);
    setRequestedPropertyId(null);
    if (currentTab === 'not_found') return;
    pushPath(pathForTab(currentTab, activeFilterCategory));
  };

  const [registeredUsers, setRegisteredUsers] = useState<(User & { password?: string })[]>(() => {
    const saved = localStorage.getItem('bmh_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return REGISTERED_USERS;
  });

  useEffect(() => {
    localStorage.setItem('bmh_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const handleRegisterUser = (newUser: User & { password?: string }) => {
    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (exists) return prev;
      return [...prev, newUser];
    });
    saveUserToFirestore(newUser).catch(() => {});
  };

  useEffect(() => {
    localStorage.setItem('bmh_saved_properties', JSON.stringify(savedProperties));
  }, [savedProperties]);

  useEffect(() => {
    // Listings come only from the live database (no demo listings are seeded from code any more).
    const unsubscribe = subscribeToProperties((liveProperties) => {
      setPropertiesLoaded(true);
      if (liveProperties && liveProperties.length > 0) {
        setProperties(liveProperties);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN').format(val || 0);
  };

  const navigateTo = (tab: any) => {
    setCurrentTab(tab);
    setSelectedProperty(null);
    setRequestedPropertyId(null);
    pushPath(pathForTab(tab, activeFilterCategory), true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (cat: CategoryType) => {
    setActiveFilterCategory(cat);
    setSelectedRentType('All');
    setCurrentTab('listings');
    setSelectedProperty(null);
    setRequestedPropertyId(null);
    pushPath(pathForTab('listings', cat), true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterByLocation = (city: string) => {
    setFilterCity(city);
    setCurrentTab('listings');
    pushPath(pathForTab('listings', activeFilterCategory), true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hero background: real photos from the live rental listings (no stock photos).
  const heroSlides: HeroSlide[] = useMemo(() => {
    return properties
      .filter((p) => p.category === 'Rent' && String(p.status).toLowerCase() !== 'booked')
      .map((p) => ({ p, img: (p.images || []).find((i) => typeof i === 'string' && i.includes('res.cloudinary.com')) }))
      .filter((x) => !!x.img)
      .slice(0, 6)
      .map(({ p, img }) => ({
        id: String(p.id),
        name: String(p.title || '').trim() || `${p.bhk} for rent`,
        location: [String(p.locality || '').trim(), p.city].filter(Boolean).join(', '),
        image: optimizeImage(img as string, 1600),
        thumb: optimizeImage(img as string, 120),
        onOpen: () => openProperty(p),
      }));
  }, [properties]);

  // Home "Homes available now" strip: same real-photo rule as the hero (Cloudinary uploads only, not booked).
  const showcaseProperties: Property[] = useMemo(() => {
    const real = properties.filter(
      (p) =>
        String(p.status).toLowerCase() !== 'booked' &&
        (p.images || []).some((i) => typeof i === 'string' && i.includes('res.cloudinary.com'))
    );
    const rank = (p: Property) => (p.category === 'Rent' ? 0 : 1);
    return [...real].sort((a, b) => rank(a) - rank(b)).slice(0, 12);
  }, [properties]);

  // Scroll reveal for anything marked data-reveal (one observer for the whole app).
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('bmh-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
      root.classList.remove('bmh-reveal');
    };
  }, []);

  const countByCategory = (cat: CategoryType) => {
    return properties.filter((p) => p.category === cat).length;
  };

  const isSaved = (id: number) => savedProperties.includes(id);

  const toggleSave = (id: number) => {
    setSavedProperties((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteProperty = async (id: number | string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setProperties((prev) => prev.filter((p) => (p.id || (p as any)._id) !== id));
      if (selectedProperty && ((selectedProperty as any).id || (selectedProperty as any)._id) === id) {
        setSelectedProperty(null);
      }
      try {
        await deletePropertyFromFirestore(id);
      } catch (error) {
        console.error("Error deleting property from Firebase:", error);
      }
    }
  };

  const openWizard = () => {
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setIsEditing(false);
      setEditingId(null);
      setShowWizardModal(true);
    }
  };

  const handleEditProperty = async (updatedProperty: Property) => {
    const targetId = (updatedProperty as any).id || (updatedProperty as any)._id;
    
    setProperties((prev) =>
      prev.map((p) => ((p.id || (p as any)._id) === targetId ? updatedProperty : p))
    );
    if (selectedProperty && ((selectedProperty as any).id || (selectedProperty as any)._id) === targetId) {
      setSelectedProperty(updatedProperty);
    }

    try {
      await updatePropertyInFirestore(targetId, updatedProperty);
    } catch (error) {
      console.error("Error updating property in Firebase:", error);
    }
  };

  const handlePublishListing = async (
    wizardData: WizardData,
    editingFlag: boolean,
    editId: number | null
  ) => {
    const payload: Property = {
      id: editingFlag && editId ? editId : Date.now(),
      title: wizardData.title || 'New Verified Property',
      category: wizardData.category,
      status: wizardData.status || 'Available',
      city: wizardData.city,
      locality: wizardData.locality,
      bhk: wizardData.bhk,
      area: wizardData.area,
      price: wizardData.price,
      deposit: wizardData.deposit,
      availDate: wizardData.availDate,
      propertyAge: wizardData.propertyAge,
      bathrooms: wizardData.bathrooms,
      balconies: wizardData.balconies,
      furnishing: wizardData.furnishing,
      furnishings: wizardData.furnishings,
      amenities: wizardData.amenities,
      propType: wizardData.propType,
      subType: wizardData.subType,
      ownerId: currentUser ? currentUser.id : 'usr_guest',
      ownerName: currentUser ? currentUser.name : 'Owner',
      description: 'Verified real estate property posted via BookMyHomez multi-step listing wizard.',
      images: wizardData.images,
    };

    if (editingFlag && editId) {
      setProperties((prev) =>
        prev.map((p) => ((p.id || (p as any)._id) === editId ? payload : p))
      );
    } else {
      setProperties((prev) => [payload, ...prev]);
    }

    setShowWizardModal(false);
    navigateTo('my_properties');

    try {
      if (editingFlag && editId) {
        await updatePropertyInFirestore(editId, payload);
      } else {
        await savePropertyToFirestore(payload);
      }
    } catch (error) {
      console.error("Error saving/updating property in Firebase:", error);
    }
  };

  const filteredProperties = useMemo(() => {
    let result = properties.filter((item) => {
      const matchCat =
        activeFilterCategory === 'All' || item.category === activeFilterCategory;
      
      let matchRentType = true;
      if (activeFilterCategory === 'Rent' && selectedRentType !== 'All') {
        matchRentType = item.rentType === selectedRentType;
      }

      const matchCity =
        filterCity === 'All' ||
        item.city.toLowerCase() === filterCity.toLowerCase();
      const matchBhk = filterBhk === 'All' || item.bhk === filterBhk;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchCat && matchRentType && matchCity && matchBhk && matchQuery;
    });

    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => Number((b as any).id || (b as any)._id) - Number((a as any).id || (a as any)._id));
    }

    return result;
  }, [properties, activeFilterCategory, selectedRentType, filterCity, filterBhk, searchQuery, sortBy]);

  const savedListings = useMemo(() => {
    return properties.filter((p) => savedProperties.includes(Number((p as any).id || (p as any)._id)));
  }, [properties, savedProperties]);

  const userProperties = useMemo(() => {
    return currentUser
      ? properties.filter(
          (p) => p.ownerId === currentUser.id || currentUser.role === 'Administrator'
        )
      : [];
  }, [properties, currentUser]);

  const resetFilters = () => {
    setFilterCity('All');
    setFilterBhk('All');
    setActiveFilterCategory('All');
    setSelectedRentType('All');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white relative">
      
      <ThreeBackground
        slides={currentTab === 'explore' ? heroSlides : []}
        activeVillaIndex={activeVillaIndex}
        onVillaChange={setActiveVillaIndex}
      />

      <div className="flex flex-col flex-1 min-h-screen relative z-10">
        {showSplashScreen && (
          <LogoIntro variant="first" onDone={() => setShowSplashScreen(false)} />
        )}
        {!showSplashScreen && navIntro > 0 && (
          <LogoIntro key={navIntro} variant="nav" onDone={() => setNavIntro(0)} />
        )}

        {isUrlLoading && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 text-center text-amber-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 backdrop-blur-md">
            <Clock className="w-4 h-4 animate-spin text-amber-400" />
            <span>Property details is loding please wait a minute.</span>
          </div>
        )}

        <Header
          currentTab={currentTab}
          activeFilterCategory={activeFilterCategory}
          navigateTo={navigateTo}
          navigateToCategory={navigateToCategory}
          openWizard={openWizard}
          openAuthModal={() => setShowAuthModal(true)}
          savedCount={savedProperties.length}
          currentUser={currentUser}
          myPropertiesCount={userProperties.length}
          logout={() => setCurrentUser(null)}
        />

        <PromoStrip />

        <main className="flex-1">
          {currentTab === 'blog' && (
            <Blog />
          )}
          {currentTab === 'not_found' && (
            <section className="max-w-3xl mx-auto px-4 py-24 text-center">
              <SearchX className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Page not found</h1>
              <p className="text-sm text-slate-400 mb-8">
                This page doesn’t exist or the listing has been removed. See the homes available for rent right now.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <NavLink
                  href="/rentals"
                  onNavigate={() => navigateToCategory('Rent')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                  Flats for rent in Bangalore
                </NavLink>
                <NavLink
                  href="/"
                  onNavigate={() => navigateTo('explore')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl text-sm border border-slate-700"
                >
                  Home
                </NavLink>
              </div>
            </section>
          )}
          {currentTab === 'explore' && (
            <div>
              <HeroBanners
                properties={showcaseProperties}
                rentalsHref={CATEGORY_PATHS['Rent']}
                onRentals={() => navigateToCategory('Rent')}
              />

              <section className="relative min-h-[540px] lg:min-h-[620px] flex items-center justify-center px-4 py-16 overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 w-full min-w-0 max-w-4xl mx-auto text-center">
                  <div className="animate-hero-text-stagger">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-lg">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      1BHK • 2BHK • PG • Bangalore
                    </span>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none mb-6 break-words">
                      Flats &amp; PGs for Rent in{' '}
                      <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
                        Bangalore
                      </span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
                      1BHK, 2BHK and 3BHK flats and PGs for rent in HSR Layout and across Bangalore.
                      Call or WhatsApp <a href="tel:+919916475749" className="text-white font-bold underline decoration-indigo-400/60">99164 75749</a> to book a visit.
                    </p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-xl p-3 sm:p-5 rounded-3xl shadow-2xl border border-slate-700/60 max-w-3xl mx-auto text-left">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
                      {(
                        ['All', 'Buy', 'Rent', 'Short Stay', 'Plots'] as CategoryType[]
                      ).map((cat) => (
                        <NavLink
                          key={cat}
                          href={CATEGORY_PATHS[cat]}
                          onNavigate={() => navigateToCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                            activeFilterCategory === cat && currentTab === 'listings'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                          }`}
                        >
                          {cat === 'All' ? 'All Categories' : cat}
                        </NavLink>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                          Location / City
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-indigo-400" />
                          <select
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 appearance-none"
                          >
                            <option value="All">All Cities (India)</option>
                            <option value="Bengaluru">Bengaluru</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Pune">Pune</option>
                            <option value="Jaipur">Jaipur</option>
                            <option value="Delhi NCR">Delhi NCR</option>
                            <option value="Hyderabad">Hyderabad</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-3.5 text-slate-500 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                          Search Keywords
                        </label>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Society, locality, BHK..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                            BHK Config
                          </label>
                          <select
                            value={filterBhk}
                            onChange={(e) => setFilterBhk(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="All">Any BHK</option>
                            <option value="1 BHK">1 BHK</option>
                            <option value="2 BHK">2 BHK</option>
                            <option value="3 BHK">3 BHK</option>
                            <option value="4+ BHK">4+ BHK / Villa</option>
                          </select>
                        </div>
                        <button
                          onClick={() => navigateToCategory(activeFilterCategory)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" /> Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {showcaseProperties.length > 0 && (
                <Ticker properties={showcaseProperties} formatCurrency={formatCurrency} />
              )}

              <BannerCarousel
                properties={showcaseProperties}
                formatCurrency={formatCurrency}
                onOpen={openProperty}
              />

              <PropertyShowcase
                properties={showcaseProperties}
                loaded={propertiesLoaded}
                formatCurrency={formatCurrency}
                onOpen={openProperty}
                viewAllHref={CATEGORY_PATHS['All']}
                onViewAll={() => navigateToCategory('All')}
              />

              <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Explore Categories
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Select a category to view dedicated property listings on a new page
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  <NavLink
                    data-reveal=""
                    style={{ '--reveal-delay': '0ms' } as CSSProperties}
                    href={CATEGORY_PATHS['Buy']}
                    onNavigate={() => navigateToCategory('Buy')}
                    className="block group cursor-pointer bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 transition duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                      <House className="w-6 h-6" />
                    </div>
                    <h2 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
                      Homes to Buy
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Luxury flats, apartments & villas
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-400 mt-4">
                      Browse {countByCategory('Buy')} listings{' '}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition transform" />
                    </span>
                  </NavLink>

                  <NavLink
                    data-reveal=""
                    style={{ '--reveal-delay': '90ms' } as CSSProperties}
                    href={CATEGORY_PATHS['Rent']}
                    onNavigate={() => navigateToCategory('Rent')}
                    className="block group cursor-pointer bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                      <Key className="w-6 h-6" />
                    </div>
                    <h2 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                      Rentals & PGs
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Furnished flats & coliving spaces
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-400 mt-4">
                      Browse {countByCategory('Rent')} listings{' '}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition transform" />
                    </span>
                  </NavLink>

                  <NavLink
                    data-reveal=""
                    style={{ '--reveal-delay': '180ms' } as CSSProperties}
                    href={CATEGORY_PATHS['Short Stay']}
                    onNavigate={() => navigateToCategory('Short Stay')}
                    className="block group cursor-pointer bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                      <Umbrella className="w-6 h-6" />
                    </div>
                    <h2 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                      Short Stays
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Serviced homes & vacation retreats
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-400 mt-4">
                      Browse {countByCategory('Short Stay')} listings{' '}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition transform" />
                    </span>
                  </NavLink>

                  <NavLink
                    data-reveal=""
                    style={{ '--reveal-delay': '270ms' } as CSSProperties}
                    href={CATEGORY_PATHS['Plots']}
                    onNavigate={() => navigateToCategory('Plots')}
                    className="block group cursor-pointer bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/90 transition duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                      <Grid3X3 className="w-6 h-6" />
                    </div>
                    <h2 className="text-base font-bold text-white group-hover:text-violet-400 transition">
                      Land & Plots
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Residential & commercial land
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-violet-400 mt-4">
                      Browse {countByCategory('Plots')} listings{' '}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition transform" />
                    </span>
                  </NavLink>
                </div>
              </section>
            </div>
          )}

          {currentTab === 'listings' && (
            <section className="max-w-7xl mx-auto px-4 py-8">
              <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30 p-6 sm:p-8 rounded-3xl border border-slate-800 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <NavLink
                    href="/"
                    onNavigate={() => navigateTo('explore')}
                    className="hover:text-indigo-400 flex items-center gap-1 transition cursor-pointer"
                  >
                    <House className="w-3.5 h-3.5" /> Home
                  </NavLink>
                  <span>/</span>
                  <span className="text-indigo-400 font-bold uppercase tracking-wider">
                    {activeFilterCategory === 'All' ? 'All Properties' : activeFilterCategory}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                      {activeFilterCategory === 'All'
                        ? 'All Properties in Bangalore'
                        : activeFilterCategory === 'Buy'
                        ? 'Homes for Sale in Bangalore'
                        : activeFilterCategory === 'Rent'
                        ? 'Flats for Rent in Bangalore'
                        : activeFilterCategory === 'Short Stay'
                        ? 'Short Stay Flats in Bangalore'
                        : activeFilterCategory === 'Plots'
                        ? 'Land & Residential Plots'
                        : 'PGs & Co-living in Bangalore'}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Displaying {filteredProperties.length} verified listings matching your preferences
                    </p>
                  </div>

                  <NavLink
                    href="/"
                    onNavigate={() => navigateTo('explore')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                  </NavLink>
                </div>

                <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar pt-4 border-t border-slate-800/80">
                  {(
                    ['All', 'Buy', 'Rent', 'Short Stay', 'Plots'] as CategoryType[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveFilterCategory(cat);
                        setSelectedRentType('All');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                        activeFilterCategory === cat
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat === 'All' ? 'All Types' : cat}
                    </button>
                  ))}
                </div>

                {activeFilterCategory === 'Rent' && (
                  <div className="flex items-center gap-2 my-3 overflow-x-auto pb-1">
                    <button
                      onClick={() => setSelectedRentType('All')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                        selectedRentType === 'All'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      All Rentals
                    </button>
                    <button
                      onClick={() => setSelectedRentType('Monthly')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                        selectedRentType === 'Monthly'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Monthly Rent
                    </button>
                    <button
                      onClick={() => setSelectedRentType('Daily')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                        selectedRentType === 'Daily'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Daily Rent
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mb-8 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                    City
                  </label>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                  >
                    <option value="All">All Cities</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                    BHK Config
                  </label>
                  <select
                    value={filterBhk}
                    onChange={(e) => setFilterBhk(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                  >
                    <option value="All">Any BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4+ BHK">4+ BHK / Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                    Search Keywords
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locality..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">
                    Sort Order
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
                  <SearchX className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">No properties found</h3>
                  <p className="text-xs text-slate-500">
                    Try adjusting your filters or resetting your search criteria
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((item, idx) => (
                    <PropertyCard
                      revealIndex={idx}
                      key={String((item as any).id || (item as any)._id)}
                      property={item}
                      currentUser={currentUser}
                      isSaved={isSaved(Number((item as any).id || (item as any)._id))}
                      onToggleSave={(id) => toggleSave(Number(id))}
                      onViewDetails={(prop) => openProperty(prop)}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {currentTab === 'favorites' && (
            <section className="max-w-7xl mx-auto px-4 py-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> Saved Properties
                  </h2>
                </div>
                <NavLink
                  href="/"
                  onNavigate={() => navigateTo('explore')}
                  className="text-xs bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300 hover:text-white cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </NavLink>
              </div>

              {savedListings.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                  <Heart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">No Saved Properties</h3>
                  <p className="text-xs text-slate-500">
                    Click the heart icon on any property to bookmark it here
                  </p>
                  <NavLink
                    href="/"
                    onNavigate={() => navigateTo('explore')}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer transition"
                  >
                    Explore Homes
                  </NavLink>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedListings.map((item, idx) => (
                    <PropertyCard
                      revealIndex={idx}
                      key={String((item as any).id || (item as any)._id)}
                      property={item}
                      currentUser={currentUser}
                      isSaved={true}
                      onToggleSave={(id) => toggleSave(Number(id))}
                      onViewDetails={(prop) => openProperty(prop)}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {currentTab === 'my_properties' && (
            <section className="max-w-7xl mx-auto px-4 py-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    My Listed Properties ({currentUser ? currentUser.name : ''})
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage and update properties you have published
                  </p>
                </div>
                <button
                  onClick={openWizard}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
                >
                  <PlusCircle className="w-4 h-4" /> Post Property
                </button>
              </div>

              {userProperties.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                  <h3 className="text-lg font-bold text-white mb-1">
                    No Properties Posted by You
                  </h3>
                  <p className="text-xs text-slate-500">
                    You haven't published any property listings yet
                  </p>
                  <button
                    onClick={openWizard}
                    className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-blue-600/30 transition"
                  >
                    Post Property Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userProperties.map((item, idx) => (
                    <PropertyCard
                      revealIndex={idx}
                      key={String((item as any).id || (item as any)._id)}
                      property={item}
                      currentUser={currentUser}
                      isSaved={isSaved(Number((item as any).id || (item as any)._id))}
                      onToggleSave={(id) => toggleSave(Number(id))}
                      onViewDetails={(prop) => openProperty(prop)}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        <PropertyDetailsModal
          property={selectedProperty}
          currentUser={currentUser}
          onClose={closeProperty}
          onToggleStatus={handleToggleStatus}
          formatCurrency={formatCurrency}
        />

        <WizardModal
          isOpen={showWizardModal}
          isEditing={isEditing}
          editingId={editingId}
          currentUser={currentUser}
          onClose={() => setShowWizardModal(false)}
          onPublish={handlePublishListing}
          formatCurrency={formatCurrency}
        />

        <AuthModal
          isOpen={showAuthModal}
          googleAccounts={GOOGLE_ACCOUNTS}
          registeredUsers={registeredUsers}
          onClose={() => setShowAuthModal(false)}
          onRegisterUser={handleRegisterUser}
          onSelectGoogleAccount={(acc) => {
            const userObj: User = {
              name: acc.name,
              email: acc.email,
              role: 'Verified Owner',
              avatar: acc.avatar,
              id: 'usr_' + acc.email.replace(/[^a-zA-Z0-9]/g, '_'),
            };
            setCurrentUser(userObj);
            setShowAuthModal(false);
            openWizard();
          }}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
        />

        <CtaBanner rentalsHref={CATEGORY_PATHS['Rent']} onRentals={() => navigateToCategory('Rent')} />

        <Footer
          navigateToCategory={navigateToCategory}
          filterByLocation={filterByLocation}
        />

        {!showSplashScreen && (
          <Mascot href={CATEGORY_PATHS['Rent']} onNavigate={() => navigateToCategory('Rent')} />
        )}
      </div>
    </div>
  );
}
