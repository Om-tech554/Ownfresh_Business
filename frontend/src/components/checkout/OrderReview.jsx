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
    deliveryMethod,
    paymentMethod,
    couponDetails,
    setCouponDetails,
    useWallet,
    prevStep,
    referralCode,
    setReferralCode,
    referralApplied,
    setReferralApplied
  } = useCheckout();

  const [couponInput, setCouponInput] = useState(couponDetails.code || '');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [referralInput, setReferralInput] = useState(referralCode || '');
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cart calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = deliveryMethod?.cost || 0;
  const discount = couponDetails?.discount || 0;
  const taxableAmount = Math.max(0, subtotal - discount);
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
        withCredentials: true 
      });

      if (data.success && data.redirectUrl) {
        toast.success("Redirecting to secure PhonePe payment gateway...");
        dispatch(clearCart());
        // Redirect to PhonePe payment page
        window.location.href = data.redirectUrl;
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

  const processOrderToDB = async () => {
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

      const { data } = await axios.post(`${serverUrl}/api/order/create`, {
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
        useWallet: useWallet
      }, { 
        headers,
        withCredentials: true 
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
      toast.error(error.response?.data?.msg || "Order placement failed");
      return null;
    } finally {
      if (paymentMethod !== "online") {
        setIsProcessing(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
    >
      <h2 className="text-2xl font-black text-gray-900 mb-6">Review Your Order</h2>

      {/* Items Review */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Order Items</h3>
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item._id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <button
                    onClick={() => dispatch(updateQuantity({ id: item._id, quantity: Math.max(1, item.quantity - 1) }))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"
                  ><FaMinus size={10} /></button>
                  <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"
                  ><FaPlus size={10} /></button>
                </div>
                <button
                  onClick={() => dispatch(removeFromCart(item._id))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <FaTrash size={14} />
                </button>
              </div>
              <div className="w-20 text-right font-bold text-gray-900">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid for Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Shipping Details</h3>
            <button onClick={() => prevStep()} className="text-sm text-yellow-600 font-bold hover:underline">Edit</button>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{shippingDetails.fullName}</span><br />
            {shippingDetails.flatNo && <span>{shippingDetails.flatNo}, </span>}
            {shippingDetails.address}<br />
            {shippingDetails.landmark && <span>Landmark: {shippingDetails.landmark}<br /></span>}
            {shippingDetails.city}, {shippingDetails.state} {shippingDetails.zipCode}<br />
            {shippingDetails.country}<br />
            {shippingDetails.phone}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-2">Delivery & Payment</h3>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold text-gray-800">Method:</span> {deliveryMethod.name} ({deliveryMethod.estimatedTime})
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Payment:</span> {paymentMethod === 'online' ? 'UPI / Bank Transfer' : 'Cash on Delivery'}
          </p>
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="mb-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">Tax Summary (5% GST)</h3>
          <p className="text-xs text-gray-600 mt-1">Calculated on Taxable Amount: ₹{taxableAmount.toFixed(2)}</p>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <span className="block text-gray-500 font-medium">CGST (2.5%)</span>
            <span className="font-bold text-gray-900">₹{cgst.toFixed(2)}</span>
          </div>
          <div className="text-center">
            <span className="block text-gray-500 font-medium">SGST (2.5%)</span>
            <span className="font-bold text-gray-900">₹{sgst.toFixed(2)}</span>
          </div>
          <div className="text-center border-l border-yellow-200 pl-6">
            <span className="block text-gray-500 font-medium">Total Tax</span>
            <span className="font-bold text-yellow-600">₹{totalTax.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Coupon & Referral Code Section */}
      <div className="mb-8 border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Promo Coupon Application */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Promo Coupon</h3>
          <div className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 uppercase font-bold text-sm"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              disabled={couponDetails.isApplied}
            />
            {couponDetails.isApplied ? (
              <button
                onClick={removeCoupon}
                className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={handleApplyCoupon}
                disabled={validatingCoupon}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-yellow-500 hover:text-black transition disabled:opacity-50"
              >
                {validatingCoupon ? "Applying..." : "Apply"}
              </button>
            )}
          </div>
        </div>

        {/* Referral Code Application */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Referral Code</h3>
          <div className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="Enter referral code"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 uppercase font-bold text-sm"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
              disabled={referralApplied}
            />
            {referralApplied ? (
              <button
                onClick={removeReferral}
                className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={handleApplyReferral}
                disabled={validatingReferral}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-yellow-500 hover:text-black transition disabled:opacity-50"
              >
                {validatingReferral ? "Applying..." : "Apply"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 flex justify-between items-center mt-4 border-t border-gray-100">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-gray-600 font-bold hover:text-gray-900 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="px-10 py-4 bg-yellow-500 text-black rounded-xl font-black text-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            'Place Order Now'
          )}
        </button>
      </div>


    </motion.div>
  );
};

export default OrderReview;
