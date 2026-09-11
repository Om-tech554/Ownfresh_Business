import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight, BookOpen } from "lucide-react";
import SLink from "../components/SLink";

const BlogSection = ({ limit = null }) => {
  const [blogs, setBlogs] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

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
    <div className="w-full bg-gray-50 dark:bg-[#0B0F14] py-20 transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-10 bg-yellow-400 dark:bg-[#FFD600] rounded-full"></div>
            <span className="text-gray-500 dark:text-[#818C9B] uppercase tracking-[0.3em] text-xs font-bold">
              Journal
            </span>
            <div className="h-1 w-10 bg-yellow-400 dark:bg-[#FFD600] rounded-full"></div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-[#F7F9FC] text-center uppercase tracking-tight font-serif">
            Latest <span className="text-yellow-500 dark:text-[#FFD600]">Insights</span>
          </h2>
        </div>

        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#171D26] rounded-3xl border-2 border-dashed border-gray-200 dark:border-[#27313D]">
            <BookOpen className="text-gray-300 dark:text-[#818C9B] mb-4" size={48} />
            <p className="text-gray-500 dark:text-[#B7C1CE] font-medium">No blogs available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedBlogs.map((blog) => (
              <SLink
                to={`/blog/${blog.slug || blog._id}`}
                key={blog._id}
                className="group bg-white dark:bg-[#171D26] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#27313D] shadow-sm 
                           hover:shadow-xl hover:-translate-y-1 hover:dark:bg-[#1D2530] hover:dark:border-[#34404E] transition-all duration-300 flex flex-col h-full cursor-pointer"
              >
                {/* Image */}
                <div className="relative w-full h-56 bg-gray-100 dark:bg-[#151B23] overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png";
                    }}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 dark:mix-blend-normal"
                  />
                  <div className="absolute top-4 left-4 bg-yellow-400 dark:bg-[#FFD600] text-gray-900 dark:text-[#111318] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    New Post
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-[#F5F7FA] group-hover:text-yellow-600 dark:group-hover:text-[#FFD600] transition-colors line-clamp-2 leading-tight">
                    {blog.title}
                  </h3>

                  <p className="text-gray-500 dark:text-[#B7C1CE] mt-3 text-sm leading-relaxed flex-grow line-clamp-3">
                    {blog.description?.replace(/<[^>]+>/g, '')}
                  </p>

                  <div className="mt-6 pt-5 border-t border-gray-50 dark:border-[#202832] flex items-center justify-between">
                    <span className="text-gray-400 dark:text-[#818C9B] text-xs font-medium uppercase tracking-wider">
                      Reading Time: 5 min
                    </span>
                    <span className="flex items-center gap-1 text-gray-900 dark:text-[#F7F9FC] font-bold text-sm group-hover:text-yellow-500 dark:group-hover:text-[#FFD600] transition-colors">
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
            className="group inline-flex items-center justify-center gap-3 bg-black dark:bg-[#FFD600] hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] text-white dark:text-[#111318] hover:text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all duration-300 shadow-md dark:shadow-none active:scale-95 cursor-pointer w-full sm:w-auto"
          >
            <span>View More Blogs</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </SLink>
        </div>
      )}
    </div>
  );
};

export default BlogSection;
