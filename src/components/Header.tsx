import React, { useState } from 'react';
import { Logo } from './Logo';
import { User, CategoryType } from '../types';
import AICallModal from './AICallModal';
import {
  Home,
  ShoppingBag,
  Key,
  Hotel,
  Layers,
  PlusCircle,
  Heart,
  ChevronDown,
  Building,
  CirclePlus,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  activeFilterCategory: CategoryType;
  navigateTo: (tab: string) => void;
  navigateToCategory: (cat: CategoryType) => void;
  openWizard: () => void;
  openAuthModal: () => void;
  savedCount: number;
  currentUser: User | null;
  myPropertiesCount: number;
  logout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeFilterCategory,
  navigateTo,
  navigateToCategory,
  openWizard,
  openAuthModal,
  savedCount,
  currentUser,
  myPropertiesCount,
  logout,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-1">
          
          {/* Left Side: Logo & Blog Button Connected */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* 1. Logo Card */}
            <a
              onClick={(e) => {
                e.preventDefault();
                navigateTo('explore');
              }}
              href="#"
              className="flex items-center group transition transform hover:scale-105 cursor-pointer shrink-0"
            >
              <div className="h-10 sm:h-16 px-1.5 py-1 flex items-center justify-center bg-white rounded-xl shadow-lg border border-indigo-500/40 overflow-hidden">
                <Logo className="h-8 sm:h-14 w-auto max-w-full" />
              </div>
            </a>

            {/* 2. Blog Button (Logo pakkane untundi) */}
            <button
              onClick={() => navigateTo('blog')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition cursor-pointer flex items-center shadow-md shrink-0 ${
                currentTab === 'blog'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-600/80 hover:bg-indigo-500 text-white'
              }`}
            >
              Blog
            </button>
          </div>

          {/* Desktop Navigation Pills (Hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-full border border-slate-800">
            <button
              onClick={() => navigateTo('explore')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'explore'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Home
            </button>

            <button
              onClick={() => navigateToCategory('Buy')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'listings' && activeFilterCategory === 'Buy'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Buy
            </button>

            <button
              onClick={() => navigateToCategory('Rent')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'listings' && activeFilterCategory === 'Rent'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Key className="w-3.5 h-3.5" /> Rent
            </button>

            <button
              onClick={() => navigateToCategory('Short Stay')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'listings' && activeFilterCategory === 'Short Stay'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Hotel className="w-3.5 h-3.5" /> Short Stay
            </button>

            <button
              onClick={() => navigateToCategory('Plots')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'listings' && activeFilterCategory === 'Plots'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Land & Plots
            </button>
          </nav>

          {/* Right Side Action Controls: Fill Details -> List Property -> Heart -> Profile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* 3. Fill Details Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/30 shrink-0"
            >
              <span className="whitespace-nowrap">Fill Details</span>
            </button>

            {/* 4. List Property + Sign In Combined Button */}
            <button
              onClick={() => {
                if (currentUser) {
                  openWizard();
                } else {
                  openAuthModal();
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-1.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-1 shrink-0"
            >
              <PlusCircle className="w-4 h-4 hidden md:block" />
              <span className="hidden sm:inline">List Property</span>
              <span className="sm:hidden">List</span>
              
              {!currentUser ? (
                <span className="bg-indigo-900/80 text-white text-[8px] sm:text-[10px] px-1 py-0.5 rounded uppercase font-extrabold border border-indigo-400/50">
                  SIGN IN
                </span>
              ) : (
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold hidden sm:inline">
                  Free
                </span>
              )}
            </button>

            {/* 5. Favorites Heart Counter Button */}
            <button
              onClick={() => navigateTo('favorites')}
              className="relative p-1.5 sm:p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
              title="Saved Properties"
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${savedCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`}
              />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-slate-950">
                  {savedCount}
                </span>
              )}
            </button>

            {/* 6. User Account / Profile Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 transition cursor-pointer shrink-0"
                >
                  <img
                    src={currentUser.avatar}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover border border-indigo-500/40"
                    alt="Avatar"
                  />
                  <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigateTo('my_properties');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
                    >
                      <Building className="w-4 h-4 text-indigo-400" /> My Properties ({myPropertiesCount})
                    </button>

                    <button
                      onClick={() => {
                        if (currentUser) {
                          openWizard();
                        } else {
                          openAuthModal();
                        }
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
                    >
                      <CirclePlus className="w-4 h-4 text-amber-400" /> Post New Listing
                    </button>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Scrollable Categories Bar */}
        <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto px-3 py-2 bg-slate-950/80 border-t border-slate-800/60 scrollbar-none">
          <button
            onClick={() => navigateTo('explore')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
              currentTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Home className="w-3 h-3" /> Home
          </button>

          <button
            onClick={() => navigateToCategory('Buy')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
              currentTab === 'listings' && activeFilterCategory === 'Buy'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <ShoppingBag className="w-3 h-3" /> Buy
          </button>

          <button
            onClick={() => navigateToCategory('Rent')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
              currentTab === 'listings' && activeFilterCategory === 'Rent'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Key className="w-3 h-3" /> Rent
          </button>

          <button
            onClick={() => navigateToCategory('Short Stay')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
              currentTab === 'listings' && activeFilterCategory === 'Short Stay'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Hotel className="w-3 h-3" /> Short Stay
          </button>

          <button
            onClick={() => navigateToCategory('Plots')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
              currentTab === 'listings' && activeFilterCategory === 'Plots'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Layers className="w-3 h-3" /> Land & Plots
          </button>
        </div>
      </header>

      {/* AI Call Modal */}
      <AICallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
