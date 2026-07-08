import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import {
    Search, Loader2, Users, User, Shield, Edit2, Trash2, X, Save, Phone, Mail, Wallet
} from "lucide-react";
import toast from "react-hot-toast";

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ role: "", wallet: 0, mobile: "" });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/user/admin/all`, { withCredentials: true });
            if (data.success) {
                setCustomers(data.users);
            }
        } catch (error) {
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (customer) => {
        setSelectedCustomer(customer);
        setEditForm({
            role: customer.role || "user",
            wallet: customer.wallet || 0,
            mobile: customer.mobile || ""
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateCustomer = async () => {
        try {
            const { data } = await axios.put(`${serverUrl}/api/user/admin/${selectedCustomer._id}`, editForm, { withCredentials: true });
            if (data.success) {
                toast.success("Customer updated successfully");
                setCustomers(customers.map(c => c._id === selectedCustomer._id ? data.user : c));
                setIsEditModalOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update customer");
        }
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm("CRITICAL: Permanently delete this customer? This action CANNOT be undone.")) return;

        try {
            const { data } = await axios.delete(`${serverUrl}/api/user/admin/${id}`, { withCredentials: true });
            if (data.success) {
                toast.success("Customer deleted successfully");
                setCustomers(customers.filter(c => c._id !== id));
            }
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const filteredCustomers = customers.filter(c => 
        (c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.mobile?.includes(searchTerm))
    );

    const stats = {
        total: customers.length,
        admins: customers.filter(c => c.role === 'admin').length,
        bloggers: customers.filter(c => c.role === 'blogger').length,
        users: customers.filter(c => c.role === 'user').length
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-[#FFDD00] animate-spin" />
            <p className="mt-4 font-black uppercase tracking-widest text-slate-400 text-xs">Loading Customers...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto px-6 pb-20 mt-6 animate-in fade-in duration-500">
            {/* ── TOP METRICS ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Total Customers", val: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Active Admins", val: stats.admins, icon: Shield, color: "text-red-500", bg: "bg-red-50" },
                    { label: "Content Bloggers", val: stats.bloggers, icon: Edit2, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Regular Users", val: stats.users, icon: User, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <h4 className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-left font-mono mt-2">{s.val}</h4>
                        </div>
                        <div className={`${s.bg} p-4 rounded-full`}>
                            <s.icon className={`${s.color} w-6 h-6`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm mb-8 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Customer Directory</h3>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#24672E] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search name, email, mobile..."
                            className="pl-11 pr-6 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none text-[10px] font-bold w-64 md:w-80 focus:border-[#24672E] transition-all shadow-inner shadow-slate-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Customer Info</th>
                                <th className="px-8 py-5">Contact</th>
                                <th className="px-8 py-5">Role & Wallet</th>
                                <th className="px-8 py-5">Joined</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No customers found</p>
                                    </td>
                                </tr>
                            ) : filteredCustomers.map((customer) => (
                                <tr key={customer._id} className="hover:bg-slate-50/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-900 text-[#FFDD00] flex items-center justify-center text-xs font-black uppercase shadow-sm">
                                                {customer.fullName?.substring(0, 2) || "U"}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase">{customer.fullName || "N/A"}</p>
                                                <p className="text-[10px] font-bold text-slate-400 font-mono mt-1">ID: {customer._id.substring(18)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Mail size={12} className="text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-600">{customer.email}</span>
                                        </div>
                                        {customer.mobile && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={12} className="text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-600">{customer.mobile}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-2 items-start">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                                customer.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-200' :
                                                customer.role === 'blogger' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                'bg-blue-50 text-blue-600 border border-blue-200'
                                            }`}>
                                                {customer.role}
                                            </span>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                                                <Wallet size={10} />
                                                <span className="text-[10px] font-black font-mono">₹{customer.wallet || 0}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">
                                            {new Date(customer.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(customer)}
                                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
                                                title="Edit Customer"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCustomer(customer._id)}
                                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                                                title="Delete Customer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── EDIT CUSTOMER MODAL ── */}
            {isEditModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Edit2 size={16} className="text-[#24672E]" /> Edit Customer
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Role</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-[#24672E] transition-all"
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                >
                                    <option value="user">User</option>
                                    <option value="blogger">Blogger</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Wallet Balance (₹)</label>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-[#24672E] transition-all"
                                        value={editForm.wallet}
                                        onChange={(e) => setEditForm({ ...editForm, wallet: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-[#24672E] transition-all"
                                        value={editForm.mobile}
                                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateCustomer}
                                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-white bg-[#24672E] hover:bg-[#1b4d22] transition-all flex items-center gap-2 shadow-lg shadow-[#24672E]/20"
                            >
                                <Save size={14} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
