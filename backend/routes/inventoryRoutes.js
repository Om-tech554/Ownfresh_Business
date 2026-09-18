import express from "express";
import {
  addVariant,
  updateVariant,
  deleteVariant,
  getVariants,
  getAllVariants,
  bulkUpdatePrices,
  getMasterRates,
  updateMasterRates
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

export default router;
