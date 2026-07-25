import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import {
    Search, Loader2, Users, User, Shield, Edit2, Trash2, X, Save, Phone, Mail, Wallet, UserPlus, Upload, FileText, CheckCircle2, Download
} from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";

const AdminCustomers = () => {
    const confirm = useConfirm();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ role: "", wallet: 0, mobile: "" });

    // Customer Creation & CSV Import Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        fullName: "",
        email: "",
        mobile: "",
        password: "OwnFresh@123",
        role: "user",
        wallet: 0
    });
    const [csvParsedRecords, setCsvParsedRecords] = useState([]);
    const [csvFileName, setCsvFileName] = useState("");
    const [importingCsv, setImportingCsv] = useState(false);

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

    // Handle Manual Customer Creation
    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        if (!addForm.fullName.trim()) {
            toast.error("Full Name is required");
            return;
        }
        if (!addForm.email.trim() && !addForm.mobile.trim()) {
            toast.error("Either Email or Mobile Number is required");
            return;
        }

        try {
            const { data } = await axios.post(`${serverUrl}/api/user/admin/create`, addForm, { withCredentials: true });
            if (data.success) {
                toast.success("Customer profile created successfully");
                setCustomers([data.user, ...customers]);
                setIsAddModalOpen(false);
                setAddForm({ fullName: "", email: "", mobile: "", password: "OwnFresh@123", role: "user", wallet: 0 });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create customer");
        }
    };

    // Native CSV File Parser
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCsvFileName(file.name);
        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split(/\r\n|\n/);
            if (lines.length < 2) {
                toast.error("CSV file is empty or missing data rows");
                return;
            }

            // Parse Header
            const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
            
            const parsed = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
                const rowObj = {};

                headers.forEach((header, idx) => {
                    const cleanKey = header.toLowerCase().replace(/[^a-z]/g, "");
                    const val = values[idx] || "";

                    if (cleanKey.includes("name") || cleanKey.includes("fullname")) rowObj.fullName = val;
                    else if (cleanKey.includes("email")) rowObj.email = val;
                    else if (cleanKey.includes("phone") || cleanKey.includes("mobile") || cleanKey.includes("number")) rowObj.mobile = val;
                    else if (cleanKey.includes("pass")) rowObj.password = val;
                    else if (cleanKey.includes("wallet")) rowObj.wallet = Number(val) || 0;
                });

                // Fallback direct index matching if header keys didn't match
                if (!rowObj.fullName && values[0]) rowObj.fullName = values[0];
                if (!rowObj.email && values[1] && values[1].includes("@")) rowObj.email = values[1];
                if (!rowObj.mobile && values[2]) rowObj.mobile = values[2];

                if (rowObj.fullName && (rowObj.email || rowObj.mobile)) {
                    parsed.push(rowObj);
                }
            }

            if (parsed.length === 0) {
                toast.error("Could not parse any valid customer rows. Please check CSV format.");
            } else {
                setCsvParsedRecords(parsed);
                toast.success(`Parsed ${parsed.length} valid customer records!`);
            }
        };

        reader.readAsText(file);
    };

    // Bulk Import Submission
    const handleBulkImport = async () => {
        if (csvParsedRecords.length === 0) {
            toast.error("No valid records to import");
            return;
        }

        setImportingCsv(true);
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/user/admin/bulk-create`,
                { customers: csvParsedRecords },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success(data.message);
                fetchCustomers();
                setIsCsvModalOpen(false);
                setCsvParsedRecords([]);
                setCsvFileName("");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Bulk import failed");
        } finally {
            setImportingCsv(false);
        }
    };

    // Download Sample CSV Template
    const downloadSampleCsv = () => {
        const sampleContent = "fullName,email,mobile,password,wallet\nRajesh Kumar,rajesh@example.com,9876543210,OwnFresh@123,100\nPriya Sharma,priya@example.com,9123456789,OwnFresh@123,0";
        const blob = new Blob([sampleContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sample_customers_template.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleEditClick = (customer) => {
        setSelectedCustomer(customer);
        setEditForm({
            role: customer.role || "user",
            wallet: customer.wallet || 0,
            mobile: customer.mobile || "",
            referralCode: customer.referralCode || "N/A"
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
        const isConfirmed = await confirm({
            title: "CRITICAL: Delete Customer?",
            message: "Permanently delete this customer? This action CANNOT be undone.",
            type: "danger",
            confirmText: "Delete Customer"
        });
        if (!isConfirmed) return;

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
            <Loader2 className="w-12 h-12 text-[#F9DD19] animate-spin" />
            <p className="mt-4 font-black uppercase tracking-widest text-slate-400 text-xs">Loading Customers...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto px-6 pb-20 mt-6 animate-in fade-in duration-500 font-sans">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 gap-4">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Customer Directory</h3>
                    
                    {/* Action Buttons & Search */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#1E971D] text-white hover:bg-[#181818] px-4 py-2.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4 text-[#F9DD19]" />
                            <span>Add Customer</span>
                        </button>

                        <button
                            onClick={() => setIsCsvModalOpen(true)}
                            className="bg-[#181818] text-white hover:bg-[#1E971D] px-4 py-2.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4 text-[#F9DD19]" />
                            <span>Import CSV / XLS</span>
                        </button>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#1E971D] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search name, email, mobile..."
                                className="pl-11 pr-6 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none text-[10px] font-bold w-64 md:w-80 focus:border-[#1E971D] transition-all shadow-inner shadow-slate-50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                                                <p className="text-[10px] font-bold text-[#24672E] font-mono mt-1">REF: {customer.referralCode || "N/A"}</p>
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
            <AnimatePresence>
                {isEditModalOpen && selectedCustomer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setIsEditModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden"
                        >
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

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Referral Code (Read-Only)</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none font-black text-xs text-slate-500 uppercase tracking-wider cursor-not-allowed"
                                    value={editForm.referralCode}
                                />
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
                        </motion.div>
                    </div>
                )}

                {/* ── MANUAL CREATE CUSTOMER MODAL ── */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
                        >
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#24672E] text-white flex items-center justify-center">
                                        <UserPlus size={18} className="text-[#FFDD00]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase">Create Customer Profile</h4>
                                        <p className="text-[10px] font-bold text-slate-400">Add an existing or old offline customer to database</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Ramesh Kumar"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-[#24672E] transition-all"
                                        value={addForm.fullName}
                                        onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="ramesh@example.com"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-[#24672E] transition-all"
                                            value={addForm.email}
                                            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="9876543210"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-[#24672E] transition-all"
                                            value={addForm.mobile}
                                            onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                            Temporary Password
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-xs focus:border-[#24672E] transition-all"
                                            value={addForm.password}
                                            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                            Initial Wallet Balance (₹)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-[#24672E] transition-all"
                                            value={addForm.wallet}
                                            onChange={(e) => setAddForm({ ...addForm, wallet: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="px-2 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-medium">
                                    💡 <strong>Note:</strong> Customer will be able to log in using their email/mobile and this temporary password.
                                </div>

                                <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase text-white bg-[#24672E] hover:bg-slate-900 transition-all shadow-md flex items-center gap-2"
                                    >
                                        <UserPlus size={14} /> Create Customer
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* ── CSV / XLS FILE IMPORT MODAL ── */}
                {isCsvModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200"
                        >
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                        <Upload size={18} className="text-[#FFDD00]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase">Import Old Customers (CSV / XLS)</h4>
                                        <p className="text-[10px] font-bold text-slate-400">Bulk upload customer list from spreadsheet</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsCsvModalOpen(false);
                                        setCsvParsedRecords([]);
                                        setCsvFileName("");
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Sample Template Download Button */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-emerald-700" />
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Download CSV Template</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Pre-formatted header columns for instant upload</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={downloadSampleCsv}
                                        className="text-[10px] font-black uppercase text-[#24672E] hover:underline flex items-center gap-1"
                                    >
                                        <Download size={12} /> Download Template
                                    </button>
                                </div>

                                {/* File Dropzone */}
                                <label className="cursor-pointer group flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-[#24672E] bg-slate-50/50 hover:bg-emerald-50/30 transition-all">
                                    <input
                                        type="file"
                                        accept=".csv,.xls,.xlsx,.txt"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#24672E] transition-colors mb-2" />
                                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                        {csvFileName ? `Selected: ${csvFileName}` : "Click to Upload Customer .CSV / .XLS File"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-1">
                                        Supported headers: fullName, email, mobile, password, wallet
                                    </span>
                                </label>

                                {/* Parsed Records Preview */}
                                {csvParsedRecords.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                                            <span className="flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                Parsed {csvParsedRecords.length} Ready-to-Import Customer Profiles
                                            </span>
                                        </div>
                                        
                                        <div className="max-h-40 overflow-y-auto bg-slate-900 text-slate-100 p-3 rounded-xl text-[11px] font-mono space-y-1">
                                            {csvParsedRecords.slice(0, 5).map((rec, idx) => (
                                                <div key={idx} className="truncate">
                                                    #{idx + 1}: {rec.fullName} | {rec.email || "No Email"} | {rec.mobile || "No Mobile"}
                                                </div>
                                            ))}
                                            {csvParsedRecords.length > 5 && (
                                                <div className="text-slate-400 italic pt-1">
                                                    ... and {csvParsedRecords.length - 5} more records
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Import Action Footer */}
                                <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCsvModalOpen(false);
                                            setCsvParsedRecords([]);
                                            setCsvFileName("");
                                        }}
                                        className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={csvParsedRecords.length === 0 || importingCsv}
                                        onClick={handleBulkImport}
                                        className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase text-white bg-[#24672E] hover:bg-slate-900 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {importingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={14} />}
                                        <span>Import {csvParsedRecords.length} Customers</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCustomers;
