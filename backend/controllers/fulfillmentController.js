import mongoose from "mongoose";
import Carrier from "../models/carrierModel.js";
import Order from "../models/ordermodel.js";
import AuditLog from "../models/auditLogModel.js";
import { runImageOcr, runPdfTextExtraction, extractCourierDetails } from "../utils/ocrService.js";
import { logEvent } from "../utils/auditLogger.js";
import { sendCustomMail, generateShipmentEmailHtml } from "../utils/mail.js";

// GET ALL ACTIVE CARRIERS
export const getCarriers = async (req, res) => {
  try {
    const carriers = await Carrier.find({ active: true }).sort({ name: 1 });
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

    if (!courierPartner || !trackingId) {
      return res.status(400).json({ success: false, msg: "Courier partner and Tracking ID are required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // Look up carrier to build tracking URL
    const carrier = await Carrier.findOne({ name: courierPartner });
    const baseTrackingUrl = carrier ? carrier.baseTrackingUrl : "";
    let trackingUrl = baseTrackingUrl + trackingId;
    if (courierPartner && courierPartner.toLowerCase() === "trackon") {
      trackingUrl = baseTrackingUrl || "https://trackon.in/";
    }

    // Update Order fields
    order.courierPartner = courierPartner;
    order.trackingId = trackingId;
    order.trackingUrl = trackingUrl;
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
      details: { orderId: id, courierPartner, trackingId, trackingUrl }
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
      msg: "Fulfillment confirmed and tracking URL generated!",
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

    if (!order.trackingId || !order.courierPartner) {
      return res.status(400).json({ success: false, msg: "Order lacks tracking ID or courier partner. Please confirm fulfillment first." });
    }

    const html = generateShipmentEmailHtml(order, order.trackingUrl);
    const subject = `Your OwnFresh Order has been shipped! - #${order._id.toString().toUpperCase()}`;
    const text = `Hi ${order.user.fullName},\n\nYour order #${order._id.toString().toUpperCase()} has been handed over to ${order.courierPartner}.\nTracking Number: ${order.trackingId}\nTrack here: ${order.trackingUrl}\n\nThank you for shopping with OwnFresh!`;

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
