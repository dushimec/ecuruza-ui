import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SponsoredBannerProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const SponsoredBanner: React.FC<SponsoredBannerProps> = ({ products, onProductClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? products.length - 1 : currentIndex - 1);
  };
  
  // Use useCallback for stable function reference in useEffect
  const nextSlide = useCallback(() => {
    setCurrentIndex(current => (current === products.length - 1 ? 0 : current + 1));
  }, [products.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };
  
  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(slideInterval); // Cleanup interval on component unmount
  }, [nextSlide]);


  if (!products || products.length === 0) {
    return null; // Don't render if no sponsored products
  }
  
  const currentProduct = products[currentIndex];

  return (
    <div className="w-full bg-primary-800 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="relative h-[480px] md:h-[250px]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
            >
              {/* Image Section */}
              <div className="w-full md:w-1/3 h-56 md:h-full relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={currentProduct.image} 
                  alt={currentProduct.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-3 left-3 bg-highlight-500 text-primary-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Sponsored
                </div>
              </div>

              {/* Details Section */}
              <div className="w-full md:w-2/3 text-center md:text-left">
                <span className="text-sm font-semibold text-primary-300 border border-primary-700 px-3 py-1 rounded-full">
                  {currentProduct.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-4 mb-2 leading-tight tracking-tight">
                  {currentProduct.name}
                </h2>
                <p className="text-primary-300 mb-4 text-sm max-w-md mx-auto md:mx-0">
                  {currentProduct.description.substring(0, 100)}...
                </p>
                
                <p className="text-3xl font-bold text-accent-400 mb-6">
                  {currentProduct.currency} {currentProduct.price.toLocaleString()}
                </p>
                <button 
                  onClick={() => onProductClick(currentProduct)}
                  className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-accent-500/20 transition-all text-base"
                >
                  View Product
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide} 
          className="absolute top-1/2 left-2 md:left-8 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full z-10 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute top-1/2 right-2 md:right-8 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full z-10 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {products.map((_, slideIndex) => (
            <button 
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === slideIndex ? 'bg-accent-500 scale-125' : 'bg-white/50 hover:bg-white'}`}
              aria-label={`Go to slide ${slideIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsoredBanner;