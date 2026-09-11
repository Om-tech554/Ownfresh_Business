import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import Navbar from "../components/Navbar";
import { Package, Clock, CheckCircle2, Truck, X, XCircle, MapPin, ChevronRight, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useConfirm } from "../hooks/ConfirmContext.jsx";

const MyOrders = () => {
    const user = useSelector((state) => state.user.userData);
    const confirm = useConfirm();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true });
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Fetch orders failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!cancelReason.trim()) {
            return toast.error("Please provide a reason for cancellation");
        }
        setIsCancelling(true);
        try {
            const { data } = await axios.put(`${serverUrl}/api/order/cancel-request/${cancellingOrder}`, { reason: cancelReason }, { withCredentials: true });
            if (data.success) {
                setOrders(orders.map(o => o._id === cancellingOrder ? { ...o, status: 'cancellation_requested' } : o));
                setCancellingOrder(null);
                setCancelReason("");
            }
        } catch (error) {
            console.error("Cancel request failed", error);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmed = await confirm({
            title: "Archive Order",
            message: "Move this order to archive? You won't see it in your active history anymore.",
            type: "danger",
            confirmText: "Archive",
            cancelText: "Cancel"
        });
        if (!confirmed) return;

        try {
            const { data } = await axios.delete(`${serverUrl}/api/order/user-delete/${orderId}`, { withCredentials: true });
            if (data.success) {
                setOrders(orders.filter(o => o._id !== orderId));
                toast.success("Order cleared from history");
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending": return <Clock className="w-4 h-4 text-amber-500" />;
            case "processing": return <Package className="w-4 h-4 text-blue-500" />;
            case "shipped": return <Truck className="w-4 h-4 text-indigo-500" />;
            case "delivered": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
            case "cancellation_requested": return <XCircle className="w-4 h-4 text-orange-500 animate-pulse" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "processing": return "bg-blue-50 text-blue-700 border-blue-200";
            case "shipped": return "bg-indigo-50 text-indigo-700 border-indigo-200";
            case "delivered": return "bg-green-50 text-green-700 border-green-200";
            case "cancelled": return "bg-red-50 text-red-700 border-red-200";
            case "cancellation_requested": return "bg-orange-50 text-orange-700 border-orange-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F14] flex items-center justify-center">
            <Navbar />
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-[#FFDD00] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 font-black uppercase tracking-widest text-slate-400 dark:text-[#818C9B] text-xs">Loading Orders...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F14] transition-colors duration-250">
            <Navbar />

            <div className="max-w-5xl mx-auto pt-32 pb-20 px-4 md:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-[#F7F9FC] uppercase tracking-tight">
                            My <span className="text-[#FFDD00] dark:text-[#FFD600]">Orders</span>
                        </h1>
                        <p className="text-slate-500 dark:text-[#818C9B] text-xs font-bold uppercase tracking-widest mt-1">Track your wellness journey</p>
                    </div>
                    <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest bg-slate-900 dark:bg-[#FFD600] text-white dark:text-[#111318] px-4 py-2.5 rounded-xl hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] hover:text-black transition-all">
                        New Order
                    </Link>
                </div>

                {!orders || orders.length === 0 ? (
                    <div className="bg-white dark:bg-[#171D26] rounded-3xl p-12 text-center border border-slate-100 dark:border-[#27313D] shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-[#151B23] rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="text-slate-300 dark:text-[#778393] w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-[#F7F9FC] uppercase">No orders yet</h3>
                        <p className="text-slate-500 dark:text-[#B7C1CE] text-sm mt-2 max-w-xs mx-auto">Start your journey to botanic purity by exploring our premium range of oils.</p>
                        <Link to="/shop" className="mt-6 inline-block bg-[#FFDD00] dark:bg-[#FFD600] text-black dark:text-[#111318] font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-yellow-200 dark:hover:shadow-none transition-all">
                            Go to Shop
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white dark:bg-[#171D26] rounded-2xl border border-slate-200 dark:border-[#27313D] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* ── AMAZON-STYLE HEADER ── */}
                                <div className="bg-slate-50 dark:bg-[#151B23] px-6 py-4 border-b border-slate-200 dark:border-[#27313D] flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex gap-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-widest">Order Placed</p>
                                            <p className="text-[11px] font-bold text-slate-700 dark:text-[#B7C1CE]">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-widest">Total Amount</p>
                                            <p className="text-[11px] font-black text-slate-900 dark:text-[#FFD600] font-mono">₹{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div className="space-y-1 hidden sm:block">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-widest">Ship To</p>
                                            <div className="flex items-center gap-1">
                                                <p className="text-[11px] font-bold text-[#24672E] dark:text-[#19C37D] uppercase">
                                                    {order.deliveryAddress?.areaName || "Location"}
                                                </p>
                                                <div className="relative group/addr">
                                                    <MapPin size={10} className="text-slate-400 dark:text-[#818C9B] cursor-help" />
                                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/addr:block bg-slate-900 dark:bg-[#1D2530] text-white dark:text-[#F5F7FA] border border-transparent dark:border-[#2A3440] text-[9px] p-2 rounded shadow-xl whitespace-nowrap z-10 font-bold uppercase tracking-wider">
                                                        {order.deliveryAddress?.text}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1 ml-auto">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-widest">Order # {order.customOrderId || order._id.substring(order._id.length - 12).toUpperCase()}</p>
                                        <div className="flex items-center justify-end gap-3 divide-x divide-slate-200 dark:divide-[#27313D]">
                                            <Link to={`/order-details/${order._id}`} className="text-[10px] font-bold text-blue-600 dark:text-[#FFD600] hover:underline">Order Details</Link>
                                            <button className="text-[10px] font-bold text-blue-600 dark:text-[#FFD600] hover:underline pl-3 cursor-pointer">Invoice</button>
                                        </div>
                                    </div>
                                </div>

                                {/* ── STATUS STEPPER ── */}
                                <div className="px-8 py-10 border-b border-slate-100 dark:border-[#27313D] bg-white dark:bg-[#171D26]">
                                    <div className="flex items-center justify-between relative mb-2">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-[#1D2530] -translate-y-1/2 z-0"></div>

                                        {/* Dynamic Progress Bar */}
                                        <div
                                            className="absolute top-1/2 left-0 h-1 bg-[#24672E] dark:bg-[#19C37D] -translate-y-1/2 transition-all duration-1000 ease-out z-0"
                                            style={{
                                                width: order.status === 'pending' ? '5%' :
                                                    order.status === 'processing' ? '33%' :
                                                        order.status === 'shipped' ? '66%' :
                                                            order.status === 'delivered' ? '100%' : '0%'
                                            }}
                                        ></div>

                                        {/* Steps */}
                                        {[
                                            { id: 'pending', label: 'Ordered', icon: Clock },
                                            { id: 'processing', label: 'Processing', icon: Package },
                                            { id: 'shipped', label: 'Shipped', icon: Truck },
                                            { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
                                        ].map((step, idx) => {
                                            const isDone = ['delivered', 'shipped', 'processing', 'pending'].indexOf(order.status) >= ['delivered', 'shipped', 'processing', 'pending'].indexOf(step.id);

                                            // Handle Cancelled/Request State
                                            if (order.status === 'cancelled' || order.status === 'cancellation_requested') {
                                                if (idx === 0) return (
                                                    <div key={idx} className="relative z-10 flex flex-col items-center">
                                                        <div className={`${order.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'} p-2.5 rounded-full ring-4 ring-white dark:ring-[#171D26] shadow-sm`}>
                                                            <XCircle size={16} className="text-white" />
                                                        </div>
                                                        <p className={`absolute top-full mt-2 text-[10px] font-black uppercase whitespace-nowrap hidden sm:block ${order.status === 'cancelled' ? 'text-red-500 dark:text-[#FF5C6C]' : 'text-orange-500'}`}>
                                                            {order.status === 'cancelled' ? 'Cancelled' : 'Cancel Requested'}
                                                        </p>
                                                    </div>
                                                );
                                                return null;
                                            }

                                            return (
                                                <div key={idx} className="relative z-10 flex flex-col items-center">
                                                    <div className={`
                                                        p-2.5 rounded-full ring-4 ring-white dark:ring-[#171D26] shadow-sm transition-all duration-500
                                                        ${isDone ? 'bg-[#24672E] dark:bg-[#19C37D] text-white dark:text-[#101318]' : 'bg-white dark:bg-[#151B23] text-slate-300 dark:text-[#34404E] border-2 border-slate-100 dark:border-[#27313D]'}
                                                    `}>
                                                        <step.icon size={16} />
                                                    </div>
                                                    <p className={`
                                                        absolute top-full mt-2 text-[10px] font-black uppercase whitespace-nowrap hidden sm:block
                                                        ${isDone ? 'text-[#24672E] dark:text-[#19C37D]' : 'text-slate-400 dark:text-[#818C9B]'}
                                                    `}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Tracking Status Text */}
                                    <div className="mt-8">
                                        <p className="text-xs font-bold text-slate-600 dark:text-[#B7C1CE]">
                                            Status: <span className={`uppercase font-black ${order.status === 'cancelled' ? 'text-red-500 dark:text-[#FF5C6C]' : order.status === 'cancellation_requested' ? 'text-orange-500' : 'text-[#24672E] dark:text-[#19C37D]'}`}>{order.status}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-4">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 group">
                                                <div className="w-20 h-20 bg-slate-50 dark:bg-[#151B23] rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-[#27313D] p-2">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-1 min-w-0 py-1">
                                                    <h4 className="text-sm font-black text-slate-800 dark:text-[#F5F7FA] uppercase line-clamp-2">{item.name}</h4>
                                                    <p className="text-xs font-bold text-slate-500 dark:text-[#818C9B] mt-1">Qty: {item.quantity}</p>
                                                    <button className="mt-2 text-[10px] font-bold text-blue-600 dark:text-[#FFD600] hover:underline cursor-pointer">Buy it again</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Summary & Actions */}
                                    <div className="bg-slate-50 dark:bg-[#151B23] rounded-2xl p-6 border border-slate-100 dark:border-[#27313D]">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight text-slate-500 dark:text-[#818C9B]">
                                                <span>Subtotal</span>
                                                <span className="text-slate-900 dark:text-[#F5F7FA]">₹{(order.totalAmount + order.discountAmount).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight text-slate-500 dark:text-[#818C9B]">
                                                <span>Savings</span>
                                                <span className="text-emerald-600 dark:text-[#19C37D]">-₹{order.discountAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="pt-3 border-t border-slate-200 dark:border-[#27313D] flex justify-between items-center">
                                                <span className="text-sm font-black uppercase text-slate-900 dark:text-[#F7F9FC]">Grand Total</span>
                                                <span className="text-xl font-black text-slate-900 dark:text-[#FFD600] font-mono">₹{order.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex gap-3">
                                            <button className="flex-1 bg-slate-900 dark:bg-[#1D2530] text-white dark:text-[#F5F7FA] border border-transparent dark:border-[#303B48] text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-[#242E3A] transition-colors shadow-sm cursor-pointer">
                                                Track Package
                                            </button>
                                            {['pending', 'processing'].includes(order.status) && (
                                                order.createdAt && (Date.now() - new Date(order.createdAt).getTime() < 60 * 60 * 1000) ? (
                                                    <div className="flex-1 flex flex-col gap-1.5">
                                                        <button
                                                            onClick={() => setCancellingOrder(order._id)}
                                                            className="w-full bg-white dark:bg-[#171D26] border border-slate-200 dark:border-[#27313D] text-red-600 dark:text-[#FF5C6C] text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-red-50 dark:hover:bg-[#3D1418] hover:border-red-200 dark:hover:border-[#FF5C6C] transition-colors cursor-pointer"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                        <span className="text-[8px] text-slate-400 dark:text-[#818C9B] font-bold uppercase tracking-wider text-center block">
                                                            Allowed within 1 hour
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 bg-slate-50 dark:bg-[#1D2530] border border-slate-200 dark:border-[#27313D] text-slate-400 dark:text-[#818C9B] text-[9px] font-bold uppercase tracking-widest py-3 rounded-xl text-center flex items-center justify-center">
                                                        Cancellation Closed
                                                    </div>
                                                )
                                            )}
                                            {order.status === 'cancelled' && (
                                                <button
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                    className="flex-1 bg-white dark:bg-[#171D26] border border-slate-200 dark:border-[#27313D] text-slate-500 dark:text-[#B7C1CE] text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-[#222B37] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <Trash2 size={12} /> Clear History
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── CANCELLATION MODAL ── */}
            <AnimatePresence>
                {cancellingOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
                            onClick={() => setCancellingOrder(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white dark:bg-[#1D2530] border border-transparent dark:border-[#2A3440] w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setCancellingOrder(null)}
                                className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-[#151B23] text-slate-400 dark:text-[#818C9B] hover:bg-red-50 dark:hover:bg-[#3D1418] hover:text-red-600 dark:hover:text-[#FF5C6C] transition-all border border-slate-100 dark:border-[#27313D] cursor-pointer"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                            <h3 className="text-xl font-black text-slate-900 dark:text-[#F7F9FC] uppercase">Cancel Order</h3>
                            <p className="text-xs font-bold text-slate-500 dark:text-[#B7C1CE] mt-2">Please tell us why you want to cancel. This help us improve our service.</p>

                            <div className="mt-6 space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 dark:text-[#C4CCD7] uppercase tracking-widest">Reason for cancellation</label>
                                <select
                                    className="w-full p-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-800 dark:text-[#F5F7FA] rounded-2xl outline-none font-bold text-xs cursor-pointer"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                >
                                    <option value="" className="dark:bg-[#151B23]">Select a reason</option>
                                    <option value="Price too high" className="dark:bg-[#151B23]">Price is too high</option>
                                    <option value="Bought by mistake" className="dark:bg-[#151B23]">Bought by mistake</option>
                                    <option value="Delivery too slow" className="dark:bg-[#151B23]">Delivery is too slow</option>
                                    <option value="Found better deal" className="dark:bg-[#151B23]">Found a better deal elsewhere</option>
                                    <option value="Others" className="dark:bg-[#151B23]">Others</option>
                                </select>

                                {cancelReason === "Others" && (
                                    <textarea
                                        className="w-full p-4 bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#29333F] text-slate-800 dark:text-[#F5F7FA] placeholder:text-slate-400 dark:placeholder:text-[#778393] rounded-2xl outline-none font-bold text-xs h-24 resize-none"
                                        placeholder="Enter your reason here..."
                                        value={cancelReason === "Others" ? "" : cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    ></textarea>
                                )}
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => setCancellingOrder(null)}
                                    className="flex-1 px-6 py-4 bg-slate-100 dark:bg-[#171D26] border border-transparent dark:border-[#27313D] rounded-2xl text-[10px] font-black uppercase text-slate-500 dark:text-[#B7C1CE] hover:bg-slate-200 dark:hover:bg-[#222B37] transition-colors cursor-pointer"
                                >
                                    Nevermind
                                </button>
                                <button
                                    disabled={!cancelReason || isCancelling}
                                    onClick={handleCancelRequest}
                                    className="flex-1 px-6 py-4 bg-red-600 dark:bg-[#FF5C6C] text-white dark:text-[#111318] rounded-2xl text-[10px] font-black uppercase hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50 cursor-pointer"
                                >
                                    {isCancelling ? 'Processing...' : 'Confirm Cancel'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyOrders;
