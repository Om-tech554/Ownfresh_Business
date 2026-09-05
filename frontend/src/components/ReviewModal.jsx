import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Star, X, CheckCircle, ExternalLink } from "lucide-react";
import { serverUrl } from "../App";

const GOOGLE_BUSINESS_REVIEW_URL = "https://g.page/r/myownfresh/review"; // Fallback Google Review link

const ReviewModal = ({ isOpen, onClose, productId = null, productName = "", onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("website"); // 'website' | 'google'

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error("Please enter your review comment");
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/review/add`,
        {
          productId,
          rating,
          title,
          comment,
          location
        },
        { withCredentials: true }
      );

      toast.success(data.message || "Review submitted successfully!");
      if (onReviewSubmitted) onReviewSubmitted(data.review);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review. Please log in first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black p-5 text-white flex justify-between items-center relative">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              {productName ? `Reviewing ${productName}` : "OwnFresh Customer Voice"}
            </span>
            <h3 className="text-xl font-bold mt-1 text-white">Write a Customer Review</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-gray-50 p-1.5 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab("website")}
            className={`flex-1 py-2 rounded-xl text-center transition-all ${
              activeTab === "website"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Website Review
          </button>
          <button
            onClick={() => setActiveTab("google")}
            className={`flex-1 py-2 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "google"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5" />
            Google Business Review
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === "google" ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Review Us on Google Business</h4>
              <p className="text-gray-600 text-xs leading-relaxed max-w-sm mx-auto">
                Love OwnFresh? Help others discover authentic stone pressed oils by leaving a 5-star review on Google!
              </p>
              <a
                href={GOOGLE_BUSINESS_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg w-full"
              >
                Open Google Business Review
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating Selector */}
              <div className="text-center bg-amber-50/60 border border-amber-200/50 p-4 rounded-xl space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Select Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          (hoverRating || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-800 block">
                  {rating === 5 && "⭐ Excellent - 5 Stars"}
                  {rating === 4 && "👍 Very Good - 4 Stars"}
                  {rating === 3 && "👌 Good - 3 Stars"}
                  {rating === 2 && "😐 Fair - 2 Stars"}
                  {rating === 1 && "👎 Poor - 1 Star"}
                </span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Review Headline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Purest oil, amazing taste & aroma!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience with OwnFresh products, quality, packaging, or health benefits..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your City / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-bold py-3 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
