import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tag, Clock, ChevronRight, X, Copy, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { serverUrl } from "../App";

const MarketingPopUp = () => {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const fetchActivePopupCampaign = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/campaign/active`);
      if (res.data && res.data.success && res.data.campaigns && res.data.campaigns.length > 0) {
        // Find first active campaign targeted for "pop_up" location
        const popupCampaign = res.data.campaigns.find(
          (c) => c.displayLocation === "pop_up"
        );

        if (popupCampaign) {
          // Check if user has already dismissed this specific campaign
          const isDismissed = localStorage.getItem(`popup_dismissed_${popupCampaign._id}`);
          if (!isDismissed) {
            setCampaign(popupCampaign);
            setIsOpen(true);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching active popup campaign:", err.message);
    }
  };

  useEffect(() => {
    fetchActivePopupCampaign();
  }, []);

  // Countdown timer calculations
  useEffect(() => {
    if (!campaign || !campaign.endDate || !campaign.showCountdown) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(campaign.endDate) - +new Date();
      if (difference <= 0) return null;

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) {
        clearInterval(timer);
        setIsOpen(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [campaign]);

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard! 📋`, {
      style: { borderRadius: "10px", background: "#181818", color: "#FFDD00" }
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (campaign) {
      // Store dismiss state so it doesn't show again on next refresh
      localStorage.setItem(`popup_dismissed_${campaign._id}`, "true");
    }
    setIsOpen(false);
  };

  const handleNavigate = () => {
    if (campaign?.ctaUrl) {
      if (campaign) {
        localStorage.setItem(`popup_dismissed_${campaign._id}`, "true");
      }
      setIsOpen(false);
      navigate(campaign.ctaUrl);
    }
  };

  if (!isOpen || !campaign) return null;

  const promo = campaign.promoCode;
  const isPercentage = promo?.discountType === "PERCENTAGE" || promo?.discountType === "percentage";
  const discountText = promo ? (isPercentage ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`) : "";
  const maxCapText = promo?.maximumDiscountAmount ? `Up to ₹${promo.maximumDiscountAmount} OFF` : "";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10 flex flex-col"
        >
          
          {/* Close button at top right */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/15 transition-all active:scale-95 cursor-pointer"
            aria-label="Close marketing modal"
          >
            <X size={16} />
          </button>

          {/* Marketing Image (Fitted aspect ratio - NEVER CUT) */}
          <div className="relative w-full bg-slate-950/45 flex items-center justify-center min-h-[220px]">
            <img
              src={campaign.mobileBannerImage || campaign.bannerImage}
              alt={campaign.title}
              className="w-full h-auto max-h-[50vh] object-contain select-none pointer-events-none"
            />
          </div>

          {/* Modal details */}
          <div className="p-5 md:p-6 flex flex-col space-y-4 text-left">
            
            {/* Festival tag and Discount badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#FFDD00] text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm select-none">
                🪔 {campaign.festivalName} Offer
              </span>
              {discountText && (
                <span className="text-[#FFDD00] text-xs font-black uppercase tracking-wider">
                  {discountText} {maxCapText && `(${maxCapText})`}
                </span>
              )}
            </div>

            {/* Campaign Title & Description */}
            <div className="space-y-1">
              <h2 className="text-white text-base md:text-lg font-black tracking-tight leading-tight">
                {campaign.title}
              </h2>
              {campaign.description && (
                <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                  {campaign.description}
                </p>
              )}
            </div>

            {/* Coupon Code copy widget */}
            {promo?.code && (
              <button
                type="button"
                onClick={(e) => handleCopyCode(e, promo.code)}
                className="flex items-center justify-between bg-slate-800/80 border border-slate-700/85 hover:border-[#FFDD00] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer w-full"
                title="Click to copy coupon code"
              >
                <div className="flex items-center gap-2">
                  <Tag size={12} className="text-[#FFDD00]" />
                  <span>Use Code: {promo.code}</span>
                </div>
                {copiedCode === promo.code ? (
                  <Check size={12} className="text-green-400 shrink-0" />
                ) : (
                  <Copy size={12} className="text-slate-300 hover:text-white shrink-0" />
                )}
              </button>
            )}

            {/* Countdown timer & CTA Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10 w-full">
              {campaign.showCountdown && timeLeft ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl shadow-md shrink-0 w-full sm:w-auto justify-center">
                  <Clock size={12} className="text-[#FFDD00]" />
                  <div className="flex items-center gap-1 font-black text-[#FFDD00] text-[10px] md:text-xs">
                    <span>{String(timeLeft.days).padStart(2, "0")}d</span>:
                    <span>{String(timeLeft.hours).padStart(2, "0")}h</span>:
                    <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>:
                    <span>{String(timeLeft.seconds).padStart(2, "0")}s</span>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:block" />
              )}

              <button
                type="button"
                onClick={handleNavigate}
                className="w-full sm:w-auto bg-[#FFDD00] hover:bg-yellow-400 text-black text-xs font-black px-6 py-2.5 rounded-full uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-lg hover:shadow-yellow-500/20 active:scale-95 cursor-pointer ml-auto"
              >
                <span>{campaign.ctaText || "Shop Now"}</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MarketingPopUp;
