import React, { useState } from 'react';
import { WizardData, CategoryType } from '../types';
import { db } from '../firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import {
  X,
  MapPin,
  Crosshair,
  Search,
  PlusCircle,
  Armchair,
  ShieldAlert,
  Camera,
  Video,
  CheckCircle,
  Lock,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';

interface WizardModalProps {
  isOpen: boolean;
  isEditing: boolean;
  editingId: number | null;
  currentUser: any;
  onClose: () => void;
  onPublish: (wizardData: WizardData, isEditing: boolean, editingId: number | null) => void;
  formatCurrency: (val: number) => string;
}

const STEP_TITLES = [
  'Basic Intent & Title',
  'Property Location & GPS',
  'Property Configuration & Details',
  'Furnishings, Amenities & Pricing',
  'Media Photos & Video Upload',
  'Summary & Final Preview',
];

const SOCIETY_PRESETS = [
  'Prestige Shantiniketan',
  'Lodha Park',
  'Godrej Woods',
  'Sobha Dream Acres',
  'Brigade Meadows',
  'DLF CyberCity',
];

const AMENITY_OPTIONS = [
  'Lift',
  'Power Backup',
  'CCTV Security',
  'Swimming Pool',
  'Gymnasium',
  'Park / Garden',
  'Clubhouse',
  'Intercom',
];

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen,
  isEditing,
  editingId,
  currentUser,
  onClose,
  formatCurrency,
}) => {
  const [wizardStep, setWizardStep] = useState(1);
  const [societySearchQuery, setSocietySearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [wizardData, setWizardData] = useState<WizardData>({
    title: '',
    propType: 'Residential',
    category: 'Buy',
    rentType: 'Monthly',
    status: 'Available',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    subType: 'Apartment',
    bhk: '3 BHK',
    area: 1500,
    propertyAge: '1-5 Years',
    bathrooms: '2',
    balconies: '1',
    bedrooms: '3',
    facing: 'East',
    furnishing: 'Fully Furnished',
    furnishings: { Sofa: 1, Fridge: 1, AC: 2, TV: 1, Wardrobe: 2 },
    amenities: ['Lift', 'Power Backup', 'CCTV Security'],
    price: 12500000,
    deposit: 100000,
    availDate: '2026-03-01',
    images: [],
    videos: [],
  });

  if (!isOpen) return null;

  const progressPercent = Math.round((wizardStep / 6) * 100);

  const filteredSocieties = societySearchQuery
    ? SOCIETY_PRESETS.filter((s) =>
        s.toLowerCase().includes(societySearchQuery.toLowerCase())
      )
    : [];

  const useCurrentGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setWizardData((prev) => ({
            ...prev,
            locality: 'Indiranagar Prime (GPS Verified)',
          }));
          alert('Successfully fetched GPS location coordinates!');
        },
        () => {
          alert('Location access denied. Using default location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const addSocietyManually = () => {
    if (societySearchQuery) {
      setWizardData((prev) => ({ ...prev, locality: societySearchQuery }));
      setSocietySearchQuery('');
    }
  };

  const toggleAmenity = (amenity: string) => {
    setWizardData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const compressImage = async (base64Str: string, maxWidth = 600, maxHeight = 600, quality = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const base64String = await convertFileToBase64(file);
        const compressedBase64 = await compressImage(base64String);
        newImages.push(compressedBase64);
      } catch (err) {
        console.error("Error compressing image:", err);
      }
    }

    setWizardData((prev) => {
      const updatedImages = [...(prev.images || []), ...newImages];
      if (updatedImages.length > 30) {
        alert('Maximum 30 images allowed.');
        return { ...prev, images: updatedImages.slice(0, 30) };
      }
      return { ...prev, images: updatedImages };
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newVideoUrls: string[] = [];
    
    for (const file of Array.from(files)) {
      if (file.size > 50 * 1024 * 1024) {
        alert(`Video "${file.name}" is too large. Please upload a video under 50MB.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ztgcemri');

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/kl6agwow/video/upload',
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();
        
        if (data.secure_url) {
          newVideoUrls.push(data.secure_url);
        } else {
          throw new Error('Upload failed');
        }

      } catch (err) {
        console.error("Error uploading video to Cloudinary:", err);
        alert('Failed to upload video. Please try again.');
      }
    }

    setWizardData((prev) => {
      const existingVideos = prev.videos || [];
      const updatedVideos = [...existingVideos, ...newVideoUrls];
      
      if (updatedVideos.length > 2) {
        alert('Maximum 2 videos allowed.');
        return { ...prev, videos: updatedVideos.slice(0, 2) };
      }
      return { ...prev, videos: updatedVideos };
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePublishProperty = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const propertyId = editingId ? String(editingId) : String(Date.now());
      
      const propertyPayload = {
        ...wizardData,
        id: propertyId,
        ownerId: currentUser?.uid || 'anonymous_user',
        ownerEmail: currentUser?.email || 'unknown',
        createdAt: new Date().toISOString(),
      };

      const savePromise = isEditing && editingId
        ? setDoc(doc(db, 'properties', propertyId), propertyPayload, { merge: true })
        : addDoc(collection(db, 'properties'), propertyPayload);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase connection timeout.')), 10000)
      );

      await Promise.race([savePromise, timeoutPromise]);

      alert('Property published successfully!');
      setIsSubmitting(false);
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error('Firebase save error:', error);
      alert('Failed to publish property: ' + (error.message || 'Unknown error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {isEditing ? 'Edit Property' : 'Post Property Wizard'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                Step {wizardStep} of 6: {STEP_TITLES[wizardStep - 1]}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden relative border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-violet-500 via-amber-400 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-black text-indigo-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1 */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Property Name / Title *
                </label>
                <input
                  type="text"
                  value={wizardData.title}
                  onChange={(e) =>
                    setWizardData({ ...wizardData, title: e.target.value })
                  }
                  placeholder="e.g. Skyline Luxury 3BHK Apartment in Indiranagar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Property Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Residential', 'Commercial'].map((t) => (
                      <button
                        key={t}
                        onClick={() =>
                          setWizardData({ ...wizardData, propType: t })
                        }
                        className={`p-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                          wizardData.propType === t
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Listing Intent *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      ['Buy', 'Rent', 'Short Stay', 'Plots', 'PG/Co-living'] as CategoryType[]
                    ).map((cat) => (
                      <button
                        key={cat}
                        onClick={() =>
                          setWizardData({ ...wizardData, category: cat })
                        }
                        className={`p-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          wizardData.category === cat
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rent Type Selection (Monthly or Daily) if Rent intent is selected */}
              {wizardData.category === 'Rent' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Rental Duration Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setWizardData({ ...wizardData, rentType: 'Monthly' })}
                      className={`p-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        wizardData.rentType === 'Monthly' || !wizardData.rentType
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Monthly Rent
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardData({ ...wizardData, rentType: 'Daily' })}
                      className={`p-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        wizardData.rentType === 'Daily'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Daily Rent (Short Stay)
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Initial Availability Status *
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      setWizardData({ ...wizardData, status: 'Available' })
                    }
                    className={`flex-1 p-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                      wizardData.status !== 'Booked'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" /> Available
                  </button>
                  <button
                    onClick={() =>
                      setWizardData({ ...wizardData, status: 'Booked' })
                    }
                    className={`flex-1 p-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                      wizardData.status === 'Booked'
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Lock className="w-4 h-4" /> Booked
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Property Location & Society *
                </label>
                <button
                  onClick={useCurrentGPSLocation}
                  className="text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white px-3.5 py-2 rounded-xl border border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <Crosshair className="w-3.5 h-3.5" /> Use Current Location
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    City *
                  </label>
                  <select
                    value={wizardData.city}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, city: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Locality / Area *
                  </label>
                  <input
                    type="text"
                    value={wizardData.locality}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, locality: e.target.value })
                    }
                    placeholder="e.g. Indiranagar, Koramangala..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Search Building / Society Auto-complete
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={societySearchQuery}
                    onChange={(e) => setSocietySearchQuery(e.target.value)}
                    placeholder="Type society name e.g. Prestige Shantiniketan..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-3 text-xs text-white"
                  />
                </div>

                {societySearchQuery && (
                  <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1">
                    {filteredSocieties.map((soc) => (
                      <div
                        key={soc}
                        onClick={() => {
                          setWizardData({ ...wizardData, locality: soc });
                          setSocietySearchQuery('');
                        }}
                        className="px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-300 cursor-pointer flex items-center justify-between"
                      >
                        <span>
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 inline mr-2" />
                          {soc}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-bold">
                          Select
                        </span>
                      </div>
                    ))}
                    <div
                      onClick={addSocietyManually}
                      className="px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-amber-400 cursor-pointer flex items-center gap-2 border-t border-slate-800"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add "{societySearchQuery}" Manually
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Sub-Type
                  </label>
                  <select
                    value={wizardData.subType}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, subType: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Independent House / Villa">
                      Independent House / Villa
                    </option>
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Studio Apartment">Studio Apartment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    BHK Config
                  </label>
                  <select
                    value={wizardData.bhk}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, bhk: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold"
                  >
                    <option value="1 RK">1 RK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="1.5 BHK">1.5 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="2.5 BHK">2.5 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="3.5 BHK">3.5 BHK</option>
                    <option value="4+ BHK">4+ BHK / Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Built-up Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={wizardData.area}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        area: Number(e.target.value),
                      })
                    }
                    placeholder="1500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={wizardData.bedrooms}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, bedrooms: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  >
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5+">5+ Bedrooms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Bathrooms
                  </label>
                  <select
                    value={wizardData.bathrooms}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, bathrooms: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Balconies
                  </label>
                  <select
                    value={wizardData.balconies}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, balconies: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Facing Direction
                  </label>
                  <select
                    value={wizardData.facing || 'East'}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, facing: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold text-indigo-400"
                  >
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                    <option value="North-East">North-East</option>
                    <option value="North-West">North-West</option>
                    <option value="South-East">South-East</option>
                    <option value="South-West">South-West</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Property Age
                  </label>
                  <select
                    value={wizardData.propertyAge}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, propertyAge: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  >
                    <option value="Under Construction">Under Construction</option>
                    <option value="0-1 Years">0-1 Years (New)</option>
                    <option value="1-5 Years">1-5 Years</option>
                    <option value="5-10 Years">5-10 Years</option>
                    <option value="10+ Years">10+ Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Furnishing Status
                </label>
                <select
                  value={wizardData.furnishing}
                  onChange={(e) =>
                    setWizardData({ ...wizardData, furnishing: e.target.value })
                  }
                  className="w-full sm:w-1/3 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold text-indigo-400"
                >
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi Furnished">Semi Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              {wizardData.furnishing !== 'Unfurnished' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-indigo-400" /> Flat Furnishings & Appliances ({wizardData.furnishing}) - Select Qty
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      'Sofa',
                      'Fridge',
                      'AC',
                      'TV',
                      'Wardrobe',
                      'Washing Machine',
                      'Microwave',
                      'Chimney',
                    ].map((item) => (
                      <div
                        key={item}
                        className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center"
                      >
                        <span className="text-xs font-bold text-white mb-2">{item}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setWizardData((prev) => ({
                                ...prev,
                                furnishings: {
                                  ...prev.furnishings,
                                  [item]: Math.max(0, (prev.furnishings?.[item] || 0) - 1),
                                },
                              }))
                            }
                            className="w-7 h-7 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-indigo-400 w-5 text-center">
                            {wizardData.furnishings?.[item] || 0}
                          </span>
                          <button
                            onClick={() =>
                              setWizardData((prev) => ({
                                ...prev,
                                furnishings: {
                                  ...prev.furnishings,
                                  [item]: (prev.furnishings?.[item] || 0) + 1,
                                },
                              }))
                            }
                            className="w-7 h-7 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardData.furnishing === 'Unfurnished' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                  Property is Unfurnished. No appliances or furnishings configuration required.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Society Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const active = wizardData.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />} {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    {wizardData.category === 'Rent' && wizardData.rentType === 'Daily' ? 'Daily Rent Price (₹) *' : 'Price / Monthly Rent (₹) *'}
                  </label>
                  <input
                    type="number"
                    value={wizardData.price}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="45000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-black text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={wizardData.deposit}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        deposit: Number(e.target.value),
                      })
                    }
                    placeholder="100000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Availability Date
                  </label>
                  <input
                    type="date"
                    value={wizardData.availDate}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, availDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {wizardStep === 5 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-400" /> Photos & Video Upload
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Support up to 30 compressed images and 2 videos (up to 50MB via Cloudinary). First image is automatically set as Cover Photo.
                </p>

                {/* Photos Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {wizardData.images?.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group"
                    >
                      <img src={img} alt="Property" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                          Cover Photo
                        </span>
                      )}
                      <button
                        onClick={() =>
                          setWizardData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Photos Button */}
                  <label className="h-28 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500 bg-slate-950 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-white transition">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <PlusCircle className="w-5 h-5 mb-1" />
                    <span className="text-[11px] font-bold">Upload Photos</span>
                    <span className="text-[9px] text-slate-500">
                      ({wizardData.images?.length || 0}/30)
                    </span>
                  </label>
                </div>
              </div>

              {/* Video Walkthrough Section */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Video Walkthrough (Max 2 videos, up to 50MB each)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {wizardData.videos?.map((vid, idx) => (
                    <div
                      key={idx}
                      className="relative h-36 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center"
                    >
                      <video src={vid} controls className="w-full h-full object-cover" />
                      <button
                        onClick={() =>
                          setWizardData((prev) => ({
                            ...prev,
                            videos: (prev.videos || []).filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {(!wizardData.videos || wizardData.videos.length < 2) && (
                    <label className="h-36 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500 bg-slate-950 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-white transition">
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <Video className="w-6 h-6 mb-1 text-indigo-400" />
                      <span className="text-[11px] font-bold">Upload Videos</span>
                      <span className="text-[9px] text-slate-500">
                        ({wizardData.videos?.length || 0}/2)
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* STEP 6 - SUMMARY & COMPREHENSIVE DETAILS PREVIEW */}
          {wizardStep === 6 && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 font-black px-3 py-1 rounded-full uppercase">
                      {wizardData.category} {wizardData.category === 'Rent' ? `(${wizardData.rentType || 'Monthly'})` : ''}
                    </span>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                        wizardData.status === 'Booked'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {wizardData.status || 'Available'}
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-400">
                    ₹{formatCurrency(wizardData.price)} {wizardData.category === 'Rent' ? (wizardData.rentType === 'Daily' ? '/ day' : '/ month') : ''}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white">{wizardData.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {wizardData.locality}, {wizardData.city}
                </p>

                {/* Detailed Grid Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Sub-Type:</span>
                    <span className="font-bold text-white">{wizardData.subType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">BHK Config:</span>
                    <span className="font-bold text-white">{wizardData.bhk}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bedrooms:</span>
                    <span className="font-bold text-white">{wizardData.bedrooms}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bathrooms:</span>
                    <span className="font-bold text-white">{wizardData.bathrooms}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Balconies:</span>
                    <span className="font-bold text-white">{wizardData.balconies}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Built-up Area:</span>
                    <span className="font-bold text-white">{wizardData.area} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Facing:</span>
                    <span className="font-bold text-indigo-400">{wizardData.facing}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Property Age:</span>
                    <span className="font-bold text-white">{wizardData.propertyAge}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Furnishing:</span>
                    <span className="font-bold text-white">{wizardData.furnishing}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Deposit:</span>
                    <span className="font-bold text-white">₹{formatCurrency(wizardData.deposit)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Available From:</span>
                    <span className="font-bold text-white">{wizardData.availDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Media Uploaded:</span>
                    <span className="font-bold text-indigo-400">
                      {wizardData.images?.length || 0} Photos, {wizardData.videos?.length || 0} Videos
                    </span>
                  </div>
                </div>

                {/* Amenities & Furnishings Preview */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-slate-500 block text-xs mb-1">Amenities:</span>
                  <div className="flex flex-wrap gap-1">
                    {wizardData.amenities.map((amenity, i) => (
                      <span key={i} className="bg-slate-900 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
          {wizardStep > 1 ? (
            <button
              onClick={() => setWizardStep((prev) => prev - 1)}
              className="px-5 py-2.5 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {wizardStep < 6 ? (
            <button
              onClick={() => setWizardStep((prev) => prev + 1)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer flex items-center gap-2"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={handlePublishProperty}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> {isSubmitting ? 'Publishing...' : (isEditing ? 'Update Property' : 'Publish Property')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardModal;
