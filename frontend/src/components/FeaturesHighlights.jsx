import React from "react";
import { FaShoppingCart, FaHeadset, FaExchangeAlt } from "react-icons/fa";

const FeaturesHighlights = () => {
  const features = [
    {
      icon: FaShoppingCart,
      title: "Free Shipping",
      subtitle: "On all orders over ₹999",
    },
    {
      icon: FaHeadset,
      title: "Dedicated Support",
      subtitle: "Quick response 24/7",
    },
    {
      icon: FaExchangeAlt,
      title: "Money-Back Guarantee",
      subtitle: "For Damaged Orders",
    },
  ];

  return (
    <section className="relative py-16 md:py-20 border-t border-b border-gray-100 dark:border-[#202832] bg-[#ffffff] dark:bg-[#0F141B] transition-colors duration-250 overflow-hidden">
      {/* Light Mode Subtle Diagonal Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #f5f5f5,
            #f5f5f5 1px,
            transparent 1px,
            transparent 12px
          )`
        }}
      />
      {/* Dark Mode Subtle Diagonal Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none hidden dark:block opacity-60"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            rgba(255, 255, 255, 0.025),
            rgba(255, 255, 255, 0.025) 1px,
            transparent 1px,
            transparent 12px
          )`
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 justify-center">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group flex flex-col items-center text-center p-6 sm:p-8 bg-white/60 dark:bg-[#171D26] rounded-3xl border border-gray-100 dark:border-[#27313D] transition-all duration-300 ease-in-out hover:shadow-lg dark:hover:bg-[#1D2530] dark:hover:border-[#34404E] hover:-translate-y-1"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                {/* 80px x 80px Icon Container */}
                <div className="w-20 h-20 flex items-center justify-center bg-[#F5F5F5] dark:bg-[#1D2530] rounded-2xl border border-gray-200 dark:border-[#303B48] shadow-sm transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:bg-[#EBF5FF] group-hover:border-blue-200 dark:group-hover:bg-[#222B37] dark:group-hover:border-[#FFD600]/40">
                  <Icon className="w-8 h-8 text-gray-700 dark:text-[#BFC9D6] group-hover:text-yellow-600 dark:group-hover:text-[#FFD600] transition-colors duration-300" />
                </div>

                {/* Typography styling */}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#F5F7FA] mt-6 tracking-tight">
                  {feature.title}
                </h3>

                <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-[#B7C1CE] mt-2">
                  {feature.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesHighlights;
