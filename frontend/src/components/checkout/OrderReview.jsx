import React, { useState } from 'react';
import { useCheckout } from './CheckoutContext';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { clearCart, updateQuantity, removeFromCart } from '../../redux/userslice';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaCheck, FaLock, FaShieldAlt } from 'react-icons/fa';
import { Truck, CreditCard, Tag, Sparkles, MapPin, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { appCheck } from '../../../firebase';
import { getToken } from 'firebase/app-check';

const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";

const OrderReview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const cartItems = useSelector((state) => state.user.cartItems);
  const {
    shippingDetails,
    setShippingDetails,
    deliveryMethod,
    paymentMethod,
    couponDetails,
    setCouponDetails,
    useWallet,
    prevStep,
    referralCode,
    setReferralCode,
    referralApplied,
    setReferralApplied,
    useCommissionCoins,
    commissionCoinsBalance,
    canRedeemCoins
  } = useCheckout();

  const [couponInput, setCouponInput] = useState(couponDetails?.code || '');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [referralInput, setReferralInput] = useState(referralCode || '');
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressForm, setEditAddressForm] = useState({
    fullName: shippingDetails?.fullName || '',
    phone: shippingDetails?.phone || '',
    flatNo: shippingDetails?.flatNo || '',
    address: shippingDetails?.address || '',
    landmark: shippingDetails?.landmark || '',
    city: shippingDetails?.city || '',
    state: shippingDetails?.state || '',
    zipCode: shippingDetails?.zipCode || '',
    country: shippingDetails?.country || 'India',
    latitude: shippingDetails?.latitude || 19.076,
    longitude: shippingDetails?.longitude || 72.8777
  });

  const handleStartEditingAddress = () => {
    setEditAddressForm({
      fullName: shippingDetails?.fullName || '',
      phone: shippingDetails?.phone || '',
      flatNo: shippingDetails?.flatNo || '',
      address: shippingDetails?.address || '',
      landmark: shippingDetails?.landmark || '',
      city: shippingDetails?.city || '',
      state: shippingDetails?.state || '',
      zipCode: shippingDetails?.zipCode || '',
      country: shippingDetails?.country || 'India',
      latitude: shippingDetails?.latitude || 19.076,
      longitude: shippingDetails?.longitude || 72.8777
    });
    setIsEditingAddress(true);
  };

  const handleSaveAddress = () => {
    if (!editAddressForm.fullName.trim() || !editAddressForm.phone.trim() || !editAddressForm.address.trim() || !editAddressForm.city.trim() || !editAddressForm.state.trim() || !editAddressForm.zipCode.trim()) {
      return toast.error("Please fill in all required fields (*)");
    }
    setShippingDetails(editAddressForm);
    setIsEditingAddress(false);
    toast.success("Shipping details updated successfully!");
  };

  // Cart calculations
  const subtotal = (cartItems || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = deliveryMethod?.cost || 0;
  const discount = couponDetails?.discount || 0;
  const coinDiscount = (useCommissionCoins && canRedeemCoins) ? Math.min(subtotal, commissionCoinsBalance) : 0;
  const taxableAmount = Math.max(0, subtotal - discount - coinDiscount);
  const cgst = taxableAmount * 0.025;
  const sgst = taxableAmount * 0.025;
  const totalTax = cgst + sgst;
  const finalAmount = taxableAmount + totalTax + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return toast.error("Enter coupon code");
    setValidatingCoupon(true);
    try {
      const { data } = await axios.post(`${serverUrl}/api/coupon/validate`, {
        code: couponInput.trim(),
        amount: subtotal
      }, { withCredentials: true });

      if (data.success) {
        setCouponDetails({ code: couponInput, discount: data.discountAmount, isApplied: true });
        toast.success(`Coupon applied! ₹${data.discountAmount} saved.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon");
      setCouponDetails({ code: '', discount: 0, isApplied: false });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponInput("");
    setCouponDetails({ code: '', discount: 0, isApplied: false });
    toast.success("Coupon removed");
  };

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return toast.error("Enter referral code");
    setValidatingReferral(true);
    try {
      const { data } = await axios.post(`${serverUrl}/api/referral/validate-code`, {
        code: referralInput.trim()
      }, { withCredentials: true });

      if (data.success) {
        setReferralCode(referralInput.trim().toUpperCase());
        setReferralApplied(true);
        toast.success("Referral code applied!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid referral code");
      setReferralCode('');
      setReferralApplied(false);
    } finally {
      setValidatingReferral(false);
    }
  };

  const removeReferral = () => {
    setReferralInput("");
    setReferralCode("");
    setReferralApplied(false);
    toast.success("Referral code removed");
  };

  // ========================================================
  // --- PHONEPE PAYMENT INTEGRATION ---
  // ========================================================
  const initiatePhonePePayment = async () => {
    setIsProcessing(true);
    try {
      const order = await processOrderToDB();
      if (!order || !order._id) {
        setIsProcessing(false);
        return;
      }

      let appCheckToken = "";
      if (appCheck) {
        try {
          const tokenResponse = await getToken(appCheck, false);
          appCheckToken = tokenResponse.token;
        } catch (err) {
          console.error("AppCheck Token Error:", err);
        }
      }
      const headers = appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {};

      const { data } = await axios.post(`${serverUrl}/api/payment/phonepe-initiate`, {
        orderId: order._id
      }, { 
        headers,
        withCredentials: true,
        timeout: 45000
      });

      if (data.success && data.redirectUrl) {
        toast.success("Redirecting to secure PhonePe payment gateway...");
        dispatch(clearCart());
        setTimeout(() => {
          window.location.replace(data.redirectUrl);
        }, 100);
      } else {
        toast.error(data.msg || "Failed to initiate payment. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("PhonePe Initiation Error:", error);
      toast.error(error.response?.data?.msg || "Payment initiation failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return toast.error("Please login to place an order");
    if (!cartItems || cartItems.length === 0) return toast.error("Your cart is empty");

    if (paymentMethod === "online") {
      await initiatePhonePePayment();
    } else {
      setIsProcessing(true);
      await processOrderToDB();
    }
  };

  const processOrderToDB = async (retryCount = 0) => {
    try {
      let appCheckToken = "";
      if (appCheck) {
        try {
          const tokenResponse = await getToken(appCheck, false);
          appCheckToken = tokenResponse.token;
        } catch (err) {
          console.error("AppCheck Token Error:", err);
        }
      }
      const headers = appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {};

      const payload = {
        userId: user._id,
        items: cartItems,
        paymentMethod,
        deliveryAddress: {
          roomNumber: `${shippingDetails?.flatNo || ""} (Landmark: ${shippingDetails?.landmark || ""})`,
          areaName: shippingDetails?.city,
          text: `${shippingDetails?.flatNo ? shippingDetails.flatNo + ', ' : ''}${shippingDetails?.address || ''}, ${shippingDetails?.landmark ? 'Near ' + shippingDetails.landmark + ', ' : ''}${shippingDetails?.city || ''}, ${shippingDetails?.state || ''}, ${shippingDetails?.country || 'India'} - ${shippingDetails?.zipCode || ''}`,
          phone: shippingDetails?.phone || user.mobile || "",
          latitude: shippingDetails?.latitude,
          longitude: shippingDetails?.longitude,
        },
        totalAmount: finalAmount,
        discountAmount: discount,
        couponCode: couponDetails?.isApplied ? couponDetails.code : "",
        referralCode: referralApplied ? referralCode : "",
        cgst,
        sgst,
        taxAmount: totalTax,
        useWallet: useWallet,
        useCommissionCoins: useCommissionCoins,
        deliveryMethodId: deliveryMethod?.id || "standard"
      };

      const { data } = await axios.post(`${serverUrl}/api/order/create`, payload, { 
        headers,
        withCredentials: true,
        timeout: 45000
      });

      if (data.success) {
        if (paymentMethod === "cod") {
          toast.success("Order placed successfully!");
          dispatch(clearCart());
          navigate("/order-success", { state: { orderId: data.order?._id || Date.now() } });
        }
        return data.order;
      }
    } catch (error) {
      console.error(`Order placement error (attempt ${retryCount + 1}):`, error);
      
      const isNetworkErr = error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('Network Error') || !error.response;
      
      if (isNetworkErr && retryCount < 1) {
        toast.loading("Connecting to server, retrying order placement...", { id: "order-retry" });
        await new Promise(r => setTimeout(r, 1500));
        toast.dismiss("order-retry");
        return await processOrderToDB(retryCount + 1);
      }

      toast.error(error.response?.data?.msg || error.message || "Order placement failed");
      return null;
    } finally {
      if (paymentMethod !== "online") {
        setIsProcessing(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto pb-24 lg:pb-0"
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#24672E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block mb-2">
            Step 4 of 4 • Final Review
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Review Your Order</h2>
          <p className="text-xs text-slate-500 mt-1">Please confirm your items, shipping address, and payment method before completing your purchase.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ── LEFT COLUMN: Details & Items ── */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 1. SHIPPING DETAILS CARD */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-100">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={16} className="text-[#1E971D]" />
                Delivery Address
              </h3>
              {!isEditingAddress && (
                <button 
                  onClick={handleStartEditingAddress} 
                  className="text-xs text-[#1E971D] font-black hover:underline uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                >
                  Edit Address
                </button>
              )}
            </div>

            {isEditingAddress ? (
              <div className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editAddressForm.fullName}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#1E971D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={editAddressForm.phone}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#1E971D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Flat / House No.</label>
                    <input
                      type="text"
                      value={editAddressForm.flatNo}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, flatNo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#1E971D]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={editAddressForm.landmark}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, landmark: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#1E971D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Street Address *</label>
                  <textarea
                    rows={2}
                    value={editAddressForm.address}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#1E971D] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={editAddressForm.zipCode}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, zipCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#1E971D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">City *</label>
                    <input
                      type="text"
                      value={editAddressForm.city}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#1E971D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">State *</label>
                    <input
                      type="text"
                      value={editAddressForm.state}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, state: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#1E971D]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="px-5 py-2 bg-[#1E971D] text-white rounded-xl font-black text-xs hover:bg-[#167a17] transition-colors cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/80 border border-slate-100 rounded-xl text-xs leading-relaxed text-slate-700 font-medium">
                <span className="font-extrabold text-sm text-slate-900 block mb-1">{shippingDetails?.fullName}</span>
                <p className="break-words">
                  {shippingDetails?.flatNo && <span>{shippingDetails.flatNo}, </span>}
                  {shippingDetails?.address}
                </p>
                {shippingDetails?.landmark && (
                  <p className="text-slate-500 text-[11px] mt-0.5 break-words">Landmark: {shippingDetails.landmark}</p>
                )}
                <p className="font-bold text-slate-800 mt-1">
                  {shippingDetails?.city}, {shippingDetails?.state} - {shippingDetails?.zipCode}
                </p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50 text-[11px] font-mono text-slate-800">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{shippingDetails?.phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. DELIVERY SPEED & PAYMENT METHOD SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Truck size={14} className="text-[#1E971D]" /> Delivery Speed
              </h4>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-xs text-slate-900">{deliveryMethod?.name || "Standard Delivery"}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Est: {deliveryMethod?.estimatedTime || "3-5 Business Days"}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <CreditCard size={14} className="text-[#1E971D]" /> Payment Mode
              </h4>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-xs text-slate-900 uppercase">
                  {paymentMethod === 'online' ? 'UPI / Cards / PhonePe' : 'Cash on Delivery (COD)'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {paymentMethod === 'online' ? 'Secured via PhonePe Gateway' : 'Pay cash at delivery time'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. ORDER ITEMS LIST (FULLY RESPONSIVE ON ALL SCREENS) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-100">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1E971D]"></span>
                Items in Order ({cartItems?.length || 0})
              </h3>
            </div>

            <div className="max-h-[340px] overflow-y-auto pr-1 space-y-3 divide-y divide-slate-100">
              {cartItems?.map((item) => (
                <div key={item._id} className="pt-3 first:pt-0 flex flex-col gap-2.5">
                  {/* Top row: Image & Title */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 p-1 shrink-0 flex items-center justify-center">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-contain mix-blend-multiply" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-[#1E971D] border border-emerald-100">
                        {item.variantName || 'Standard'}
                      </span>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate mt-1 uppercase tracking-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 font-mono">
                        ₹{item.price.toLocaleString('en-IN')} / unit
                      </p>
                    </div>
                  </div>

                  {/* Bottom row: Stepper, Delete, Line Total */}
                  <div className="flex items-center justify-between pl-1 sm:pl-16">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-2xs">
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item._id, quantity: Math.max(1, item.quantity - 1) }))}
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 transition text-slate-600 cursor-pointer active:scale-95"
                          title="Decrease quantity"
                        >
                          <FaMinus size={8} />
                        </button>
                        <span className="w-7 text-center font-black text-xs text-slate-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 transition text-slate-600 cursor-pointer active:scale-95"
                          title="Increase quantity"
                        >
                          <FaPlus size={8} />
                        </button>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Remove item"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>

                    <div className="text-right font-black text-sm text-slate-900 font-mono">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Billing & Coupons ── */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
          
          {/* COUPON & REFERRAL WIDGET */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
            {/* Promo Code */}
            <div>
              <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag size={13} className="text-[#1E971D]" /> Promo / Coupon Code
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E971D] uppercase font-bold text-xs tracking-wider"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={couponDetails?.isApplied}
                />
                {couponDetails?.isApplied ? (
                  <button
                    onClick={removeCoupon}
                    className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-[#1E971D] transition-colors uppercase tracking-wider shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {validatingCoupon ? "..." : "Apply"}
                  </button>
                )}
              </div>
            </div>

            {/* Referral Code */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" /> Referral Code
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="FRIEND'S CODE"
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E971D] uppercase font-bold text-xs tracking-wider"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  disabled={referralApplied}
                />
                {referralApplied ? (
                  <button
                    onClick={removeReferral}
                    className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyReferral}
                    disabled={validatingReferral}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-[#1E971D] transition-colors uppercase tracking-wider shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {validatingReferral ? "..." : "Apply"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PRICING BREAKDOWN CARD */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <h3 className="font-black text-xs uppercase tracking-widest text-[#EFDB27] mb-4 pb-2 border-b border-white/10 flex items-center justify-between">
              <span>Order Pricing Summary</span>
              <span className="text-[10px] text-slate-400 font-bold">INR</span>
            </h3>

            <div className="space-y-3 font-semibold text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span>Items Subtotal</span>
                <span className="text-white font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Coupon Discount ({couponDetails?.code})</span>
                  <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {coinDiscount > 0 && (
                <div className="flex justify-between items-center text-amber-400">
                  <span>Commission Coins Applied</span>
                  <span className="font-mono">-₹{coinDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Delivery Charges</span>
                <span className="text-white font-mono">
                  {shippingCost === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${shippingCost}`}
                </span>
              </div>

              {/* Tax Breakdowns */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-slate-400 font-medium">
                <div className="flex justify-between items-center">
                  <span>CGST (2.5%)</span>
                  <span className="font-mono">₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SGST (2.5%)</span>
                  <span className="font-mono">₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                <span className="font-black text-sm uppercase tracking-wider text-white">Grand Total</span>
                <span className="text-2xl sm:text-3xl font-black text-[#EFDB27] font-mono">
                  ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Complete Purchase Button (Desktop / Tablet) */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full mt-6 py-4 bg-[#EFDB27] hover:bg-white text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-0 active:scale-98"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  <span>Processing Securely...</span>
                </>
              ) : (
                <>
                  <FaLock size={12} />
                  <span>Complete Purchase • ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </>
              )}
            </button>

            <button
              onClick={prevStep}
              className="w-full mt-3 py-2 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors text-center cursor-pointer bg-transparent border-0 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={13} /> Back to Payment Mode
            </button>
          </div>

        </div>

      </div>

      {/* ── STICKY MOBILE BOTTOM BAR (FOR MAXIMUM TOUCH ACCESSIBILITY) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-3.5 sm:p-4 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3">
        <div>
          <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Payable Total</span>
          <span className="block text-lg sm:text-xl font-black text-[#EFDB27] font-mono">
            ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="flex-1 py-3.5 bg-[#EFDB27] active:bg-yellow-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-center disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin shrink-0"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Place Order</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default OrderReview;
