import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight, BookOpen } from "lucide-react";
import SLink from "../components/SLink";

const BlogSection = ({ limit = null }) => {
  const [blogs, setBlogs] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/blog/all?limit=1000`);
      setBlogs(res.data.blogs || []);
    } catch (error) {
      console.log("Error loading blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ⭐ LIMIT LOGIC
  const displayedBlogs = limit ? blogs.slice(0, limit) : blogs;

  return (
    <div className="w-full bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-10 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-500 uppercase tracking-[0.3em] text-xs font-bold">
              Journal
            </span>
            <div className="h-1 w-10 bg-yellow-400 rounded-full"></div>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 text-center">
            Latest <span className="text-yellow-500">Insights</span>
          </h2>
        </div>

        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <BookOpen className="text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">No blogs available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedBlogs.map((blog) => (
              <SLink
                to={`/blog/${blog.slug || blog._id}`}
                key={blog._id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm 
                           hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
              >
                {/* Image */}
                <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png";
                    }}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    New Post
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-yellow-600 transition-colors line-clamp-2 leading-tight">
                    {blog.title}
                  </h3>

                  <p className="text-gray-500 mt-3 text-sm leading-relaxed flex-grow line-clamp-3">
                    {blog.description?.replace(/<[^>]+>/g, '')}
                  </p>

                  <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                      Reading Time: 5 min
                    </span>
                    <span className="flex items-center gap-1 text-gray-900 font-bold text-sm group-hover:text-yellow-500 transition-colors">
                      Read More
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </SLink>
            ))}
          </div>
        )}
      </div>

      {/* VIEW MORE BUTTON */}
      {limit && blogs.length > limit && (
        <div className="flex justify-center w-full pt-4 mt-6">
          <SLink
            to="/Oilinsights"
            className="flex items-center px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] 
                       text-[11px] bg-yellow-400 text-slate-900 shadow-xl shadow-yellow-200 
                       transition-all duration-300 hover:bg-slate-900 hover:text-white 
                       active:scale-95 border-2 border-transparent hover:border-slate-800 cursor-pointer"
          >
            View More Blogs
            <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
          </SLink>
        </div>
      )}
    </div>
  );
};

export default BlogSection;
