import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import { ArrowLeft, Upload, Loader2, Save } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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
  const [location, setLocation] = useState(""); // Simple location text
  const [author, setAuthor] = useState(""); // Custom Author
  const [publishedAt, setPublishedAt] = useState(""); // Custom Date
  
  // Images (supporting featured + 4 gallery)
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [image1, setImage1] = useState(null);
  const [preview1, setPreview1] = useState(null);

  const [image2, setImage2] = useState(null);
  const [preview2, setPreview2] = useState(null);

  const [image3, setImage3] = useState(null);
  const [preview3, setPreview3] = useState(null);

  const [image4, setImage4] = useState(null);
  const [preview4, setPreview4] = useState(null);

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
  }, [id, isEditing]);

  const handleImageChange = (e, setter, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
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
        normalizedCategory = normalizedCategory.toUpperCase(); // Store as uppercase in DB for consistency
    }
    formData.append("category", normalizedCategory);

    if (image) formData.append("image", image);
    if (image1) formData.append("image1", image1);
    if (image2) formData.append("image2", image2);
    if (image3) formData.append("image3", image3);
    if (image4) formData.append("image4", image4);
    
    // Blogger features
    formData.append("labels", labels);
    formData.append("status", status);
    formData.append("searchDescription", searchDescription);
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
    return <div className="min-h-screen flex justify-center pt-32 bg-gray-50"><Loader2 className="w-12 h-12 animate-spin text-[#EFDB27]" /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Toaster position="top-center" />
      
      {/* ── HEADER NAVBAR ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/blogs")} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
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
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Blog Title</label>
            <input
              type="text"
              placeholder="Enter a captivating title..."
              className="w-full text-4xl font-black text-black border-none focus:outline-none focus:ring-0 placeholder:text-gray-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Article Body</label>
            </div>
            
            {/* ⚠️ WYSIWYG ENSURANCE: 
                We wrap Jodit in prose standard typographic bounds so it exactly mimics UserBlogDetails.jsx
            */}
            <div className="wp-blog-content-admin w-full">
                <JoditEditor
                    value={description}
                    config={editorConfig}
                    onBlur={(newContent) => setDescription(newContent)}
                    onChange={() => {}} // Handle on blur to avoid cursor jumping
                />
            </div>
          </div>
        </div>

        {/* ── RIGHT: SETTINGS SIDEBAR (25%) ── */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Settings */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">Settings</h3>
            
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Health, Cooking..."
                  className="w-full border-2 border-gray-100 rounded-lg p-3 text-sm font-bold uppercase tracking-wider focus:border-black transition-colors outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Labels (Tags)</label>
                <input
                  type="text"
                  placeholder="e.g. Health, Cooking (comma separated)"
                  className="w-full border-2 border-gray-100 rounded-lg p-3 text-sm font-bold uppercase tracking-wider focus:border-black transition-colors outline-none"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Publishing Status</label>
                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setStatus("LIVE")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${status === "LIVE" ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
                  >
                    Live
                  </button>
                  <button
                    onClick={() => setStatus("DRAFT")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${status === "DRAFT" ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
                  >
                    Draft
                  </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Description (SEO)</label>
                <textarea
                  placeholder="Meta description for search engines..."
                  rows={3}
                  className="w-full border-2 border-gray-100 rounded-lg p-3 text-sm focus:border-black transition-colors outline-none resize-none"
                  value={searchDescription}
                  onChange={(e) => setSearchDescription(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, India"
                  className="w-full border-2 border-gray-100 rounded-lg p-3 text-sm font-bold uppercase tracking-wider focus:border-black transition-colors outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Author Name</label>
                <input
                  type="text"
                  placeholder="Author name..."
                  className="w-full border-2 border-gray-100 rounded-lg p-3 text-sm font-bold uppercase tracking-wider focus:border-black transition-colors outline-none"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Publish Date</label>
                <input
                  type="date"
                  className="w-full border-2 border-gray-100 rounded-lg p-3 text-sm font-bold uppercase tracking-wider focus:border-black transition-colors outline-none"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">Featured Image</h3>
            
            <label className="cursor-pointer group flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl hover:border-[#EFDB27] hover:bg-yellow-50/50 transition-colors">
                <input type="file" className="hidden" onChange={(e) => handleImageChange(e, setImage, setPreview)} accept="image/*" />
                {preview ? (
                    <img src={preview} alt="Featured" className="w-full h-auto object-contain max-h-40 mix-blend-multiply rounded-lg shadow-sm" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-black">
                        <Upload size={24} />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-center mt-2">Upload Cover<br/>Image</span>
                    </div>
                )}
            </label>
          </div>

          {/* Additional Images */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3">Gallery Images</h3>
            
            <div className="grid grid-cols-2 gap-3">
                {[
                    { img: image1, prev: preview1, setImg: setImage1, setPrv: setPreview1, num: 1 },
                    { img: image2, prev: preview2, setImg: setImage2, setPrv: setPreview2, num: 2 },
                    { img: image3, prev: preview3, setImg: setImage3, setPrv: setPreview3, num: 3 },
                    { img: image4, prev: preview4, setImg: setImage4, setPrv: setPreview4, num: 4 }
                ].map((item) => (
                    <label key={item.num} className="cursor-pointer group flex items-center justify-center h-24 border border-gray-200 bg-gray-50 rounded-lg hover:border-[#EFDB27] transition-all overflow-hidden relative">
                        <input type="file" className="hidden" onChange={(e) => handleImageChange(e, item.setImg, item.setPrv)} accept="image/*" />
                        {item.prev ? (
                            <img src={item.prev} alt={`Gallery ${item.num}`} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Img {item.num}</div>
                        )}
                    </label>
                ))}
            </div>
          </div>

        </div>
      </div>
{/* ⚠️ WYSIWYG PROSE MATCH: Re-use the exact CSS rules applied in UserBlogDetails so Admin sees the identical formatting! */}
<style dangerouslySetInnerHTML={{__html: `
.wp-blog-content-admin .jodit-wysiwyg {
  line-height: 1.9;
  font-size: 1.125rem;
  color: #374151; /* text-gray-700 */
}
.jodit-status-bar {
  display: none !important;
}
.jodit-status-bar-link {
  display: none !important;
}
.wp-blog-content-admin h1, .wp-blog-content-admin h2, .wp-blog-content-admin h3 {
  font-weight: 900;
  color: #111827; /* text-gray-900 */
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}
.wp-blog-content-admin a {
  color: #1E971D;
  text-decoration: none;
}
.wp-blog-content-admin a:hover {
  text-decoration: underline;
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
}
.wp-blog-content-admin td, .wp-blog-content-admin th {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
}
`}} />
    </div>
  );
};

export default AdminBlogEditor;
