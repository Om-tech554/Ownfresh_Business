import React from 'react';
import { useCheckout } from './CheckoutContext';
import { useSelector } from 'react-redux';
import { calculateClientShipping } from '../../utils/shippingCalculator';
import { isUserActivePrime, calculateItemPricing, calculateCartPrimeTotals } from '../../utils/primeUtils';
import SLink from '../SLink';

const OrderSummary = () => {
  const { deliveryMethod, couponDetails, useWallet, useCommissionCoins, commissionCoinsBalance, canRedeemCoins, shippingDetails } = useCheckout();
  const cartItems = useSelector((state) => state.user.cartItems);
  
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const isSpecialCoupon = Boolean(
    couponDetails?.isApplied && (
      couponDetails.requiresDeliveryCharge || 
      couponDetails.applicableUsers === 'SELECTED_USERS'
    )
  );
  const shippingQuote = calculateClientShipping({
    cartItems,
    subtotal,
    destination: shippingDetails,
    deliveryMethodId: deliveryMethod?.id || 'standard',
    disableFreeDelivery: isSpecialCoupon
  });
  const shippingCost = shippingQuote.deliveryCost;
  const discount = couponDetails?.discount || 0;
  
  const coinDiscount = (useCommissionCoins && canRedeemCoins) ? Math.min(subtotal, commissionCoinsBalance) : 0;

  const netSubtotal = Math.max(0, subtotal - discount - coinDiscount);
  // Prices are inclusive of 5% GST (2.5% CGST + 2.5% SGST)
  const taxableAmount = Math.round((netSubtotal / 1.05) * 100) / 100;
  const cgst = Math.round(taxableAmount * 0.025 * 100) / 100;
  const sgst = Math.round(taxableAmount * 0.025 * 100) / 100;
  const totalTax = cgst + sgst;
  
  const total = Math.max(0, netSubtotal + shippingCost);

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
          <div>
            <div className="flex items-center gap-1.5">
              <span>Delivery</span>
              {shippingQuote.totalWeightKg > 0 && (
                <span className="text-[10px] text-gray-400 dark:text-[#818C9B] font-mono">({shippingQuote.totalWeightKg} kg)</span>
              )}
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
              {shippingQuote.deliveryMethodName}
            </span>
            {isSpecialCoupon && (
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block mt-0.5">
                Special promo: Delivery charges apply
              </span>
            )}
          </div>
          <div className="text-right">
            <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-gray-900 dark:text-[#F5F7FA]'}`}>
              {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
            </span>
            {shippingCost > 0 && (
              <SLink
                to="/membership"
                className="text-[10px] text-amber-600 dark:text-[#FFD600] font-bold hover:underline block mt-0.5 cursor-pointer"
              >
                👑 Use Prime 1% for free delivery
              </SLink>
            )}
          </div>
        </div>

        {isSpecialCoupon ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[11px] text-amber-900 dark:text-[#FFD600] font-bold">
            🚚 Standard delivery charges apply for exclusive promo code "{couponDetails?.code}".
          </div>
        ) : !shippingQuote.isFreeDelivery && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[11px] text-amber-900 dark:text-[#FFD600] font-bold space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span>🚚 Eligible for FREE DELIVERY over Rs. 1,500/- OR 2 Kg & above</span>
              <span className="font-mono">Add ₹{shippingQuote.amountNeededForFreeDelivery.toLocaleString('en-IN')} more</span>
            </div>
            <div className="w-full bg-amber-200/50 dark:bg-[#151B23] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 dark:bg-[#FFD600] h-full rounded-full transition-all duration-300"
                style={{ width: `${shippingQuote.progressPercentage}%` }}
              />
            </div>
            <div className="pt-1.5 border-t border-amber-400/20 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 dark:text-[#818C9B] font-medium">Under Rs. 1,500 / 2 Kg?</span>
              <SLink
                to="/membership"
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 dark:text-[#FFD600] hover:underline cursor-pointer"
              >
                👑 Use Prime 1% for free delivery →
              </SLink>
            </div>
          </div>
        )}

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

        <div className="flex justify-between text-gray-600 dark:text-[#B7C1CE] text-xs font-medium">
          <span>CGST (2.5% - Incl.)</span>
          <span className="text-gray-900 dark:text-[#F5F7FA] font-bold font-mono">₹{cgst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600 dark:text-[#B7C1CE] text-xs font-medium">
          <span>SGST (2.5% - Incl.)</span>
          <span className="text-gray-900 dark:text-[#F5F7FA] font-bold font-mono">₹{sgst.toFixed(2)}</span>
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
