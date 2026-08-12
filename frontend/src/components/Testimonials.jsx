import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, CheckCircle, MessageSquare, Quote, ThumbsUp } from "lucide-react";
import { serverUrl } from "../App";
import ReviewModal from "./ReviewModal";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <section className="w-full bg-slate-900 py-16 md:py-24 px-4 md:px-12 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header Badge & Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Trusted by 10,000+ Happy Families
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Real Stories, <span className="text-amber-400">Pure Purity</span>
          </h2>

          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            See what health-conscious households say about OwnFresh stone-pressed oils, aroma, and natural health benefits.
          </p>

          {/* Google & Web Review Trust Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-sm text-white">4.9</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold">Google Verified Rating</span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-400/20"
            >
              <MessageSquare className="w-4 h-4" />
              Write a Review
            </button>
          </div>

          {/* Mobile Swipe Cue */}
          <div className="flex md:hidden items-center justify-center gap-1 text-[11px] font-bold text-amber-400/90 tracking-wide pt-1 animate-pulse">
            <span>Swipe left to view reviews</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Testimonials Horizontal Swipe Carousel on Mobile / Grid on Desktop */}
        {loading ? (
          <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-4 scrollbar-none">
            {[1, 2, 3].map((n) => (
              <div key={n} className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 bg-white/5 border border-white/10 p-6 rounded-2xl h-48 animate-pulse shrink-0 md:shrink" />
            ))}
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            {testimonials.map((review) => (
              <div
                key={review._id}
                className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 snap-center bg-white/5 hover:bg-white/[0.08] border border-white/10 p-6 rounded-3xl transition-all flex flex-col justify-between space-y-4 group relative shrink-0 md:shrink"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 group-hover:text-amber-400/20 transition-colors" />

                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-amber-400" : "text-gray-600"}`}
                      />
                    ))}
                  </div>

                  {review.title && (
                    <h4 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                      {review.title}
                    </h4>
                  )}

                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>

                {/* Author Metadata */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center font-black text-gray-950 text-sm shadow-md">
                    {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-sm text-white">{review.userName}</h5>
                      {review.isVerifiedBuyer && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" title="Verified Customer" />
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400">{review.location || "India"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
