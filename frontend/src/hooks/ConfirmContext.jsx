import React, { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle2, Trash2, X } from "lucide-react";

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: "",
    message: "",
    type: "confirm", // 'confirm', 'alert', 'danger', 'success'
    confirmText: "Confirm",
    cancelText: "Cancel",
  });
  const [resolveCallback, setResolveCallback] = useState(null);

  const confirm = (options) => {
    setIsOpen(true);
    setConfig({
      title: options.title || "Are you sure?",
      message: options.message || "",
      type: options.type || "confirm",
      confirmText: options.confirmText || (options.type === "alert" ? "OK" : "Confirm"),
      cancelText: options.cancelText || "Cancel",
    });
    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(false);
  };

  const getIcon = () => {
    switch (config.type) {
      case "danger":
        return <Trash2 className="w-10 h-10 text-red-600 bg-red-50 p-2 rounded-full" />;
      case "success":
        return <CheckCircle2 className="w-10 h-10 text-green-600 bg-green-50 p-2 rounded-full" />;
      case "alert":
        return <Info className="w-10 h-10 text-yellow-600 bg-yellow-50 p-2 rounded-full" />;
      default:
        return <AlertTriangle className="w-10 h-10 text-yellow-600 bg-yellow-50 p-2 rounded-full" />;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (config.type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-red-200";
      case "success":
        return "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-green-200";
      case "alert":
      default:
        return "bg-[#2F5D50] hover:bg-[#23463c] active:bg-[#1a352d] text-white shadow-emerald-200";
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={config.type !== "alert" ? handleCancel : undefined}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Close button for non-alert modal */}
              {config.type !== "alert" && (
                <button
                  onClick={handleCancel}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}

              {/* Icon */}
              <div className="mb-4">
                {getIcon()}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-playfair">
                {config.title}
              </h3>

              {/* Message */}
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {config.message}
              </p>

              {/* Buttons */}
              <div className="flex justify-center gap-3 w-full">
                {config.type !== "alert" && (
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all cursor-pointer hover:shadow-sm"
                  >
                    {config.cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-md ${getConfirmButtonStyles()}`}
                >
                  {config.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};
