import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ShoppingCart, Menu, Store, User as UserIcon, X, Sparkles, 
  Filter, MapPin, CheckCircle, Heart, Truck, ShieldCheck, ShoppingBag, ChevronDown, ArrowUpDown, Plus, Star, Eye, LogOut, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const showSubscription = userShop && userShop.subscriptionStatus === 'none';
  const showShopRegistration = !userShop;

  // UI State
  const [showWishlist, setShowWishlist] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ecuruza_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { console.error('Failed to load wishlist', e); return []; }
  });

  useEffect(() => { localStorage.setItem('ecuruza_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { if (selectedProduct) setModalQuantity(1); }, [selectedProduct]);

  // Filter & Sort State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ categories: [], minPrice: '', maxPrice: '', verifiedOnly: false });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Handlers
  const handleSellClick = () => {
    if (userMode !== UserMode.BUYER) { setUserMode(UserMode.BUYER); setShowWishlist(false); return; }
    if (!currentUser) { setAuthInitialMode('login'); setIsAuthModalOpen(true); return; }
    if (currentUser.role === 'admin') { setUserMode(UserMode.ADMIN); return; }
    setUserMode(UserMode.SELLER);
    setShowWishlist(false);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') setUserMode(UserMode.ADMIN);
  };

  const handleShopRegister = (shop: Shop) => {
    setUserShop(shop);
    if (currentUser) setCurrentUser({ ...currentUser, role: 'seller', shopId: shop.id });
  };

  const handleSubscriptionComplete = (planType: 'trial' | 'monthly') => {
    if (!userShop) return;
    const now = new Date();
    let endDate = new Date();
    endDate.setMonth(now.getMonth() + (planType === 'trial' ? 3 : 1));
    setUserShop({ ...userShop, isVerified: true, subscriptionStatus: planType === 'trial' ? 'trial' : 'active', subscriptionEndDate: endDate.toISOString() });
  };

  const handleCheckout = () => {
    if (!currentUser) { setAuthInitialMode('login'); setIsAuthModalOpen(true); } 
    else { alert(`Order placed! Thank you, ${currentUser.name}.`); setCart([]); setIsCartOpen(false); }
  };

  const handleLogout = () => { setCurrentUser(null); setUserShop(null); setUserMode(UserMode.BUYER); setShowWishlist(false); };
  const handleWishlistClick = () => { setShowWishlist(true); setUserMode(UserMode.BUYER); };
  
  const availableCategories = useMemo(() => Array.from(new Set(MOCK_PRODUCTS.map(p => p.category))).sort(), []);
  
  const handleCategoryFilter = (category: string | null) => {
    setFilters(prev => ({ ...prev, categories: category ? [category] : [] }));
    setIsCategoryDropdownOpen(false);
    setShowWishlist(false);
    setUserMode(UserMode.BUYER);
  };

  const filteredProducts = useMemo(() => products.filter(product => {
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
    if (filters.verifiedOnly && !product.isVerifiedSeller) return false;
    const min = filters.minPrice ? Number(filters.minPrice) : 0;
    const max = filters.maxPrice ? Number(filters.maxPrice) : Infinity;
    return product.price >= min && product.price <= max;
  }), [products, filters]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price_asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc': return sorted.sort((a, b) => b.price - a.price);
      case 'rating_desc': return sorted.sort((a, b) => b.rating - a.rating);
      default: return sorted;
    }
  }, [filteredProducts, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = filters.categories.length;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    setAiReasoning(null);
    setShowWishlist(false);
    const result = await searchProductsWithAI(searchQuery);
    const resultIds = new Set(result.recommendedProductIds);
    const finalProducts = result.recommendedProductIds.length > 0
      ? MOCK_PRODUCTS.filter(p => resultIds.has(p.id))
      : MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setProducts(finalProducts);
    setAiReasoning(result.reasoning);
    setIsAiSearching(false);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Newest Arrivals', value: 'newest' }, { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' }, { label: 'Rating: High to Low', value: 'rating_desc' },
  ];

  // -- RENDER COMPONENTS -- //

  const Header = () => (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo & Categories */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setProducts(MOCK_PRODUCTS); setAiReasoning(null); setUserMode(UserMode.BUYER); setShowWishlist(false); setFilters({ categories: [], minPrice: '', maxPrice: '', verifiedOnly: false }); }}>
              <div className="bg-accent-500 p-2 rounded-lg"><Store className="text-white w-5 h-5" /></div>
              <span className="font-bold text-xl text-primary-900 tracking-tight">Ecuruza</span>
            </div>
            <div className="hidden md:block relative">
              <button onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
                Categories <ChevronDown size={16} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isCategoryDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsCategoryDropdownOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-30 py-2">
                      <button onClick={() => handleCategoryFilter(null)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-accent-600">All Categories</button>
                      <div className="h-px bg-gray-100 my-1" />
                      {availableCategories.map(cat => (
                        <button key={cat} onClick={() => handleCategoryFilter(cat)} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${filters.categories.includes(cat) ? 'text-accent-600 font-medium' : 'text-gray-700'}`}>{cat}</button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center: Search (Desktop only) */}
          {userMode === UserMode.BUYER && !showWishlist && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
              <input type="text" placeholder="Search products..." className="w-full border border-gray-300 rounded-full pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSearch()} />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          )}

          {/* Right Side: Actions & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-4">
              {currentUser?.role === 'admin' && <button onClick={() => setUserMode(UserMode.ADMIN)} className={`text-sm font-bold transition-colors ${userMode === UserMode.ADMIN ? 'text-accent-600' : 'text-primary-900 hover:text-accent-600'}`}>Admin</button>}
              <button onClick={handleSellClick} className="text-sm font-medium text-primary-900 hover:text-accent-500 transition-colors">{userMode !== UserMode.BUYER ? 'Back to Shopping' : 'Sell on Ecuruza'}</button>
            </div>
            
            {userMode === UserMode.BUYER && (
              <>
                <button onClick={handleWishlistClick} className={`p-2 rounded-full transition-colors ${showWishlist ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'}`} title="My Wishlist"><Heart size={20} className={wishlist.length > 0 ? "fill-current" : ""} /></button>
                <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setIsCartOpen(true)}>
                  <ShoppingCart className="text-gray-600 w-5 h-5" />
                  {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
                </button>
              </>
            )}
            
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2 group relative cursor-pointer">
                <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center text-accent-900 font-bold text-sm border border-accent-200">{currentUser.name.charAt(0).toUpperCase()}</div>
                <div className="absolute top-full right-0 mt-2 w-32 bg-white shadow-lg rounded-lg border border-gray-100 py-1 hidden group-hover:block z-50">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><LogOut size={14} /> Logout</button>
                </div>
              </div>
            ) : <button onClick={() => { setAuthInitialMode('login'); setIsAuthModalOpen(true); }} className="hidden sm:block text-sm font-bold text-primary-900 hover:text-accent-600">Log In</button>}
            
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Menu size={20} /></button>
          </div>
        </div>
      </div>
    </header>
  );

  const MobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-xs bg-white z-[60] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center"><h2 className="font-bold text-lg">Menu</h2><button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button></div>
            <div className="p-4 flex flex-col gap-2">
              <button onClick={handleSellClick} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 font-medium">{userMode !== UserMode.BUYER ? 'Back to Shopping' : 'Sell on Ecuruza'}</button>
              {currentUser?.role === 'admin' && <button onClick={() => setUserMode(UserMode.ADMIN)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 font-medium">Admin Dashboard</button>}
              <div className="h-px bg-gray-100 my-2" />
              {currentUser ? <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 font-medium text-red-500">Log Out</button> : <button onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 font-medium">Log In / Sign Up</button>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const ProductGrid = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            {isAiSearching ? (
              <div className="flex-1 text-center md:text-left"><p className="text-sm text-gray-500 animate-pulse">Our AI is finding the best matches for you...</p></div>
            ) : aiReasoning ? (
              <div className="flex-1 text-center md:text-left bg-primary-100/50 border border-primary-200/50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-primary-900 flex items-center gap-2"><Sparkles size={16} className="text-accent-500"/> AI Recommendation</p>
                <p className="text-sm text-gray-600 mt-1">{aiReasoning}</p>
              </div>
            ) : <div className="flex-1"><h2 className="text-xl font-bold text-gray-800">All Products</h2></div>}
            <div className="flex items-center gap-2">
                <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Filter size={16} /> Filter 
                    {activeFilterCount > 0 && <span className="bg-accent-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>}
                </button>
                <div className="relative">
                    <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-48 justify-between">
                        <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                        <ArrowUpDown size={16} />
                    </button>
                    {isSortDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsSortDropdownOpen(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20">
                                {sortOptions.map(opt => (
                                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${sortBy === opt.value ? 'font-bold text-accent-600' : 'text-gray-700'} hover:bg-gray-50`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
        {userMode === UserMode.BUYER && !showWishlist && (
          <div className="md:hidden mb-6 relative">
            <input type="text" placeholder="Search products..." className="w-full border border-gray-300 rounded-full pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSearch()} />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        {sortedProducts.length === 0 && !isAiSearching && (
          <div className="col-span-full text-center py-16 bg-white rounded-lg border border-dashed border-gray-200">
            <Search size={40} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-100 font-sans">
      {userMode !== UserMode.ADMIN && <Header />}
      <MobileMenu />
      
      {userMode === UserMode.ADMIN ? <AdminDashboard />
      : userMode === UserMode.BUYER ? (
        showWishlist ? <WishlistPage wishlistIds={wishlist} allProducts={MOCK_PRODUCTS} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} onProductClick={setSelectedProduct} onBackToShop={() => setShowWishlist(false)} />
        : <>
            <SponsoredBanner products={SPONSORED_PRODUCTS} onProductClick={p => setSelectedProduct(p)} />
            <div className="bg-white"><ProductGrid /></div>
          </>
      ) : showShopRegistration ? <ShopRegistration onRegister={handleShopRegister} />
      : showSubscription ? <SubscriptionPlans onSubscribe={handleSubscriptionComplete} />
      : <SellerDashboard shop={userShop || undefined} products={products.filter(p => p.sellerName === userShop?.name)} setProducts={setProducts} availableCategories={availableCategories} />}

      <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} categories={availableCategories} filters={filters} setFilters={setFilters} currency={CURRENCY} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleAuthSuccess} initialMode={authInitialMode} />

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
             <div className="md:w-1/2 h-64 md:h-auto bg-gray-100 relative"><img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" /><button onClick={() => setSelectedProduct(null)} className="absolute top-4 left-4 md:hidden bg-white p-2 rounded-full shadow-lg"><X size={20} /></button></div>
             <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="flex justify-between items-start"><h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2><button onClick={() => setSelectedProduct(null)} className="hidden md:block text-gray-400 hover:text-gray-600"><X size={24} /></button></div>
                <div className="flex items-center gap-2 mb-4"><div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.round(selectedProduct.rating) ? "fill-current" : "text-gray-300"} />)}</div><span className="text-sm text-gray-500">({selectedProduct.reviews} reviews)</span></div>
                <div className="text-3xl font-bold text-accent-500 mb-2">{selectedProduct.currency} {selectedProduct.price.toLocaleString()}</div>
                <p className={`text-sm mb-6 ${selectedProduct.stock < 10 ? 'text-orange-600 font-medium' : 'text-green-600'}`}>{selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} available)` : 'Out of Stock'}</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100"><div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-900 font-bold text-lg">{selectedProduct.sellerName.charAt(0)}</div><div className="flex-1"><p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">{selectedProduct.sellerName} {selectedProduct.isVerifiedSeller && <ShieldCheck size={14} className="text-accent-500 fill-accent-100" />}</p><div className="flex items-center gap-1 text-xs text-gray-500"><Star size={12} className="fill-yellow-400 text-yellow-400" /><span className="font-semibold">{selectedProduct.sellerRating || 'N/A'}</span><span>({selectedProduct.sellerReviewCount || 0} reviews)</span></div></div><ChevronDown size={16} className="text-gray-400 -rotate-90" /></div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"><Truck className="text-gray-600 mt-1" size={18} /><div><p className="text-sm font-semibold text-gray-900">Ecuruza Express</p><p className="text-xs text-gray-500">Get it within 24-48 hours in Kigali.</p></div></div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1">{selectedProduct.description}</p>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1.5"><button onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))} className={`w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600 hover:text-accent-600 transition-colors ${modalQuantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={modalQuantity <= 1}><Minus size={18} /></button><span className="w-12 text-center text-lg font-bold text-gray-900">{modalQuantity}</span><button onClick={() => setModalQuantity(modalQuantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-gray-600 hover:text-accent-600 transition-colors"><Plus size={18} /></button></div>
                  <div className="flex flex-col"><span className="text-sm text-gray-500">Total Price</span><span className="text-xl font-bold text-accent-500">{selectedProduct.currency} {(selectedProduct.price * modalQuantity).toLocaleString()}</span></div>
                </div>
                <div className="flex gap-3 mt-auto"><button className="flex-1 bg-primary-900 hover:bg-primary-800 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary-900/20" onClick={() => { addToCart(selectedProduct, modalQuantity); setSelectedProduct(null); }}>Add to Cart</button><button onClick={e => toggleWishlist(e, selectedProduct.id)} className={`p-3.5 border-2 rounded-xl transition-colors ${wishlist.includes(selectedProduct.id) ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 hover:border-accent-500 hover:text-accent-500'}`}><Heart size={20} className={wishlist.includes(selectedProduct.id) ? "fill-current" : ""} /></button></div>
             </div>
          </div>
        </div>
      )}

      <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ShoppingBag size={20} className="text-accent-500" /> Your Cart ({cart.length})</h2><button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4"><ShoppingCart size={48} className="opacity-20" /><p>Your cart is empty</p><button onClick={() => setIsCartOpen(false)} className="text-accent-500 font-medium text-sm">Start Shopping</button></div>
              : cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm"><img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" /><div className="flex-1 flex flex-col justify-between"><div><h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3><p className="text-accent-600 font-bold text-sm">{item.currency} {(item.price * item.quantity).toLocaleString()}</p></div><div className="flex items-center justify-between mt-2"><div className="flex items-center gap-3 bg-gray-50 rounded-md p-1"><button className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded text-xs font-bold hover:text-accent-500">-</button><span className="text-xs font-medium w-3 text-center">{item.quantity}</span><button className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded text-xs font-bold hover:text-accent-500" onClick={() => addToCart(item)}>+</button></div><button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-xs underline">Remove</button></div></div></div>
              ))}
            </div>
            {cart.length > 0 && <div className="p-5 border-t border-gray-100 bg-gray-50"><div className="flex justify-between mb-4 text-sm"><span className="text-gray-500">Subtotal</span><span className="font-bold text-gray-900">{cart[0].currency} {cartTotal.toLocaleString()}</span></div><div className="flex justify-between mb-6 text-sm"><span className="text-gray-500">Delivery</span><span className="font-bold text-green-600">Free</span></div><button onClick={handleCheckout} className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-accent-500/20 transition-all flex justify-center items-center gap-2">Checkout Now <CheckCircle size={18} /></button></div>}
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {userMode !== UserMode.ADMIN && <footer className="bg-primary-900 text-white"><div className="max-w-7xl mx-auto px-4 py-12"><div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"><div><h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Store className="text-accent-500" /> Ecuruza</h3><p className="text-gray-400 text-sm leading-relaxed">Africa’s most trusted ecommerce ecosystem.</p></div><div><h4 className="font-bold text-white mb-4">Shop</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-accent-400">New Arrivals</a></li><li><a href="#" className="hover:text-accent-400">Featured</a></li></ul></div><div><h4 className="font-bold text-white mb-4">Sell</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-accent-400">Become a Seller</a></li><li><a href="#" className="hover:text-accent-400">Dashboard</a></li></ul></div><div><h4 className="font-bold text-white mb-4">Support</h4><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-accent-400">Help Center</a></li><li><a href="#" className="hover:text-accent-400">Contact Us</a></li></ul></div></div><div className="border-t border-primary-800 pt-8 text-center text-gray-500 text-sm">&copy; 2024 Ecuruza Inc. All rights reserved.</div></div></footer>}
    </div>
  );
};

export default App;
