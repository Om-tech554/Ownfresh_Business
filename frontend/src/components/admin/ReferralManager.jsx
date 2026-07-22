import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
    Search, Download, CheckCircle, XCircle, Users, Ticket, Check, X,
    Layers, ShoppingBag, DollarSign, Loader2, ArrowUpDown, ChevronLeft, ChevronRight, Eye
} from "lucide-react";
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { serverUrl } from "../../App";

const ReferralManager = () => {
    // State lists
    const [referrals, setReferrals] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);

    // Queries, Filters, Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    // Modal & Action states
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [notes, setNotes] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const limit = 8;

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const { data } = await axios.get(`${serverUrl}/api/referral/admin/stats`, { withCredentials: true });
            if (data.success) {
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to load admin stats:", err);
            toast.error("Failed to load referral analytics.");
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchReferrals = async () => {
        setLoadingList(true);
        try {
            const params = {
                page: currentPage,
                limit,
                search: searchTerm,
                status: statusFilter,
                sortField,
                sortOrder
            };
            const { data } = await axios.get(`${serverUrl}/api/referral/admin/all`, { params, withCredentials: true });
            if (data.success) {
                setReferrals(data.referrals);
                setTotalPages(data.pagination.pages);
            }
        } catch (err) {
            console.error("Failed to load admin referrals:", err);
            toast.error("Failed to load referral list.");
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchReferrals();
    }, [currentPage, statusFilter, sortField, sortOrder]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchReferrals();
    };

    const handleSort = (field) => {
        const order = sortField === field && sortOrder === "desc" ? "asc" : "desc";
        setSortField(field);
        setSortOrder(order);
    };

    const triggerExport = () => {
        window.open(`${serverUrl}/api/referral/admin/export`, "_blank");
        toast.success("Downloading CSV report...");
    };

    const handleProcessReferral = async (status) => {
        setActionLoading(true);
        try {
            const endpoint = `${serverUrl}/api/referral/admin/${status.toLowerCase()}/${selectedReferral._id}`;
            const { data } = await axios.put(endpoint, { notes }, { withCredentials: true });
            if (data.success) {
                toast.success(`Referral successfully ${status.toLowerCase()}d!`);
                setIsApproveOpen(false);
                setIsRejectOpen(false);
                setNotes("");
                fetchStats();
                fetchReferrals();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to process referral.`);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pb-16 space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Referrals & Affiliates Manager</h2>
                    <p className="text-slate-500 font-bold text-xs mt-1">Audit pending purchases, verify payouts, and view conversion stats.</p>
                </div>
                <button 
                    onClick={triggerExport}
                    className="flex items-center justify-center gap-2 bg-[#1E971D] hover:bg-[#177A16] text-white rounded-xl py-3 px-5 text-xs font-black uppercase tracking-wider transition duration-200 active:scale-[0.98] shadow-md shadow-[#1E971D]/10 cursor-pointer"
                >
                    <Download size={14} />
                    Export CSV Report
                </button>
            </div>

            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {/* Total Codes */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-slate-700 rounded-xl">
                        <Ticket size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Generated Codes</p>
                        <h3 className="text-xl font-black text-slate-950 mt-1">
                            {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : stats?.summary?.totalCodes || 0}
                        </h3>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Layers size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Audit</p>
                        <h3 className="text-xl font-black text-slate-950 mt-1">
                            {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : stats?.summary?.pending || 0}
                        </h3>
                    </div>
                </div>

                {/* Approved */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Approved Rewards</p>
                        <h3 className="text-xl font-black text-slate-950 mt-1">
                            {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : stats?.summary?.approved || 0}
                        </h3>
                    </div>
                </div>

                {/* Rejected */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                        <XCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rejected Referrals</p>
                        <h3 className="text-xl font-black text-slate-950 mt-1">
                            {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : stats?.summary?.rejected || 0}
                        </h3>
                    </div>
                </div>

                {/* Total Rewards Paid */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-[#FFDD00]/10 text-[#B39B00] rounded-xl">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rewards Credited</p>
                        <h3 className="text-xl font-black text-slate-950 mt-1">
                            {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : `₹${stats?.summary?.rewardsTotal || 0}`}
                        </h3>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conversion Rate</p>
                        <h3 className="text-xl font-black text-slate-950 mt-1">
                            {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : `${stats?.summary?.conversionRate || 0}%`}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Recharts Area Chart & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rewards Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Rewards Growth (Past 6 Months)</h4>
                    <div className="h-[250px] w-full">
                        {loadingStats ? (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-2xl">
                                <Loader2 className="w-6 h-6 animate-spin text-[#1E971D]" />
                            </div>
                        ) : stats?.monthlyRewards?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthlyRewards} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1E971D" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#1E971D" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: "#0F172A", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px", fontWeight: "bold" }} />
                                    <Area type="monotone" dataKey="rewards" stroke="#1E971D" strokeWidth={2} fillOpacity={1} fill="url(#colorRewards)" name="Rewards (₹)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400 text-xs font-bold uppercase tracking-wider">
                                No reward payouts logged yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Referrers Panel */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Top Referrers</h4>
                        <div className="divide-y divide-slate-100">
                            {loadingStats ? (
                                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#1E971D]" /></div>
                            ) : stats?.topReferrers?.length > 0 ? (
                                stats.topReferrers.map((ref, idx) => (
                                    <div key={idx} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                                        <div className="overflow-hidden pr-2">
                                            <p className="font-black text-xs text-slate-900 truncate">{ref._id?.fullName || "A User"}</p>
                                            <p className="text-slate-400 font-bold text-[9px] truncate">{ref._id?.email}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-black text-xs text-emerald-600">{ref.count} refs</p>
                                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">₹{ref.totalEarned} earned</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    No referrals approved yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* List Table with Controls */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    {/* Search bar */}
                    <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:border-[#1E971D] transition-colors pr-2">
                        <input 
                            type="text"
                            placeholder="Search referral code, owner, customer email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 text-xs font-semibold focus:outline-none bg-transparent"
                        />
                        <button type="submit" className="p-2 text-slate-400 hover:text-slate-900 cursor-pointer">
                            <Search size={16} />
                        </button>
                    </form>

                    {/* Filter controls */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select 
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs focus:border-[#1E971D] shadow-sm cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    {loadingList ? (
                        <div className="py-24 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-[#1E971D] mb-4" />
                            <p className="font-black text-slate-400 text-xs uppercase tracking-widest">Loading Referral Log...</p>
                        </div>
                    ) : referrals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 pb-3">
                                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Referral Code</th>
                                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Owner (Referrer)</th>
                                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Referred Customer</th>
                                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Linked Order</th>
                                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reward Points</th>
                                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort("createdAt")}>
                                            Date Used <ArrowUpDown size={10} className="inline ml-1" />
                                        </th>
                                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Processed Date</th>
                                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.map((ref) => (
                                        <tr key={ref._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                                            <td className="py-4">
                                                <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">
                                                    {ref.referralCodeId?.code || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <p className="font-black text-xs text-slate-900">{ref.referrerUserId?.fullName || "N/A"}</p>
                                                <p className="text-slate-400 font-bold text-[9px]">{ref.referrerUserId?.email}</p>
                                            </td>
                                            <td className="py-4">
                                                <p className="font-black text-xs text-slate-900">{ref.referredUserId?.fullName || "N/A"}</p>
                                                <p className="text-slate-400 font-bold text-[9px]">{ref.referredUserId?.email}</p>
                                            </td>
                                            <td className="py-4">
                                                <p className="font-black text-xs text-slate-900 max-w-[120px] truncate" title={ref.orderId?._id}>
                                                    {ref.orderId?._id || "N/A"}
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-widest ${
                                                        ref.orderId?.paymentStatus === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                                                    }`}>
                                                        {ref.orderId?.paymentStatus || "pending"}
                                                    </span>
                                                    <span className="text-[9px] font-black text-slate-700">₹{ref.orderId?.totalAmount || 0}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 font-bold text-xs text-slate-600">
                                                ₹{ref.rewardPoints || ref.rewardAmount || 100}
                                            </td>
                                            <td className="py-4 font-bold text-xs text-slate-600">
                                                {new Date(ref.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 font-bold text-xs text-slate-600">
                                                {ref.approvedAt ? new Date(ref.approvedAt).toLocaleDateString() : ref.rejectedAt ? new Date(ref.rejectedAt).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    ref.status === "APPROVED" 
                                                        ? "bg-emerald-50 text-emerald-600" 
                                                        : ref.status === "REJECTED" 
                                                        ? "bg-rose-50 text-rose-600" 
                                                        : "bg-blue-50 text-blue-600"
                                                }`}>
                                                    {ref.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedReferral(ref);
                                                            setIsDetailOpen(true);
                                                        }}
                                                        className="p-2 border border-slate-200 hover:border-slate-400 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <Eye size={13} />
                                                    </button>
                                                    {ref.status === "PENDING" && (
                                                        <>
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedReferral(ref);
                                                                    setIsApproveOpen(true);
                                                                }}
                                                                disabled={ref.orderId?.paymentStatus !== "completed"}
                                                                className="p-2 bg-emerald-50 border border-emerald-100 hover:border-emerald-300 text-emerald-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                                title="Approve Referral"
                                                            >
                                                                <Check size={13} />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedReferral(ref);
                                                                    setIsRejectOpen(true);
                                                                }}
                                                                className="p-2 bg-rose-50 border border-rose-100 hover:border-rose-300 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                                                title="Reject Referral"
                                                            >
                                                                <X size={13} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-24 text-center text-slate-400">
                            <Layers className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                            <p className="font-black text-xs uppercase tracking-wider">No Referrals Found</p>
                            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            
            {/* Approve Modal */}
            <AnimatePresence>
                {isApproveOpen && selectedReferral && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                            onClick={() => setIsApproveOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden"
                        >
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Approve Referral Reward</h3>
                            <button onClick={() => setIsApproveOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                Approving this referral will immediately credit **₹{selectedReferral.rewardAmount}** to referrer **{selectedReferral.referrerUserId?.fullName}** and **₹{selectedReferral.refereeRewardAmount}** to referred friend **{selectedReferral.referredUserId?.fullName}**. This action is irreversible.
                            </p>
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Approval Notes</label>
                                <textarea 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-xs focus:border-[#1E971D] min-h-[80px]"
                                    placeholder="Enter approval details or audit notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
                            <button onClick={() => setIsApproveOpen(false)} className="px-4 py-2 text-xs font-black uppercase text-slate-400 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">Cancel</button>
                            <button 
                                onClick={() => handleProcessReferral("APPROVE")}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer"
                            >
                                {actionLoading ? "Processing..." : "Approve & Credit"}
                            </button>
                        </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {isRejectOpen && selectedReferral && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                            onClick={() => setIsRejectOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden"
                        >
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Reject Referral Reward</h3>
                            <button onClick={() => setIsRejectOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                Rejecting this referral will mark it as REJECTED. No wallet balance or points will be credited to either user.
                            </p>
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rejection Reason (Required)</label>
                                <textarea 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-xs focus:border-rose-500 min-h-[80px]"
                                    placeholder="Enter rejection notes (e.g. self-referral abuse, cancelled order)..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
                            <button onClick={() => setIsRejectOpen(false)} className="px-4 py-2 text-xs font-black uppercase text-slate-400 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">Cancel</button>
                            <button 
                                onClick={() => handleProcessReferral("REJECT")}
                                disabled={actionLoading || !notes.trim()}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer"
                            >
                                {actionLoading ? "Processing..." : "Reject Referral"}
                            </button>
                        </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail View Modal */}
            <AnimatePresence>
                {isDetailOpen && selectedReferral && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                            onClick={() => setIsDetailOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden"
                        >
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Referral Transaction Details</h3>
                            <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Stats grids */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Referral ID</span>
                                    <span className="font-bold text-xs text-slate-800 break-all">{selectedReferral._id}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Referral Code</span>
                                    <span className="font-black text-xs text-slate-900 bg-slate-200 px-1.5 py-0.5 rounded tracking-wide uppercase">
                                        {selectedReferral.referralCodeId?.code || "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3.5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Participants</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-[9px] font-bold text-slate-400">Referrer (Code Owner)</span>
                                        <p className="font-black text-xs text-slate-900 mt-0.5">{selectedReferral.referrerUserId?.fullName}</p>
                                        <p className="text-slate-400 text-[10px] font-bold mt-0.5 truncate">{selectedReferral.referrerUserId?.email}</p>
                                        <p className="text-[10px] text-emerald-600 font-bold mt-1">Reward: +₹{selectedReferral.rewardAmount}</p>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-bold text-slate-400">Referee (Purchaser)</span>
                                        <p className="font-black text-xs text-slate-900 mt-0.5">{selectedReferral.referredUserId?.fullName}</p>
                                        <p className="text-slate-400 text-[10px] font-bold mt-0.5 truncate">{selectedReferral.referredUserId?.email}</p>
                                        <p className="text-[10px] text-emerald-600 font-bold mt-1">Reward: +₹{selectedReferral.refereeRewardAmount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3.5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Order Details</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Order ID</span>
                                        <span className="font-black text-[10px] text-slate-900 max-w-[80px] truncate block" title={selectedReferral.orderId?._id}>
                                            {selectedReferral.orderId?._id}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Payment</span>
                                        <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-wider ${
                                            selectedReferral.orderId?.paymentStatus === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                                        }`}>
                                            {selectedReferral.orderId?.paymentStatus || "pending"}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Order Total</span>
                                        <span className="font-black text-xs text-slate-900">₹{selectedReferral.orderId?.totalAmount || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedReferral.notes && (
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Audit/Admin Notes</span>
                                    <p className="font-semibold text-xs text-slate-700 mt-1">{selectedReferral.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button onClick={() => setIsDetailOpen(false)} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer">Close</button>
                        </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ReferralManager;
