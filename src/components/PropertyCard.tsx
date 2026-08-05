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
  onToggleSave: (id: number | string) => void;
  onViewDetails: (property: Property) => void;
  onToggleStatus: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: number | string) => void;
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

  // --- Form Edit States ---
  const [editTitle, setEditTitle] = useState(property.title || '');
  const [editPrice, setEditPrice] = useState(property.price || 0);
  const [editLocality, setEditLocality] = useState(property.locality || '');
  const [editCity, setEditCity] = useState(property.city || '');
  const [editArea, setEditArea] = useState(property.area || 0);
  const [editStatus, setEditStatus] = useState(property.status || 'Available');
  
  // Rent Types state (Monthly / Daily support)
  const [editRentTypes, setEditRentTypes] = useState<string[]>(
    Array.isArray(property.rentType) 
      ? property.rentType 
      : property.rentType === 'Both' 
        ? ['Monthly', 'Daily'] 
        : property.rentType 
          ? [property.rentType] 
          : ['Monthly']
  );

  // Check if current user is owner or admin
  const propertyOwnerId = (property as any).ownerId;
  const isOwner = currentUser && (currentUser.id === propertyOwnerId || currentUser.role === 'Administrator');

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Check out "${property.title}" in ${property.locality}, ${property.city} for ₹${formatCurrency(property.price)} on BookMyHomez!`;
    const propertyId = (property as any).id || (property as any)._id || '';
    const shareUrl = propertyId ? `${window.location.origin}/?propertyId=${propertyId}` : window.location.href;

    if (navigator.share) {
      navigator.share({ title: property.title, text: shareText, url: shareUrl }).catch(() => {});
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

  // Save changes directly without opening multi-step wizards
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProperty: Property = {
      ...property,
      title: editTitle,
      price: Number(editPrice),
      locality: editLocality,
      city: editCity,
      area: Number(editArea),
      status: editStatus,
      rentType: editRentTypes.length > 1 ? 'Both' : editRentTypes[0],
    } as any;
    
    onEdit(updatedProperty); // Triggers parent handler to update Firebase & State
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    const targetId = (property as any).id || (property as any)._id;
    if (targetId !== undefined && targetId !== null) {
      onDelete(targetId);
    }
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

        {/* AVAILABLE / BOOKED BADGE */}
        <span
          className={`absolute top-3 right-3 px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide shadow-2xl border backdrop-blur-md flex items-center gap-1.5 ${
            property.status === 'Booked'
              ? 'bg-rose-600/95 text-white border-rose-400'
              : 'bg-emerald-500/95 text-slate-950 border-emerald-300'
          }`}
        >
          {property.status === 'Booked' ? <Lock className="w-3 h-3 text-white" /> : <CheckCircle className="w-3 h-3 text-slate-950" />}
          {property.status || 'Available'}
        </span>

        {/* Price Tag */}
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

      {/* Card Body / Quick Edit Form */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
            <div className="flex justify-between items-center mb-1 border-b border-slate-800 pb-1">
              <span className="font-bold text-indigo-400 uppercase text-[10px]">Quick Edit Property</span>
              <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {property.category === 'Rent' && (
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Rent Type (Select)</label>
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Price (₹)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  required
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Save className="w-4 h-4" /> Save Changes Immediately
            </button>
          </form>
        ) : (
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition line-clamp-1 mb-1">
              {property.title}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{property.locality}, {property.city}</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              onClick={() => onViewDetails(property)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> View Details
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
                  title="Quick Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="px-2.5 py-2.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Delete from Firebase"
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
