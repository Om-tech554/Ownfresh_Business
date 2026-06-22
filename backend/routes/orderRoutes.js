import express from "express";
import { createOrder } from "../controllers/checkoutController.js";
import isAuth from "../middleware/isAuth.js";

const router = express.Router();

router.post("/create", isAuth, createOrder);

export default router;
