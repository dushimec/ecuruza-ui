import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';

interface WishlistPageProps {
  wishlistIds: string[];
  allProducts: Product[];
  onToggleWishlist: (e: React.MouseEvent, id: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onProductClick: (product: Product) => void;
  onBackToShop: () => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlistIds,
  allProducts,
  onToggleWishlist,
  onAddToCart,
  onProductClick,
  onBackToShop,
}) => {
  const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBackToShop} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            My Wishlist <Heart className="fill-red-500 text-red-500" size={24} />
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <Heart className="w-12 h-12 text-red-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Explore our marketplace and save your favorite items here. They'll be waiting for you!
          </p>
          <button 
            onClick={onBackToShop}
            className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-accent-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} /> Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              isWishlisted={true}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onClick={onProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
