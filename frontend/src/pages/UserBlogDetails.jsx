import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Loader2, Calendar, Clock, ChevronUp } from "lucide-react";

const UserBlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Handle scroll visibility for the button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchBlog = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/blog/${id}`);
      setBlog(res.data.blog);
    } catch (error) {
      console.log("Error loading blog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#ff4d2d]" />
        <p className="mt-4 text-gray-500 font-medium">Fetching the story...</p>
      </div>
    );

  if (!blog)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold">Blog not found</h2>
        <button onClick={() => navigate(-1)} className="text-[#ff4d2d] mt-4 flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    );

  return (
    <div className="bg-white min-h-screen relative">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-500 hover:text-[#ff4d2d] transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </button>

        <article>
          <div className="rounded-2xl mb-10 overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full max-h-[500px] object-contain"
            />
          </div>

          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              {blog.title}
            </h1>

            <div className="flex items-center gap-6 text-gray-500 border-b border-gray-100 pb-8">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#ff4d2d]" />
                <span className="text-sm">
                  {new Date(blog.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#ff4d2d]" />
                <span className="text-sm">Read Article</span>
              </div>
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg md:text-xl leading-[1.8] whitespace-pre-line">
              {blog.description}
            </p>
          </div>
        </article>

        {/* Improved Footer Section */}
        <footer className="mt-20 pt-10 border-t border-gray-100 flex flex-col items-center">
          <div className="flex gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          </div>
          
          <button
            onClick={goToTop}
            className="flex flex-col items-center gap-2 text-gray-400 hover:text-[#ff4d2d] transition-colors group"
          >
            <div className="p-3 rounded-full border border-gray-200 group-hover:border-[#ff4d2d] transition-colors">
              <ChevronUp size={24} />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold">Back to Top</span>
          </button>
        </footer>
      </div>

      {/* Floating Scroll to Top Button (Mobile & Desktop) */}
      <div 
        className={`fixed bottom-8 right-8 transition-all duration-300 transform ${
          showTopBtn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={goToTop}
          className="p-3 bg-[#ff4d2d] text-white rounded-full shadow-lg hover:bg-[#e64527] hover:scale-110 active:scale-95 transition-all"
          title="Go to top"
        >
          <ChevronUp size={24} />
        </button>
      </div>
    </div>
  );
};

export default UserBlogDetails;