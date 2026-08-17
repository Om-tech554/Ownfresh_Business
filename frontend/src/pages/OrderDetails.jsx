import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import Navbar from "../components/Navbar";
import { Package, MapPin, ChevronLeft, Calendar, CreditCard, CheckCircle2, Clock, Truck, X, XCircle, Printer, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useConfirm } from "../hooks/ConfirmContext.jsx";
import { useNavigate } from "react-router-dom";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const confirm = useConfirm();
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
            return toast.error("Please provide a reason");
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
        const confirmed = await confirm({
            title: "Archive Order",
            message: "Move this order to archive? You won't see it in your active history anymore.",
            type: "danger",
            confirmText: "Archive",
            cancelText: "Cancel"
        });
        if (!confirmed) return;

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
            <div className="w-12 h-12 border-4 border-[#FFDD00] border-t-transparent rounded-full animate-spin"></div>
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
        <>
            {/* ── PROFESSIONAL PRINT-ONLY INVOICE ── */}
            <div className="hidden print:block w-full max-w-4xl mx-auto p-4 bg-white text-black font-sans leading-relaxed text-xs">
                <style>{`
                    @media print {
                        @page {
                            size: auto;
                            margin: 4mm 8mm;
                        }
                        body {
                            background: #fff !important;
                            color: #000 !important;
                        }
                    }
                `}</style>

                <div className="border border-gray-300 p-4 rounded-lg">
                    <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                        <div>
                            <img
                                src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
                                alt="OwnFresh Logo"
                                className="h-10 md:h-12 w-auto object-contain"
                            />
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">
                                Stone-Pressed Botanic Purity
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">
                                Tax Invoice / Bill of Supply
                            </h2>
                            <p className="text-[10px] text-gray-500 mt-1">
                                GSTIN: <span className="font-bold text-gray-800">27BTGPS0169E1ZL</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 py-3 border-b border-gray-200 text-[10px]">
                        <div>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Invoice / Order ID</p>
                            <p className="font-mono font-bold text-gray-900 mt-1">
                                #{order?.customOrderId || order?._id?.substring(Math.max(0, order?._id?.length - 12)).toUpperCase()}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Invoice Date</p>
                            <p className="font-bold text-gray-900 mt-1">
                                {order?.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Payment Mode</p>
                            <p className="font-bold text-gray-900 mt-1 uppercase">
                                {order?.PaymentMethod || 'Online'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Shipping Status</p>
                            <p className="font-bold text-emerald-700 mt-1 uppercase">
                                {order?.status === 'delivered' ? 'DELIVERED' : 'PAID & CONFIRMED'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200 text-[10px]">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                Sold By (Seller)
                            </h3>
                            <p className="font-bold text-gray-900 text-sm">OwnFresh Agro Industries</p>
                            <p className="text-gray-600 mt-1 leading-relaxed">
                                Pune, Maharashtra, India<br />
                                Email: contact@myownfresh.com<br />
                                GSTIN: 27BTGPS0169E1ZL
                            </p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                Billing & Shipping Address
                            </h3>
                            <p className="font-bold text-gray-900 text-sm">
                                {order?.user?.fullName || order?.deliveryAddress?.name || 'Customer'}
                            </p>
                            <p className="text-gray-600 mt-1 leading-relaxed">
                                {order?.deliveryAddress?.phone || order?.user?.phone ? `Phone: ${order?.deliveryAddress?.phone || order?.user?.phone}` : ''}<br />
                                Address: {[
                                    order?.deliveryAddress?.roomNumber,
                                    order?.deliveryAddress?.areaName,
                                    order?.deliveryAddress?.text,
                                    order?.deliveryAddress?.pinCode
                                ].filter(Boolean).join(', ')}
                            </p>
                        </div>
                    </div>

                    <div className="py-3">
                        <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Order Items
                        </h3>
                        <table className="w-full text-left border-collapse text-[10px]">
                            <thead>
                                <tr className="bg-gray-50 font-bold text-gray-700 uppercase text-[8px] tracking-wider border-b border-gray-200">
                                    <th className="py-1.5 px-2">S.No.</th>
                                    <th className="py-2.5 px-3">Product Name</th>
                                    <th className="py-2.5 px-3 text-center">HSN</th>
                                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                                    <th className="py-2.5 px-3 text-center">Qty</th>
                                    <th className="py-2.5 px-3 text-right">CGST (2.5%)</th>
                                    <th className="py-2.5 px-3 text-right">SGST (2.5%)</th>
                                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order?.items?.map((item, index) => {
                                    const qty = item.quantity || 1;
                                    const itemPrice = item.price || 0;
                                    const lineTotal = itemPrice * qty;
                                    const itemCgst = lineTotal * 0.025;
                                    const itemSgst = lineTotal * 0.025;
                                    const totalWithTax = lineTotal + itemCgst + itemSgst;
                                    
                                    return (
                                        <tr key={index} className="text-gray-800">
                                            <td className="py-1.5 px-2">{index + 1}</td>
                                            <td className="py-1.5 px-2">
                                                <p className="font-bold">{item.name}</p>
                                                {item.variantName && (
                                                    <p className="text-[9px] text-gray-400 uppercase mt-0.5 font-semibold">Variant: {item.variantName}</p>
                                                )}
                                            </td>
                                            <td className="py-1.5 px-2 text-center text-gray-400">1515</td>
                                            <td className="py-1.5 px-2 text-right">₹{itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="py-1.5 px-2 text-center font-bold">{qty}</td>
                                            <td className="py-1.5 px-2 text-right text-gray-500">₹{itemCgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="py-1.5 px-2 text-right text-gray-500">₹{itemSgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="py-1.5 px-2 text-right font-bold">₹{totalWithTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-200">
                        <div className="w-64 space-y-1.5 text-[10px] text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal (Excl. Tax)</span>
                                <span className="font-bold text-gray-900">
                                    ₹{(order?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            
                            {order?.cgst > 0 && (
                                <div className="flex justify-between">
                                    <span>CGST (2.5%)</span>
                                    <span className="font-bold text-gray-900">₹{order.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {order?.sgst > 0 && (
                                <div className="flex justify-between">
                                    <span>SGST (2.5%)</span>
                                    <span className="font-bold text-gray-900">₹{order.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            
                            {!(order?.cgst > 0) && (
                                <div className="flex justify-between">
                                    <span>GST (5%)</span>
                                    <span className="font-bold text-gray-900">
                                        ₹{((order?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0) * 0.05).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            {order?.discountAmount > 0 && (
                                <div className="flex justify-between text-red-600 font-bold">
                                    <span>Discount Applied</span>
                                    <span>-₹{order.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            {order?.walletDeductedAmount > 0 && (
                                <div className="flex justify-between text-green-700 font-bold">
                                    <span>Wallet Balance Used</span>
                                    <span>-₹{order.walletDeductedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            <div className="flex justify-between pt-1.5 border-t border-gray-300 text-xs font-black text-gray-900">
                                <span>Grand Total</span>
                                <span>₹{(order?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom section (Verified Signature) */}
                    <div className="mt-4 flex justify-end border-t border-gray-200 pt-3">
                        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-2.5 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-500/10">
                                ✓
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Digitally Verified</p>
                                <p className="text-[8px] font-bold text-slate-500 mt-0.5">OwnFresh Agro Industries</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="print:hidden min-h-screen bg-slate-50 pb-20">
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
                                Order <span className="text-[#FFDD00]">Details</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Ordered on {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full hidden sm:block"></div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide font-mono">Order# {(order.customOrderId || order._id).toUpperCase()}</p>
                            </div>
                        </div>
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FFDD00] hover:border-[#FFDD00] transition-all shadow-sm">
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
                                        <MapPin size={14} className="text-[#24672E]" /> Shipping Address
                                    </h4>
                                    <div className="flex flex-col gap-1 mb-6">
                                        <span className="text-[10px] font-black text-[#24672E] uppercase">Delivery Address</span>
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

                        {/* Order Fulfillment Progress Timeline */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                {getStatusIcon(order.status)} Order Status: {order.status}
                            </h4>
                            {['cancelled', 'cancellation_requested'].includes(order.status) ? (
                                <div className="text-center py-6">
                                    <XCircle className={`w-12 h-12 mx-auto mb-2 ${order.status === 'cancelled' ? 'text-red-500' : 'text-orange-500 animate-pulse'}`} />
                                    <h5 className={`text-sm font-black uppercase tracking-wider ${order.status === 'cancelled' ? 'text-red-600' : 'text-orange-600'}`}>
                                        {order.status === 'cancelled' ? 'Order Cancelled / Voided' : 'Cancellation Under Review'}
                                    </h5>
                                    <p className="text-[10px] font-bold text-slate-500 mt-2 capitalize leading-relaxed">
                                        Reason: {order.cancellationReason || "No reason specified."}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {[
                                        { label: "Order Placed", done: true, desc: "We have received your order." },
                                        { label: "Payment Received", done: order.paymentStatus === 'completed', desc: order.paymentStatus === 'completed' ? "Payment cleared successfully." : "Awaiting payment clearance." },
                                        { label: "Thank You Email Sent", done: order.paymentStatus === 'completed', desc: "Order confirmation sent to your email." },
                                        { label: "Packing & Preparing", done: order.labelPrinted, desc: "We are packing your items at our warehouse." },
                                        { label: "Receipt Uploaded", done: !!order.courierReceiptUrl, desc: "Courier partner receipt received." },
                                        { label: "Tracking Generated", done: !!order.trackingId, desc: order.trackingId ? `Tracking ID generated: ${order.trackingId}` : "Generating AWB shipment tracking number." },
                                        { label: "Shipped & Dispatched", done: order.shipmentEmailSent, desc: order.shipmentEmailSent ? "Package handed over to courier." : "Awaiting dispatch." }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                    step.done ? 'bg-[#24672E] text-white shadow-md' : 'bg-slate-100 text-slate-300 border border-slate-200'
                                                }`}>
                                                    {step.done ? "✓" : idx + 1}
                                                </div>
                                                {idx < 6 && (
                                                    <div className={`w-0.5 h-10 ${
                                                        step.done ? 'bg-[#24672E]' : 'bg-slate-100'
                                                    }`} />
                                                )}
                                            </div>
                                            <div className="pt-1">
                                                <p className={`text-xs font-black uppercase tracking-wider ${step.done ? 'text-slate-900' : 'text-slate-300'}`}>
                                                    {step.label}
                                                </p>
                                                <p className={`text-[10px] font-bold mt-0.5 ${step.done ? 'text-slate-500' : 'text-slate-300'}`}>
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                                <Link to={`/product/${item.productId?._id || item.productId}`} className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all">Buy it again</Link>
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
                            <h4 className="text-[11px] font-black text-[#FFDD00] uppercase tracking-widest mb-8">Order Summary</h4>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Items Subtotal</span>
                                    <span className="text-xs font-black font-mono">₹{(order.totalAmount + order.discountAmount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-400">
                                    <span className="text-[10px] font-bold uppercase">Discount applied</span>
                                    <span className="text-xs font-black font-mono">-₹{order.discountAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Shipping</span>
                                    <span className="text-xs font-black uppercase">FREE</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 mb-8 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                                    <p className="text-3xl font-black text-[#FFDD00] font-mono leading-none mt-2">₹{order.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full bg-[#FFDD00] text-black text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:shadow-xl hover:shadow-yellow-500/20 transition-all active:scale-[0.98]">
                                    Track My Package
                                </button>
                                {['pending', 'processing'].includes(order.status) && (
                                    order.createdAt && (Date.now() - new Date(order.createdAt).getTime() < 60 * 60 * 1000) ? (
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setIsCancellingModalOpen(true)}
                                                className="w-full bg-white/5 border border-white/10 text-red-400 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                                            >
                                                Request Cancellation
                                            </button>
                                            <p className="text-[9px] text-slate-400 font-bold text-center uppercase tracking-widest">
                                                * Note: You can cancel the order within 1 hour of placing it
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="w-full bg-white/5 border border-white/10 text-slate-500 text-[9px] font-black uppercase tracking-widest py-4 rounded-2xl text-center">
                                            Cancellation Window Closed (1 hr limit)
                                        </div>
                                    )
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
            <AnimatePresence>
                {isCancellingModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsCancellingModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-10 max-h-[90vh] overflow-y-auto"
                        >
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
                                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold text-xs h-32 resize-none transition-all focus:border-[#FFDD00]"
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </>
    );
};

export default OrderDetails;
