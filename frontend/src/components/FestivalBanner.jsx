import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tag, Clock, ChevronRight, ChevronLeft, Copy, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { serverUrl } from "../App";

// Typewriter effect that reveals description word by word
const TypewriterText = ({ text }) => {
  const words = text ? text.split(" ") : [];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (words.length === 0) return;
    
    let isMounted = true;
    let timer;
    
    const run = (currentCount) => {
      if (!isMounted) return;
      
      if (currentCount <= words.length) {
        setVisibleCount(currentCount);
        timer = setTimeout(() => {
          run(currentCount + 1);
        }, 250); // Speed: 250ms per word
      } else {
        // Wait 5 seconds, then restart
        timer = setTimeout(() => {
          if (isMounted) {
            run(0);
          }
        }, 5000);
      }
    };
    
    run(0);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [text]);

  return (
    <span className="font-semibold text-slate-100 leading-relaxed text-xs sm:text-sm md:text-base">
      {words.slice(0, visibleCount).map((word, idx) => (
        <motion.span
          key={`${idx}-${word}`}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
      <span className="animate-pulse ml-0.5 text-[#FFDD00] font-extrabold inline-block">|</span>
    </span>
  );
};

const FestivalBanner = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const autoPlayRef = useRef(null);

  const fetchActiveCampaigns = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/campaign/active`);
      if (res.data && res.data.success && res.data.campaigns && res.data.campaigns.length > 0) {
        setCampaigns(res.data.campaigns);
      } else {
        setCampaigns([]);
      }
    } catch (err) {
      console.error("Error fetching active campaign banner:", err.message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCampaigns();
  }, []);

  // Flatten active campaigns and their respective images into individual slides
  const slides = useMemo(() => {
    return campaigns.flatMap((campaign) => {
      const images = [campaign.bannerImage, campaign.mobileBannerImage].filter(Boolean);
      return images.map((img) => ({
        campaign,
        image: img
      }));
    });
  }, [campaigns]);

  useEffect(() => {
    if (slides.length === 0) return;
    const currentSlide = slides[activeIndex];
    const currentCampaign = currentSlide?.campaign;
    if (!currentCampaign || !currentCampaign.endDate || !currentCampaign.showCountdown) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(currentCampaign.endDate) - +new Date();
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
        fetchActiveCampaigns();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [slides, activeIndex]);

  useEffect(() => {
    if (slides.length <= 1 || isHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [slides.length, isHovered]);

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard! 📋`, {
      style: { borderRadius: "10px", background: "#181818", color: "#FFDD00" }
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setActiveIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handleNavigate = () => {
    const currentSlide = slides[activeIndex];
    const currentCampaign = currentSlide?.campaign;
    if (currentCampaign?.ctaUrl) {
      navigate(currentCampaign.ctaUrl);
    }
  };

  if (loading || slides.length === 0) {
    return null; // Graceful degradation
  }

  const currentSlide = slides[activeIndex];
  const currentCampaign = currentSlide.campaign;
  const currentImage = currentSlide.image;
  const promo = currentCampaign.promoCode;
  const isPercentage = promo?.discountType === "PERCENTAGE" || promo?.discountType === "percentage";
  const discountText = promo ? (isPercentage ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`) : "";
  const maxCapText = promo?.maximumDiscountAmount ? `Up to ₹${promo.maximumDiscountAmount} OFF` : "";

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={handleNavigate}
        className="rounded-2xl md:rounded-[36px] overflow-hidden shadow-2xl border border-[#24672E]/15 bg-white flex flex-col cursor-pointer relative w-full h-auto transition-all duration-300 hover:shadow-[#24672E]/10 hover:border-[#24672E]/30"
      >
        {/* 1. Main Slide Image (Cycles individual uploaded images) */}
        <div className="w-full h-auto flex items-center justify-center select-none relative z-10 bg-slate-50 border-b border-[#24672E]/10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`slide-${activeIndex}-${currentImage}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
              className="w-full h-auto flex items-center justify-center"
            >
              <img
                src={currentImage}
                alt={`${currentCampaign.festivalName} Promo Flyer`}
                className="w-full h-auto object-contain max-h-[220px] sm:max-h-[360px] md:max-h-[500px]"
              />
            </motion.div>
          </AnimatePresence>


          {/* Slide Indicator Dots (floating just above the bottom bar) */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {slides.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    index === activeIndex
                      ? "bg-[#24672E] w-5 shadow-sm"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2. Lower Part: Bottom Bar */}
        <div className="w-full bg-[#24672E] p-3.5 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
          {/* Left section: Offer badge + Typewriter description */}
          <div className="flex items-center gap-3 w-full md:w-auto min-h-[32px]">
            {/* Blinking Offer Badge */}
            <span className="bg-[#FFDD00] text-[#24672E] text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,221,0,0.3)] animate-pulse border border-[#FFDD00]/20 shrink-0 select-none">
              <span className="h-1.5 w-1.5 bg-[#24672E] rounded-full animate-ping shrink-0"></span>
              🎉 OFFER
            </span>

            {/* Typewriter Description */}
            <div className="flex-1 text-slate-100">
              {currentCampaign.description ? (
                <TypewriterText text={currentCampaign.description} />
              ) : (
                <span className="text-slate-200 italic text-xs sm:text-sm md:text-base">Special Festive Offer!</span>
              )}
            </div>
          </div>

          {/* Right section: Coupon + Countdown + CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-end shrink-0">
            {/* Coupon Code copy button */}
            {promo?.code && (
              <button
                type="button"
                onClick={(e) => handleCopyCode(e, promo.code)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#FFDD00]/50 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer shrink-0"
                title="Click to copy coupon code"
              >
                <Tag size={12} className="text-[#FFDD00] animate-pulse" />
                <span>Use Code: {promo.code}</span>
                <div className="h-3 w-[1px] bg-white/20 mx-1.5" />
                {copiedCode === promo.code ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Copy size={12} className="text-slate-300 hover:text-white" />
                )}
              </button>
            )}

            {/* Countdown timer */}
            {currentCampaign.showCountdown && timeLeft && (
              <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 bg-black/20 border border-white/10 px-3.5 py-2 rounded-xl shadow-md shrink-0">
                <Clock size={12} className="text-[#FFDD00]" />
                <div className="flex items-center gap-1 font-black text-[#FFDD00] text-xs">
                  <span>{String(timeLeft.days).padStart(2, "0")}d</span>:
                  <span>{String(timeLeft.hours).padStart(2, "0")}h</span>:
                  <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>:
                  <span>{String(timeLeft.seconds).padStart(2, "0")}s</span>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="shrink-0 w-full sm:w-auto">
              <button
                type="button"
                className="w-full bg-[#FFDD00] hover:bg-yellow-400 text-[#24672E] text-xs font-black px-6 py-2.5 rounded-full uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg hover:shadow-yellow-500/10 active:scale-95 cursor-pointer"
              >
                <span>{currentCampaign.ctaText || "Shop Now"}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalBanner;
