import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Loader2, Calendar, Clock, ChevronUp, Share2, BookOpen, Leaf } from "lucide-react";
import { Helmet } from "react-helmet-async";
import SLink from "../components/SLink";

/* ─── tiny helper: strip HTML tags ─── */
const stripHtml = (html = "") => html.replace(/<[^>]+>/g, "");

/* ─── reading time estimate ─── */
const readingTime = (text = "") => {
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

/* ─── share helper ─── */
const handleShare = (title) => {
  if (navigator.share) {
    navigator.share({ title, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  }
};

const UserBlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fn = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const fetchBlog = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await axios.get(`${API_BASE_URL}/api/blog/${id}`);
      setBlog(res.data.blog);
    } catch (error) {
      console.log("Error loading blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await axios.get(`${API_BASE_URL}/api/blog/all?limit=1000`);
      const allBlogs = res.data.blogs || [];
      const filtered = allBlogs.filter((b) => b._id !== id && b.id !== id).slice(0, 3);
      setRecommendations(
        filtered.map((post) => ({
          id: post._id || post.id,
          title: post.title,
          date: new Date(post.createdAt || post.updatedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          description:
            stripHtml(post.description || "").substring(0, 150) + "...",
          image:
            post.image ||
            "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1",
        }))
      );
    } catch (error) {
      console.log("recommendations error", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBlog();
    fetchRecommendations();
  }, [id]);

  /* ── Loading ── */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEFDF8]">
        <Loader2 className="w-12 h-12 animate-spin text-[#F9DD19]" />
        <p className="mt-4 text-gray-500 font-medium">Fetching the story…</p>
      </div>
    );

  /* ── Not found ── */
  if (!blog)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FEFDF8]">
        <h2 className="text-2xl font-bold">Blog not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-[#1E971D] mt-4 flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    );

  /* ── Meta helpers ── */
  const cleanDescription = stripHtml(blog.description).substring(0, 160);
  const cleanTitle = blog.title;

  const mins = readingTime(blog.description);

  /* ── Image interleave (non-WP only) ── */
  let renderedHTML = blog.description || "";
  let leftoverImages = [];

  const images = [blog.image1, blog.image2, blog.image3, blog.image4].filter(Boolean);
  if (images.length > 0) {
    const parts = renderedHTML.split("</p>");
    let newContent = "";
    let imgIndex = 0;
    for (let i = 0; i < parts.length; i++) {
      newContent += parts[i];
      if (i < parts.length - 1) {
        newContent += "</p>";
        if (imgIndex < images.length && stripHtml(parts[i]).trim().length > 15) {
          newContent += `<figure class="my-10 w-full overflow-hidden rounded-2xl shadow border border-gray-100 bg-gray-50 flex items-center justify-center p-2"><img src="${images[imgIndex]}" class="w-full object-contain max-h-[500px] rounded-xl" alt="Blog image ${imgIndex + 1}" /></figure>`;
          imgIndex++;
        }
      }
    }
    renderedHTML = newContent;
    leftoverImages = images.slice(imgIndex);
  }

  /* ════════════════════════════════════════════════════
      RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div className="bg-[#FEFDF8] min-h-screen relative">
      <Helmet>
        <title>{cleanTitle} | OwnFresh</title>
        <meta name="description" content={cleanDescription + "..."} />
        <meta property="og:title" content={cleanTitle} />
        <meta property="og:description" content={cleanDescription + "..."} />
        {blog.image && <meta property="og:image" content={blog.image} />}
        <meta property="og:type" content="article" />
      </Helmet>

      {/* ── HERO ── */}
      <div className="w-full bg-[#1a1a1a]">

        {/* Back button row */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-6 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            Back to Articles
          </button>
        </div>

        {/* Image — full width, natural height, no crop */}
        {blog.image && (
          <div className="w-full flex items-center justify-center bg-[#111] px-0">
            <img
              src={blog.image}
              alt={cleanTitle}
              className="w-full max-h-[70vh] object-contain block"
              style={{ display: "block" }}
            />
          </div>
        )}

        {/* Title band below the image */}
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] px-4 md:px-8 lg:px-12 pt-7 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-[#F9DD19] text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Calendar size={12} />
                {new Date(blog.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock size={12} />
                {mins} min read
              </span>
            </div>
            <h1
              className="text-3xl md:text-5xl font-black text-white leading-tight"
              dangerouslySetInnerHTML={{ __html: blog.title }}
            />
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* ═══ LEFT: Article body ═══ */}
          <article className="w-full lg:w-[68%] min-w-0">

            {/* decorative accent line */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-1 bg-[#F9DD19]" />
              <Leaf size={16} className="text-[#F9DD19]" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Blog content */}
            <div
              className="
                prose prose-lg max-w-none
                prose-headings:font-black prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-p:text-gray-700 prose-p:leading-[1.9] prose-p:text-lg
                prose-a:text-[#1E971D] prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-md
                prose-strong:text-gray-900
                prose-ul:text-gray-700 prose-li:my-1
                wp-blog-content
              "
              dangerouslySetInnerHTML={{ __html: renderedHTML }}
            />

            {/* Leftover gallery images */}
            {leftoverImages.length > 0 && (
              <div className="mt-14 pt-10 border-t border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-wide">
                  More Images
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {leftoverImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl shadow border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center p-2"
                    >
                      <img
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full object-contain max-h-[360px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* ═══ RIGHT: Sticky Sidebar ═══ */}
          <aside className="w-full lg:w-[32%] lg:sticky lg:top-8 flex flex-col gap-6 shrink-0">

            {/* Article at-a-glance card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                At a Glance
              </p>
              <ul className="flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <Calendar size={18} className="text-[#F9DD19] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Published</p>
                    <p className="text-sm font-bold text-gray-800">
                      {new Date(blog.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BookOpen size={18} className="text-[#F9DD19] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Read Time</p>
                    <p className="text-sm font-bold text-gray-800">{mins} minute{mins !== 1 ? "s" : ""}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Leaf size={18} className="text-[#F9DD19] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Category</p>
                    <p className="text-sm font-bold text-gray-800">
                      {(() => {
                        let cat = blog.category ? blog.category.trim() : 'General';
                        return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
                      })()}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Share card */}
            <div className="bg-black rounded-2xl p-6 flex flex-col items-center text-center gap-4">
              <Share2 size={28} className="text-[#F9DD19]" />
              <p className="text-white font-bold text-base leading-snug">
                Found this useful?<br />Share it with someone!
              </p>
              <button
                onClick={() => handleShare(cleanTitle)}
                className="w-full bg-[#EFDB27] hover:bg-yellow-300 text-black font-black uppercase tracking-widest text-xs px-6 py-3 transition-colors rounded-lg"
              >
                Share Article
              </button>
            </div>

            {/* Back to blog button */}
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center justify-center gap-2 border border-gray-200 bg-white hover:border-[#EFDB27] hover:bg-[#FEFDF8] text-gray-600 hover:text-black font-bold text-sm px-6 py-3.5 rounded-xl transition-all"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Articles
            </button>

          </aside>
        </div>
      </div>

      {/* ── RECOMMENDED READING ── */}
      {recommendations.length > 0 && (
        <section className="bg-[#FEF7DC] border-t border-[#EFDB27]/30 py-16 px-4 md:px-8 lg:px-12 mt-4">
          <div className="max-w-7xl mx-auto">
            {/* heading */}
            <div className="text-center mb-12">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 mb-3">
                Continue Reading
              </p>
              <h3 className="text-3xl md:text-4xl font-black text-black uppercase">
                Recommended{" "}
                <span className="bg-[#EFDB27] px-2 inline-block">Reading</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {recommendations.map((rec) => (
                <SLink
                  key={rec.id}
                  to={`/blog/${rec.id}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  {/* image */}
                  <div className="w-full h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={rec.image}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* text */}
                  <div className="p-5 flex flex-col flex-1 gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {rec.date}
                    </span>
                    <h4
                      className="text-base font-black text-gray-900 leading-snug group-hover:text-[#ff4d2d] transition-colors line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: rec.title }}
                    />
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{rec.description}</p>
                    <span className="mt-auto text-xs font-bold text-[#ff4d2d] uppercase tracking-widest">
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
        className={`fixed bottom-8 right-8 transition-all duration-300 transform ${
          showTopBtn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={goToTop}
          className="p-3.5 bg-[#EFDB27] text-black rounded-full shadow-lg hover:bg-yellow-300 hover:scale-110 active:scale-95 transition-all"
          title="Go to top"
        >
          <ChevronUp size={22} />
        </button>
      </div>
    </div>
  );
};

export default UserBlogDetails;