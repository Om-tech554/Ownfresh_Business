import React, { useState } from 'react';
import { useCheckout } from './CheckoutContext';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { clearCart, updateQuantity, removeFromCart } from '../../redux/userslice';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaCopy, FaUpload, FaTimes } from 'react-icons/fa';
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

  const [couponInput, setCouponInput] = useState(couponDetails.code || '');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [referralInput, setReferralInput] = useState(referralCode || '');
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressForm, setEditAddressForm] = useState({
    fullName: shippingDetails.fullName || '',
    phone: shippingDetails.phone || '',
    flatNo: shippingDetails.flatNo || '',
    address: shippingDetails.address || '',
    landmark: shippingDetails.landmark || '',
    city: shippingDetails.city || '',
    state: shippingDetails.state || '',
    zipCode: shippingDetails.zipCode || '',
    country: shippingDetails.country || 'India',
    latitude: shippingDetails.latitude || 19.076,
    longitude: shippingDetails.longitude || 72.8777
  });

  const handleStartEditingAddress = () => {
    setEditAddressForm({
      fullName: shippingDetails.fullName || '',
      phone: shippingDetails.phone || '',
      flatNo: shippingDetails.flatNo || '',
      address: shippingDetails.address || '',
      landmark: shippingDetails.landmark || '',
      city: shippingDetails.city || '',
      state: shippingDetails.state || '',
      zipCode: shippingDetails.zipCode || '',
      country: shippingDetails.country || 'India',
      latitude: shippingDetails.latitude || 19.076,
      longitude: shippingDetails.longitude || 72.8777
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
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
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
      // 1) First create the order in the database (marked as paymentStatus: pending)
      const order = await processOrderToDB();
      if (!order || !order._id) {
        setIsProcessing(false);
        return;
      }

      // 2) Get App Check Token if available
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

      // 3) Call the backend to initiate PhonePe transaction
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
        // Redirect to PhonePe payment page (compatible with mobile Safari & Chrome)
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
    if (cartItems.length === 0) return toast.error("Your cart is empty");

    if (paymentMethod === "online") {
      await initiatePhonePePayment();
    } else {
      setIsProcessing(true);
      await processOrderToDB();
    }
  };

  const processOrderToDB = async (retryCount = 0) => {
    try {
      // Get App Check Token if available
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
          roomNumber: `${shippingDetails.flatNo || ""} (Landmark: ${shippingDetails.landmark || ""})`,
          areaName: shippingDetails.city,
          text: `${shippingDetails.flatNo ? shippingDetails.flatNo + ', ' : ''}${shippingDetails.address}, ${shippingDetails.landmark ? 'Near ' + shippingDetails.landmark + ', ' : ''}${shippingDetails.city}, ${shippingDetails.state}, ${shippingDetails.country} - ${shippingDetails.zipCode}`,
          phone: shippingDetails.phone || user.mobile || "",
          latitude: shippingDetails.latitude,
          longitude: shippingDetails.longitude,
        },
        totalAmount: finalAmount,
        discountAmount: discount,
        couponCode: couponDetails.isApplied ? couponDetails.code : "",
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
        timeout: 45000 // 45s timeout for Render cold start
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
      className="w-full max-w-7xl mx-auto"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#24672E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 block w-fit mb-2">
            Final Step
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Review Your Order</h2>
          <p className="text-xs text-gray-500 mt-1">Please confirm your items, delivery details, and billing before completing the order.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Items & Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Shipping Details */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs transition-all hover:shadow-md/5">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-50">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#24672E]"></span>
                Shipping Address
              </h3>
              {!isEditingAddress && (
                <button 
                  onClick={handleStartEditingAddress} 
                  className="text-xs text-[#24672E] font-black hover:text-black uppercase tracking-widest transition-colors flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingAddress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-455 tracking-widest mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editAddressForm.fullName}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#24672E] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-455 tracking-widest mb-1">Phone Number *</label>
                    <input
                      type="text"
                      value={editAddressForm.phone}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#24672E] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[9px] font-black uppercase text-gray-455 tracking-widest mb-1">Flat / House No.</label>
                    <input
                      type="text"
                      value={editAddressForm.flatNo}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, flatNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#24672E] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-black uppercase text-gray-455 tracking-widest mb-1">Landmark *</label>
                    <input
                      type="text"
                      value={editAddressForm.landmark}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, landmark: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#24672E] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-gray-455 tracking-widest mb-1">Complete Address *</label>
                  <textarea
                    rows={2}
                    value={editAddressForm.address}
                    onChange={(e) => setEditAddressForm({ ...editAddressForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#24672E] focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-455 tracking-widest mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={editAddressForm.zipCode}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, zipCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#24672E] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-455 tracking-widest mb-1">City *</label>
                    <input
                      type="text"
                      value={editAddressForm.city}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#24672E] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-455 tracking-widest mb-1">State *</label>
                    <input
                      type="text"
                      value={editAddressForm.state}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#24672E] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="px-4 py-2 bg-[#24672E] text-white rounded-xl font-black text-xs hover:bg-black transition-colors cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-xs leading-relaxed text-slate-600 font-medium">
                <span className="font-extrabold text-sm text-slate-800 block mb-1">{shippingDetails.fullName}</span>
                {shippingDetails.flatNo && <span>{shippingDetails.flatNo}, </span>}
                {shippingDetails.address}<br />
                {shippingDetails.landmark && <span className="text-slate-500">Landmark: {shippingDetails.landmark}<br /></span>}
                <span className="font-bold text-slate-700">{shippingDetails.city}, {shippingDetails.state} - {shippingDetails.zipCode}</span><br />
                <span className="text-slate-400 uppercase tracking-widest text-[10px] block mt-1">{shippingDetails.country}</span>
                <span className="font-mono text-slate-750 font-bold block mt-2">📞 {shippingDetails.phone}</span>
              </div>
            )}
          </div>

          {/* Delivery & Payment Method Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-widest mb-3">Delivery Option</h4>
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <p className="font-bold text-xs text-slate-800">{deliveryMethod?.name || "Standard Delivery"}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Est. Time: {deliveryMethod?.estimatedTime || "3-5 Business Days"}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-widest mb-3">Payment Method</h4>
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <p className="font-bold text-xs text-slate-800 uppercase">
                  {paymentMethod === 'online' ? 'UPI / Cards / Net Banking' : 'Cash on Delivery (COD)'}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">
                  {paymentMethod === 'online' ? 'Processed securely via PhonePe' : 'Pay in cash upon delivery'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items List */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-50">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#24672E]"></span>
                Items in Order ({cartItems.length})
              </h3>
            </div>

            <div className="max-h-[290px] overflow-y-auto pr-2 divide-y divide-slate-100/50 scrollbar-thin scrollbar-thumb-slate-200">
              {cartItems.map(item => (
                <div key={item._id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-14 h-14 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-50" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-850 text-xs sm:text-sm truncate uppercase tracking-tight">{item.name}</h4>
                    <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center border border-slate-150 rounded-lg overflow-hidden bg-slate-50/50">
                      <button
                        onClick={() => dispatch(updateQuantity({ id: item._id, quantity: Math.max(1, item.quantity - 1) }))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-slate-200/50 transition text-slate-500 cursor-pointer"
                      ><FaMinus size={8} /></button>
                      <span className="w-6 text-center font-bold text-xs text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-slate-200/50 transition text-slate-500 cursor-pointer"
                      ><FaPlus size={8} /></button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <FaTrash size={11} />
                    </button>
                    <div className="w-20 text-right font-black text-xs sm:text-sm text-slate-850">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Billing & Place Order */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          
          {/* Coupons & Referral container */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
            {/* Promo Coupon */}
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 mb-2">Apply Promo Code</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] uppercase font-bold text-xs tracking-wider"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={couponDetails.isApplied}
                />
                {couponDetails.isApplied ? (
                  <button
                    onClick={removeCoupon}
                    className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-[#24672E] transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {validatingCoupon ? "..." : "Apply"}
                  </button>
                )}
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 mb-2">Referral Code</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="REFERRAL CODE"
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] uppercase font-bold text-xs tracking-wider"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  disabled={referralApplied}
                />
                {referralApplied ? (
                  <button
                    onClick={removeReferral}
                    className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyReferral}
                    disabled={validatingReferral}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-[#24672E] transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {validatingReferral ? "..." : "Apply"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Sheet */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Pattern Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <h3 className="font-black text-xs uppercase tracking-widest text-[#EFDB27] mb-4 pb-2 border-b border-white/10">
              Order Pricing Summary
            </h3>

            <div className="space-y-3 font-semibold text-xs text-gray-300">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Promo Discount</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {coinDiscount > 0 && (
                <div className="flex justify-between items-center text-amber-400">
                  <span>Coins Credit Applied</span>
                  <span>-₹{coinDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Delivery Charges</span>
                <span className="text-white">
                  {shippingCost === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${shippingCost}`}
                </span>
              </div>

              {/* Tax Breakdowns */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span>CGST (2.5%)</span>
                  <span>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span>SGST (2.5%)</span>
                  <span>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                <span className="font-black text-sm uppercase tracking-wider text-white">Grand Total</span>
                <span className="text-2xl font-black text-[#EFDB27]">
                  ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full mt-6 py-4 bg-[#EFDB27] hover:bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all duration-350 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Complete Purchase</span>
                </>
              )}
            </button>

            <button
              onClick={prevStep}
              className="w-full mt-3 py-2 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors text-center cursor-pointer bg-transparent border-0"
            >
              Back to Shipping
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default OrderReview;
