import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, ShieldCheck, AlertTriangle, CheckCircle, Search, MoreHorizontal, 
  TrendingUp, DollarSign, Store, Package, Settings, Bell, LayoutGrid, Ban, Plus
} from 'lucide-react';
import { Shop } from '../types';
import { CURRENCY } from '../constants';

// Mock data for admin dashboard
const platformRevenueData = [
  { name: 'Jan', revenue: 1200000 },
  { name: 'Feb', revenue: 1900000 },
  { name: 'Mar', revenue: 1500000 },
  { name: 'Apr', revenue: 2800000 },
  { name: 'May', revenue: 3200000 },
  { name: 'Jun', revenue: 4500000 },
];

const userGrowthData = [
  { name: 'Jan', sellers: 10, buyers: 100 },
  { name: 'Feb', sellers: 15, buyers: 250 },
  { name: 'Mar', sellers: 25, buyers: 400 },
  { name: 'Apr', sellers: 40, buyers: 750 },
  { name: 'May', sellers: 65, buyers: 1200 },
  { name: 'Jun', sellers: 90, buyers: 2000 },
];

const subscriptionStatusData = [
  { name: 'Active', value: 65 },
  { name: 'Trial', value: 25 },
  { name: 'Expired', value: 10 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

// Mock Shops for Management
const MOCK_SHOPS: Shop[] = [
  {
    id: 's1',
    name: 'Kigali Crafts',
    description: 'Handmade local crafts',
    address: '123 KG Ave, Kigali',
    contact: '+250780000001',
    isVerified: true,
    ownerId: 'u1',
    subscriptionStatus: 'active',
    subscriptionEndDate: '2024-12-31',
  },
  {
    id: 's2',
    name: 'Tech World RW',
    description: 'Imported electronics',
    address: 'Downtown, Kigali',
    contact: '+250780000002',
    isVerified: false,
    ownerId: 'u2',
    subscriptionStatus: 'trial',
    subscriptionEndDate: '2024-06-15',
  },
  {
    id: 's3',
    name: 'Mama Africa Styles',
    description: 'Fashion and design',
    address: 'Nyamirambo',
    contact: '+250780000003',
    isVerified: true,
    ownerId: 'u3',
    subscriptionStatus: 'expired',
    subscriptionEndDate: '2024-01-01',
  },
  {
    id: 's4',
    name: 'Fresh Foods Market',
    description: 'Organic vegetables',
    address: 'Kimironko Market',
    contact: '+250780000004',
    isVerified: false,
    ownerId: 'u4',
    subscriptionStatus: 'active',
    subscriptionEndDate: '2024-11-20',
  },
];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'buyers' | 'settings'>('overview');
  const [shops, setShops] = useState<Shop[]>(MOCK_SHOPS);
  const [searchTerm, setSearchTerm] = useState('');

  const handleVerifyShop = (shopId: string) => {
    setShops(shops.map(shop => 
      shop.id === shopId ? { ...shop, isVerified: !shop.isVerified } : shop
    ));
  };

  const handleToggleStatus = (shopId: string) => {
      setShops(shops.map(shop => {
          if(shop.id === shopId) {
              const newStatus = shop.subscriptionStatus === 'active' ? 'expired' : 'active';
              return { ...shop, subscriptionStatus: newStatus };
          }
          return shop;
      }))
  }

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    shop.contact.includes(searchTerm)
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-accent-100 p-3 rounded-xl">
              <DollarSign className="text-accent-600 w-6 h-6" />
            </div>
            <span className="text-green-500 text-sm font-bold flex items-center gap-1">
              <TrendingUp size={14} /> +12.5%
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900">{CURRENCY} 15.2M</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Store className="text-blue-600 w-6 h-6" />
            </div>
            <span className="text-blue-500 text-sm font-bold flex items-center gap-1">
              <Plus size={14} /> 5 New
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Active Sellers</p>
          <h3 className="text-2xl font-bold text-gray-900">142</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-purple-100 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
            <Users className="text-purple-600 w-6 h-6" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Buyers</p>
          <h3 className="text-2xl font-bold text-gray-900">8,920</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <AlertTriangle className="text-orange-600 w-6 h-6" />
            </div>
            <span className="text-orange-500 text-sm font-bold">Action Req.</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Pending Verifications</p>
          <h3 className="text-2xl font-bold text-gray-900">12</h3>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Revenue Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={80} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${CURRENCY} ${value.toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} dot={{r: 4, fill: '#7c3aed'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Seller Subscription Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subscriptionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {subscriptionStatusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-xs text-gray-600">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSellers = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-900">Seller Management</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search sellers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Shop Name</th>
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Subscription</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredShops.map(shop => (
              <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{shop.name}</div>
                  <div className="text-xs text-gray-500">{shop.address}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{shop.contact}</td>
                <td className="px-6 py-4">
                  {shop.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  ) : (
                     <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                     shop.subscriptionStatus === 'active' ? 'bg-blue-100 text-blue-800' : 
                     shop.subscriptionStatus === 'trial' ? 'bg-indigo-100 text-indigo-800' : 
                     'bg-red-100 text-red-800'
                   }`}>
                     {shop.subscriptionStatus.charAt(0).toUpperCase() + shop.subscriptionStatus.slice(1)}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={() => handleVerifyShop(shop.id)}
                        className={`p-2 rounded-lg transition-colors ${shop.isVerified ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                        title={shop.isVerified ? "Revoke Verification" : "Verify Shop"}
                    >
                        {shop.isVerified ? <Ban size={18} /> : <CheckCircle size={18} />}
                    </button>
                    <button 
                        onClick={() => handleToggleStatus(shop.id)}
                        className="p-2 text-gray-400 hover:text-accent-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Manage Subscription"
                    >
                        <Settings size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white hidden md:flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-primary-800">
          <div className="flex items-center gap-2">
            <div className="bg-accent-500 p-1.5 rounded-lg">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <div>
                <h1 className="font-bold text-xl tracking-tight">Ecuruza</h1>
                <span className="text-[10px] text-primary-400 uppercase tracking-widest font-semibold">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'overview' ? 'bg-accent-500 text-white shadow-lg' : 'text-primary-300 hover:bg-primary-800 hover:text-white'
            }`}
          >
            <LayoutGrid size={20} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('sellers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'sellers' ? 'bg-accent-500 text-white shadow-lg' : 'text-primary-300 hover:bg-primary-800 hover:text-white'
            }`}
          >
            <Store size={20} /> Seller Management
          </button>
          <button 
            onClick={() => setActiveTab('buyers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'buyers' ? 'bg-accent-500 text-white shadow-lg' : 'text-primary-300 hover:bg-primary-800 hover:text-white'
            }`}
          >
            <Users size={20} /> Buyers & Users
          </button>
          <button 
             onClick={() => setActiveTab('settings')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'settings' ? 'bg-accent-500 text-white shadow-lg' : 'text-primary-300 hover:bg-primary-800 hover:text-white'
            }`}
          >
            <Settings size={20} /> Platform Settings
          </button>
        </nav>

        <div className="p-4 border-t border-primary-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">System Admin</p>
              <p className="text-xs text-primary-400 truncate">admin@ecuruza.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'sellers' && renderSellers()}
          {activeTab === 'buyers' && (
             <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Buyer Management</h3>
                <p className="text-gray-500">Buyer list and dispute resolution tools coming soon.</p>
             </div>
          )}
          {activeTab === 'settings' && (
             <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">System Settings</h3>
                <p className="text-gray-500">Configure global platform variables, taxes, and categories.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
