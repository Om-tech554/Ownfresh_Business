import React from 'react';
import { useCheckout } from './CheckoutContext';
import { motion } from 'framer-motion';
import { BsCreditCard2FrontFill } from 'react-icons/bs';
import { FaWallet, FaShieldAlt, FaLock } from 'react-icons/fa';

const paymentOptions = [
  {
    id: 'online',
    name: 'Credit/Debit Card, UPI, NetBanking',
    description: 'Pay securely using Razorpay',
    icon: <BsCreditCard2FrontFill className="text-2xl" />
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay with cash upon delivery',
    icon: <FaWallet className="text-2xl" />
  }
];

const PaymentSection = () => {
  const { paymentMethod, setPaymentMethod, nextStep, prevStep } = useCheckout();

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
          <FaLock /> SSL Secure
        </div>
      </div>
      
      <div className="space-y-4">
        {paymentOptions.map((option) => {
          const isSelected = paymentMethod === option.id;
          return (
            <div 
              key={option.id}
              onClick={() => setPaymentMethod(option.id)}
              className={`relative flex flex-col sm:flex-row items-start sm:items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-yellow-500 bg-yellow-50 shadow-md' 
                  : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 sm:mb-0 sm:mr-5 transition-colors ${
                isSelected ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-500'
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

      <div className="mt-8 bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4">
        <FaShieldAlt className="text-3xl text-gray-400" />
        <div>
          <h4 className="font-bold text-gray-800 text-sm">Safe & Secure Payments</h4>
          <p className="text-xs text-gray-500 mt-1">
            We employ state-of-the-art 256-bit encryption and PCI-DSS compliant payment gateways to ensure your transactions are 100% safe.
          </p>
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
          onClick={nextStep}
          className="px-8 py-4 bg-gray-900 text-white rounded-xl font-black hover:bg-yellow-500 hover:text-black transition-colors shadow-lg"
        >
          Review Order
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentSection;
