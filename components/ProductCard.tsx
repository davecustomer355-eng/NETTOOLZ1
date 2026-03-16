
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
    <div className="bg-white rounded-xl border border-skyblue-100 p-2 sm:p-3 shadow-sm hover:shadow-md hover:border-skyblue-200 transition-all flex items-center justify-between gap-2 group cursor-default">
      
      {/* Left Section: Icon & Info */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Icon - Increased size by 25% */}
        <div 
          onClick={() => onViewDetails(product)}
          className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-gradient-to-br from-skyblue-400 to-skyblue-600 rounded-lg p-1.5 shadow-md shadow-skyblue-100 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain rounded-md bg-white/20 backdrop-blur-sm"
          />
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onViewDetails(product)}>
           <h3 className="font-bold text-slate-800 text-[10px] sm:text-xs mb-0.5 truncate group-hover:text-skyblue-600 transition-colors uppercase tracking-tight">
             <span className="font-black text-skyblue-600 mr-1">[#{product.id.padStart(3, '0')}]</span>
             {product.name}
           </h3>
           <p className="text-slate-400 text-[8px] font-bold uppercase tracking-wider">{product.stock} In Stock</p>
        </div>
      </div>

      {/* Right Section: Price & Actions */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
         <div className="font-black text-slate-900 text-xs sm:text-sm tracking-tight">₦{product.price.toLocaleString()}</div>
         <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onViewDetails(product)}
              className="hidden sm:flex items-center gap-1 text-slate-400 hover:text-skyblue-500 text-[8px] font-bold uppercase tracking-wider transition-colors"
            >
              <i className="fa-solid fa-circle-info text-[10px]"></i>
              <span>details</span>
            </button>
            
            <button 
              disabled={isOutOfStock}
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="w-6 h-6 sm:w-7 sm:h-7 bg-skyblue-500 hover:bg-skyblue-600 disabled:bg-slate-200 text-white rounded-md flex items-center justify-center shadow-md shadow-skyblue-100 transition-all active:scale-95"
            >
              <i className="fa-solid fa-cart-plus text-[10px] sm:text-xs"></i>
            </button>
         </div>
      </div>
    </div>
  );
};

export default ProductCard;
