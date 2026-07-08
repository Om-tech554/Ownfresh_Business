import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaDownload, FaShoppingBag } from 'react-icons/fa';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(location.state?.orderId || null);

  useEffect(() => {
    // If no order ID, they probably navigated here directly. Redirect to home.
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

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
            Thank you for your purchase. We have received your order and are getting it ready for shipment.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6 text-left">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <span className="text-gray-500 font-medium">Order ID</span>
            <span className="font-bold text-gray-900">#{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Estimated Delivery</span>
            <span className="font-bold text-gray-900 text-right">Standard: 5-7 Business Days</span>
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
