import express from "express";
import { getMyWallet } from "../controllers/walletController.js";
import isAuth from "../middleware/isAuth.js";

const router = express.Router();

// User Wallet Details
router.get("/my-wallet", isAuth, getMyWallet);

export default router;
