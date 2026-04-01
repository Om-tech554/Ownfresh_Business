import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import { Search, Loader2, Package, User, Clock, CheckCircle2, Truck, XCircle, MapPin, ExternalLink, Calendar, CreditCard, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/order/admin/all`, { withCredentials: true });
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Fetch orders failed", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const { data } = await axios.put(`${serverUrl}/api/order/status/${orderId}`, { status: newStatus }, { withCredentials: true });
            if (data.success) {
                toast.success(data.msg);
                setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            toast.error("Status update failed");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "processing": return "bg-blue-50 text-blue-700 border-blue-200";
            case "shipped": return "bg-indigo-50 text-indigo-700 border-indigo-200";
            case "delivered": return "bg-green-50 text-green-700 border-green-200";
            case "cancelled": return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || order.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === "pending").length,
        completed: orders.filter(o => o.status === "delivered").length,
        revenue: orders.filter(o => o.status !== "cancelled").reduce((acc, curr) => acc + curr.totalAmount, 0)
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 mt-6">
            <Loader2 className="w-10 h-10 text-[#F9DD19] animate-spin" />
            <p className="mt-4 font-black uppercase tracking-widest text-slate-400 text-[10px]">Loading Fleet Operations...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 pb-20 mt-6">
            {/* STATS DECK */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Total Orders", val: stats.total, color: "bg-slate-900", icon: Package },
                    { label: "Remaining", val: stats.pending, color: "bg-amber-500", icon: Clock },
                    { label: "Delivered", val: stats.completed, color: "bg-[#1E971D]", icon: CheckCircle2 },
                    { label: "Revenue", val: `₹${stats.revenue.toLocaleString()}`, color: "bg-indigo-600", icon: CreditCard },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-hover hover:shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${s.color} p-2.5 rounded-2xl`}>
                                <s.icon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">{s.val}</h4>
                    </div>
                ))}
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1E971D] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by customer or Order ID..." 
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#1E971D] outline-none font-bold text-xs transition-shadow hover:shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    {['all', 'pending', 'processing', 'shipped', 'delivered'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-slate-900 text-[#F9DD19]' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ORDERS TABLE */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        No matching orders located
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 p-2 rounded-xl">
                                                <Package size={14} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900 uppercase">#{order._id.substring(order._id.length-8).toUpperCase()}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar size={10} className="text-slate-400" />
                                                    <p className="text-[9px] font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#1E971D]/10 p-2 rounded-full">
                                                <User size={14} className="text-[#1E971D]" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{order.user?.fullName || "Guest"}</p>
                                                <p className="text-[10px] font-bold text-slate-400 lowercase">{order.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="text-sm font-black text-slate-900 font-mono">₹{order.totalAmount}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{order.PaymentMethod}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="relative inline-block group/select">
                                            <select 
                                                disabled={updatingId === order._id}
                                                className={`appearance-none pl-4 pr-10 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none transition-all ${getStatusStyles(order.status)}`}
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 bg-slate-100 rounded-xl hover:bg-[#F9DD19] transition-all text-slate-400 hover:text-black">
                                            <ExternalLink size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
