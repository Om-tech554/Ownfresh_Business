import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Star, CheckCircle, XCircle, Trash2, Award, Search, Filter } from "lucide-react";

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/review/admin/all`, {
        withCredentials: true
      });
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Fetch admin reviews error:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id, status, isFeatured) => {
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/review/admin/status/${id}`,
        { status, isFeatured },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Review updated successfully");
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/review/admin/${id}`, {
        withCredentials: true
      });
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Review & Testimonials Management</h2>
          <p className="text-xs text-gray-500 mt-1">Approve, feature, or moderate customer reviews</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews Table / Cards */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl animate-pulse font-bold text-gray-400">
          Loading reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-400 font-medium">
          No reviews found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between gap-4 ${
                review.isFeatured ? "border-amber-400/80 bg-amber-50/20" : "border-gray-100"
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Rating */}
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-amber-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      review.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : review.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {review.status}
                  </span>

                  {review.isFeatured && (
                    <span className="text-[10px] font-extrabold bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" /> Featured Testimonial
                    </span>
                  )}
                </div>

                {review.title && <h4 className="font-bold text-sm text-gray-900">{review.title}</h4>}
                <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>

                <div className="text-[11px] text-gray-400 flex flex-wrap gap-3 pt-1">
                  <span>
                    <strong>Author:</strong> {review.userName} ({review.location || "India"})
                  </span>
                  {review.product && (
                    <span>
                      <strong>Product:</strong> {review.product?.name || "Specified Item"}
                    </span>
                  )}
                  <span>
                    <strong>Date:</strong> {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handleUpdateStatus(review._id, review.status, !review.isFeatured)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                    review.isFeatured
                      ? "bg-amber-400 text-gray-950 border-amber-400"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                  title="Toggle Featured Testimonial"
                >
                  <Award className="w-4 h-4" />
                </button>

                {review.status !== "APPROVED" && (
                  <button
                    onClick={() => handleUpdateStatus(review._id, "APPROVED", review.isFeatured)}
                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}

                {review.status !== "REJECTED" && (
                  <button
                    onClick={() => handleUpdateStatus(review._id, "REJECTED", review.isFeatured)}
                    className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl border border-amber-200 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}

                <button
                  onClick={() => handleDelete(review._id)}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl border border-red-200 transition-all"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewManager;
