
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Tag, Share2, AlertCircle, Loader2 } from "lucide-react";
// Note: Install react-hot-toast for the toast logic below
import { toast, Toaster } from "react-hot-toast"; 

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/blog/${id}`);
      setBlog(res.data.blog);
    } catch (err) {
      toast.error("Article not found or server error", {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 text-[#ff4d2d] animate-spin mb-4" />
      <p className="text-slate-500 font-medium animate-pulse">Loading technical data...</p>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800">Post Not Found</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-[#ff4d2d] font-semibold flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to List
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-[#ff4d2d] transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Insights
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard!");
            }}
            className="p-2 hover:bg-slate-100 rounded-full transition-all"
          >
            <Share2 className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#ff4d2d]/10 text-[#ff4d2d] text-xs font-bold uppercase tracking-widest rounded-full">
            <Tag className="w-3 h-3" /> {blog.category || "Industry News"}
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Clock className="w-4 h-4" /> 5 min read
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.15] mb-8 tracking-tight">
          {blog.title}
        </h1>

        {/* Featured Image - DESIGNED NOT TO CUT */}
        <div className="relative group w-full mb-12 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
          <div className="absolute inset-0 bg-slate-200 opacity-20" />
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-auto max-h-[600px] object-contain mx-auto transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>

        {/* Article Body */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-10 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
              OB
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Oil Business Editorial</p>
              <p className="text-xs text-slate-500">Technical Analysis Division</p>
            </div>
          </div>

          <div className="prose prose-slate lg:prose-xl max-w-none">
            <p className="text-slate-700 text-lg md:text-xl leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-[#ff4d2d] first-letter:mr-3 first-letter:float-left">
              {blog.description}
            </p>
          </div>

          {/* Footer Tags */}
          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
            {['Energy', 'Oil & Gas', 'Industry Update'].map(tag => (
              <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-500 text-sm rounded-lg border border-slate-100 italic">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* Industrial Accent Bottom Bar */}
      <div className="h-2 w-full flex">
        <div className="h-full flex-1 bg-[#ff4d2d]"></div>
        <div className="h-full flex-1 bg-slate-900"></div>
        <div className="h-full flex-1 bg-[#ff4d2d]"></div>
      </div>
    </div>
  );
};

export default BlogDetails;