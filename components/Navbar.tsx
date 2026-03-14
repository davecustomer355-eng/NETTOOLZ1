
import React from 'react';
import { ViewState } from '../types';

interface NavbarProps {
  cartCount: number;
  logoUrl?: string;
  currentUserEmail?: string;
  onNavigate: (view: ViewState) => void;
  onOpenCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  logoUrl, 
  currentUserEmail,
  onNavigate, 
  onOpenCart 
}) => {
  return (
    <nav className="bg-sky-600 text-white sticky top-0 z-50 shadow-lg shadow-sky-900/10 border-b border-sky-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div 
            className="flex items-center cursor-pointer gap-3 group"
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              {/* White glow/container behind the logo to make it pop on blue background */}
              <div className="absolute inset-0 bg-white rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white rounded-full p-1 shadow-md border-2 border-white/20 h-12 w-12 flex items-center justify-center overflow-hidden">
                 {logoUrl ? (
                  <img src={logoUrl} alt="NETTOOLZ Logo" className="h-full w-full object-contain transform group-hover:scale-105 transition-transform" />
                ) : (
                  <i className="fa-solid fa-bolt text-sky-500 text-xl"></i>
                )}
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white leading-none group-hover:text-sky-100 transition-colors">
                NETTOOLZ
              </span>
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-[0.2em] leading-none mt-0.5">
                Premium Web Logs
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center bg-sky-700/30 rounded-full p-1 border border-sky-500/30 backdrop-blur-sm">
            <button 
              onClick={() => onNavigate('home')} 
              className="px-6 py-2 rounded-full text-sm font-bold text-sky-100 hover:bg-white hover:text-sky-600 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-store"></i>
              Marketplace
            </button>
            <button 
              onClick={() => onNavigate('profile')} 
              className="px-6 py-2 rounded-full text-sm font-bold text-sky-100 hover:bg-white hover:text-sky-600 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-box-archive"></i>
              My Orders
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigate('profile')}
              className={`hidden sm:flex items-center px-4 py-2 rounded-xl transition-all font-bold text-sm ${
                currentUserEmail 
                  ? 'bg-sky-500/50 text-white border border-sky-400 hover:bg-sky-500' 
                  : 'text-sky-100 hover:text-white hover:bg-sky-500/30'
              }`}
            >
              <i className="fa-solid fa-user mr-2"></i>
              <span>{currentUserEmail ? 'My Account' : 'Login'}</span>
            </button>
            
            <button 
              onClick={onOpenCart}
              className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-white text-sky-600 shadow-lg shadow-sky-900/20 hover:bg-sky-50 transition-all active:scale-95 group"
            >
              <i className="fa-solid fa-cart-shopping text-lg group-hover:scale-110 transition-transform"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-sky-600 min-w-[20px] text-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
