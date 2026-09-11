import React from 'react';
import { motion } from 'framer-motion';
import sonaliLogo from '../assets/partners/sonali_foods.png';
import tifineatyLogo from '../assets/partners/tifineaty.png';
import mh09Logo from '../assets/partners/mh09_hotel.png';

const partners = [
  { name: 'Sonali Foods', logo: sonaliLogo },
  { name: 'TIFINEATY', logo: tifineatyLogo },
  { name: 'Hotel MH09', logo: mh09Logo },
  // Duplicate for seamless loop
  { name: 'Sonali Foods', logo: sonaliLogo },
  { name: 'TIFINEATY', logo: tifineatyLogo },
  { name: 'Hotel MH09', logo: mh09Logo },
  { name: 'Sonali Foods', logo: sonaliLogo },
  { name: 'TIFINEATY', logo: tifineatyLogo },
  { name: 'Hotel MH09', logo: mh09Logo },
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-white dark:bg-[#0B0F14] border-t border-b border-gray-100 dark:border-[#202731] overflow-hidden transition-colors duration-250" data-aos="fade-up">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-black dark:text-[#F7F9FC] uppercase tracking-wider mb-2">
          Our Valued <span className="text-[#24672E] dark:text-[#FFD600]">Partners</span>
        </h2>
        <div className="w-24 h-1 bg-[#FFDD00] dark:bg-[#FFD600] mx-auto rounded-full"></div>
      </div>

      <div className="relative flex overflow-x-hidden py-2">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{
            x: ['0%', '-33.33%'],
          }}
          transition={{
            duration: 20,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center mx-6 md:mx-12 min-w-[150px] md:min-w-[180px] p-3 rounded-2xl bg-gray-50/50 dark:bg-[#171D26] border border-gray-100 dark:border-[#27313D] shadow-xs hover:dark:border-[#34404E] transition-all"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-14 md:h-20 w-auto object-contain transition-all duration-500 transform hover:scale-110 cursor-pointer dark:mix-blend-normal"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
