import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Heart, User as UserIcon, Sparkles, LogIn, LogOut, Search, 
  ChevronRight, Star, SlidersHorizontal, ArrowUpDown, ArrowLeft, RefreshCw, 
  ShoppingCart, ShieldCheck, Truck, RefreshCw as RotateCw, Send, Check, 
  Plus, Minus, X, HelpCircle, Bell, Mail, Compass, Layers, UserPlus, Info, Moon, Sun, Trash2,
  Lock, Phone, MapPin, Eye, EyeOff, Menu
} from 'lucide-react';
import { api } from './services/api';
import { Product, Order, SupportTicket, Coupon, Category, Brand, User, Review } from './types';
import AdminPanel from './components/AdminPanel';
import AIChatWidget from './components/AIChatWidget';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('techmart_theme') as 'light' | 'dark') || 'dark';
  });

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'register'>('none');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Nav/View State
  const [activeView, setActiveView] = useState<'home' | 'shop' | 'product-details' | 'cart' | 'checkout' | 'dashboard' | 'admin'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Lists & Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Catalog Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(3500);
  const [sortOption, setSortOption] = useState<'latest' | 'price-asc' | 'price-desc' | 'popularity'>('latest');

  // Product Detail Page State
  const [activeProductImage, setActiveProductImage] = useState<string>('');
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Cart & Coupon State
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>(() => {
    const saved = localStorage.getItem('techmart_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('techmart_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Checkout State
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingCountry, setShippingCountry] = useState('USA');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  // Customer Dashboard State
  const [dashTab, setDashTab] = useState<'profile' | 'orders' | 'tickets'>('profile');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});

  // Error/Success Notification toasts
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Main Storefront Data
  useEffect(() => {
    fetchStorefrontData();
    checkActiveSession();
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('techmart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('techmart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Handle dark mode class assignment
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('techmart_theme', theme);
  }, [theme]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStorefrontData = async () => {
    try {
      const prods = await api.products.getAll();
      setProducts(prods);
      const cats = await api.categories.getAll();
      setCategories(cats);
      const brs = await api.brands.getAll();
      setBrands(brs);
    } catch (err) {
      console.error("Error loading store data:", err);
    }
  };

  const checkActiveSession = async () => {
    const token = localStorage.getItem('techmart_token');
    if (token) {
      try {
        const u = await api.auth.getProfile();
        setUser(u);
        setProfilePhone(u.phone || '');
        setProfileAddress(u.address || '');
        fetchCustomerData();
      } catch (err) {
        localStorage.removeItem('techmart_token');
        setUser(null);
      }
    }
  };

  const fetchCustomerData = async () => {
    try {
      const orders = await api.orders.getMyOrders();
      setMyOrders(orders);
      const tickets = await api.support.getMyTickets();
      setMyTickets(tickets);
      const notifs = await api.notifications.getMy();
      setNotifications(notifs);
    } catch (err) {
      console.error("Error loading customer data:", err);
    }
  };

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await api.auth.login({ email: loginEmail, password: loginPassword });
      localStorage.setItem('techmart_token', res.token);
      setUser(res.user);
      setProfilePhone(res.user.phone || '');
      setProfileAddress(res.user.address || '');
      showToast('success', `Welcome back, ${res.user.name}!`);
      setAuthMode('none');
      setLoginEmail('');
      setLoginPassword('');
      fetchCustomerData();
    } catch (err: any) {
      const errMsg = err.message || 'Login failed. Please check credentials.';
      setAuthError(errMsg);
      showToast('error', errMsg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match. Please verify and try again.');
      showToast('error', 'Passwords do not match. Please verify and try again.');
      return;
    }
    try {
      const res = await api.auth.register({ 
        name: regName, 
        email: regEmail, 
        password: regPassword,
        phone: profilePhone,
        address: profileAddress
      });
      showToast('success', `Account created successfully! Please sign in with your credentials.`);
      setLoginEmail(regEmail); // Pre-fill login email for seamless experience
      setLoginPassword('');
      setAuthMode('login'); // Redirect to sign in view
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setProfilePhone('');
      setProfileAddress('');
    } catch (err: any) {
      const errMsg = err.message || 'Registration failed.';
      setAuthError(errMsg);
      showToast('error', errMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('techmart_token');
    setUser(null);
    setMyOrders([]);
    setMyTickets([]);
    setNotifications([]);
    setActiveView('home');
    showToast('success', 'Logged out successfully.');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.auth.updateProfile({ 
        name: user?.name, 
        phone: profilePhone, 
        address: profileAddress 
      });
      setUser(res.user);
      showToast('success', 'Profile updated successfully.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile.');
    }
  };

  // Cart / Wishlist Actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.product.availableStock < existing.quantity + quantity) {
          showToast('error', `Cannot add more. Limit exceeded (Max stock: ${product.availableStock})`);
          return prev;
        }
        showToast('success', `Updated quantity of ${product.name} in your cart.`);
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      showToast('success', `${product.name} added to shopping cart!`);
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (item.product.availableStock < newQty) {
            showToast('error', `Cannot exceed available stock of ${item.product.availableStock} units.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as any;
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('success', 'Removed from Wishlist.');
        return prev.filter(id => id !== productId);
      }
      showToast('success', 'Added to Wishlist!');
      return [...prev, productId];
    });
  };

  const applyCouponCode = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    try {
      const subtotal = getCartSubtotal();
      const res = await api.coupons.validate({ code: couponCode, amount: subtotal });
      setAppliedCoupon(res.coupon);
      showToast('success', `Coupon ${res.coupon.code} applied successfully!`);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon.');
    }
  };

  // Price Calculation Helpers
  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => {
      const effectivePrice = item.product.price * (1 - item.product.discount / 100);
      return sum + (effectivePrice * item.quantity);
    }, 0);
  };

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getCartSubtotal();
    if (appliedCoupon.discountType === 'percentage') {
      return subtotal * (appliedCoupon.discountValue / 100);
    }
    return Math.min(appliedCoupon.discountValue, subtotal);
  };

  const getCartTotal = () => {
    return Math.max(0, getCartSubtotal() - getCouponDiscount());
  };

  // Place Order Action
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthMode('login');
      showToast('error', 'Please login to checkout.');
      return;
    }

    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.price * (1 - item.product.discount / 100),
        quantity: item.quantity,
        thumbnail: item.product.thumbnail
      }));

      await api.orders.create({
        items,
        totalAmount: getCartSubtotal(),
        discountAmount: getCouponDiscount(),
        finalAmount: getCartTotal(),
        shippingAddress: {
          name: shippingName,
          phone: shippingPhone,
          address: shippingAddress,
          city: shippingCity,
          country: shippingCountry
        },
        paymentMethod
      });

      showToast('success', 'Congratulations! Your order has been placed successfully.');
      setCart([]);
      setAppliedCoupon(null);
      setCouponCode('');
      setActiveView('dashboard');
      setDashTab('orders');
      fetchCustomerData();
      fetchStorefrontData(); // Refresh stock metrics
    } catch (err: any) {
      showToast('error', err.message || 'Failed to place order.');
    }
  };

  // Ticket submissions
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMessage) return;
    try {
      await api.support.createTicket({ subject: newTicketSubject, message: newTicketMessage });
      showToast('success', 'Support ticket opened successfully. Our AI and support experts will reply shortly.');
      setNewTicketSubject('');
      setNewTicketMessage('');
      fetchCustomerData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to open ticket.');
    }
  };

  const handleTicketUserReply = async (id: string) => {
    const text = ticketReplies[id];
    if (!text || !text.trim()) return;
    try {
      await api.support.replyTicket(id, { message: text, role: 'user' });
      setTicketReplies(prev => ({ ...prev, [id]: '' }));
      showToast('success', 'Reply submitted successfully.');
      fetchCustomerData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit response.');
    }
  };

  // Reviews submission
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthMode('login');
      showToast('error', 'Please login to write a review.');
      return;
    }
    if (!selectedProductId) return;

    try {
      await api.reviews.add(selectedProductId, { rating: reviewRating, comment: reviewComment });
      showToast('success', 'Thank you for your valuable feedback!');
      setReviewComment('');
      // Reload reviews
      const revs = await api.reviews.getProductReviews(selectedProductId);
      setProductReviews(revs);
      fetchStorefrontData(); // Reload averages
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit review.');
    }
  };

  // View Navigation Loader helpers
  const viewProductDetails = async (id: string) => {
    setSelectedProductId(id);
    setActiveView('product-details');
    try {
      const p = await api.products.getById(id);
      setActiveProductImage(p.images[0] || p.thumbnail);
      const revs = await api.reviews.getProductReviews(id);
      setProductReviews(revs);
    } catch (error) {
      console.error(error);
    }
  };

  const markNotificationsRead = async () => {
    setShowNotifications(false);
    try {
      await api.notifications.markRead();
      fetchCustomerData();
    } catch (error) {
      console.error(error);
    }
  };

  // Filters Calculation logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    const matchesBrand = !selectedBrand || p.brand === selectedBrand;
    const matchesPrice = p.price * (1 - p.discount/100) <= priceRange;
    return matchesSearch && matchesCat && matchesBrand && matchesPrice;
  }).sort((a, b) => {
    const aPrice = a.price * (1 - a.discount/100);
    const bPrice = b.price * (1 - b.discount/100);
    if (sortOption === 'price-asc') return aPrice - bPrice;
    if (sortOption === 'price-desc') return bPrice - aPrice;
    if (sortOption === 'popularity') return b.ratings - a.ratings;
    return new Date(b.id).getTime() - new Date(a.id).getTime(); // Latest fallback
  });

  // Featured sections
  const featuredProducts = products.filter(p => p.isFeatured && p.isActive).slice(0, 4);
  const trendingProducts = products.filter(p => p.isTrending && p.isActive).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller && p.isActive).slice(0, 4);
  const flashSale = products.filter(p => p.isFlashSale && p.isActive);

  // If Admin Tab selected, delegate render entirely
  if (activeView === 'admin' && user && (user.role === 'admin' || user.role === 'superadmin')) {
    return (
      <AdminPanel 
        userRole={user.role} 
        onBackToStore={() => setActiveView('home')} 
        userId={user.id}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Immersive Dark Mode Radial Background Glows */}
      <div className="hidden dark:block absolute top-[-200px] left-[-200px] w-[600px] height-[600px] rounded-full bg-sky-500/10 blur-[130px] pointer-events-none z-0"></div>
      <div className="hidden dark:block absolute top-[400px] right-[-200px] w-[600px] height-[600px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none z-0"></div>

      {/* Toast Alert Banner */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 p-4 rounded-xl shadow-2xl border text-xs font-semibold animate-bounce backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200/50 dark:border-emerald-500/30 dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
              : 'bg-rose-50/90 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200/50 dark:border-rose-500/30 dark:shadow-[0_0_15px_rgba(239,68,68,0.15)]'
          }`}
          id="toast-notification"
        >
          {toast.type === 'success' ? <Check className="h-4 w-4 text-emerald-500" /> : <Info className="h-4 w-4 text-rose-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* STICKY HEADER AND NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#020617]/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => { setActiveView('home'); setSelectedCategory(''); setSearchQuery(''); }}
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group z-10"
          >
            <div className="bg-gradient-to-tr from-sky-400 to-indigo-500 dark:from-sky-400 dark:to-blue-600 p-1.5 sm:p-2 rounded-xl text-white dark:text-[#020617] font-bold shadow-md transform group-hover:rotate-6 transition">
              <ShoppingBag className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-white dark:to-sky-400 bg-clip-text text-transparent">
                TechMart
              </h1>
              <span className="text-[9px] block text-slate-400 dark:text-sky-400/80 uppercase tracking-widest leading-none font-bold hidden sm:block">
                AI Store Core
              </span>
            </div>
          </div>

          {/* Search bar inside header */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search smartphones, gaming PCs, laptops, RAM, graphics cards..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'shop') setActiveView('shop');
              }}
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 rounded-full py-2 pl-4 pr-10 text-xs focus:outline-none transition text-slate-800 dark:text-slate-100"
              id="header-search-input"
            />
            <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Functional Actions - Desktop Only */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-4 text-slate-600 dark:text-slate-300">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5 sm:h-5 w-5" /> : <Sun className="h-4.5 w-4.5 sm:h-5 w-5" />}
            </button>

            {/* Shop Button */}
            <button
              onClick={() => { setActiveView('shop'); setSelectedCategory(''); }}
              className={`flex items-center gap-1 text-[11px] sm:text-xs font-semibold hover:text-blue-600 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition ${activeView === 'shop' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' : ''}`}
            >
              <Compass className="h-4 w-4 sm:h-4.5 sm:w-4.5" /> <span className="hidden sm:inline">Explore Catalog</span>
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => { setActiveView('shop'); setSearchQuery(''); setSelectedCategory(''); setSelectedBrand(''); }}
              className="relative p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition group"
              title="My Favorites"
            >
              <Heart className="h-4.5 w-4.5 sm:h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-rose-500 transition-colors" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setActiveView('cart')}
              className={`relative p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center justify-center ${activeView === 'cart' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' : ''}`}
              title="Shopping Cart"
            >
              <ShoppingCart className="h-4.5 w-4.5 sm:h-5 w-5 text-slate-500 dark:text-slate-400" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Notifications panel toggle */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Alert Notifications"
                >
                  <Bell className="h-4.5 w-4.5 sm:h-5 w-5 text-slate-500" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full animate-ping"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 z-50 text-xs">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                      <span className="font-bold">Real-time alerts</span>
                      <button onClick={markNotificationsRead} className="text-[10px] text-blue-500 hover:underline">Mark read</button>
                    </div>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">No notifications yet.</p>
                      ) : (
                        notifications.slice().reverse().map(n => (
                          <div key={n.id} className={`p-2 rounded-lg ${n.read ? 'bg-slate-50 dark:bg-slate-950 text-slate-500' : 'bg-blue-50/50 dark:bg-blue-950/20 text-slate-800 dark:text-slate-200 font-medium'}`}>
                            <span className="block text-[10px] font-extrabold">{n.title}</span>
                            <p className="mt-0.5 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Menu trigger */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 sm:px-3 py-1.5 rounded-xl transition ${activeView === 'dashboard' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline truncate max-w-[80px]">{user.name}</span>
                </button>
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <button
                    onClick={() => setActiveView('admin')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg uppercase tracking-wider shadow-sm transition"
                  >
                    Console
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4.5 w-4.5 sm:h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthMode('login')}
                className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-md whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Sign In
              </button>
            )}

          </div>

          {/* Functional Actions - Mobile/Tablet Hamburger Menu */}
          <div className="flex md:hidden items-center gap-1.5 text-slate-600 dark:text-slate-300">
            {/* Theme Toggle on Mobile */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>

            {/* Shopping Cart on Mobile */}
            <button
              onClick={() => { setActiveView('cart'); setMobileMenuOpen(false); }}
              className={`relative p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center justify-center cursor-pointer ${activeView === 'cart' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' : ''}`}
              title="Shopping Cart"
            >
              <ShoppingCart className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-600 dark:text-slate-300"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Collapsible Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#020617] py-4 px-4 space-y-4 shadow-xl max-h-[calc(100vh-60px)] overflow-y-auto">
            
            {/* Search Bar on Mobile */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'shop') setActiveView('shop');
                }}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 focus:border-blue-500 rounded-xl py-2.5 pl-4 pr-10 text-xs focus:outline-none transition text-slate-800 dark:text-slate-100"
                id="mobile-search-input"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Navigation options */}
            <div className="space-y-1">
              <button
                onClick={() => { setActiveView('shop'); setSelectedCategory(''); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer ${activeView === 'shop' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
              >
                <Compass className="h-5 w-5 text-slate-500" />
                <span>Explore Catalog</span>
              </button>

              <button
                onClick={() => { setActiveView('shop'); setSearchQuery(''); setSelectedCategory(''); setSelectedBrand(''); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between text-xs font-bold px-4 py-3 rounded-xl transition hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-rose-500" />
                  <span>My Favorites</span>
                </div>
                {wishlist.length > 0 && (
                  <span className="bg-rose-100 dark:bg-rose-950/50 text-rose-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {wishlist.length} Items
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Alerts and Notifications if user is authenticated */}
            {user && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between px-4 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Real-Time Alerts</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <button onClick={markNotificationsRead} className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer">Mark read</button>
                  )}
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto px-2">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 text-center text-[11px] py-2">No active notifications</p>
                  ) : (
                    notifications.slice().reverse().map(n => (
                      <div key={n.id} className={`p-2 rounded-lg text-[11px] ${n.read ? 'bg-slate-50 dark:bg-slate-900/40 text-slate-500' : 'bg-blue-50/50 dark:bg-blue-950/20 text-slate-800 dark:text-slate-200 font-medium'}`}>
                        <span className="block font-bold">{n.title}</span>
                        <p className="leading-tight text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Profile / Actions */}
            {user ? (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <div className="bg-blue-100 dark:bg-blue-950 text-blue-600 p-2 rounded-xl">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{user.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl transition text-xs cursor-pointer"
                  >
                    Dashboard
                  </button>
                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <button
                      onClick={() => { setActiveView('admin'); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl transition text-xs cursor-pointer"
                    >
                      Console
                    </button>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="col-span-2 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold py-2.5 px-3 rounded-xl transition text-xs border border-rose-100/50 dark:border-rose-950/20 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  onClick={() => { setAuthMode('login'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-lg shadow-blue-500/10 transition-all duration-200 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" /> Sign In securely
                </button>
              </div>
            )}

          </div>
        )}
      </header>

      {/* SUB-HEADER CATEGORY BAR */}
      <nav className="bg-slate-100 dark:bg-[#020617]/50 dark:backdrop-blur-md border-b border-slate-200 dark:border-white/10 py-2.5 z-10">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 overflow-x-auto scrollbar-none text-xs font-semibold text-slate-600 dark:text-slate-400">
          <button 
            onClick={() => { setSelectedCategory(''); setActiveView('shop'); }}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer ${
              !selectedCategory && activeView === 'shop' 
                ? 'bg-blue-600 text-white dark:bg-[#38bdf8] dark:text-[#020617] dark:font-extrabold dark:shadow-[0_0_12px_rgba(56,189,248,0.3)]' 
                : 'hover:bg-slate-200 dark:hover:bg-white/10 dark:text-slate-300'
            }`}
          >
            All Electronics
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.name); setActiveView('shop'); }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.name && activeView === 'shop' 
                  ? 'bg-blue-600 text-white dark:bg-[#38bdf8] dark:text-[#020617] dark:font-extrabold dark:shadow-[0_0_12px_rgba(56,189,248,0.3)]' 
                  : 'hover:bg-slate-200 dark:hover:bg-white/10 dark:text-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* AUTHENTICATION MODAL DIALOGS */}
      {authMode !== 'none' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 w-full max-w-md md:max-w-2xl lg:max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative animate-fade-in flex flex-col md:flex-row transition-all duration-300">
            
            {/* Visual Brand Sidepanel (Only on larger screens for incredible design) */}
            <div className="hidden md:flex md:w-[40%] bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 p-8 flex-col justify-between text-white relative overflow-hidden border-r border-slate-100 dark:border-slate-800/50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)]"></div>
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
              
              <div className="z-10">
                <div className="flex items-center gap-2.5 mb-8">
                  <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                    <ShoppingBag className="h-5.5 w-5.5 text-blue-100" />
                  </div>
                  <span className="font-extrabold text-sm uppercase tracking-widest text-blue-50">TechMart</span>
                </div>
                
                <h4 className="text-xl font-black leading-tight text-white mt-6">
                  {authMode === 'login' ? 'Welcome Back!' : 'Start Your Journey'}
                </h4>
                <p className="text-[12px] text-blue-100/80 mt-2 leading-relaxed font-medium">
                  {authMode === 'login' 
                    ? 'Log in to manage orders, interact with our interactive AI agents, and submit support tickets.' 
                    : 'Create your digital profile to save persistent shopping carts and leverage smart tracking.'}
                </p>
              </div>

              <div className="z-10 space-y-4 pt-8 border-t border-white/10 text-[11px] text-blue-100/70 font-semibold">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-blue-300" />
                  <span>Secure AES-256 Encryption</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-blue-300" />
                  <span>AI-Powered Recommendations</span>
                </div>
              </div>
            </div>

            {/* Auth Form Side */}
            <div className="w-full md:w-[60%] p-8 sm:p-10 flex flex-col justify-center relative bg-white dark:bg-slate-900">
              <button
                onClick={() => {
                  setAuthMode('none');
                  setShowPassword(false);
                  setAuthError('');
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-6 text-xs">
                  <div>
                    <span className="text-[10.5px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400">Sign In</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Welcome Back</h3>
                    <p className="text-slate-400 text-[12px] mt-1">Enter your credentials to securely access your store account.</p>
                  </div>

                  {authError && (
                    <div className="bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-200 p-3.5 rounded-xl flex items-start gap-2.5 animate-pulse">
                      <Info className="h-4.5 w-4.5 shrink-0 text-rose-500 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs uppercase tracking-wider">Access Denied</p>
                        <p className="text-[11px] font-medium opacity-90 mt-0.5">{authError}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-500 dark:text-slate-400 font-bold text-xs">E-mail Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Mail className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="saadkust5481@gmail.com"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:text-slate-100"
                          id="input-login-email"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-500 dark:text-slate-400 font-bold text-xs">Account Password</label>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Lock className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:text-slate-100"
                          id="input-login-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-lg shadow-blue-500/10 transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                    id="btn-login-submit"
                  >
                    <LogIn className="h-4.5 w-4.5" /> Sign In securely
                  </button>

                  <p className="text-center text-slate-500 text-[12px] pt-2">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => {
                        setAuthMode('register');
                        setShowPassword(false);
                        setAuthError('');
                      }} 
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Create new profile
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10.5px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400">Join Us</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Register Profile</h3>
                    <p className="text-slate-400 text-[12px] mt-1">Fill out the form to configure your new client account.</p>
                  </div>

                  {authError && (
                    <div className="bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-200 p-3 rounded-xl flex items-start gap-2.5 animate-pulse">
                      <Info className="h-4.5 w-4.5 shrink-0 text-rose-500 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs uppercase tracking-wider">Registration Error</p>
                        <p className="text-[11px] font-medium opacity-90 mt-0.5">{authError}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3.5 max-h-[250px] md:max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {/* Name Input */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 dark:text-slate-400 font-bold text-xs">Full Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <UserIcon className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Saad Khan"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 dark:text-slate-400 font-bold text-xs">E-mail Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Mail className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Create Password Input */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 dark:text-slate-400 font-bold text-xs">Create Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Lock className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Choose password"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 dark:text-slate-400 font-bold text-xs">Confirm Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Lock className="h-4.5 w-4.5" />
                        </span>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Phone and Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-500 dark:text-slate-400 font-bold text-xs">Phone (Optional)</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <Phone className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="+1 234..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-500 dark:text-slate-400 font-bold text-xs">Address (Optional)</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            value={profileAddress}
                            onChange={(e) => setProfileAddress(e.target.value)}
                            placeholder="Address"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-lg shadow-blue-500/10 transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="h-4.5 w-4.5" /> Create Profile
                  </button>

                  <p className="text-center text-slate-500 text-[12px] pt-1">
                    Already registered?{' '}
                    <button 
                      type="button" 
                      onClick={() => {
                        setAuthMode('login');
                        setShowPassword(false);
                        setAuthError('');
                      }} 
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Sign in here
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CORE PAGES ROUTER */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOME LANDING PAGE */}
        {activeView === 'home' && (
          <div className="space-y-12 pb-16 animate-fade-in px-4 sm:px-6 lg:px-8">
            {/* HERO CAROUSEL / HIGHLIGHT SLIDE */}
            <section className="bg-gradient-to-br from-[#0f172a] to-[#020617] text-white py-16 sm:py-20 px-6 sm:px-10 relative overflow-hidden rounded-3xl border border-white/10 shadow-3xl mt-6">
              <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] bg-radial from-sky-500/15 to-transparent blur-[100px] z-0 pointer-events-none"></div>
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                <div className="space-y-6">
                  <span className="bg-sky-500/10 border border-sky-400/40 text-sky-400 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                    <Sparkles className="h-3 w-3 animate-pulse text-sky-400" /> AI Enhanced Shopping
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                    The Ultimate Tech Experience.
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
                    Explore our premium collection of next-gen electronics. Powered by AI to find the perfect gear for your workflow.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setActiveView('shop')}
                      className="bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#020617] font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                    >
                      Shop Now
                    </button>
                    <button 
                      onClick={() => {
                        const aiBtn = document.getElementById('btn-ai-floating');
                        if (aiBtn) aiBtn.click();
                      }}
                      className="bg-transparent hover:bg-white/5 text-white border border-white/15 hover:border-white/30 font-bold text-xs px-6 py-3.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="h-4.5 w-4.5 text-sky-400" /> Meet Gemini Assistant
                    </button>
                  </div>
                </div>

                {/* Main sliding card mock */}
                <div className="relative flex justify-center">
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-3xl max-w-[340px] space-y-4">
                    <img 
                      src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80" 
                      alt="MacBook deal" 
                      className="h-48 w-full object-cover rounded-2xl" 
                    />
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Flash Sale deal</span>
                        <h4 className="font-extrabold text-sm text-white">MacBook Pro 16" M3</h4>
                      </div>
                      <div className="bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        SAVE 5%
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Equipped with 48GB unified Memory, M3 Max chip processor, and Liquid Retina screen.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* PRODUCT CATEGORIES ICON GRID */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Shop by Core Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.name); setActiveView('shop'); }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-blue-500 cursor-pointer shadow-sm group transition-all"
                  >
                    <img src={cat.image} alt={cat.name} className="h-12 w-12 object-cover rounded-xl group-hover:scale-105 transition" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* DYNAMIC CAMPAIGN SECTION: FLASH SALES */}
            {flashSale.length > 0 && (
              <section className="bg-rose-50 dark:bg-rose-950/20 py-10 border-t border-b border-rose-100 dark:border-rose-900/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Timed Event</span>
                      <h3 className="text-base font-black text-rose-800 dark:text-rose-300 mt-1">TechMart Flash Sale Deals</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {flashSale.map(prod => (
                      <div 
                        key={prod.id} 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 space-y-3 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                        onClick={() => viewProductDetails(prod.id)}
                      >
                        <div className="relative">
                          <img src={prod.thumbnail} alt={prod.name} className="h-40 w-full object-cover rounded-xl" />
                          <span className="absolute top-2 left-2 bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">-{prod.discount}% FLASH</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold">{prod.brand}</span>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{prod.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">${(prod.price * (1 - prod.discount/100)).toFixed(0)}</span>
                            <span className="text-[10px] text-slate-400 line-through">${prod.price}</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart(prod); }}
                          className="w-full mt-3 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold py-2 rounded-lg transition"
                        >
                          Grab Deal
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* THREE SECTION GRID: FEATURED, TRENDING, BEST SELLERS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Featured Products list */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold border-b pb-2 flex items-center justify-between">
                  <span>Featured Products</span>
                  <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-ping"></span>
                </h3>
                <div className="space-y-4">
                  {featuredProducts.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => viewProductDetails(p.id)}
                      className="flex gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-3 rounded-2xl hover:border-blue-500 cursor-pointer shadow-sm transition"
                    >
                      <img src={p.thumbnail} alt={p.name} className="h-16 w-16 object-cover rounded-xl" />
                      <div className="flex-1 text-xs min-w-0">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{p.brand}</span>
                        <h4 className="font-bold text-slate-800 dark:text-white truncate mt-0.5">{p.name}</h4>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 block mt-1">${(p.price * (1 - p.discount/100)).toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Products list */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold border-b pb-2 flex items-center justify-between">
                  <span>Trending Devices</span>
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                </h3>
                <div className="space-y-4">
                  {trendingProducts.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => viewProductDetails(p.id)}
                      className="flex gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-3 rounded-2xl hover:border-blue-500 cursor-pointer shadow-sm transition"
                    >
                      <img src={p.thumbnail} alt={p.name} className="h-16 w-16 object-cover rounded-xl" />
                      <div className="flex-1 text-xs min-w-0">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{p.brand}</span>
                        <h4 className="font-bold text-slate-800 dark:text-white truncate mt-0.5">{p.name}</h4>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 block mt-1">${(p.price * (1 - p.discount/100)).toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Sellers list */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold border-b pb-2 flex items-center justify-between">
                  <span>Customer Best Sellers</span>
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                </h3>
                <div className="space-y-4">
                  {bestSellers.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => viewProductDetails(p.id)}
                      className="flex gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-3 rounded-2xl hover:border-blue-500 cursor-pointer shadow-sm transition"
                    >
                      <img src={p.thumbnail} alt={p.name} className="h-16 w-16 object-cover rounded-xl" />
                      <div className="flex-1 text-xs min-w-0">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{p.brand}</span>
                        <h4 className="font-bold text-slate-800 dark:text-white truncate mt-0.5">{p.name}</h4>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 block mt-1">${(p.price * (1 - p.discount/100)).toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </section>

            {/* BRAND HERO HIGHLIGHT CAROUSEL */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Elite Brands We Host</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {brands.map(brand => (
                  <div 
                    key={brand.id}
                    onClick={() => { setSelectedBrand(brand.name); setActiveView('shop'); }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center flex items-center justify-center font-black tracking-widest text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-blue-500 cursor-pointer transition"
                  >
                    {brand.name.toUpperCase()}
                  </div>
                ))}
              </div>
            </section>

            {/* PROMOTIONAL NEWSLETTER SIGNUP */}
            <section className="bg-slate-900 text-white rounded-3xl max-w-7xl mx-auto px-6 py-10 sm:py-12 border border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.1),transparent_35%)]"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">Never miss premium deals</h4>
                  <p className="text-xs text-slate-400 max-w-sm">Sign up to receive product arrivals, special promotional discounts, and custom hardware campaign alerts.</p>
                </div>
                <div className="flex w-full md:w-auto max-w-md gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter email address" 
                    className="bg-slate-800 border border-slate-700 text-xs px-4 py-3 rounded-xl focus:outline-none w-full text-white" 
                  />
                  <button 
                    onClick={() => showToast('success', 'Subscribed successfully. You will receive custom electronics brochures!')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 rounded-xl transition whitespace-nowrap"
                  >
                    Join Tech Club
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: PRODUCT SEARCH AND SHOP CATALOG PAGE */}
        {activeView === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 animate-fade-in">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 space-y-6 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4.5 w-4.5" /> Filters Settings
                </h3>
                <button 
                  onClick={() => { setSelectedCategory(''); setSelectedBrand(''); setSearchQuery(''); setPriceRange(3500); }}
                  className="text-[10px] text-blue-500 hover:underline font-bold"
                >
                  Reset All
                </button>
              </div>

              {/* Search query manual override */}
              <div className="space-y-2 text-xs">
                <label className="block text-slate-400 font-semibold uppercase text-[10px]">Title keyword</label>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type to filter..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs" 
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="block text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Product Categories</label>
                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-850">
                    <input type="radio" checked={!selectedCategory} onChange={() => setSelectedCategory('')} name="filter-cat" />
                    <span className="font-medium text-slate-600 dark:text-slate-300">All Categories</span>
                  </label>
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-850">
                      <input type="radio" checked={selectedCategory === c.name} onChange={() => setSelectedCategory(c.name)} name="filter-cat" />
                      <span className="font-medium text-slate-600 dark:text-slate-300">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-2">
                <label className="block text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Brands</label>
                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-850">
                    <input type="radio" checked={!selectedBrand} onChange={() => setSelectedBrand('')} name="filter-brand" />
                    <span className="font-medium text-slate-600 dark:text-slate-300">All Brands</span>
                  </label>
                  {brands.map(b => (
                    <label key={b.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-850">
                      <input type="radio" checked={selectedBrand === b.name} onChange={() => setSelectedBrand(b.name)} name="filter-brand" />
                      <span className="font-medium text-slate-600 dark:text-slate-300">{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="space-y-2 text-xs">
                <label className="block text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Maximum Price (${priceRange})</label>
                <input 
                  type="range" 
                  min="50" 
                  max="3500" 
                  value={priceRange} 
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-ew-resize" 
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>$50</span>
                  <span>$3500+</span>
                </div>
              </div>
            </aside>

            {/* Catalog Grid Area */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                <div>
                  <h2 className="text-base font-bold">Tech Catalog Listings</h2>
                  <p className="text-xs text-slate-400 font-medium">Found {filteredProducts.length} premium hardware units matching criteria.</p>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <ArrowUpDown className="h-4 w-4" /> Sort by:
                  </span>
                  <select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="latest">Latest Arrivals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="popularity">Average Ratings</option>
                  </select>
                </div>
              </div>

              {/* Actual grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border text-slate-400 flex flex-col items-center justify-center gap-2">
                  <SlidersHorizontal className="h-10 w-10 text-slate-300 animate-pulse" />
                  <p className="text-xs font-semibold">No products found matching active filters.</p>
                  <button 
                    onClick={() => { setSelectedCategory(''); setSelectedBrand(''); setSearchQuery(''); setPriceRange(3500); }}
                    className="mt-2 text-xs text-blue-500 font-bold hover:underline"
                  >
                    Clear catalog overrides
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map(prod => {
                    const hasDiscount = prod.discount > 0;
                    const effectivePrice = prod.price * (1 - prod.discount/100);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => viewProductDetails(prod.id)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition cursor-pointer group"
                      >
                        <div className="space-y-3">
                          <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950">
                            <img src={prod.thumbnail} alt={prod.name} className="h-44 w-full object-cover group-hover:scale-105 transition duration-500" />
                            {hasDiscount && (
                              <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow">
                                -{prod.discount}% OFF
                              </span>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                              className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-full text-slate-500 hover:text-rose-600 shadow"
                            >
                              <Heart className={`h-4 w-4 ${wishlist.includes(prod.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                              <span>{prod.brand.toUpperCase()}</span>
                              <span className="flex items-center gap-0.5 text-amber-500">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {prod.ratings}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">{prod.name}</h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{prod.model}</p>
                          </div>
                        </div>

                        <div className="space-y-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-baseline gap-2">
                            <span className="font-black text-blue-600 dark:text-blue-400 text-sm">${effectivePrice.toFixed(0)}</span>
                            {hasDiscount && (
                              <span className="text-[10px] text-slate-400 line-through">${prod.price}</span>
                            )}
                          </div>
                          
                          {/* Stock markings */}
                          <div className="flex items-center justify-between text-[10px]">
                            {prod.availableStock <= 0 ? (
                              <span className="text-rose-500 font-bold">Out of Stock</span>
                            ) : prod.availableStock < 10 ? (
                              <span className="text-amber-500 font-bold">Low stock ({prod.availableStock} left)</span>
                            ) : (
                              <span className="text-emerald-500 font-bold">In stock</span>
                            )}
                            
                            <button
                              disabled={prod.availableStock <= 0}
                              onClick={(e) => { e.stopPropagation(); addToCart(prod); }}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg transition text-[10px]"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: PRODUCT DETAILS PAGE */}
        {activeView === 'product-details' && selectedProductId && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
            {/* Back button */}
            <button 
              onClick={() => setActiveView('shop')}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold transition"
            >
              <ArrowLeft className="h-4.5 w-4.5" /> Back to Catalog
            </button>

            {/* Main Product Panel details */}
            {products.filter(p => p.id === selectedProductId).map(prod => {
              const hasDiscount = prod.discount > 0;
              const effectivePrice = prod.price * (1 - prod.discount/100);
              return (
                <div key={prod.id} className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT IMAGE GALLERY */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center">
                        <img 
                          src={activeProductImage || prod.thumbnail} 
                          alt={prod.name} 
                          className="h-[300px] w-full object-contain hover:scale-105 transition duration-300" 
                        />
                      </div>
                      
                      {/* Thumbnails array list */}
                      <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none">
                        {prod.images.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => setActiveProductImage(img)}
                            className={`h-16 w-16 bg-white dark:bg-slate-900 border-2 rounded-xl cursor-pointer overflow-hidden p-1 flex-shrink-0 transition ${
                              activeProductImage === img ? 'border-blue-500' : 'border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <img src={img} alt="" className="h-full w-full object-cover rounded-lg" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT SPECS AND BUY AREA */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider block">{prod.brand}</span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">{prod.name}</h2>
                        
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star className="h-4.5 w-4.5 fill-amber-500 text-amber-500" /> {prod.ratings} ({prod.reviewsCount} verified reviews)
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">SKU: {prod.sku}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">Model: {prod.model}</span>
                        </div>
                      </div>

                      {/* Pricing row */}
                      <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Store Price</span>
                          <div className="flex items-baseline gap-2.5">
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">${effectivePrice.toFixed(0)}</span>
                            {hasDiscount && (
                              <span className="text-xs text-slate-400 line-through">${prod.price}</span>
                            )}
                          </div>
                        </div>

                        {hasDiscount && (
                          <div className="bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-xl text-center">
                            <span className="block text-[9px] font-extrabold uppercase leading-none">Campaign discount</span>
                            <span className="text-xs font-bold font-mono">SAVE {prod.discount}%</span>
                          </div>
                        )}
                      </div>

                      {/* Product descriptive text */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Overview</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{prod.description}</p>
                      </div>

                      {/* Add to wishlist and cart actions row */}
                      <div className="flex gap-4 items-center">
                        <button
                          disabled={prod.availableStock <= 0}
                          onClick={() => addToCart(prod, 1)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 dark:disabled:from-slate-800 disabled:text-slate-400 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="h-5 w-5" /> Add To Shopping Cart
                        </button>

                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-xl transition shadow-sm"
                          title="Save to Wishlist"
                        >
                          <Heart className={`h-5 w-5 text-slate-500 ${wishlist.includes(prod.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Policy Badges row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                        <div className="flex gap-2.5 items-center bg-white dark:bg-slate-900 border p-3 rounded-xl shadow-sm text-xs">
                          <ShieldCheck className="h-5 w-5 text-blue-600" />
                          <div>
                            <span className="block font-bold">Warranty</span>
                            <span className="text-[10px] text-slate-400">{prod.warranty}</span>
                          </div>
                        </div>

                        <div className="flex gap-2.5 items-center bg-white dark:bg-slate-900 border p-3 rounded-xl shadow-sm text-xs">
                          <Truck className="h-5 w-5 text-emerald-600" />
                          <div>
                            <span className="block font-bold">Delivery terms</span>
                            <span className="text-[10px] text-slate-400">{prod.deliveryInfo}</span>
                          </div>
                        </div>

                        <div className="flex gap-2.5 items-center bg-white dark:bg-slate-900 border p-3 rounded-xl shadow-sm text-xs">
                          <RotateCw className="h-5 w-5 text-amber-600" />
                          <div>
                            <span className="block font-bold">Return Window</span>
                            <span className="text-[10px] text-slate-400">{prod.returnPolicy}</span>
                          </div>
                        </div>
                      </div>

                      {/* TECHNICAL SPECIFICATIONS TABLES */}
                      {prod.technicalSpecifications && Object.entries(prod.technicalSpecifications).filter(([_, val]) => val && String(val).trim() !== '').length > 0 && (
                        <div className="space-y-3 pt-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Specifications</h4>
                          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                            <table className="w-full text-xs text-left border-collapse">
                              <tbody>
                                {Object.entries(prod.technicalSpecifications)
                                  .filter(([_, val]) => val && String(val).trim() !== '')
                                  .map(([key, val], idx) => (
                                    <tr key={idx} className="border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                                      <td className="p-3 bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold w-1/3">{key}</td>
                                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{val}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CUSTOMER REVIEWS & FEEDBACK FORMS */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-200 dark:border-slate-800 pt-10">
                    {/* Reviews List */}
                    <div className="lg:col-span-7 space-y-6">
                      <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Customer Reviews</h3>
                      
                      {productReviews.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No reviews posted yet for this electronic device. Be the first to write a feedback!</p>
                      ) : (
                        <div className="space-y-4">
                          {productReviews.map(rev => (
                            <div key={rev.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{rev.userName}</span>
                                <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-amber-500' : 'text-slate-200 dark:text-slate-700'}`} />
                                ))}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">"{rev.comment}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Review form */}
                    <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 text-xs">
                      <h4 className="font-bold text-sm">Submit Product Feedback</h4>
                      <form onSubmit={handleAddReview} className="space-y-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Star Rating</label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setReviewRating(num)}
                                className="p-0.5 text-amber-500 hover:scale-110 transition"
                              >
                                <Star className={`h-6 w-6 ${num <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-200 dark:text-slate-800'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Your Comment</label>
                          <textarea
                            required
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Write your honest user experiences, performance benchmarks..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 focus:outline-none focus:border-blue-500 h-24"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-md transition"
                        >
                          Submit Feedback
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 4: SHOPPING CART */}
        {activeView === 'cart' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Shopping Cart Checkout</h2>

            {cart.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <ShoppingCart className="h-12 w-12 text-slate-300 animate-bounce" />
                <p className="text-xs font-semibold">Your shopping cart is currently empty.</p>
                <button 
                  onClick={() => setActiveView('shop')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow"
                >
                  Go to Catalog Shop
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Cart list details */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {cart.map(item => {
                    const priceAfterDiscount = item.product.price * (1 - item.product.discount/100);
                    return (
                      <div key={item.product.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.product.thumbnail} alt="" className="h-16 w-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold">{item.product.brand.toUpperCase()}</span>
                            <h4 className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{item.product.name}</h4>
                            <span className="font-extrabold text-blue-600 dark:text-blue-400 block mt-1">${priceAfterDiscount.toFixed(0)}</span>
                          </div>
                        </div>

                        {/* Quantity triggers */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950">
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, -1)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 py-1 font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, 1)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button 
                            onClick={() => updateCartQuantity(item.product.id, -item.quantity)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing Summary column */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Price Summary</h3>
                  
                  {/* Coupon Campaign Area */}
                  <div className="space-y-2 text-xs">
                    <label className="block text-slate-400 font-semibold mb-1">Coupon code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. TECH10" 
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 uppercase" 
                      />
                      <button 
                        onClick={applyCouponCode}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-lg transition"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <span className="text-[10px] text-rose-500 font-semibold block">{couponError}</span>}
                    {appliedCoupon && (
                      <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                        <span>Applied: {appliedCoupon.code}</span>
                        <button onClick={() => setAppliedCoupon(null)} className="text-rose-500 hover:underline">Remove</button>
                      </div>
                    )}
                  </div>

                  {/* Calculations breakdown */}
                  <div className="space-y-3.5 text-xs font-semibold border-t pt-4 border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>Cart Subtotal</span>
                      <span>${getCartSubtotal().toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-rose-500">
                        <span>Campaign Discount</span>
                        <span>-${getCouponDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Shipping Delivery</span>
                      <span className="text-emerald-600 font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t pt-3.5">
                      <span>Final Order Cost</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('checkout')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition"
                  >
                    Proceed to Delivery Checkout
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW 5: CHECKOUT PAGE */}
        {activeView === 'checkout' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
            <h2 className="text-lg font-black">Secure E-Commerce Checkout</h2>
            
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Delivery info */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-sm border-b pb-2">1. Delivery Address</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Recipient Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={shippingName} 
                      onChange={e => setShippingName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Contact Phone Number</label>
                    <input 
                      type="text" 
                      required 
                      value={shippingPhone} 
                      onChange={e => setShippingPhone(e.target.value)}
                      placeholder="+1 (555) 000-1122"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Street Address</label>
                    <input 
                      type="text" 
                      required 
                      value={shippingAddress} 
                      onChange={e => setShippingAddress(e.target.value)}
                      placeholder="123 Tech Avenue"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">City</label>
                      <input 
                        type="text" 
                        required 
                        value={shippingCity} 
                        onChange={e => setShippingCity(e.target.value)}
                        placeholder="Silicon Valley"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Country</label>
                      <input 
                        type="text" 
                        required 
                        value={shippingCountry} 
                        onChange={e => setShippingCountry(e.target.value)}
                        placeholder="USA"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment and Order confirmation receipt summary */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 text-xs">
                  <h3 className="font-bold text-sm border-b pb-2">2. Settlement Gateway</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <input type="radio" name="payment" checked={paymentMethod === 'Credit Card'} onChange={() => setPaymentMethod('Credit Card')} />
                      <span className="font-semibold">Credit/Debit Card (Visa/Mastercard)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <input type="radio" name="payment" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} />
                      <span className="font-semibold">Cash on Delivery (COD)</span>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4 text-xs border border-slate-850">
                  <h3 className="font-bold text-sm border-b border-slate-800 pb-2">3. Purchase Summary</h3>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex justify-between items-center text-slate-400 font-medium">
                        <span className="truncate max-w-[150px]">{item.product.name} ({item.quantity}x)</span>
                        <span>${(item.product.price * (1 - item.product.discount/100) * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Delivery Shipping Charge</span>
                      <span className="text-emerald-400 font-bold">FREE</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-rose-400">
                        <span>Campaign Discount</span>
                        <span>-${getCouponDiscount().toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold text-white border-t border-slate-800 pt-3">
                      <span>Final Order Charge</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow"
                  >
                    Place E-Commerce Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 6: CUSTOMER DASHBOARD / PROFILE / MY ORDERS / SUPPORT */}
        {activeView === 'dashboard' && user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 animate-fade-in">
            {/* Left Nav menu */}
            <aside className="w-full lg:w-64 space-y-2 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-xs font-semibold">
              <button
                onClick={() => setDashTab('profile')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition ${dashTab === 'profile' ? 'bg-blue-50 dark:bg-blue-950 text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
              >
                My Profile Details
              </button>
              <button
                onClick={() => setDashTab('orders')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition ${dashTab === 'orders' ? 'bg-blue-50 dark:bg-blue-950 text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
              >
                E-Commerce Purchase Orders
              </button>
              <button
                onClick={() => setDashTab('tickets')}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition ${dashTab === 'tickets' ? 'bg-blue-50 dark:bg-blue-950 text-blue-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
              >
                Support Tickets Panel
              </button>
            </aside>

            {/* Right main panel */}
            <div className="flex-1">
              
              {/* TAB 1: CUSTOMER PROFILE DETAILS */}
              {dashTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6 text-xs">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">My Profile Details</h3>
                    <p className="text-xs text-slate-400">Keep your delivery details updated for smooth handovers.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        disabled
                        value={user.name} 
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">E-mail Address</label>
                      <input 
                        type="email" 
                        disabled 
                        value={user.email} 
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={profilePhone} 
                        onChange={e => setProfilePhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Shipping & Billing Address</label>
                      <input 
                        type="text" 
                        value={profileAddress} 
                        onChange={e => setProfileAddress(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
                  >
                    Save Changes
                  </button>
                </form>
              )}

              {/* TAB 2: MY ORDERS LIST AND TRACKING */}
              {dashTab === 'orders' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">My Purchase Orders</h3>
                    <p className="text-xs text-slate-400">Track shipping, check invoice history, and delivery schedules.</p>
                  </div>

                  {myOrders.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-12 text-center text-slate-400 text-xs font-semibold">
                      You have not placed any orders yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.slice().reverse().map(ord => (
                        <div key={ord.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-xs space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                              <span className="block font-extrabold text-blue-600">{ord.id}</span>
                              <span className="text-[10px] text-slate-400">Ordered: {new Date(ord.createdAt).toLocaleString()}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border ${
                              ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20' :
                              ord.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20' :
                              ord.status === 'processing' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20' :
                              ord.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20' :
                              'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800'
                            }`}>
                              {ord.status}
                            </span>
                          </div>

                          {/* Items */}
                          <div className="space-y-2.5">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex gap-3 items-center">
                                <img src={it.thumbnail} alt="" className="h-10 w-10 object-cover rounded-lg border" />
                                <div className="flex-1">
                                  <span className="font-bold block truncate max-w-sm">{it.name}</span>
                                  <span className="text-[10px] text-slate-400">{it.quantity}x • ${it.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                            <span className="font-extrabold text-slate-500">Tracking Code: <strong className="text-slate-900 dark:text-slate-100 font-mono">{ord.trackingNumber}</strong></span>
                            <span className="font-black text-slate-850 dark:text-slate-100">Total Charged: ${ord.finalAmount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SUPPORT TICKETS LIST AND SUBMISSION */}
              {dashTab === 'tickets' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-xs">
                    <form onSubmit={handleCreateTicket} className="w-full space-y-4">
                      <div>
                        <h4 className="font-bold text-sm">Open Support Ticket</h4>
                        <p className="text-slate-400 mt-0.5">Need a repair, hardware check, or refund? Our team will assist.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Ticket Subject</label>
                          <input 
                            type="text" 
                            required 
                            value={newTicketSubject}
                            onChange={e => setNewTicketSubject(e.target.value)}
                            placeholder="e.g. Broken screen warranty repair"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Detailed Message</label>
                          <textarea 
                            required 
                            value={newTicketMessage}
                            onChange={e => setNewTicketMessage(e.target.value)}
                            placeholder="State serial codes, error symptoms..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 focus:outline-none h-20" 
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition shadow"
                      >
                        File Ticket
                      </button>
                    </form>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm">My Ticket Disputes</h3>
                    {myTickets.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No tickets filed yet.</p>
                    ) : (
                      myTickets.slice().reverse().map(ticket => (
                        <div key={ticket.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <div>
                              <span className="font-extrabold text-blue-600 block">{ticket.id}</span>
                              <h4 className="font-bold text-slate-850 dark:text-slate-100 text-xs mt-0.5">{ticket.subject}</h4>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              ticket.status === 'open' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' :
                              ticket.status === 'replied' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-3 max-h-32 overflow-y-auto">
                            {ticket.responses.map((rep, rIdx) => (
                              <div key={rIdx} className={`p-2 rounded ${rep.role === 'admin' ? 'bg-blue-50 dark:bg-blue-900/10 border-l-2 border-blue-500' : 'bg-white dark:bg-slate-900 border border-slate-200'}`}>
                                <span className="block font-extrabold text-[9px] text-slate-400">{rep.role === 'admin' ? 'Support Agent' : 'Me'}</span>
                                <p className="leading-snug mt-0.5">{rep.message}</p>
                              </div>
                            ))}
                          </div>

                          {ticket.status !== 'closed' && (
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Reply back to support agent..." 
                                value={ticketReplies[ticket.id] || ''}
                                onChange={e => setTicketReplies(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs" 
                              />
                              <button 
                                onClick={() => handleTicketUserReply(ticket.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-lg transition"
                              >
                                Send
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* PREMIUM ATTRACTIVE FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-white font-extrabold text-sm">TechMart Corp.</h4>
            <p className="leading-relaxed">
              Premium premium marketplace for modern tech gadgets and smart solutions. High quality consumer electronics, gaming units, and accessories.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Customer Help</h4>
            <ul className="space-y-2 text-slate-400 font-semibold">
              <li><button onClick={() => { setActiveView('dashboard'); setDashTab('tickets'); }} className="hover:text-white transition">Submit Dispute Ticket</button></li>
              <li><button onClick={() => { setActiveView('home'); }} className="hover:text-white transition">FAQ Guide</button></li>
              <li><span className="text-slate-500">Call Support: +1 (234) 567-8900</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Campaign Coupons</h4>
            <ul className="space-y-2">
              <li><span className="font-extrabold text-blue-400 font-mono">TECH10</span> - 10% Discount Coupon</li>
              <li><span className="font-extrabold text-blue-400 font-mono">SUPER50</span> - $50 off coupon</li>
              <li><span className="font-extrabold text-blue-400 font-mono">WELCOME20</span> - 20% registration off</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm font-mono">Secure Settlement</h4>
            <p className="leading-relaxed">All transactions are fully secured. We support Credit/Debit processing, PayPal, and Cash on Delivery.</p>
            <div className="flex gap-2 text-[10px] text-emerald-400 font-bold bg-slate-950 p-2.5 rounded-lg border border-slate-850">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span>Insured Same-Day Dispatch Handling</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
          <p>© 2026 TechMart AI Electronics Store. Constructed with enterprise-level precision.</p>
        </div>
      </footer>

      {/* FLOATING AI CHAT WIDGET */}
      <AIChatWidget userId={user?.id} />

    </div>
  );
}
