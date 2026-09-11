import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa6';
import { MessageSquare, X } from 'lucide-react';

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isProductPage = location.pathname.startsWith("/product");
  const isCheckoutOrCart = location.pathname === "/checkout" || location.pathname === "/cart";

  const contactOptions = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: 'https://wa.me/918999773438?text=Hello%20OwnFresh%2C%20I%20have%20a%20query%20about%20your%20products.',
      bgColor: 'bg-[#25D366]',
      textColor: 'text-white',
    },
    {
      name: 'Call Us',
      icon: FaPhone,
      url: 'tel:+918999773438',
      bgColor: 'bg-[#FFDD00] dark:bg-[#FFD600]',
      textColor: 'text-black',
    },
    {
      name: 'Email Us',
      icon: FaEnvelope,
      url: 'mailto:contact@myownfresh.com',
      bgColor: 'bg-black dark:bg-[#1D2530] border dark:border-[#303B48]',
      textColor: 'text-white',
    },
  ];

  return (
    <div
      className={`print:hidden fixed ${
        isProductPage || isCheckoutOrCart
          ? "hidden lg:flex lg:bottom-6"
          : "bottom-20 lg:bottom-6"
      } right-4 lg:right-6 z-[35] flex flex-col items-end gap-3 font-sans transition-all duration-300`}
    >
      {/* Expanded Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex flex-col gap-3 mb-2"
          >
            {contactOptions.map((opt, idx) => (
              <motion.a
                key={opt.name}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {/* Tooltip */}
                <span className="bg-white dark:bg-[#1D2530] text-black dark:text-[#F5F7FA] text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md border border-gray-100 dark:border-[#27313D] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
                  {opt.name}
                </span>
                {/* Icon Button */}
                <div className={`w-12 h-12 rounded-full ${opt.bgColor} ${opt.textColor} flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300`}>
                  <opt.icon size={20} />
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-black dark:bg-[#171D26] text-white dark:text-[#FFD600] hover:bg-[#FFDD00] dark:hover:bg-[#FFD600] hover:text-black dark:hover:text-[#101318] rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-colors duration-300 border border-white/10 dark:border-[#27313D]"
        aria-label="Contact Admin"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare size={24} />
              {/* Pulse Notification Dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default FloatingContact;
