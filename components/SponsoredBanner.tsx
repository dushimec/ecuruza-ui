import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { ShoppingBag, Star, BadgeCheck } from 'lucide-react';

interface SponsoredBannerProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const SponsoredBanner: React.FC<SponsoredBannerProps> = ({ products, onProductClick }) => {
  // Duplicate products to create a seamless infinite loop
  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full bg-trust-900 py-6 overflow-hidden relative border-b-4 border-brand-500">
      <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-trust-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-trust-900 to-transparent z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center justify-between relative z-20">
        <h2 className="text-brand-500 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 fill-brand-500" />
          Featured & Verified
        </h2>
        <span className="text-xs text-gray-400">Sponsored</span>
      </div>

      <motion.div
        className="flex gap-6 px-4"
        animate={{
          x: [0, -1000], 
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {carouselProducts.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            onClick={() => onProductClick(product)}
            className="min-w-[280px] bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-transform hover:scale-105 flex-shrink-0 group"
          >
            <div className="relative h-40 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              {product.isVerifiedSeller && (
                <div className="absolute top-2 right-2 bg-trust-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-brand-600 font-bold text-base">
                  {product.currency} {product.price.toLocaleString()}
                </span>
                <button className="bg-trust-900 text-white p-1.5 rounded-lg hover:bg-brand-500 transition-colors">
                  <ShoppingBag size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SponsoredBanner;