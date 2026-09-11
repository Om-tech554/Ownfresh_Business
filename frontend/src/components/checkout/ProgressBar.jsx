import React from 'react';
import { useCheckout } from './CheckoutContext';
import { FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

const steps = [
  { id: 1, label: 'Shipping' },
  { id: 2, label: 'Delivery' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Review' },
];

const ProgressBar = () => {
  const { currentStep } = useCheckout();

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-[#27313D] z-0"></div>
        <motion.div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#FFD600] z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        ></motion.div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-[#FFD600] border-[#FFD600] text-[#111318]' 
                    : isCurrent 
                      ? 'bg-white dark:bg-[#1D2530] border-[#FFD600] text-[#FFD600]' 
                      : 'bg-white dark:bg-[#151B23] border-gray-300 dark:border-[#2A3440] text-gray-400 dark:text-[#5E6875]'
                }`}
              >
                {isCompleted ? <FaCheck /> : step.id}
              </div>
              <span className={`mt-2 text-xs md:text-sm font-semibold hidden sm:block ${
                isCompleted || isCurrent ? 'text-gray-900 dark:text-[#F7F9FC]' : 'text-gray-400 dark:text-[#818C9B]'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
