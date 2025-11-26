import React from 'react';
import { X, RotateCcw, Check, ShieldCheck } from 'lucide-react';
import { FilterState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  currency: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  categories,
  filters,
  setFilters,
  currency,
}) => {
  const handleCategoryToggle = (category: string) => {
    setFilters({
      ...filters,
      categories: filters.categories.includes(category)
        ? filters.categories.filter(c => c !== category)
        : [...filters.categories, category]
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      minPrice: '',
      maxPrice: '',
      verifiedOnly: false,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Filter Products</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Categories */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Categories</h3>
                <div className="space-y-3">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.categories.includes(category) ? 'bg-accent-500 border-accent-500' : 'border-gray-300 group-hover:border-accent-400'}`}>
                        {filters.categories.includes(category) && <Check size={12} className="text-white" />}
                      </div>
                      <span className={`text-sm ${filters.categories.includes(category) ? 'font-semibold text-accent-600' : 'text-gray-700'}`}>{category}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Price Range */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Price Range</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currency}</span>
                    <input 
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                      className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 outline-none"
                    />
                  </div>
                  <div className="flex-shrink-0 text-gray-400">-</div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currency}</span>
                    <input 
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                      className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 outline-none"
                    />
                  </div>
                </div>
              </section>
              
              {/* Seller Verification */}
              <section>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.verifiedOnly ? 'bg-accent-500 border-accent-500' : 'border-gray-300 group-hover:border-accent-400'}`}>
                    {filters.verifiedOnly && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Verified Sellers Only</span>
                    <ShieldCheck size={16} className="text-accent-500" />
                  </div>
                </label>
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
                  className="sr-only"
                />
              </section>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-accent-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-accent-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar;
