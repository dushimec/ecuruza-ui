
import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye, ShieldCheck, ShoppingBag, Star, Minus, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent, id: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isWishlisted, 
  onToggleWishlist, 
  onAddToCart, 
  onClick 
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(q => q + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer" onClick={() => onClick(product)}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {product.isVerifiedSeller && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-trust-900 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm z-10">
              <ShieldCheck size={12} className="text-brand-500" /> Trusted
            </div>
          )}
          
          {/* Wishlist Button */}
          <button 
            onClick={(e) => onToggleWishlist(e, product.id)}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 z-10 ${
              isWishlisted 
                ? 'bg-white text-red-500' 
                : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-white'
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} className={isWishlisted ? "fill-current" : ""} />
          </button>

          {/* Quick Add Overlay Button */}
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-0 inset-x-0 bg-brand-500/90 backdrop-blur-sm text-white py-3 font-bold text-sm translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 z-10"
          >
            <ShoppingBag size={16} /> Add {quantity > 1 ? `${quantity} items` : 'to Cart'}
          </button>
      </div>
      
      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">{product.category}</p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-10 cursor-pointer hover:text-brand-600" onClick={() => onClick(product)}>
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={12} 
                        className={`${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                    />
                ))}
            </div>
            <span className="text-xs text-gray-500 font-medium ml-1">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviews})</span>
          </div>
        </div>
        
        <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
             <div>
               <p className="text-lg font-bold text-brand-600">{product.currency} {product.price.toLocaleString()}</p>
               <p className="text-[10px] text-gray-400 line-through">{product.currency} {Math.floor(product.price * 1.2).toLocaleString()}</p>
             </div>
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(product);
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye size={16} />
             </button>
          </div>

          {/* Quantity & Add Action Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button 
                onClick={handleDecrement}
                className={`w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-brand-600 transition-colors ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={quantity <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-bold text-gray-700">{quantity}</span>
              <button 
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-brand-600 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-trust-900 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 text-xs font-bold h-9"
            >
              <ShoppingCart size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
