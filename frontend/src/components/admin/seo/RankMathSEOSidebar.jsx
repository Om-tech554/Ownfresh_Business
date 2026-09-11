import React, { useState, useMemo, useEffect } from "react";
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
  BookOpen,
  X,
  ExternalLink,
  Plus,
  Search,
  Loader2,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import ImagePickerModal from "../ImagePickerModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

const RankMathSEOSidebar = ({
  title,
  description, // Raw serialized HTML body content
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
  onInsertAiBlocks, // Callback to append/insert blocks into editor
  blocks // Current editor blocks array
}) => {
  const [devicePreview, setDevicePreview] = useState("desktop");
  const [activeTab, setActiveTab] = useState("seo");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [accordionOpen, setAccordionOpen] = useState({
    basic: true,
    additional: true,
    titleReadability: false,
    contentReadability: false,
  });

  // Link Checker & Inserter States
  const [linksStatus, setLinksStatus] = useState({}); // { url: { status, code, message } }
  const [checkingLinks, setCheckingLinks] = useState(false);
  const [addLinkUrl, setAddLinkUrl] = useState("");
  const [anchorList, setAnchorList] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogSearchQuery, setBlogSearchQuery] = useState("");
  const [openImagePickerField, setOpenImagePickerField] = useState(null); // 'cover' | 1 | 2 | 3 | 4

  // AI Tab States
  const [aiPreset, setAiPreset] = useState("outline"); // 'outline' | 'post' | 'article' | 'faq' | 'brief' | 'keywords'
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Helper: Extract plain text from HTML description
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

  // Scanned Links from Content
  const linksInArticle = useMemo(() => {
    if (!description) return [];
    const div = document.createElement("div");
    div.innerHTML = description;
    const anchors = Array.from(div.querySelectorAll("a"));
    return anchors.map((a) => {
      const href = a.getAttribute("href") || "";
      const text = a.textContent || "";
      const isInternal = href.startsWith("/") || href.includes("ownfresh") || href.startsWith("#");
      return { url: href, text, isInternal };
    });
  }, [description]);

  const linkAnalysis = useMemo(() => {
    const internal = linksInArticle.filter(l => l.isInternal).length;
    const external = linksInArticle.length - internal;
    return { internal, external, total: linksInArticle.length };
  }, [linksInArticle]);

  // Pull existing headings for jump links
  const headingList = useMemo(() => {
    if (!description) return [];
    const div = document.createElement("div");
    div.innerHTML = description;
    const headings = Array.from(div.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    return headings.map((h, i) => {
      const text = h.textContent.trim();
      const id = h.getAttribute("id") || `section-${i}`;
      return { text, id, tag: h.tagName.toLowerCase() };
    }).filter(h => h.text.length > 0);
  }, [description]);

  // Auto load existing blog posts list once for search link insertion
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/blog/all?limit=50`);
        if (res.data.success) {
          setBlogPosts(res.data.blogs || []);
        }
      } catch (err) {
        console.warn("Failed to load existing blogs for link suggestion:", err);
      }
    };
    fetchBlogs();
  }, []);

  // Live checker for URLs in body
  const recheckAllLinks = async () => {
    const uniqueUrls = [...new Set(linksInArticle.map(l => l.url))].filter(u => u && !u.startsWith("#"));
    if (uniqueUrls.length === 0) {
      toast.success("No links found to check!");
      return;
    }

    setCheckingLinks(true);
    // Initialize status mapping
    const initStatus = {};
    uniqueUrls.forEach(url => {
      initStatus[url] = { status: "checking", code: null, message: "Validating link..." };
    });
    setLinksStatus(prev => ({ ...prev, ...initStatus }));

    try {
      const res = await axios.post(`${API_BASE_URL}/api/blog/links/check-all`, { links: uniqueUrls }, { withCredentials: true });
      if (res.data.success) {
        const statusMap = {};
        res.data.results.forEach(item => {
          statusMap[item.url] = { status: item.status, code: item.code, message: item.message };
        });
        setLinksStatus(prev => ({ ...prev, ...statusMap }));
        
        const brokenCount = res.data.results.filter(r => r.status === "broken").length;
        if (brokenCount > 0) {
          toast.error(`${brokenCount} broken links detected!`);
        } else {
          toast.success("All links check completed!");
        }
      }
    } catch (err) {
      toast.error("Failed to check links: " + err.message);
    } finally {
      setCheckingLinks(false);
    }
  };

  // Image Alt Check
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
      if (alt && alt !== "blog content image" && alt !== "preview") {
        withAlt++;
        if (keywordLower && alt.includes(keywordLower)) {
          withKeyphraseAlt++;
        }
      }
    });

    return { total: imgs.length, withAlt, withKeyphraseAlt };
  }, [description, focusKeyword]);

  // Heading check
  const headingCheck = useMemo(() => {
    if (!description || !focusKeyword) return false;
    const div = document.createElement("div");
    div.innerHTML = description;
    const headings = Array.from(div.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const keywordLower = focusKeyword.toLowerCase().trim();
    return headings.some((h) => (h.textContent || "").toLowerCase().includes(keywordLower));
  }, [description, focusKeyword]);

  // Keyword Density
  const keywordDensity = useMemo(() => {
    if (!focusKeyword || wordCount === 0) return 0;
    const kwLower = focusKeyword.toLowerCase().trim();
    const matches = (plainTextContent.toLowerCase().match(new RegExp(kwLower, "g")) || []).length;
    const kwWordLength = kwLower.split(/\s+/).length;
    return Number(((matches * kwWordLength / wordCount) * 100).toFixed(2));
  }, [focusKeyword, plainTextContent, wordCount]);

  const hasTOC = useMemo(() => {
    if (!description) return false;
    const lower = description.toLowerCase();
    return lower.includes("toc-container") || lower.includes("table-of-contents") || lower.includes("table of contents") || lower.includes("blog-toc");
  }, [description]);

  const hasImageCaption = useMemo(() => {
    if (!description) return false;
    const lower = description.toLowerCase();
    return lower.includes("<figcaption") || lower.includes("<figure") || lower.includes("figcaption");
  }, [description]);

  // SEO Audit Score Calculations
  const auditRules = useMemo(() => {
    const kw = (focusKeyword || "").toLowerCase().trim();
    const titleLower = (title || "").toLowerCase();
    const descLower = (searchDescription || "").toLowerCase();
    const slugLower = (slug || "").toLowerCase();
    const bodyLower = plainTextContent.toLowerCase();
    const first10Percent = bodyLower.slice(0, Math.max(200, Math.floor(bodyLower.length * 0.1)));

    const secKws = secondaryKeywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
    const secKwsPassed = secKws.length > 0 ? secKws.every(k => bodyLower.includes(k)) : true;

    return [
      {
        id: "kwInTitle",
        category: "basic",
        label: "Focus Keyword in SEO Title",
        passed: Boolean(kw && titleLower.includes(kw)),
        score: 15,
        tip: "Include your primary keyword in the Title.",
      },
      {
        id: "kwTitleStart",
        category: "titleReadability",
        label: "Focus Keyword at start of Title",
        passed: Boolean(kw && titleLower.indexOf(kw) !== -1 && titleLower.indexOf(kw) < 25),
        score: 5,
        tip: "Move keyword closer to the start of Title.",
      },
      {
        id: "kwInMeta",
        category: "basic",
        label: "Focus Keyword in Meta Description",
        passed: Boolean(kw && descLower.includes(kw)),
        score: 15,
        tip: "Mention primary focus keyword in Meta description.",
      },
      {
        id: "kwInSlug",
        category: "basic",
        label: "Focus Keyword in URL Slug",
        passed: Boolean(kw && slugLower.includes(kw.replace(/\s+/g, "-"))),
        score: 10,
        tip: "Incorporate focus keyword into URL slug.",
      },
      {
        id: "kwInIntro",
        category: "basic",
        label: "Focus Keyword in intro paragraph",
        passed: Boolean(kw && first10Percent.includes(kw)),
        score: 10,
        tip: "Mention focus keyword in introductory 10% content.",
      },
      {
        id: "kwInBody",
        category: "basic",
        label: "Focus Keyword in body text",
        passed: Boolean(kw && bodyLower.includes(kw)),
        score: 10,
        tip: "Spread the focus keyword naturally in the body.",
      },
      {
        id: "contentLength",
        category: "basic",
        label: "Word Count >= 600 words",
        passed: wordCount >= 600,
        score: wordCount >= 1000 ? 15 : wordCount >= 600 ? 10 : 0,
        tip: `Currently: ${wordCount} words. Write 600+ words.`,
      },
      {
        id: "kwInHeading",
        category: "additional",
        label: "Focus Keyword in Subheading (H2/H3)",
        passed: headingCheck,
        score: 5,
        tip: "Include keyword in at least one subheading (H2, H3).",
      },
      {
        id: "kwInAlt",
        category: "additional",
        label: "Focus Keyword in Image Alt tag",
        passed: imageAltCheck.withKeyphraseAlt > 0,
        score: 5,
        tip: "Add focus keyword to Alt tag of block images.",
      },
      {
        id: "tableOfContents",
        category: "additional",
        label: "Table of Contents Block",
        passed: hasTOC,
        score: 5,
        tip: "Place a Table of Contents block in the article.",
      },
      {
        id: "imagesWithCaptions",
        category: "additional",
        label: "Image Captions",
        passed: hasImageCaption,
        score: 5,
        tip: "Write a descriptive caption for your images.",
      },
      {
        id: "internalLinks",
        category: "additional",
        label: "Includes Internal Links (>= 1)",
        passed: linkAnalysis.internal >= 1,
        score: 5,
        tip: "Include a link to internal products or pages.",
      },
      {
        id: "externalLinks",
        category: "additional",
        label: "Includes External Links (>= 1)",
        passed: linkAnalysis.external >= 1,
        score: 5,
        tip: "Reference external articles or resources.",
      },
      {
        id: "secondaryKeywords",
        category: "additional",
        label: "Secondary Keywords Present",
        passed: secKwsPassed,
        score: 5,
        tip: "Ensure secondary keywords exist in body content.",
      }
    ];
  }, [
    focusKeyword,
    title,
    searchDescription,
    slug,
    plainTextContent,
    wordCount,
    headingCheck,
    imageAltCheck,
    linkAnalysis,
    hasTOC,
    hasImageCaption,
    secondaryKeywords
  ]);

  const seoScore = useMemo(() => {
    const total = auditRules.reduce((acc, curr) => acc + (curr.passed ? curr.score : 0), 0);
    return Math.min(100, Math.max(0, total));
  }, [auditRules]);

  // AI Operation triggers
  const executeAiGeneration = async () => {
    setAiLoading(true);
    setAiResult(null);

    const payload = {
      title,
      focusKeyword,
      description: searchDescription,
      content: plainTextContent,
      prompt: aiInstructions
    };

    try {
      const endpoint = `${API_BASE_URL}/api/blog/ai/${aiPreset === "keywords" ? "keywords" : aiPreset === "brief" ? "seo-brief" : aiPreset === "faq" ? "faq" : aiPreset === "outline" ? "outline" : "blog-post"}`;
      const res = await axios.post(endpoint, payload, { withCredentials: true });
      if (res.data.success) {
        setAiResult(res.data);
        toast.success("AI generated content successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "AI Call failed. Please check OPENAI_API_KEY.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleInsertAiContent = () => {
    if (!aiResult) return;
    
    let generatedBlocks = [];

    if (aiPreset === "outline" && aiResult.outline?.sections) {
      aiResult.outline.sections.forEach(s => {
        generatedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: "heading", data: { level: 2, content: s.heading } });
        generatedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: "paragraph", data: { content: s.description } });
      });
    } else if (aiPreset === "faq" && aiResult.faq?.faqs) {
      generatedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: "heading", data: { level: 2, content: "Frequently Asked Questions" } });
      aiResult.faq.faqs.forEach(f => {
        generatedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: "callout", data: { type: "info", content: `<strong>Q: ${f.question}</strong><br/>A: ${f.answer}` } });
      });
    } else if (aiPreset === "keywords" && aiResult.keywords?.keywords) {
      setSecondaryKeywords(aiResult.keywords.keywords.join(", "));
      toast.success("Secondary keywords applied directly to SEO tab!");
      setAiResult(null);
      return;
    } else if (aiPreset === "brief" && aiResult.brief) {
      const brief = aiResult.brief;
      generatedBlocks.push({ id: Math.random().toString(36).substr(2, 9), type: "callout", data: { type: "note", content: `<strong>Target Audience:</strong> ${brief.targetAudience}<br/><strong>Recommended Word Count:</strong> ${brief.recommendedLength}<br/><strong>SEO Keywords to target:</strong> ${brief.keyPhrases?.join(", ")}` } });
    } else if (aiResult.article) {
      // HTML output
      onInsertAiBlocks(aiResult.article);
      setAiResult(null);
      return;
    }

    if (generatedBlocks.length > 0) {
      onInsertAiBlocks(generatedBlocks);
      setAiResult(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── SIDEBAR NAVIGATION TABS ── */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex-grow py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "seo" ? "bg-[#24672E] text-white shadow" : "text-slate-500 hover:text-[#24672E]"
          }`}
        >
          <Target className="w-3.5 h-3.5" /> SEO
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex-grow py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "settings" ? "bg-[#24672E] text-white shadow" : "text-slate-500 hover:text-[#24672E]"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("links")}
          className={`flex-grow py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "links" ? "bg-[#24672E] text-white shadow" : "text-slate-500 hover:text-[#24672E]"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" /> Links
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex-grow py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "ai" ? "bg-[#24672E] text-white shadow" : "text-slate-500 hover:text-[#24672E]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Panel
        </button>
      </div>

      {/* ── TAB 1: SEO AUDIT ── */}
      {activeTab === "seo" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow ${
                seoScore >= 90 ? "bg-[#24672E]" : seoScore >= 60 ? "bg-amber-500" : "bg-rose-500"
              }`}>
                {seoScore}%
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">RankMath Optimization Status</span>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      seoScore >= 90 ? "bg-[#24672E]" : seoScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${seoScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Keyword setup fields */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Focus Keyword</label>
                <input
                  type="text"
                  className="w-full border-2 border-slate-100 rounded-xl p-2.5 text-xs font-semibold focus:border-[#24672E] outline-none transition-colors"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. sesame oil health benefits"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secondary Keywords (comma separated)</label>
                <input
                  type="text"
                  className="w-full border-2 border-slate-100 rounded-xl p-2.5 text-xs font-semibold focus:border-[#24672E] outline-none transition-colors"
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  placeholder="e.g. stone pressed, healthy recipes"
                />
              </div>
            </div>
          </div>

          {/* Audit listing */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">SEO Checklist Audits</h4>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {auditRules.map(rule => (
                <div key={rule.id} className="flex items-start gap-2 text-xs">
                  {rule.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-bold ${rule.passed ? "text-slate-800" : "text-rose-950"}`}>{rule.label}</p>
                    {!rule.passed && <p className="text-[10px] text-slate-400 mt-0.5">{rule.tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Google Snippet Preview</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDevicePreview("desktop")}
                  className={`p-1 rounded text-slate-500 ${devicePreview === "desktop" ? "bg-white shadow" : "opacity-50"}`}
                >
                  <Monitor size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setDevicePreview("mobile")}
                  className={`p-1 rounded text-slate-500 ${devicePreview === "mobile" ? "bg-white shadow" : "opacity-50"}`}
                >
                  <Smartphone size={12} />
                </button>
              </div>
            </div>

            <div className={`p-3 bg-white border border-slate-200 rounded-xl space-y-1 ${devicePreview === "mobile" ? "max-w-xs" : ""}`}>
              <p className="text-[10px] text-slate-400 font-mono truncate">https://ownfresh.com › blog › {slug || "url-slug"}</p>
              <h5 className="text-sky-850 font-bold text-sm hover:underline cursor-pointer line-clamp-1">{title || "Post Title"}</h5>
              <p className="text-slate-500 text-[11px] leading-snug line-clamp-2">{searchDescription || "Snippet description..."}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SETTINGS ── */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Publishing settings</h4>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Publish Date</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">URL Slug</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Meta Description</label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none resize-none focus:border-slate-400"
                rows={3}
                value={searchDescription}
                onChange={(e) => setSearchDescription(e.target.value)}
                maxLength={160}
                placeholder="Google meta tag description..."
              />
              <span className="text-[9px] text-slate-400 text-right">{searchDescription?.length || 0}/160 characters</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Labels / Tags (comma separated)</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Author</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location Context</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Featured cover image card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5 text-emerald-700" /> Featured Cover</span>
              {preview && (
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreview(null); }}
                  className="text-[9px] font-bold text-rose-600 hover:underline"
                >
                  Remove Cover
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Featured" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl cursor-pointer text-center hover:bg-slate-800">
                  Upload file
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setImage, setPreview)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setOpenImagePickerField("cover")}
                  className="border border-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl hover:bg-slate-50"
                >
                  Gallery Picker
                </button>
              </div>
            </div>
          </div>

          {/* Gallery items list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#1E971D]" /> Image Gallery Slider Assets
              </h4>
              <span className="text-[9px] font-bold text-slate-400">
                {galleryImages.filter(g => g.prev).length}/4 added
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {galleryImages.map((g) => (
                <div key={g.num} className="border border-slate-200 rounded-xl overflow-hidden aspect-video relative group bg-slate-50 flex items-center justify-center">
                  {g.prev ? (
                    <>
                      <img src={g.prev} alt={`Gallery slot ${g.num}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                        Slot {g.num}
                      </span>
                      <button
                        type="button"
                        onClick={g.onClear}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow cursor-pointer"
                        title="Remove image"
                      >
                        <X size={10} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 p-2 text-center w-full">
                      <span className="text-[9px] font-black text-slate-500 uppercase">Slot {g.num}</span>
                      <div className="flex gap-1 items-center justify-center w-full">
                        <label className="text-[7.5px] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase px-2 py-1 rounded-md cursor-pointer flex items-center gap-0.5">
                          <Upload size={8} /> File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handleImageChange(e, g.setImg, g.setPrv);
                              g.onSelect();
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setOpenImagePickerField(g.num)}
                          className="text-[7.5px] bg-emerald-50 hover:bg-emerald-100 text-[#1E971D] border border-emerald-200 font-black uppercase px-2 py-1 rounded-md cursor-pointer"
                        >
                          Library
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: LINKS AUDITOR ── */}
      {activeTab === "links" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-sky-600" /> Links Auditor
              </h4>
              <button
                type="button"
                onClick={recheckAllLinks}
                disabled={checkingLinks || linksInArticle.length === 0}
                className="bg-sky-50 hover:bg-sky-100 disabled:opacity-50 text-sky-700 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                {checkingLinks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Recheck All
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 p-2 text-center rounded-xl border border-slate-150">
                <span className="text-lg font-black text-slate-800">{linkAnalysis.total}</span>
                <span className="text-[8px] font-black uppercase text-slate-400 block">Total</span>
              </div>
              <div className="bg-emerald-50/50 p-2 text-center rounded-xl border border-emerald-150">
                <span className="text-lg font-black text-emerald-800">{linkAnalysis.internal}</span>
                <span className="text-[8px] font-black uppercase text-emerald-500 block">Internal</span>
              </div>
              <div className="bg-sky-50/50 p-2 text-center rounded-xl border border-sky-150">
                <span className="text-lg font-black text-sky-800">{linkAnalysis.external}</span>
                <span className="text-[8px] font-black uppercase text-sky-500 block">External</span>
              </div>
            </div>
          </div>

          {/* Links List Checked */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Links Verified</h4>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {linksInArticle.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">No hyperlinks found in post body text.</p>
              ) : (
                linksInArticle.map((link, idx) => {
                  const statusInfo = linksStatus[link.url] || { status: "unchecked", message: "Click Recheck All to test URL" };
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-slate-800 truncate flex-1 block">{link.text || "[Empty anchor text]"}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          statusInfo.status === "working" ? "bg-emerald-150 text-emerald-850" : 
                          statusInfo.status === "broken" ? "bg-rose-150 text-rose-850" : "bg-slate-200 text-slate-650"
                        }`}>
                          {statusInfo.status.toUpperCase()}
                        </span>
                      </div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:text-emerald-700 flex items-center gap-1 break-all">
                        {link.url} <ExternalLink size={10} />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: AI PANEL Presets ── */}
      {activeTab === "ai" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> GenAI Presets Assistant
            </h4>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "outline", label: "Blog Outline" },
                { id: "post", label: "Blog Post" },
                { id: "article", label: "Article" },
                { id: "faq", label: "FAQ Generator" },
                { id: "brief", label: "SEO Brief" },
                { id: "keywords", label: "Keyword Ideas" }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setAiPreset(p.id); setAiResult(null); }}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    aiPreset === p.id 
                      ? "bg-[#24672E] border-[#24672E] text-white" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Additional instructions / Tone</label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none resize-none focus:border-[#24672E]"
                rows={3}
                placeholder="e.g. Write in a conversational tone. Focus on stone pressed groundnut oil benefits..."
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={executeAiGeneration}
              disabled={aiLoading}
              className="w-full bg-[#24672E] hover:bg-slate-950 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-colors"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#FFDD00]" />}
              Generate {
                aiPreset === "outline" ? "Blog Outline" :
                aiPreset === "post" ? "Blog Post" :
                aiPreset === "article" ? "Article" :
                aiPreset === "faq" ? "FAQ Generator" :
                aiPreset === "brief" ? "SEO Brief" :
                aiPreset === "keywords" ? "Keyword Ideas" : "Content"
              }
            </button>
          </div>

          {/* AI Result preview */}
          {aiResult && (
            <div className="bg-[#FEFDF8] border-2 border-[#24672E]/30 p-5 rounded-2xl shadow space-y-4">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-[#24672E]/10 pb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" /> AI Output Preview
              </h4>

              <div className="max-h-60 overflow-y-auto pr-1 text-xs text-slate-800 leading-relaxed font-medium space-y-3">
                {aiPreset === "outline" && aiResult.outline?.sections && (
                  <ul className="space-y-3">
                    {aiResult.outline.sections.map((s, i) => (
                      <li key={i} className="border-l-2 border-slate-350 pl-3">
                        <strong className="text-slate-900 block text-xs">{s.heading}</strong>
                        <span className="text-[10px] text-slate-500">{s.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {aiPreset === "faq" && aiResult.faq?.faqs && (
                  <div className="space-y-3">
                    {aiResult.faq.faqs.map((f, i) => (
                      <div key={i} className="bg-slate-50 border p-2 rounded-lg">
                        <strong>Q: {f.question}</strong>
                        <p className="mt-1 text-slate-650">A: {f.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                {aiPreset === "keywords" && aiResult.keywords?.keywords && (
                  <p className="font-mono bg-slate-50 p-2.5 rounded-lg border">{aiResult.keywords.keywords.join(", ")}</p>
                )}
                {aiPreset === "brief" && aiResult.brief && (
                  <div className="space-y-2">
                    <p><strong>Audience:</strong> {aiResult.brief.targetAudience}</p>
                    <p><strong>Target Word Count:</strong> {aiResult.brief.recommendedLength}</p>
                    <p><strong>Keywords:</strong> {aiResult.brief.keyPhrases?.join(", ")}</p>
                  </div>
                )}
                {aiResult.article && (
                  <div dangerouslySetInnerHTML={{ __html: aiResult.article }} />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAiResult(null)}
                  className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleInsertAiContent}
                  className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-bold py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow"
                >
                  Insert to Editor
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── IMAGE PICKER MODAL INSTANCE ── */}
      <ImagePickerModal
        isOpen={openImagePickerField !== null}
        onClose={() => setOpenImagePickerField(null)}
        onSelect={(url) => {
          if (openImagePickerField === "cover") {
            setPreview(url);
            // Cloudinary storage URLs are set directly
            setImage(url); 
          } else if (typeof openImagePickerField === "number") {
            const fieldIndex = openImagePickerField - 1;
            const targetItem = galleryImages[fieldIndex];
            if (targetItem) {
              targetItem.setPrv(url);
              targetItem.setImg(url);
              targetItem.onSelect();
            }
          }
        }}
      />
    </div>
  );
};

export default RankMathSEOSidebar;
