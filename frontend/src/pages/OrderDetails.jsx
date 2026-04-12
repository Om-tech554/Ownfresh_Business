import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import Navbar from "../components/Navbar";
import { Package, MapPin, ChevronLeft, Calendar, CreditCard, CheckCircle2, Clock, Truck, X, XCircle, Printer, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCancellingModalOpen, setIsCancellingModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true });
            if (data.success) {
                const found = data.orders.find(o => o._id === id);
                setOrder(found);
            }
        } catch (error) {
            console.error("Fetch order details failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!cancelReason.trim()) {
            return alert("Please provide a reason");
        }
        setIsCancelling(true);
        try {
            const { data } = await axios.put(`${serverUrl}/api/order/cancel-request/${id}`, { reason: cancelReason }, { withCredentials: true });
            if (data.success) {
                setOrder({ ...order, status: 'cancellation_requested' });
                setIsCancellingModalOpen(false);
                setCancelReason("");
            }
        } catch (error) {
            console.error("Cancel request failed", error);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!window.confirm("Move this order to archive? You won't see it in your active history anymore.")) return;

        try {
            const { data } = await axios.delete(`${serverUrl}/api/order/user-delete/${id}`, { withCredentials: true });
            if (data.success) {
                toast.success("Order cleared from history");
                navigate("/my-orders");
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#F9DD19] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto pt-40 px-6 text-center">
                <h1 className="text-2xl font-black text-slate-900 uppercase">Order Not Found</h1>
                <Link to="/my-orders" className="mt-6 inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
                    <ChevronLeft size={16} /> Back to My Orders
                </Link>
            </div>
        </div>
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending": return <Clock className="w-5 h-5 text-amber-500" />;
            case "processing": return <Package className="w-5 h-5 text-blue-500" />;
            case "shipped": return <Truck className="w-5 h-5 text-indigo-500" />;
            case "delivered": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
            case "cancellation_requested": return <XCircle className="w-5 h-5 text-orange-500 animate-pulse" />;
            default: return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />

            <div className="max-w-5xl mx-auto pt-32 px-4 md:px-6">
                {/* ── BREADCRUMBS ── */}
                <div className="flex items-center gap-2 mb-8">
                    <Link to="/my-orders" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">My Orders</Link>
                    <ChevronLeft size={10} className="text-slate-300 rotate-180" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Order Details</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                            Order <span className="text-[#F9DD19]">Details</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Ordered on {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full hidden sm:block"></div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide font-mono">Order# {order._id.toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F9DD19] hover:border-[#F9DD19] transition-all shadow-sm">
                        <Printer size={14} /> View or Print Invoice
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COL: MAIN DETAILS */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Shipping Address & Payment */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                            <div className="p-8">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MapPin size={14} className="text-[#1E971D]" /> Shipping Address
                                </h4>
                                <div className="flex flex-col gap-1 mb-6">
                                    <span className="text-[10px] font-black text-[#1E971D] uppercase">Delivery Address</span>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase">
                                        {order.deliveryAddress?.roomNumber}<br />
                                        {order.deliveryAddress?.areaName}<br />
                                        {order.deliveryAddress?.text}
                                    </p>
                                </div>

                                {order.trackingId && (
                                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                <Truck size={12} /> Shipment Tracking
                                            </p>
                                            <p className="text-sm font-black text-slate-900 font-mono uppercase">{order.trackingId}</p>
                                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Courier: {order.courierPartner}</p>
                                        </div>
                                        <button className="bg-white border border-blue-200 text-blue-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                                            Live Track →
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 bg-slate-50/50">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CreditCard size={14} className="text-indigo-600" /> Payment Mode
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Method</p>
                                        <p className="text-xs font-black text-slate-900 uppercase">{order.PaymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${order.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Progress / Tracking */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                {getStatusIcon(order.status)} Order Status: {order.status}
                            </h4>
                            <div className="relative pt-4 pb-8 px-10">
                                {/* Amazon Style Vertical/Horizontal Stepper */}
                                <div className="flex items-center justify-between relative">
                                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                                    <div className="absolute top-1/2 left-0 h-1.5 bg-[#1E971D] -translate-y-1/2 rounded-full transition-all duration-1000"
                                        style={{
                                            width: order.status === 'pending' ? '5%' :
                                                order.status === 'processing' ? '33%' :
                                                    order.status === 'shipped' ? '66%' :
                                                        order.status === 'delivered' ? '100%' : '0%'
                                        }}
                                    ></div>

                                    {['pending', 'processing', 'shipped', 'delivered'].map((s, idx) => {
                                        const isCompleted = ['delivered', 'shipped', 'processing', 'pending'].indexOf(order.status) >= ['delivered', 'shipped', 'processing', 'pending'].indexOf(s);

                                        if (order.status === 'cancelled' || order.status === 'cancellation_requested') {
                                            if (idx === 0) return (
                                                <div key={s} className="relative z-10 flex flex-col items-center">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-colors duration-500 ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'} text-white`}>
                                                        <XCircle size={20} />
                                                    </div>
                                                    <p className={`absolute top-full mt-3 text-[10px] font-black uppercase whitespace-nowrap tracking-wider ${order.status === 'cancelled' ? 'text-red-500' : 'text-orange-500'}`}>
                                                        {order.status === 'cancelled' ? 'Cancelled' : 'Cancel Requested'}
                                                    </p>
                                                </div>
                                            );
                                            return null;
                                        }

                                        return (
                                            <div key={s} className="relative z-10 flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-colors duration-500 ${isCompleted ? 'bg-[#1E971D] text-white' : 'bg-white text-slate-200 border-slate-100'}`}>
                                                    <CheckCircle2 size={16} className={isCompleted ? 'block' : 'hidden'} />
                                                    <div className={`w-2.5 h-2.5 bg-slate-200 rounded-full ${isCompleted ? 'hidden' : 'block'}`}></div>
                                                </div>
                                                <p className={`absolute top-full mt-3 text-[10px] font-black uppercase whitespace-nowrap tracking-wider ${isCompleted ? 'text-[#1E971D]' : 'text-slate-400'}`}>
                                                    {s}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Shipment Details</h4>
                            </div>
                            <div className="p-0">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-8 p-8 border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                                        <div className="w-24 h-24 bg-slate-50 rounded-2xl p-3 border border-slate-100 overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h5 className="text-sm font-black text-slate-900 uppercase leading-tight mb-2">{item.name}</h5>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {item.quantity} | ₹{item.price} each</p>
                                            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                                                <Link to={`/product/${item.productId}`} className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all">Buy it again</Link>
                                                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-all">View item</button>
                                            </div>
                                        </div>
                                        <div className="text-right whitespace-nowrap min-w-[100px]">
                                            <p className="text-lg font-black text-slate-900 font-mono">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: SUMMARY */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl sticky top-32">
                            <h4 className="text-[11px] font-black text-[#F9DD19] uppercase tracking-widest mb-8">Order Summary</h4>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Items Subtotal</span>
                                    <span className="text-xs font-black font-mono">₹{order.totalAmount + order.discountAmount}</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-400">
                                    <span className="text-[10px] font-bold uppercase">Discount applied</span>
                                    <span className="text-xs font-black font-mono">-₹{order.discountAmount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Shipping</span>
                                    <span className="text-xs font-black uppercase">FREE</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 mb-8 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                                    <p className="text-3xl font-black text-[#F9DD19] font-mono leading-none mt-2">₹{order.totalAmount}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full bg-[#F9DD19] text-black text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:shadow-xl hover:shadow-yellow-500/20 transition-all active:scale-[0.98]">
                                    Track My Package
                                </button>
                                {['pending', 'processing'].includes(order.status) && (
                                    <button
                                        onClick={() => setIsCancellingModalOpen(true)}
                                        className="w-full bg-white/5 border border-white/10 text-red-400 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                                    >
                                        Request Cancellation
                                    </button>
                                )}
                                {order.status === 'cancelled' && (
                                    <button
                                        onClick={handleDeleteOrder}
                                        className="w-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={14} /> Clear from History
                                    </button>
                                )}
                            </div>

                            <p className="mt-8 text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                Transaction ID: {order._id.substring(0, 12).toUpperCase()}
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── CANCELLATION MODAL ── */}
            {isCancellingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCancellingModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-10 animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsCancellingModalOpen(false)}
                            className="absolute right-8 top-8 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                        <h3 className="text-2xl font-black text-slate-900 uppercase">Cancel Order</h3>
                        <p className="text-xs font-bold text-slate-500 mt-2">Please select a reason for cancellation. We value your feedback.</p>

                        <div className="mt-8 space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
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
                                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-xs h-32 resize-none transition-all focus:border-[#F9DD19]"
                                    placeholder="Tell us more..."
                                    onChange={(e) => setCancelReason(e.target.value)}
                                ></textarea>
                            )}
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button
                                onClick={() => setIsCancellingModalOpen(false)}
                                className="flex-1 px-6 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                Stay Protected
                            </button>
                            <button
                                disabled={!cancelReason || isCancelling}
                                onClick={handleCancelRequest}
                                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-red-700 transition-colors shadow-xl shadow-red-100 disabled:opacity-50"
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

export default OrderDetails;
