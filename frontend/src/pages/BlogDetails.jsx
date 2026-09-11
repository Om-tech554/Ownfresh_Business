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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0B0F14]">
        <Loader2 className="w-12 h-12 animate-spin text-[#24672E] dark:text-[#FFD600]" />
        <p className="mt-4 text-gray-500 dark:text-[#818C9B] font-medium">Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#0B0F14]">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-[#F7F9FC]">Blog not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#24672E] dark:text-[#FFD600] hover:underline flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0B0F14] min-h-screen relative selection:bg-orange-100 dark:selection:bg-[#222B37] transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-500 dark:text-[#818C9B] hover:text-[#24672E] dark:hover:text-[#FFD600] transition-colors mb-10 font-medium cursor-pointer"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Insights
        </button>

        {/* ADMIN ACTION BUTTONS */}
        {userData?.role === "admin" && (
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={editBlog}
              className="flex items-center gap-2 bg-blue-50 dark:bg-[#151B23] border dark:border-[#27313D] text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-[#1D2530] transition cursor-pointer"
            >
              <Edit3 size={18} /> Edit
            </button>

            <button
              onClick={deleteBlog}
              className="flex items-center gap-2 bg-red-50 dark:bg-[#151B23] border dark:border-[#27313D] text-red-600 dark:text-red-400 px-4 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-[#1D2530] transition cursor-pointer"
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
        )}

        {/* BLOG CONTENT */}
        <article>
          {blog.image && (
            <div className="rounded-2xl mb-12 overflow-hidden shadow-sm border border-gray-100 dark:border-[#27313D] bg-gray-50 dark:bg-[#151B23]">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full max-h-[550px] object-contain mx-auto"
              />
            </div>
          )}

          <header className="mb-12 border-b border-gray-100 dark:border-[#202832] pb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-[#F7F9FC] mb-6">
              {blog.title}
            </h1>

            <div className="flex items-center gap-6 text-gray-500 dark:text-[#818C9B]">
              <span className="flex items-center gap-2 bg-gray-100 dark:bg-[#151B23] border dark:border-[#27313D] px-3 py-1 rounded-full text-xs font-bold uppercase text-gray-700 dark:text-[#B7C1CE]">
                <Calendar size={14} className="text-[#24672E] dark:text-[#FFD600]" />
                {new Date(blog.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </span>

              <span className="flex items-center gap-2 text-sm font-medium">
                <Clock size={16} /> Published
              </span>
            </div>
          </header>

          <div
            className="prose prose-lg max-w-none mb-10 text-gray-700 dark:text-[#B7C1CE] leading-relaxed dark:prose-headings:text-[#F7F9FC] dark:prose-strong:text-[#F5F7FA]"
            dangerouslySetInnerHTML={{ __html: blog.description }}
          />

          {/* GALLERY SLIDER (SLOTS 1-4) */}
          {[blog.image1, blog.image2, blog.image3, blog.image4].filter(Boolean).length > 0 && (
            <div className="mb-20 pt-8 border-t border-gray-100 dark:border-[#202832]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-[#F7F9FC] mb-4 uppercase tracking-wide">
                Gallery Slider
              </h3>
              <BlogImageSlider
                images={[blog.image1, blog.image2, blog.image3, blog.image4].filter(Boolean)}
                title={blog.title}
              />
            </div>
          )}
        </article>

        <footer className="mt-20 pt-10 border-t border-gray-100 dark:border-[#202832] flex flex-col items-center">
          <button
            onClick={goToTop}
            className="flex flex-col items-center gap-3 text-gray-400 dark:text-[#818C9B] hover:text-[#24672E] dark:hover:text-[#FFD600] transition-colors group cursor-pointer"
          >
            <div className="p-3 rounded-full border border-gray-200 dark:border-[#27313D] group-hover:border-[#24672E] dark:group-hover:border-[#FFD600] transition-all">
              <ChevronUp size={24} />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold">Scroll to Top</span>
          </button>
        </footer>
      </div>

      {/* FLOATING BUTTON */}
      <button
        onClick={goToTop}
        className={`fixed bottom-8 right-8 p-3 bg-[#24672E] dark:bg-[#FFD600] text-white dark:text-[#101318] rounded-full shadow-xl hover:bg-[#e64527] dark:hover:bg-[#FFE45C] transition-all z-50 cursor-pointer ${showTopBtn ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
};

export default AdminBlogDetails;
