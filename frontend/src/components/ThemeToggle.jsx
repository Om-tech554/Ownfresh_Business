import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 cursor-pointer select-none active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600] ${
        isDark
          ? "bg-[#171D26] hover:bg-[#1D2530] text-[#FFD600] border border-[#2A3441] shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
          : "bg-gray-100 hover:bg-gray-200 text-slate-800 border border-gray-200 shadow-xs"
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center justify-center text-[#FFD600]"
          >
            <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px] fill-[#FFD600]/20 stroke-[2.2]" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.7 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center justify-center text-amber-500"
          >
            <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2.2]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
