import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from "lucide-react";

const BlogImageSlider = ({ images = [], title = "Blog Gallery" }) => {
  const validImages = images.filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Auto-cycle or reset index if images change
  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isZoomOpen && validImages.length <= 1) return;
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") setIsZoomOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomOpen, validImages.length, currentIndex]);

  if (validImages.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  return (
    <div className="my-10 w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative group">
      
      {/* ── MAIN IMAGE SLIDE STAGE ── */}
      <div className="relative w-full h-[320px] sm:h-[450px] md:h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={validImages[currentIndex]}
            alt={`${title} - slide ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full h-full object-contain cursor-pointer select-none"
            onClick={() => setIsZoomOpen(true)}
          />
        </AnimatePresence>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/15 flex items-center gap-1.5 shadow-md">
            <ImageIcon size={12} className="text-[#FFDD00]" />
            Slide {currentIndex + 1} of {validImages.length}
          </span>
        </div>

        {/* Lightbox Zoom Trigger Button */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white hover:bg-[#FFDD00] hover:text-black p-2.5 rounded-2xl border border-white/15 shadow-lg transition-all duration-200 cursor-pointer z-10"
          title="Zoom image"
        >
          <Maximize2 size={16} />
        </button>

        {/* Left / Right Arrow Navigation Buttons */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#1E971D] text-white p-2.5 sm:p-3.5 rounded-full backdrop-blur-md border border-white/15 shadow-2xl transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-10"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#1E971D] text-white p-2.5 sm:p-3.5 rounded-full backdrop-blur-md border border-white/15 shadow-2xl transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-10"
              aria-label="Next Slide"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Bottom Dot Pagination */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 z-10">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? "w-6 h-2 bg-[#FFDD00]"
                    : "w-2 h-2 bg-white/40 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── THUMBNAIL STRIP ── */}
      {validImages.length > 1 && (
        <div className="bg-slate-900/90 border-t border-slate-800 p-3 sm:p-4 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          {validImages.map((imgUrl, idx) => {
            const isSelected = currentIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-14 h-14 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#FFDD00] shadow-lg scale-105 opacity-100"
                    : "border-slate-700 opacity-50 hover:opacity-100 hover:border-slate-500"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ── FULLSCREEN ZOOM LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {isZoomOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 text-white hover:text-[#FFDD00] bg-white/10 hover:bg-white/20 p-3 rounded-full border border-white/20 transition-colors z-20 cursor-pointer"
            >
              <X size={24} />
            </button>

            {/* Lightbox Navigation */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white hover:text-black bg-white/10 hover:bg-[#FFDD00] p-3.5 sm:p-4 rounded-full border border-white/20 transition-all z-20 cursor-pointer"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white hover:text-black bg-white/10 hover:bg-[#FFDD00] p-3.5 sm:p-4 rounded-full border border-white/20 transition-all z-20 cursor-pointer"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Active Modal Image */}
            <motion.img
              key={currentIndex}
              src={validImages[currentIndex]}
              alt={`Zoomed slide ${currentIndex + 1}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            />

            {/* Modal Bottom Counter */}
            <div className="absolute bottom-6 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 text-xs font-black uppercase tracking-widest">
              Slide {currentIndex + 1} of {validImages.length}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogImageSlider;
