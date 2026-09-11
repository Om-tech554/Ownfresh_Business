import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import SLink from "../components/SLink";
import { Helmet } from "react-helmet-async";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  ArrowRight,
  Flame,
  Leaf,
  ShieldCheck,
  Star,
  ShoppingBag,
  Send,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import toast from "react-hot-toast";

const OilInsights = () => {
  const [blogs, setBlogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const blogsPerPage = 5;

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogRes, productRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/blog/all?limit=1000`),
          axios.get(`${API_BASE_URL}/api/product/all?limit=10`)
        ]);
        setBlogs(blogRes.data.blogs || []);
        setProducts(productRes.data.products || []);
      } catch (error) {
        console.log("Error loading insights & products:", error);
      }
    };
    fetchData();
  }, [API_BASE_URL]);

  // Deduplicate blogs by title to keep the layout clean
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

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) {
      return toast.error("Please enter your email address");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      return toast.error("Please enter a valid email address");
    }
    try {
      setSubscribing(true);
      const res = await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, {
        email: newsletterEmail
      });
      toast.success(res.data?.message || "Subscribed successfully! Check your inbox.");
      setNewsletterEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const trendingTags = [
    "Stone Pressed",
    "Mustard Oil",
    "Groundnut Oil",
    "Heart Wellness",
    "Deep Frying",
    "Hair & Skin",
    "Unrefined",
    "Kolhu Churned"
  ];

  return (
    <>
      <Helmet>
        <title>Blog - OwnFresh Insights & Health Benefits</title>
        <meta
          name="description"
          content="Discover the latest health benefits, nutritional science, and lifestyle tips on healthy stone-pressed cooking oils directly from OwnFresh Insights."
        />
      </Helmet>
      <Navbar />

      <div className="w-full bg-[#fcfcfc] dark:bg-[#0B0F14] min-h-screen py-10 pb-28 lg:pb-16 px-4 sm:px-8 md:px-12 lg:px-20 font-sans transition-colors duration-250">

        {/* HEADER SECTION */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-slate-200 dark:border-[#202731] gap-4">
          <div>
            <span className="text-[10px] font-black text-[#1E971D] dark:text-[#FFD600] uppercase tracking-widest bg-emerald-50 dark:bg-[#171D26] border border-emerald-100 dark:border-[#27313D] px-3 py-1 rounded-full inline-block mb-2">
              Culinary Science & Traditional Health
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-[#F7F9FC] tracking-tight uppercase">
              OwnFresh <span className="text-[#1E971D] dark:text-[#FFD600]">Insights & Health</span>
            </h1>
            <p className="text-slate-500 dark:text-[#818C9B] mt-2 text-xs sm:text-sm font-medium max-w-2xl">
              Research-backed guides on authentic stone-pressed oils, smoke point chemistry, healthy traditional cooking, and holistic wellness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 dark:text-[#818C9B] uppercase tracking-wider">
              {allBlogs.length} Articles Published
            </span>
          </div>
        </div>

        {/* MAIN LAYOUT: 8 cols left (Articles) + 4 cols right (Sticky Sidebar on Laptop) */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT COLUMN: MAIN ARTICLES FEED (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-10">

            {displayedBlogs.length === 0 ? (
              <div className="bg-white dark:bg-[#171D26] p-16 rounded-3xl border border-slate-200 dark:border-[#27313D] text-center text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-widest shadow-xs">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-[#818C9B] mx-auto mb-3" />
                <p>No articles match your current search.</p>
                <button
                  onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                  className="mt-4 px-6 py-2.5 bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {displayedBlogs
                  .slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage)
                  .map((blog) => (
                    <article
                      key={blog.id || blog._id}
                      className="group bg-white dark:bg-[#171D26] rounded-3xl border border-slate-200/90 dark:border-[#27313D] overflow-hidden shadow-xs hover:shadow-2xl hover:dark:bg-[#1C232D] hover:dark:border-[#34404E] transition-all duration-300 hover:border-[#1E971D]/40 flex flex-col"
                    >
                      <SLink to={`/blog/${blog.slug || blog.id || blog._id}`} className="block">
                        {/* Article Image Container */}
                        <div className="w-full h-[260px] xs:h-[320px] sm:h-[420px] overflow-hidden bg-slate-50 dark:bg-[#151B23] flex items-center justify-center p-4 border-b border-slate-100 dark:border-[#202832] relative">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png";
                            }}
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <span className="text-[10px] font-black bg-[#1E971D] dark:bg-[#19C37D] text-white dark:text-[#111318] px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                              {(() => {
                                let cat = blog.category ? blog.category.trim() : 'General';
                                return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
                              })()}
                            </span>
                          </div>
                        </div>

                        {/* Article Content Box */}
                        <div className="p-6 sm:p-8 flex flex-col items-start">
                          <div className="flex items-center gap-4 text-slate-400 dark:text-[#818C9B] text-xs font-bold uppercase tracking-wider mb-3">
                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-[#818C9B]">
                              <Calendar size={13} className="text-[#1E971D] dark:text-[#FFD600]" />
                              {blog.publishedAt
                                ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                                : blog.date || "Recent"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-[#818C9B]">
                              <Clock size={13} className="text-[#1E971D] dark:text-[#FFD600]" />
                              5 min read
                            </span>
                          </div>

                          <h2
                            className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-[#F5F7FA] leading-snug mb-3 group-hover:text-[#1E971D] dark:group-hover:text-[#FFD600] transition-colors"
                            dangerouslySetInnerHTML={{ __html: blog.title }}
                          />

                          <div
                            className="text-slate-600 dark:text-[#B7C1CE] leading-relaxed text-sm sm:text-base font-normal line-clamp-3 mb-6"
                            dangerouslySetInnerHTML={{ __html: blog.description }}
                          />

                          <div className="w-full pt-4 border-t border-slate-100 dark:border-[#27313D] flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-[#1E971D] dark:text-[#FFD600] flex items-center gap-2 group-hover:gap-3 transition-all">
                              Read Full Article
                              <ArrowRight size={15} />
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-[#818C9B] uppercase tracking-wider">
                              OwnFresh Science
                            </span>
                          </div>
                        </div>
                      </SLink>
                    </article>
                  ))}

                {/* PAGINATION */}
                {displayedBlogs.length > blogsPerPage && (
                  <div className="flex items-center justify-center gap-6 mt-4 pt-6 border-t border-slate-200 dark:border-[#202731]">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => prev - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#171D26] border border-slate-200 dark:border-[#27313D] text-slate-800 dark:text-[#F5F7FA] disabled:opacity-30 shadow-xs hover:shadow-md hover:bg-[#1E971D] dark:hover:bg-[#FFD600] dark:hover:text-[#111318] hover:text-white hover:border-[#1E971D] dark:hover:border-[#FFD600] transition-all cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-xs font-bold text-slate-600 dark:text-[#AEB9C8] uppercase tracking-widest">
                      Page <span className="text-slate-900 dark:text-[#F5F7FA] font-black text-sm">{currentPage}</span> of{" "}
                      {Math.ceil(displayedBlogs.length / blogsPerPage)}
                    </span>

                    <button
                      disabled={currentPage * blogsPerPage >= displayedBlogs.length}
                      onClick={() => {
                        setCurrentPage((prev) => prev + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#171D26] border border-slate-200 dark:border-[#27313D] text-slate-800 dark:text-[#F5F7FA] disabled:opacity-30 shadow-xs hover:shadow-md hover:bg-[#1E971D] dark:hover:bg-[#FFD600] dark:hover:text-[#111318] hover:text-white hover:border-[#1E971D] dark:hover:border-[#FFD600] transition-all cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

          {/* RIGHT COLUMN: STICKY LAPTOP & DESKTOP SIDEBAR (4 Cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28 h-fit">

            {/* 1. SEARCH WIDGET */}
            <div className="bg-white dark:bg-[#171D26] p-6 rounded-3xl border border-slate-200/90 dark:border-[#27313D] shadow-xs transition-colors duration-250">
              <h3 className="text-xs font-black text-slate-900 dark:text-[#F5F7FA] uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Search Articles</span>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer">
                    Clear
                  </button>
                )}
              </h3>
              <div className="flex items-center w-full bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] rounded-2xl px-3.5 py-3 focus-within:border-[#1E971D] dark:focus-within:border-[#FFD600] focus-within:bg-white dark:focus-within:bg-[#151B23] transition-all">
                <Search size={16} className="text-slate-400 dark:text-[#778393] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search oils, recipes, benefits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium outline-none bg-transparent text-slate-800 dark:text-[#F5F7FA] placeholder:dark:text-[#778393]"
                />
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-[#27313D]">
                {trendingTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#1D2530] hover:bg-emerald-50 dark:hover:bg-[#222B37] hover:text-[#1E971D] dark:hover:text-[#FFD600] border border-slate-200 dark:border-[#27313D] text-slate-600 dark:text-[#B7C1CE] transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. CATEGORIES WIDGET */}
            <div className="bg-white dark:bg-[#171D26] p-6 rounded-3xl border border-slate-200/90 dark:border-[#27313D] shadow-xs transition-colors duration-250">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-[#F5F7FA] uppercase tracking-widest">
                  Explore by Topic
                </h3>
                {activeCategory !== "All" && (
                  <button
                    onClick={() => setActiveCategory("All")}
                    className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <ul className="flex flex-col gap-1.5 text-xs font-bold text-slate-600 dark:text-[#B7C1CE] uppercase tracking-wider">
                <li
                  onClick={() => setActiveCategory("All")}
                  className={`flex justify-between items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                    activeCategory === "All"
                      ? "bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] font-black shadow-xs"
                      : "hover:bg-slate-50 dark:hover:bg-[#1D2530] text-slate-700 dark:text-[#B7C1CE]"
                  }`}
                >
                  <span>All Articles</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                      activeCategory === "All" ? "bg-white/20 dark:bg-black/20 text-white dark:text-[#111318]" : "bg-slate-100 dark:bg-[#1D2530] text-slate-400 dark:text-[#818C9B]"
                    }`}
                  >
                    {allBlogs.length}
                  </span>
                </li>
                {Object.entries(categoriesMap).map(([title, count], idx) => (
                  <li
                    key={idx}
                    onClick={() => setActiveCategory(title)}
                    className={`flex justify-between items-center p-2.5 rounded-xl cursor-pointer transition-colors ${
                      activeCategory === title
                        ? "bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] font-black shadow-xs"
                        : "hover:bg-slate-50 dark:hover:bg-[#1D2530] text-slate-700 dark:text-[#B7C1CE]"
                    }`}
                  >
                    <span>{title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                        activeCategory === title ? "bg-white/20 dark:bg-black/20 text-white dark:text-[#111318]" : "bg-slate-100 dark:bg-[#1D2530] text-slate-400 dark:text-[#818C9B]"
                      }`}
                    >
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. FEATURED STONE-PRESSED OIL SPOTLIGHT */}
            {products.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-black dark:from-[#0B0F14] dark:via-[#111720] dark:to-[#171D26] text-white p-6 rounded-3xl shadow-xl dark:border dark:border-[#27313D] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E971D]/20 dark:bg-[#FFD600]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[#1E971D] dark:bg-[#19C37D] text-white dark:text-[#111318] px-2.5 py-0.5 rounded-full font-bold">
                    Featured Oil
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star size={12} className="fill-amber-400 dark:fill-[#FFD600] text-[#FFD600]" />
                    <span className="font-bold text-white text-[11px]">4.9 (180+ Reviews)</span>
                  </div>
                </div>

                {/* Product Card Showcase */}
                {(() => {
                  const p = products[0];
                  const displayImg = p.variants?.[0]?.image || p.image;
                  const displayPrice = p.variants?.[0]?.salePrice || p.variants?.[0]?.price || p.price;
                  return (
                    <div className="relative z-10">
                      <div className="w-full h-40 bg-white/5 dark:bg-[#151B23] rounded-2xl p-2 mb-3 flex items-center justify-center border border-white/10 dark:border-[#27313D] group-hover:border-[#1E971D]/40 dark:group-hover:border-[#FFD600]/40 transition-colors">
                        <img
                          src={displayImg}
                          alt={p.name}
                          className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal"
                        />
                      </div>
                      <h4 className="text-sm font-black uppercase text-white dark:text-[#F5F7FA] leading-tight mb-1 line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-300 dark:text-[#B7C1CE] font-medium line-clamp-2 mb-3">
                        {p.shortDesc || "100% Stone-pressed, friction-cold extracted unheated unrefined cooking oil."}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-[#27313D]">
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-[#818C9B] uppercase font-bold block">Starting at</span>
                          <span className="text-base font-black text-[#EFDB27] dark:text-[#FFD600] font-mono">₹{Math.round(displayPrice)}</span>
                        </div>
                        <SLink
                          to={`/product/${p._id}`}
                          className="px-4 py-2 bg-[#EFDB27] dark:bg-[#FFD600] hover:bg-white dark:hover:bg-[#FFE45C] text-slate-900 dark:text-[#111318] rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <ShoppingBag size={13} />
                          Shop Oil
                        </SLink>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. RECENT & TRENDING INSIGHTS */}
            <div className="bg-white dark:bg-[#171D26] p-6 rounded-3xl border border-slate-200/90 dark:border-[#27313D] shadow-xs transition-colors duration-250">
              <h3 className="text-xs font-black text-slate-900 dark:text-[#F5F7FA] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Flame size={14} className="text-amber-500 dark:text-[#FFD600]" />
                Trending Reads
              </h3>
              <div className="flex flex-col gap-4">
                {allBlogs.slice(0, 4).map((blog) => (
                  <SLink
                    key={`trending-${blog.id || blog._id}`}
                    to={`/blog/${blog.slug || blog.id || blog._id}`}
                    className="group flex items-start gap-3.5 pb-3 border-b border-slate-100 dark:border-[#202832] last:border-0 last:pb-0 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 dark:bg-[#151B23] border border-slate-100 dark:border-[#202832] shrink-0 p-1 flex items-center justify-center">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#1E971D] dark:text-[#FFD600] mb-0.5">
                        {blog.category || "Health"}
                      </span>
                      <h4
                        className="text-xs font-extrabold text-slate-800 dark:text-[#F5F7FA] leading-snug line-clamp-2 group-hover:text-[#1E971D] dark:group-hover:text-[#FFD600] transition-colors"
                        dangerouslySetInnerHTML={{ __html: blog.title }}
                      />
                      <span className="text-[10px] text-slate-400 dark:text-[#818C9B] font-medium mt-1">
                        {blog.publishedAt
                          ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                          : "Recent"}
                      </span>
                    </div>
                  </SLink>
                ))}
              </div>
            </div>

            {/* 5. ORGANIC STONE-PRESSED PROMISE (TRUST BOX) */}
            <div className="bg-amber-50/70 dark:bg-[#171D26] border border-amber-200/80 dark:border-[#27313D] p-6 rounded-3xl transition-colors duration-250">
              <h4 className="text-xs font-black uppercase text-amber-900 dark:text-[#FFD600] tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-700 dark:text-[#FFD600]" />
                The OwnFresh Standard
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-amber-950 dark:text-[#AEB9C8]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <span>Granite Stone Kolhu Churned (14–16 RPM)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <span>Unheated extraction below 40°C</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <span>100% Zero Hexane & Chemical Refining</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <span>Rich in natural tocopherols & plant sterols</span>
                </li>
              </ul>
            </div>

            {/* 6. VIP NEWSLETTER & RECIPE GUIDE */}
            <div className="bg-slate-900 dark:bg-[#171D26] text-white p-6 rounded-3xl border border-slate-800 dark:border-[#27313D] shadow-md transition-colors duration-250">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#EFDB27] dark:text-[#FFD600]" />
                <h4 className="text-xs font-black uppercase text-white dark:text-[#F5F7FA] tracking-widest">
                  Healthy Kitchen VIP
                </h4>
              </div>
              <p className="text-xs text-slate-300 dark:text-[#AEB9C8] font-medium mb-4 leading-relaxed">
                Get our Traditional Stone-Pressed Recipe Book & exclusive discounts straight to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-white/10 dark:bg-[#151B23] border border-white/15 dark:border-[#29333F] rounded-xl px-3.5 py-2.5 text-xs text-white dark:text-[#F5F7FA] placeholder:text-slate-400 dark:placeholder:text-[#778393] outline-none focus:border-[#EFDB27] dark:focus:border-[#FFD600] transition-all"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="w-full py-2.5 bg-[#EFDB27] dark:bg-[#FFD600] hover:bg-white dark:hover:bg-[#FFE45C] text-slate-900 dark:text-[#111318] rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Send size={12} />
                  {subscribing ? "Subscribing..." : "Get Free Guide"}
                </button>
              </form>
            </div>

            {/* 7. ASK OUR EXPERT / WHATSAPP ASSIST */}
            <a
              href="https://wa.me/918999773438?text=Hello%20OwnFresh%2C%20I%20have%20a%20question%20about%20your%20stone%20pressed%20oils."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 dark:bg-[#1D2530] hover:bg-emerald-700 dark:hover:bg-[#222B37] border border-transparent dark:border-[#27313D] text-white p-5 rounded-3xl flex items-center justify-between shadow-lg shadow-emerald-600/20 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-xs">
                  <FaWhatsapp size={22} />
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase tracking-wider dark:text-[#F5F7FA]">Oil Selection Help?</h5>
                  <p className="text-[11px] text-emerald-100 dark:text-[#19C37D] font-medium">Chat with our Master Churner</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white dark:text-[#FFD600] group-hover:translate-x-1 transition-transform" />
            </a>

          </aside>

        </div>

      </div>
    </>
  );
};

export default OilInsights;
