import express from "express";
import upload from "../middleware/multer.js";
import isAuth, { isAdmin } from "../middleware/isAuth.js";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicketStatus
} from "../controllers/ticketController.js";

const router = express.Router();

// Public: Submit a ticket (with optional single image file attachment)
router.post("/create", upload.single("attachment"), createTicket);

// Admin-Only Routes
router.get("/admin/all", isAuth, isAdmin, getAllTickets);
router.get("/admin/:id", isAuth, isAdmin, getTicketById);
router.put("/admin/status/:id", isAuth, isAdmin, updateTicketStatus);

export default router;
