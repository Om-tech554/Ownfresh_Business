import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckoutProvider, useCheckout } from '../components/checkout/CheckoutContext';
import ProgressBar from '../components/checkout/ProgressBar';
import ShippingForm from '../components/checkout/ShippingForm';
import DeliveryMethod from '../components/checkout/DeliveryMethod';
import PaymentSection from '../components/checkout/PaymentSection';
import OrderReview from '../components/checkout/OrderReview';
import OrderSummary from '../components/checkout/OrderSummary';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { serverUrl } from '../App';

const CheckoutFlow = () => {
  const { currentStep, setUseWallet } = useCheckout();
  const user = useSelector((state) => state.user.userData);
  const cartItems = useSelector((state) => state.user.cartItems);
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/signin?redirect=/checkout');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get(`${serverUrl}/api/wallet/my-wallet`, { withCredentials: true });
        if (data.success && data.balance > 0) {
          setWalletBalance(data.balance);
          // Auto apply wallet logic or give option via context. Handled mostly in summary or review step if needed
        }
      } catch (err) {
        console.error("Failed to fetch wallet", err);
      }
    };
    fetchWallet();
  }, [user]);

  if (!user || cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-3xl font-black text-gray-900 mb-4">Your Cart is Empty</h2>
        <button 
          onClick={() => navigate('/shop')}
          className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-center text-gray-900 uppercase tracking-tight mb-2">Secure Checkout</h1>
        <div className="w-16 h-1.5 bg-yellow-500 mx-auto rounded-full mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Checkout Flow */}
          <div className="lg:col-span-8">
            <ProgressBar />
            
            <div className="mt-8 relative overflow-hidden pb-10">
              <AnimatePresence mode="wait">
                {currentStep === 1 && <ShippingForm key="step1" />}
                {currentStep === 2 && <DeliveryMethod key="step2" />}
                {currentStep === 3 && <PaymentSection key="step3" />}
                {currentStep === 4 && <OrderReview key="step4" />}
              </AnimatePresence>
            </div>
          </div>

          {/* Sticky Order Summary */}
          <div className="lg:col-span-4 relative">
             <OrderSummary />
             {walletBalance > 0 && currentStep === 4 && (
                <div className="mt-4 bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="use-wallet"
                      className="w-5 h-5 accent-purple-600 cursor-pointer"
                      onChange={(e) => setUseWallet(e.target.checked)}
                    />
                    <label htmlFor="use-wallet" className="text-sm font-bold text-purple-900 cursor-pointer select-none">
                      Use Wallet Balance (Available: ₹{walletBalance})
                    </label>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckOut = () => {
  return (
    <CheckoutProvider>
      <CheckoutFlow />
    </CheckoutProvider>
  );
};

export default CheckOut;
