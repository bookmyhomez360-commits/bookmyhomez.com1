import React, { useState } from 'react';
import { Property, User } from '../types';
import { 
  Heart, MapPin, Bed, Maximize2, IndianRupee, 
  Edit3, Trash2, Clock, X, Save 
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
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(property.title);
  const [editPrice, setEditPrice] = useState(property.price);
  const [editStatus, setEditStatus] = useState(property.status);
  const [editLocality, setEditLocality] = useState(property.locality);
  const [editCity, setEditCity] = useState(property.city);
  const [editBhk, setEditBhk] = useState(property.bhk || '');
  const [editArea, setEditArea] = useState(property.area || '');
  const [editFurnishing, setEditFurnishing] = useState(property.furnishing || 'Semi Furnished');
  const [editRentType, setEditRentType] = useState(property.rentType || 'Monthly');

  const propertyId = (property as any).id || (property as any)._id;
  const isOwnerOrAdmin = currentUser && (currentUser.role === 'Administrator' || property.ownerId === currentUser.id);

  const handleSaveQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Property = {
      ...property,
      title: editTitle,
      price: Number(editPrice),
      status: editStatus as any,
      locality: editLocality,
      city: editCity,
      bhk: editBhk,
      area: Number(editArea),
      furnishing: editFurnishing,
      rentType: editRentType as any,
    };
    onEdit(updated);
    setIsQuickEditing(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl hover:border-indigo-500/50 transition duration-300 flex flex-col relative group">
      
      {/* Image & Badges */}
      <div className="relative h-52 overflow-hidden bg-slate-950">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold border border-slate-700">
            {property.category}
          </span>
          <span className={`px-3 py-1 rounded-xl backdrop-blur-md text-[11px] font-extrabold border ${
            property.status === 'Booked' ? 'bg-rose-600 text-white border-rose-400' : 'bg-emerald-500 text-slate-950 border-emerald-300'
          }`}>
            {property.status || 'Available'}
          </span>
        </div>

        <button
          onClick={() => onToggleSave(propertyId)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-800 transition cursor-pointer border border-slate-700"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="text-xl font-black text-white drop-shadow-md flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {formatCurrency(property.price)}
            {property.category === 'Rent' && <span className="text-[10px] text-slate-300 font-normal ml-1">/mo</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {property.locality}, {property.city}
          </p>

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
              {property.furnishing || 'Furnished'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onViewDetails(property)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer text-center"
          >
            View Details
          </button>

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
                title="Quick Edit"
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

      {/* Quick Edit Overlay / Drawer Inside Card (All Details Added) */}
      {isQuickEditing && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl p-5 z-20 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">Edit Property Details</h4>
            <button onClick={() => setIsQuickEditing(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveQuickEdit} className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">BHK Config</label>
                  <input
                    type="text"
                    value={editBhk}
                    onChange={(e) => setEditBhk(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Area (sq.ft)</label>
                  <input
                    type="number"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Furnishing</label>
                  <select
                    value={editFurnishing}
                    onChange={(e) => setEditFurnishing(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Furnished">Furnished</option>
                    <option value="Semi Furnished">Semi Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Locality</label>
                  <input
                    type="text"
                    value={editLocality}
                    onChange={(e) => setEditLocality(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
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
