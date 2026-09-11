import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  ChevronUp,
  Share2,
  Leaf,
  ShieldCheck,
  Star,
  ShoppingBag,
  Send,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  ArrowRight
} from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import Navbar from "../components/Navbar";
import SLink from "../components/SLink";
import SEO from "../components/SEO";
import BlogImageSlider from "../components/BlogImageSlider";

/* ─── tiny helper: strip HTML tags ─── */
const stripHtml = (html = "") => html.replace(/<[^>]+>/g, "");

/* ─── reading time estimate ─── */
const readingTime = (text = "") => {
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const UserBlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fn = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const fetchBlog = async () => {
    try {
      const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");
      const res = await axios.get(`${API_BASE_URL}/api/blog/${id}`);
      setBlog(res.data.blog);
    } catch (error) {
      console.log("Error loading blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendationsAndProducts = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";
      const [blogRes, productRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/blog/all?limit=1000`),
        axios.get(`${API_BASE_URL}/api/product/all?limit=10`)
      ]);

      const allBlogs = blogRes.data.blogs || [];
      const filtered = allBlogs.filter((b) => b._id !== id && b.id !== id && b.slug !== id).slice(0, 3);
      setRecommendations(
        filtered.map((post) => ({
          id: post.slug || post._id || post.id,
          title: post.title,
          date: new Date(post.createdAt || post.updatedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          description: stripHtml(post.description || "").substring(0, 150) + "...",
          image:
            post.image ||
            "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1",
        }))
      );

      const prods = productRes.data.products || [];
      if (prods.length > 0) {
        setFeaturedProduct(prods[0]);
      }
    } catch (error) {
      console.log("Recommendations/products error", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBlog();
    fetchRecommendationsAndProducts();
  }, [id]);

  const handleShare = (network) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(blog?.title || "OwnFresh Stone Pressed Oils Article");

    if (network === "copy") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
      return;
    }

    let shareUrl = "";
    switch (network) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: blog?.title, url: window.location.href }).catch(() => {});
          return;
        }
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

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
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";
      const res = await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, {
        email: newsletterEmail
      });
      toast.success(res.data?.message || "Subscribed successfully! Welcome to OwnFresh.");
      setNewsletterEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  /* ── Loading ── */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEFDF8] dark:bg-[#0B0F14] transition-colors duration-250">
        <Loader2 className="w-12 h-12 animate-spin text-[#1E971D] dark:text-[#FFD600]" />
        <p className="mt-4 text-slate-600 dark:text-[#818C9B] font-bold uppercase tracking-wider text-xs">
          Loading Insights & Science…
        </p>
      </div>
    );

  /* ── Not found ── */
  if (!blog)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FEFDF8] dark:bg-[#0B0F14] transition-colors duration-250">
        <h2 className="text-2xl font-black text-slate-900 dark:text-[#F5F7FA] uppercase">Article Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-[#1E971D] dark:text-[#FFD600] font-bold mt-4 flex items-center gap-2 uppercase tracking-wider text-xs cursor-pointer"
        >
          <ArrowLeft size={16} /> Return to Articles
        </button>
      </div>
    );

  /* ── Meta helpers ── */
  const cleanDescription = blog.searchDescription || stripHtml(blog.description).substring(0, 160);
  const cleanTitle = blog.title;
  const mins = readingTime(blog.description);
  const renderedHTML = blog.description || "";
  const images = [blog.image1, blog.image2, blog.image3, blog.image4].filter(Boolean);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": cleanTitle,
    "image": blog.image ? [blog.image] : [],
    "datePublished": blog.publishedAt || blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    "author": [{
      "@type": "Person",
      "name": blog.author || "OwnFresh Research Team",
    }]
  };

  return (
    <div className="bg-[#FEFDF8] dark:bg-[#0B0F14] min-h-screen relative font-sans transition-colors duration-250">
      <SEO
        title={cleanTitle}
        description={cleanDescription}
        image={blog.image}
        url={`/blog/${blog.slug || id}`}
        type="article"
        schemaMarkup={schemaMarkup}
      />

      {/* ── STICKY NAVBAR ── */}
      <Navbar />

      {/* ── HERO BANNER ── */}
      <div className="w-full bg-[#111827] text-white">

        {/* Top navigation row */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-black uppercase tracking-widest cursor-pointer bg-white/10 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft size={14} />
            Back to Articles
          </button>
        </div>

        {/* Full natural featured image */}
        {blog.image && (
          <div className="w-full flex items-center justify-center bg-black/40 px-0">
            <img
              src={blog.image}
              alt={cleanTitle}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png";
              }}
              className="w-full max-h-[65vh] object-contain block"
            />
          </div>
        )}

        {/* Title and metadata banner */}
        <div className="bg-gradient-to-b from-[#111827] to-[#0b0f17] px-4 md:px-8 lg:px-12 pt-8 pb-12 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-[#1E971D] text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                <Calendar size={12} />
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-IN", {
                  dateStyle: "long"
                })}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full">
                <Clock size={12} />
                {mins} min read
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#EFDB27] text-slate-900 text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
                <Leaf size={12} />
                {(() => {
                  let cat = blog.category ? blog.category.trim() : "General";
                  return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
                })()}
              </span>
            </div>
            <h1
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight uppercase"
              dangerouslySetInnerHTML={{ __html: blog.title }}
            />
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN MAIN ARTICLE & STICKY LAPTOP SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">

          {/* ═══ LEFT: Article Body (67%) ═══ */}
          <article className="w-full lg:w-[67%] min-w-0">

            {/* Decorative organic accent line */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-1 bg-[#1E971D] rounded-full" />
              <Leaf size={18} className="text-[#1E971D]" />
              <span className="text-xs font-black uppercase tracking-widest text-[#1E971D]">
                OwnFresh Certified Knowledge
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Styles for article typography, tables and content */}
            <style dangerouslySetInnerHTML={{
              __html: `
              .wp-blog-content {
                font-family: system-ui, -apple-system, sans-serif !important;
              }
              .wp-blog-content p {
                margin-top: 1rem !important;
                margin-bottom: 1rem !important;
                line-height: 1.85 !important;
                font-size: 1.05rem !important;
                color: #334155 !important;
              }
              html.dark .wp-blog-content p {
                color: #B7C1CE !important;
              }
              .wp-blog-content h1 {
                font-size: 2.2rem !important;
                font-weight: 900 !important;
                color: #0f172a !important;
                margin-top: 2.2rem !important;
                margin-bottom: 1rem !important;
                line-height: 1.25 !important;
              }
              html.dark .wp-blog-content h1 {
                color: #F7F9FC !important;
              }
              .wp-blog-content h2 {
                font-size: 1.65rem !important;
                font-weight: 900 !important;
                color: #0f172a !important;
                margin-top: 2.2rem !important;
                margin-bottom: 0.85rem !important;
                line-height: 1.3 !important;
                border-left: 4px solid #1E971D;
                padding-left: 0.75rem;
              }
              html.dark .wp-blog-content h2 {
                color: #F7F9FC !important;
                border-left-color: #FFD600 !important;
              }
              .wp-blog-content h3 {
                font-size: 1.3rem !important;
                font-weight: 850 !important;
                color: #0f172a !important;
                margin-top: 1.75rem !important;
                margin-bottom: 0.75rem !important;
                line-height: 1.35 !important;
              }
              html.dark .wp-blog-content h3 {
                color: #F7F9FC !important;
              }
              .wp-blog-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 2rem 0;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
                border: 1px solid #e2e8f0;
              }
              html.dark .wp-blog-content table {
                background-color: #171D26 !important;
                border-color: #27313D !important;
              }
              .wp-blog-content th {
                background-color: #f8fafc;
                color: #0f172a;
                font-weight: 800;
                text-align: left;
                padding: 14px 18px;
                border-bottom: 2px solid #cbd5e1;
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              html.dark .wp-blog-content th {
                background-color: #151B23 !important;
                color: #F5F7FA !important;
                border-bottom-color: #27313D !important;
              }
              .wp-blog-content td {
                padding: 14px 18px;
                border-bottom: 1px solid #f1f5f9;
                color: #334155;
                font-size: 0.95rem;
                line-height: 1.5;
              }
              html.dark .wp-blog-content td {
                border-bottom-color: #202832 !important;
                color: #B7C1CE !important;
              }
              .wp-blog-content tr:last-child td {
                border-bottom: none;
              }
              .wp-blog-content ul {
                list-style-type: disc !important;
                padding-left: 2rem !important;
                margin-top: 1.25rem !important;
                margin-bottom: 1.25rem !important;
              }
              .wp-blog-content ol {
                list-style-type: decimal !important;
                padding-left: 2rem !important;
                margin-top: 1.25rem !important;
                margin-bottom: 1.25rem !important;
              }
              .wp-blog-content li {
                margin-top: 0.5rem !important;
                margin-bottom: 0.5rem !important;
                line-height: 1.8 !important;
                color: #334155;
              }
              html.dark .wp-blog-content li {
                color: #B7C1CE !important;
              }
              .wp-blog-content a {
                color: #1E971D !important;
                font-weight: 700 !important;
                text-decoration: underline !important;
              }
              html.dark .wp-blog-content a {
                color: #FFD600 !important;
              }
            ` }} />

            <div
              className="prose prose-lg max-w-none space-y-2 wp-blog-content"
              dangerouslySetInnerHTML={{ __html: renderedHTML }}
            />

            {/* Interactive Image Gallery Slider */}
            {images.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-[#27313D]">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-[#F5F7FA] uppercase tracking-wide">
                    Article Gallery Slider
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1E971D] dark:text-[#FFD600] bg-emerald-50 dark:bg-[#1D2530] px-3 py-1 rounded-full border border-emerald-100 dark:border-[#2A3440]">
                    {images.length} {images.length === 1 ? "Image" : "Images"}
                  </span>
                </div>
                <BlogImageSlider images={images} title={cleanTitle} />
              </div>
            )}

            {/* Author Footer Bio */}
            <div className="mt-14 p-6 sm:p-8 bg-white dark:bg-[#171D26] border border-slate-200 dark:border-[#27313D] rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xs transition-colors duration-250">
              <div className="w-16 h-16 rounded-full bg-[#1E971D] dark:bg-[#FFD600] text-white dark:text-[#111318] flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                OF
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1E971D] dark:text-[#FFD600] bg-emerald-50 dark:bg-[#1D2530] px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Written by
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-[#F5F7FA] uppercase">
                  {blog.author || "OwnFresh Culinary Science Team"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#818C9B] mt-1 leading-relaxed">
                  Dedicated to reviving India's ancient wood/stone Kolhu churning heritage, bringing 100% pure, chemical-free cold pressed nutrition to modern families.
                </p>
              </div>
            </div>

          </article>

          {/* ═══ RIGHT: Rich Sticky Laptop Sidebar (33%) ═══ */}
          <aside className="w-full lg:w-[33%] lg:sticky lg:top-28 flex flex-col gap-6 shrink-0 h-fit">

            {/* 1. AT A GLANCE FACT CARD */}
            <div className="bg-white dark:bg-[#171D26] border border-slate-200/90 dark:border-[#27313D] rounded-3xl shadow-xs p-6 transition-colors duration-250">
              <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-[#F5F7FA] mb-4 pb-3 border-b border-slate-100 dark:border-[#27313D] flex items-center justify-between">
                <span>Article Overview</span>
                <span className="text-[10px] text-[#1E971D] dark:text-[#19C37D] font-bold">Verified</span>
              </p>
              <ul className="flex flex-col gap-3.5 text-xs">
                <li className="flex items-start gap-3">
                  <Calendar size={16} className="text-[#1E971D] dark:text-[#FFD600] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider">Published</p>
                    <p className="font-bold text-slate-800 dark:text-[#F5F7FA]">
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={16} className="text-[#1E971D] dark:text-[#FFD600] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider">Reading Time</p>
                    <p className="font-bold text-slate-800 dark:text-[#F5F7FA]">{mins} minutes</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="text-[#1E971D] dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider">Standard</p>
                    <p className="font-bold text-slate-800 dark:text-[#F5F7FA]">ACoHI Certified Stone Press</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Leaf size={16} className="text-[#1E971D] dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider">Topic</p>
                    <p className="font-bold text-slate-800 dark:text-[#F5F7FA]">
                      {blog.category || "Stone-Pressed Health"}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* 2. RECOMMENDED STONE-PRESSED OIL PRODUCT CARD */}
            {featuredProduct && (
              <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-black dark:from-[#0B0F14] dark:via-[#111720] dark:to-[#171D26] text-white p-6 rounded-3xl shadow-xl dark:border dark:border-[#27313D] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E971D]/20 dark:bg-[#FFD600]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[#1E971D] dark:bg-[#19C37D] text-white dark:text-[#111318] px-2.5 py-0.5 rounded-full font-bold">
                    Recommended Oil
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star size={12} className="fill-amber-400 dark:fill-[#FFD600] text-[#FFD600]" />
                    <span className="font-bold text-white text-[11px]">4.9 (180+ Reviews)</span>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="w-full h-36 bg-white/5 dark:bg-[#151B23] rounded-2xl p-2 mb-3 flex items-center justify-center border border-white/10 dark:border-[#27313D] group-hover:border-[#1E971D]/40 dark:group-hover:border-[#FFD600]/40 transition-colors">
                    <img
                      src={featuredProduct.variants?.[0]?.image || featuredProduct.image}
                      alt={featuredProduct.name}
                      className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal"
                    />
                  </div>
                  <h4 className="text-sm font-black uppercase text-white dark:text-[#F5F7FA] leading-tight mb-1 line-clamp-1">
                    {featuredProduct.name}
                  </h4>
                  <p className="text-[11px] text-slate-300 dark:text-[#B7C1CE] font-medium line-clamp-2 mb-3">
                    {featuredProduct.shortDesc || "100% Pure, unrefined stone-pressed oil churned at 14–16 RPM."}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-[#27313D]">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-[#818C9B] uppercase font-bold block">From</span>
                      <span className="text-base font-black text-[#EFDB27] dark:text-[#FFD600] font-mono">
                        ₹{Math.round(featuredProduct.variants?.[0]?.salePrice || featuredProduct.variants?.[0]?.price || featuredProduct.price)}
                      </span>
                    </div>
                    <SLink
                      to={`/product/${featuredProduct._id}`}
                      className="px-4 py-2 bg-[#EFDB27] dark:bg-[#FFD600] hover:bg-white dark:hover:bg-[#FFE45C] text-slate-900 dark:text-[#111318] rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <ShoppingBag size={13} />
                      Shop Now
                    </SLink>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SOCIAL SHARING & COMMUNITY BAR */}
            <div className="bg-white dark:bg-[#171D26] border border-slate-200/90 dark:border-[#27313D] rounded-3xl shadow-xs p-6 transition-colors duration-250">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-[#F5F7FA] mb-2 flex items-center gap-2">
                <Share2 size={15} className="text-[#1E971D] dark:text-[#FFD600]" />
                Share This Article
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#818C9B] mb-4">
                Know someone who loves healthy traditional cooking? Pass it on!
              </p>
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="p-3 rounded-2xl bg-emerald-50 dark:bg-[#1D2530] hover:bg-emerald-100 dark:hover:bg-[#222B37] text-emerald-600 dark:text-[#19C37D] flex items-center justify-center transition-colors cursor-pointer border border-transparent dark:border-[#27313D]"
                  title="Share on WhatsApp"
                >
                  <FaWhatsapp size={18} />
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1D2530] hover:bg-slate-100 dark:hover:bg-[#222B37] text-slate-800 dark:text-[#F5F7FA] flex items-center justify-center transition-colors cursor-pointer border border-transparent dark:border-[#27313D]"
                  title="Share on X"
                >
                  <FaXTwitter size={18} />
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="p-3 rounded-2xl bg-blue-50 dark:bg-[#1D2530] hover:bg-blue-100 dark:hover:bg-[#222B37] text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer border border-transparent dark:border-[#27313D]"
                  title="Share on Facebook"
                >
                  <FaFacebookF size={18} />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="p-3 rounded-2xl bg-sky-50 dark:bg-[#1D2530] hover:bg-sky-100 dark:hover:bg-[#222B37] text-sky-700 dark:text-sky-400 flex items-center justify-center transition-colors cursor-pointer border border-transparent dark:border-[#27313D]"
                  title="Share on LinkedIn"
                >
                  <FaLinkedinIn size={18} />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="p-3 rounded-2xl bg-yellow-50 dark:bg-[#1D2530] hover:bg-yellow-100 dark:hover:bg-[#222B37] text-amber-700 dark:text-[#FFD600] flex items-center justify-center transition-colors cursor-pointer border border-transparent dark:border-[#27313D]"
                  title="Copy Link"
                >
                  <LinkIcon size={18} />
                </button>
              </div>
            </div>

            {/* 4. THE OWNFRESH STANDARD / WHY STONE-PRESSED MATTERS */}
            <div className="bg-amber-50/80 dark:bg-[#171D26] border border-amber-200/80 dark:border-[#27313D] p-6 rounded-3xl transition-colors duration-250">
              <h4 className="text-xs font-black uppercase text-amber-900 dark:text-[#FFD600] tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-700 dark:text-[#FFD600]" />
                The OwnFresh Standard
              </h4>
              <ul className="space-y-2.5 text-xs font-semibold text-amber-950 dark:text-[#AEB9C8]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <span>Unheated friction extraction (&lt;40°C)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <span>Zero Hexane solvents or chemical bleach</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <span>Micro-filtered via cotton cloth settling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-[#19C37D] mt-0.5 shrink-0" />
                  <span>100% Native Whole Seeds</span>
                </li>
              </ul>
            </div>

            {/* 5. VIP NEWSLETTER */}
            <div className="bg-slate-900 dark:bg-[#171D26] text-white p-6 rounded-3xl border border-slate-800 dark:border-[#27313D] shadow-md transition-colors duration-250">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#EFDB27] dark:text-[#FFD600]" />
                <h4 className="text-xs font-black uppercase text-white dark:text-[#F5F7FA] tracking-widest">
                  VIP Health Updates
                </h4>
              </div>
              <p className="text-xs text-slate-300 dark:text-[#AEB9C8] font-medium mb-4 leading-relaxed">
                Receive weekly science-backed wellness advice and members-only discounts.
              </p>
              <form onSubmit={handleNewsletterSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
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
                  {subscribing ? "Subscribing..." : "Join Free"}
                </button>
              </form>
            </div>

            {/* 6. ASK OUR EXPERT / WHATSAPP ASSIST */}
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
                  <h5 className="text-xs font-black uppercase tracking-wider dark:text-[#F5F7FA]">Oil Question?</h5>
                  <p className="text-[11px] text-emerald-100 dark:text-[#19C37D] font-medium">Chat with our Master Churner</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white dark:text-[#FFD600] group-hover:translate-x-1 transition-transform" />
            </a>

          </aside>

        </div>
      </div>

      {/* ── RECOMMENDED ARTICLES SECTION ── */}
      {recommendations.length > 0 && (
        <section className="bg-slate-50 dark:bg-[#111720] border-t border-slate-200 dark:border-[#202731] py-16 px-4 md:px-8 lg:px-12 transition-colors duration-250">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1E971D] dark:text-[#FFD600] bg-emerald-50 dark:bg-[#171D26] border border-emerald-100 dark:border-[#27313D] px-3 py-1 rounded-full inline-block mb-2">
                Keep Exploring
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F7F9FC] uppercase">
                Recommended <span className="text-[#1E971D] dark:text-[#FFD600]">Articles</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {recommendations.map((rec) => (
                <SLink
                  key={rec.id}
                  to={`/blog/${rec.id}`}
                  className="group bg-white dark:bg-[#171D26] rounded-3xl shadow-xs border border-slate-200/90 dark:border-[#27313D] overflow-hidden flex flex-col hover:shadow-xl hover:dark:bg-[#1C232D] hover:dark:border-[#34404E] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-full h-48 overflow-hidden bg-slate-50 dark:bg-[#151B23] flex items-center justify-center p-2 border-b border-slate-100 dark:border-[#202832]">
                    <img
                      src={rec.image}
                      alt={rec.title}
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1 gap-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-widest">
                      {rec.date}
                    </span>
                    <h4
                      className="text-base font-black text-slate-900 dark:text-[#F5F7FA] leading-snug group-hover:text-[#1E971D] dark:group-hover:text-[#FFD600] transition-colors line-clamp-2 uppercase"
                      dangerouslySetInnerHTML={{ __html: rec.title }}
                    />
                    <p className="text-xs text-slate-500 dark:text-[#AEB9C8] line-clamp-2 mt-1 leading-relaxed">{rec.description}</p>
                    <span className="mt-auto pt-3 text-xs font-black text-[#1E971D] dark:text-[#FFD600] uppercase tracking-widest flex items-center gap-1">
                      Read Article →
                    </span>
                  </div>
                </SLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SCROLL-TO-TOP FAB ── */}
      <div
        className={`fixed bottom-36 lg:bottom-8 right-4 lg:right-24 transition-all duration-300 transform z-50 ${
          showTopBtn ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <button
          onClick={goToTop}
          className="p-3 sm:p-3.5 bg-[#FFDD00] dark:bg-[#FFD600] text-slate-950 dark:text-[#111318] hover:bg-slate-900 dark:hover:bg-[#FFE45C] hover:text-[#FFDD00] rounded-full shadow-2xl border-2 border-slate-950/20 hover:border-[#FFDD00] hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center font-black"
          title="Tap to scroll upward"
          aria-label="Scroll to top"
        >
          <ChevronUp size={22} className="stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

export default UserBlogDetails;