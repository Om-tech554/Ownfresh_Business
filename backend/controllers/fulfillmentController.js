import mongoose from "mongoose";
import Carrier from "../models/carrierModel.js";
import Order from "../models/ordermodel.js";
import AuditLog from "../models/auditLogModel.js";
import { runImageOcr, runPdfTextExtraction, extractCourierDetails } from "../utils/ocrService.js";
import { logEvent } from "../utils/auditLogger.js";
import { sendCustomMail, generateShipmentEmailHtml, generateDeliverySuccessEmailHtml, sendOrderDeliveredMail } from "../utils/mail.js";
import { determineDeliveryRegion } from "../services/shippingService.js";

// GET ALL ACTIVE CARRIERS
export const getCarriers = async (req, res) => {
  try {
    let carriers = await Carrier.find({ active: true }).sort({ name: 1 });
    const hasLocal = carriers.some(c => c.name.toLowerCase().includes("local") || c.name.toLowerCase().includes("pune"));
    if (!hasLocal) {
      carriers = [
        { _id: "local-pune", name: "Local Pune Delivery", baseTrackingUrl: "", active: true },
        ...carriers
      ];
    }
    res.status(200).json({ success: true, carriers });
  } catch (error) {
    console.error("Failed to load carriers:", error.message);
    res.status(500).json({ success: false, msg: "Failed to load carriers" });
  }
};

// UPLOAD RECEIPT AND RUN OCR
export const processReceiptOCR = async (req, res) => {
  const { orderId } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ success: false, msg: "No receipt file uploaded" });
  }

  await logEvent({
    eventType: "OCR_PROCESSING",
    req,
    details: { orderId, fileName: req.file.originalname }
  });

  try {
    const fileUrl = req.file.path;
    let rawText = "";

    // Determine processor based on file mimetype
    if (req.file.mimetype === "application/pdf") {
      rawText = await runPdfTextExtraction(fileUrl);
    } else {
      rawText = await runImageOcr(fileUrl);
    }

    // Load active carriers to run matching on
    const carriers = await Carrier.find({ active: true });
    const matchResults = extractCourierDetails(rawText, carriers);

    res.status(200).json({
      success: true,
      msg: "OCR completed successfully",
      fileUrl,
      rawText,
      courierPartner: matchResults.carrierName,
      trackingId: matchResults.trackingId
    });
  } catch (error) {
    console.error("OCR Processing failed:", error.message);
    
    await logEvent({
      eventType: "OCR_FAILURE",
      req,
      details: { orderId, error: error.message }
    });

    res.status(500).json({
      success: false,
      msg: "OCR Scanning failed. You can still input courier details manually.",
      error: error.message
    });
  }
};

// CONFIRM FULFILLMENT DETAILS
export const confirmFulfillment = async (req, res) => {
  try {
    const { id } = req.params;
    const { courierPartner, trackingId, courierReceiptUrl, courierReceiptRawText } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // Determine if destination is within Pune region
    const isPune = (order.deliveryAddress && determineDeliveryRegion(order.deliveryAddress) === "PUNE") ||
                   (courierPartner && (courierPartner.toLowerCase().includes("local") || courierPartner.toLowerCase().includes("pune"))) ||
                   order.isLocalDelivery;

    const resolvedPartner = courierPartner || (isPune ? "Local Pune Delivery" : "");
    if (!resolvedPartner || resolvedPartner === "Unknown Carrier") {
      return res.status(400).json({ success: false, msg: "Please select a valid Courier Partner" });
    }

    // For Pune deliveries: third-party couriers (DTDC, BlueDart) & tracking number are NOT required
    if (!isPune && (!trackingId || !trackingId.trim())) {
      return res.status(400).json({ success: false, msg: "Tracking ID is required for out-of-Pune shipments" });
    }

    const resolvedTrackingId = (trackingId && trackingId.trim()) ? trackingId.trim() : (isPune ? "LOCAL-PUNE" : "");

    // Look up carrier to build tracking URL (if applicable)
    let trackingUrl = "";
    if (!isPune && resolvedTrackingId) {
      const carrier = await Carrier.findOne({ name: resolvedPartner });
      const baseTrackingUrl = carrier ? carrier.baseTrackingUrl : "";
      trackingUrl = baseTrackingUrl + resolvedTrackingId;
      if (resolvedPartner.toLowerCase() === "trackon") {
        trackingUrl = baseTrackingUrl || "https://trackon.in/";
      }
    }

    // Update Order fields
    order.courierPartner = resolvedPartner;
    order.trackingId = resolvedTrackingId;
    order.trackingUrl = trackingUrl;
    order.isLocalDelivery = isPune;
    if (courierReceiptUrl) order.courierReceiptUrl = courierReceiptUrl;
    if (courierReceiptRawText) order.courierReceiptRawText = courierReceiptRawText;

    // If order was pending, shift it to processing since logistics is initiated
    if (order.status === "pending") {
      order.status = "processing";
    }

    await order.save();

    await logEvent({
      eventType: "TRACKING_GENERATION",
      req,
      details: { orderId: id, courierPartner: resolvedPartner, trackingId: resolvedTrackingId, trackingUrl, isLocalDelivery: isPune }
    });

    if (courierReceiptUrl) {
      await logEvent({
        eventType: "RECEIPT_UPLOAD",
        req,
        details: { orderId: id, courierReceiptUrl }
      });
    }

    res.status(200).json({
      success: true,
      msg: isPune ? "Local Pune fulfillment confirmed (No tracking number needed)!" : "Fulfillment confirmed and tracking URL generated!",
      order
    });
  } catch (error) {
    console.error("Fulfillment confirmation failed:", error.message);
    res.status(500).json({ success: false, msg: "Server error confirming fulfillment" });
  }
};

// GENERATE SHIPMENT EMAIL PREVIEW
export const previewShipmentEmail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Order ID" });
    }

    const order = await Order.findById(id).populate("user", "fullName email");
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    if (!order.user) {
      return res.status(400).json({ success: false, msg: "The user account associated with this order has been deleted. Cannot preview shipment email." });
    }

    const isPune = order.isLocalDelivery ||
                   (order.deliveryAddress && determineDeliveryRegion(order.deliveryAddress) === "PUNE") ||
                   (order.courierPartner && (order.courierPartner.toLowerCase().includes("local") || order.courierPartner.toLowerCase().includes("pune"))) ||
                   order.trackingId === "PUNE" ||
                   order.trackingId === "LOCAL-PUNE";

    if (!order.courierPartner || (!isPune && !order.trackingId)) {
      return res.status(400).json({ success: false, msg: "Order lacks fulfillment details. Please confirm fulfillment first." });
    }

    const html = generateShipmentEmailHtml(order, order.trackingUrl);
    const orderIdCode = order.customOrderId || order._id.toString().toUpperCase();
    const subject = isPune 
      ? `Your OwnFresh Order is Out for Local Pune Delivery! - #${orderIdCode}`
      : `Your OwnFresh Order has been shipped! - #${orderIdCode}`;
    const text = isPune
      ? `Hi ${order.user.fullName},\n\nYour order #${orderIdCode} is out for delivery with our Local Pune Delivery Fleet.\nDelivery Address: ${order.deliveryAddress?.text || 'Pune'}\n\nThank you for shopping with OwnFresh!`
      : `Hi ${order.user.fullName},\n\nYour order #${orderIdCode} has been handed over to ${order.courierPartner}.\nTracking Number: ${order.trackingId}\nTrack here: ${order.trackingUrl}\n\nThank you for shopping with OwnFresh!`;

    await logEvent({
      eventType: "EMAIL_PREVIEW",
      req,
      details: { orderId: id }
    });

    res.status(200).json({
      success: true,
      subject,
      html,
      text,
      customerEmail: order.user.email
    });
  } catch (error) {
    console.error("Fulfillment email preview failed:", error.message);
    res.status(500).json({ success: false, msg: "Server error generating email preview" });
  }
};

// GENERATE SUCCESSFUL DELIVERY EMAIL PREVIEW
export const previewDeliveryEmail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Order ID" });
    }

    const order = await Order.findById(id).populate("user", "fullName email");
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    if (!order.user) {
      return res.status(400).json({ success: false, msg: "The user account associated with this order has been deleted. Cannot preview delivery email." });
    }

    const html = generateDeliverySuccessEmailHtml(order);
    const orderIdCode = order.customOrderId || order._id.toString().toUpperCase();
    const siteUrl = process.env.FRONTEND_URL || "https://myownfresh.com";
    const deliveryAddress = order.deliveryAddress?.text || [
      order.deliveryAddress?.roomNumber,
      order.deliveryAddress?.areaName,
      order.deliveryAddress?.city,
      order.deliveryAddress?.pincode
    ].filter(Boolean).join(", ") || "Pune, Maharashtra";

    const subject = `Your OwnFresh oil has been delivered successfully! 🥰 - #${orderIdCode}`;
    const text = `Hi ${order.user.fullName},\n\nYour OwnFresh oil has been delivered successfully! 🥰\n\nThank you for choosing OwnFresh! ❤️\n\nOrder ID: #${orderIdCode}\nDelivered To: ${deliveryAddress}\nDelivery Mode: ${order.courierPartner || "Local Pune Delivery (Own Fleet)"}\n\nView your order details & invoice: ${siteUrl}/my-orders\n\nHave questions or feedback? Reply directly to this email or write to us at contact@myownfresh.com.\n\nWarm regards,\nOwnFresh Agro Industries, Pune`;

    await logEvent({
      eventType: "DELIVERY_EMAIL_PREVIEW",
      req,
      details: { orderId: id }
    });

    res.status(200).json({
      success: true,
      subject,
      html,
      text,
      customerEmail: order.user.email
    });
  } catch (error) {
    console.error("Delivery email preview failed:", error.message);
    res.status(500).json({ success: false, msg: "Server error generating delivery email preview" });
  }
};

// SEND TEST DELIVERY EMAIL
export const sendTestDeliveryEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, html, text, testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({ success: false, msg: "Test email address is required" });
    }

    await sendOrderDeliveredMail({
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html,
      text
    });

    await logEvent({
      eventType: "TEST_DELIVERY_EMAIL_SENT",
      req,
      details: { orderId: id, recipient: testEmail }
    });

    res.status(200).json({ success: true, msg: `Test delivery email successfully sent to ${testEmail}` });
  } catch (error) {
    console.error("Test delivery email send failed:", error.message);
    res.status(500).json({ success: false, msg: "Email delivery failed: " + error.message });
  }
};

// SEND SUCCESSFUL DELIVERY EMAIL TO CUSTOMER
export const sendDeliveryEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, html, text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Order ID" });
    }

    const order = await Order.findById(id).populate("user", "fullName email");
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    if (!order.user) {
      return res.status(400).json({ success: false, msg: "The user account associated with this order has been deleted. Cannot send delivery email." });
    }

    await sendOrderDeliveredMail({
      to: order.user.email,
      subject,
      html,
      text
    });

    // Update order status and delivery email timestamps
    order.status = "delivered";
    order.deliveryEmailSent = true;
    order.deliveryEmailSentAt = new Date();
    await order.save();

    await logEvent({
      eventType: "DELIVERY_EMAIL_SENT",
      req,
      details: { orderId: id, recipient: order.user.email }
    });

    res.status(200).json({
      success: true,
      msg: "Delivery confirmation email sent to customer!",
      order
    });
  } catch (error) {
    console.error("Delivery email sending failed:", error.message);
    res.status(500).json({ success: false, msg: "Email delivery failed: " + error.message });
  }
};

// SEND TEST SHIPMENT EMAIL
export const sendTestShipmentEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, html, text, testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({ success: false, msg: "Test email address is required" });
    }

    await sendCustomMail({
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html,
      text
    });

    await logEvent({
      eventType: "TEST_EMAIL_SENT",
      req,
      details: { orderId: id, recipient: testEmail }
    });

    res.status(200).json({ success: true, msg: `Test email successfully sent to ${testEmail}` });
  } catch (error) {
    console.error("Test email send failed:", error.message);
    res.status(500).json({ success: false, msg: "Email delivery failed: " + error.message });
  }
};

// SEND SHIPMENT EMAIL TO CUSTOMER (MANUAL SEND)
export const sendShipmentEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, html, text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Order ID" });
    }

    const order = await Order.findById(id).populate("user", "fullName email");
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    if (!order.user) {
      return res.status(400).json({ success: false, msg: "The user account associated with this order has been deleted. Cannot send shipment email." });
    }

    await sendCustomMail({
      to: order.user.email,
      subject,
      html,
      text
    });

    // Update order status and timestamp
    order.status = "shipped";
    order.shipmentEmailSent = true;
    order.shipmentEmailSentAt = new Date();
    await order.save();

    await logEvent({
      eventType: "SHIPMENT_EMAIL_SENT",
      req,
      details: { orderId: id, recipient: order.user.email }
    });

    res.status(200).json({
      success: true,
      msg: "Shipment notification email sent to customer!",
      order
    });
  } catch (error) {
    console.error("Fulfillment email delivery failed:", error.message);
    res.status(500).json({ success: false, msg: "Email delivery failed: " + error.message });
  }
};

// TOGGLE PACKING SLIP LABEL PRINTED
export const toggleLabelPrinted = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    order.labelPrinted = true;
    await order.save();

    res.status(200).json({ success: true, labelPrinted: true });
  } catch (error) {
    console.error("Label print toggle failed:", error.message);
    res.status(500).json({ success: false, msg: "Server error updating label printed state" });
  }
};

// GET ORDER SPECIFIC AUDIT LOGS
export const getOrderAuditLogs = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, msg: "Invalid Order ID" });
    }

    const logs = await AuditLog.find({
      $or: [
        { "details.orderId": orderId },
        { "details.orderId": new mongoose.Types.ObjectId(orderId) }
      ]
    })
      .populate("adminId", "fullName email")
      .populate("userId", "fullName email")
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error("Failed to load audit logs:", error.message);
    res.status(500).json({ success: false, msg: "Failed to load audit logs" });
  }
};
