import React, { useState, useMemo } from "react";
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Smartphone,
  Monitor,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Sparkles,
  Upload,
  BookOpen
} from "lucide-react";

/**
 * RankMathSEOSidebar
 * Positioned on the RIGHT side of the Blog Editor.
 * Includes complete RankMath SEO protocol analysis, 0-100 score engine targeting 90+,
 * Google preview, slug suggestion, link auditor, and general blog settings.
 */
const RankMathSEOSidebar = ({
  title,
  description,
  focusKeyword,
  setFocusKeyword,
  slug,
  setSlug,
  searchDescription,
  setSearchDescription,
  category,
  setCategory,
  labels,
  setLabels,
  status,
  setStatus,
  location,
  setLocation,
  author,
  setAuthor,
  publishedAt,
  setPublishedAt,
  image,
  preview,
  handleImageChange,
  setImage,
  setPreview,
  galleryImages,
}) => {
  const [devicePreview, setDevicePreview] = useState("desktop"); // 'desktop' | 'mobile'
  const [activeTab, setActiveTab] = useState("seo"); // 'seo' | 'settings' | 'links'
  const [accordionOpen, setAccordionOpen] = useState({
    basic: true,
    additional: true,
    titleReadability: false,
    contentReadability: false,
  });

  // Helper: Extract plain text from HTML
  const plainTextContent = useMemo(() => {
    if (!description) return "";
    const div = document.createElement("div");
    div.innerHTML = description;
    return div.textContent || div.innerText || "";
  }, [description]);

  // Word count
  const wordCount = useMemo(() => {
    const trimmed = plainTextContent.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [plainTextContent]);

  // Auto Slug Generator if blank
  const generatedSlug = useMemo(() => {
    if (slug) return slug;
    const base = focusKeyword || title || "";
    return base
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [slug, focusKeyword, title]);

  // Extract links from HTML
  const linkAnalysis = useMemo(() => {
    if (!description) return { internal: 0, external: 0, links: [] };
    const div = document.createElement("div");
    div.innerHTML = description;
    const anchors = Array.from(div.querySelectorAll("a"));
    let internal = 0;
    let external = 0;

    anchors.forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (
        href.startsWith("/") ||
        href.includes("ownfresh") ||
        href.startsWith("#")
      ) {
        internal++;
      } else if (href.startsWith("http")) {
        external++;
      }
    });

    return { internal, external, count: anchors.length };
  }, [description]);

  // Image Alt text check from HTML content
  const imageAltCheck = useMemo(() => {
    if (!description) return { total: 0, withAlt: 0, withKeyphraseAlt: 0 };
    const div = document.createElement("div");
    div.innerHTML = description;
    const imgs = Array.from(div.querySelectorAll("img"));
    const keywordLower = (focusKeyword || "").toLowerCase().trim();

    let withAlt = 0;
    let withKeyphraseAlt = 0;

    imgs.forEach((img) => {
      const alt = (img.getAttribute("alt") || "").toLowerCase().trim();
      if (alt && alt !== "blog content image") {
        withAlt++;
        if (keywordLower && alt.includes(keywordLower)) {
          withKeyphraseAlt++;
        }
      }
    });

    return { total: imgs.length, withAlt, withKeyphraseAlt };
  }, [description, focusKeyword]);

  // Check Heading Tags for Focus Keyword
  const headingCheck = useMemo(() => {
    if (!description || !focusKeyword) return false;
    const div = document.createElement("div");
    div.innerHTML = description;
    const headings = Array.from(div.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const keywordLower = focusKeyword.toLowerCase().trim();
    return headings.some((h) => (h.textContent || "").toLowerCase().includes(keywordLower));
  }, [description, focusKeyword]);

  // Keyword Density Calculation
  const keywordDensity = useMemo(() => {
    if (!focusKeyword || wordCount === 0) return 0;
    const kwLower = focusKeyword.toLowerCase().trim();
    const matches = (plainTextContent.toLowerCase().match(new RegExp(kwLower, "g")) || []).length;
    const kwWordLength = kwLower.split(/\s+/).length;
    return Number(((matches * kwWordLength / wordCount) * 100).toFixed(2));
  }, [focusKeyword, plainTextContent, wordCount]);

  // Comprehensive RankMath Audit Rules & Scores
  const auditRules = useMemo(() => {
    const kw = (focusKeyword || "").toLowerCase().trim();
    const titleLower = (title || "").toLowerCase();
    const descLower = (searchDescription || "").toLowerCase();
    const slugLower = (generatedSlug || "").toLowerCase();
    const bodyLower = plainTextContent.toLowerCase();
    const first10Percent = bodyLower.slice(0, Math.max(200, Math.floor(bodyLower.length * 0.1)));

    const rules = [
      {
        id: "kwInTitle",
        category: "basic",
        label: "Focus Keyword in SEO Title",
        passed: Boolean(kw && titleLower.includes(kw)),
        score: 15,
        tip: "Add your focus keyword to the Blog Title.",
      },
      {
        id: "kwTitleStart",
        category: "titleReadability",
        label: "Focus Keyword near start of Title",
        passed: Boolean(kw && titleLower.indexOf(kw) !== -1 && titleLower.indexOf(kw) < 25),
        score: 5,
        tip: "Place focus keyword near the beginning of Title.",
      },
      {
        id: "kwInMeta",
        category: "basic",
        label: "Focus Keyword in Meta Description",
        passed: Boolean(kw && descLower.includes(kw)),
        score: 15,
        tip: "Include focus keyword in your Meta Description.",
      },
      {
        id: "kwInSlug",
        category: "basic",
        label: "Focus Keyword in URL Slug",
        passed: Boolean(kw && slugLower.includes(kw.replace(/\s+/g, "-"))),
        score: 10,
        tip: "Include focus keyword in the URL slug.",
      },
      {
        id: "kwInIntro",
        category: "basic",
        label: "Focus Keyword in First 10% of Content",
        passed: Boolean(kw && first10Percent.includes(kw)),
        score: 10,
        tip: "Mention focus keyword in your introductory paragraph.",
      },
      {
        id: "kwInBody",
        category: "basic",
        label: "Focus Keyword found in Content Body",
        passed: Boolean(kw && bodyLower.includes(kw)),
        score: 10,
        tip: "Use the focus keyword naturally within article body.",
      },
      {
        id: "contentLength",
        category: "basic",
        label: "Content Length (>= 600 words)",
        passed: wordCount >= 600,
        score: wordCount >= 1000 ? 15 : wordCount >= 600 ? 10 : 0,
        tip: wordCount < 600 ? `Currently ${wordCount} words. Aim for 600+ words.` : "Great content length!",
      },
      {
        id: "kwInHeading",
        category: "additional",
        label: "Focus Keyword in Subheadings (H2/H3)",
        passed: headingCheck,
        score: 5,
        tip: "Use focus keyword inside at least one H2 or H3 heading.",
      },
      {
        id: "kwInAlt",
        category: "additional",
        label: "Focus Keyword in Image Alt Text",
        passed: imageAltCheck.withKeyphraseAlt > 0,
        score: 5,
        tip: "Add focus keyword to your content image Alt Text.",
      },
      {
        id: "internalLinks",
        category: "additional",
        label: "Internal Links in Content",
        passed: linkAnalysis.internal > 0,
        score: 5,
        tip: "Add at least 1 internal link (e.g. to /shop, /products, /blog).",
      },
      {
        id: "externalLinks",
        category: "additional",
        label: "External Links in Content",
        passed: linkAnalysis.external > 0,
        score: 5,
        tip: "Add at least 1 external reference link.",
      },
    ];

    return rules;
  }, [
    focusKeyword,
    title,
    searchDescription,
    generatedSlug,
    plainTextContent,
    wordCount,
    headingCheck,
    imageAltCheck,
    linkAnalysis,
  ]);

  // Total RankMath Score (0 - 100)
  const rankMathScore = useMemo(() => {
    const total = auditRules.reduce((acc, curr) => acc + (curr.passed ? curr.score : 0), 0);
    return Math.min(100, Math.max(0, total));
  }, [auditRules]);

  // Score Color & Grade
  const scoreBadge = useMemo(() => {

    if (rankMathScore >= 80) {
      return {
        bg: "bg-emerald-500",
        text: "text-emerald-500",
        border: "border-emerald-500",
        lightBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        label: "Great (90+ Target Ready)",
      };
    } else if (rankMathScore >= 50) {
      return {
        bg: "bg-amber-500",
        text: "text-amber-500",
        border: "border-amber-500",
        lightBg: "bg-amber-50 text-amber-800 border-amber-200",
        label: "Good (Needs Optimization)",
      };
    }
    return {
      bg: "bg-rose-500",
      text: "text-rose-500",
      border: "border-rose-500",
      lightBg: "bg-rose-50 text-rose-800 border-rose-200",
      label: "Needs Work",
    };
  }, [rankMathScore]);

  const toggleAccordion = (key) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Auto-Generate All SEO Fields from Title & Content
  const handleAutoGenerateSEO = () => {
    // 1. Focus Keyword from Title
    if (title) {
      // Pick first 2-4 meaningful words
      const words = title
        .trim()
        .replace(/[^\w\s]/gi, "")
        .split(/\s+/)
        .slice(0, 4)
        .join(" ");
      if (words) setFocusKeyword(words);
    }

    // 2. Slug from Title / Focus Keyword
    const baseForSlug = title || focusKeyword || "blog-post";
    const autoSlug = baseForSlug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);

    // 3. Meta Description from Content
    if (plainTextContent) {
      const excerpt = plainTextContent.trim().slice(0, 155);
      setSearchDescription(excerpt + (plainTextContent.length > 155 ? "..." : ""));
    }
  };

  const passedCount = useMemo(() => {
    return auditRules.filter((r) => r.passed).length;
  }, [auditRules]);

  const failedRules = useMemo(() => {
    return auditRules.filter((r) => !r.passed);
  }, [auditRules]);

  const passedRules = useMemo(() => {
    return auditRules.filter((r) => r.passed);
  }, [auditRules]);

  return (
    <div className="space-y-6">
      {/* Top Sidebar Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "seo"
              ? "bg-[#1E971D] text-white shadow-xs"
              : "text-slate-500 hover:text-[#1E971D]"
          }`}
        >
          <Target className="w-3.5 h-3.5" /> SEO Score
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("links")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === "links"
            ? "bg-[#1E971D] text-white shadow-xs"
            : "text-slate-500 hover:text-[#1E971D]"
            }`}
        >
          <LinkIcon className="w-3.5 h-3.5" /> Links
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === "settings"
            ? "bg-[#1E971D] text-white shadow-xs"
            : "text-slate-500 hover:text-[#1E971D]"
            }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Settings
        </button>
      </div>

      {/* ────────────────── TAB 1: RANKMATH SEO SUITE ────────────────── */}
      {activeTab === "seo" && (
        <div className="space-y-5">
          {/* Main RankMath Score & Auto-Generate Box (Exact Match to Screenshot) */}
          <div className="bg-white p-5 rounded-2xl border-2 border-rose-200 shadow-sm space-y-4">

            {/* Top Score Box */}
            <div className="flex items-center gap-4">
              {/* Numeric Score Box */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-sm shrink-0 ${rankMathScore >= 80
                  ? "bg-[#24672E]"
                  : rankMathScore >= 50
                    ? "bg-amber-500"
                    : "bg-rose-600"
                  }`}
              >
                {rankMathScore}
              </div>

              {/* Title & Audit Progress */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <Sparkles className="w-4 h-4 text-[#24672E]" />
                  <span>SEO Score</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${rankMathScore >= 80
                      ? "bg-[#24672E]"
                      : rankMathScore >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                      }`}
                    style={{ width: `${rankMathScore}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                  {passedCount}/{auditRules.length} audits passed
                </span>
              </div>
            </div>

            {/* OwnFresh Auto-Generate SEO Fields Button */}
            <button
              type="button"
              onClick={handleAutoGenerateSEO}
              className="w-full bg-[#24672E] text-white hover:bg-slate-900 py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-[#FFDD00] group-hover:rotate-12 transition-transform" />
              <span>Auto-Generate SEO Fields</span>
            </button>

            {/* Focus Keyword Section */}
            <div className="pt-2 space-y-1.5 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">
                FOCUS KEYWORD
              </label>
              <input
                type="text"
                placeholder="e.g. cold pressed sesame oil benefits"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:border-[#24672E] outline-none transition-colors"
              />
              <span className="text-[10px] text-slate-400 font-medium block">
                The keyword you want this article to rank for on Google.
              </span>
            </div>

            {/* Issues to Fix Checklist (Exact Screenshot Match) */}
            {failedRules.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-black text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>ISSUES TO FIX ({failedRules.length})</span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {failedRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start gap-2.5"
                    >
                      <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-900">{rule.label}</p>
                          <span className="text-[10px] font-black text-rose-600 font-mono">
                            0/{rule.score}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-700 font-medium mt-0.5">{rule.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passed Audits Accordion */}
            {passedRules.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs font-extrabold text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{passedRules.length} checks passed ✓</span>
                </div>
              </div>
            )}
          </div>

          {/* Focus Keyword & Slug Input Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#24672E]" /> Permalink & URL Slug
            </h3>

            {/* Permalink Slug */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  URL Permalink Slug
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const suggested = (focusKeyword || title || "")
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, "")
                      .replace(/[\s_-]+/g, "-");
                    setSlug(suggested);
                  }}
                  className="text-[9px] font-black text-[#24672E] hover:underline"
                >
                  Auto-Suggest
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. cold-pressed-sesame-oil-benefits"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:border-[#24672E] outline-none transition-colors"
              />
              <span className="text-[10px] text-slate-400 font-mono truncate">
                Preview: https://ownfresh.com/blog/<strong>{generatedSlug || "post-slug"}</strong>
              </span>
            </div>
          </div>

          {/* Meta Description & Google Search Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" /> Google Search Snippet
              </h3>
              {/* Desktop / Mobile Switch */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDevicePreview("desktop")}
                  className={`p-1.5 rounded-lg text-xs transition-all ${devicePreview === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"
                    }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDevicePreview("mobile")}
                  className={`p-1.5 rounded-lg text-xs transition-all ${devicePreview === "mobile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"
                    }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Google Search Result Card Mockup */}
            <div
              className={`bg-white p-4 border border-slate-200 rounded-2xl shadow-xs space-y-1.5 font-sans ${devicePreview === "mobile" ? "max-w-xs mx-auto" : "w-full"
                }`}
            >
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-5 h-5 bg-[#FFDD00] rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 border border-amber-300">
                  O
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-slate-900 text-[11px]">Own Fresh</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-xs">
                    https://ownfresh.com › blog › {generatedSlug || "your-slug"}
                  </span>
                </div>
              </div>

              <h4 className="text-sky-800 text-sm font-bold hover:underline cursor-pointer line-clamp-1">
                {title || "Enter Blog Post Title Here"}
              </h4>

              <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                {searchDescription ||
                  "Provide a compelling search description to attract readers from Google search results."}
              </p>
            </div>

            {/* Meta Description Textarea */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Search Meta Description
                </label>
                <span
                  className={`text-[10px] font-bold ${searchDescription.length >= 120 && searchDescription.length <= 160
                    ? "text-emerald-600"
                    : "text-amber-600"
                    }`}
                >
                  {searchDescription.length} / 160 chars
                </span>
              </div>
              <textarea
                placeholder="Write an attractive meta description containing your focus keyphrase..."
                rows={3}
                value={searchDescription}
                onChange={(e) => setSearchDescription(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs font-medium focus:border-[#24672E] outline-none resize-none transition-colors"
              />
            </div>
          </div>

          {/* 90+ Detailed SEO Audits Accordions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Complete Audit Categories
            </h3>

            {/* Basic SEO Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("basic")}
                className="w-full bg-slate-50 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>Basic SEO Protocol Audit</span>
                {accordionOpen.basic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {accordionOpen.basic && (
                <div className="p-4 space-y-3 bg-white">
                  {auditRules
                    .filter((r) => r.category === "basic")
                    .map((rule) => (
                      <div key={rule.id} className="flex items-start gap-2.5">
                        {rule.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800">{rule.label}</p>
                          <p className="text-[11px] text-slate-500">{rule.tip}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Additional SEO Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("additional")}
                className="w-full bg-slate-50 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>Additional & Media SEO</span>
                {accordionOpen.additional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {accordionOpen.additional && (
                <div className="p-4 space-y-3 bg-white">
                  {auditRules
                    .filter((r) => r.category === "additional")
                    .map((rule) => (
                      <div key={rule.id} className="flex items-start gap-2.5">
                        {rule.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800">{rule.label}</p>
                          <p className="text-[11px] text-slate-500">{rule.tip}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Title Readability Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("titleReadability")}
                className="w-full bg-slate-50 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>Title Readability</span>
                {accordionOpen.titleReadability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {accordionOpen.titleReadability && (
                <div className="p-4 space-y-3 bg-white">
                  {auditRules
                    .filter((r) => r.category === "titleReadability")
                    .map((rule) => (
                      <div key={rule.id} className="flex items-start gap-2.5">
                        {rule.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800">{rule.label}</p>
                          <p className="text-[11px] text-slate-500">{rule.tip}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 2: LINK AUDITOR ────────────────── */}
      {activeTab === "links" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-emerald-600" /> Internal & External Link Auditor
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
              <span className="text-2xl font-black text-emerald-800">{linkAnalysis.internal}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mt-0.5">
                Internal Links
              </span>
            </div>

            <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-center">
              <span className="text-2xl font-black text-sky-800">{linkAnalysis.external}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block mt-0.5">
                External Links
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs text-gray-600 leading-relaxed">
              {linkAnalysis.internal > 0
                ? "✅ Excellent! You have included internal links to connect readers with other site pages."
                : "💡 Recommended: Add internal links pointing to /shop, products, or other blog posts."}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {linkAnalysis.external > 0
                ? "✅ Great! External links build authority according to RankMath standards."
                : "💡 Recommended: Add relevant external links to trusted sources."}
            </p>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 3: SETTINGS ────────────────── */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* General Blog Settings */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">
              Publishing Settings
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Health, Cooking..."
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold uppercase tracking-wider focus:border-black outline-none transition-colors"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Labels / Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Organic, Sesame, Health"
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold uppercase tracking-wider focus:border-black outline-none transition-colors"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Publishing Status
              </label>
              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatus("LIVE")}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${status === "LIVE" ? "bg-white text-black shadow-xs" : "text-gray-400"
                    }`}
                >
                  Live
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("DRAFT")}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${status === "DRAFT" ? "bg-white text-black shadow-xs" : "text-gray-400"
                    }`}
                >
                  Draft
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, India"
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold uppercase tracking-wider focus:border-black outline-none transition-colors"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Author Name
              </label>
              <input
                type="text"
                placeholder="Author name..."
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold uppercase tracking-wider focus:border-black outline-none transition-colors"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Publish Date
              </label>
              <input
                type="date"
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-xs font-bold uppercase tracking-wider focus:border-black outline-none transition-colors"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>
          </div>

          {/* Featured Cover Image */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" /> Featured Cover Image
            </h3>

            <label className="cursor-pointer group flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl hover:border-[#EFDB27] transition-all">
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleImageChange(e, setImage, setPreview)}
                accept="image/*"
              />
              {preview ? (
                <img
                  src={preview}
                  alt="Featured"
                  className="w-full h-auto object-contain max-h-40 rounded-lg shadow-xs"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-black">
                  <Upload size={24} />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-center mt-2">
                    Upload Main<br />Cover Image
                  </span>
                </div>
              )}
            </label>
          </div>

          {/* Gallery Images */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">
              Gallery Images
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {galleryImages.map((item) => (
                <label
                  key={item.num}
                  className="cursor-pointer group flex items-center justify-center h-24 border border-gray-200 bg-gray-50 rounded-xl hover:border-[#EFDB27] transition-all overflow-hidden relative"
                >
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, item.setImg, item.setPrv)}
                    accept="image/*"
                  />
                  {item.prev ? (
                    <img
                      src={item.prev}
                      alt={`Gallery ${item.num}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                      Img {item.num}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankMathSEOSidebar;
