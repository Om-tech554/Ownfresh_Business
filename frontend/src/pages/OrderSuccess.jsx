import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaDownload, FaShoppingBag, FaSpinner, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import { appCheck } from '../../firebase';
import { getToken } from 'firebase/app-check';

const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getOrderId = () => {
    if (location.state?.orderId) return location.state.orderId;
    const params = new URLSearchParams(location.search);
    return params.get('orderId') || params.get('id') || null;
  };

  const orderId = getOrderId();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending'); // 'pending', 'completed', 'failed', 'error'
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [attemptCount, setAttemptCount] = useState(1);
  const checkCountRef = useRef(1);

  useEffect(() => {
    if (!orderId) {
      const timeout = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timeout);
    }

    let isMounted = true;
    let pollInterval = null;

    const verifyPaymentStatus = async () => {
      try {
        let appCheckToken = "";
        if (appCheck) {
          try {
            const tokenResponse = await getToken(appCheck, false);
            appCheckToken = tokenResponse.token;
          } catch (err) {
            console.warn("AppCheck Token Error:", err.message);
          }
        }
        const headers = appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {};

        const { data } = await axios.get(`${serverUrl}/api/payment/phonepe-status/${orderId}`, {
          headers,
          withCredentials: true
        });

        if (!isMounted) return;

        if (data.success) {
          setStatus('completed');
          setOrderDetails(data.order);
          setLoading(false);
          if (pollInterval) clearInterval(pollInterval);
        } else if (data.paymentStatus === 'failed') {
          setStatus('failed');
          setErrorMsg(data.msg || 'Payment failed or was declined by bank.');
          setLoading(false);
          if (pollInterval) clearInterval(pollInterval);
        } else {
          checkCountRef.current += 1;
          setAttemptCount(checkCountRef.current);
          if (checkCountRef.current >= 5) {
            setStatus('pending');
            setErrorMsg('Payment verification is taking longer than expected. Please check your Orders page shortly.');
            setLoading(false);
            if (pollInterval) clearInterval(pollInterval);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Payment verification status error:", error);
        setErrorMsg('Error communicating with the payment server.');
        setStatus('error');
        setLoading(false);
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    verifyPaymentStatus();
    pollInterval = setInterval(verifyPaymentStatus, 3000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId, navigate]);

  if (!orderId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <FaSpinner className="text-4xl text-amber-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium text-center text-sm">No order details found. Redirecting to homepage...</p>
      </div>
    );
  }

  // --- 1) LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-6 bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="flex justify-center">
            <FaSpinner className="text-5xl sm:text-6xl text-amber-500 animate-spin" />
          </div>
          <div>
            <h2 className="mt-4 text-xl sm:text-2xl font-black text-gray-900">Verifying Payment Status...</h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Please do not refresh this page. We are verifying your transaction securely with the bank.
            </p>
          </div>
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 text-xs sm:text-sm text-amber-800 font-medium text-center">
            Checking status (attempt {attemptCount} of 5)...
          </div>
        </div>
      </div>
    );
  }

  // --- 2) FAILURE STATE ---
  if (status === 'failed' || status === 'error') {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full space-y-6 bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100 text-center"
        >
          <div className="flex justify-center">
            <FaExclamationCircle className="text-7xl sm:text-8xl text-red-500" />
          </div>

          <div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-black text-gray-900">Payment Unsuccessful</h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              {errorMsg || 'We were unable to verify your payment. If money was deducted, it will be refunded automatically by your bank within 3-5 business days.'}
            </p>
          </div>

          <div className="bg-red-50 rounded-2xl p-4 sm:p-6 border border-red-100 mb-4 text-left">
            <div className="flex justify-between items-center border-b border-red-200 pb-3 mb-3 text-xs sm:text-sm">
              <span className="text-red-700 font-medium">Order Reference ID</span>
              <span className="font-bold text-red-900 font-mono">#{orderId.substring(Math.max(0, orderId.length - 12))}</span>
            </div>
            <div className="text-[11px] sm:text-xs text-red-600 leading-relaxed">
              If you feel this is an error, please keep your Order ID handy and contact our support team.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6">
            <Link
              to="/checkout"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-800 transition shadow-md active:scale-95"
            >
              Try Paying Again
            </Link>
            <a
              href="tel:+918999773438"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-500 text-black rounded-xl font-bold text-xs sm:text-sm hover:bg-amber-400 transition shadow-md shadow-amber-500/20 active:scale-95"
            >
              <FaPhone /> Contact Support
            </a>
          </div>

          <div className="mt-4">
            <Link to="/" className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition underline">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- 3) SUCCESS/CONFIRMED STATE ---
  return (
    <>
      {/* ── PROFESSIONAL PRINT-ONLY INVOICE ── */}
      <div className="hidden print:block w-full max-w-4xl mx-auto p-8 bg-white text-black font-sans leading-relaxed text-xs">
        <style>{`
          @media print {
            @page {
              size: auto;
              margin: 10mm 15mm;
            }
            body {
              background: #fff !important;
              color: #000 !important;
            }
          }
        `}</style>

        <div className="border border-gray-300 p-6 rounded-lg">
          <div className="flex justify-between items-start pb-6 border-b border-gray-200">
            <div>
              <img
                src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
                alt="OwnFresh Logo"
                className="h-10 md:h-12 w-auto object-contain"
              />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">
                Stone-Pressed Botanic Purity
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">
                Tax Invoice / Bill of Supply
              </h2>
              <p className="text-[10px] text-gray-500 mt-1">
                GSTIN: <span className="font-bold text-gray-800">27AAFCO4581C1ZX</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 py-6 border-b border-gray-200 text-[11px]">
            <div>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Invoice / Order ID</p>
              <p className="font-mono font-bold text-gray-900 mt-1">
                #{orderDetails?.customOrderId || orderId?.substring(Math.max(0, orderId.length - 12)).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Invoice Date</p>
              <p className="font-bold text-gray-900 mt-1">
                {orderDetails?.createdAt ? new Date(orderDetails.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Payment Mode</p>
              <p className="font-bold text-gray-900 mt-1 uppercase">
                {orderDetails?.PaymentMethod || 'Online'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Shipping Status</p>
              <p className="font-bold text-emerald-700 mt-1 uppercase">
                PAID & CONFIRMED
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-6 border-b border-gray-200 text-[11px]">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Sold By (Seller)
              </h3>
              <p className="font-bold text-gray-900 text-sm">OwnFresh Agro Industries</p>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Pune, Maharashtra, India<br />
                Email: contact@myownfresh.com<br />
                GSTIN: 27AAFCO4581C1ZX
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Billing & Shipping Address
              </h3>
              <p className="font-bold text-gray-900 text-sm">
                {orderDetails?.user?.fullName || orderDetails?.deliveryAddress?.name || 'Customer'}
              </p>
              <p className="text-gray-600 mt-1 leading-relaxed">
                {orderDetails?.deliveryAddress?.phone || orderDetails?.user?.phone ? `Phone: ${orderDetails?.deliveryAddress?.phone || orderDetails?.user?.phone}` : ''}<br />
                Address: {[
                  orderDetails?.deliveryAddress?.roomNumber,
                  orderDetails?.deliveryAddress?.areaName,
                  orderDetails?.deliveryAddress?.text,
                  orderDetails?.deliveryAddress?.pinCode
                ].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <div className="py-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Order Items
            </h3>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-gray-50 font-bold text-gray-700 uppercase text-[9px] tracking-wider border-b border-gray-200">
                  <th className="py-2.5 px-3">S.No.</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">HSN</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">CGST (2.5%)</th>
                  <th className="py-2.5 px-3 text-right">SGST (2.5%)</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderDetails?.items?.map((item, index) => {
                  const qty = item.quantity || 1;
                  const itemPrice = item.price || 0;
                  const lineTotal = itemPrice * qty;
                  const itemCgst = lineTotal * 0.025;
                  const itemSgst = lineTotal * 0.025;
                  const totalWithTax = lineTotal + itemCgst + itemSgst;

                  return (
                    <tr key={index} className="text-gray-800">
                      <td className="py-3 px-3">{index + 1}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold">{item.name}</p>
                        {item.variantName && (
                          <p className="text-[10px] text-gray-400 uppercase mt-0.5 font-semibold">Variant: {item.variantName}</p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-400">1515</td>
                      <td className="py-3 px-3 text-right">₹{itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-center font-bold">{qty}</td>
                      <td className="py-3 px-3 text-right text-gray-500">₹{itemCgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-right text-gray-500">₹{itemSgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-right font-bold">₹{totalWithTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <div className="w-64 space-y-2 text-[11px] text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal (Excl. Tax)</span>
                <span className="font-bold text-gray-900">
                  ₹{(orderDetails?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {orderDetails?.cgst > 0 && (
                <div className="flex justify-between">
                  <span>CGST (2.5%)</span>
                  <span className="font-bold text-gray-900">₹{orderDetails.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {orderDetails?.sgst > 0 && (
                <div className="flex justify-between">
                  <span>SGST (2.5%)</span>
                  <span className="font-bold text-gray-900">₹{orderDetails.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              {!(orderDetails?.cgst > 0) && (
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-bold text-gray-900">
                    ₹{((orderDetails?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0) * 0.05).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {orderDetails?.discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Discount Applied</span>
                  <span>-₹{orderDetails.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              {orderDetails?.walletDeductedAmount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Wallet Balance Used</span>
                  <span>-₹{orderDetails.walletDeductedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-gray-300 text-sm font-black text-gray-900">
                <span>Grand Total</span>
                <span>₹{(orderDetails?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
                  {/* Bottom section (Verified Signature) */}
          <div className="mt-4 flex justify-end border-t border-gray-200 pt-3">
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-2.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-500/10">
                ✓
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Digitally Verified</p>
                <p className="text-[8px] font-bold text-slate-500 mt-0.5">OwnFresh Agro Industries</p>
              </div>
            </div>
          </div>        </div>
          </div>
        </div>
      </div>

      {/* ── SUCCESS CARD (hidden in print) ── */}
      <div className="print:hidden min-h-[80vh] bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
          className="max-w-xl w-full space-y-6 bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100 text-center"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <FaCheckCircle className="text-7xl sm:text-8xl text-emerald-500" />
            </motion.div>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border border-amber-200 mb-3">
              🪔 Stone-Pressed Botanic Purity
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Order Confirmed!</h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Thank you for choosing OwnFresh. We have received your order and payment, and are carefully preparing your fresh oils for shipment.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100 text-left space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Order ID</span>
              <span className="font-mono font-bold text-gray-900">#{orderDetails?.customOrderId || orderId.substring(Math.max(0, orderId.length - 12)).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Payment Mode</span>
              <span className="font-bold text-gray-900 capitalize">{orderDetails?.PaymentMethod || 'Online'}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Estimated Delivery</span>
              <span className="font-bold text-gray-900 text-right">5-7 Business Days</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6">
            <Link
              to="/my-orders"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-slate-950 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <FaShoppingBag /> Track Order
            </Link>
            <button
              onClick={() => window.print()}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-4 bg-slate-900 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-800 transition shadow-md active:scale-95 cursor-pointer"
            >
              <FaDownload /> Download Invoice
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
            <Link to="/shop" className="font-bold text-amber-600 hover:text-amber-700 transition underline">
              Continue Shopping
            </Link>
            <div className="mt-2 text-slate-400 flex items-center gap-1">
              Need help? Contact Support at <a href="tel:+918999773438" className="font-extrabold text-[#24672E] hover:underline font-mono">+91 89997 73438</a>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OrderSuccess;
