import React from 'react';
import { useCheckout } from './CheckoutContext';
import { motion } from 'framer-motion';
import { BsCreditCard2FrontFill } from 'react-icons/bs';
import { FaWallet, FaShieldAlt, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const paymentOptions = [
  {
    id: 'online',
    name: 'UPI / PhonePe / Cards / NetBanking',
    description: 'Instant secure payment via PhonePe gateway with 256-bit SSL encryption.',
    icon: <BsCreditCard2FrontFill className="text-2xl" />
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay cash directly upon receiving your botanic oil shipment.',
    icon: <FaWallet className="text-2xl" />
  }
];

const PaymentSection = () => {
  const { paymentMethod, setPaymentMethod, nextStep, prevStep } = useCheckout();

  const handleSelectPayment = (id) => {
    setPaymentMethod(id);
    const label = id === 'online' ? 'UPI / Online Gateway' : 'Cash on Delivery';
    toast.success(`Payment mode set to ${label}`, {
      icon: "💳",
      style: { borderRadius: "12px", background: "#181818", color: "#FFDD00" }
    });
  };

  const handleReviewOrder = () => {
    toast.success("Payment method confirmed! Loading order summary... 🛒", {
      icon: "🪔",
      style: { borderRadius: "14px", background: "#181818", color: "#FFDD00", border: "1px solid #FFDD00" }
    });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900">Payment Method</h2>
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
          <FaLock /> SSL Secure Gateway
        </div>
      </div>
      
      <div className="space-y-4">
        {paymentOptions.map((option) => {
          const isSelected = paymentMethod === option.id;
          return (
            <div 
              key={option.id}
              onClick={() => handleSelectPayment(option.id)}
              className={`relative flex flex-col sm:flex-row items-start sm:items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-yellow-500 bg-yellow-50/80 shadow-md' 
                  : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 sm:mb-0 sm:mr-5 transition-colors ${
                isSelected ? 'bg-yellow-500 text-black shadow-md' : 'bg-gray-100 text-gray-500'
              }`}>
                {option.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{option.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              </div>

              {/* Custom Radio Button Indicator */}
              <div className="absolute top-5 right-5 sm:static sm:ml-4 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                {isSelected && <div className="w-3 h-3 rounded-full bg-yellow-500"></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-amber-50/60 p-4 rounded-xl border border-amber-200 flex items-center gap-4">
        <FaShieldAlt className="text-3xl text-amber-600" />
        <div>
          <h4 className="font-bold text-gray-900 text-sm">Encrypted & Safe Payments</h4>
          <p className="text-xs text-gray-600 mt-1">
            We employ 256-bit encryption and PCI-DSS compliant gateways to ensure your transactions are 100% protected.
          </p>
        </div>
      </div>

      <div className="pt-8 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={prevStep}
          className="w-full sm:w-auto px-6 py-3.5 text-gray-700 font-bold hover:text-black transition-colors border border-gray-200 rounded-xl hover:bg-gray-50 text-center cursor-pointer"
        >
          ← Back to Delivery
        </button>
        <button
          type="button"
          onClick={handleReviewOrder}
          className="w-full sm:w-auto justify-center px-10 py-4 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-slate-950 rounded-xl font-black text-sm uppercase tracking-wider hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-yellow-500/30 flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>Review Order</span>
          <span className="text-lg">📋</span>
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentSection;
