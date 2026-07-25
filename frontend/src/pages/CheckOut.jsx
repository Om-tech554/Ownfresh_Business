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
    setUseWallet,
    useCommissionCoins,
    setUseCommissionCoins,
    setCommissionCoinsBalance,
    setCanRedeemCoins,
    commissionCoinsBalance,
    canRedeemCoins
  } = useCheckout();
  const user = useSelector((state) => state.user.userData);
  const cartItems = useSelector((state) => state.user.cartItems);
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(0);
  const [membershipInfo, setMembershipInfo] = useState(null);

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
          <div className="lg:col-span-4 relative space-y-4">
             <OrderSummary />

             {/* Commission Credit Coins Widget */}
             {membershipInfo && (
               <div className="bg-gradient-to-br from-amber-500/10 via-yellow-50 to-amber-100 p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="text-lg">🪙</span>
                     <div>
                       <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
                         Commission Credit Coins
                       </h4>
                       <p className="text-[10px] text-amber-800 font-medium">
                         Balance: <strong>{membershipInfo.commissionCoins} Coins</strong> (₹{membershipInfo.commissionCoins})
                       </p>
                     </div>
                   </div>
                   <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                     45-Day Reset
                   </span>
                 </div>

                 {membershipInfo.canRedeem ? (
                   <div className="bg-white/80 p-3 rounded-xl border border-amber-300/60 flex items-center gap-3">
                     <input
                       type="checkbox"
                       id="use-commission-coins"
                       checked={useCommissionCoins}
                       className="w-5 h-5 accent-amber-600 cursor-pointer rounded-md"
                       onChange={(e) => setUseCommissionCoins(e.target.checked)}
                     />
                     <label htmlFor="use-commission-coins" className="text-xs font-bold text-slate-900 cursor-pointer select-none">
                       Apply {membershipInfo.commissionCoins} Commission Coins (Save ₹{membershipInfo.commissionCoins})
                     </label>
                   </div>
                 ) : (
                   <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 space-y-1.5">
                     <div className="flex justify-between text-[11px] font-bold text-amber-900">
                       <span>Redemption Threshold</span>
                       <span>{membershipInfo.commissionCoins} / 150 Coins</span>
                     </div>
                     <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
                       <div
                         className="bg-amber-500 h-full rounded-full transition-all"
                         style={{ width: `${membershipInfo.progressPercentage}%` }}
                       />
                     </div>
                     <p className="text-[10px] text-amber-800 leading-tight">
                       🔒 Earn {membershipInfo.coinsNeededToRedeem} more coins to reach the 150 coins threshold and unlock redemption at checkout!
                     </p>
                   </div>
                 )}
               </div>
             )}

             {walletBalance > 0 && currentStep === 4 && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="use-wallet"
                      className="w-5 h-5 accent-purple-600 cursor-pointer"
                      onChange={(e) => setUseWallet(e.target.checked)}
                    />
                    <label htmlFor="use-wallet" className="text-sm font-bold text-purple-900 cursor-pointer select-none">
                      Should I use your wallet points for this order? (Available: ₹{walletBalance})
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
