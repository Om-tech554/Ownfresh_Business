import express from "express";
import {
  getDashboardMetrics,
  getTopProducts,
  getFunnelMetrics,
  getSearchAnalytics,
  getAbandonedCarts,
  getAuditLogs,
  exportReport,
  logSearch,
  logCartActivity
} from "../controllers/analyticsController.js";

const router = express.Router();

// Public telemetry endpoints
router.post("/log-search", logSearch);
router.post("/log-cart-activity", logCartActivity);

// Business Intelligence & Dashboard metrics
router.get("/dashboard-metrics", getDashboardMetrics);
router.get("/top-products", getTopProducts);
router.get("/funnel", getFunnelMetrics);
router.get("/search-analytics", getSearchAnalytics);
router.get("/abandoned-carts", getAbandonedCarts);
router.get("/audit-logs", getAuditLogs);
router.get("/export/:type", exportReport);

export default router;
