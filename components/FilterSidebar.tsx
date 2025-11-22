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
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.categories.includes(category) ? 'bg-brand-500 border-brand-500' : 'border-gray-300 group-hover:border-brand-500'}`}>
                        {filters.categories.includes(category) && <Check size={12} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                      />
                      <span className={`text-sm ${filters.categories.includes(category) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Price Range */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Price Range ({currency})</h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-medium">Min</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-medium">Max</span>
                    <input 
                      type="number" 
                      placeholder="Any"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Seller Type */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Seller Verification</h3>
                <label className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                   <div className={`w-10 h-5 rounded-full relative transition-colors ${filters.verifiedOnly ? 'bg-brand-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${filters.verifiedOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                   </div>
                   <input 
                     type="checkbox" 
                     className="hidden"
                     checked={filters.verifiedOnly}
                     onChange={() => setFilters({ ...filters, verifiedOnly: !filters.verifiedOnly })}
                   />
                   <div className="flex flex-col">
                     <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                       Verified Only <ShieldCheck size={14} className="text-brand-500" />
                     </span>
                   </div>
                </label>
              </section>

            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button 
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-colors"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar;