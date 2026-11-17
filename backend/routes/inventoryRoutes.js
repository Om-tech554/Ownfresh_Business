import express from "express";
import isAuth, { isAdmin } from "../middleware/isAuth.js";
import {
  addVariant,
  updateVariant,
  deleteVariant,
  getVariants,
  getAllVariants,
  bulkUpdatePrices,
  getMasterRates,
  updateMasterRates,
  getGlobalOOSStatus,
  toggleGlobalOOS
} from "../controllers/inventoryController.js";

const router = express.Router();

router.post("/variants", addVariant);
router.put("/variants/:id", updateVariant);
router.delete("/variants/:id", deleteVariant);
router.get("/variants/all", getAllVariants);
router.get("/variants/:productId", getVariants);

router.put("/bulk-price-update", bulkUpdatePrices);
router.get("/master-rates", getMasterRates);
router.put("/update-master-rates", updateMasterRates);

// Global Out Of Stock (SEO-Safe Master Switch)
router.get("/global-oos", getGlobalOOSStatus);
router.put("/global-oos", isAuth, isAdmin, toggleGlobalOOS);

export default router;
