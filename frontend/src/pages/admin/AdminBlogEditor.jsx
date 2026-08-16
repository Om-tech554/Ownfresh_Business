import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

import RankMathSEOSidebar from "../../components/admin/seo/RankMathSEOSidebar";

const AdminBlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "create" && id !== "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [labels, setLabels] = useState(""); // Blogger Labels (comma separated)
  const [status, setStatus] = useState("LIVE"); // Blogger Status (LIVE/DRAFT)
  const [searchDescription, setSearchDescription] = useState(""); // SEO
  const [focusKeyword, setFocusKeyword] = useState(""); // RankMath Focus Keyword
  const [slug, setSlug] = useState(""); // SEO URL Slug
  const [location, setLocation] = useState(""); // Simple location text
  const [author, setAuthor] = useState(""); // Custom Author
  const [publishedAt, setPublishedAt] = useState(""); // Custom Date

  // Images (supporting featured + 4 gallery)
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

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Jodit Editor Config for Full Blogger Experience
  const editorConfig = {
    readonly: false,
    placeholder: "Write your masterpiece here...",
    height: 600,
    hidePoweredBy: true,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    style: {
      background: "#ffffff",
      color: "#000000",
    },
    useSplitMode: true,
    buttons: [
      "source", "|",
      "bold", "strikethrough", "underline", "italic", "|",
      "superscript", "subscript", "|",
      "ul", "ol", "|",
      "outdent", "indent", "|",
      "font", "fontsize", "brush", "paragraph", "|",
      "image", "video", "table", "link", "|",
      "align", "undo", "redo", "|",
      "hr", "eraser", "copyformat", "|",
      "symbol", "fullsize", "preview"
    ],
    uploader: {
      insertImageAsBase64URI: true // allows pasting/dropping images directly in the editor flow
    }
  };

  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/blog/${id}`);
          const blog = res.data.blog;
          if (blog) {
            setTitle(blog.title || "");
            setDescription(blog.description || "");
            setCategory(blog.category || "General");
            setPreview(blog.image || null);
            setPreview1(blog.image1 || null);
            setPreview2(blog.image2 || null);
            setPreview3(blog.image3 || null);
            setPreview4(blog.image4 || null);
            setLabels(blog.labels ? blog.labels.join(", ") : "");
            setStatus(blog.status || "LIVE");
            setSearchDescription(blog.searchDescription || "");
            setFocusKeyword(blog.focusKeyword || "");
            setSlug(blog.slug || "");
            setLocation(blog.location ? (typeof blog.location === 'object' ? blog.location.name : blog.location) : "");
            setAuthor(blog.author || "");
            if (blog.publishedAt) {
              setPublishedAt(new Date(blog.publishedAt).toISOString().split('T')[0]);
            }
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
  }, [id, isEditing, API_BASE_URL]);

  const handleImageChange = (e, setter, previewSetter, onSelectCallback) => {
    const file = e.target.files[0];
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
      if (onSelectCallback) onSelectCallback();
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and Description are required!");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    // Normalize category before saving
    let normalizedCategory = category ? category.trim() : 'OTHER';
    if (normalizedCategory.length > 0) {
      normalizedCategory = normalizedCategory.toUpperCase();
    }
    formData.append("category", normalizedCategory);

    if (image) formData.append("image", image);
    if (image1) formData.append("image1", image1);
    if (image2) formData.append("image2", image2);
    if (image3) formData.append("image3", image3);
    if (image4) formData.append("image4", image4);

    // Delete image flags
    if (deleteImage) formData.append("deleteImage", "true");
    if (deleteImage1) formData.append("deleteImage1", "true");
    if (deleteImage2) formData.append("deleteImage2", "true");
    if (deleteImage3) formData.append("deleteImage3", "true");
    if (deleteImage4) formData.append("deleteImage4", "true");

    // Blogger & SEO features
    formData.append("labels", labels);
    formData.append("status", status);
    formData.append("searchDescription", searchDescription);
    formData.append("focusKeyword", focusKeyword);
    formData.append("slug", slug);
    formData.append("location", location);
    formData.append("author", author);
    if (publishedAt) formData.append("publishedAt", new Date(publishedAt).toISOString());

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/blog/update/${id}`, formData);
        toast.success("Blog updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/blog/add`, formData);
        toast.success("Blog published successfully!");
      }
      setTimeout(() => navigate("/blogs"), 1500);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Something went wrong on the server.";
      toast.error(`Failed to save blog: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center pt-32 bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#EFDB27]" />
      </div>
    );
  }

  const galleryImages = [
    { 
      img: image1, 
      prev: preview1, 
      setImg: setImage1, 
      setPrv: setPreview1, 
      num: 1,
      onClear: () => {
        setImage1(null);
        setPreview1(null);
        setDeleteImage1(true);
      },
      onSelect: () => {
        setDeleteImage1(false);
      }
    },
    { 
      img: image2, 
      prev: preview2, 
      setImg: setImage2, 
      setPrv: setPreview2, 
      num: 2,
      onClear: () => {
        setImage2(null);
        setPreview2(null);
        setDeleteImage2(true);
      },
      onSelect: () => {
        setDeleteImage2(false);
      }
    },
    { 
      img: image3, 
      prev: preview3, 
      setImg: setImage3, 
      setPrv: setPreview3, 
      num: 3,
      onClear: () => {
        setImage3(null);
        setPreview3(null);
        setDeleteImage3(true);
      },
      onSelect: () => {
        setDeleteImage3(false);
      }
    },
    { 
      img: image4, 
      prev: preview4, 
      setImg: setImage4, 
      setPrv: setPreview4, 
      num: 4,
      onClear: () => {
        setImage4(null);
        setPreview4(null);
        setDeleteImage4(true);
      },
      onSelect: () => {
        setDeleteImage4(false);
      }
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">

      {/* ── HEADER NAVBAR ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/blogs")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 border-l-2 border-gray-200 pl-4">
            {isEditing ? "Edit Blog Post" : "Draft New Blog Post"}
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#EFDB27] text-black px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? "Save Publishing" : "Publish"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto mt-8 px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── LEFT: EDITOR CANVAS (75%) ── */}
        <div className="lg:col-span-3 space-y-6">

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Blog Title</label>
            <input
              type="text"
              placeholder="Enter a captivating title..."
              className="w-full text-4xl font-black text-black border-none focus:outline-none focus:ring-0 placeholder:text-gray-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Article Body</label>
            </div>

            <div className="wp-blog-content-admin w-full">
              <JoditEditor
                value={description}
                config={editorConfig}
                onBlur={(newContent) => setDescription(newContent)}
                onChange={() => { }}
              />
            </div>
          </div>

        </div>

        {/* ── RIGHT: RANKMATH SEO SIDEBAR & SETTINGS (25%) ── */}
        <div className="lg:col-span-1">
          <RankMathSEOSidebar
            title={title}
            description={description}
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
            galleryImages={galleryImages}
          />
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .wp-blog-content-admin .jodit-wysiwyg {
          font-family: system-ui, -apple-system, sans-serif !important;
          line-height: 1.8 !important;
          font-size: 1.05rem !important;
          color: #334155 !important;
          padding: 1.5rem !important;
        }
        .wp-blog-content-admin .jodit-wysiwyg p {
          margin-top: 0.85rem !important;
          margin-bottom: 0.85rem !important;
          line-height: 1.8 !important;
          font-size: 1.05rem !important;
          color: #334155 !important;
        }
        .wp-blog-content-admin .jodit-wysiwyg h1 {
          font-size: 2.25rem !important;
          font-weight: 900 !important;
          color: #0f172a !important;
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
          line-height: 1.25 !important;
        }
        .wp-blog-content-admin .jodit-wysiwyg h2 {
          font-size: 1.75rem !important;
          font-weight: 900 !important;
          color: #0f172a !important;
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
          line-height: 1.3 !important;
        }
        .wp-blog-content-admin .jodit-wysiwyg h3 {
          font-size: 1.4rem !important;
          font-weight: 850 !important;
          color: #0f172a !important;
          margin-top: 1.75rem !important;
          margin-bottom: 0.75rem !important;
          line-height: 1.35 !important;
        }
        .wp-blog-content-admin .jodit-wysiwyg h4 {
          font-size: 1.2rem !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.4 !important;
        }
        .jodit-status-bar {
          display: none !important;
        }
        .jodit-status-bar-link {
          display: none !important;
        }
        .wp-blog-content-admin a {
          color: #24672E !important;
          font-weight: 700 !important;
          text-decoration: none !important;
          transition: all 0.2s ease !important;
        }
        .wp-blog-content-admin a:hover {
          color: #163f1c !important;
          text-decoration: underline !important;
        }
        .wp-blog-content-admin img {
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .wp-blog-content-admin table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
          border: 1px solid #f1f5f9;
        }
        .wp-blog-content-admin td, .wp-blog-content-admin th {
          padding: 14px 18px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 0.95rem;
        }
        .wp-blog-content-admin th {
          background-color: #f8fafc;
          color: #0f172a;
          font-weight: 800;
          text-align: left;
          border-bottom: 2px solid #e2e8f0;
        }
      `}} />
    </div>
  );
};

export default AdminBlogEditor;
