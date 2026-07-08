import React from 'react';
import { useCheckout } from './CheckoutContext';
import { motion } from 'framer-motion';
import { FaTruck, FaShippingFast, FaFighterJet } from 'react-icons/fa';

const deliveryOptions = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    cost: 0,
    estimatedTime: '5-7 Business Days',
    icon: <FaTruck className="text-2xl" />
  },
  {
    id: 'express',
    name: 'Express Delivery',
    cost: 150,
    estimatedTime: '2-3 Business Days',
    icon: <FaShippingFast className="text-2xl" />
  },
  {
    id: 'priority',
    name: 'Priority Delivery',
    cost: 300,
    estimatedTime: 'Next Business Day',
    icon: <FaFighterJet className="text-2xl" />
  }
];

const DeliveryMethod = () => {
  const { deliveryMethod, setDeliveryMethod, nextStep, prevStep } = useCheckout();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
    >
      <h2 className="text-2xl font-black text-gray-900 mb-6">Delivery Method</h2>
      
      <div className="space-y-4">
        {deliveryOptions.map((option) => {
          const isSelected = deliveryMethod.id === option.id;
          return (
            <div 
              key={option.id}
              onClick={() => setDeliveryMethod(option)}
              className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-yellow-500 bg-yellow-50 shadow-md' 
                  : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-5 transition-colors ${
                isSelected ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-500'
              }`}>
                {option.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{option.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{option.estimatedTime}</p>
              </div>

              <div className="text-right">
                <span className="font-black text-gray-900 text-lg">
                  {option.cost === 0 ? 'FREE' : `₹${option.cost}`}
                </span>
              </div>
              
              {/* Custom Radio Button Indicator */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center ml-4">
                {isSelected && <div className="w-3 h-3 rounded-full bg-yellow-500"></div>}
              </div>
            </div>
          );
        })}
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
          Continue to Payment
        </button>
      </div>
    </motion.div>
  );
};

export default DeliveryMethod;
