
import React from 'react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingCart, Star, CheckCircle2, ShieldCheck, Zap, Globe } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onAddToCart }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto py-8"
    >
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-slate-400 hover:text-sky-500 font-bold text-sm mb-8 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-sky-50 group-hover:border-sky-100 transition-all">
          <ArrowLeft size={16} />
        </div>
        Back to Catalog
      </button>

      <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-sky-500/5 border border-slate-100">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Image Section */}
          <div className="lg:w-1/2 p-8 lg:p-12 bg-slate-50 flex items-center justify-center relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-sky-200 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-200 rounded-full blur-3xl"></div>
            </div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>

          {/* Right: Info Section */}
          <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col">
            <div className="mb-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-sky-500/20">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                  <Star size={12} fill="currentColor" />
                  <span className="text-[10px] font-bold">{product.rating} Rating</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-none">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">₦{product.price.toLocaleString()}</span>
                <span className="text-slate-400 text-sm font-medium">One-time payment</span>
              </div>

              <div className="space-y-6 mb-10">
                <p className="text-slate-500 text-lg leading-relaxed">
                  {product.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-600">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-sm font-semibold">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="pt-8 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={() => onAddToCart(product)}
                  disabled={product.stock <= 0}
                  className="w-full sm:flex-1 bg-slate-900 hover:bg-sky-500 text-white h-16 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:bg-slate-200 disabled:shadow-none"
                >
                  <ShoppingCart size={24} />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className={`w-3 h-3 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {product.stock} Units Left
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Zap size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instant Access</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Globe size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
