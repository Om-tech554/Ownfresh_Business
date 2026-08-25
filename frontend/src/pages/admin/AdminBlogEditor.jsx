import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Sparkles, ExternalLink, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import RankMathSEOSidebar from "../../components/admin/seo/RankMathSEOSidebar";
import BlogBlockEditor from "../../components/admin/BlogBlockEditor";
import { parseHtmlToBlocks, serializeBlocksToHtml } from "../../utils/HtmlBlockConverter";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AdminBlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "create" && id !== "new";

  // Core Editor States
  const [blocks, setBlocks] = useState([{ id: "1", type: "paragraph", data: { content: "" } }]);
  const [originalBlocks, setOriginalBlocks] = useState([{ id: "1", type: "paragraph", data: { content: "" } }]);

  // Metadata States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [labels, setLabels] = useState(""); 
  const [status, setStatus] = useState("LIVE"); 
  const [location, setLocation] = useState(""); 
  const [author, setAuthor] = useState(""); 
  const [publishedAt, setPublishedAt] = useState(""); 
  const [language, setLanguage] = useState("en"); 

  // originalMetadata for checking dirty state & supporting discards
  const [originalMetadata, setOriginalMetadata] = useState({
    title: "", slug: "", focusKeyword: "", searchDescription: "", category: "OTHER",
    labels: "", status: "LIVE", location: "", author: "", publishedAt: "", language: "en",
    image: null, image1: null, image2: null, image3: null, image4: null
  });

  // Images states (cover + 4 gallery slots)
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [deleteImage, setDeleteImage] = useState(false);

  const [image1, setImage1] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [deleteImage1, setDeleteImage1] = useState(false);

  const [image2, setImage2] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [deleteImage2, setDeleteImage2] = useState(false);

  const [image3, setImage3] = useState(null);
  const [preview3, setPreview3] = useState(null);
  const [deleteImage3, setDeleteImage3] = useState(false);

  const [image4, setImage4] = useState(null);
  const [preview4, setPreview4] = useState(null);
  const [deleteImage4, setDeleteImage4] = useState(false);

  // Layout & UI states
  const [activeTabMobile, setActiveTabMobile] = useState("write"); // 'write' | 'settings'
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Compute raw HTML representation of blocks dynamically
  const contentHtml = useMemo(() => {
    return serializeBlocksToHtml(blocks);
  }, [blocks]);

  // Compute word count
  const wordCount = useMemo(() => {
    const plainText = blocks.map(b => {
      if (b.type === "paragraph" || b.type === "heading" || b.type === "blockquote") {
        return b.data.content || "";
      }
      if (b.type === "list") {
        return b.data.items?.join(" ") || "";
      }
      if (b.type === "callout") {
        return b.data.content || "";
      }
      return "";
    }).join(" ");
    const cleanText = plainText.replace(/<[^>]+>/g, '').trim();
    return cleanText ? cleanText.split(/\s+/).length : 0;
  }, [blocks]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    const blocksChanged = JSON.stringify(blocks) !== JSON.stringify(originalBlocks);
    const metaChanged = 
      title !== originalMetadata.title ||
      slug !== originalMetadata.slug ||
      focusKeyword !== originalMetadata.focusKeyword ||
      searchDescription !== originalMetadata.searchDescription ||
      category !== originalMetadata.category ||
      labels !== originalMetadata.labels ||
      status !== originalMetadata.status ||
      location !== originalMetadata.location ||
      author !== originalMetadata.author ||
      publishedAt !== originalMetadata.publishedAt ||
      language !== originalMetadata.language ||
      image !== originalMetadata.image ||
      image1 !== originalMetadata.image1 ||
      image2 !== originalMetadata.image2 ||
      image3 !== originalMetadata.image3 ||
      image4 !== originalMetadata.image4;
    
    return blocksChanged || metaChanged;
  }, [
    blocks, originalBlocks, title, slug, focusKeyword, searchDescription, category, 
    labels, status, location, author, publishedAt, language, originalMetadata,
    image, image1, image2, image3, image4
  ]);

  // Fetch article data on mount (if editing)
  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/blog/${id}`);
          const blog = res.data.blog;
          if (blog) {
            // Load blocks by parsing description HTML
            const parsedBlocks = parseHtmlToBlocks(blog.description || "");
            setBlocks(parsedBlocks);
            setOriginalBlocks(JSON.parse(JSON.stringify(parsedBlocks)));

            // Load metadata states
            const blogTitle = blog.title || "";
            const blogSlug = blog.slug || "";
            const blogFocusKeyword = blog.focusKeyword || "";
            const blogSearchDesc = blog.searchDescription || "";
            const blogCat = blog.category || "OTHER";
            const blogLabels = blog.labels ? blog.labels.join(", ") : "";
            const blogStatus = blog.status || "LIVE";
            const blogLoc = blog.location ? (typeof blog.location === 'object' ? blog.location.name : blog.location) : "";
            const blogAuth = blog.author || "";
            const blogLang = blog.language || "en";
            let blogDate = "";
            if (blog.publishedAt) {
              blogDate = new Date(blog.publishedAt).toISOString().split('T')[0];
            }

            setTitle(blogTitle);
            setSlug(blogSlug);
            setFocusKeyword(blogFocusKeyword);
            setSearchDescription(blogSearchDesc);
            setCategory(blogCat);
            setLabels(blogLabels);
            setStatus(blogStatus);
            setLocation(blogLoc);
            setAuthor(blogAuth);
            setLanguage(blogLang);
            setPublishedAt(blogDate);

            // Images preview
            setPreview(blog.image || null);
            setImage(blog.image || null);
            setPreview1(blog.image1 || null);
            setImage1(blog.image1 || null);
            setPreview2(blog.image2 || null);
            setImage2(blog.image2 || null);
            setPreview3(blog.image3 || null);
            setImage3(blog.image3 || null);
            setPreview4(blog.image4 || null);
            setImage4(blog.image4 || null);

            // Track original metadata
            setOriginalMetadata({
              title: blogTitle,
              slug: blogSlug,
              focusKeyword: blogFocusKeyword,
              searchDescription: blogSearchDesc,
              category: blogCat,
              labels: blogLabels,
              status: blogStatus,
              location: blogLoc,
              author: blogAuth,
              publishedAt: blogDate,
              language: blogLang,
              image: blog.image || null,
              image1: blog.image1 || null,
              image2: blog.image2 || null,
              image3: blog.image3 || null,
              image4: blog.image4 || null
            });
          }
        } catch (error) {
          toast.error("Failed to load blog details.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchBlog();
    }
  }, [id, isEditing]);

  const handleImageChange = (e, setter, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const discardChanges = () => {
    if (window.confirm("Are you sure you want to discard all unsaved edits?")) {
      setBlocks(JSON.parse(JSON.stringify(originalBlocks)));
      setTitle(originalMetadata.title);
      setSlug(originalMetadata.slug);
      setFocusKeyword(originalMetadata.focusKeyword);
      setSearchDescription(originalMetadata.searchDescription);
      setCategory(originalMetadata.category);
      setLabels(originalMetadata.labels);
      setStatus(originalMetadata.status);
      setLocation(originalMetadata.location);
      setAuthor(originalMetadata.author);
      setLanguage(originalMetadata.language);
      setPublishedAt(originalMetadata.publishedAt);
      
      setImage(originalMetadata.image);
      setPreview(originalMetadata.image);
      setImage1(originalMetadata.image1);
      setPreview1(originalMetadata.image1);
      setImage2(originalMetadata.image2);
      setPreview2(originalMetadata.image2);
      setImage3(originalMetadata.image3);
      setPreview3(originalMetadata.image3);
      setImage4(originalMetadata.image4);
      setPreview4(originalMetadata.image4);
      
      toast.success("All changes discarded.");
    }
  };

  const handleSave = async (forcedStatus = null) => {
    const finalHtml = serializeBlocksToHtml(blocks);
    if (!title.trim()) {
      toast.error("Title is required!");
      return;
    }
    if (!finalHtml.trim()) {
      toast.error("Article content body is required!");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", finalHtml);

    let normalizedCategory = category ? category.trim() : 'OTHER';
    if (normalizedCategory.length > 0) {
      normalizedCategory = normalizedCategory.toUpperCase();
    }
    formData.append("category", normalizedCategory);

    // Cover asset
    if (image instanceof File) {
      formData.append("image", image);
    } else if (image) {
      formData.append("image", image); // Image URL from gallery picker
    }
    
    // Gallery assets
    if (image1 instanceof File) formData.append("image1", image1);
    else if (image1) formData.append("image1", image1);
    if (image2 instanceof File) formData.append("image2", image2);
    else if (image2) formData.append("image2", image2);
    if (image3 instanceof File) formData.append("image3", image3);
    else if (image3) formData.append("image3", image3);
    if (image4 instanceof File) formData.append("image4", image4);
    else if (image4) formData.append("image4", image4);

    // Delete image flags
    if (deleteImage) formData.append("deleteImage", "true");
    if (deleteImage1) formData.append("deleteImage1", "true");
    if (deleteImage2) formData.append("deleteImage2", "true");
    if (deleteImage3) formData.append("deleteImage3", "true");
    if (deleteImage4) formData.append("deleteImage4", "true");

    const targetStatus = forcedStatus || status;

    formData.append("labels", labels);
    formData.append("status", targetStatus);
    formData.append("searchDescription", searchDescription);
    formData.append("focusKeyword", focusKeyword);
    formData.append("slug", slug);
    formData.append("location", location);
    formData.append("author", author);
    formData.append("language", language);
    if (publishedAt) formData.append("publishedAt", new Date(publishedAt).toISOString());

    try {
      let savedBlog;
      if (isEditing) {
        const res = await axios.put(`${API_BASE_URL}/api/blog/update/${id}`, formData, { withCredentials: true });
        savedBlog = res.data.blog;
        toast.success("Blog post saved successfully!");
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/blog/add`, formData, { withCredentials: true });
        savedBlog = res.data.blog;
        toast.success("Blog post published successfully!");
      }

      // Re-initialize dirty validation with saved values
      const parsedBlocks = parseHtmlToBlocks(savedBlog.description);
      setBlocks(parsedBlocks);
      setOriginalBlocks(JSON.parse(JSON.stringify(parsedBlocks)));
      setStatus(savedBlog.status || "LIVE");

      const savedDate = savedBlog.publishedAt ? new Date(savedBlog.publishedAt).toISOString().split('T')[0] : "";

      setOriginalMetadata({
        title: savedBlog.title || "",
        slug: savedBlog.slug || "",
        focusKeyword: savedBlog.focusKeyword || "",
        searchDescription: savedBlog.searchDescription || "",
        category: savedBlog.category || "OTHER",
        labels: savedBlog.labels ? savedBlog.labels.join(", ") : "",
        status: savedBlog.status || "LIVE",
        location: savedBlog.location ? (typeof savedBlog.location === 'object' ? savedBlog.location.name : savedBlog.location) : "",
        author: savedBlog.author || "",
        publishedAt: savedDate,
        language: savedBlog.language || "en",
        image: savedBlog.image || null,
        image1: savedBlog.image1 || null,
        image2: savedBlog.image2 || null,
        image3: savedBlog.image3 || null,
        image4: savedBlog.image4 || null
      });

      if (!isEditing) {
        setTimeout(() => navigate(`/admin/blog/editor/${savedBlog._id}`), 1000);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Server error while saving post.";
      toast.error(`Failed to save blog: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  // Helper for inserting blocks generated from AI tab directly into editor
  const handleInsertAiBlocks = (aiContent) => {
    if (typeof aiContent === "string") {
      const parsed = parseHtmlToBlocks(aiContent);
      setBlocks(prev => [...prev, ...parsed]);
      toast.success("AI content blocks inserted into editor!");
    } else if (Array.isArray(aiContent)) {
      setBlocks(prev => [...prev, ...aiContent]);
      toast.success("AI blocks appended to editor!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 gap-3">
        <Loader2 className="w-12 h-12 animate-spin text-[#24672E]" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Article Workspace...</span>
      </div>
    );
  }

  const galleryList = [
    { 
      img: image1, prev: preview1, setImg: setImage1, setPrv: setPreview1, num: 1,
      onClear: () => { setImage1(null); setPreview1(null); setDeleteImage1(true); },
      onSelect: () => setDeleteImage1(false)
    },
    { 
      img: image2, prev: preview2, setImg: setImage2, setPrv: setPreview2, num: 2,
      onClear: () => { setImage2(null); setPreview2(null); setDeleteImage2(true); },
      onSelect: () => setDeleteImage2(false)
    },
    { 
      img: image3, prev: preview3, setImg: setImage3, setPrv: setPreview3, num: 3,
      onClear: () => { setImage3(null); setPreview3(null); setDeleteImage3(true); },
      onSelect: () => setDeleteImage3(false)
    },
    { 
      img: image4, prev: preview4, setImg: setImage4, setPrv: setPreview4, num: 4,
      onClear: () => { setImage4(null); setPreview4(null); setDeleteImage4(true); },
      onSelect: () => setDeleteImage4(false)
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-16 flex flex-col">

      {/* ── HEADER ACTION NAVBAR ── */}
      <div className="sticky top-0 z-[1000] bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Navigation & Status Labels */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/blogs")}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-650 hover:text-[#24672E] transition-colors shadow-xs"
            title="Back to Posts list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black uppercase tracking-widest text-slate-900 leading-none">
                {isEditing ? "Upgrading Article" : "Draft Workspace"}
              </h1>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                status === "LIVE" ? "bg-emerald-50 text-emerald-800 border-emerald-250" : "bg-amber-50 text-amber-800 border-amber-250"
              }`}>
                {status === "LIVE" ? "Published" : "Draft"}
              </span>
              {isEditing && originalMetadata.status === "LIVE" && status === "LIVE" && (
                <span className="text-[9px] font-bold bg-sky-50 text-sky-850 px-2 py-0.5 rounded-full border border-sky-200">
                  Editing live article
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-[10px] text-slate-400 font-bold">{wordCount} words</span>
              
              {/* Saved/Unsaved state indicator */}
              {isDirty ? (
                <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Unsaved Changes
                </span>
              ) : (
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-250 rounded px-1.5 py-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All Saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Tab switchers */}
        <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-xl text-xs font-bold w-fit border border-slate-200 self-center">
          <button
            type="button"
            onClick={() => setActiveTabMobile("write")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTabMobile === "write" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            Editor Canvas
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMobile("settings")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTabMobile === "settings" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            Management Tabs
          </button>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 justify-end">
          
          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest hidden sm:inline">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none bg-white cursor-pointer hover:border-slate-350 transition-colors"
            >
              <option value="en">English (EN)</option>
              <option value="hi">Hindi (HI)</option>
              <option value="ta">Tamil (TA)</option>
              <option value="te">Telugu (TE)</option>
              <option value="kn">Kannada (KN)</option>
            </select>
          </div>

          {/* View Article */}
          {isEditing && (
            <a
              href={`https://myownfresh.com/blog/${slug || id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all"
            >
              View Article <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Discard changes */}
          <button
            type="button"
            onClick={discardChanges}
            disabled={!isDirty || saving}
            className="flex items-center gap-1 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 text-slate-750 px-4 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all"
            title="Discard current unsaved changes"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Discard
          </button>

          {/* Publish / Unpublish toggles */}
          {status === "DRAFT" ? (
            <button
              onClick={() => handleSave("LIVE")}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl uppercase text-[10px] tracking-wider shadow transition-all disabled:opacity-50"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={() => handleSave("DRAFT")}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-xl uppercase text-[10px] tracking-wider shadow transition-all disabled:opacity-50"
            >
              Unpublish
            </button>
          )}

          {/* Save/Update Button */}
          <button
            onClick={() => handleSave()}
            disabled={saving || !isDirty}
            className="flex items-center gap-1.5 bg-[#EFDB27] text-black px-5 py-1.5 rounded-xl font-extrabold uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all disabled:opacity-55"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* ── TWO COLUMN WORKSPACE ── */}
      <div className="max-w-7xl mx-auto mt-6 px-4 md:px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow w-full">

        {/* ── LEFT: EDITOR CANVAS (75%) ── */}
        <div className={`lg:col-span-3 space-y-6 ${activeTabMobile === "write" ? "block" : "hidden lg:block"}`}>
          
          {/* Article Title input header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Article Title</label>
            <input
              type="text"
              placeholder="Enter a captivating article title..."
              className="w-full text-3xl font-black text-slate-900 border-none focus:outline-none focus:ring-0 placeholder:text-slate-200 outline-none leading-tight"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isEditing) {
                  // Prepopulate Slug
                  setSlug(e.target.value.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-"));
                }
              }}
            />
          </div>

          {/* Block Editor Workspace Canvas */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block leading-none border-b border-slate-100 pb-3">Article Content Blocks</label>
            <BlogBlockEditor
              blocks={blocks}
              onChange={setBlocks}
            />
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR MANAGEMENT SUITE (25%) ── */}
        <div className={`lg:col-span-1 lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 lg:overflow-y-auto ${
          activeTabMobile === "settings" ? "block" : "hidden lg:block"
        }`}>
          <RankMathSEOSidebar
            title={title}
            description={contentHtml}
            focusKeyword={focusKeyword}
            setFocusKeyword={setFocusKeyword}
            slug={slug}
            setSlug={setSlug}
            searchDescription={searchDescription}
            setSearchDescription={setSearchDescription}
            category={category}
            setCategory={setCategory}
            labels={labels}
            setLabels={setLabels}
            status={status}
            setStatus={setStatus}
            location={location}
            setLocation={setLocation}
            author={author}
            setAuthor={setAuthor}
            publishedAt={publishedAt}
            setPublishedAt={setPublishedAt}
            image={image}
            preview={preview}
            handleImageChange={handleImageChange}
            setImage={setImage}
            setPreview={setPreview}
            galleryImages={galleryList}
            onInsertAiBlocks={handleInsertAiBlocks}
            blocks={blocks}
          />
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Utility styles for formatting elements within Block Editor editable areas */
        .editable-area[contenteditable]:empty:before {
          content: attr(placeholder);
          color: #cbd5e1;
          font-weight: 500;
          cursor: text;
        }
        
        .editable-area b, .editable-area strong {
          font-weight: 800;
        }
        
        .editable-area i, .editable-area em {
          font-style: italic;
        }
        
        .editable-area a {
          color: #24672E !important;
          text-decoration: underline !important;
          font-weight: 700;
        }
        
        .editable-area u {
          text-decoration: underline;
        }
        
        .editable-area strike, .editable-area s {
          text-decoration: line-through;
        }
        
        /* Slide up animation for slash commands */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.18s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default AdminBlogEditor;
