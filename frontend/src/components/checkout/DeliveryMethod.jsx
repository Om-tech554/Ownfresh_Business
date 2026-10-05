import React, { useEffect } from 'react';
import { useCheckout } from './CheckoutContext';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Truck, Zap, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateClientShipping } from '../../utils/shippingCalculator';
import SLink from '../SLink';

const DeliveryMethod = () => {
  const { deliveryMethod, setDeliveryMethod, nextStep, prevStep, shippingDetails } = useCheckout();
  const cartItems = useSelector((state) => state.user.cartItems);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingQuote = calculateClientShipping({ cartItems, subtotal, destination: shippingDetails });

  const standardCost = shippingQuote.isFreeDelivery ? 0 : shippingQuote.standardDeliveryCost;
  const standardName = shippingQuote.deliveryMethodName || 'Standard Delivery';
  const standardTime = shippingQuote.region === 'PUNE' ? '1-2 Business Days (Local)' : '3-5 Business Days';

  const deliveryOptions = [
    {
      id: 'standard',
      name: standardName,
      cost: standardCost,
      estimatedTime: standardTime,
      icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
    },
    {
      id: 'express',
      name: 'Express Delivery',
      cost: standardCost + 150,
      estimatedTime: '2-3 Business Days',
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
    },
    {
      id: 'priority',
      name: 'Priority Delivery',
      cost: standardCost + 300,
      estimatedTime: 'Next Business Day',
      icon: <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
    }
  ];

  // Auto-sync active option cost
  useEffect(() => {
    const currentOpt = deliveryOptions.find(o => o.id === deliveryMethod.id) || deliveryOptions[0];
    if (deliveryMethod.cost !== currentOpt.cost || deliveryMethod.name !== currentOpt.name) {
      setDeliveryMethod(currentOpt);
    }
  }, [subtotal, cartItems.length, shippingQuote.totalWeight, deliveryMethod.id]);

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
      className="bg-white dark:bg-[#171D26] rounded-2xl shadow-sm border border-gray-100 dark:border-[#27313D] p-4 sm:p-6 md:p-8 transition-colors duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#F7F9FC] tracking-tight">
            Delivery Method
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8B98A5] mt-0.5">
            Select your preferred shipping speed and carrier
          </p>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-amber-50 dark:bg-[#1D2530] text-amber-800 dark:text-[#FFD600] rounded-full border border-amber-200 dark:border-[#2A3440] shrink-0 whitespace-nowrap shadow-xs">
          <span>🌿</span> Express Botanic Delivery
        </span>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {deliveryOptions.map((option) => {
          const isSelected = deliveryMethod.id === option.id;
          return (
            <div 
              key={option.id}
              onClick={() => handleSelectOption(option)}
              className={`group flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-[#FFD600] bg-yellow-50/80 dark:bg-[#1D2530] shadow-sm dark:border-[#FFD600]' 
                  : 'border-gray-200 dark:border-[#27313D] hover:border-yellow-300 dark:hover:border-[#34404E] hover:bg-gray-50/80 dark:hover:bg-[#1C232D]'
              }`}
            >
              {/* Left Section: Icon & Title/ETA */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shrink-0 transition-colors ${
                  isSelected ? 'bg-[#FFD600] text-[#111318] shadow-sm' : 'bg-gray-100 dark:bg-[#151B23] text-gray-500 dark:text-[#818C9B]'
                }`}>
                  {option.icon}
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-[#F7F9FC] text-sm sm:text-base md:text-lg leading-snug">
                    {option.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-[#B7C1CE] mt-0.5 leading-tight">
                    {option.estimatedTime}
                  </p>
                </div>
              </div>

              {/* Right Section: Price, Prime Badge & Radio Indicator */}
              <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                <div className="text-right">
                  <span className={`font-black text-sm sm:text-base md:text-lg block leading-tight ${
                    option.cost === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-[#FFD600]'
                  }`}>
                    {option.cost === 0 ? 'FREE' : `₹${option.cost}`}
                  </span>
                  {option.cost > 0 && (
                    <SLink
                      to="/membership"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] sm:text-[11px] text-amber-600 dark:text-[#FFD600] font-bold hover:underline block mt-0.5 cursor-pointer whitespace-nowrap"
                    >
                      👑 Use Prime 1%
                    </SLink>
                  )}
                </div>
                
                {/* Custom Radio Button Indicator in natural flex flow */}
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-0.5 sm:ml-1 transition-all ${
                  isSelected 
                    ? 'border-[#FFD600] bg-[#FFD600]/20' 
                    : 'border-gray-300 dark:border-[#2A3440] group-hover:border-gray-400 dark:group-hover:border-[#3E4C5E]'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFD600]"></div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 sm:pt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center mt-4 sm:mt-6 border-t border-gray-100 dark:border-[#27313D]">
        <button
          type="button"
          onClick={prevStep}
          className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 text-gray-700 dark:text-[#B7C1CE] font-bold hover:text-black dark:hover:text-[#F5F7FA] transition-colors border border-gray-200 dark:border-[#303B48] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1D2530] text-center cursor-pointer text-sm sm:text-base active:scale-95"
        >
          ← Back to Shipping
        </button>
        <button
          type="button"
          onClick={handleContinuePayment}
          className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-[#111318] rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider hover:from-yellow-400 hover:to-amber-500 transition-all shadow-md sm:shadow-lg hover:shadow-yellow-500/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-center"
        >
          <span>Continue to Payment</span>
          <span className="text-base sm:text-lg">💳</span>
        </button>
      </div>
    </motion.div>
  );
};

export default DeliveryMethod;
