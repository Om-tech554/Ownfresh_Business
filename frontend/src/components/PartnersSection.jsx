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
    <section className="py-16 bg-white overflow-hidden" data-aos="fade-up">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#FFDD00] uppercase tracking-wider mb-2">
          Our Valued Partners
        </h2>
        <div className="w-24 h-1 bg-[#FFDD00] mx-auto rounded-full"></div>
      </div>

      <div className="relative flex overflow-x-hidden">
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
              className="flex items-center justify-center mx-8 md:mx-16 min-w-[150px] md:min-w-[200px]"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-16 md:h-24 w-auto object-contain transition-all duration-500 transform hover:scale-110 cursor-pointer"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
