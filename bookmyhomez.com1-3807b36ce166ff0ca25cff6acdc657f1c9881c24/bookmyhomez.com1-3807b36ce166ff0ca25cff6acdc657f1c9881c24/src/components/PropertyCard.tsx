import React, { useState } from 'react';
import { Property, User } from '../types';
import { 
  Heart, MapPin, Bed, Maximize2, IndianRupee, 
  Edit3, Trash2, Clock, X, Save, Camera, Play, MessageCircle, CalendarDays
} from 'lucide-react';
import { doc, setDoc, getFirestore, deleteField } from "firebase/firestore";
import { ExtraDetailsFields, ExtraDetails, EXTRA_KEYS, filledExtras } from './ExtraDetailsFields';
import { NavLink } from './NavLink';
import { optimizeImage, propertyPath } from '../seo';
import { availableFrom, cleanTitle, isBooked, isTeam, niceLocality, statusKind, propertyImages, propertyUrl, propertyVideos, waLink } from '../propertyUtils';

interface PropertyCardProps {
  property: Property & { videoUrl?: string }; // added videoUrl support
  currentUser: User | null;
  isSaved: boolean;
  onToggleSave: (id: number | string) => void;
  onViewDetails: (property: Property) => void;
  onToggleStatus: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: number | string) => void;
  formatCurrency: (val: number) => string;
  revealIndex?: number; // position in its grid: staggers the scroll-in animation
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  currentUser,
  isSaved,
  onToggleSave,
  onViewDetails,
  onToggleStatus,
  onEdit,
  onDelete,
  formatCurrency,
  revealIndex,
}) => {
  const db = getFirestore();
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  
  // All Editable States
  const [editTitle, setEditTitle] = useState(property.title);
  const [editPrice, setEditPrice] = useState(property.price);
  const [editStatus, setEditStatus] = useState(property.status);
  const [editLocality, setEditLocality] = useState(property.locality);
  const [editCity, setEditCity] = useState(property.city);
  const [editRentType, setEditRentType] = useState(property.rentType || 'Monthly');
  const [editSubType, setEditSubType] = useState(property.subType || 'Apartment');
  const [editBhk, setEditBhk] = useState(property.bhk || '');
  const [editBedrooms, setEditBedrooms] = useState(property.bedrooms || '');
  const [editBathrooms, setEditBathrooms] = useState(property.bathrooms || '');
  const [editBalconies, setEditBalconies] = useState(property.balconies || '');
  const [editArea, setEditArea] = useState(property.area || '');
  const [editFacing, setEditFacing] = useState(property.facing || '');
  const [editPropertyAge, setEditPropertyAge] = useState(property.propertyAge || '');
  const [editFurnishing, setEditFurnishing] = useState(property.furnishing || 'Semi Furnished');
  const [editDeposit, setEditDeposit] = useState(property.deposit || 0);
  const [editAvailDate, setEditAvailDate] = useState(property.availDate || '');
  const [editDescription, setEditDescription] = useState(property.description || '');
  const [editVideoUrl, setEditVideoUrl] = useState(property.videoUrl || ''); // Video state
  const [editExtras, setEditExtras] = useState<ExtraDetails>(() => ({
    maintenance: (property as any).maintenance || '',
    floor: (property as any).floor || '',
    totalFloors: (property as any).totalFloors || '',
    parking: (property as any).parking || '',
    preferredTenant: (property as any).preferredTenant || '',
  }));

  const propertyId = (property as any).id || (property as any)._id;
  const photoCount = propertyImages(property).length;
  const videoCount = propertyVideos(property).length;
  const availFrom = availableFrom(property);
  // Only the BookMyHomez team can change a listing (the Firestore rules allow nobody else),
  // so only they see the switch. Every visitor sees the Available / Booked badge.
  const isOwnerOrAdmin = isTeam(currentUser);
  const status = statusKind(property);

  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Property & { videoUrl?: string } = {
      ...property,
      title: editTitle,
      price: Number(editPrice),
      status: editStatus as any,
      locality: editLocality,
      city: editCity,
      rentType: editRentType as any,
      subType: editSubType,
      bhk: editBhk,
      bedrooms: editBedrooms,
      bathrooms: editBathrooms,
      balconies: editBalconies,
      area: Number(editArea),
      facing: editFacing,
      propertyAge: editPropertyAge,
      furnishing: editFurnishing,
      deposit: Number(editDeposit),
      availDate: editAvailDate,
      description: editDescription,
      videoUrl: editVideoUrl, // Saving video URL
    };
    // optional extras: write the filled ones, remove the ones that were cleared
    const extras = filledExtras(editExtras);
    EXTRA_KEYS.forEach((k) => {
      if (extras[k]) (updated as any)[k] = extras[k];
      else if ((property as any)[k] !== undefined) (updated as any)[k] = deleteField();
      else delete (updated as any)[k];
    });

    try {
      const propertyRef = doc(db, "properties", String(propertyId));
      await setDoc(propertyRef, updated, { merge: true });
      
      const local: any = { ...updated };
      EXTRA_KEYS.forEach((k) => { if (!extras[k]) delete local[k]; });
      onEdit(local);
      setIsQuickEditing(false);
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to update property. Check console for details.");
    }
  };

  return (
    <div
      data-reveal=""
      style={{ '--reveal-delay': `${((revealIndex ?? 0) % 3) * 90}ms` } as React.CSSProperties}
      className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl hover:border-indigo-500/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-950/60 transition duration-300 flex flex-col relative group"
    >
      
      {/* Media & Badges (Image or Video) */}
      <div className="relative h-52 overflow-hidden bg-slate-950">
        {property.videoUrl ? (
          <video 
            src={property.videoUrl} 
            className="w-full h-full object-cover" 
            controls 
            preload="metadata"
          />
        ) : (
          <img 
            src={property.images?.[0] ? optimizeImage(property.images[0], 800) : '/og-image.jpg'} 
            alt={`${property.title} – ${property.bhk || ''} in ${property.locality || ''}`.trim()}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none"></div>
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold border border-slate-700">
            {property.category}
          </span>
          {status && (
            <span className={`px-3 py-1 rounded-xl backdrop-blur-md text-[11px] font-extrabold border ${
              status === 'booked' ? 'bg-rose-600 text-white border-rose-400' : 'bg-emerald-500 text-slate-950 border-emerald-300'
            }`}>
              {status === 'booked' ? 'Booked' : 'Available'}
            </span>
          )}
        </div>

        <button
          onClick={() => onToggleSave(propertyId)}
          aria-label={isSaved ? 'Remove from saved homes' : 'Save this home'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-800 transition cursor-pointer border border-slate-700 z-10"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="text-xl font-black text-white drop-shadow-md flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {formatCurrency(property.price)}
            {property.category === 'Rent' && (
              <span className="text-[10px] text-slate-300 font-normal ml-1">
                {property.rentType === 'Daily' ? '/ day' : '/mo'}
              </span>
            )}
          </div>
          {(photoCount > 0 || videoCount > 0) && (
            <div className="flex items-center gap-1.5">
              {videoCount > 0 && (
                <span className="flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white">
                  <Play className="w-3 h-3 fill-white" /> Video
                </span>
              )}
              {photoCount > 0 && (
                <span className="flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white" aria-label={`${photoCount} photos`}>
                  <Camera className="w-3 h-3" /> {photoCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
            <NavLink href={propertyPath(property.id)} onNavigate={() => onViewDetails(property)} className="hover:text-indigo-300 transition">
              {property.title}
            </NavLink>
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {niceLocality(property.locality) || property.locality}, {property.city}
          </p>
          {!isBooked(property) && availFrom && (
            <p className="-mt-3 mb-3 text-[11px] text-emerald-300/90 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" /> Available from {availFrom}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-800/80 text-xs text-slate-300 font-semibold mb-4">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-indigo-400" />
              <span>{property.bhk || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-indigo-400" />
              <span>{property.area} sq.ft</span>
            </div>
            <div className="text-right text-slate-400 font-normal">
              {property.furnishing || ''}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <NavLink
            href={propertyPath(property.id)}
            onNavigate={() => onViewDetails(property)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer text-center"
          >
            View Details
          </NavLink>

          {!isBooked(property) && (
            <a
              href={waLink(`Hi, I'm interested in ${cleanTitle(property.title)}${niceLocality(property.locality) ? `, ${niceLocality(property.locality)}` : ''} — ${propertyUrl(property)}`)}
              target="_blank"
              rel="noopener noreferrer"
              title="Ask on WhatsApp"
              aria-label={`Ask about ${cleanTitle(property.title)} on WhatsApp`}
              className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}

          {isOwnerOrAdmin && (
            <>
              <button
                onClick={() => onToggleStatus(property)}
                title="Toggle Status (Available/Booked)"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer border border-slate-700"
              >
                <Clock className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsQuickEditing(!isQuickEditing)}
                title="Edit Property Details"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 transition cursor-pointer border border-slate-700"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(propertyId)}
                title="Delete Property"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition cursor-pointer border border-slate-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Complete Edit Drawer Inside Card */}
      {isQuickEditing && (
        <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-xl p-5 z-20 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 sticky top-0 bg-slate-950 z-10">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">Edit All Property Details</h4>
            <button onClick={() => setIsQuickEditing(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveQuickEdit} className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Video URL Field Added to Quick Edit Drawer */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Video URL (Optional)</label>
                <input
                  type="text"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  placeholder="Paste video link here"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Rent Type</label>
                  <select
                    value={editRentType}
                    onChange={(e) => setEditRentType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none font-bold"
                  >
                    <option value="Monthly">Monthly (/mo)</option>
                    <option value="Daily">Daily (/ day)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none font-bold"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sub-Type</label>
                  <input
                    type="text"
                    value={editSubType}
                    onChange={(e) => setEditSubType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">BHK</label>
                  <input
                    type="text"
                    value={editBhk}
                    onChange={(e) => setEditBhk(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bedrooms</label>
                  <input
                    type="text"
                    value={editBedrooms}
                    onChange={(e) => setEditBedrooms(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bathrooms</label>
                  <input
                    type="text"
                    value={editBathrooms}
                    onChange={(e) => setEditBathrooms(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Balconies</label>
                  <input
                    type="text"
                    value={editBalconies}
                    onChange={(e) => setEditBalconies(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Area (sq.ft)</label>
                  <input
                    type="number"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Facing</label>
                  <input
                    type="text"
                    value={editFacing}
                    onChange={(e) => setEditFacing(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Furnishing</label>
                  <select
                    value={editFurnishing}
                    onChange={(e) => setEditFurnishing(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Furnished">Furnished</option>
                    <option value="Semi Furnished">Semi Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Property Age</label>
                  <input
                    type="text"
                    value={editPropertyAge}
                    onChange={(e) => setEditPropertyAge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    value={editDeposit}
                    onChange={(e) => setEditDeposit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Available Date</label>
                  <input
                    type="text"
                    value={editAvailDate}
                    onChange={(e) => setEditAvailDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 p-3">
                <span className="block text-[10px] uppercase font-black tracking-wider text-indigo-400 mb-2">More details</span>
                <ExtraDetailsFields value={editExtras} onChange={setEditExtras} dense />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Locality</label>
                  <input
                    type="text"
                    value={editLocality}
                    onChange={(e) => setEditLocality(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer mt-4"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes Immediately
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
