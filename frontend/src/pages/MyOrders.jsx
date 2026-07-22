import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import Navbar from "../components/Navbar";
import { Package, Clock, CheckCircle2, Truck, X, XCircle, MapPin, ChevronRight, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const MyOrders = () => {
    const user = useSelector((state) => state.user.userData);
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
            return alert("Please provide a reason for cancellation");
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
        if (!window.confirm("Move this order to archive? You won't see it in your active history anymore.")) return;

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
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex flex-col items-center justify-center pt-40">
                <div className="w-12 h-12 border-4 border-[#FFDD00] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 font-black uppercase tracking-widest text-slate-400 text-xs">Loading Orders...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-5xl mx-auto pt-32 pb-20 px-4 md:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                            My <span className="text-[#FFDD00]">Orders</span>
                        </h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Track your wellness journey</p>
                    </div>
                    <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-[#FFDD00] hover:text-black transition-all">
                        New Order
                    </Link>
                </div>

                {!orders || orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="text-slate-300 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase">No orders yet</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Start your journey to botanic purity by exploring our premium range of oils.</p>
                        <Link to="/shop" className="mt-6 inline-block bg-[#FFDD00] text-black font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-yellow-200 transition-all">
                            Go to Shop
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* ── AMAZON-STYLE HEADER ── */}
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex gap-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Placed</p>
                                            <p className="text-[11px] font-bold text-slate-700">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                                            <p className="text-[11px] font-black text-slate-900 font-mono">₹{order.totalAmount}</p>
                                        </div>
                                        <div className="space-y-1 hidden sm:block">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ship To</p>
                                            <div className="flex items-center gap-1">
                                                <p className="text-[11px] font-bold text-[#24672E] uppercase">
                                                    {order.deliveryAddress?.areaName || "Location"}
                                                </p>
                                                <div className="relative group/addr">
                                                    <MapPin size={10} className="text-slate-400 cursor-help" />
                                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/addr:block bg-slate-900 text-white text-[9px] p-2 rounded shadow-xl whitespace-nowrap z-10 font-bold uppercase tracking-wider">
                                                        {order.deliveryAddress?.text}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1 ml-auto">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order # {order.customOrderId || order._id.substring(order._id.length - 12).toUpperCase()}</p>
                                        <div className="flex items-center justify-end gap-3 divide-x divide-slate-200">
                                            <Link to={`/order-details/${order._id}`} className="text-[10px] font-bold text-blue-600 hover:underline">Order Details</Link>
                                            <button className="text-[10px] font-bold text-blue-600 hover:underline pl-3">Invoice</button>
                                        </div>
                                    </div>
                                </div>

                                {/* ── STATUS STEPPER ── */}
                                <div className="px-8 py-10 border-b border-slate-100 bg-white">
                                    <div className="flex items-center justify-between relative mb-2">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>

                                        {/* Dynamic Progress Bar */}
                                        <div
                                            className="absolute top-1/2 left-0 h-1 bg-[#24672E] -translate-y-1/2 transition-all duration-1000 ease-out z-0"
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
                                                        <div className={`${order.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'} p-2.5 rounded-full ring-4 ring-white shadow-sm`}>
                                                            <XCircle size={16} className="text-white" />
                                                        </div>
                                                        <p className={`absolute top-full mt-2 text-[10px] font-black uppercase whitespace-nowrap ${order.status === 'cancelled' ? 'text-red-500' : 'text-orange-500'}`}>
                                                            {order.status === 'cancelled' ? 'Cancelled' : 'Cancel Requested'}
                                                        </p>
                                                    </div>
                                                );
                                                return null;
                                            }

                                            return (
                                                <div key={idx} className="relative z-10 flex flex-col items-center">
                                                    <div className={`
                                                        p-2.5 rounded-full ring-4 ring-white shadow-sm transition-all duration-500
                                                        ${isDone ? 'bg-[#24672E] text-white' : 'bg-white text-slate-300 border-2 border-slate-100'}
                                                    `}>
                                                        <step.icon size={16} />
                                                    </div>
                                                    <p className={`
                                                        absolute top-full mt-2 text-[10px] font-black uppercase whitespace-nowrap
                                                        ${isDone ? 'text-[#24672E]' : 'text-slate-400'}
                                                    `}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Tracking Status Text */}
                                    <div className="mt-8">
                                        <p className="text-xs font-bold text-slate-600">
                                            Status: <span className={`uppercase font-black ${order.status === 'cancelled' ? 'text-red-500' : order.status === 'cancellation_requested' ? 'text-orange-500' : 'text-[#24672E]'}`}>{order.status}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-4">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 group">
                                                <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 p-2">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-1 min-w-0 py-1">
                                                    <h4 className="text-sm font-black text-slate-800 uppercase line-clamp-2">{item.name}</h4>
                                                    <p className="text-xs font-bold text-slate-500 mt-1">Qty: {item.quantity}</p>
                                                    <button className="mt-2 text-[10px] font-bold text-blue-600 hover:underline">Buy it again</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Summary & Actions */}
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight text-slate-500">
                                                <span>Subtotal</span>
                                                <span className="text-slate-900">₹{order.totalAmount + order.discountAmount}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight text-slate-500">
                                                <span>Savings</span>
                                                <span className="text-emerald-600">-₹{order.discountAmount}</span>
                                            </div>
                                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                                <span className="text-sm font-black uppercase text-slate-900">Grand Total</span>
                                                <span className="text-xl font-black text-slate-900 font-mono">₹{order.totalAmount}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex gap-3">
                                            <button className="flex-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                                                Track Package
                                            </button>
                                            {['pending', 'processing'].includes(order.status) && (
                                                order.createdAt && (Date.now() - new Date(order.createdAt).getTime() < 60 * 60 * 1000) ? (
                                                    <div className="flex-1 flex flex-col gap-1.5">
                                                        <button
                                                            onClick={() => setCancellingOrder(order._id)}
                                                            className="w-full bg-white border border-slate-200 text-red-600 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider text-center block">
                                                            Allowed within 1 hour
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 bg-slate-50 border border-slate-200 text-slate-400 text-[9px] font-bold uppercase tracking-widest py-3 rounded-xl text-center flex items-center justify-center">
                                                        Cancellation Closed
                                                    </div>
                                                )
                                            )}
                                            {order.status === 'cancelled' && (
                                                <button
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                    className="flex-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
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
            {cancellingOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCancellingOrder(null)}></div>
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setCancellingOrder(null)}
                            className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>
                        <h3 className="text-xl font-black text-slate-900 uppercase">Cancel Order</h3>
                        <p className="text-xs font-bold text-slate-500 mt-2">Please tell us why you want to cancel. This help us improve our service.</p>

                        <div className="mt-6 space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for cancellation</label>
                            <select
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            >
                                <option value="">Select a reason</option>
                                <option value="Price too high">Price is too high</option>
                                <option value="Bought by mistake">Bought by mistake</option>
                                <option value="Delivery too slow">Delivery is too slow</option>
                                <option value="Found better deal">Found a better deal elsewhere</option>
                                <option value="Others">Others</option>
                            </select>

                            {cancelReason === "Others" && (
                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs h-24 resize-none"
                                    placeholder="Enter your reason here..."
                                    value={cancelReason === "Others" ? "" : cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                ></textarea>
                            )}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => setCancellingOrder(null)}
                                className="flex-1 px-6 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                Nevermind
                            </button>
                            <button
                                disabled={!cancelReason || isCancelling}
                                onClick={handleCancelRequest}
                                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                            >
                                {isCancelling ? 'Processing...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
