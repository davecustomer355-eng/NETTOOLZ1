
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-2xl border border-sky-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group cursor-default">
      
      {/* Left Section: Icon & Info */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
        {/* Icon */}
        <div 
          onClick={() => onViewDetails(product)}
          className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl p-3 shadow-lg shadow-sky-200 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover rounded-lg bg-white/20 backdrop-blur-sm"
          />
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onViewDetails(product)}>
           <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1 truncate group-hover:text-sky-600 transition-colors uppercase tracking-tight">
             <span className="font-black text-sky-600 mr-2">[#{product.id.padStart(3, '0')}]</span>
             {product.name}
           </h3>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{product.stock} Available</p>
        </div>
      </div>

      {/* Right Section: Price & Actions */}
      <div className="flex flex-col items-end gap-2 shrink-0">
         <div className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">₦{product.price.toLocaleString()}</div>
         <div className="flex items-center gap-3">
            <button 
              onClick={() => onViewDetails(product)}
              className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-sky-500 text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              <i className="fa-solid fa-circle-info text-sm"></i>
              <span>more info</span>
            </button>
            
            <button 
              disabled={isOutOfStock}
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-200 transition-all active:scale-95"
            >
              <i className="fa-solid fa-cart-shopping text-sm sm:text-base"></i>
            </button>
         </div>
      </div>
    </div>
  );
};

export default ProductCard;
