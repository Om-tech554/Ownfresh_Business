import express from "express";
import { createOrder } from "../controllers/checkoutController.js";
import { 
  getUserOrders, 
  getAllOrders, 
  updateOrderStatus, 
  requestOrderCancellation, 
  handleCancellationReview, 
  deleteUserOrder, 
  adminDeleteOrder 
} from "../controllers/orderController.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// User Order Routes
router.post("/create", isAuth, createOrder);
router.post("/upload-screenshot", isAuth, upload.single("screenshot"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, msg: "No image provided" });
  }
  res.status(200).json({ success: true, url: req.file.path });
});
router.get("/my-orders", isAuth, getUserOrders);
router.put("/cancel-request/:id", isAuth, requestOrderCancellation);
router.delete("/user-delete/:id", isAuth, deleteUserOrder);

// Admin Order Routes
router.get("/admin/all", isAuth, isAdmin, getAllOrders);
router.put("/status/:id", isAuth, isAdmin, updateOrderStatus);
router.put("/cancel-review/:id", isAuth, isAdmin, handleCancellationReview);
router.delete("/admin-delete/:id", isAuth, isAdmin, adminDeleteOrder);

export default router;
