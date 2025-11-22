
import React, { useState } from 'react';
import { Store, MapPin, Phone, FileText, CheckCircle } from 'lucide-react';
import { Shop } from '../types';

interface ShopRegistrationProps {
  onRegister: (shop: Shop) => void;
}

const ShopRegistration: React.FC<ShopRegistrationProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    contact: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mock shop
    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      ...formData,
      isVerified: false, // Verification happens after subscription
      ownerId: 'current-user-id', // Would be dynamic
      subscriptionStatus: 'none', // Initial state
      subscriptionEndDate: new Date().toISOString(),
    };

    onRegister(newShop);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex bg-brand-100 p-4 rounded-full mb-4">
            <Store className="w-10 h-10 text-brand-600" />
          </div>
          <h2 className="text-3xl font-bold text-trust-900">Open Your Shop</h2>
          <p className="mt-2 text-gray-600">Tell us about your business to start selling on Ecuruza.</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="e.g., Kigali Crafts"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                  placeholder="What do you sell?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    placeholder="Street, City"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    value={formData.contact}
                    onChange={e => setFormData({...formData, contact: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    placeholder="+250..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
               <CheckCircle className="text-blue-600 w-5 h-5 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-blue-800">
                 By registering, you agree to Ecuruza's Seller Terms. You will need to select a subscription plan (free trial available) in the next step.
               </p>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all"
            >
              Continue to Subscription
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopRegistration;
