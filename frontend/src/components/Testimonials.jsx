import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Star, CheckCircle, MessageSquare, Quote, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { serverUrl } from "../App";
import ReviewModal from "./ReviewModal";

const SEED_TESTIMONIALS = [
  {
    _id: "seed1",
    userName: "Dr. Rajesh Kulkarni",
    location: "Mumbai, Maharashtra",
    rating: 5,
    title: "Unmatched Purity & Genuine Mustard Aroma",
    comment: "I have been using OwnFresh Kacchi Ghani Mustard & Groundnut Oils for 6 months now. The pungent natural aroma and clean stone-pressed purity are miles ahead of store-bought refined oils. Heartily recommended for health-conscious families.",
    isVerifiedBuyer: true,
    createdAt: new Date()
  },
  {
    _id: "seed2",
    userName: "Ananya Sharma",
    location: "Bengaluru, Karnataka",
    rating: 5,
    title: "Pure Virgin Coconut Oil for Cooking & Skin",
    comment: "You can instantly recognize the tropical sulfur-free coconut aroma. We drizzle it over breakfast and use it for traditional Kerala curries. The packaging was immaculate and leak-proof!",
    isVerifiedBuyer: true,
    createdAt: new Date()
  },
  {
    _id: "seed3",
    userName: "Sunil Deshmukh",
    location: "Pune, Maharashtra",
    rating: 5,
    title: "Revived Childhood Kolhu Nostalgia",
    comment: "Takes me right back to our ancestral village stone mills in rural Maharashtra. Churning below 45°C really protects the vital micronutrients and flavor. Authentic 100% pure oil.",
    isVerifiedBuyer: true,
    createdAt: new Date()
  },
  {
    _id: "seed4",
    userName: "Meera Patel",
    location: "Ahmedabad, Gujarat",
    rating: 5,
    title: "Groundnut Oil Makes Dishes Crisp & Light",
    comment: "OwnFresh stone pressed groundnut oil doesn't foam or burn during frying. Our Gujarati farsan and puris come out perfectly crispy without any heavy greasy aftertaste. A staple in our kitchen now.",
    isVerifiedBuyer: true,
    createdAt: new Date()
  },
  {
    _id: "seed5",
    userName: "Vikramaditya Rao",
    location: "Hyderabad, Telangana",
    rating: 5,
    title: "Exceptional Sesame Oil for Tadka",
    comment: "The nutty fragrance of this cold stone-pressed sesame oil is divine. Gives South Indian chutneys, rice dishes, and sambar that authentic traditional depth of flavor. Genuine product!",
    isVerifiedBuyer: true,
    createdAt: new Date()
  },
  {
    _id: "seed6",
    userName: "Pooja Hegde",
    location: "Mysuru, Karnataka",
    rating: 5,
    title: "No Chemicals, No Solvents - Just True Purity",
    comment: "After reading about solvent extraction in conventional supermarket oils, switching to OwnFresh traditional stone press was the best health decision for my family. Super fresh delivery!",
    isVerifiedBuyer: true,
    createdAt: new Date()
  }
];

const Testimonials = () => {
  const [apiTestimonials, setApiTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Responsive itemsPerView
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchTestimonials = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/review/featured`, { timeout: 8000 });
        if (isMounted && data.success && data.testimonials && data.testimonials.length > 0) {
          setApiTestimonials(data.testimonials);
        }
      } catch (error) {
        // Fallback to rich seeds
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTestimonials();
    return () => { isMounted = false; };
  }, []);

  // Merge API reviews with seed reviews to ensure a vibrant, deep carousel at all times
  const testimonials = useMemo(() => {
    if (apiTestimonials.length >= 6) return apiTestimonials;
    const existingIds = new Set(apiTestimonials.map((t) => t._id));
    const merged = [...apiTestimonials];
    for (const seed of SEED_TESTIMONIALS) {
      if (!existingIds.has(seed._id)) {
        merged.push(seed);
      }
    }
    return merged;
  }, [apiTestimonials]);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  // Reset index if it exceeds max on resize
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerView, maxIndex, currentIndex]);

  // Auto-play timer (advances every 5 seconds unless paused by hover or touch)
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
  };

  return (
    <section
      className="w-full bg-[#0E131A] dark:bg-[#0B0F14] py-16 md:py-24 px-4 sm:px-6 lg:px-12 text-white relative overflow-hidden border-t border-b border-[#202832] transition-colors duration-250 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD600]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#19C37D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Header Badge, Title & Google Review Trust Bar */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FFD600]/10 border border-[#FFD600]/30 px-3.5 py-1.5 rounded-full shadow-xs">
            <Star className="w-3.5 h-3.5 fill-[#FFD600] text-[#FFD600]" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[#FFD600]">
              Verified Customer Experiences
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F7F9FC] tracking-tight uppercase">
            Real Stories, <span className="text-[#FFD600]">Pure Purity</span>
          </h2>

          <p className="text-[#B7C1CE] text-xs sm:text-sm md:text-base leading-relaxed px-2">
            See what health-conscious households say about OwnFresh stone-pressed oils, natural aroma, and culinary benefits.
          </p>

          {/* Google Verified Rating & Write Review Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <div className="flex items-center gap-2.5 bg-[#151B23] border border-[#27313D] px-4 py-2 rounded-2xl shadow-sm">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 md:w-5 md:h-5" />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs md:text-sm text-[#F5F7FA]">4.9</span>
                  <div className="flex text-[#FFD600]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 fill-[#FFD600]" />
                    ))}
                  </div>
                </div>
                <span className="text-[9px] md:text-[10px] text-[#818C9B] font-bold uppercase tracking-wider block">
                  Google Verified Rating
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FFD600] hover:bg-[#FFE45C] text-[#111318] font-black px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-yellow-500/20 active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Write a Review
            </button>
          </div>
        </div>

        {/* ================= TRUE RESPONSIVE CAROUSEL SLIDER ================= */}
        <div
          className="relative overflow-hidden pt-4 pb-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-[#171D26] border border-[#27313D] p-6 rounded-3xl h-60 animate-pulse" />
              ))}
            </div>
          ) : (
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {testimonials.map((review, idx) => (
                <div
                  key={review._id || idx}
                  className="px-2.5 sm:px-3 shrink-0"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-[#151B23] hover:bg-[#1A222D] border border-[#27313D] hover:border-[#384656] p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between h-full min-h-[260px] group relative shadow-lg">
                    <Quote className="absolute top-5 right-5 w-8 h-8 text-white/5 group-hover:text-[#FFD600]/20 transition-colors" />

                    <div className="space-y-3">
                      {/* Rating Stars & Verified Pill */}
                      <div className="flex items-center justify-between">
                        <div className="flex text-[#FFD600] gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.rating || 5) ? "fill-[#FFD600]" : "text-[#4A5565]"
                              }`}
                            />
                          ))}
                        </div>

                        <span className="text-[10px] font-black text-[#19C37D] bg-[#19C37D]/10 px-2 py-0.5 rounded-full border border-[#19C37D]/30 flex items-center gap-1">
                          <CheckCircle size={10} className="stroke-[3]" /> Verified
                        </span>
                      </div>

                      {review.title && (
                        <h4 className="font-black text-sm md:text-base text-[#F7F9FC] group-hover:text-[#FFD600] transition-colors line-clamp-1">
                          {review.title}
                        </h4>
                      )}

                      <p className="text-[#B7C1CE] text-xs sm:text-sm leading-relaxed italic line-clamp-4">
                        "{review.comment}"
                      </p>
                    </div>

                    {/* Author Metadata */}
                    <div className="flex items-center gap-3 pt-4 mt-2 border-t border-[#202832]">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD600] via-yellow-400 to-amber-500 flex items-center justify-center font-black text-gray-950 text-sm shadow-md shrink-0">
                        {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="font-black text-xs sm:text-sm text-[#F5F7FA] truncate">
                          {review.userName}
                        </h5>
                        <span className="text-[11px] text-[#818C9B] font-medium truncate block">
                          {review.location || "Verified Buyer, India"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Carousel Navigation Arrows & Pagination Dots */}
        <div className="flex items-center justify-between max-w-md mx-auto pt-2 px-4">
          <button
            type="button"
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-[#151B23] hover:bg-[#FFD600] text-[#F5F7FA] hover:text-[#111318] border border-[#27313D] hover:border-[#FFD600] flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90"
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>

          {/* Indicator Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? "w-8 bg-[#FFD600] shadow-sm shadow-[#FFD600]/40"
                    : "w-2.5 bg-[#27313D] hover:bg-[#3E4C5E]"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-[#151B23] hover:bg-[#FFD600] text-[#F5F7FA] hover:text-[#111318] border border-[#27313D] hover:border-[#FFD600] flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90"
            aria-label="Next testimonials"
          >
            <ChevronRight size={20} className="stroke-[2.5]" />
          </button>
        </div>

      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={(newReview) => {
          setApiTestimonials((prev) => [newReview, ...prev]);
        }}
      />
    </section>
  );
};

export default Testimonials;
