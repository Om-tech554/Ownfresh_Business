import express from "express";
import { createOrder } from "../controllers/checkoutController.js";
import { getUserOrders, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/create", isAuth, createOrder);
router.get("/my-orders", isAuth, getUserOrders);
router.get("/admin/all", isAuth, isAdmin, getAllOrders);
router.put("/status/:id", isAuth, isAdmin, updateOrderStatus);

export default router;
