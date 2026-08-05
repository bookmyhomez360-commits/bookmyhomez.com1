import React, { useState } from 'react';
import { Property, User } from '../types';
import {
  MapPin,
  Heart,
  Eye,
  RefreshCw,
  Edit,
  Trash2,
  Lock,
  CheckCircle,
  Share2,
  Check,
  Save,
  X,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  currentUser: User | null;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
  onViewDetails: (property: Property) => void;
  onToggleStatus: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: number) => void;
  formatCurrency: (val: number) => string;
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
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- Complete Property Fields State including Multi Rent Options & Status ---
  const [editTitle, setEditTitle] = useState(property.title || '');
  const [editPrice, setEditPrice] = useState(property.price || 0);
  const [editLocality, setEditLocality] = useState(property.locality || '');
  const [editCity, setEditCity] = useState(property.city || '');
  const [editArea, setEditArea] = useState(property.area || 0);
  const [editSubtype, setEditSubtype] = useState(property.subType || '');
  const [editBhk, setEditBhk] = useState(property.bhk || '');
  const [editBedrooms, setEditBedrooms] = useState(property.bedrooms || 1);
  const [editBathrooms, setEditBathrooms] = useState(property.bathrooms || 1);
  const [editBalconies, setEditBalconies] = useState(property.balconies || 1);
  const [editFacing, setEditFacing] = useState(property.facing || '');
  const [editPropertyAge, setEditPropertyAge] = useState(property.propertyAge || '');
  const [editFurnishing, setEditFurnishing] = useState(property.furnishing || '');
  const [editDeposit, setEditDeposit] = useState(property.deposit || 0);
  const [editAvailableFrom, setEditAvailableFrom] = useState(property.availableFrom || '');
  const [editStatus, setEditStatus] = useState(property.status || 'Available');
  
  // Rent Types state to handle both Monthly and Daily selection
  const [editRentTypes, setEditRentTypes] = useState<string[]>(
    Array.isArray(property.rentType) ? property.rentType : property.rentType ? [property.rentType] : ['Monthly']
  );

  const isOwner = currentUser && (currentUser.id === property.ownerId || currentUser.role === 'Administrator');

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Check out "${property.title}" in ${property.locality}, ${property.city} for ₹${formatCurrency(property.price)} on BookMyHomez!`;
    
    const propertyId = (property as any).id || (property as any)._id || '';
    const shareUrl = propertyId 
      ? `${window.location.origin}/?propertyId=${propertyId}` 
      : window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: property.title,
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRentTypeToggle = (type: string) => {
    if (editRentTypes.includes(type)) {
      if (editRentTypes.length > 1) {
        setEditRentTypes(editRentTypes.filter((t) => t !== type));
      }
    } else {
      setEditRentTypes([...editRentTypes, type]);
    }
  };

  // Submit all edited fields including multiple rent types and sync with Firebase
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProperty: Property = {
      ...property,
      title: editTitle,
      price: Number(editPrice),
      locality: editLocality,
      city: editCity,
      area: Number(editArea),
      subType: editSubtype,
      bhk: editBhk,
      bedrooms: Number(editBedrooms),
      bathrooms: Number(editBathrooms),
      balconies: Number(editBalconies),
      facing: editFacing,
      propertyAge: editPropertyAge,
      furnishing: editFurnishing,
      deposit: Number(editDeposit),
      availableFrom: editAvailableFrom,
      status: editStatus,
      rentType: editRentTypes.length > 1 ? 'Both' : editRentTypes[0], // Supports both or individual
    } as any;
    
    onEdit(updatedProperty);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition duration-300 flex flex-col group relative">
      
      {/* Property Image Container */}
      <div className="relative h-60 overflow-hidden bg-slate-900">
        <img
          src={property.images && property.images[0] ? property.images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-indigo-300 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-indigo-500/30">
          {property.category}
        </span>

        {/* PROMINENT AVAILABLE / BOOKED SLAB BADGE */}
        <span
          className={`absolute top-3 right-3 px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide shadow-2xl border backdrop-blur-md flex items-center gap-1.5 ${
            property.status === 'Booked'
              ? 'bg-rose-600/95 text-white border-rose-400'
              : 'bg-emerald-500/95 text-slate-950 border-emerald-300'
          }`}
        >
          {property.status === 'Booked' ? (
            <Lock className="w-3 h-3 text-white" />
          ) : (
            <CheckCircle className="w-3 h-3 text-slate-950" />
          )}
          {property.status || 'Available'}
        </span>

        {/* Top Right Buttons: Share & Favorite */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-slate-950/80 text-slate-300 hover:text-indigo-400 flex items-center justify-center transition cursor-pointer"
            title="Share Property"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className="w-9 h-9 rounded-full bg-slate-950/80 text-slate-300 hover:text-rose-500 flex items-center justify-center transition cursor-pointer"
            title="Save Property"
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : ''}`}
            />
          </button>
        </div>

        {/* Price Tag with Multi Rent Type Support Display */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-3xl font-black text-emerald-400 mb-6 drop-shadow-md">
            ₹{formatCurrency(property.price)}
            <span className="text-xs text-slate-400 font-normal ml-1">
              {property.category === 'Rent' && (
                Array.isArray(property.rentType) 
                  ? property.rentType.join(' / ') 
                  : property.rentType === 'Both' 
                    ? 'Monthly / Daily' 
                    : property.rentType === 'Daily' 
                      ? '/ day' 
                      : '/ month'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Property Details Body / Comprehensive Edit Form */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-2.5 text-xs max-h-[360px] overflow-y-auto pr-1">
            <div className="flex justify-between items-center mb-1 sticky top-0 bg-slate-900/95 py-1 z-10 border-b border-slate-800">
              <span className="font-bold text-indigo-400 uppercase text-[10px]">Edit Property & Rent Options</span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Rent Type Checkboxes (Select both Monthly & Daily if applicable) */}
            {property.category === 'Rent' && (
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Rent Type (Select one or both)</label>
                <div className="flex gap-4 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={editRentTypes.includes('Monthly')}
                      onChange={() => handleRentTypeToggle('Monthly')}
                      className="accent-indigo-500 w-3.5 h-3.5"
                    />
                    Monthly
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={editRentTypes.includes('Daily')}
                      onChange={() => handleRentTypeToggle('Daily')}
                      className="accent-indigo-500 w-3.5 h-3.5"
                    />
                    Daily
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] text-slate-400">Property Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">Price (₹)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Deposit (₹)</label>
                <input
                  type="number"
                  value={editDeposit}
                  onChange={(e) => setEditDeposit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">Locality</label>
                <input
                  type="text"
                  value={editLocality}
                  onChange={(e) => setEditLocality(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-[10px] text-slate-400">Sub-Type</label>
                <input
                  type="text"
                  value={editSubtype}
                  onChange={(e) => setEditSubtype(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">BHK Config</label>
                <input
                  type="text"
                  value={editBhk}
                  onChange={(e) => setEditBhk(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Area (sq.ft)</label>
                <input
                  type="number"
                  value={editArea}
                  onChange={(e) => setEditArea(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Save className="w-3.5 h-3.5" /> Save & Sync to Firebase
            </button>
          </form>
        ) : (
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition line-clamp-1 mb-1">
              {property.title}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                {property.locality}, {property.city}
              </span>
            </p>

            {/* Quick Property Specs Highlights in Card */}
            <div className="flex flex-wrap gap-1.5 my-2.5 text-[11px] text-slate-300">
              <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800 font-bold">
                {property.bhk || property.subType || 'Apartment'}
              </span>
              <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                {property.area} sq.ft
              </span>
              {property.facing && (
                <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-indigo-400 font-bold">
                  {property.facing} Facing
                </span>
              )}
              <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                {property.furnishing || 'Semi Furnished'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-4 flex items-center justify-between">
              <span>
                Listed by:{' '}
                <span className="text-slate-300 font-bold">
                  {property.ownerName || 'Verified Agent'}
                </span>
              </span>
              {copied && (
                <span className="text-emerald-400 font-bold text-[10px]">
                  Link Copied!
                </span>
              )}
            </p>
          </div>
        )}

        {/* Action Controls */}
        {!isEditing && (
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              onClick={() => onViewDetails(property)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> View Details
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Share Property"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            {isOwner && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleStatus(property)}
                  className="px-2.5 py-2.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Toggle Available / Booked"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-2.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Edit All Details & Rent Options"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(property.id)}
                  className="px-2.5 py-2.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Delete Property from Firebase"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
