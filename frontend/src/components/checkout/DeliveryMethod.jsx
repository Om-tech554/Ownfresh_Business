import React from 'react';
import { useCheckout } from './CheckoutContext';
import { motion } from 'framer-motion';
import { Truck, Zap, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';

const deliveryOptions = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    cost: 0,
    estimatedTime: '5-7 Business Days',
    icon: <Truck className="w-6 h-6" />
  },
  {
    id: 'express',
    name: 'Express Delivery',
    cost: 150,
    estimatedTime: '2-3 Business Days',
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 'priority',
    name: 'Priority Delivery',
    cost: 300,
    estimatedTime: 'Next Business Day',
    icon: <Rocket className="w-6 h-6" />
  }
];

const DeliveryMethod = () => {
  const { deliveryMethod, setDeliveryMethod, nextStep, prevStep } = useCheckout();

  const handleSelectOption = (option) => {
    setDeliveryMethod(option);
    toast.success(`${option.name} selected (${option.estimatedTime})`, {
      icon: "🚚",
      style: { borderRadius: "12px", background: "#181818", color: "#FFDD00" }
    });
  };

  const handleContinuePayment = () => {
    toast.success("Delivery speed saved! Proceeding to Payment 💳", {
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
        <h2 className="text-2xl font-black text-gray-900 dark:text-[#F7F9FC]">Delivery Method</h2>
        <span className="text-xs font-bold px-3 py-1 bg-amber-50 dark:bg-[#1D2530] text-amber-800 dark:text-[#FFD600] rounded-full border border-amber-200 dark:border-[#2A3440]">
          🌿 Express Botanic Delivery
        </span>
      </div>
      
      <div className="space-y-4">
        {deliveryOptions.map((option) => {
          const isSelected = deliveryMethod.id === option.id;
          return (
            <div 
              key={option.id}
              onClick={() => handleSelectOption(option)}
              className={`relative flex items-center p-5 pr-14 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-[#FFD600] bg-yellow-50/80 dark:bg-[#1D2530] shadow-md dark:border-[#FFD600]' 
                  : 'border-gray-200 dark:border-[#27313D] hover:border-yellow-300 dark:hover:border-[#34404E] hover:bg-gray-50 dark:hover:bg-[#1C232D]'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-5 transition-colors ${
                isSelected ? 'bg-[#FFD600] text-[#111318] shadow-md' : 'bg-gray-100 dark:bg-[#151B23] text-gray-500 dark:text-[#818C9B]'
              }`}>
                {option.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-[#F7F9FC] text-lg">{option.name}</h3>
                <p className="text-sm text-gray-600 dark:text-[#B7C1CE] mt-1">{option.estimatedTime}</p>
              </div>

              <div className="text-right">
                <span className="font-black text-gray-900 dark:text-[#FFD600] text-lg">
                  {option.cost === 0 ? 'FREE' : `₹${option.cost}`}
                </span>
              </div>
              
              {/* Custom Radio Button Indicator */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-[#2A3440] flex items-center justify-center ml-4">
                {isSelected && <div className="w-3 h-3 rounded-full bg-[#FFD600]"></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center mt-4 border-t border-gray-100 dark:border-[#27313D]">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-3.5 text-gray-700 dark:text-[#B7C1CE] font-bold hover:text-black dark:hover:text-[#F5F7FA] transition-colors border border-gray-200 dark:border-[#303B48] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1D2530] text-center cursor-pointer"
        >
          ← Back to Shipping
        </button>
        <button
          type="button"
          onClick={handleContinuePayment}
          className="px-8 sm:px-10 py-4 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-[#111318] rounded-xl font-black text-sm uppercase tracking-wider hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-yellow-500/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-center"
        >
          <span>Continue to Payment</span>
          <span className="text-lg">💳</span>
        </button>
      </div>
    </motion.div>
  );
};

export default DeliveryMethod;
