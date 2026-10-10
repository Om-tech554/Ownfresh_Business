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
  const {
    currentStep,
    useWallet,
    setUseWallet,
    useCommissionCoins,
    setUseCommissionCoins,
    setCommissionCoinsBalance,
    setCanRedeemCoins,
    commissionCoinsBalance,
    canRedeemCoins,
    deliveryMethod,
    couponDetails,
    membershipInfo,
    setMembershipInfo
  } = useCheckout();
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
    const fetchWalletAndCommission = async () => {
      if (!user) return;
      try {
        const { data: wData } = await axios.get(`${serverUrl}/api/wallet/my-wallet`, { withCredentials: true });
        if (wData.success && wData.balance > 0) {
          setWalletBalance(wData.balance);
        }

        const { data: mData } = await axios.get(`${serverUrl}/api/membership/my-status`, { withCredentials: true });
        if (mData.success) {
          setMembershipInfo(mData);
          setCommissionCoinsBalance(mData.commissionCoins);
          setCanRedeemCoins(mData.canRedeem);
        }
      } catch (err) {
        console.error("Failed to fetch wallet or membership info", err);
      }
    };
    fetchWalletAndCommission();
  }, [user]);

  if (!user || cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0B0F14] transition-colors duration-200">
        <h2 className="text-3xl font-black text-gray-900 dark:text-[#F7F9FC] mb-4">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-4 bg-[#FFD600] text-[#111318] font-black rounded-xl shadow-lg hover:bg-[#FFE45C] transition-all cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F14] pt-8 pb-28 sm:py-12 px-3.5 sm:px-6 lg:px-8 transition-colors duration-200 pb-[max(6rem,env(safe-area-inset-bottom))]">
      <div className="max-w-7xl mx-auto">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <a href="/">
            <img
              src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
              alt="OwnFresh Logo"
              className="h-10 md:h-12 w-auto object-contain cursor-pointer transition-transform duration-300 hover:scale-105 drop-shadow-sm"
            />
          </a>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-[#F7F9FC] uppercase tracking-tight mb-2">Secure Checkout</h1>
        <div className="w-16 h-1.5 bg-[#FFD600] mx-auto rounded-full mb-10" />

        <div className={`grid grid-cols-1 ${currentStep === 4 ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-8 lg:gap-12 items-start`}>
          {/* Main Checkout Flow */}
          <div className={currentStep === 4 ? 'w-full' : 'lg:col-span-8'}>
            <ProgressBar />

            <div className="mt-8 relative overflow-hidden pb-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && <ShippingForm key="step1" />}
                {currentStep === 2 && <DeliveryMethod key="step2" />}
                {currentStep === 3 && <PaymentSection key="step3" />}
                {currentStep === 4 && <OrderReview key="step4" />}
              </AnimatePresence>
            </div>
          </div>

          {/* Sticky Order Summary Sidebar (Steps 1, 2, 3) */}
          {currentStep !== 4 && (
            <div className="lg:col-span-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto space-y-4 pr-1 pb-6 custom-scrollbar">
              <OrderSummary />

            {/* Wallet Widget */}
            {walletBalance > 0 && (
              <div className="bg-purple-50 dark:bg-[#151B23] p-4 rounded-xl border border-purple-200 dark:border-[#2A3440]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="use-wallet"
                    checked={useWallet}
                    className="w-5 h-5 accent-purple-600 cursor-pointer"
                    onChange={(e) => setUseWallet(e.target.checked)}
                  />
                  <label htmlFor="use-wallet" className="text-xs font-bold text-purple-900 dark:text-[#F5F7FA] cursor-pointer select-none">
                    Use wallet points for this order (Available: ₹{walletBalance})
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
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
