import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ShoppingCart, Menu, Store, User as UserIcon, X, Sparkles, 
  Filter, MapPin, CheckCircle, Heart, Truck, ShieldCheck, ShoppingBag, ChevronDown, ArrowUpDown, Plus, Star, Eye, LogOut, Minus
} from 'lucide-react';
import { Product, UserMode, CartItem, FilterState, SortOption, User, Shop } from './types';
import { MOCK_PRODUCTS, SPONSORED_PRODUCTS, CURRENCY } from './constants';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import SponsoredBanner from './components/SponsoredBanner';
import FilterSidebar from './components/FilterSidebar';
import AuthModal from './components/AuthModal';
import ShopRegistration from './components/ShopRegistration';
import SubscriptionPlans from './components/SubscriptionPlans';
import ProductCard from './components/ProductCard';
import WishlistPage from './components/WishlistPage';
import { searchProductsWithAI } from './services/geminiService';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userShop, setUserShop] = useState<Shop | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Application State
  const [userMode, setUserMode] = useState<UserMode>(UserMode.BUYER);
  // If shop exists but no subscription, show subscription plan
  const showSubscription = userShop && userShop.subscriptionStatus === 'none';
  // If no shop, show registration (when in seller mode)
  const showShopRegistration = !userShop;

  // Wishlist View State
  const [showWishlist, setShowWishlist] = useState(false);

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  
  // Wishlist State with LocalStorage Persistence
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ecuruza_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load wishlist', e);
      return [];
    }
  });

  // Persist wishlist changes
  useEffect(() => {
    localStorage.setItem('ecuruza_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);
  
  // Reset modal quantity when opening a product
  useEffect(() => {
    if (selectedProduct) {
      setModalQuantity(1);
    }
  }, [selectedProduct]);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    minPrice: '',
    maxPrice: '',
    verifiedOnly: false
  });

  // Sort State
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Initialize default view
  useEffect(() => {
    setProducts(MOCK_PRODUCTS);
  }, []);

  // Handle Seller Mode Toggle / Logic
  const handleSellClick = () => {
    if (userMode === UserMode.SELLER) {
      // Switch back to buying
      setUserMode(UserMode.BUYER);
      setShowWishlist(false);
      return;
    }

    // Trying to access seller mode
    if (!currentUser) {
      setAuthInitialMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    if (currentUser.role === 'admin') {
        setUserMode(UserMode.ADMIN);
        return;
    }

    // Switch to seller mode to trigger the conditional rendering in JSX
    setUserMode(UserMode.SELLER);
    setShowWishlist(false);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
        setUserMode(UserMode.ADMIN);
    } else if (user.role === 'seller') {
        // In a real app, fetch shop details here
    }
  };

  const handleShopRegister = (shop: Shop) => {
    setUserShop(shop);
    if (currentUser) {
       setCurrentUser({ ...currentUser, role: 'seller', shopId: shop.id });
    }
  };

  const handleSubscriptionComplete = (planType: 'trial' | 'monthly') => {
    if (!userShop) return;

    const now = new Date();
    let endDate = new Date();
    
    if (planType === 'trial') {
      endDate.setMonth(now.getMonth() + 3); // 3 months free
    } else {
      endDate.setMonth(now.getMonth() + 1); // 1 month paid
    }

    const updatedShop: Shop = {
      ...userShop,
      isVerified: true, // Verification activated upon subscription
      subscriptionStatus: planType === 'trial' ? 'trial' : 'active',
      subscriptionEndDate: endDate.toISOString(),
    };

    setUserShop(updatedShop);
  };

  const handleCheckout = () => {
    if (!currentUser) {
      setAuthInitialMode('login');
      setIsAuthModalOpen(true);
    } else {
      alert(`Order placed successfully! Thank you, ${currentUser.name}.`);
      setCart([]);
      setIsCartOpen(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserShop(null);
    setUserMode(UserMode.BUYER);
    setShowWishlist(false);
  };

  const handleWishlistClick = () => {
    setShowWishlist(true);
    setUserMode(UserMode.BUYER); // Ensure we are in buyer mode context
  };

  // Extract all unique categories for the sidebar
  const availableCategories = useMemo(() => {
    return Array.from(new Set(MOCK_PRODUCTS.map(p => p.category))).sort();
  }, []);
  
  const handleCategoryFilter = (category: string | null) => {
    setFilters(prev => ({
      ...prev,
      categories: category ? [category] : [],
    }));
    setIsCategoryDropdownOpen(false);
    setShowWishlist(false); // Go back to shop view when category is selected
    setUserMode(UserMode.BUYER);
  };

  // 1. Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category Filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }
      
      // Verified Seller Filter
      if (filters.verifiedOnly && !product.isVerifiedSeller) {
        return false;
      }

      // Price Filter
      const min = filters.minPrice !== '' ? Number(filters.minPrice) : 0;
      const max = filters.maxPrice !== '' ? Number(filters.maxPrice) : Infinity;
      
      if (product.price < min || product.price > max) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  // 2. Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating_desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
      default:
        return sorted; // Assuming original order is "newest"
    }
  }, [filteredProducts, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = filters.categories.length;
    if (filters.minPrice !== '' || filters.maxPrice !== '') count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsAiSearching(true);
    setAiReasoning(null);
    setShowWishlist(false); // Exit wishlist when searching
    
    const result = await searchProductsWithAI(searchQuery);
    
    if (result.recommendedProductIds.length > 0) {
      const filtered = MOCK_PRODUCTS.filter(p => result.recommendedProductIds.includes(p.id));
      setProducts(filtered);
      setAiReasoning(result.reasoning);
    } else {
      // Fallback if AI fails or returns nothing
      const lowerQ = searchQuery.toLowerCase();
      const filtered = MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.category.toLowerCase().includes(lowerQ)
      );
      setProducts(filtered);
    }
    
    setIsAiSearching(false);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity: quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); // Prevent opening product detail
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Rating: High to Low', value: 'rating_desc' },
  ];

  // -- Components for clean render -- //

  const Header = () => (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
               setProducts(MOCK_PRODUCTS);
               setAiReasoning(null);
               setUserMode(UserMode.BUYER);
               setShowWishlist(false);
               setFilters({ categories: [], minPrice: '', maxPrice: '', verifiedOnly: false });
             }}>
               <div className="bg-brand-500 p-2 rounded-lg">
                 <Store className="text-white w-5 h-5" />
               </div>
               <span className="font-bold text-xl text-trust-900 tracking-tight">Ecuruza</span>
             </div>

             {/* Categories Dropdown */}
             <div className="hidden md:block relative">
               <button 
                 onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                 className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
               >
                 Categories <ChevronDown size={16} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
               </button>
               {isCategoryDropdownOpen && (
                 <>
                   <div className="fixed inset-0 z-20" onClick={() => setIsCategoryDropdownOpen(false)} />
                   <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-30 py-2 animate-in fade-in zoom-in-95 duration-100">
                     <button
                        onClick={() => handleCategoryFilter(null)}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                      >
                        All Categories
                      </button>
                      <div className="h-px bg-gray-100 my-1" />
                     {availableCategories.map(cat => (
                       <button
                         key={cat}
                         onClick={() => handleCategoryFilter(cat)}
                         className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                           filters.categories.includes(cat) ? 'text-brand-600 font-medium' : 'text-gray-700'
                         }`}
                       >
                         {cat}
                       </button>
                     ))}
                   </div>
                 </>
               )}
             </div>
             
             {userMode === UserMode.BUYER && (
               <div className="hidden lg:flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                 <MapPin size={14} className="mr-1 text-brand-500" />
                 Delivering to <span className="font-medium text-gray-900 ml-1">Kigali, RW</span>
               </div>
             )}
          </div>

          {/* Search Bar (Buyer Only) */}
          {userMode === UserMode.BUYER && !showWishlist && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
              <input 
                type="text" 
                placeholder="Search for products, brands and categories..." 
                className="w-full border border-gray-300 rounded-full pl-12 pr-24 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              />
              <Search className="absolute left-4 top-2.5 text-gray-400 w-5 h-5" />
              <button 
                onClick={handleAiSearch}
                disabled={isAiSearching}
                className="absolute right-1.5 top-1.5 bg-trust-900 hover:bg-brand-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
              >
                {isAiSearching ? 'Thinking...' : <><Sparkles size={12} /> AI Search</>}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
             {/* Admin Button (only visible for admins) */}
             {currentUser?.role === 'admin' && (
                 <button 
                    onClick={() => setUserMode(UserMode.ADMIN)}
                    className={`hidden sm:flex text-sm font-bold transition-colors ${userMode === UserMode.ADMIN ? 'text-brand-600' : 'text-trust-900 hover:text-brand-600'}`}
                 >
                    Admin Dashboard
                 </button>
             )}

            <button 
              onClick={handleSellClick}
              className="hidden sm:flex text-sm font-medium text-trust-900 hover:text-brand-500 transition-colors"
            >
              {userMode === UserMode.BUYER ? 'Sell on Ecuruza' : 'Back to Shopping'}
            </button>
            
            {userMode === UserMode.BUYER && (
              <>
                {/* Wishlist Icon Indicator */}
                <button 
                  onClick={handleWishlistClick}
                  className={`hidden md:flex items-center transition-colors cursor-pointer ${showWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  title="My Wishlist"
                >
                  <Heart size={24} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
                </button>

                <button 
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="text-gray-600 w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cart.length}
                    </span>
                  )}
                </button>
              </>
            )}
            
            {currentUser ? (
               <div className="flex items-center gap-2 group relative cursor-pointer">
                 <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-900 font-bold text-sm border border-brand-200">
                    {currentUser.name.charAt(0).toUpperCase()}
                 </div>
                 {/* Simple Dropdown for Logout */}
                 <div className="absolute top-full right-0 mt-2 w-32 bg-white shadow-lg rounded-lg border border-gray-100 py-1 hidden group-hover:block z-50">
                   <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                     <LogOut size={14} /> Logout
                   </button>
                 </div>
               </div>
            ) : (
               <button 
                 onClick={() => { setAuthInitialMode('login'); setIsAuthModalOpen(true); }}
                 className="text-sm font-bold text-trust-900 hover:text-brand-600"
               >
                 Log In
               </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const ProductGrid = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {aiReasoning && (
        <div className="mb-6 p-4 bg-brand-50 border border-brand-100 rounded-lg flex gap-3 items-start animate-fade-in">
          <Sparkles className="text-brand-600 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="text-brand-900 text-sm font-medium">Smart Assistant</p>
            <p className="text-brand-800 text-sm">{aiReasoning}</p>
          </div>
          <button onClick={() => { setAiReasoning(null); setProducts(MOCK_PRODUCTS); }} className="ml-auto text-xs text-gray-500 underline">Clear</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">
          {searchQuery ? 'Search Results' : 'Recommended for you'} 
          <span className="ml-2 text-sm font-normal text-gray-500">({sortedProducts.length} items)</span>
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <ArrowUpDown size={14} className="text-gray-500" />
              <span className="hidden sm:inline text-gray-500">Sort by:</span>
              <span className="text-gray-900">{sortOptions.find(o => o.value === sortBy)?.label}</span>
              <ChevronDown size={14} className={`text-gray-500 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsSortDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-30 py-1 animate-in fade-in zoom-in-95 duration-100">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between ${
                        sortBy === option.value ? 'text-brand-600 font-medium bg-brand-50/50' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && <CheckCircle size={14} className="text-brand-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter Button */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all border border-transparent ${
              activeFilterCount > 0 
                ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200 border-brand-200' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} /> 
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-brand-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ml-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
           <div className="inline-flex bg-gray-50 p-4 rounded-full mb-4">
              <Search className="text-gray-400 w-8 h-8" />
           </div>
           <h3 className="text-lg font-medium text-gray-900">No products found</h3>
           <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
           <button 
             onClick={() => {
               setFilters({ categories: [], minPrice: '', maxPrice: '', verifiedOnly: false });
               if (products.length === 0) setProducts(MOCK_PRODUCTS);
             }}
             className="mt-4 text-brand-600 font-medium text-sm hover:underline"
           >
             Clear all filters
           </button>
         </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={toggleWishlist}
              onAddToCart={addToCart}
              onClick={setSelectedProduct}
            />
          ))}
        </div>
      )}
    </div>
  );

  // -- Render Main -- //
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      {/* Main Content Switcher */}
      {userMode === UserMode.ADMIN ? (
          <AdminDashboard />
      ) : userMode === UserMode.BUYER ? (
        showWishlist ? (
          <WishlistPage 
            wishlistIds={wishlist}
            allProducts={MOCK_PRODUCTS}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
            onProductClick={setSelectedProduct}
            onBackToShop={() => setShowWishlist(false)}
          />
        ) : (
          <>
            <SponsoredBanner products={SPONSORED_PRODUCTS} onProductClick={(p) => setSelectedProduct(p)} />
            <ProductGrid />
          </>
        )
      ) : (
        // Seller Mode
        showShopRegistration ? (
          <ShopRegistration onRegister={handleShopRegister} />
        ) : showSubscription ? (
          <SubscriptionPlans onSubscribe={handleSubscriptionComplete} />
        ) : (
          <SellerDashboard shop={userShop || undefined} />
        )
      )}

      <FilterSidebar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        categories={availableCategories}
        filters={filters}
        setFilters={setFilters}
        currency={CURRENCY}
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleAuthSuccess}
        initialMode={authInitialMode}
      />

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
             <div className="md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
               <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
               <button onClick={() => setSelectedProduct(null)} className="absolute top-4 left-4 md:hidden bg-white p-2 rounded-full shadow-lg">
                 <X size={20} />
               </button>
             </div>
             <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="flex justify-between items-start">
                   <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                   <button onClick={() => setSelectedProduct(null)} className="hidden md:block text-gray-400 hover:text-gray-600">
                     <X size={24} />
                   </button>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                   <div className="flex text-yellow-400">
                     {[...Array(5)].map((_, i) => (
                       <Sparkles key={i} size={14} className={i < Math.round(selectedProduct.rating) ? "fill-yellow-400" : "text-gray-300"} />
                     ))}
                   </div>
                   <span className="text-sm text-gray-500">({selectedProduct.reviews} reviews)</span>
                </div>

                <div className="text-3xl font-bold text-brand-600 mb-2">
                  {selectedProduct.currency} {selectedProduct.price.toLocaleString()}
                </div>
                <p className={`text-sm mb-6 ${selectedProduct.stock < 10 ? 'text-orange-600 font-medium' : 'text-green-600'}`}>
                  {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} available)` : 'Out of Stock'}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Truck className="text-gray-600 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Ecuruza Express Delivery</p>
                      <p className="text-xs text-gray-500">Get it within 24-48 hours in Kigali.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <ShieldCheck className="text-brand-600 mt-1" size={18} />
                    <div>
                       <p className="text-sm font-semibold text-gray-900">Seller: {selectedProduct.sellerName}</p>
                       <p className="text-xs text-gray-500">{selectedProduct.isVerifiedSeller ? 'Verified by Ecuruza' : 'Independent Seller'}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1">
                  {selectedProduct.description}
                </p>
                
                {/* Modal Quantity Selector */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1.5">
                     <button 
                       onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                       className={`w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600 hover:text-brand-600 transition-colors ${modalQuantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                       disabled={modalQuantity <= 1}
                     >
                       <Minus size={18} />
                     </button>
                     <span className="w-12 text-center text-lg font-bold text-gray-900">{modalQuantity}</span>
                     <button 
                       onClick={() => setModalQuantity(modalQuantity + 1)}
                       className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600 hover:text-brand-600 transition-colors"
                     >
                       <Plus size={18} />
                     </button>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Total Price</span>
                    <span className="text-xl font-bold text-brand-600">
                       {selectedProduct.currency} {(selectedProduct.price * modalQuantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                   <button className="flex-1 bg-trust-900 hover:bg-trust-800 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-trust-900/20" onClick={() => { addToCart(selectedProduct, modalQuantity); setSelectedProduct(null); }}>
                     Add to Cart
                   </button>
                   <button 
                     onClick={(e) => toggleWishlist(e, selectedProduct.id)}
                     className={`p-3.5 border-2 rounded-xl transition-colors ${
                       wishlist.includes(selectedProduct.id)
                         ? 'border-red-500 text-red-500 bg-red-50'
                         : 'border-gray-200 hover:border-brand-500 hover:text-brand-500'
                     }`}
                   >
                     <Heart size={20} className={wishlist.includes(selectedProduct.id) ? "fill-current" : ""} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-500" /> Your Cart ({cart.length})
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p>Your cart is empty</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-brand-500 font-medium text-sm">Start Shopping</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                        <p className="text-brand-600 font-bold text-sm">{item.currency} {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-md p-1">
                           <button className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded text-xs font-bold hover:text-brand-500">-</button>
                           <span className="text-xs font-medium w-3 text-center">{item.quantity}</span>
                           <button className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded text-xs font-bold hover:text-brand-500" onClick={() => addToCart(item)}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-xs underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between mb-4 text-sm">
                   <span className="text-gray-500">Subtotal</span>
                   <span className="font-bold text-gray-900">{cart[0].currency} {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-6 text-sm">
                   <span className="text-gray-500">Delivery</span>
                   <span className="font-bold text-green-600">Free</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all flex justify-center items-center gap-2"
                >
                  Checkout Now <CheckCircle size={18} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Simple Footer Component within App for brevity */}
      <footer className="bg-trust-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Store className="text-brand-500" /> Ecuruza
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Africa’s most trusted ecommerce ecosystem connecting millions of people to quality products.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand-500">New Arrivals</a></li>
              <li><a href="#" className="hover:text-brand-500">Featured</a></li>
              <li><a href="#" className="hover:text-brand-500">Electronics</a></li>
              <li><a href="#" className="hover:text-brand-500">Fashion</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Sell</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand-500">Become a Seller</a></li>
              <li><a href="#" className="hover:text-brand-500">Seller Dashboard</a></li>
              <li><a href="#" className="hover:text-brand-500">Policies</a></li>
            </ul>
          </div>
          <div>
             <h4 className="font-bold text-white mb-4">Support</h4>
             <ul className="space-y-2 text-sm text-gray-400">
               <li><a href="#" className="hover:text-brand-500">Help Center</a></li>
               <li><a href="#" className="hover:text-brand-500">Disputes</a></li>
               <li><a href="#" className="hover:text-brand-500">Contact Us</a></li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          &copy; 2024 Ecuruza Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
```