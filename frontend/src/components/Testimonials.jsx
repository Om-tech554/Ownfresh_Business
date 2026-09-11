import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, CheckCircle, MessageSquare, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { serverUrl } from "../App";
import ReviewModal from "./ReviewModal";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/review/featured`);
        if (data.success && data.testimonials) {
          setTestimonials(data.testimonials);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleNext = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="w-full bg-[#111720] py-12 md:py-24 px-4 md:px-12 text-white relative overflow-hidden border-t border-b border-[#202832] transition-colors duration-200">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD600]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FFD600]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 relative z-10">
        {/* Header Badge & Title */}
        <div className="text-center space-y-3 md:space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FFD600]/10 border border-[#FFD600]/30 px-3 py-1 md:px-3.5 md:py-1.5 rounded-full">
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-[#FFD600] text-[#FFD600]" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#FFD600]">
              Trusted by 10,000+ Happy Families
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#F7F9FC] tracking-tight">
            Real Stories, <span className="text-[#FFD600]">Pure Purity</span>
          </h2>

          <p className="text-[#B7C1CE] text-xs sm:text-sm md:text-base leading-relaxed px-2">
            See what health-conscious households say about OwnFresh stone-pressed oils, aroma, and natural health benefits.
          </p>

          {/* Google & Web Review Trust Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 pt-1">
            <div className="flex items-center gap-2 bg-[#151B23] border border-[#27313D] px-3.5 py-1.5 md:px-4 md:py-2 rounded-2xl">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 md:w-5 md:h-5" />
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-xs md:text-sm text-[#F5F7FA]">4.9</span>
                  <div className="flex text-[#FFD600]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 fill-[#FFD600]" />
                    ))}
                  </div>
                </div>
                <span className="text-[9px] md:text-[10px] text-[#818C9B] font-semibold block">Google Verified Rating</span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FFD600] hover:bg-[#FFE45C] text-gray-950 font-extrabold px-4 py-2 md:px-5 md:py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-lg hover:shadow-yellow-500/20 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Write a Review
            </button>
          </div>
        </div>

        {/* ================= MOBILE SLIDER VIEW (< 768px) ================= */}
        <div className="block md:hidden">
          {loading ? (
            <div className="bg-[#171D26] border border-[#27313D] p-6 rounded-3xl h-52 animate-pulse" />
          ) : testimonials.length > 0 ? (
            <div className="space-y-4">
              {/* Single Active Card */}
              <div className="bg-[#171D26] border border-[#27313D] p-5 rounded-3xl transition-all flex flex-col justify-between space-y-4 group relative min-h-[220px]">
                <Quote className="absolute top-4 right-4 w-7 h-7 text-white/5" />

                <div className="space-y-2.5">
                  {/* Rating Stars */}
                  <div className="flex text-[#FFD600] gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < testimonials[activeIndex].rating ? "fill-[#FFD600]" : "text-[#5E6875]"}`}
                      />
                    ))}
                  </div>

                  {testimonials[activeIndex].title && (
                    <h4 className="font-bold text-sm text-[#F7F9FC]">
                      {testimonials[activeIndex].title}
                    </h4>
                  )}

                  <p className="text-[#B7C1CE] text-xs leading-relaxed italic">
                    "{testimonials[activeIndex].comment}"
                  </p>
                </div>

                {/* Author Metadata */}
                <div className="flex items-center justify-between pt-3 border-t border-[#202832]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD600] to-yellow-500 flex items-center justify-center font-black text-gray-950 text-xs shadow-md">
                      {testimonials[activeIndex].userName ? testimonials[activeIndex].userName.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <h5 className="font-bold text-xs text-[#F5F7FA]">{testimonials[activeIndex].userName}</h5>
                        {testimonials[activeIndex].isVerifiedBuyer && (
                          <CheckCircle className="w-3 h-3 text-[#19C37D]" title="Verified Customer" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#818C9B] block">{testimonials[activeIndex].location || "India"}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#FFD600] bg-[#FFD600]/10 px-2 py-0.5 rounded-full border border-[#FFD600]/20">
                    Verified Review
                  </span>
                </div>
              </div>

              {/* Mobile Carousel Controls & Pagination Dots */}
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-full bg-[#151B23] hover:bg-[#222B37] active:scale-95 flex items-center justify-center text-[#F5F7FA] border border-[#27313D] transition-all cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Pagination Dots */}
                <div className="flex items-center gap-1.5">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeIndex === idx ? "w-6 bg-[#FFD600]" : "w-2 bg-[#27313D]"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="w-9 h-9 rounded-full bg-[#151B23] hover:bg-[#222B37] active:scale-95 flex items-center justify-center text-[#F5F7FA] border border-[#27313D] transition-all cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* ================= DESKTOP GRID VIEW (>= 768px) ================= */}
        <div className="hidden md:block">
          {loading ? (
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-[#171D26] border border-[#27313D] p-6 rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {testimonials.map((review) => (
                <div
                  key={review._id}
                  className="bg-[#171D26] hover:bg-[#1C232D] border border-[#27313D] hover:border-[#34404E] p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between space-y-4 group relative shadow-md hover:-translate-y-1"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 group-hover:text-[#FFD600]/20 transition-colors" />

                  <div className="space-y-3">
                    {/* Rating Stars */}
                    <div className="flex text-[#FFD600] gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "fill-[#FFD600]" : "text-[#5E6875]"}`}
                        />
                      ))}
                    </div>

                    {review.title && (
                      <h4 className="font-bold text-base text-[#F7F9FC] group-hover:text-[#FFD600] transition-colors">
                        {review.title}
                      </h4>
                    )}

                    <p className="text-[#B7C1CE] text-xs md:text-sm leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Author Metadata */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#202832]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD600] to-yellow-500 flex items-center justify-center font-black text-gray-950 text-sm shadow-md">
                      {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-sm text-[#F5F7FA]">{review.userName}</h5>
                        {review.isVerifiedBuyer && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#19C37D]" title="Verified Customer" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#818C9B]">{review.location || "India"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={(newReview) => {
          setTestimonials((prev) => [newReview, ...prev]);
        }}
      />
    </section>
  );
};

export default Testimonials;
