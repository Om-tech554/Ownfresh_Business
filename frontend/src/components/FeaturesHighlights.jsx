import React from "react";
import { FaShoppingCart, FaHeadset, FaExchangeAlt } from "react-icons/fa";

const FeaturesHighlights = () => {
  const features = [
    {
      icon: FaShoppingCart,
      title: "Free Shipping",
      subtitle: "On all orders over ₹500",
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

  // Subtle repeating diagonal line pattern (light gray) background style
  const diagonalPatternStyle = {
    backgroundColor: "#ffffff",
    backgroundImage: `repeating-linear-gradient(
      -45deg,
      #f5f5f5,
      #f5f5f5 1px,
      transparent 1px,
      transparent 12px
    )`,
  };

  return (
    <section
      style={diagonalPatternStyle}
      className="py-16 md:py-20 border-t border-b border-gray-100 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 lg:gap-20 justify-center">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group flex flex-col items-center text-center p-4 bg-transparent rounded-3xl"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                {/* 80px x 80px Icon Container */}
                <div className="w-20 h-20 flex items-center justify-center bg-[#F5F5F5] rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:bg-[#EBF5FF] group-hover:border-blue-200">
                  <Icon className="w-8 h-8 text-gray-700 group-hover:text-yellow-600 transition-colors duration-300" />
                </div>

                {/* Typography styling */}
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-6 tracking-tight">
                  {feature.title}
                </h3>

                <p className="text-lg text-gray-600 mt-2">
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
