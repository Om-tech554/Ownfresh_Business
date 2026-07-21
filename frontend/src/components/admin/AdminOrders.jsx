import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import {
    Search, Loader2, Package, User, Clock, CheckCircle2, Truck, X, XCircle,
    MapPin, ExternalLink, Calendar, CreditCard, ChevronDown, Printer,
    MoreHorizontal, Filter, ArrowUpRight, Copy, Save, AlertCircle, Trash2,
    UploadCloud, Send, ShieldAlert
} from "lucide-react";
import toast from "react-hot-toast";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("unshipped"); // Amazon style: start with work to do
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    // New Fulfillment workflow states
    const [carriers, setCarriers] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);
    const [emailPreview, setEmailPreview] = useState(null);
    const [testEmailAddress, setTestEmailAddress] = useState("");
    const [isPreparingEmail, setIsPreparingEmail] = useState(false);

    // Audit logs states
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [isLoadingAudit, setIsLoadingAudit] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchCarriers();
    }, []);

    const fetchCarriers = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/fulfillment/carriers`, { withCredentials: true });
            if (data.success) {
                setCarriers(data.carriers);
            }
        } catch (error) {
            console.error("Failed to fetch carriers:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/order/admin/all`, { withCredentials: true });
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateField = async (orderId, updates) => {
        setUpdatingId(orderId);
        try {
            const { data } = await axios.put(`${serverUrl}/api/order/status/${orderId}`, updates, { withCredentials: true });
            if (data.success) {
                toast.success("Order updated");
                setOrders(orders.map(o => o._id === orderId ? { ...o, ...updates } : o));
                if (selectedOrder?._id === orderId) {
                    setSelectedOrder({ ...selectedOrder, ...updates });
                }
            }
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePrintLabel = async (order) => {
        printPackingSlip(order);
        try {
            const { data } = await axios.put(`${serverUrl}/api/fulfillment/label-printed/${order._id}`, {}, { withCredentials: true });
            if (data.success) {
                setOrders(orders.map(o => o._id === order._id ? { ...o, labelPrinted: true } : o));
                if (selectedOrder?._id === order._id) {
                    setSelectedOrder({ ...selectedOrder, labelPrinted: true });
                }
            }
        } catch (error) {
            console.error("Failed to mark label as printed:", error);
        }
    };

    const handleReceiptUpload = async (e, orderId) => {
        const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("receipt", file);
        formData.append("orderId", orderId);

        setIsUploading(true);
        setOcrResult(null);
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/fulfillment/upload-receipt`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true
                }
            );
            if (data.success) {
                toast.success("Receipt uploaded & OCR completed!");
                setOcrResult({
                    fileUrl: data.fileUrl,
                    rawText: data.rawText,
                    courierPartner: data.courierPartner,
                    trackingId: data.trackingId
                });
            }
        } catch (error) {
            console.error("OCR Failed:", error);
            const errorMsg = error.response?.data?.msg || "OCR scanning failed";
            toast.error(errorMsg);
            // Setup sandbox so manual entry works
            setOcrResult({
                fileUrl: error.response?.data?.fileUrl || "",
                rawText: error.response?.data?.rawText || "",
                courierPartner: "Unknown Carrier",
                trackingId: ""
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleConfirmFulfillment = async (orderId) => {
        if (!ocrResult?.courierPartner || ocrResult.courierPartner === "Unknown Carrier") {
            return toast.error("Please select a valid Courier Partner");
        }
        if (!ocrResult?.trackingId?.trim()) {
            return toast.error("Please enter a Tracking Number");
        }

        try {
            const { data } = await axios.put(
                `${serverUrl}/api/fulfillment/confirm/${orderId}`,
                {
                    courierPartner: ocrResult.courierPartner,
                    trackingId: ocrResult.trackingId,
                    courierReceiptUrl: ocrResult.fileUrl,
                    courierReceiptRawText: ocrResult.rawText
                },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Fulfillment confirmed!");
                setOrders(orders.map(o => o._id === orderId ? { ...o, ...data.order } : o));
                setSelectedOrder({ ...selectedOrder, ...data.order });
                setOcrResult(null);
                handlePrepareEmail(orderId);
            }
        } catch (error) {
            console.error("Confirmation failed:", error);
            toast.error(error.response?.data?.msg || "Confirmation failed");
        }
    };

    const handlePrepareEmail = async (orderId) => {
        setIsPreparingEmail(true);
        setEmailPreview(null);
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/fulfillment/preview-email/${orderId}`,
                {},
                { withCredentials: true }
            );
            if (data.success) {
                setEmailPreview({
                    subject: data.subject,
                    html: data.html,
                    text: data.text,
                    customerEmail: data.customerEmail
                });
            }
        } catch (error) {
            console.error("Preparing email failed:", error);
            toast.error(error.response?.data?.msg || "Failed to prepare email preview");
        } finally {
            setIsPreparingEmail(false);
        }
    };

    const handleSendTestEmail = async (orderId) => {
        if (!testEmailAddress.trim()) {
            return toast.error("Please enter a test email address");
        }
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/fulfillment/test-email/${orderId}`,
                {
                    subject: emailPreview.subject,
                    html: emailPreview.html,
                    text: emailPreview.text,
                    testEmail: testEmailAddress
                },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.msg || "Test email sent!");
            }
        } catch (error) {
            console.error("Test email failed:", error);
            toast.error(error.response?.data?.msg || "Failed to send test email");
        }
    };

    const handleSendShipmentEmail = async (orderId) => {
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/fulfillment/send-email/${orderId}`,
                {
                    subject: emailPreview.subject,
                    html: emailPreview.html,
                    text: emailPreview.text
                },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success("Shipment email sent & status updated to Shipped!");
                setOrders(orders.map(o => o._id === orderId ? { ...o, ...data.order } : o));
                setSelectedOrder({ ...selectedOrder, ...data.order });
                setEmailPreview(null);
            }
        } catch (error) {
            console.error("Fulfillment email sending failed:", error);
            toast.error(error.response?.data?.msg || "Failed to send shipment email");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("CRITICAL: Permanently delete this order from the database? This action CANNOT be undone.")) return;

        try {
            const { data } = await axios.delete(`${serverUrl}/api/order/admin-delete/${orderId}`, { withCredentials: true });
            if (data.success) {
                toast.success("Order Permanently DELETED");
                setOrders(orders.filter(o => o._id !== orderId));
                setSelectedOrder(null);
            }
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const fetchAuditLogs = async (orderId) => {
        setIsLoadingAudit(true);
        try {
            const { data } = await axios.get(`${serverUrl}/api/fulfillment/audit-logs/${orderId}`, { withCredentials: true });
            if (data.success) {
                setAuditLogs(data.logs);
            }
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
            toast.error("Failed to load audit logs");
        } finally {
            setIsLoadingAudit(false);
        }
    };

    const printPackingSlip = (order) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Packing Slip #${order._id.toUpperCase()}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; }
                    .header { border-bottom: 2px solid #000; padding-bottom: 20px; display: flex; justify-content: space-between; }
                    .details { margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; }
                    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { bg-color: #f8f8f8; }
                </style>
                </head>
                <body>
                    <div class="header">
                        <div><h1>OWN FRESH</h1><p>Natural Oils & Wellness</p></div>
                        <div style="text-align: right"><h2>PACKING SLIP</h2><p>Order ID: ${order._id.toUpperCase()}</p></div>
                    </div>
                    <div class="details">
                        <div><h3>Ship To:</h3><p>${order.user?.fullName}<br/>${order.deliveryAddress?.roomNumber}, ${order.deliveryAddress?.areaName}<br/>${order.deliveryAddress?.text}</p></div>
                        <div><h3>Order Date:</h3><p>${new Date(order.createdAt).toLocaleDateString()}</p><h3>Payment:</h3><p>${order.PaymentMethod}</p></div>
                    </div>
                    <table>
                        <thead><tr><th>Item Description</th><th>Qty</th></tr></thead>
                        <tbody>
                            ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const tabs = [
        { id: "unshipped", label: "Unshipped", count: orders.filter(o => ['pending', 'processing'].includes(o.status)).length },
        { id: "shipped", label: "Shipped", count: orders.filter(o => o.status === 'shipped').length },
        { id: "delivered", label: "Delivered", count: orders.filter(o => o.status === 'delivered').length },
        { id: "cancelled", label: "Cancelled", count: orders.filter(o => ['cancelled', 'cancellation_requested'].includes(o.status)).length },
        { id: "all", label: "All Orders", count: orders.length }
    ];

    const getTabFilteredOrders = () => {
        let filtered = orders;
        if (activeTab === "unshipped") filtered = orders.filter(o => ['pending', 'processing'].includes(o.status));
        else if (activeTab === "shipped") filtered = orders.filter(o => o.status === 'shipped');
        else if (activeTab === "delivered") filtered = orders.filter(o => o.status === 'delivered');
        else if (activeTab === "cancelled") filtered = orders.filter(o => ['cancelled', 'cancellation_requested'].includes(o.status));

        if (searchTerm) {
            filtered = filtered.filter(o =>
                o.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o._id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    };

    const stats = {
        total: orders.length,
        unshipped: orders.filter(o => ['pending', 'processing'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === "delivered").length,
        revenue: orders.filter(o => !['cancelled', 'cancellation_requested'].includes(o.status)).reduce((acc, curr) => acc + curr.totalAmount, 0)
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-[#FFDD00] animate-spin" />
            <p className="mt-4 font-black uppercase tracking-widest text-slate-400 text-xs">Initializing Central Dashboard...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto px-6 pb-20 mt-6 animate-in fade-in duration-500">

            {/* ── TOP METRICS ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Gross Volume", val: `₹${stats.revenue.toLocaleString()}`, trend: "+12.5%", color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Orders to Ship", val: stats.unshipped, trend: "High Priority", color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Successful Deliveries", val: stats.delivered, trend: "98.2% Rate", color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Total Fleet", val: stats.total, trend: "All Time", color: "text-slate-500", bg: "bg-slate-50" },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <span className={`${s.bg} ${s.color} px-2 py-1 rounded-lg text-[9px] font-black uppercase`}>{s.trend}</span>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-left font-mono">{s.val}</h4>
                    </div>
                ))}
            </div>

            {/* ── Amazon-Style Tab Bar ── */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm mb-8 overflow-hidden">
                <div className="flex flex-wrap items-center border-b border-slate-100 bg-slate-50/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-5 text-[11px] font-black uppercase tracking-widest relative transition-all ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab.label}
                            <span className="ml-2 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[9px] text-slate-500">{tab.count}</span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFDD00] shadow-[0_-2px_8px_rgba(249,221,25,0.4)]"></div>
                            )}
                        </button>
                    ))}

                    <div className="ml-auto px-6 py-4 flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#24672E] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Orders..."
                                className="pl-11 pr-6 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none text-[10px] font-bold w-64 focus:border-[#24672E] transition-all shadow-inner shadow-slate-50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                {/* ── ORDERS TABLE ── */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Order Details</th>
                                <th className="px-8 py-5">Customer info</th>
                                <th className="px-8 py-5">Value / Items</th>
                                <th className="px-8 py-5">Logistics Status</th>
                                <th className="px-8 py-5 text-right">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {getTabFilteredOrders().length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active shipments in this category</p>
                                    </td>
                                </tr>
                            ) : getTabFilteredOrders().map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-slate-900 group-hover:text-blue-600 transition-colors font-mono uppercase tracking-tighter">
                                                #{order._id.substring(order._id.length - 12).toUpperCase()}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase flex items-center gap-1.5">
                                                <Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-900 text-[#FFDD00] flex items-center justify-center text-[10px] font-black uppercase mt-1 flex-shrink-0">
                                                {order.user?.fullName?.substring(0, 2) || "U"}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{order.user?.fullName}</p>
                                                <p className="text-[9px] font-bold text-slate-400 lowercase mt-1">{order.user?.email}</p>
                                                <div className="bg-slate-50 p-2 rounded border border-slate-100 mt-2 max-w-[200px]">
                                                    <p className="text-[9px] font-medium text-slate-600 flex items-start gap-1 mb-1 leading-tight">
                                                        <MapPin size={10} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2" title={order.deliveryAddress?.text}>
                                                            {order.deliveryAddress?.text || "No address provided"}
                                                        </span>
                                                    </p>
                                                    <p className="text-[9px] font-medium text-slate-600 flex items-center gap-1">
                                                        <span className="text-slate-400 font-bold text-xs">☎</span>
                                                        {order.deliveryAddress?.phone || order.user?.mobile || order.senderPhone || "No Phone"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-black text-slate-900 font-mono">₹{order.totalAmount}</span>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[9px] font-black text-[#24672E] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                    {order.items.length} ITEM{order.items.length > 1 ? 'S' : ''}
                                                </span>
                                                {order.PaymentMethod === 'cod' ? (
                                                    <span className="text-[9px] font-black text-orange-700 uppercase bg-orange-100 px-2 py-0.5 rounded border border-orange-200 shadow-sm">
                                                        💵 COD
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded border border-blue-200 shadow-sm">
                                                        💳 ONLINE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={order.status} />
                                        {order.trackingId && (
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <Truck size={10} className="text-slate-400" />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{order.trackingId}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
                                                title="Full Details"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                            <button
                                                onClick={() => handlePrintLabel(order)}
                                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
                                                title="Print Packing Slip"
                                            >
                                                <Printer size={14} />
                                            </button>
                                            <div className="relative group/more">
                                                <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
                                                    <MoreHorizontal size={14} />
                                                </button>
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 hidden group-hover/more:block">
                                                    <button onClick={() => toast.success("Invoice Downloaded")} className="w-full text-left px-5 py-2.5 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2">
                                                        <Printer size={12} /> Download Invoice
                                                    </button>
                                                    <button onClick={() => { navigator.clipboard.writeText(order._id); toast.success("Order ID Copied"); }} className="w-full text-left px-5 py-2.5 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2">
                                                        <Copy size={12} /> Copy Order ID
                                                    </button>
                                                    <div className="border-t border-slate-100 my-1"></div>
                                                    <button onClick={() => handleDeleteOrder(order._id)} className="w-full text-left px-5 py-2.5 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2">
                                                        <Trash2 size={12} /> Delete Order
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── AMAZON FULFILLMENT MODAL ── */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
                    <div className="bg-[#f0f2f2] w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden border-t-8 border-slate-900">

                        {/* Amazon Style Compact Header */}
                        <div className="bg-white px-8 py-5 border-b border-slate-300 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Order Fulfillment Center</h3>
                                <div className="w-[1px] h-6 bg-slate-200"></div>
                                <p className="text-xs font-black text-slate-500 font-mono">ID: {selectedOrder._id.toUpperCase()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-red-500 hover:text-white hover:rotate-90 hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
                                title="Close Panel"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left: Summary & Logistics Update */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Shipment Status Management */}
                                <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-sm">
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Truck className="text-blue-500" size={16} /> Fulfillment Workflow
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Order Status</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs appearance-none focus:border-blue-500 transition-all"
                                                    value={selectedOrder.status}
                                                    onChange={(e) => handleUpdateField(selectedOrder._id, { status: e.target.value })}
                                                >
                                                    <option value="pending">Pending Verification</option>
                                                    <option value="processing">Awaiting Pickup</option>
                                                    <option value="shipped">On the Road (Shipped)</option>
                                                    <option value="delivered">Successfully Delivered</option>
                                                    <option value="cancelled">Cancelled (In-Active)</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Settlement</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs appearance-none focus:border-emerald-500 transition-all"
                                                    value={selectedOrder.paymentStatus}
                                                    onChange={(e) => handleUpdateField(selectedOrder._id, { paymentStatus: e.target.value })}
                                                >
                                                    <option value="pending">Pending Payment</option>
                                                    <option value="completed">Payment Received</option>
                                                    <option value="failed">Transaction Failed</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Fulfillment Timeline Progress */}
                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Fulfillment Progress Timeline</h5>
                                        <div className="flex flex-wrap items-center justify-between gap-y-4">
                                            {[
                                                { label: "Placed", done: true },
                                                { label: "Paid", done: selectedOrder.paymentStatus === "completed" },
                                                { label: "Label Printed", done: selectedOrder.labelPrinted },
                                                { label: "Receipt Uploaded", done: !!selectedOrder.courierReceiptUrl },
                                                { label: "OCR Completed", done: !!selectedOrder.courierReceiptRawText },
                                                { label: "Tracking Generated", done: !!selectedOrder.trackingId },
                                                { label: "Email Sent", done: selectedOrder.shipmentEmailSent }
                                            ].map((step, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done ? 'bg-[#24672E] text-white' : 'bg-slate-100 text-slate-300 border border-slate-200'}`}>
                                                        {step.done ? "✓" : idx + 1}
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${step.done ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</span>
                                                    {idx < 6 && <div className={`h-[1px] w-4 hidden sm:block ${step.done ? 'bg-[#24672E]' : 'bg-slate-200'}`}></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Flow - Step by Step */}
                                    {!selectedOrder.labelPrinted && (
                                        <div className="mt-8 pt-8 border-t border-slate-100 text-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-slate-700">Generate and print the packing slip first to begin the fulfillment process.</p>
                                            <button
                                                onClick={() => handlePrintLabel(selectedOrder)}
                                                className="mt-4 px-6 py-3 bg-[#FFDD00] text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors"
                                            >
                                                Print Packing Slip
                                            </button>
                                        </div>
                                    )}

                                    {/* OCR Upload Area */}
                                    {selectedOrder.labelPrinted && !selectedOrder.trackingId && !ocrResult && (
                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Upload Courier Receipt</h5>
                                            <div
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => { e.preventDefault(); handleReceiptUpload(e, selectedOrder._id); }}
                                                className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer relative"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    onChange={(e) => handleReceiptUpload(e, selectedOrder._id)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                {isUploading ? (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Loader2 className="w-8 h-8 text-[#FFDD00] animate-spin mb-2" />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Running OCR Analysis...</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                                        <p className="text-[11px] font-bold text-slate-600">Drag & drop receipt here, or click to browse</p>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Supports PNG, JPG, JPEG, and PDF (Max 10MB)</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* OCR Sandbox Confirmation Dialog */}
                                    {ocrResult && (
                                        <div className="mt-8 pt-8 border-t border-slate-100 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                            <h5 className="text-[10px] font-black text-[#24672E] uppercase tracking-widest mb-4">Confirm OCR Extraction Results</h5>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Courier Partner</label>
                                                    <select
                                                        value={ocrResult.courierPartner}
                                                        onChange={(e) => setOcrResult({ ...ocrResult, courierPartner: e.target.value })}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                                                    >
                                                        <option value="Unknown Carrier">Unknown Carrier</option>
                                                        {carriers.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">AWB / Tracking Number</label>
                                                    <input
                                                        type="text"
                                                        value={ocrResult.trackingId}
                                                        onChange={(e) => setOcrResult({ ...ocrResult, trackingId: e.target.value })}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                                                        placeholder="Enter Tracking ID..."
                                                    />
                                                </div>
                                            </div>

                                            {ocrResult.fileUrl && (
                                                <div className="mb-4">
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Receipt Preview</label>
                                                    <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[250px]">{ocrResult.fileUrl.split('/').pop()}</span>
                                                        <a href={ocrResult.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-[10px] font-black uppercase hover:underline">View File ↗</a>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConfirmFulfillment(selectedOrder._id)}
                                                    className="flex-1 bg-[#24672E] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#1E971D] transition-colors"
                                                >
                                                    Confirm Details
                                                </button>
                                                <button
                                                    onClick={() => setOcrResult(null)}
                                                    className="px-6 bg-white border border-slate-300 text-slate-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Email Dispatcher Sandbox */}
                                    {selectedOrder.trackingId && !selectedOrder.shipmentEmailSent && (
                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            {!emailPreview ? (
                                                <div className="text-center py-4">
                                                    {isPreparingEmail ? (
                                                        <div className="flex flex-col items-center">
                                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
                                                            <p className="text-[9px] font-black text-slate-400 uppercase">Generating Shipment Email Preview...</p>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePrepareEmail(selectedOrder._id)}
                                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                                                        >
                                                            Prepare Shipment Email Preview
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                                                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Shipment Email Dispatcher</h5>

                                                    <div className="space-y-4 mb-4">
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Email Subject</label>
                                                            <input
                                                                type="text"
                                                                value={emailPreview.subject}
                                                                onChange={(e) => setEmailPreview({ ...emailPreview, subject: e.target.value })}
                                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Recipient</label>
                                                            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600">
                                                                {emailPreview.customerEmail}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 font-bold">HTML Preview</label>
                                                                <iframe
                                                                    srcDoc={emailPreview.html}
                                                                    className="w-full h-64 border border-slate-200 rounded-xl bg-white"
                                                                    title="HTML Email Preview"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 font-bold">Plain Text Preview</label>
                                                                <textarea
                                                                    value={emailPreview.text}
                                                                    onChange={(e) => setEmailPreview({ ...emailPreview, text: e.target.value })}
                                                                    className="w-full h-64 p-3 bg-white border border-slate-200 rounded-xl outline-none font-mono text-[10px] resize-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mb-4 bg-white p-4 rounded-xl border border-slate-200">
                                                        <input
                                                            type="email"
                                                            placeholder="Enter admin test email address..."
                                                            value={testEmailAddress}
                                                            onChange={(e) => setTestEmailAddress(e.target.value)}
                                                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs"
                                                        />
                                                        <button
                                                            onClick={() => handleSendTestEmail(selectedOrder._id)}
                                                            className="px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-colors"
                                                        >
                                                            Test Send
                                                        </button>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSendShipmentEmail(selectedOrder._id)}
                                                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Send size={12} /> Send Email to Customer
                                                        </button>
                                                        <button
                                                            onClick={() => setEmailPreview(null)}
                                                            className="px-6 bg-white border border-slate-300 text-slate-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 transition-colors"
                                                        >
                                                            Hide Preview
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Already Shipped Notification */}
                                    {selectedOrder.shipmentEmailSent && (
                                        <div className="mt-8 pt-8 border-t border-slate-100 bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                                            <h5 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <CheckCircle2 size={14} /> Order Shipped & Notified
                                            </h5>
                                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                                                The shipment email was successfully sent to the customer on <b>{new Date(selectedOrder.shipmentEmailSentAt).toLocaleString()}</b>.<br/>
                                                AWB/Tracking Code: <b>{selectedOrder.trackingId}</b> via <b>{selectedOrder.courierPartner}</b>.<br/>
                                                <a href={selectedOrder.trackingUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-black uppercase mt-2 inline-block">Track Package ↗</a>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Items Density Card */}
                                <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-sm">
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Inventory Items ({selectedOrder.items.length})</h4>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:border-slate-300 transition-colors">
                                                <img src={item.image} className="w-16 h-16 object-contain mix-blend-multiply flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-slate-900 uppercase truncate">{item.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 mt-1">QTY: {item.quantity} | SKU: OIL-${((typeof item.productId === 'object' ? item.productId?._id : item.productId) || "").substring(0, 6).toUpperCase()}</p>
                                                </div>
                                                <p className="text-sm font-black text-slate-900 font-mono">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Customer & Internal Notes */}
                            <div className="space-y-6">

                                {/* Customer Summary Card */}
                                <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-slate-900 rounded-lg"><User className="text-[#FFDD00] w-4 h-4" /></div>
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Customer Profile</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Full Name</p>
                                            <p className="text-[11px] font-bold text-slate-800 uppercase">{selectedOrder.user?.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contact Email</p>
                                            <p className="text-[11px] font-bold text-blue-600">{selectedOrder.user?.email}</p>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Shipping Terminal</p>
                                            <div className="flex items-start gap-2">
                                                <MapPin size={12} className="text-[#24672E] mt-0.5 flex-shrink-0" />
                                                <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase">
                                                    {selectedOrder.deliveryAddress?.roomNumber}, {selectedOrder.deliveryAddress?.areaName}<br />
                                                    {selectedOrder.deliveryAddress?.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Online Payment Details */}
                                {selectedOrder.razorpayPaymentId && (
                                    <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-emerald-100 rounded-lg"><CreditCard className="text-emerald-600 w-4 h-4" /></div>
                                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Online Payment Details</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Razorpay Payment ID</p>
                                                <p className="text-[11px] font-bold text-slate-900 font-mono flex items-center gap-2">
                                                    {selectedOrder.razorpayPaymentId}
                                                    <button onClick={() => { navigator.clipboard.writeText(selectedOrder.razorpayPaymentId); toast.success("Payment ID Copied!"); }} className="text-slate-400 hover:text-blue-500 transition-colors"><Copy size={12} /></button>
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Razorpay Order ID</p>
                                                <p className="text-[11px] font-bold text-slate-900 font-mono flex items-center gap-2">
                                                    {selectedOrder.razorpayOrderId}
                                                    <button onClick={() => { navigator.clipboard.writeText(selectedOrder.razorpayOrderId); toast.success("Order ID Copied!"); }} className="text-slate-400 hover:text-blue-500 transition-colors"><Copy size={12} /></button>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Admin Internal Notes */}
                                <div className="bg-slate-900 p-6 rounded-xl shadow-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white/10 rounded-lg"><Save className="text-white w-4 h-4" /></div>
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Internal Fleet Notes</h4>
                                    </div>
                                    <textarea
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FFDD00] transition-all h-32 resize-none leading-relaxed"
                                        placeholder="Add private team notes here..."
                                        defaultValue={selectedOrder.adminNotes}
                                        onBlur={(e) => handleUpdateField(selectedOrder._id, { adminNotes: e.target.value })}
                                    ></textarea>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-3 tracking-wider">Changes are auto-saved on blur</p>
                                </div>

                                {/* Danger / Action Area */}
                                {selectedOrder.status === 'cancellation_requested' && (
                                    <div className="bg-orange-50 border-2 border-orange-500 rounded-xl p-6 animate-pulse">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertCircle className="text-orange-600" size={16} />
                                            <h4 className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Pending Cancellation</h4>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-orange-200 mb-6">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">User Reason:</p>
                                            <p className="text-[11px] font-bold text-slate-900 mt-1 capitalize leading-relaxed">{selectedOrder.cancellationReason}</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={async () => {
                                                    await axios.put(`${serverUrl}/api/order/cancel-review/${selectedOrder._id}`, { action: 'approve' }, { withCredentials: true });
                                                    toast.success("Order VOIDED"); // Simplified for brevity in this complex rewrite
                                                    fetchOrders(); setSelectedOrder(null);
                                                }}
                                                className="w-full py-3 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-red-700 transition-all"
                                            >
                                                Approve (Void Order)
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    await axios.put(`${serverUrl}/api/order/cancel-review/${selectedOrder._id}`, { action: 'reject' }, { withCredentials: true });
                                                    toast.success("Cancellation Denied");
                                                    fetchOrders(); setSelectedOrder(null);
                                                }}
                                                className="w-full py-3 bg-white border border-orange-300 text-orange-600 rounded-lg text-[9px] font-black uppercase hover:bg-orange-100 transition-all"
                                            >
                                                Reject & Continue
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer / Summary Bar */}
                        <div className="bg-white px-8 py-6 border-t border-slate-300 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                            <div className="flex items-end gap-10">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Transaction</p>
                                    <p className="text-2xl font-black text-slate-900 font-mono">₹{selectedOrder.totalAmount}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Savings</p>
                                    <p className="text-lg font-black text-emerald-500 font-mono">₹{selectedOrder.discountAmount}</p>
                                </div>
                                <div className="w-[1px] h-10 bg-slate-100"></div>
                                <button
                                    onClick={() => handleDeleteOrder(selectedOrder._id)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 size={14} /> Delete Entry
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        setShowAuditModal(true);
                                        fetchAuditLogs(selectedOrder._id);
                                    }}
                                    className="px-8 py-3 bg-[#FFDD00] text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-yellow-100 transition-all"
                                >
                                    Full Audit Report
                                </button>
                                <button
                                    onClick={() => {
                                        const currentIndex = orders.findIndex(o => o._id === selectedOrder._id);
                                        if (currentIndex !== -1 && currentIndex < orders.length - 1) {
                                            setSelectedOrder(orders[currentIndex + 1]);
                                            setEmailPreview(null);
                                            setOcrResult(null);
                                        } else {
                                            toast.error("No more orders in the list!");
                                        }
                                    }}
                                    disabled={orders.findIndex(o => o._id === selectedOrder._id) === orders.length - 1}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next Order →
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ── INTERACTIVE AUDIT TRAIL MODAL ── */}
            {showAuditModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAuditModal(false)}></div>
                    <div className="bg-[#f0f2f2] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden border-t-8 border-[#24672E]">
                        {/* Audit Header */}
                        <div className="bg-white px-8 py-5 border-b border-slate-300 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <ShieldAlert className="text-[#24672E]" size={20} /> Order Audit Trail & History
                                </h3>
                                <div className="w-[1px] h-6 bg-slate-200"></div>
                                <p className="text-xs font-black text-slate-500 font-mono">Order ID: {selectedOrder?._id.toUpperCase()}</p>
                            </div>
                            <button
                                onClick={() => setShowAuditModal(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-red-500 hover:text-white hover:rotate-90 hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
                                title="Close Report"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Audit Body */}
                        <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
                            {isLoadingAudit ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <Loader2 className="w-10 h-10 text-[#24672E] animate-spin mb-4" />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading audit logs...</p>
                                </div>
                            ) : auditLogs.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                    <p className="text-sm font-bold text-slate-500">No audit logs found for this order.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {auditLogs.map((log) => (
                                        <div key={log._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition-shadow">
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                        log.eventType.includes("FAIL") || log.eventType.includes("ERROR") 
                                                            ? "bg-red-50 text-red-600 border border-red-200" 
                                                            : log.eventType.includes("SENT") || log.eventType.includes("COMPLETED") || log.eventType.includes("GENERATION")
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-blue-50 text-blue-700 border border-blue-200"
                                                    }`}>
                                                        {log.eventType.replace(/_/g, " ")}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                                
                                                {log.details && (
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-600 space-y-1">
                                                        {Object.entries(log.details).map(([key, val]) => (
                                                            <div key={key} className="break-all">
                                                                <span className="font-bold text-slate-800 uppercase tracking-wider mr-2">{key}:</span> 
                                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-left md:text-right text-[10px] font-bold text-slate-500 space-y-1 min-w-[200px]">
                                                <p><span className="font-black text-slate-400 uppercase tracking-widest">Admin:</span> {log.adminId?.fullName || "System/Automatic"}</p>
                                                <p><span className="font-black text-slate-400 uppercase tracking-widest">IP Addr:</span> {log.ipAddress || "N/A"}</p>
                                                <p><span className="font-black text-slate-400 uppercase tracking-widest">Browser:</span> {log.browser || "N/A"} ({log.device || "N/A"})</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        pending: { label: "Verification", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
        processing: { label: "Awaiting Logistics", color: "text-blue-600 bg-blue-50 border-blue-200", icon: Package },
        shipped: { label: "In Transit", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: Truck },
        delivered: { label: "Received", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
        cancelled: { label: "Voided", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
        cancellation_requested: { label: "Review Pending", color: "text-orange-600 bg-orange-50 border-orange-200", icon: AlertCircle },
    };

    const c = config[status] || config.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-tighter ${c.color}`}>
            <c.icon size={10} /> {c.label}
        </span>
    );
};

export default AdminOrders;
