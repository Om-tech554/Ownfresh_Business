import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaDownload, FaShoppingBag, FaSpinner, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import { appCheck } from '../../firebase';
import { getToken } from 'firebase/app-check';
import toast from 'react-hot-toast';

const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract orderId from state or URL query parameters (PhonePe redirect appends it to query)
  const getOrderId = () => {
    if (location.state?.orderId) return location.state.orderId;
    const params = new URLSearchParams(location.search);
    return params.get('orderId') || params.get('id') || null;
  };

  const [orderId, setOrderId] = useState(getOrderId());
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending'); // 'pending', 'completed', 'failed', 'error'
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    // Re-check order ID on location change
    const currentId = getOrderId();
    if (currentId) {
      setOrderId(currentId);
    } else {
      // If no order ID, redirect to home
      const timeout = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [location]);

  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;
    let pollInterval;

    const verifyPaymentStatus = async () => {
      try {
        // Retrieve App Check token if active
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

        // Query our backend fallback status API
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
        } else {
          // If payment failed explicitly
          if (data.paymentStatus === 'failed') {
            setStatus('failed');
            setErrorMsg(data.msg || 'Payment failed or was declined.');
            setLoading(false);
            if (pollInterval) clearInterval(pollInterval);
          } else {
            // Keep checking if it's still pending (up to 5 checks, 3 seconds apart)
            setCheckCount(prev => {
              if (prev >= 5) {
                setStatus('pending');
                setErrorMsg('Payment verification is taking longer than expected. Please check your Orders page shortly.');
                setLoading(false);
                if (pollInterval) clearInterval(pollInterval);
              }
              return prev + 1;
            });
          }
        }
      } catch (error) {
        console.error("Payment verification status error:", error);
        if (isMounted) {
          setErrorMsg('Error communicating with the payment server.');
          setStatus('error');
          setLoading(false);
          if (pollInterval) clearInterval(pollInterval);
        }
      }
    };

    // Initial check
    verifyPaymentStatus();

    // Setup polling every 3 seconds to handle S2S webhook lag or slow bank responses
    pollInterval = setInterval(() => {
      verifyPaymentStatus();
    }, 3000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <FaSpinner className="text-4xl text-yellow-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">No order details found. Redirecting to homepage...</p>
      </div>
    );
  }

  // --- 1) LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="flex justify-center">
            <FaSpinner className="text-6xl text-yellow-500 animate-spin" />
          </div>
          <div>
            <h2 className="mt-6 text-2xl font-black text-gray-900">Verifying Payment Status...</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please do not refresh this page or click back. We are verifying your transaction with the bank.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm text-gray-500 text-left">
            Checking status (attempt {checkCount} of 5)...
          </div>
        </div>
      </div>
    );
  }

  // --- 2) FAILURE STATE ---
  if (status === 'failed' || status === 'error') {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center"
        >
          <div className="flex justify-center">
            <FaExclamationCircle className="text-8xl text-red-500" />
          </div>
          
          <div>
            <h2 className="mt-6 text-3xl font-black text-gray-900">Payment Failed</h2>
            <p className="mt-2 text-sm text-gray-600">
              {errorMsg || 'We were unable to verify your payment. If money was deducted, it will be refunded automatically by your bank within 3-5 business days.'}
            </p>
          </div>

          <div className="bg-red-50 rounded-2xl p-6 border border-red-100 mb-6 text-left">
            <div className="flex justify-between items-center border-b border-red-200 pb-4 mb-4">
              <span className="text-red-700 font-medium">Order Reference ID</span>
              <span className="font-bold text-red-900">#{orderId}</span>
            </div>
            <div className="text-xs text-red-600 leading-relaxed">
              If you feel this is an error, please take a note of your Order ID and contact our support team.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/checkout"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
            >
              Try Paying Again
            </Link>
            <a
              href="tel:+919999999999"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/30"
            >
              <FaPhone /> Contact Support
            </a>
          </div>

          <div className="mt-6">
            <Link to="/" className="text-sm font-bold text-yellow-600 hover:text-yellow-700 transition underline">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- 3) SUCCESS/CONFIRMED STATE ---
  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="max-w-xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center"
      >
        <div className="flex justify-center">
          <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
             <FaCheckCircle className="text-8xl text-green-500" />
          </motion.div>
        </div>
        
        <div>
          <h2 className="mt-6 text-3xl font-black text-gray-900">Order Confirmed!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. We have received your order and payment, and are getting it ready for shipment.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6 text-left">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <span className="text-gray-500 font-medium">Order ID</span>
            <span className="font-bold text-gray-900">#{orderId}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <span className="text-gray-500 font-medium">Payment Mode</span>
            <span className="font-bold text-gray-900 capitalize">{orderDetails?.PaymentMethod || 'Online'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Estimated Delivery</span>
            <span className="font-bold text-gray-900 text-right">Standard: 3-5 Business Days</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            to="/my-orders"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
          >
            <FaShoppingBag /> Track Order
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/30"
          >
            <FaDownload /> Download Invoice
          </button>
        </div>

        <div className="mt-6">
          <Link to="/shop" className="text-sm font-bold text-yellow-600 hover:text-yellow-700 transition underline">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
