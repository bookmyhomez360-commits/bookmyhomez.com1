import { useState, useEffect, useMemo } from 'react';
import { ThreeBackground } from './components/ThreeBackground';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import  WizardModal  from './components/WizardModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import {
  Property,
  User,
  CategoryType,
  WizardData,
} from './types';
import {
  INITIAL_PROPERTIES,
  GOOGLE_ACCOUNTS,
  REGISTERED_USERS,
} from './data/initialProperties';
import {
  seedInitialPropertiesIfEmpty,
  seedInitialUsersIfEmpty,
  subscribeToProperties,
  savePropertyToFirestore,
  updatePropertyInFirestore,
  deletePropertyFromFirestore,
  saveUserToFirestore,
} from './firebase';
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
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Maximize2
} from 'lucide-react';

export default function App() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [activeVillaIndex, setActiveVillaIndex] = useState(0);
  const [isVillaPaused, setIsVillaPaused] = useState(false);
  const [currentTab, setCurrentTab] = useState<'explore' | 'listings' | 'favorites' | 'my_properties'>('explore');
  const [activeFilterCategory, setActiveFilterCategory] = useState<CategoryType>('All');
  const [selectedRentType, setSelectedRentType] = useState<'All' | 'Monthly' | 'Daily'>('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterBhk, setFilterBhk] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  // Loading instruction state for direct URL property links
  const [isUrlLoading, setIsUrlLoading] = useState(false);

  // User State
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

  // Saved Properties State
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

  // Properties State
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);

  // Modals State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Featured showcase villas for Left side (Previously right, now moved)
  const showcaseVillas = useMemo(() => {
    return properties.filter(p => p.category === 'Buy' || p.category === 'Short Stay').slice(0, 5);
  }, [properties]);

  // Auto-rotate showcase villas if not paused
  useEffect(() => {
    if (isVillaPaused || showcaseVillas.length === 0) return;
    const interval = setInterval(() => {
      setActiveVillaIndex((prev) => (prev + 1) % showcaseVillas.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVillaPaused, showcaseVillas.length]);

  // URL లో propertyId unte automatic ga modal open cheyadaniki
  useEffect(() => {
    const checkUrlProperty = () => {
      const params = new URLSearchParams(window.location.search);
      const propIdParam = params.get('propertyId');
      if (propIdParam) {
        setIsUrlLoading(true);
        const timer = setTimeout(() => {
          const found = properties.find((p) => String(p.id) === propIdParam) || 
                        INITIAL_PROPERTIES.find((p) => String(p.id) === propIdParam);
          if (found) {
            setSelectedProperty(found);
          }
          setIsUrlLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
      } else {
        setSelectedProperty(null);
        setIsUrlLoading(false);
      }
    };

    checkUrlProperty();
    window.addEventListener('popstate', checkUrlProperty);
    return () => window.removeEventListener('popstate', checkUrlProperty);
  }, [properties]);

  // Registered Users State
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

  // Real-time Firestore sync & initial seeding
  useEffect(() => {
    seedInitialPropertiesIfEmpty();
    seedInitialUsersIfEmpty();

    const unsubscribe = subscribeToProperties((liveProperties) => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (cat: CategoryType) => {
    setActiveFilterCategory(cat);
    setSelectedRentType('All');
    setCurrentTab('listings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterByLocation = (city: string) => {
    setFilterCity(city);
    setCurrentTab('listings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const countByCategory = (cat: CategoryType) => {
    return properties.filter((p) => p.category === cat).length;
  };

  const isSaved = (id: number) => savedProperties.includes(id);

  const toggleSave = (id: number) => {
    setSavedProperties((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleStatus = async (item: Property) => {
    const updatedStatus = item.status === 'Booked' ? 'Available' : 'Booked';
    setProperties((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: updatedStatus } : p))
    );
    if (selectedProperty && selectedProperty.id === item.id) {
      setSelectedProperty({ ...selectedProperty, status: updatedStatus });
    }

    try {
      await updatePropertyInFirestore(item.id, { status: updatedStatus });
      await fetch(`/api/properties/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedStatus }),
      });
    } catch {
      // ignore
    }
  };

  const handleDeleteProperty = async (id: number) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      if (selectedProperty && selectedProperty.id === id) {
        setSelectedProperty(null);
      }
      try {
        await deletePropertyFromFirestore(id);
        await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      } catch {
        // ignore
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

  const openEditWizard = (item: Property) => {
    setIsEditing(true);
    setEditingId(item.id);
    setShowWizardModal(true);
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
        prev.map((p) => (p.id === editId ? payload : p))
      );
    } else {
      setProperties((prev) => [payload, ...prev]);
    }

    setShowWizardModal(false);
    navigateTo('my_properties');

    try {
      await savePropertyToFirestore(payload);
      if (editingFlag && editId) {
        await fetch(`/api/properties/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // ignore
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
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [properties, activeFilterCategory, selectedRentType, filterCity, filterBhk, searchQuery, sortBy]);

  const savedListings = useMemo(() => {
    return properties.filter((p) => savedProperties.includes(p.id));
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
      
      {/* 3D Villa Canvas Background */}
      <ThreeBackground
        activeVillaIndex={activeVillaIndex}
        onVillaChange={setActiveVillaIndex}
      />

      <div className="flex flex-col flex-1 min-h-screen relative z-10">
        
        {/* Splash Screen */}
        {showSplashScreen && (
          <SplashScreen onDismiss={() => setShowSplashScreen(false)} />
        )}

        {/* URL Loading Instruction Banner */}
        {isUrlLoading && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 text-center text-amber-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 backdrop-blur-md">
            <Clock className="w-4 h-4 animate-spin text-amber-400" />
            <span>Property link load avvataniki konchem time paduthundi. Dhayachesi 2 nimishalu (2 mins) wait cheyandi, property details ikkada load avthayi.</span>
          </div>
        )}

        {/* Header */}
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

        {/* Main Content Area */}
        <main className="flex-1">

          {currentTab === 'explore' && (
            <div>
              {/* Hero Section */}
              <section className="relative min-h-[540px] lg:min-h-[620px] flex items-center justify-center px-4 py-
