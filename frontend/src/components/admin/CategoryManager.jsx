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

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        image: "",
        description: ""
    });

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
        setFormData({ name: "", image: "", description: "" });
        setEditMode(false);
        setSelectedId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editMode) {
                await axios.put(`${API_BASE_URL}/api/category/update/${selectedId}`, formData, { withCredentials: true });
                toast.success("Category updated");
            } else {
                await axios.post(`${API_BASE_URL}/api/category/add`, formData, { withCredentials: true });
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
            image: cat.image || "",
            description: cat.description || ""
        });
        setSelectedId(cat._id);
        setEditMode(true);
        setShowModal(true);
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
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-slate-100 p-3 rounded-xl">
                                <Layers className="text-[#1E971D]" size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEditModal(cat)} className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(cat._id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase">{cat.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                            {cat.description || "No description provided."}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-2 rounded-lg">
                            <Type size={12} />
                            <span>Slug: {cat.slug}</span>
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
                                <label className="block text-sm font-bold text-slate-700 mb-1">Image URL (Optional)</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E971D] transition-all"
                                        placeholder="https://..."
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    />
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
        </div>
    );
};

export default CategoryManager;
