import React, { useState } from 'react';
import { X, Package, DollarSign, List, Image as ImageIcon, Check } from 'lucide-react';
import { Product } from '../types';
import { CURRENCY } from '../constants';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: Omit<Product, 'id' | 'rating' | 'reviews' | 'isSponsored'>) => void;
  sellerName: string;
  availableCategories: string[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct, sellerName, availableCategories }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: availableCategories[0] || '',
    price: '',
    stock: '',
    image: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      currency: CURRENCY,
      sellerName,
      isVerifiedSeller: true, // Assuming seller is verified to add products
      dateAdded: new Date().toISOString(), // Add current date
    };

    onAddProduct(newProduct);
    onClose();
    // Reset form
    setFormData({
      name: '',
      category: availableCategories[0] || '',
      price: '',
      stock: '',
      image: '',
      description: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={22} className="text-accent-600" /> Add a New Product
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Product Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <input 
              type="text" required value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
              placeholder="e.g., Handwoven Basket"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              required value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none bg-white"
            >
              {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Price ({CURRENCY})</label>
              <input 
                type="number" required value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                placeholder="e.g., 15000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
              <input 
                type="number" required value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
                placeholder="e.g., 100"
              />
            </div>
          </div>
          
          {/* Image URL */}
          <div>
            <label className="text-sm font-medium text-gray-700">Product Image URL</label>
            <input 
              type="url" required value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none"
              placeholder="https://picsum.photos/..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea 
              rows={4} required value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none resize-none"
              placeholder="Describe your product..."
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-accent-500/20 transition-all flex items-center gap-2"
            >
              <Check size={18} /> Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;