import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import SLink from "../components/SLink";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight } from "lucide-react";

const OilInsights = () => {
  const [blogs, setBlogs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/blog/all?limit=1000`);
        setBlogs(res.data.blogs || []);
      } catch (error) {
        console.log("Error loading backend blogs:", error);
      }
    };
    fetchBlogs();
  }, [API_BASE_URL]);

  // Deduplicate blogs by title to keep the layout clean if there are any collisions
  const uniqueBlogsMap = new Map();
  blogs.forEach(blog => {
      const titleStr = blog.title || "Untitled";
      const cleanTitle = titleStr.replace(/&[#A-Za-z0-9]+;/gi, (match) => {
          const textarea = document.createElement("textarea");
          textarea.innerHTML = match;
          return textarea.value;
      });
      if (!uniqueBlogsMap.has(cleanTitle)) {
          uniqueBlogsMap.set(cleanTitle, blog);
      }
  });
  const allBlogs = Array.from(uniqueBlogsMap.values());

  // Derive unique categories automatically from all blogs
  const categoriesMap = allBlogs.reduce((acc, curr) => {
      let cat = curr.category ? curr.category.trim() : 'General';
      // Normalize to "Sentence case" (e.g., "OTHER", "other" -> "Other")
      if (cat.length > 0) {
        cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
      }
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
  }, {});

  const displayedBlogs = useMemo(() => {
      let result = allBlogs;
      
      // Handle Category Filter
      if (activeCategory !== "All") {
          result = result.filter(blog => {
            let cat = blog.category ? blog.category.trim() : 'General';
            if (cat.length > 0) {
                cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            }
            return cat === activeCategory;
          });
      }

      // Handle Search Input Filter
      if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          result = result.filter(blog => 
             (blog.title && blog.title.toLowerCase().includes(q)) || 
             (blog.description && blog.description.toLowerCase().includes(q)) ||
             (blog.category && blog.category.toLowerCase().includes(q))
          );
      }
      return result;
  }, [allBlogs, activeCategory, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Blog - OwnFresh Insights & Health Benefits</title>
        <meta name="description" content="Discover the latest health benefits, nutritional science, and lifestyle tips on healthy cooking oils directly from OwnFresh Insights. Read our blogs to learn more." />
      </Helmet>
      <Navbar />

      <div className="w-full bg-[#fcfcfc] min-h-screen py-12 px-6 md:px-12 lg:px-24">
        
        {/* HEADER */}
        <div className="max-w-7xl mx-auto flex flex-col items-center mb-16 text-center border-b border-gray-200 pb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight uppercase">
            OwnFresh <span className="text-[#FFDD00]">Insights</span>
          </h1>
          <p className="text-gray-500 mt-4 text-sm uppercase tracking-widest font-bold">
            Health Benefits, Science, and Lifestyle Insights
          </p>
        </div>

        {/* 75/25 SPLIT LAYOUT */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* LEFT COLUMN: MAIN CONTENT (75%) */}
            <div className="lg:col-span-3 flex flex-col gap-16">
                 {displayedBlogs.length === 0 ? (
                    <div className="bg-white p-10 border border-gray-200 text-center text-gray-400 font-bold uppercase tracking-widest">
                       No blogs found matching your filters.
                    </div>
                  ) : (
                    <>
                    {displayedBlogs.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage).map((blog, index) => (
                        <div key={blog.id || blog._id} className="flex flex-col group cursor-pointer w-full bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-3xl overflow-hidden mb-8 border border-gray-100">
                            <SLink to={`/blog/${blog.slug || blog.id || blog._id}`}>
                                {/* USER REQUEST FIX: changed object-cover to object-contain to prevent cutting and added border-radius */}
                                <div className="w-full h-[300px] md:h-[450px] overflow-hidden bg-gray-50 flex items-center justify-center p-4 rounded-t-3xl border-b border-gray-100 mb-6">
                                    <img 
                                        src={blog.image} 
                                        alt={blog.title} 
                                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-col items-start px-6 md:px-10 pb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[10px] font-black bg-[#FFDD00] text-black px-3 py-1 rounded-full uppercase tracking-widest">
                                            {(() => {
                                                let cat = blog.category ? blog.category.trim() : 'General';
                                                return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
                                            })()}
                                        </span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{blog.date || 'Recent'}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-black leading-tight mb-4 group-hover:text-[#FFDD00] transition-colors" dangerouslySetInnerHTML={{ __html: blog.title }}>
                                    </h2>
                                    <div className="text-gray-600 leading-relaxed font-medium line-clamp-3 mb-8" dangerouslySetInnerHTML={{ __html: blog.description }}>
                                    </div>
                                    <span className="text-xs font-black text-black border-b-2 border-black pb-1 uppercase tracking-widest group-hover:border-[#FFDD00] group-hover:text-[#FFDD00] transition-colors">
                                        Read Article
                                    </span>
                                </div>
                            </SLink>
                        </div>
                    ))}

                    {/* PAGINATION CONTROLS */}
                    {displayedBlogs.length > blogsPerPage && (
                        <div className="flex items-center justify-center gap-8 mt-12 pt-8">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => {
                                    setCurrentPage(prev => prev - 1);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="p-4 rounded-full bg-white border border-gray-200 text-slate-800 disabled:opacity-30 shadow-sm hover:shadow-md hover:bg-[#FFDD00] hover:border-[#FFDD00] transition-all"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            <span className="text-slate-500 font-medium tracking-wide">
                                Page <span className="text-slate-900 font-black text-lg">{currentPage}</span> of {Math.ceil(displayedBlogs.length / blogsPerPage)}
                            </span>

                            <button
                                disabled={currentPage * blogsPerPage >= displayedBlogs.length}
                                onClick={() => {
                                    setCurrentPage(prev => prev + 1);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="p-4 rounded-full bg-white border border-gray-200 text-slate-800 disabled:opacity-30 shadow-sm hover:shadow-md hover:bg-[#FFDD00] hover:border-[#FFDD00] transition-all"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                    </>
                  )}
            </div>

            {/* RIGHT COLUMN: SIDEBAR (25%) */}
            <div className="lg:col-span-1 flex flex-col gap-10 sticky top-[100px] h-fit">

                {/* SEARCH WIDGET */}
                <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-lg font-black text-black uppercase mb-4 border-b border-gray-100 pb-2">Search</h3>
                    <div className="flex w-full bg-gray-50 border border-gray-200 focus-within:border-black transition-colors">
                        <input 
                           type="text" 
                           placeholder="Find insights..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full p-3 font-medium text-sm outline-none bg-transparent" 
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="px-3 text-gray-400 hover:text-black">✖</button>
                        )}
                    </div>
                </div>

                {/* CATEGORIES WIDGET */}
                <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-lg font-black text-black uppercase mb-4 border-b border-gray-100 pb-2 flex justify-between items-center">
                        Categories 
                        {activeCategory !== "All" && (
                            <button onClick={() => setActiveCategory("All")} className="text-[10px] text-red-500 hover:underline">Reset</button>
                        )}
                    </h3>
                    <ul className="flex flex-col gap-1 text-[11px] font-black text-gray-500 uppercase tracking-widest">
                        <li 
                            onClick={() => setActiveCategory("All")} 
                            className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${activeCategory === "All" ? "bg-[#FFDD00] text-black" : "hover:bg-gray-50"}`}
                        >
                            <span>All</span>
                            <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded">{allBlogs.length}</span>
                        </li>
                        {Object.entries(categoriesMap).map(([title, count], idx) => (
                            <li 
                                key={idx} 
                                onClick={() => setActiveCategory(title)} 
                                className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${activeCategory === title ? "bg-[#FFDD00] text-black" : "hover:bg-gray-50 hover:text-black"}`}
                            >
                                <span>{title}</span>
                                <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* RECENT POSTS WIDGET */}
                <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-lg font-black text-black uppercase mb-4 border-b border-gray-100 pb-2">Recent Posts</h3>
                    <div className="flex flex-col gap-4">
                        {allBlogs.slice(0, 3).map((blog) => (
                            <SLink key={`recent-${blog.id || blog._id}`} to={`/blog/${blog.slug || blog.id || blog._id}`} className="group flex flex-col gap-1 cursor-pointer">
                                <h4 className="text-sm font-bold text-black leading-tight group-hover:text-[#FFDD00] transition-colors" dangerouslySetInnerHTML={{ __html: blog.title }}>
                                </h4>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{blog.date}</span>
                            </SLink>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </>
  );
};

export default OilInsights;
