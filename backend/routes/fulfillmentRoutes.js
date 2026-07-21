import express from "express";
import isAuth, { isAdmin } from "../middleware/isAuth.js";
import uploadReceipt from "../middleware/fulfillmentMulter.js";
import {
  getCarriers,
  processReceiptOCR,
  confirmFulfillment,
  previewShipmentEmail,
  sendTestShipmentEmail,
  sendShipmentEmail,
  toggleLabelPrinted,
  getOrderAuditLogs
} from "../controllers/fulfillmentController.js";

const router = express.Router();

router.get("/carriers", isAuth, isAdmin, getCarriers);
router.post("/upload-receipt", isAuth, isAdmin, uploadReceipt.single("receipt"), processReceiptOCR);
router.put("/confirm/:id", isAuth, isAdmin, confirmFulfillment);
router.post("/preview-email/:id", isAuth, isAdmin, previewShipmentEmail);
router.post("/test-email/:id", isAuth, isAdmin, sendTestShipmentEmail);
router.post("/send-email/:id", isAuth, isAdmin, sendShipmentEmail);
router.put("/label-printed/:id", isAuth, isAdmin, toggleLabelPrinted);
router.get("/audit-logs/:orderId", isAuth, isAdmin, getOrderAuditLogs);

export default router;
