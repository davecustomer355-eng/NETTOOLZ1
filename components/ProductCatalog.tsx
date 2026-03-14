
import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, SlidersHorizontal, Grid, List, ArrowUpDown, ChevronRight, Star, ShoppingCart, Info } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating';

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  onAddToCart,
  onViewDetails,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return p.isVisible && matchesCategory && matchesSearch;
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        // Assuming higher ID means newer for this simple case
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="flex flex-col gap-8">
      {/* Catalog Header */}
      <header className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="#4CABEB" d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.6,-31.3,86.9,-15.7,86.9,0C86.9,15.7,83.6,31.3,76.4,44.7C69.2,58.1,58.1,69.2,44.7,76.4C31.3,83.6,15.7,86.9,0,86.9C-15.7,86.9,-31.3,83.6,-44.7,76.4C-58.1,69.2,-69.2,58.1,-76.4,44.7C-83.6,31.3,-86.9,15.7,-86.9,0C-86.9,-15.7,-83.6,-31.3,-76.4,-44.7C-69.2,-58.1,-58.1,-69.2,-44.7,-76.4C-31.3,-83.6,-15.7,-86.9,0,-86.9C15.7,-86.9,31.3,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 bg-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 border border-sky-500/30">
              Premium Digital Assets
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-none">
              Digital Tools & <span className="text-sky-400">Software Catalog</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
              Explore our curated selection of high-performance proxies, VPNs, RDPs, and SaaS accounts designed for professionals.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          {/* Search Box */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">Search</h3>
              <Search size={14} className="text-slate-400" />
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Find tools..." 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-sm rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-sky-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">Categories</h3>
              <Filter size={14} className="text-slate-400" />
            </div>
            <div className="space-y-1.5">
              <button 
                onClick={() => onCategoryChange(null)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${!selectedCategory ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span>All Assets</span>
                <ChevronRight size={14} className={!selectedCategory ? 'text-white/70' : 'text-slate-300 group-hover:translate-x-1 transition-transform'} />
              </button>
              {categories.map(c => (
                <button 
                  key={c.id}
                  onClick={() => onCategoryChange(c.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${selectedCategory === c.id ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-3">
                    <i className={`fa-solid ${c.icon} w-4 text-center ${selectedCategory === c.id ? 'text-white' : 'text-sky-400'}`}></i>
                    {c.name}
                  </span>
                  <ChevronRight size={14} className={selectedCategory === c.id ? 'text-white/70' : 'text-slate-300 group-hover:translate-x-1 transition-transform'} />
                </button>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">Sort By</h3>
              <SlidersHorizontal size={14} className="text-slate-400" />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-slate-50 border border-slate-100 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-400 outline-none appearance-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </aside>

        {/* Main Catalog Content */}
        <div className="flex-1 space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-sky-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {filteredAndSortedProducts.length} Results
              </span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ArrowUpDown size={12} />
              <span>Showing {sortBy.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Products Display */}
          <AnimatePresence mode="popLayout">
            {filteredAndSortedProducts.length > 0 ? (
              <motion.div 
                layout
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
                  : "flex flex-col gap-6"
                }
              >
                {filteredAndSortedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 ${viewMode === 'list' ? 'flex items-center p-5 gap-8' : 'flex flex-col h-full'}`}
                  >
                    {/* Product Image Container */}
                    <div className={`relative overflow-hidden bg-slate-50/50 ${viewMode === 'list' ? 'w-40 h-40 shrink-0 rounded-2xl' : 'aspect-[4/5]'}`}>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-5 left-5">
                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[9px] font-black text-slate-900 rounded-full shadow-sm uppercase tracking-[0.15em] border border-slate-100">
                          {product.category}
                        </span>
                      </div>
                      
                      {/* Quick Action Overlay */}
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-500 flex items-center justify-center">
                         <button 
                           onClick={() => onViewDetails(product)}
                           className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-sky-500 hover:text-white"
                         >
                           <Info size={20} />
                         </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className={`flex flex-col flex-1 ${viewMode === 'list' ? 'py-2 pr-4' : 'p-7'}`}>
                      <div className="mb-3">
                        <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-sky-600 transition-colors duration-300 line-clamp-1">
                          {product.name}
                        </h3>
                      </div>
                      
                      <p className={`text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium ${viewMode === 'list' ? 'max-w-xl' : ''}`}>
                        {product.description}
                      </p>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Investment</span>
                            <span className="text-xl font-black text-slate-900 tracking-tight">
                              ₦{product.price.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <Star size={12} className="text-amber-400" fill="currentColor" />
                            <span className="text-[10px] font-black text-slate-700">{product.rating}</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => onAddToCart(product)}
                          disabled={product.stock <= 0}
                          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-sky-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-300 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none shadow-xl shadow-slate-200 group-hover:shadow-sky-500/20"
                        >
                          <ShoppingCart size={16} />
                          <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Search size={32} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">No tools found</h3>
                <p className="text-slate-400 text-sm max-w-xs text-center">
                  We couldn't find any digital assets matching your current filters. Try adjusting your search or category.
                </p>
                <button 
                  onClick={() => { onCategoryChange(null); onSearchChange(''); }}
                  className="mt-8 text-sky-500 font-bold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
