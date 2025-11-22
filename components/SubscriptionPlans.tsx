import React from 'react';
import { Check, Star, ShieldCheck, Calendar, Zap } from 'lucide-react';
import { CURRENCY } from '../constants';

interface SubscriptionPlansProps {
  onSubscribe: (planType: 'trial' | 'monthly') => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSubscribe }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex bg-brand-100 p-3 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-3xl font-bold text-trust-900">Choose Your Seller Plan</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            To maintain a trusted marketplace, all sellers must be verified and subscribed. 
            Start with our risk-free trial to grow your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Free Trial Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-brand-500 relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wide">
              Recommended
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-brand-100 text-brand-700 p-2 rounded-lg">
                  <Star className="w-6 h-6" />
                </span>
                <h3 className="text-xl font-bold text-gray-900">3-Month Free Trial</h3>
              </div>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">Free</span>
                <span className="ml-2 text-gray-500 font-medium">/ first 3 months</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Then {CURRENCY} 15,000/month</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">Full access to Seller Dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">Unlimited product listings</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">Verified Seller Badge</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">24/7 Seller Support</span>
                </li>
              </ul>

              <button
                onClick={() => onSubscribe('trial')}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap size={20} /> Activate 3-Month Free Trial
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">No credit card required for trial.</p>
            </div>
          </div>

          {/* Standard Plan Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gray-100 text-gray-700 p-2 rounded-lg">
                  <Calendar className="w-6 h-6" />
                </span>
                <h3 className="text-xl font-bold text-gray-900">Monthly Plan</h3>
              </div>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">{CURRENCY} 15,000</span>
                <span className="ml-2 text-gray-500 font-medium">/ month</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Billed monthly, cancel anytime</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Full access to Seller Dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Unlimited product listings</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Verified Seller Badge</span>
                </li>
              </ul>

              <button
                onClick={() => onSubscribe('monthly')}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-500 font-bold py-4 rounded-xl transition-all"
              >
                Skip Trial & Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;