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

const router = express.Router();

router.post("/create", isAuth, createOrder);
router.get("/my-orders", isAuth, getUserOrders);
router.get("/admin/all", isAuth, isAdmin, getAllOrders);
router.put("/status/:id", isAuth, isAdmin, updateOrderStatus);

// Cancellation Routes
router.put("/cancel-request/:id", isAuth, requestOrderCancellation);
router.put("/cancel-review/:id", isAuth, isAdmin, handleCancellationReview);
router.delete("/user-delete/:id", isAuth, deleteUserOrder);
router.delete("/admin-delete/:id", isAuth, isAdmin, adminDeleteOrder);

export default router;
