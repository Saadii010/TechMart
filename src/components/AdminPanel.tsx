import React, { useState, useEffect } from 'react';
import { 
  BarChart, Package, ShoppingBag, Users, MessageSquare, Tag, 
  Trash2, Plus, Edit, ShieldAlert, CheckCircle, Clock, XCircle, 
  Save, AlertTriangle, Eye, EyeOff, ArrowLeft, ToggleLeft, ToggleRight, Sparkles, RefreshCw,
  Upload, Image, Star, Check, Info, Lock, X
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Order, SupportTicket, Coupon, Category, Brand, User } from '../types';
import { 
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell 
} from 'recharts';

interface AdminPanelProps {
  userRole: string;
  onBackToStore: () => void;
  userId: string;
}

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminPanel({ userRole, onBackToStore, userId }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'tickets' | 'coupons' | 'users' | 'ai-logs'>('dashboard');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);

  // Form Modals / Edit States
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '', discountType: 'percentage', discountValue: 10, minPurchase: 100, expiryDate: '2027-12-31'
  });
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});

  const [isDragging, setIsDragging] = useState(false);

  // Custom Confirmation & Alert Modals
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // User Creation Form States
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('admin');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showUserConfirmPassword, setShowUserConfirmPassword] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) {
      setAdminError("Please fill in all required fields (Name, Email, Password, Role).");
      return;
    }
    if (newUserPassword !== newUserConfirmPassword) {
      setAdminError("Passwords do not match. Please make sure both password fields are identical.");
      return;
    }
    setIsCreatingUser(true);
    try {
      await api.superadmin.createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        phone: newUserPhone,
        address: newUserAddress
      });
      setAdminSuccess(`User account "${newUserName}" created successfully as ${newUserRole}!`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserConfirmPassword('');
      setNewUserRole('admin');
      setNewUserPhone('');
      setNewUserAddress('');
      setIsCreateModalOpen(false);
      setShowUserPassword(false);
      setShowUserConfirmPassword(false);
      fetchAdminData();
    } catch (err: any) {
      setAdminError(err.message || "Failed to create user account.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    readImageFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    readImageFiles(files);
  };

  const readImageFiles = (files: FileList) => {
    if (!editingProduct) return;
    const filePromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises)
      .then((newImages) => {
        const currentImages = editingProduct.images || [];
        const updatedImages = [...currentImages, ...newImages];
        const firstImage = updatedImages[0] || '';
        
        setEditingProduct({
          ...editingProduct,
          images: updatedImages,
          thumbnail: editingProduct.thumbnail || firstImage
        });
      })
      .catch((err) => {
        console.error("Error reading image files:", err);
        alert("Failed to load some images. Please try again with valid image files.");
      });
  };

  const setAsCover = (index: number) => {
    if (!editingProduct || !editingProduct.images) return;
    const selectedUrl = editingProduct.images[index];
    setEditingProduct({
      ...editingProduct,
      thumbnail: selectedUrl
    });
  };

  const removeImage = (index: number) => {
    if (!editingProduct || !editingProduct.images) return;
    const updatedImages = [...editingProduct.images];
    const removedUrl = updatedImages[index];
    updatedImages.splice(index, 1);
    
    let newThumbnail = editingProduct.thumbnail;
    if (editingProduct.thumbnail === removedUrl) {
      newThumbnail = updatedImages[0] || '';
    }
    
    setEditingProduct({
      ...editingProduct,
      images: updatedImages,
      thumbnail: newThumbnail
    });
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const data = await api.superadmin.getAnalytics();
        setAnalytics(data);
      } else if (activeTab === 'products') {
        const data = await api.products.getAll(true);
        setProducts(data);
        const cats = await api.categories.getAll();
        setCategories(cats);
        const brs = await api.brands.getAll();
        setBrands(brs);
      } else if (activeTab === 'categories') {
        const cats = await api.categories.getAll();
        setCategories(cats);
        const brs = await api.brands.getAll();
        setBrands(brs);
      } else if (activeTab === 'orders') {
        const data = await api.orders.getAllOrders();
        setOrders(data);
      } else if (activeTab === 'tickets') {
        const data = await api.support.getAllTickets();
        setTickets(data);
      } else if (activeTab === 'coupons') {
        const data = await api.coupons.getAll();
        setCoupons(data);
      } else if (activeTab === 'users' && userRole === 'superadmin') {
        const data = await api.superadmin.getUsers();
        setUsers(data);
      } else if (activeTab === 'ai-logs') {
        const data = await api.ai.getLogs();
        setAiLogs(data);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleProductSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Validate that there are at least 4 images uploaded
    const imagesCount = editingProduct.images?.length || 0;
    if (imagesCount < 4) {
      alert(`Error: A minimum of 4 product images is compulsory! You have currently uploaded ${imagesCount} image(s). Please add at least ${4 - imagesCount} more image(s) to meet the requirement.`);
      return;
    }

    // Automatically set thumbnail/cover image to the first image if not set or invalid
    const finalThumbnail = editingProduct.thumbnail || editingProduct.images?.[0] || '';
    if (!finalThumbnail) {
      alert("Error: Product thumbnail cover image is missing. Please add images first.");
      return;
    }

    try {
      const productPayload = {
        ...editingProduct,
        thumbnail: finalThumbnail,
        images: editingProduct.images
      };

      if (editingProduct.id) {
        // Update
        await api.products.update(editingProduct.id, productPayload);
      } else {
        // Create
        await api.products.create(productPayload);
      }
      setEditingProduct(null);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to save product.");
    }
  };

  const handleProductDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await api.products.delete(id);
      fetchAdminData();
    }
  };

  const handleCategoryCreate = async () => {
    if (!newCategoryName.trim()) return;
    await api.categories.create({ name: newCategoryName });
    setNewCategoryName('');
    fetchAdminData();
  };

  const handleCategoryDelete = async (id: string) => {
    if (confirm("Delete category?")) {
      await api.categories.delete(id);
      fetchAdminData();
    }
  };

  const handleBrandCreate = async () => {
    if (!newBrandName.trim()) return;
    await api.brands.create({ name: newBrandName });
    setNewBrandName('');
    fetchAdminData();
  };

  const handleBrandDelete = async (id: string) => {
    if (confirm("Delete brand?")) {
      await api.brands.delete(id);
      fetchAdminData();
    }
  };

  const handleOrderStatusUpdate = async (id: string, status: Order['status'], tracking?: string) => {
    await api.orders.updateStatus(id, { status, trackingNumber: tracking });
    fetchAdminData();
  };

  const handleTicketReply = async (id: string) => {
    const text = ticketReplies[id];
    if (!text || !text.trim()) return;
    await api.support.replyTicket(id, { message: text, role: 'admin' });
    setTicketReplies(prev => ({ ...prev, [id]: '' }));
    fetchAdminData();
  };

  const handleTicketClose = async (id: string) => {
    await api.support.closeTicket(id);
    fetchAdminData();
  };

  const handleCouponCreate = async () => {
    if (!newCoupon.code) return;
    await api.coupons.create(newCoupon);
    setNewCoupon({ code: '', discountType: 'percentage', discountValue: 10, minPurchase: 100, expiryDate: '2027-12-31' });
    fetchAdminData();
  };

  const handleCouponToggle = async (id: string) => {
    await api.coupons.toggle(id);
    fetchAdminData();
  };

  const handleCouponDelete = async (id: string) => {
    if (confirm("Delete coupon?")) {
      await api.coupons.delete(id);
      fetchAdminData();
    }
  };

  const handleUserRoleChange = async (id: string, role: string) => {
    try {
      await api.superadmin.changeRole(id, { role });
      setAdminSuccess("User role updated successfully!");
      fetchAdminData();
    } catch (err: any) {
      setAdminError(err.message || "Failed to update user role");
    }
  };

  const handleToggleSuspend = async (id: string, isSuspended: boolean) => {
    try {
      await api.superadmin.toggleSuspend(id, { isSuspended });
      setAdminSuccess(`User account ${isSuspended ? 'suspended' : 'activated'} successfully!`);
      fetchAdminData();
    } catch (err: any) {
      setAdminError(err.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    setUserToDelete({ id, name });
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.superadmin.deleteUser(userToDelete.id);
      setAdminSuccess(`User account "${userToDelete.name}" has been permanently deleted.`);
      setUserToDelete(null);
      fetchAdminData();
    } catch (err: any) {
      setAdminError(err.message || "Failed to delete user account.");
      setUserToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Immersive Dark Mode Radial Background Glows */}
      <div className="hidden dark:block absolute top-[-200px] left-[-200px] w-[500px] height-[500px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Admin Subheader */}
      <div className="bg-[#020617] text-white px-6 py-4 flex items-center justify-between shadow-md border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToStore}
            className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition text-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </button>
          <div className="h-4 w-px bg-white/10"></div>
          <span className="bg-[#38bdf8] text-[#020617] text-[10px] uppercase font-black px-2.5 py-1 rounded-full tracking-wider animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.4)]">
            {userRole === 'superadmin' ? 'Super Admin Mode' : 'Admin Portal'}
          </span>
        </div>
        <h2 className="text-sm font-black tracking-wider text-[#38bdf8] bg-clip-text">
          TechMart E-Commerce Management System
        </h2>
      </div>

      <div className="flex-1 flex">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-6 flex flex-col justify-between">
          <div className="space-y-1 px-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Management</h3>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <BarChart className="h-4.5 w-4.5" /> General Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'products' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Package className="h-4.5 w-4.5" /> Product Catalog
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'categories' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Tag className="h-4.5 w-4.5" /> Categories & Brands
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'orders' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <ShoppingBag className="h-4.5 w-4.5" /> Customer Orders
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'tickets' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <ShieldAlert className="h-4.5 w-4.5" /> Support Tickets
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'coupons' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Tag className="h-4.5 w-4.5" /> Promotional Coupons
            </button>
            <button
              onClick={() => setActiveTab('ai-logs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'ai-logs' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Sparkles className="h-4.5 w-4.5" /> AI Assistant Chats
            </button>

            {userRole === 'superadmin' && (
              <>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-4 mb-3">Super Admin Only</h3>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'users' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Users className="h-4.5 w-4.5" /> Roles & Accounts
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Content Panel Area */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-3">
              <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Fetching real-time dataset...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: GENERAL DASHBOARD */}
              {activeTab === 'dashboard' && analytics && (
                <div className="space-y-8 animate-fade-in">
                  {/* KPI Indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</span>
                        <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${analytics.summary.totalSales}</h4>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active Products</span>
                        <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{analytics.summary.totalProducts}</h4>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl text-blue-600 dark:text-blue-400">
                        <Package className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Customers</span>
                        <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{analytics.summary.totalCustomers}</h4>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl text-purple-600 dark:text-purple-400">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Tickets</span>
                        <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{analytics.summary.openTickets}</h4>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl text-rose-600 dark:text-rose-400">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Secondary stats row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div><strong>Total Orders:</strong> {analytics.summary.totalOrders}</div>
                    <div><strong>Pending Orders:</strong> {analytics.summary.pendingOrders}</div>
                    <div><strong>Completed Orders:</strong> {analytics.summary.completedOrders}</div>
                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                      <Sparkles className="h-4 w-4 animate-spin-slow" />
                      <span>AI Shopping Interactions: {analytics.summary.aiInteractions}</span>
                    </div>
                  </div>

                  {/* Recharts Analytics Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Line Chart for Daily Sales Trends */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Daily Sales Trends (Last 7 Days)</h3>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analytics.salesByDay}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                            <YAxis stroke="#94a3b8" fontSize={10} />
                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie Chart for Brand Distribution */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Brand Sales Split</h3>
                      <div className="h-[200px] flex items-center justify-center">
                        {analytics.categoryDistribution && analytics.categoryDistribution.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.categoryDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {analytics.categoryDistribution.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <span className="text-xs text-slate-400">No sale datasets yet</span>
                        )}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {analytics.categoryDistribution?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-[10px]">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                            <span className="truncate max-w-[80px] font-semibold">{item.name}:</span>
                            <span className="text-slate-500 font-medium">${item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCT MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Catalog Registry</h3>
                      <p className="text-xs text-slate-500">Add, edit, deactivate, or delete items instantly from the live stock.</p>
                    </div>
                    {!editingProduct && (
                      <button
                        onClick={() => setEditingProduct({
                          name: '', brand: '', category: '', sku: '', model: '', thumbnail: '', description: '',
                          price: 100, discount: 0, availableStock: 10, warranty: '1 Year Warranty',
                          deliveryInfo: 'Fast delivery', returnPolicy: '15 Days policy',
                          isFeatured: false, isTrending: false, isBestSeller: false, isFlashSale: false, isNewArrival: true,
                          technicalSpecifications: {},
                          images: []
                        })}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                      >
                        <Plus className="h-4.5 w-4.5" /> Add New Electronics
                      </button>
                    )}
                  </div>

                  {editingProduct ? (
                    <form onSubmit={handleProductSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
                      <h4 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-3">
                        {editingProduct.id ? `Edit ${editingProduct.name}` : 'Add New E-Commerce Product'}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Product Title</label>
                          <input 
                            type="text" 
                            required
                            value={editingProduct.name || ''} 
                            onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" 
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Brand Name</label>
                          <select 
                            required
                            value={editingProduct.brand || ''} 
                            onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none"
                          >
                            <option value="">Select Brand</option>
                            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Category</label>
                          <select 
                            required
                            value={editingProduct.category || ''} 
                            onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 focus:outline-none"
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">SKU Code</label>
                          <input 
                            type="text" 
                            required
                            value={editingProduct.sku || ''} 
                            onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Model Number</label>
                          <input 
                            type="text" 
                            required
                            value={editingProduct.model || ''} 
                            onChange={e => setEditingProduct({...editingProduct, model: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                          />
                        </div>

                        <div className="md:col-span-3 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <Image className="h-4 w-4 text-blue-500" /> Product Gallery Images <span className="text-rose-500 font-bold">* Compulsory (Minimum 4 required)</span>
                            </label>
                            <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              (editingProduct.images?.length || 0) >= 4 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                            }`}>
                              {editingProduct.images?.length || 0} / 4 minimum
                            </div>
                          </div>

                          {/* Drag and Drop Zone */}
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('product-images-upload')?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group ${
                              isDragging
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                                : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-950/50'
                            }`}
                          >
                            <input
                              type="file"
                              id="product-images-upload"
                              multiple
                              accept="image/*"
                              onChange={handleImageFilesChange}
                              className="hidden"
                            />
                            <Upload className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors animate-bounce" />
                            <div className="space-y-1">
                              <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                                Drag & drop your product pictures, or <span className="text-blue-600 dark:text-blue-400 underline">browse computer</span>
                              </p>
                              <p className="text-[10px] text-slate-400">Supports JPG, PNG, WEBP, GIF (Minimum 4 files are required)</p>
                            </div>
                          </div>

                          {/* Presets and Guidelines */}
                          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-medium">✨ Quick presets (Click to instantly load high-quality placeholder electronics assets for easy testing):</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: '💻 Premium Laptop', url: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=600&q=80' },
                                { label: '💻 Modern Notebook', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80' },
                                { label: '📱 Flagship Smartphone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80' },
                                { label: '📱 Smart Phone Red', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80' },
                                { label: '🎧 Noise Cancelling Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
                                { label: '⌚ Smartwatch Active', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
                                { label: '📁 Pro Tablet', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80' },
                                { label: '📷 DSLR Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80' },
                                { label: '🔊 Wireless Speaker', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80' },
                                { label: '⌨️ Mechanical Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80' }
                              ].map((preset) => {
                                const isAlreadyAdded = editingProduct.images?.includes(preset.url);
                                return (
                                  <button
                                    type="button"
                                    key={preset.url}
                                    onClick={() => {
                                      const currentImages = editingProduct.images || [];
                                      if (isAlreadyAdded) {
                                        const idx = currentImages.indexOf(preset.url);
                                        removeImage(idx);
                                      } else {
                                        const updated = [...currentImages, preset.url];
                                        setEditingProduct({
                                          ...editingProduct,
                                          images: updated,
                                          thumbnail: editingProduct.thumbnail || preset.url
                                        });
                                      }
                                    }}
                                    className={`text-[10px] px-2.5 py-1 rounded-md border transition ${
                                      isAlreadyAdded
                                        ? 'bg-blue-600 border-blue-700 text-white font-semibold'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {preset.label} {isAlreadyAdded ? '✓' : '+'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Real-time Status Badge */}
                          {(editingProduct.images?.length || 0) < 4 ? (
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-[11px] font-semibold animate-pulse">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              <span>⚠️ Compulsory Rule: A minimum of 4 product images is required. Please upload or click to add {4 - (editingProduct.images?.length || 0)} more image(s).</span>
                            </div>
                          ) : (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                              <CheckCircle className="h-4 w-4 shrink-0" />
                              <span>✅ Requirement Met: You have added {editingProduct.images?.length} images. Ready to save!</span>
                            </div>
                          )}

                          {/* Gallery Preview Grid */}
                          {editingProduct.images && editingProduct.images.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Selected Images Grid (Click star to set Cover Image):</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {editingProduct.images.map((imgUrl, idx) => {
                                  const isCover = editingProduct.thumbnail === imgUrl || (idx === 0 && !editingProduct.thumbnail);
                                  return (
                                    <div 
                                      key={idx} 
                                      className={`relative rounded-xl border overflow-hidden bg-slate-50 dark:bg-slate-950 aspect-square group transition-all duration-200 ${
                                        isCover ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-blue-500'
                                      }`}
                                    >
                                      <img 
                                        src={imgUrl} 
                                        alt={`Product preview ${idx + 1}`} 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=200&q=80';
                                        }}
                                      />
                                      
                                      {/* Cover Badge */}
                                      {isCover && (
                                        <div className="absolute top-1.5 left-1.5 bg-amber-400 text-slate-900 font-black text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm uppercase tracking-wider">
                                          <Star className="h-2 w-2 fill-slate-900" /> Cover
                                        </div>
                                      )}
                                      
                                      {/* Hover Action Overlay */}
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
                                        <div className="flex justify-end">
                                          <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md transition shadow-sm"
                                            title="Delete Image"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <div className="text-[9px] text-white font-extrabold truncate px-1 text-center bg-black/40 rounded py-0.5">
                                            Pic {idx + 1}
                                          </div>
                                          {!isCover && (
                                            <button
                                              type="button"
                                              onClick={() => setAsCover(idx)}
                                              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[9px] py-1 rounded transition flex items-center justify-center gap-0.5"
                                            >
                                              <Star className="h-2.5 w-2.5 fill-slate-900" /> Set Cover
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Base Price ($)</label>
                          <input 
                            type="number" 
                            required
                            value={editingProduct.price || 0} 
                            onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Discount (%)</label>
                          <input 
                            type="number" 
                            value={editingProduct.discount || 0} 
                            onChange={e => setEditingProduct({...editingProduct, discount: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Stock Available</label>
                          <input 
                            type="number" 
                            required
                            value={editingProduct.availableStock || 0} 
                            onChange={e => setEditingProduct({...editingProduct, availableStock: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                          />
                        </div>
                      </div>

                      <div className="text-xs space-y-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Long Description</label>
                          <textarea 
                            value={editingProduct.description || ''} 
                            onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 h-20" 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Warranty Term</label>
                            <input 
                              type="text" 
                              value={editingProduct.warranty || ''} 
                              onChange={e => setEditingProduct({...editingProduct, warranty: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Delivery Information</label>
                            <input 
                              type="text" 
                              value={editingProduct.deliveryInfo || ''} 
                              onChange={e => setEditingProduct({...editingProduct, deliveryInfo: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Return Policy</label>
                            <input 
                              type="text" 
                              value={editingProduct.returnPolicy || ''} 
                              onChange={e => setEditingProduct({...editingProduct, returnPolicy: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                            />
                          </div>
                        </div>

                        {/* Technical Specifications Section */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                              🛠️ Technical Specifications (Optional)
                            </label>
                            <span className="text-[10px] text-slate-400">Only filled specifications will be shown to customers</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { key: 'Storage', label: 'Storage / Capacity', placeholder: 'e.g. 1TB NVMe SSD or 256GB ROM' },
                              { key: 'Display', label: 'Display Size & Spec', placeholder: 'e.g. 16.2" Liquid Retina XDR (120Hz)' },
                              { key: 'Battery', label: 'Battery Capacity / Life', placeholder: 'e.g. 5000 mAh or Up to 22 Hours' },
                              { key: 'Backup', label: 'Battery Backup', placeholder: 'e.g. Up to 12 Hours continuous video' },
                              { key: 'Processor', label: 'Processor / CPU', placeholder: 'e.g. Apple M3 Max (16-core CPU)' },
                              { key: 'Memory', label: 'Memory / RAM', placeholder: 'e.g. 16GB LPDDR5 RAM' },
                              { key: 'Camera', label: 'Camera Info', placeholder: 'e.g. 200MP Main + 12MP Ultra-wide' },
                              { key: 'Operating System', label: 'Operating System', placeholder: 'e.g. Android 14 or macOS Sonoma' }
                            ].map((spec) => (
                              <div key={spec.key} className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">{spec.label}</label>
                                <input 
                                  type="text" 
                                  placeholder={spec.placeholder}
                                  value={editingProduct.technicalSpecifications?.[spec.key] || ''} 
                                  onChange={e => {
                                    const specs = { ...editingProduct.technicalSpecifications };
                                    if (e.target.value.trim() === '') {
                                      delete specs[spec.key];
                                    } else {
                                      specs[spec.key] = e.target.value;
                                    }
                                    setEditingProduct({ ...editingProduct, technicalSpecifications: specs });
                                  }}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
                                />
                              </div>
                            ))}
                          </div>

                          {/* Custom Specs Section */}
                          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">Custom Specifications</label>
                            
                            {/* Existing custom specs rendering */}
                            {Object.entries(editingProduct.technicalSpecifications || {})
                              .filter(([key]) => !['Storage', 'Display', 'Battery', 'Backup', 'Processor', 'Memory', 'Camera', 'Operating System'].includes(key))
                              .map(([key, val]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    readOnly
                                    value={key} 
                                    className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs w-1/3 font-semibold text-slate-500 dark:text-slate-400" 
                                  />
                                  <input 
                                    type="text" 
                                    value={val} 
                                    onChange={e => {
                                      const specs = { ...editingProduct.technicalSpecifications };
                                      specs[key] = e.target.value;
                                      setEditingProduct({ ...editingProduct, technicalSpecifications: specs });
                                    }}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs" 
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const specs = { ...editingProduct.technicalSpecifications };
                                      delete specs[key];
                                      setEditingProduct({ ...editingProduct, technicalSpecifications: specs });
                                    }}
                                    className="text-rose-500 p-1.5 rounded-lg border border-rose-200/40 bg-rose-50/50 hover:bg-rose-100/50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                            ))}

                            {/* Add Custom Spec Form */}
                            <div className="flex gap-2 items-center">
                              <input 
                                type="text" 
                                id="newSpecKey"
                                placeholder="New Spec Name (e.g., Weight)" 
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs w-1/3 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                              />
                              <input 
                                type="text" 
                                id="newSpecVal"
                                placeholder="Value (e.g., 1.5 kg)" 
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const keyInput = document.getElementById('newSpecKey') as HTMLInputElement;
                                  const valInput = document.getElementById('newSpecVal') as HTMLInputElement;
                                  if (!keyInput || !valInput) return;
                                  const key = keyInput.value.trim();
                                  const val = valInput.value.trim();
                                  if (!key || !val) {
                                    alert("Please provide both spec name and spec value.");
                                    return;
                                  }
                                  const specs = { ...editingProduct.technicalSpecifications };
                                  specs[key] = val;
                                  setEditingProduct({ ...editingProduct, technicalSpecifications: specs });
                                  keyInput.value = '';
                                  valInput.value = '';
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shrink-0"
                              >
                                Add Spec
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Status Checkboxes */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 font-semibold text-slate-600 dark:text-slate-400">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.isFeatured || false} onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})} />
                            Featured
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.isTrending || false} onChange={e => setEditingProduct({...editingProduct, isTrending: e.target.checked})} />
                            Trending
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.isBestSeller || false} onChange={e => setEditingProduct({...editingProduct, isBestSeller: e.target.checked})} />
                            Best Seller
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.isFlashSale || false} onChange={e => setEditingProduct({...editingProduct, isFlashSale: e.target.checked})} />
                            Flash Sale
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.isNewArrival || false} onChange={e => setEditingProduct({...editingProduct, isNewArrival: e.target.checked})} />
                            New Arrival
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.isActive !== false} onChange={e => setEditingProduct({...editingProduct, isActive: e.target.checked})} />
                            Active Listing
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button 
                          type="button" 
                          onClick={() => setEditingProduct(null)} 
                          className="px-4 py-2 text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition text-xs font-bold"
                        >
                          <Save className="h-4.5 w-4.5" /> Save Product Record
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100/60 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <th className="p-4">SKU & Product</th>
                              <th className="p-4">Brand</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Price</th>
                              <th className="p-4">Stock Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {products.map(prod => (
                              <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="p-4 flex items-center gap-3">
                                  <img src={prod.thumbnail} alt={prod.name} className="h-10 w-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                                  <div>
                                    <span className="block font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{prod.name}</span>
                                    <span className="text-[10px] text-slate-400">{prod.sku}</span>
                                  </div>
                                </td>
                                <td className="p-4 font-semibold">{prod.brand}</td>
                                <td className="p-4 font-semibold text-slate-500">{prod.category}</td>
                                <td className="p-4 font-extrabold text-blue-600 dark:text-blue-400">
                                  ${prod.price} {prod.discount > 0 && <span className="text-[10px] text-rose-500 font-semibold">-{prod.discount}%</span>}
                                </td>
                                <td className="p-4">
                                  {prod.availableStock <= 0 ? (
                                    <span className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Out of Stock</span>
                                  ) : prod.availableStock < 10 ? (
                                    <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Low Stock ({prod.availableStock})</span>
                                  ) : (
                                    <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold">In Stock ({prod.availableStock})</span>
                                  )}
                                  {!prod.isActive && <span className="ml-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[9px] font-medium">Inactive</span>}
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      onClick={() => setEditingProduct(prod)}
                                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition"
                                      title="Edit Record"
                                    >
                                      <Edit className="h-4.5 w-4.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleProductDelete(prod.id)}
                                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-600 transition"
                                      title="Delete Record"
                                    >
                                      <Trash2 className="h-4.5 w-4.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CATEGORY & BRAND MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                  {/* Category Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Shop Categories</h3>
                      <p className="text-xs text-slate-400">Add or manage categories shown on the main navigation panel.</p>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <input 
                        type="text" 
                        placeholder="New category name (e.g., Tablets)" 
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                      />
                      <button 
                        onClick={handleCategoryCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-lg transition"
                      >
                        Add Category
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                      {categories.map(cat => (
                        <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.name}</span>
                            <span className="text-[10px] text-slate-400">/{cat.slug}</span>
                          </div>
                          <button 
                            onClick={() => handleCategoryDelete(cat.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brand Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tech Brands</h3>
                      <p className="text-xs text-slate-400">Manage manufacturers and e-commerce partners.</p>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <input 
                        type="text" 
                        placeholder="New brand (e.g., HP)" 
                        value={newBrandName}
                        onChange={e => setNewBrandName(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                      />
                      <button 
                        onClick={handleBrandCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-lg transition"
                      >
                        Add Brand
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                      {brands.map(b => (
                        <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{b.name}</span>
                          <button 
                            onClick={() => handleBrandDelete(b.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Customer Purchase Orders</h3>
                    <p className="text-xs text-slate-500">Track shipping, provide tracking, or dispatch parcels.</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/60 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Order ID & Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Items Summary</th>
                            <th className="p-4">Total Price</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {orders.map(ord => (
                            <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-4">
                                <span className="block font-bold text-slate-900 dark:text-white">{ord.id}</span>
                                <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                              </td>
                              <td className="p-4">
                                <span className="block font-semibold">{ord.userName || ord.shippingAddress.name}</span>
                                <span className="text-[10px] text-slate-400">{ord.userEmail || ord.shippingAddress.phone}</span>
                              </td>
                              <td className="p-4">
                                <span className="block font-medium truncate max-w-[150px]">
                                  {ord.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-slate-900 dark:text-slate-100">${ord.finalAmount}</td>
                              <td className="p-4">
                                <select 
                                  value={ord.status} 
                                  onChange={e => handleOrderStatusUpdate(ord.id, e.target.value as any, ord.trackingNumber)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold outline-none border cursor-pointer ${
                                    ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20' :
                                    ord.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20' :
                                    ord.status === 'processing' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20' :
                                    ord.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20' :
                                    'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex gap-2 justify-end">
                                  <input 
                                    type="text" 
                                    defaultValue={ord.trackingNumber} 
                                    placeholder="Enter Tracking" 
                                    onBlur={e => handleOrderStatusUpdate(ord.id, ord.status, e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[10px] max-w-[110px]" 
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SUPPORT TICKETS */}
              {activeTab === 'tickets' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Customer Support Desk</h3>
                    <p className="text-xs text-slate-500">Provide expert advice, close disputes, or file responses.</p>
                  </div>

                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-blue-600">{ticket.id}</span>
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{ticket.subject}</h4>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">Submitted by: {ticket.userName} ({ticket.userEmail}) • {new Date(ticket.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                              ticket.status === 'open' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' :
                              ticket.status === 'replied' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {ticket.status}
                            </span>
                            {ticket.status !== 'closed' && (
                              <button 
                                onClick={() => handleTicketClose(ticket.id)}
                                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded"
                              >
                                Close Ticket
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Conversational thread */}
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto space-y-3">
                          {ticket.responses.map((rep, rIdx) => (
                            <div key={rIdx} className={`text-xs p-2 rounded-lg max-w-[85%] ${rep.role === 'admin' ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500 ml-auto' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mr-auto'}`}>
                              <span className="block font-extrabold text-[10px] text-slate-400 mb-1">{rep.role === 'admin' ? 'TechMart Support Staff' : ticket.userName}</span>
                              <p className="leading-relaxed text-slate-700 dark:text-slate-300">{rep.message}</p>
                              <span className="block text-[9px] text-slate-400 text-right mt-1">{new Date(rep.createdAt).toLocaleTimeString()}</span>
                            </div>
                          ))}
                        </div>

                        {ticket.status !== 'closed' && (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Write a response to this ticket..." 
                              value={ticketReplies[ticket.id] || ''}
                              onChange={e => setTicketReplies(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs" 
                            />
                            <button 
                              onClick={() => handleTicketReply(ticket.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 rounded-lg transition"
                            >
                              Send Response
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: PROMOTION COUPONS */}
              {activeTab === 'coupons' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-sm font-bold">Create Coupon</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Coupon Code</label>
                        <input 
                          type="text" 
                          placeholder="e.g. MEGA100" 
                          value={newCoupon.code}
                          onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Type</label>
                        <select 
                          value={newCoupon.discountType}
                          onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2"
                        >
                          <option value="percentage">Percentage Off (%)</option>
                          <option value="fixed">Fixed Price Off ($)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Value</label>
                        <input 
                          type="number" 
                          value={newCoupon.discountValue}
                          onChange={e => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Minimum Cart Subtotal ($)</label>
                        <input 
                          type="number" 
                          value={newCoupon.minPurchase}
                          onChange={e => setNewCoupon({...newCoupon, minPurchase: Number(e.target.value)})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2" 
                        />
                      </div>
                      <button 
                        onClick={handleCouponCreate}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
                      >
                        Create Campaign
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold">Active Coupons Campaigns</h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {coupons.map(coup => (
                        <div key={coup.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-extrabold text-blue-600 block">{coup.code}</span>
                            <span className="text-[10px] text-slate-400">
                              {coup.discountType === 'percentage' ? `${coup.discountValue}% off` : `$${coup.discountValue} off`} • Min buy: ${coup.minPurchase}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleCouponToggle(coup.id)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold ${coup.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                            >
                              {coup.isActive ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {coup.isActive ? 'Active' : 'Paused'}
                            </button>
                            <button onClick={() => handleCouponDelete(coup.id)} className="text-slate-400 hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: USER ACCOUNTS (SUPER ADMIN ONLY) */}
              {activeTab === 'users' && userRole === 'superadmin' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">System Accounts & Permissions</h3>
                      <p className="text-xs text-slate-500">Create new admin and super admin accounts, or adjust existing roles and permissions.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/15 transition cursor-pointer flex items-center justify-center gap-1.5 self-start md:self-auto"
                    >
                      <Plus className="h-4 w-4" /> Create System Account
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/60 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Customer</th>
                            <th className="p-4">Email Address</th>
                            <th className="p-4">Access Role</th>
                            <th className="p-4">Account Status</th>
                            <th className="p-4 text-right">Actions / Permissions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-4 font-bold">
                                <div>{u.name}</div>
                                <div className="text-[10px] font-medium text-slate-400">{u.phone || 'No Phone'}</div>
                              </td>
                              <td className="p-4 text-slate-500">{u.email}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  u.role === 'superadmin' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20' :
                                  u.role === 'admin' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' :
                                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  u.isSuspended
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/60'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/60'
                                }`}>
                                  {u.isSuspended ? '⚠️ Suspended' : '✓ Active'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {u.id === 'user-super' || u.email === 'superadmin@techmart.com' ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/70 border border-indigo-200 dark:bg-indigo-950/35 dark:border-indigo-900/60 rounded-xl text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                      <Lock className="h-3.5 w-3.5" /> Root Master
                                    </div>
                                  ) : u.id !== userId ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSuspend(u.id, !u.isSuspended)}
                                        className={`h-8 px-2.5 rounded-lg text-[10px] font-black uppercase transition-colors duration-150 flex items-center gap-1 border cursor-pointer ${
                                          u.isSuspended
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900'
                                            : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900'
                                        }`}
                                        title={u.isSuspended ? "Activate User" : "Suspend User"}
                                      >
                                        {u.isSuspended ? 'Activate' : 'Suspend'}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteUser(u.id, u.name)}
                                        className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 flex items-center justify-center transition-colors dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900 cursor-pointer"
                                        title="Delete User"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Self Account</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* CREATE USER POPUP MODAL */}
                  {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-md w-full animate-scale-in relative space-y-4">
                        <button
                          type="button"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Create System Account</h4>
                          <p className="text-[11px] text-slate-500">Quickly add a new Admin or Super Admin to the system.</p>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4 text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Full Name *</label>
                            <input 
                              type="text"
                              required
                              placeholder="John Doe"
                              value={newUserName}
                              onChange={e => setNewUserName(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address *</label>
                            <input 
                              type="email"
                              required
                              placeholder="john@example.com"
                              value={newUserEmail}
                              onChange={e => setNewUserEmail(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password *</label>
                            <div className="relative">
                              <input 
                                type={showUserPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={newUserPassword}
                                onChange={e => setNewUserPassword(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => setShowUserPassword(!showUserPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              >
                                {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Confirm Password *</label>
                            <div className="relative">
                              <input 
                                type={showUserConfirmPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={newUserConfirmPassword}
                                onChange={e => setNewUserConfirmPassword(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => setShowUserConfirmPassword(!showUserConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              >
                                {showUserConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Access Role *</label>
                            <select
                              value={newUserRole}
                              onChange={e => setNewUserRole(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
                            >
                              <option value="admin">Admin</option>
                              <option value="superadmin">Super Admin</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone Number (Optional)</label>
                            <input 
                              type="text"
                              placeholder="+1 234 567 8900"
                              value={newUserPhone}
                              onChange={e => setNewUserPhone(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Office/Delivery Address (Optional)</label>
                            <textarea 
                              placeholder="123 Corporate St, Suite 100"
                              rows={2}
                              value={newUserAddress}
                              onChange={e => setNewUserAddress(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 font-medium resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isCreatingUser}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/15 transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isCreatingUser ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Creating Account...
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" /> Create Account
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: AI CHAT LOGS */}
              {activeTab === 'ai-logs' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">AI Shopping Assistant Chats Audit</h3>
                    <p className="text-xs text-slate-500">Monitor e-commerce customer dialogues and answer quality trends.</p>
                  </div>

                  <div className="space-y-4">
                    {aiLogs.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 border p-12 text-center rounded-2xl text-slate-400 text-xs font-semibold">
                        No assistant conversations recorded yet. Customers can open the Floating AI Widget to chat.
                      </div>
                    ) : (
                      aiLogs.slice().reverse().map(log => (
                        <div key={log.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span className="font-semibold text-indigo-600 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 animate-pulse" /> E-Commerce AI Audit
                            </span>
                            <span>Customer: <strong>{log.userName || 'Guest'}</strong> • {new Date(log.createdAt).toLocaleString()}</span>
                          </div>

                          <div className="text-xs space-y-2">
                            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                              <span className="block font-bold text-[9px] text-slate-400 mb-1">Customer Query:</span>
                              <p className="text-slate-700 dark:text-slate-300 italic">"{log.query}"</p>
                            </div>
                            <div className="bg-blue-50/40 dark:bg-blue-950/10 p-3 rounded-lg border border-blue-50/70 dark:border-blue-900/10">
                              <span className="block font-bold text-[9px] text-blue-500 mb-1">Gemini AI Reply:</span>
                              <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{log.response}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* USER DELETION CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 relative animate-fade-in text-center">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
              <Trash2 className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete User Account?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you absolutely sure you want to permanently delete the user account for <strong className="text-slate-800 dark:text-slate-200 font-bold">"{userToDelete.name}"</strong>?
                This action is irreversible and will delete their entire history, orders, and support tickets!
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/10 transition cursor-pointer"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SUCCESS ALERT OVERLAY */}
      {adminSuccess && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 w-full max-w-sm p-6 rounded-2xl shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Success</h4>
              <p className="text-xs text-slate-500">{adminSuccess}</p>
            </div>
            <button
              type="button"
              onClick={() => setAdminSuccess(null)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ADMIN ERROR ALERT OVERLAY */}
      {adminError && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/60 w-full max-w-sm p-6 rounded-2xl shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
              <Info className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Action Denied</h4>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{adminError}</p>
            </div>
            <button
              type="button"
              onClick={() => setAdminError(null)}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
