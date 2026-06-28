import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Plus,
    Trash2,
    Edit,
    Layers,
    X,
    Image as ImageIcon,
    Type
} from "lucide-react";
import toast from "react-hot-toast";
import ImagePickerModal from "./ImagePickerModal";

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });
     const [imageFile, setImageFile] = useState(null);
     const [imagePreview, setImagePreview] = useState("");
     const [showImagePicker, setShowImagePicker] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/category/all`);
            if (res.data.success) {
                setCategories(res.data.categories);
            }
        } catch (error) {
            toast.error("Failed to load categories");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setFormData({ name: "", description: "" });
        setImageFile(null);
        setImagePreview("");
        setEditMode(false);
        setSelectedId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        if (imageFile) {
            data.append("image", imageFile);
        }

        try {
            if (editMode) {
                await axios.put(`${API_BASE_URL}/api/category/update/${selectedId}`, data, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Category updated");
            } else {
                await axios.post(`${API_BASE_URL}/api/category/add`, data, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Category created");
            }
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This may affect products in this category.")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/category/delete/${id}`, { withCredentials: true });
            toast.success("Category deleted");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to delete category");
        }
    };

    const openEditModal = (cat) => {
        setFormData({
            name: cat.name,
            description: cat.description || ""
        });
        setImageFile(null);
        setImagePreview(cat.image || "");
        setSelectedId(cat._id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="px-6 py-8 md:px-12 lg:px-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Layers className="text-[#1E971D] w-8 h-8" />
                        Product <span className="text-[#1E971D]">Categories</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
                        Organize Your Inventory
                    </p>
                </div>

                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-[#1E971D] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#167a17] transition-all shadow-lg shadow-[#1E971D]/20"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <div key={cat._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="relative h-48 overflow-hidden rounded-t-2xl bg-slate-100">
                            {cat.image ? (
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon size={48} className="mb-2 opacity-20" />
                                    <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm">
                                <Layers className="text-[#1E971D]" size={20} />
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                <button
                                    onClick={() => openEditModal(cat)}
                                    className="bg-white p-2 rounded-lg text-blue-500 hover:bg-blue-50 shadow-lg active:scale-95 transition-all"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat._id)}
                                    className="bg-white p-2 rounded-lg text-red-500 hover:bg-red-50 shadow-lg active:scale-95 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{cat.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10 leading-relaxed">
                                {cat.description || "No description provided."}
                            </p>

                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <Type size={12} className="text-[#1E971D]" />
                                <span>Slug: <span className="text-slate-600">{cat.slug}</span></span>
                            </div>
                        </div>
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <Layers className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-bold">No categories found. Start by adding one!</p>
                    </div>
                )}
            </div>

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#1E971D] p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                {editMode ? <Edit size={20} /> : <Plus size={20} />}
                                {editMode ? "Edit Category" : "New Category"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="hover:rotate-90 transition-transform">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Category Name</label>
                                <input
                                    autoFocus
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E971D] transition-all"
                                    placeholder="e.g. Cold Pressed Oils"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Category Image</label>
                                <div className="space-y-4">
                                    {imagePreview && (
                                        <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-200">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(""); }}
                                                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-red-500 hover:bg-red-50 shadow-sm"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-[#1E971D] transition-all group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-[#1E971D] mb-2" />
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                                {imageFile ? "Change Photo" : "Upload Photo"}
                                            </p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setShowImagePicker(true)}
                                        className="w-full bg-slate-900 text-white hover:bg-[#1E971D] py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ImageIcon size={14} />
                                        Choose from Gallery
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E971D] transition-all min-h-[100px] resize-none"
                                    placeholder="Tell us about this category..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-[#1E971D] transition-all transform active:scale-95 disabled:opacity-50 mt-4 shadow-xl"
                            >
                                {loading ? "Processing..." : (editMode ? "Save Changes" : "Create Category")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ImagePickerModal
                isOpen={showImagePicker}
                onClose={() => setShowImagePicker(false)}
                onSelect={(url) => {
                    setImageFile(url);
                    setImagePreview(url);
                    toast.success("Image selected from gallery!");
                }}
            />
        </div>
    );
};

export default CategoryManager;
