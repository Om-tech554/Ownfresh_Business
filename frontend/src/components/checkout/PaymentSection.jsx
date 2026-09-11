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
      className="bg-white dark:bg-[#171D26] rounded-2xl shadow-sm border border-gray-100 dark:border-[#27313D] p-6 md:p-8 transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-[#F7F9FC]">Payment Method</h2>
        <div className="flex items-center gap-2 text-green-600 dark:text-emerald-400 bg-green-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full text-xs font-bold border border-green-200 dark:border-emerald-800/50">
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
                  ? 'border-[#FFD600] bg-yellow-50/80 dark:bg-[#1D2530] shadow-md dark:border-[#FFD600]' 
                  : 'border-gray-200 dark:border-[#27313D] hover:border-yellow-300 dark:hover:border-[#34404E] hover:bg-gray-50 dark:hover:bg-[#1C232D]'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 sm:mb-0 sm:mr-5 transition-colors ${
                isSelected ? 'bg-[#FFD600] text-[#111318] shadow-md' : 'bg-gray-100 dark:bg-[#151B23] text-gray-500 dark:text-[#818C9B]'
              }`}>
                {option.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-[#F7F9FC] text-lg">{option.name}</h3>
                <p className="text-sm text-gray-600 dark:text-[#B7C1CE] mt-1">{option.description}</p>
              </div>

              {/* Custom Radio Button Indicator */}
              <div className="absolute top-5 right-5 sm:static sm:ml-4 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-[#2A3440] flex items-center justify-center flex-shrink-0">
                {isSelected && <div className="w-3 h-3 rounded-full bg-[#FFD600]"></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-amber-50/60 dark:bg-[#151B23] p-4 rounded-xl border border-amber-200 dark:border-[#27313D] flex items-center gap-4">
        <FaShieldAlt className="text-3xl text-amber-600 dark:text-[#FFD600]" />
        <div>
          <h4 className="font-bold text-gray-900 dark:text-[#F7F9FC] text-sm">Encrypted & Safe Payments</h4>
          <p className="text-xs text-gray-600 dark:text-[#818C9B] mt-1">
            We employ 256-bit encryption and PCI-DSS compliant gateways to ensure your transactions are 100% protected.
          </p>
        </div>
      </div>

      <div className="pt-8 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-4 border-t border-gray-100 dark:border-[#27313D]">
        <button
          type="button"
          onClick={prevStep}
          className="w-full sm:w-auto px-6 py-3.5 text-gray-700 dark:text-[#B7C1CE] font-bold hover:text-black dark:hover:text-[#F5F7FA] transition-colors border border-gray-200 dark:border-[#303B48] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1D2530] text-center cursor-pointer"
        >
          ← Back to Delivery
        </button>
        <button
          type="button"
          onClick={handleReviewOrder}
          className="w-full sm:w-auto justify-center px-10 py-4 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-[#111318] rounded-xl font-black text-sm uppercase tracking-wider hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-yellow-500/30 flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>Review Order</span>
          <span className="text-lg">📋</span>
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentSection;
