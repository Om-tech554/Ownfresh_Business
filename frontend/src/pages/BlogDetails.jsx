import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { ArrowLeft, Loader2, Calendar, Clock, ChevronUp, Edit3, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "../hooks/ConfirmContext.jsx";
import BlogImageSlider from "../components/BlogImageSlider";

const AdminBlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const userData = useSelector((state) => state.user.userData);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

  // SECURITY: If not admin → redirect
  useEffect(() => {
    if (userData?.role !== "admin") navigate("/");
  }, [userData]);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const fetchBlog = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/blog/${id}`);
      setBlog(res.data.blog);
    } catch (error) {
      console.error("Error loading blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async () => {
    const confirmed = await confirm({
      title: "Delete Blog",
      message: "Are you sure you want to delete this blog permanently?",
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (!confirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/blog/delete/${id}`);
      navigate("/blogs");
    } catch (err) {
      toast.error("Failed to delete blog");
    }
  };

  const editBlog = () => {
    navigate(`/admin/blog/editor/${id}`);
  };

  useEffect(() => fetchBlog(), [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#24672E]" />
        <p className="mt-4 text-gray-500 font-medium">Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Blog not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#24672E] hover:underline flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen relative selection:bg-orange-100">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-500 hover:text-[#24672E] transition-colors mb-10 font-medium"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Insights
        </button>

        {/* ADMIN ACTION BUTTONS */}
        {userData?.role === "admin" && (
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={editBlog}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition"
            >
              <Edit3 size={18} /> Edit
            </button>

            <button
              onClick={deleteBlog}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition"
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
        )}

        {/* BLOG CONTENT */}
        <article>
          {blog.image && (
            <div className="rounded-2xl mb-12 overflow-hidden shadow-sm border bg-gray-50">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full max-h-[550px] object-contain mx-auto"
              />
            </div>
          )}

          <header className="mb-12 border-b border-gray-100 pb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              {blog.title}
            </h1>

            <div className="flex items-center gap-6 text-gray-500">
              <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
                <Calendar size={14} className="text-[#24672E]" />
                {new Date(blog.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </span>

              <span className="flex items-center gap-2 text-sm font-medium">
                <Clock size={16} /> Published
              </span>
            </div>
          </header>

          <div
            className="prose prose-lg max-w-none mb-10 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.description }}
          />

          {/* GALLERY SLIDER (SLOTS 1-4) */}
          {[blog.image1, blog.image2, blog.image3, blog.image4].filter(Boolean).length > 0 && (
            <div className="mb-20 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
                Gallery Slider
              </h3>
              <BlogImageSlider
                images={[blog.image1, blog.image2, blog.image3, blog.image4].filter(Boolean)}
                title={blog.title}
              />
            </div>
          )}
        </article>

        <footer className="mt-20 pt-10 border-t border-gray-100 flex flex-col items-center">
          <button
            onClick={goToTop}
            className="flex flex-col items-center gap-3 text-gray-400 hover:text-[#24672E] transition-colors group"
          >
            <div className="p-3 rounded-full border border-gray-200 group-hover:border-[#24672E] transition-all">
              <ChevronUp size={24} />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold">Scroll to Top</span>
          </button>
        </footer>
      </div>

      {/* FLOATING BUTTON */}
      <button
        onClick={goToTop}
        className={`fixed bottom-8 right-8 p-3 bg-[#24672E] text-white rounded-full shadow-xl hover:bg-[#e64527] transition-all z-50 ${showTopBtn ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
};

export default AdminBlogDetails;
