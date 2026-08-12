import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, CheckCircle, MessageSquare, ThumbsUp, Sparkles } from "lucide-react";
import { serverUrl } from "../App";
import ReviewModal from "./ReviewModal";

const ProductReviews = ({ productId, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [averageRating, setAverageRating] = useState(5.0);
  const [distribution, setDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/review/product/${productId}`);
        if (data.success) {
          setReviews(data.reviews || []);
          setTotalCount(data.totalCount || 0);
          setAverageRating(data.averageRating || 5.0);
          setDistribution(data.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        }
      } catch (error) {
        console.error("Fetch product reviews error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Customer Reviews</h3>
          <p className="text-xs text-gray-500 mt-1">Verified reviews from authentic OwnFresh buyers</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm self-start md:self-auto"
        >
          <MessageSquare className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Ratings Summary & Star Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 p-6 rounded-2xl">
        {/* Rating Score */}
        <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0">
          <span className="text-5xl font-black text-gray-900">{averageRating}</span>
          <div className="flex text-amber-400 my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.round(averageRating) ? "fill-amber-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-500">Based on {totalCount} reviews</span>
        </div>

        {/* Progress Bars */}
        <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : star === 5 ? 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-gray-700 flex items-center gap-1">
                  {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right font-semibold text-gray-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 space-y-3 bg-amber-50/50 rounded-2xl border border-amber-100/50">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="font-bold text-gray-900 text-sm">Be the first to review this product!</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Share your experience with {productName || "this item"} and help others make healthier choices.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 px-4 py-2 rounded-xl transition-all"
          >
            Leave a Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="p-5 rounded-2xl border border-gray-100 bg-white space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-400 font-black text-gray-950 flex items-center justify-center text-xs">
                    {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-xs text-gray-900">{review.userName}</h5>
                      {review.isVerifiedBuyer && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{review.location || "India"}</span>
                  </div>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
              </div>

              {review.title && <h6 className="font-bold text-xs text-gray-900">{review.title}</h6>}
              <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        productName={productName}
        onReviewSubmitted={(newReview) => {
          setReviews((prev) => [newReview, ...prev]);
          setTotalCount((prev) => prev + 1);
        }}
      />
    </div>
  );
};

export default ProductReviews;
