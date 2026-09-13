import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import {
    Search, Loader2, Package, User, Clock, CheckCircle2, Truck, X, XCircle,
    MapPin, ExternalLink, Calendar, CreditCard, ChevronDown, Printer,
    MoreHorizontal, Filter, ArrowUpRight, Copy, Save, AlertCircle, Trash2,
    UploadCloud, Send, ShieldAlert, Plus, Mail
} from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";
import CreateManualOrderModal from "./CreateManualOrderModal.jsx";

export const isPuneOrder = (order) => {
    if (!order) return false;
    if (order.isLocalDelivery) return true;
    if (order.courierPartner && (order.courierPartner.toLowerCase().includes("local") || order.courierPartner.toLowerCase().includes("pune"))) return true;
    const addr = order.deliveryAddress || {};
    const city = (addr.city || "").toLowerCase();
    const area = (addr.areaName || "").toLowerCase();
    const text = (addr.text || "").toLowerCase();
    const pincode = String(addr.pincode || addr.zipCode || "");
    if (pincode.startsWith("411") || pincode.startsWith("412")) return true;
    const puneKeywords = [
        "pune", "pcmc", "pimpri", "chinchwad", "hadapsar", "kothrud", "hinjewadi",
        "hinjawadi", "wakad", "baner", "balewadi", "viman nagar", "vimannagar",
        "kondhwa", "shivajinagar", "aundh", "bavdhan", "katraj", "warje", "bibvewadi",
        "yerawada", "magarpatta", "kharadi", "nigdi", "bhosari", "akurdi", "chakan",
        "talawade", "vadgaon", "sinhagad", "koregaon park", "swargate", "deccan"
    ];
    return puneKeywords.some(kw => city.includes(kw) || area.includes(kw) || text.includes(kw));
};

const AdminOrders = () => {
    const confirm = useConfirm();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("unshipped"); // Amazon style: start with work to do
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);

    // Fulfillment workflow states
    const [carriers, setCarriers] = useState([]);
    const [courierPartner, setCourierPartner] = useState("Unknown Carrier");
    const [trackingId, setTrackingId] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState("");
    const [receiptRawText, setReceiptRawText] = useState("");
    const [emailPreview, setEmailPreview] = useState(null);
    const [testEmailAddress, setTestEmailAddress] = useState("");
    const [isPreparingEmail, setIsPreparingEmail] = useState(false);

    // Delivery confirmation email states
    const [deliveryEmailPreview, setDeliveryEmailPreview] = useState(null);
    const [isPreparingDeliveryEmail, setIsPreparingDeliveryEmail] = useState(false);
    const [isSendingDeliveryEmail, setIsSendingDeliveryEmail] = useState(false);
    const [deliveryTestEmailAddress, setDeliveryTestEmailAddress] = useState("");
    const [emailSectionTab, setEmailSectionTab] = useState("delivery");

    // Audit logs states
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [isLoadingAudit, setIsLoadingAudit] = useState(false);

    const prevOrdersMapRef = React.useRef(null);

    useEffect(() => {
        fetchOrders(false);
        fetchCarriers();

        // 🔄 Real-time polling for new orders & payment completions every 8 seconds
        const pollInterval = setInterval(() => {
            fetchOrders(true);
        }, 8000);

        return () => clearInterval(pollInterval);
    }, []);

    useEffect(() => {
        if (selectedOrder) {
            const isLocal = isPuneOrder(selectedOrder);
            setCourierPartner(selectedOrder.courierPartner || (isLocal ? "Local Pune Delivery" : "Unknown Carrier"));
            setTrackingId(selectedOrder.trackingId || (isLocal ? "LOCAL-PUNE" : ""));
            setReceiptUrl(selectedOrder.courierReceiptUrl || "");
            setReceiptRawText(selectedOrder.courierReceiptRawText || "");
            setDeliveryEmailPreview(null);
            setEmailPreview(null);
            // If already delivered, or if Pune local order, default to delivery email tab!
            if (selectedOrder.status === 'delivered' || selectedOrder.deliveryEmailSent || isLocal) {
                setEmailSectionTab("delivery");
            } else {
                setEmailSectionTab("shipment");
            }
        } else {
            setCourierPartner("Unknown Carrier");
            setTrackingId("");
            setReceiptUrl("");
            setReceiptRawText("");
            setDeliveryEmailPreview(null);
            setEmailPreview(null);
            setEmailSectionTab("delivery");
        }
    }, [selectedOrder]);

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

    const fetchOrders = async (isPolling = false) => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/order/admin/all`, { withCredentials: true });
            if (data.success) {
                const newOrders = data.orders || [];

                if (isPolling && prevOrdersMapRef.current) {
                    newOrders.forEach(o => {
                        const prev = prevOrdersMapRef.current[o._id];
                        const orderNum = `#${o._id.substring(o._id.length - 6).toUpperCase()}`;
                        
                        if (!prev) {
                            // New order created!
                            if (o.PaymentMethod === 'online' && o.paymentStatus === 'completed') {
                                toast.success(`💳 ONLINE PAYMENT CASHED! Order ${orderNum} (₹${o.totalAmount}) paid & verified via PhonePe!`, {
                                    duration: 8000,
                                    style: { borderRadius: "14px", background: "#064e3b", color: "#ecfdf5", border: "1px solid #10b981" }
                                });
                            } else if (o.PaymentMethod === 'cod') {
                                toast.success(`💵 NEW COD ORDER! Order ${orderNum} (₹${o.totalAmount}) placed - Collect Cash on Delivery`, {
                                    duration: 8000,
                                    style: { borderRadius: "14px", background: "#78350f", color: "#fef3c7", border: "1px solid #f59e0b" }
                                });
                            }
                        } else if (prev.paymentStatus !== 'completed' && o.paymentStatus === 'completed') {
                            // Payment transitioned to completed
                            toast.success(`💳 PAYMENT VERIFIED! Order ${orderNum} (₹${o.totalAmount}) payment status updated to COMPLETED!`, {
                                duration: 8000,
                                style: { borderRadius: "14px", background: "#064e3b", color: "#ecfdf5", border: "1px solid #10b981" }
                            });
                        }
                    });
                }

                const newMap = {};
                newOrders.forEach(o => { newMap[o._id] = o; });
                prevOrdersMapRef.current = newMap;
                setOrders(newOrders);
            }
        } catch (error) {
            if (!isPolling) toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkCodCashReceived = async (orderId, totalAmount) => {
        const confirmed = await confirm({
            title: "Confirm Cash Collection",
            message: `Confirm that ₹${totalAmount} cash has been received for this Cash on Delivery order? This will mark payment status as COMPLETED.`,
            type: "info",
            confirmText: "Mark Cash Received 💵",
            cancelText: "Cancel"
        });
        if (!confirmed) return;

        await handleUpdateField(orderId, { paymentStatus: "completed" });
        toast.success("Payment status updated: COD Cash Received 💵");
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
                if (updates.status === "delivered") {
                    toast.success("Order marked as Delivered! Prepare the delivery confirmation email below.", { duration: 5000 });
                    setEmailSectionTab("delivery");
                    handlePrepareDeliveryEmail(orderId);
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
                setReceiptUrl(data.fileUrl || "");
                setReceiptRawText(data.rawText || "");
                if (data.courierPartner && data.courierPartner !== "Unknown Carrier") {
                    setCourierPartner(data.courierPartner);
                }
                if (data.trackingId) {
                    setTrackingId(data.trackingId);
                }
            }
        } catch (error) {
            console.error("OCR Failed:", error);
            const errorMsg = error.response?.data?.msg || "OCR scanning failed";
            toast.error(errorMsg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleConfirmFulfillment = async (orderId) => {
        const isLocal = isPuneOrder(selectedOrder);
        const resolvedCourier = courierPartner || (isLocal ? "Local Pune Delivery" : "");

        if (!resolvedCourier || resolvedCourier === "Unknown Carrier") {
            return toast.error("Please select a valid Courier Partner");
        }

        // For Pune region orders: third-party couriers (DTDC/BlueDart) & tracking number are NOT required!
        if (!isLocal && !trackingId?.trim()) {
            return toast.error("Please enter a Tracking Number");
        }

        const resolvedTrackingId = (trackingId && trackingId.trim()) ? trackingId.trim() : (isLocal ? "LOCAL-PUNE" : "");

        try {
            const { data } = await axios.put(
                `${serverUrl}/api/fulfillment/confirm/${orderId}`,
                {
                    courierPartner: resolvedCourier,
                    trackingId: resolvedTrackingId,
                    courierReceiptUrl: receiptUrl,
                    courierReceiptRawText: receiptRawText
                },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success(isLocal ? "Local Pune delivery confirmed (No tracking number needed)!" : "Fulfillment confirmed!");
                setOrders(orders.map(o => o._id === orderId ? { ...o, ...data.order } : o));
                setSelectedOrder({ ...selectedOrder, ...data.order });
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

    const generateDeliveryEmailData = (order) => {
        const isPune = isPuneOrder(order);
        const customerName = order.user?.fullName || "Valued Customer";
        const siteUrl = "https://myownfresh.com";
        const orderId = order.customOrderId || (order._id ? order._id.toString().toUpperCase() : "ORDER");
        const deliveryAddress = order.deliveryAddress?.text || [
            order.deliveryAddress?.roomNumber,
            order.deliveryAddress?.areaName,
            order.deliveryAddress?.city,
            order.deliveryAddress?.pincode
        ].filter(Boolean).join(", ") || "Pune, Maharashtra";

        const deliveredDate = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        const deliveryModeDisplay = isPune
            ? "🛵 OwnFresh Direct Express (Pune Local Fleet - Hand Delivered)"
            : (order.courierPartner || "Standard Express Courier");

        const itemsHtml = (order.items || []).map(item => `
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #EEEEEE; vertical-align: middle;">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 46px; height: 46px; object-fit: cover; border-radius: 8px; margin-right: 12px; vertical-align: middle; display: inline-block; border: 1px solid #E5E5E5;" />` : ''}
                    <div style="display: inline-block; vertical-align: middle;">
                        <span style="font-weight: 700; font-size: 13px; color: #222222;">${item.name}</span>
                        ${item.variantName ? `<span style="font-size: 11px; color: #666666; display: block; margin-top: 2px;">Variant: ${item.variantName}</span>` : ''}
                    </div>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #EEEEEE; text-align: center; font-size: 13px; color: #555555; font-weight: 600;">${item.quantity}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #EEEEEE; text-align: right; font-size: 13px; font-weight: 800; color: #222222;">₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `
        <div style="background-color:#FFFDF2;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:540px;margin:auto;background:#ffffff;border:1px solid #E5E5E5;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.06);">
            
            <!-- Header with Logo & Order ID -->
            <div style="background:#ffffff;border-bottom:1px solid #EAEAEA;padding:18px 24px;text-align:center;">
              <a href="${siteUrl}" target="_blank" style="text-decoration:none;display:inline-block;">
                <img src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png" alt="OwnFresh Logo" style="height:48px;border:none;display:inline-block;vertical-align:middle;" />
              </a>
              <div style="margin-top:10px;">
                <span style="display:inline-block;background:#FFF9DB;border:1px solid #FFE066;color:#5C4300;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;">
                  Order ID: #${orderId}
                </span>
              </div>
            </div>

            <!-- Hero Banner -->
            <div style="background: linear-gradient(135deg, #24672E 0%, #17421D 100%); padding: 26px 20px; text-align: center; color: #ffffff;">
              <div style="font-size: 34px; line-height: 1; margin-bottom: 8px;">🥰</div>
              <h1 style="margin: 0; font-size: 21px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">Order Delivered Successfully!</h1>
              <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.92;">Pure, cold-pressed freshness at your doorstep</p>
            </div>

            <!-- Body Message -->
            <div style="padding:28px 24px;color:#333333;">
              <p style="font-size:17px;font-weight:700;color:#111111;margin-top:0;margin-bottom:14px;">
                Hi ${customerName},
              </p>

              <p style="font-size:18px;font-weight:800;color:#24672E;line-height:1.4;margin:14px 0 8px 0;">
                Your OwnFresh oil has been delivered successfully! 🥰
              </p>

              <p style="font-size:16px;font-weight:700;color:#C62828;margin:0 0 22px 0;">
                Thank you for choosing OwnFresh! ❤️
              </p>

              ${isPune ? `
              <!-- Pune Local Dedicated Delivery Callout -->
              <div style="margin: 18px 0; padding: 14px 18px; background: #F1F8E9; border-left: 4px solid #24672E; border-radius: 8px; font-size: 13px; color: #2E7D32; line-height: 1.5;">
                🛵 <b>OwnFresh Direct Pune Express:</b> Hand-delivered fresh directly to your doorstep in Pune with zero courier delays!
              </div>
              ` : ''}

              <!-- Delivery Information Card -->
              <div style="background:#F7F9F7;border:1px solid #D8E5D8;border-radius:12px;padding:18px;margin:22px 0;font-size:13px;line-height:1.7;">
                <div style="margin-bottom:6px;"><b>📦 Order ID:</b> <span style="font-family:monospace;font-weight:700;color:#24672E;">#${orderId}</span></div>
                <div style="margin-bottom:6px;"><b>📍 Delivered To:</b> ${deliveryAddress}</div>
                <div style="margin-bottom:6px;"><b>📅 Delivery Date:</b> ${deliveredDate}</div>
                <div style="margin-bottom:6px;">
                  <b>🚚 Delivery Mode:</b> 
                  ${isPune 
                    ? `<span style="display:inline-block;background:#E8F5E9;color:#1B5E20;border:1px solid #A5D6A7;padding:3px 10px;border-radius:8px;font-size:12px;font-weight:700;">🛵 OwnFresh Direct Express (Pune Local Fleet)</span>`
                    : `<span style="font-weight:700;color:#222222;">${order.courierPartner || "Standard Express Courier"}</span>`
                  }
                </div>
                <div><b>💳 Payment:</b> ${order.PaymentMethod ? order.PaymentMethod.toUpperCase() : "PAID"} (₹${(order.totalAmount || 0).toFixed(2)})</div>
              </div>

              <!-- Items in Delivery Table -->
              <h3 style="font-size:13px;color:#24672E;text-transform:uppercase;letter-spacing:1px;font-weight:800;margin:24px 0 10px;">Delivered Items</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:22px;border:1px solid #EEEEEE;border-radius:8px;overflow:hidden;">
                <thead>
                  <tr style="background:#F5F5F5;font-size:11px;text-transform:uppercase;color:#666666;font-weight:700;">
                    <th style="padding:10px 12px;text-align:left;">Item</th>
                    <th style="padding:10px 12px;text-align:center;width:50px;">Qty</th>
                    <th style="padding:10px 12px;text-align:right;width:85px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Tax Invoice & Order Link -->
              <div style="text-align:center;margin:28px 0 20px;">
                <a href="${siteUrl}/my-orders" target="_blank" style="
                  display:inline-block;
                  padding:14px 30px;
                  font-size:13px;
                  font-weight:800;
                  background:#FFD700;
                  color:#000000;
                  border-radius:10px;
                  text-decoration:none;
                  text-transform:uppercase;
                  letter-spacing:0.5px;
                  box-shadow:0 3px 10px rgba(0,0,0,0.08);
                ">
                  View Order & Download Tax Invoice →
                </a>
              </div>

              <!-- Review & Feedback Callout -->
              <div style="background:#FFF9E6;border:1px solid #FFE699;border-radius:10px;padding:16px;margin-top:22px;text-align:center;font-size:13px;color:#7A5E00;line-height:1.5;">
                🌿 <b>Loving the taste of stone-pressed purity?</b><br />
                We would truly appreciate your rating and review on our website!
              </div>

              <!-- Support Contact -->
              <p style="font-size:13px;color:#666666;margin-top:24px;line-height:1.5;">
                Have questions about this delivery or need support? Simply reply directly to this email or write to us at <a href="mailto:contact@myownfresh.com" style="color:#24672E;text-decoration:none;font-weight:700;">contact@myownfresh.com</a>.
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#F5F5F5;padding:16px;text-align:center;font-size:12px;color:#777777;border-top:1px solid #EEEEEE;line-height:1.6;">
              <p style="margin:0 0 4px 0;"><b>OwnFresh Agro Industries</b> — Pune, Maharashtra</p>
              <p style="margin:0;">© ${new Date().getFullYear()} OwnFresh. All rights reserved.</p>
            </div>
          </div>
        </div>
        `;

        const subject = isPune 
            ? `Your OwnFresh oil has been delivered successfully via Pune Local Express! 🥰 - #${orderId}`
            : `Your OwnFresh oil has been delivered successfully! 🥰 - #${orderId}`;
        const text = `Hi ${customerName},\n\nYour OwnFresh oil has been delivered successfully! 🥰\n\nThank you for choosing OwnFresh! ❤️\n\nOrder ID: #${orderId}\nDelivered To: ${deliveryAddress}\nDelivery Mode: ${deliveryModeDisplay}\n\nView your order details & invoice: ${siteUrl}/my-orders\n\nHave questions or feedback? Reply directly to this email or write to us at contact@myownfresh.com.\n\nWarm regards,\nOwnFresh Agro Industries, Pune`;

        return {
            subject,
            html,
            text,
            customerEmail: order.user?.email || ""
        };
    };

    const handlePrepareDeliveryEmail = async (orderId) => {
        setIsPreparingDeliveryEmail(true);
        setDeliveryEmailPreview(null);
        try {
            // First attempt: call backend delivery preview endpoint
            const { data } = await axios.post(
                `${serverUrl}/api/fulfillment/preview-delivery-email/${orderId}`,
                {},
                { withCredentials: true }
            );
            if (data?.success) {
                setDeliveryEmailPreview({
                    subject: data.subject,
                    html: data.html,
                    text: data.text,
                    customerEmail: data.customerEmail
                });
                return;
            }
        } catch (error) {
            console.warn("Backend delivery preview endpoint fallback triggered:", error.message);
        } finally {
            setIsPreparingDeliveryEmail(false);
        }

        // Direct client-side preview generator guarantee (works even if API route returned 404)
        const targetOrder = (orders || []).find(o => o._id === orderId) || selectedOrder;
        if (targetOrder) {
            const preview = generateDeliveryEmailData(targetOrder);
            setDeliveryEmailPreview(preview);
            toast.success("Delivery email preview prepared!");
        } else {
            toast.error("Order details not found");
        }
    };

    const handleSendTestDeliveryEmail = async (orderId) => {
        if (!deliveryTestEmailAddress.trim()) {
            return toast.error("Please enter a test email address");
        }
        try {
            // Try test-delivery-email first
            try {
                const { data } = await axios.post(
                    `${serverUrl}/api/fulfillment/test-delivery-email/${orderId}`,
                    {
                        subject: deliveryEmailPreview.subject,
                        html: deliveryEmailPreview.html,
                        text: deliveryEmailPreview.text,
                        testEmail: deliveryTestEmailAddress.trim()
                    },
                    { withCredentials: true }
                );
                if (data?.success) {
                    return toast.success(data.msg || "Test delivery email sent!");
                }
            } catch (apiErr) {
                if (apiErr.response?.status === 404) {
                    // Fallback: use live /test-email endpoint which exists on backend
                    const { data } = await axios.post(
                        `${serverUrl}/api/fulfillment/test-email/${orderId}`,
                        {
                            subject: deliveryEmailPreview.subject,
                            html: deliveryEmailPreview.html,
                            text: deliveryEmailPreview.text,
                            testEmail: deliveryTestEmailAddress.trim()
                        },
                        { withCredentials: true }
                    );
                    if (data?.success) {
                        return toast.success(data.msg || "Test delivery email sent!");
                    }
                } else {
                    throw apiErr;
                }
            }
        } catch (error) {
            console.error("Test delivery email failed:", error);
            const errText = error.response?.data?.msg || error.response?.data?.message || "Failed to send test delivery email";
            toast.error(errText);
        }
    };

    const handleSendDeliveryEmail = async (orderId) => {
        setIsSendingDeliveryEmail(true);
        try {
            let sent = false;
            let updatedOrder = null;

            // Try dedicated send-delivery-email endpoint first
            try {
                const { data } = await axios.post(
                    `${serverUrl}/api/fulfillment/send-delivery-email/${orderId}`,
                    {
                        subject: deliveryEmailPreview.subject,
                        html: deliveryEmailPreview.html,
                        text: deliveryEmailPreview.text
                    },
                    { withCredentials: true }
                );
                if (data?.success) {
                    sent = true;
                    updatedOrder = data.order;
                }
            } catch (err) {
                // If backend route returned 404, fallback to live send-email endpoint + status update
                if (err.response?.status === 404) {
                    console.log("send-delivery-email 404: falling back to send-email + status update");
                    const sendRes = await axios.post(
                        `${serverUrl}/api/fulfillment/send-email/${orderId}`,
                        {
                            subject: deliveryEmailPreview.subject,
                            html: deliveryEmailPreview.html,
                            text: deliveryEmailPreview.text
                        },
                        { withCredentials: true }
                    );
                    if (sendRes.data?.success) {
                        sent = true;
                        const statusRes = await axios.put(
                            `${serverUrl}/api/order/status/${orderId}`,
                            { status: "delivered" },
                            { withCredentials: true }
                        );
                        if (statusRes.data?.success) {
                            updatedOrder = { ...sendRes.data.order, status: "delivered", deliveryEmailSent: true, deliveryEmailSentAt: new Date() };
                        }
                    }
                } else {
                    throw err;
                }
            }

            if (sent) {
                toast.success("✓ Successful delivery email sent to customer!");
                const finalOrder = updatedOrder || { ...selectedOrder, status: "delivered", deliveryEmailSent: true, deliveryEmailSentAt: new Date() };
                setOrders(orders.map(o => o._id === orderId ? { ...o, ...finalOrder } : o));
                setSelectedOrder({ ...selectedOrder, ...finalOrder });
                setDeliveryEmailPreview(null);
            }
        } catch (error) {
            console.error("Delivery email sending failed:", error);
            const errText = error.response?.data?.msg || error.response?.data?.message || "Failed to send delivery email";
            toast.error(errText);
        } finally {
            setIsSendingDeliveryEmail(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmed = await confirm({
            title: "Delete Order",
            message: "CRITICAL: Permanently delete this order from the database? This action CANNOT be undone.",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });
        if (!confirmed) return;

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
        const subtotal = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const discount = order.discountAmount || 0;
        const deliveryCharge = order.deliveryCharge || 0;
        const total = order.totalAmount || (subtotal - discount + deliveryCharge);
        const paymentMethodStr = String(order.PaymentMethod || order.paymentMethod || '').toUpperCase();
        const isCOD = paymentMethodStr === 'COD';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Packing Slip — ${order._id?.toUpperCase?.() || order.orderId || ''}</title>
                <meta charset="UTF-8"/>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', sans-serif;
                        background: #fff;
                        color: #1a1a2e;
                        padding: 32px;
                        font-size: 12px;
                        line-height: 1.5;
                    }
                    /* ── TOP HEADER ── */
                    .top-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        border-bottom: 3px solid #1a1a2e;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .brand-name {
                        font-size: 28px;
                        font-weight: 900;
                        letter-spacing: -1px;
                        color: #1a1a2e;
                        line-height: 1;
                    }
                    .brand-name span { color: #16a34a; }
                    .brand-tagline { font-size: 10px; color: #6b7280; margin-top: 3px; letter-spacing: 1px; text-transform: uppercase; }
                    .slip-label {
                        text-align: right;
                    }
                    .slip-title {
                        font-size: 22px;
                        font-weight: 900;
                        letter-spacing: 2px;
                        color: #1a1a2e;
                        text-transform: uppercase;
                    }
                    .slip-meta { font-size: 10px; color: #6b7280; margin-top: 4px; }
                    .slip-meta strong { color: #1a1a2e; }

                    /* ── INFO GRID ── */
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 16px;
                        margin-bottom: 20px;
                    }
                    .info-box {
                        background: #f9fafb;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 12px 14px;
                    }
                    .info-box-label {
                        font-size: 9px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #9ca3af;
                        margin-bottom: 4px;
                    }
                    .info-box-value {
                        font-size: 12px;
                        font-weight: 600;
                        color: #1a1a2e;
                    }
                    .info-box-value.small { font-size: 11px; font-weight: 500; }

                    /* ── ADDRESS SECTION ── */
                    .address-section {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                        margin-bottom: 20px;
                    }
                    .address-box {
                        border: 1.5px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 14px;
                    }
                    .address-box.highlight { border-color: #16a34a; background: #f0fdf4; }
                    .address-box-title {
                        font-size: 9px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: #16a34a;
                        margin-bottom: 8px;
                    }
                    .address-name { font-size: 13px; font-weight: 700; color: #1a1a2e; margin-bottom: 3px; }
                    .address-line { font-size: 11px; color: #4b5563; }

                    /* ── ITEMS TABLE ── */
                    .section-title {
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: #6b7280;
                        margin-bottom: 8px;
                    }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                    thead tr { background: #1a1a2e; }
                    thead th {
                        padding: 10px 12px;
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #fff;
                        text-align: left;
                    }
                    thead th:last-child, thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
                    tbody tr { border-bottom: 1px solid #f3f4f6; }
                    tbody tr:nth-child(even) { background: #f9fafb; }
                    tbody td { padding: 10px 12px; font-size: 11px; color: #374151; }
                    tbody td:last-child, tbody td:nth-child(3), tbody td:nth-child(4) { text-align: right; }
                    .item-name { font-weight: 600; color: #1a1a2e; }
                    .item-variant { font-size: 10px; color: #9ca3af; margin-top: 1px; }

                    /* ── TOTALS ── */
                    .totals-row {
                        display: flex;
                        justify-content: flex-end;
                        margin-bottom: 20px;
                    }
                    .totals-box {
                        width: 280px;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .totals-line {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 14px;
                        font-size: 11px;
                        border-bottom: 1px solid #f3f4f6;
                    }
                    .totals-line:last-child { border-bottom: none; }
                    .totals-line.grand {
                        background: #1a1a2e;
                        color: #fff;
                        font-size: 13px;
                        font-weight: 800;
                        padding: 11px 14px;
                    }
                    .totals-line .label { color: #6b7280; }
                    .totals-line.grand .label { color: #d1d5db; }
                    .discount-val { color: #16a34a; font-weight: 600; }

                    /* ── BANK DETAILS ── */
                    .bottom-section {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                        margin-top: 4px;
                    }
                    .bank-box {
                        border: 1.5px solid #1d4ed8;
                        border-radius: 8px;
                        padding: 14px;
                        background: #eff6ff;
                    }
                    .bank-title {
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: #1d4ed8;
                        margin-bottom: 10px;
                    }
                    .bank-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 11px;
                        margin-bottom: 5px;
                        padding-bottom: 5px;
                        border-bottom: 1px dashed #bfdbfe;
                    }
                    .bank-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                    .bank-key { color: #6b7280; font-weight: 500; }
                    .bank-val { color: #1e40af; font-weight: 700; }

                    /* ── NOTES BOX ── */
                    .notes-box {
                        border: 1.5px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 14px;
                        background: #fafafa;
                    }
                    .notes-title {
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: #9ca3af;
                        margin-bottom: 8px;
                    }
                    .notes-text { font-size: 11px; color: #6b7280; line-height: 1.6; }

                    /* ── FOOTER ── */
                    .footer {
                        border-top: 2px solid #e5e7eb;
                        margin-top: 20px;
                        padding-top: 12px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .footer-brand { font-size: 10px; color: #9ca3af; }
                    .footer-brand strong { color: #1a1a2e; }
                    .footer-note { font-size: 10px; color: #9ca3af; font-style: italic; }

                    /* ── BADGE ── */
                    .badge {
                        display: inline-block;
                        padding: 2px 8px;
                        border-radius: 20px;
                        font-size: 9px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .badge-cod { background: #fef9c3; color: #854d0e; }
                    .badge-online { background: #dcfce7; color: #166534; }
                    .badge-pending { background: #fee2e2; color: #991b1b; }

                    @media print {
                        body { padding: 20px; }
                        @page { margin: 0.5cm; size: A4; }
                    }
                </style>
            </head>
            <body>

                <!-- TOP HEADER -->
                <div class="top-header">
                    <div>
                        <img src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png" alt="OwnFresh Logo" style="height:38px;display:block;margin-bottom:4px;object-fit:contain;" />
                        <div class="brand-tagline">Natural Oils &amp; Wellness</div>
                        <div style="margin-top:8px;font-size:10px;color:#6b7280;">
                            contact@myownfresh.com &nbsp;|&nbsp; www.myownfresh.com
                        </div>
                    </div>
                    <div class="slip-label">
                        <div class="slip-title">${order.clientType === "GST" ? "Tax Invoice" : "Packing Slip"}</div>
                        <div class="slip-meta">Order ID: <strong>${order.customOrderId || order._id?.toUpperCase?.() || 'N/A'}</strong></div>
                        <div class="slip-meta">Date: <strong>${new Date(order.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</strong></div>
                        <div class="slip-meta" style="margin-top:6px;">
                            <span class="badge ${isCOD ? 'badge-cod' : 'badge-online'}">
                                ${order.PaymentMethod || order.paymentMethod || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- INFO GRID -->
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-box-label">Order Status</div>
                        <div class="info-box-value">${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-label">Items in Order</div>
                        <div class="info-box-value">${order.items?.length || 0} item${(order.items?.length || 0) !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-label">Order Total</div>
                        <div class="info-box-value">₹${total?.toLocaleString('en-IN') || '0'}</div>
                    </div>
                </div>

                <!-- ADDRESS SECTION -->
                <div class="address-section">
                    <div class="address-box highlight">
                        <div class="address-box-title">📦 Ship To</div>
                        <div class="address-name">${order.user?.fullName || order.deliveryAddress?.name || 'N/A'}</div>
                        <div class="address-line">${order.deliveryAddress?.phone || order.user?.phone || ''}</div>
                        <div class="address-line" style="margin-top:4px;">
                            ${[
                                order.deliveryAddress?.roomNumber,
                                order.deliveryAddress?.areaName,
                                order.deliveryAddress?.text,
                                order.deliveryAddress?.pinCode
                            ].filter(Boolean).join(', ')}
                        </div>
                    </div>
                    <div class="address-box">
                        <div class="address-box-title" style="color:#6b7280;">🏭 Shipped From</div>
                        <div class="address-name">OwnFresh Agro Industries</div>
                        <div class="address-line">Pune, Maharashtra</div>
                        <div class="address-line">${order.clientType === "GST" ? "GSTIN: 27AAFCO4581C1ZX" : "GSTIN: —"}</div>
                        <div class="address-line" style="margin-top:4px;">contact@myownfresh.com</div>
                    </div>
                </div>

                <!-- ITEMS TABLE -->
                <div class="section-title">Order Items</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:40%">Product</th>
                            <th>Variant</th>
                            <th>Unit Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items?.map((item, idx) => `
                            <tr>
                                <td>
                                    <div class="item-name">${item.name || 'Product'}</div>
                                </td>
                                <td><div class="item-variant">${item.variantName || item.selectedVariant || item.variant || '—'}</div></td>
                                <td>₹${(item.price || 0).toLocaleString('en-IN')}</td>
                                <td><strong>${item.quantity}</strong></td>
                                <td>₹${((item.price || 0) * item.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <!-- TOTALS -->
                <div class="totals-row">
                    <div class="totals-box">
                        <div class="totals-line">
                            <span class="label">Subtotal</span>
                            <span>₹${subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        ${discount > 0 ? `
                        <div class="totals-line">
                            <span class="label">Discount</span>
                            <span class="discount-val">− ₹${discount.toLocaleString('en-IN')}</span>
                        </div>` : ''}
                        ${order.clientType === "GST" ? `
                        <div class="totals-line">
                            <span class="label">CGST (2.5%)</span>
                            <span>₹${(order.cgst || ((subtotal - discount) * 0.025)).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div class="totals-line">
                            <span class="label">SGST (2.5%)</span>
                            <span>₹${(order.sgst || ((subtotal - discount) * 0.025)).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        ` : ''}
                        <div class="totals-line">
                            <span class="label">Delivery / Extra</span>
                            <span>${deliveryCharge === 0 ? '<span style="color:#16a34a;font-weight:600;">FREE</span>' : '₹' + deliveryCharge.toLocaleString('en-IN')}</span>
                        </div>
                        <div class="totals-line grand">
                            <span class="label">Grand Total</span>
                            <span>₹${total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                <!-- BANK DETAILS + NOTES (COD = show bank, Online = show paid confirmation) -->
                <div class="bottom-section" style="grid-template-columns: ${isCOD ? '1fr 1fr' : '1fr'};">

                    ${isCOD ? `
                    <div class="bank-box">
                        <div class="bank-title">🏦 Bank Details — Please Pay on Delivery</div>
                        <div style="display:flex;gap:14px;align-items:flex-start;">
                            <div style="flex:1;">
                                <div class="bank-row">
                                    <span class="bank-key">Beneficiary</span>
                                    <span class="bank-val">M/s. OWNFRESH AGRO INDUSTRIES</span>
                                </div>
                                <div class="bank-row">
                                    <span class="bank-key">Bank</span>
                                    <span class="bank-val">Bank of Maharashtra</span>
                                </div>
                                <div class="bank-row">
                                    <span class="bank-key">Branch</span>
                                    <span class="bank-val">Pune Mayur Colony</span>
                                </div>
                                <div class="bank-row">
                                    <span class="bank-key">Account No.</span>
                                    <span class="bank-val">603398389380</span>
                                </div>
                                <div class="bank-row">
                                    <span class="bank-key">IFSC Code</span>
                                    <span class="bank-val">MAHB0000852</span>
                                </div>
                            </div>
                            <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
                                <img
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&ecc=M&data=Account%3A%20M%2Fs.%20OWNFRESH%20AGRO%20INDUSTRIES%20%7C%20Bank%3A%20Bank%20of%20Maharashtra%20%7C%20Branch%3A%20Pune%20Mayur%20Colony%20%7C%20AC%20No%3A%20603398389380%20%7C%20IFSC%3A%20MAHB0000852"
                                    alt="Bank QR Code"
                                    width="110"
                                    height="110"
                                    style="border:3px solid #1d4ed8;border-radius:6px;display:block;"
                                />
                                <div style="font-size:8px;color:#6b7280;margin-top:4px;text-align:center;font-weight:600;letter-spacing:0.5px;">SCAN TO PAY</div>
                            </div>
                        </div>
                    </div>
                    ` : `
                    <div style="border:1.5px solid #16a34a;border-radius:8px;padding:14px;background:#f0fdf4;display:flex;align-items:center;gap:14px;">
                        <div style="width:44px;height:44px;background:#16a34a;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;">✓</div>
                        <div>
                            <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#16a34a;margin-bottom:3px;">✅ Payment Already Received</div>
                            <div style="font-size:11px;color:#374151;">This order was paid online. No cash collection required at the time of delivery.</div>
                            <div style="font-size:10px;color:#6b7280;margin-top:4px;">Payment Method: <strong style="color:#1a1a2e;">${order.PaymentMethod || order.paymentMethod}</strong></div>
                        </div>
                    </div>
                    `}

                    <div class="notes-box">
                        <div class="notes-title">📝 Notes & Instructions</div>
                        <div class="notes-text">
                            • Please verify the product and quantity at the time of delivery.<br/>
                            • For any issues, contact us at <strong>contact@myownfresh.com</strong><br/>
                            • This is a computer-generated packing slip and does not require a signature.<br/>
                            • Returns accepted within 7 days of delivery per our refund policy.
                        </div>
                        ${order.notes ? `<div style="margin-top:10px;padding:8px;background:#fff3cd;border-radius:6px;font-size:11px;color:#856404;"><strong>Order Notes:</strong> ${order.notes}</div>` : ''}
                    </div>
                </div>


                <!-- FOOTER -->
                <div class="footer">
                    <div class="footer-brand">
                        <strong>OwnFresh</strong> — Natural Oils &amp; Wellness &nbsp;|&nbsp; www.myownfresh.com
                    </div>
                    <div class="footer-note">Thank you for your order! 🌿</div>
                </div>

            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const tabs = [
        { id: "unshipped", label: "Unshipped", count: orders.filter(o => ['pending', 'processing'].includes(o.status)).length },
        { id: "online_paid", label: "Online Paid 💳", count: orders.filter(o => (o.PaymentMethod === 'online' || o.paymentMethod === 'online') && o.paymentStatus === 'completed').length },
        { id: "cod_orders", label: "COD Orders 💵", count: orders.filter(o => (o.PaymentMethod === 'cod' || o.paymentMethod === 'cod')).length },
        { id: "payment_pending", label: "Payment Pending ⏳", count: orders.filter(o => o.paymentStatus === 'pending').length },
        { id: "shipped", label: "Shipped", count: orders.filter(o => o.status === 'shipped').length },
        { id: "delivered", label: "Delivered", count: orders.filter(o => o.status === 'delivered').length },
        { id: "cancelled", label: "Cancelled", count: orders.filter(o => ['cancelled', 'cancellation_requested'].includes(o.status)).length },
        { id: "all", label: "All Orders", count: orders.length }
    ];

    const getTabFilteredOrders = () => {
        let filtered = orders;
        if (activeTab === "unshipped") filtered = orders.filter(o => ['pending', 'processing'].includes(o.status));
        else if (activeTab === "online_paid") filtered = orders.filter(o => (o.PaymentMethod === 'online' || o.paymentMethod === 'online') && o.paymentStatus === 'completed');
        else if (activeTab === "cod_orders") filtered = orders.filter(o => (o.PaymentMethod === 'cod' || o.paymentMethod === 'cod'));
        else if (activeTab === "payment_pending") filtered = orders.filter(o => o.paymentStatus === 'pending');
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
                        <button
                            onClick={() => setIsManualOrderModalOpen(true)}
                            className="bg-[#EFDB27] text-black font-black uppercase text-[10px] tracking-widest px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                            title="Create Manual Order"
                        >
                            <Plus size={14} /> <span className="hidden sm:inline">Create Manual Order</span>
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
                                            <div className="flex flex-col gap-1">
                                                <div className="flex flex-wrap gap-1.5 items-center">
                                                    <span className="text-[9px] font-black text-[#24672E] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                        {order.items.length} ITEM{order.items.length > 1 ? 'S' : ''}
                                                    </span>
                                                    {order.PaymentMethod === 'cod' || order.paymentMethod === 'cod' ? (
                                                        order.paymentStatus === 'completed' ? (
                                                            <span className="text-[9px] font-black text-emerald-800 uppercase bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 shadow-xs flex items-center gap-1">
                                                                <CheckCircle2 size={10} /> 💵 COD CASH RECEIVED
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-amber-800 uppercase bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300 shadow-xs flex items-center gap-1">
                                                                <Clock size={10} /> 💵 COD PENDING
                                                            </span>
                                                        )
                                                    ) : (
                                                        order.paymentStatus === 'completed' ? (
                                                            <span className="text-[9px] font-black text-emerald-800 uppercase bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 shadow-xs flex items-center gap-1">
                                                                <CheckCircle2 size={10} /> 💳 ONLINE PAID (PhonePe)
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-amber-800 uppercase bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300 shadow-xs flex items-center gap-1">
                                                                <Clock size={10} /> 💳 ONLINE PENDING
                                                            </span>
                                                        )
                                                    )}
                                                </div>

                                                {(order.PaymentMethod === 'cod' || order.paymentMethod === 'cod') && order.paymentStatus !== 'completed' && (
                                                    <button
                                                        onClick={() => handleMarkCodCashReceived(order._id, order.totalAmount)}
                                                        className="mt-1 text-[8px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer w-max"
                                                        title="Mark Cash Received for COD order"
                                                    >
                                                        Mark Cash Received 💵
                                                    </button>
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
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                            onClick={() => setSelectedOrder(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-[#f0f2f2] dark:bg-[#0B0F14] w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden border-t-8 border-slate-900 dark:border-t-emerald-600"
                        >

                        {/* Amazon Style Compact Header */}
                        <div className="bg-white dark:bg-[#111720] px-8 py-5 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Order Fulfillment Center</h3>
                                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700"></div>
                                <p className="text-xs font-black text-slate-500 dark:text-slate-400 font-mono">ID: {selectedOrder._id.toUpperCase()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white hover:rotate-90 hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
                                title="Close Panel"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left: Summary & Logistics Update */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Shipment Status Management */}
                                <div className="bg-white dark:bg-[#111720] p-8 rounded-xl border border-slate-300 dark:border-slate-800 shadow-sm">
                                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Truck className="text-blue-500" size={16} /> Fulfillment Workflow
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Order Status</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none font-bold text-xs appearance-none focus:border-blue-500 transition-all"
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
                                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none font-bold text-xs appearance-none focus:border-emerald-500 transition-all"
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
                                                { label: "Tracking Generated", done: !!selectedOrder.trackingId },
                                                { label: "Email Sent", done: selectedOrder.shipmentEmailSent }
                                            ].map((step, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done ? 'bg-[#24672E] text-white' : 'bg-slate-100 text-slate-300 border border-slate-200'}`}>
                                                        {step.done ? "✓" : idx + 1}
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${step.done ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</span>
                                                    {idx < 4 && <div className={`h-[1px] w-4 hidden sm:block ${step.done ? 'bg-[#24672E]' : 'bg-slate-200'}`}></div>}
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

                                    {/* Direct Manual Courier/Tracking Details Input */}
                                    {selectedOrder.labelPrinted && !selectedOrder.trackingId && (
                                        <div className="mt-8 pt-8 border-t border-slate-100 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-[10px] font-black text-[#24672E] uppercase tracking-widest">
                                                    {isPuneOrder(selectedOrder) ? "Pune Local Delivery Dispatch" : "Enter Courier Details"}
                                                </h5>
                                                {isPuneOrder(selectedOrder) && (
                                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                        📍 Pune Region (No DTDC/BlueDart Needed)
                                                    </span>
                                                )}
                                            </div>

                                            {isPuneOrder(selectedOrder) && (
                                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                                                            Pune Destination — Local Courier / Fleet Delivery
                                                        </p>
                                                        <p className="text-[11px] font-bold text-emerald-700 mt-1 leading-relaxed">
                                                            For deliveries within the Pune region, third-party courier services (DTDC / BlueDart) are <b>not used</b>. 
                                                            Tracking numbers are <b>not required</b>. You can fulfill and dispatch this order directly!
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Optional Receipt Upload Dropzone - hide or keep optional */}
                                            <div className="mb-6">
                                                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">
                                                    Upload Courier Receipt ({isPuneOrder(selectedOrder) ? "Optional for Pune" : "Optional - auto-fills via OCR"})
                                                </label>
                                                {receiptUrl ? (
                                                    <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[250px]">{receiptUrl.split('/').pop()}</span>
                                                        <div className="flex gap-2">
                                                            <a href={receiptUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-[10px] font-black uppercase hover:underline">View File ↗</a>
                                                            <button
                                                                type="button"
                                                                onClick={() => { setReceiptUrl(""); setReceiptRawText(""); }}
                                                                className="text-red-500 text-[10px] font-black uppercase hover:underline hover:text-red-700"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onDragOver={(e) => e.preventDefault()}
                                                        onDrop={(e) => { e.preventDefault(); handleReceiptUpload(e, selectedOrder._id); }}
                                                        className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer relative bg-white"
                                                    >
                                                        <input
                                                            type="file"
                                                            accept="image/*,application/pdf"
                                                            onChange={(e) => handleReceiptUpload(e, selectedOrder._id)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                        {isUploading ? (
                                                            <div className="flex flex-col items-center justify-center">
                                                                <Loader2 className="w-6 h-6 text-[#FFDD00] animate-spin mb-1" />
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Running OCR Analysis...</p>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center">
                                                                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                                                                <p className="text-[10px] font-bold text-slate-600">Drag & drop receipt here, or click to browse</p>
                                                                <p className="text-[8px] font-bold text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, and PDF</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Courier / Delivery Partner</label>
                                                    <select
                                                        value={courierPartner}
                                                        onChange={(e) => setCourierPartner(e.target.value)}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                                                    >
                                                        <option value="Unknown Carrier">Select Carrier / Mode...</option>
                                                        <option value="Local Pune Delivery">Local Pune Delivery (Own Fleet / Direct - No Tracking)</option>
                                                        {carriers.filter(c => c.name !== "Local Pune Delivery").map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">
                                                        AWB / Tracking Number {isPuneOrder(selectedOrder) ? "(Not Required for Pune)" : ""}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={trackingId}
                                                        onChange={(e) => setTrackingId(e.target.value)}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                                                        placeholder={isPuneOrder(selectedOrder) ? "Not required for local Pune delivery (optional)" : "Enter Tracking ID..."}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConfirmFulfillment(selectedOrder._id)}
                                                    className="w-full bg-[#24672E] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#1E971D] transition-colors"
                                                >
                                                    {isPuneOrder(selectedOrder) ? "Confirm Local Pune Dispatch (No Tracking Needed)" : "Confirm Details"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ========================================================================= */}
                                    {/* CUSTOMER NOTIFICATION HUB (Dispatch Email & Successful Delivery Email) */}
                                    {/* ========================================================================= */}
                                    {(selectedOrder.trackingId || selectedOrder.labelPrinted || isPuneOrder(selectedOrder)) && (
                                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                            {/* Top Segmented Tab Switcher */}
                                            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={16} className="text-slate-700 dark:text-slate-300" />
                                                    <h5 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                                                        Customer Notification Hub
                                                    </h5>
                                                </div>
                                                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEmailSectionTab("shipment");
                                                            if (!emailPreview) handlePrepareEmail(selectedOrder._id);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                                            emailSectionTab === "shipment"
                                                                ? "bg-blue-600 text-white shadow-xs"
                                                                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                                        }`}
                                                    >
                                                        <Send size={11} />
                                                        1. Dispatch Email
                                                        {selectedOrder.shipmentEmailSent && (
                                                            <span className="ml-1 px-1.5 py-0.5 bg-blue-700 text-white rounded text-[8px]">Sent ✓</span>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEmailSectionTab("delivery");
                                                            if (!deliveryEmailPreview) handlePrepareDeliveryEmail(selectedOrder._id);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                                            emailSectionTab === "delivery"
                                                                ? "bg-[#24672E] text-white shadow-xs"
                                                                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                                        }`}
                                                    >
                                                        <CheckCircle2 size={11} />
                                                        2. Successful Delivery Email {isPuneOrder(selectedOrder) ? "(Local Pune)" : ""}
                                                        {selectedOrder.deliveryEmailSent && (
                                                            <span className="ml-1 px-1.5 py-0.5 bg-emerald-700 text-white rounded text-[8px]">Sent ✓</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* TAB 1: SHIPMENT / DISPATCH EMAIL */}
                                            {emailSectionTab === "shipment" && (
                                                <div>
                                                    {/* Quick Switch Banner to Delivery Email */}
                                                    <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl mb-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-xl">📦</span>
                                                            <div>
                                                                <p className="text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase">
                                                                    Has this order been delivered to {selectedOrder.user?.fullName || 'the customer'}?
                                                                </p>
                                                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                                                    Send official Successful Delivery Email with greeting, Order ID, and celebration emoji 🥰
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEmailSectionTab("delivery");
                                                                if (!deliveryEmailPreview) handlePrepareDeliveryEmail(selectedOrder._id);
                                                            }}
                                                            className="px-4 py-2 bg-[#24672E] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#1E971D] transition-all shadow-xs flex items-center gap-1.5"
                                                        >
                                                            <Mail size={12} /> Switch to Delivery Email →
                                                        </button>
                                                    </div>

                                                    {selectedOrder.shipmentEmailSent && !emailPreview ? (
                                                        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-4">
                                                            <div>
                                                                <h5 className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                                    <CheckCircle2 size={14} /> Order Dispatched & Customer Notified
                                                                </h5>
                                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                                                                    Dispatch notification email was sent to <b>{selectedOrder.user?.email}</b> on <b>{new Date(selectedOrder.shipmentEmailSentAt).toLocaleString()}</b>.<br />
                                                                    Delivery Mode: <b>{selectedOrder.courierPartner}</b>
                                                                    {selectedOrder.trackingId && selectedOrder.trackingId !== "LOCAL-PUNE" && selectedOrder.trackingId !== "PUNE" && (
                                                                        <> | Tracking: <b>{selectedOrder.trackingId}</b></>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePrepareEmail(selectedOrder._id)}
                                                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-slate-700"
                                                            >
                                                                Resend / Preview
                                                            </button>
                                                        </div>
                                                    ) : !emailPreview ? (
                                                        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6">
                                                            {isPreparingEmail ? (
                                                                <div className="flex flex-col items-center">
                                                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Generating Shipment Email Preview...</p>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <Send className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">Dispatch / Out-for-Delivery Notification</p>
                                                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                                                                        Notify the customer that their package is dispatched {isPuneOrder(selectedOrder) ? 'with Local Pune Delivery fleet.' : 'and on its way.'}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => handlePrepareEmail(selectedOrder._id)}
                                                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm"
                                                                    >
                                                                        {isPuneOrder(selectedOrder) ? "Prepare Local Dispatch Email Preview" : "Prepare Shipment Email Preview"}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                                                            <h5 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">Shipment Email Dispatcher</h5>

                                                            <div className="space-y-4 mb-4">
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Email Subject</label>
                                                                    <input
                                                                        type="text"
                                                                        value={emailPreview.subject}
                                                                        onChange={(e) => setEmailPreview({ ...emailPreview, subject: e.target.value })}
                                                                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs text-slate-900 dark:text-slate-100"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Recipient</label>
                                                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                                                        {emailPreview.customerEmail}
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 font-bold">HTML Preview</label>
                                                                        <iframe
                                                                            srcDoc={emailPreview.html}
                                                                            className="w-full h-64 border border-slate-200 dark:border-slate-700 rounded-xl bg-white"
                                                                            title="HTML Email Preview"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 font-bold">Plain Text Preview</label>
                                                                        <textarea
                                                                            value={emailPreview.text}
                                                                            onChange={(e) => setEmailPreview({ ...emailPreview, text: e.target.value })}
                                                                            className="w-full h-64 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono text-[10px] text-slate-900 dark:text-slate-100 resize-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 mb-4 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                                                <input
                                                                    type="email"
                                                                    placeholder="Enter admin test email address..."
                                                                    value={testEmailAddress}
                                                                    onChange={(e) => setTestEmailAddress(e.target.value)}
                                                                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs text-slate-900 dark:text-slate-100"
                                                                />
                                                                <button
                                                                    onClick={() => handleSendTestEmail(selectedOrder._id)}
                                                                    className="px-6 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
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
                                                                    className="px-6 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                                >
                                                                    Hide Preview
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* TAB 2: SUCCESSFUL DELIVERY EMAIL */}
                                            {emailSectionTab === "delivery" && (
                                                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6 shadow-sm">
                                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white dark:text-slate-950 shadow-sm">
                                                                <CheckCircle2 size={18} />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-widest flex items-center gap-2">
                                                                    Successful Delivery Confirmation Mailer
                                                                </h5>
                                                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                                                                    Mail the customer an official confirmation of successful delivery with logo, order ID, and celebration emoji.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {selectedOrder.deliveryEmailSent ? (
                                                            <span className="px-3.5 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                                                                <CheckCircle2 size={12} className="text-emerald-700 dark:text-emerald-300" />
                                                                Delivered & Notified {selectedOrder.deliveryEmailSentAt ? `(${new Date(selectedOrder.deliveryEmailSentAt).toLocaleDateString()})` : ''}
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                                Pending Email Dispatch
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Auto-delivery status helper notice */}
                                                    {selectedOrder.status !== 'delivered' && (
                                                        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700/70 p-3.5 rounded-xl mb-4 flex items-center gap-2.5 text-[10px] font-bold text-amber-950 dark:text-amber-200">
                                                            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse flex-shrink-0"></span>
                                                            <span>
                                                                Order status is currently <b className="uppercase font-black text-amber-900 dark:text-amber-100">"{selectedOrder.status}"</b>. 
                                                                Sending this delivery email will automatically mark the order as <b className="text-emerald-800 dark:text-emerald-300 font-black">"DELIVERED"</b> in MongoDB Atlas!
                                                            </span>
                                                        </div>
                                                    )}

                                                    {selectedOrder.deliveryEmailSent && !deliveryEmailPreview && (
                                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 mb-4 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                                                    ✓ Delivery confirmation email was successfully sent to <span className="font-mono text-emerald-800 dark:text-emerald-300 font-black">{selectedOrder.user?.email}</span>
                                                                </p>
                                                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-400 mt-1 uppercase">
                                                                    Sent at: {new Date(selectedOrder.deliveryEmailSentAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => handlePrepareDeliveryEmail(selectedOrder._id)}
                                                                className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
                                                            >
                                                                Resend / Preview
                                                            </button>
                                                        </div>
                                                    )}

                                                    {!deliveryEmailPreview ? (
                                                        !selectedOrder.deliveryEmailSent && (
                                                            <div className="text-center py-6 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700 p-6">
                                                                <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
                                                                    Ready to send delivery confirmation to <b>{selectedOrder.user?.fullName || 'Customer'}</b>
                                                                </p>
                                                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                                                                    Includes OwnFresh logo, Order ID, "Hi {selectedOrder.user?.fullName}, Your OwnFresh oil has been delivered successfully! 🥰", delivered items, and invoice link.
                                                                </p>
                                                                {isPreparingDeliveryEmail ? (
                                                                    <div className="flex flex-col items-center">
                                                                        <Loader2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin mb-2" />
                                                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase">Generating Delivery Email Preview...</p>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handlePrepareDeliveryEmail(selectedOrder._id)}
                                                                        className="px-6 py-3 bg-[#24672E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E971D] transition-colors shadow-md inline-flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <Send size={12} /> Prepare Delivery Email Preview
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-2xl p-6 shadow-sm">
                                                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                                                <h6 className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest flex items-center gap-2">
                                                                    <Mail size={14} /> Successful Delivery Email Dispatcher
                                                                </h6>
                                                                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 font-bold">
                                                                    Recipient: {deliveryEmailPreview.customerEmail}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-4 mb-4">
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase mb-1">Subject</label>
                                                                    <input
                                                                        type="text"
                                                                        value={deliveryEmailPreview.subject}
                                                                        onChange={(e) => setDeliveryEmailPreview({ ...deliveryEmailPreview, subject: e.target.value })}
                                                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500"
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase mb-1 font-bold">HTML Preview</label>
                                                                        <iframe
                                                                            srcDoc={deliveryEmailPreview.html}
                                                                            className="w-full h-72 border border-slate-200 dark:border-slate-700 rounded-xl bg-white"
                                                                            title="Delivery Email HTML Preview"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase mb-1 font-bold">Plain Text Preview</label>
                                                                        <textarea
                                                                            value={deliveryEmailPreview.text}
                                                                            onChange={(e) => setDeliveryEmailPreview({ ...deliveryEmailPreview, text: e.target.value })}
                                                                            className="w-full h-72 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono text-[10px] text-slate-900 dark:text-slate-100 resize-none focus:border-emerald-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 mb-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                                                <input
                                                                    type="email"
                                                                    placeholder="Enter test email address for delivery preview..."
                                                                    value={deliveryTestEmailAddress}
                                                                    onChange={(e) => setDeliveryTestEmailAddress(e.target.value)}
                                                                    className="flex-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-xs text-slate-900 dark:text-slate-100"
                                                                />
                                                                <button
                                                                    onClick={() => handleSendTestDeliveryEmail(selectedOrder._id)}
                                                                    className="px-6 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                                                >
                                                                    Test Send
                                                                </button>
                                                            </div>

                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => handleSendDeliveryEmail(selectedOrder._id)}
                                                                    disabled={isSendingDeliveryEmail}
                                                                    className="flex-1 bg-[#24672E] text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#1E971D] transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                                                                >
                                                                    {isSendingDeliveryEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                                    Send Delivery Confirmation Email to Customer
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeliveryEmailPreview(null)}
                                                                    className="px-6 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                                >
                                                                    Hide Preview
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                                                        QTY: {item.quantity}
                                                        {item.variantName && ` | SIZE: ${item.variantName}`}
                                                        {` | SKU: OIL-${((typeof item.productId === 'object' ? item.productId?._id : item.productId) || "").substring(0, 6).toUpperCase()}`}
                                                    </p>
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

                                {/* PhonePe / Online Payment Details */}
                                {(selectedOrder.phonePeTransactionId || selectedOrder.phonePeMerchantTransactionId || selectedOrder.razorpayPaymentId) && (
                                    <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-emerald-100 rounded-lg"><CreditCard className="text-emerald-600 w-4 h-4" /></div>
                                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">PhonePe Payment Details</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {selectedOrder.phonePeTransactionId && (
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">PhonePe Transaction ID</p>
                                                    <p className="text-[11px] font-bold text-slate-900 font-mono flex items-center gap-2">
                                                        {selectedOrder.phonePeTransactionId}
                                                        <button onClick={() => { navigator.clipboard.writeText(selectedOrder.phonePeTransactionId); toast.success("Transaction ID Copied!"); }} className="text-slate-400 hover:text-blue-500 transition-colors"><Copy size={12} /></button>
                                                    </p>
                                                </div>
                                            )}
                                            {(selectedOrder.phonePeMerchantTransactionId || selectedOrder._id) && (
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Merchant Order Ref</p>
                                                    <p className="text-[11px] font-bold text-slate-900 font-mono flex items-center gap-2">
                                                        {selectedOrder.phonePeMerchantTransactionId || selectedOrder._id}
                                                        <button onClick={() => { navigator.clipboard.writeText(selectedOrder.phonePeMerchantTransactionId || selectedOrder._id); toast.success("Order Ref Copied!"); }} className="text-slate-400 hover:text-blue-500 transition-colors"><Copy size={12} /></button>
                                                    </p>
                                                </div>
                                            )}
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

                    </motion.div>
                </div>
                )}
            </AnimatePresence>

            {/* ── INTERACTIVE AUDIT TRAIL MODAL ── */}
            <AnimatePresence>
                {showAuditModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                            onClick={() => setShowAuditModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-[#f0f2f2] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden border-t-8 border-[#24672E]"
                        >
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manual Order Creation Modal */}
            <CreateManualOrderModal
                isOpen={isManualOrderModalOpen}
                onClose={() => setIsManualOrderModalOpen(false)}
                onSuccess={fetchOrders}
            />
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
