
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MOCK_PRODUCTS } from '../constants';
import { Package, DollarSign, TrendingUp, Users, Plus, Edit, Trash2, Store, BadgeCheck, AlertTriangle, Clock } from 'lucide-react';
import { Shop } from '../types';

const data = [
  { name: 'Mon', sales: 400000 },
  { name: 'Tue', sales: 300000 },
  { name: 'Wed', sales: 200000 },
  { name: 'Thu', sales: 278000 },
  { name: 'Fri', sales: 189000 },
  { name: 'Sat', sales: 239000 },
  { name: 'Sun', sales: 349000 },
];

interface SellerDashboardProps {
  shop?: Shop;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ shop }) => {
  if (shop?.subscriptionStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border-t-4 border-red-500">
          <div className="inline-flex bg-red-100 p-4 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Expired</h2>
          <p className="text-gray-600 mb-6">
            Your seller subscription has expired. Your shop and products are currently hidden from buyers. Please renew to continue selling.
          </p>
          <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all">
            Renew Subscription
          </button>
        </div>
      </div>
    );
  }

  const trialDaysLeft = shop?.subscriptionEndDate ? 
    Math.ceil((new Date(shop.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Trial Banner */}
        {shop?.subscriptionStatus === 'trial' && (
          <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg mb-8 flex items-center justify-between flex-wrap gap-4">
             <div className="flex items-center gap-3">
               <div className="bg-white/20 p-2 rounded-lg">
                 <Clock className="w-5 h-5 text-white" />
               </div>
               <div>
                 <p className="font-bold text-sm sm:text-base">Free Trial Active</p>
                 <p className="text-xs sm:text-sm text-indigo-100">You have {trialDaysLeft} days remaining in your free trial. Full access enabled.</p>
               </div>
             </div>
             <button className="text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
               Upgrade Plan
             </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-trust-900">{shop?.name || 'Seller Dashboard'}</h1>
              {shop?.isVerified && (
                <div className="flex items-center gap-1 text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                   <BadgeCheck className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase">Verified</span>
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm">Manage your store, inventory and track growth.</p>
          </div>
          <button className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all">
            <Plus size={18} /> Add New Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">RWF 4,520,000</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Orders Pending</p>
              <p className="text-xl font-bold text-gray-900">12</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Growth (MoM)</p>
              <p className="text-xl font-bold text-gray-900">+15%</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Store Visits</p>
              <p className="text-xl font-bold text-gray-900">1,240</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Revenue (RWF)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} width={70} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value) => [`RWF ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="sales" fill="#ea580c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Store Traffic</h3>
             <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} width={70} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                     formatter={(value) => [value.toLocaleString(), 'Visits']}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#0f172a" strokeWidth={3} dot={{r: 4, fill:'#0f172a'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Recent Inventory</h3>
            <a href="#" className="text-brand-600 text-sm font-medium hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_PRODUCTS.slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 rounded-md object-cover" />
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{product.category}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.currency} {product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <button className="text-gray-400 hover:text-brand-600"><Edit size={16} /></button>
                         <button className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
