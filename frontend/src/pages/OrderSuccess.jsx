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
              href="tel:+919999999999"
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
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
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
            🪔 Cold-Pressed Botanic Purity
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

        <div className="mt-4">
          <Link to="/shop" className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition underline">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
