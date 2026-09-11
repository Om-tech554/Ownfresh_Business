import React from 'react';
import { useCheckout } from './CheckoutContext';
import { useSelector } from 'react-redux';

const OrderSummary = () => {
  const { deliveryMethod, couponDetails, useWallet, useCommissionCoins, commissionCoinsBalance, canRedeemCoins } = useCheckout();
  const cartItems = useSelector((state) => state.user.cartItems);
  
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = deliveryMethod?.cost || 0;
  const discount = couponDetails?.discount || 0;
  
  const coinDiscount = (useCommissionCoins && canRedeemCoins) ? Math.min(subtotal, commissionCoinsBalance) : 0;

  const taxableAmount = Math.max(0, subtotal - discount - coinDiscount);
  const cgst = taxableAmount * 0.025;
  const sgst = taxableAmount * 0.025;
  const totalTax = cgst + sgst;
  
  const total = Math.max(0, taxableAmount + totalTax + shippingCost);

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-[#171D26] border border-gray-200 dark:border-[#27313D] p-6 rounded-2xl sticky top-24 transition-colors duration-200">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-[#F7F9FC]">Order Summary</h2>
        <p className="text-gray-500 dark:text-[#818C9B]">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-[#171D26] border border-gray-200 dark:border-[#27313D] p-6 rounded-2xl sticky top-24 shadow-sm transition-colors duration-200">
      <h2 className="text-xl font-black text-gray-900 dark:text-[#F7F9FC] mb-6 uppercase tracking-wider">Order Summary</h2>
      
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {cartItems.map((item) => (
          <div key={item._id} className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-white dark:bg-[#151B23] rounded-xl border border-gray-100 dark:border-[#27313D] flex-shrink-0 overflow-hidden relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover dark:mix-blend-normal" />
              <div className="absolute -top-2 -right-2 bg-[#FFD600] text-[#111318] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-xs">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-[#F5F7FA] text-sm line-clamp-2">{item.name}</h3>
              <p className="text-gray-500 dark:text-[#818C9B] text-xs mt-1">Qty: {item.quantity}</p>
            </div>
            <div className="font-bold text-gray-900 dark:text-[#F5F7FA]">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-[#27313D] mt-6 pt-4 space-y-3">
        <div className="flex justify-between text-gray-600 dark:text-[#B7C1CE] text-sm font-medium">
          <span>Subtotal</span>
          <span className="text-gray-900 dark:text-[#F5F7FA] font-bold">₹{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600 dark:text-[#B7C1CE] text-sm font-medium">
          <span>Shipping</span>
          <span className="text-gray-900 dark:text-[#F5F7FA] font-bold">
            {shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-emerald-400 text-sm font-medium">
            <span>Coupon Discount</span>
            <span className="font-bold">-₹{discount.toFixed(2)}</span>
          </div>
        )}

        {coinDiscount > 0 && (
          <div className="flex justify-between text-amber-700 dark:text-[#FFD600] text-sm font-bold bg-amber-50 dark:bg-[#1D2530] px-2 py-1 rounded-lg border border-amber-200 dark:border-[#2A3440]">
            <span>🪙 Commission Coins</span>
            <span>-₹{coinDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600 dark:text-[#B7C1CE] text-sm font-medium">
          <span>CGST (2.5%)</span>
          <span className="text-gray-900 dark:text-[#F5F7FA] font-bold">₹{cgst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600 dark:text-[#B7C1CE] text-sm font-medium">
          <span>SGST (2.5%)</span>
          <span className="text-gray-900 dark:text-[#F5F7FA] font-bold">₹{sgst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-900 dark:text-[#F7F9FC] text-lg font-black border-t border-gray-200 dark:border-[#27313D] pt-4 mt-2">
          <span>Total</span>
          <span className="text-yellow-600 dark:text-[#FFD600]">₹{total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 dark:text-[#818C9B] justify-center">
        <span className="bg-gray-200 dark:bg-[#1D2530] p-1 rounded-full text-gray-600 dark:text-[#B7C1CE]"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></span>
        Secure Encrypted Checkout
      </div>
    </div>
  );
};

export default OrderSummary;
