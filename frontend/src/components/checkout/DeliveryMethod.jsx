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
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900">Delivery Method</h2>
        <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
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
              className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-yellow-500 bg-yellow-50/80 shadow-md' 
                  : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-5 transition-colors ${
                isSelected ? 'bg-yellow-500 text-black shadow-md' : 'bg-gray-100 text-gray-500'
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
          type="button"
          onClick={prevStep}
          className="px-6 py-3.5 text-gray-700 font-bold hover:text-black transition-colors border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          ← Back to Shipping
        </button>
        <button
          type="button"
          onClick={handleContinuePayment}
          className="px-10 py-4 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-slate-950 rounded-xl font-black text-sm uppercase tracking-wider hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-yellow-500/30 flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>Continue to Payment</span>
          <span className="text-lg">💳</span>
        </button>
      </div>
    </motion.div>
  );
};

export default DeliveryMethod;
