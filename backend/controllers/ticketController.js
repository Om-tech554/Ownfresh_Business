import Ticket from "../models/Ticket.js";

// Helper to generate a secure random 6-character uppercase alphanumeric string
const generateUniqueTicketId = async () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let ticketId = "";
  let exists = true;

  while (exists) {
    ticketId = "TKT-";
    for (let i = 0; i < 6; i++) {
      ticketId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Check for collision
    const existing = await Ticket.findOne({ ticketId });
    if (!existing) {
      exists = false;
    }
  }

  return ticketId;
};

// ===================== CREATE TICKET (Public) =====================
export const createTicket = async (req, res) => {
  try {
    const { name, email, orderId, subject, description } = req.body;

    if (!name || !email || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and description are required.",
      });
    }

    // Optional attachment path from Cloudinary
    const attachmentUrl = req.file?.path || "";

    const ticketId = await generateUniqueTicketId();

    const newTicket = new Ticket({
      ticketId,
      name,
      email,
      orderId: orderId || "",
      subject,
      description,
      attachment: attachmentUrl,
    });

    await newTicket.save();

    return res.status(201).json({
      success: true,
      message: "Support ticket registered successfully!",
      ticketId,
      ticket: newTicket,
    });
  } catch (error) {
    console.error("CREATE TICKET EXCEPTION:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// ===================== GET ALL TICKETS (Admin Only) =====================
export const getAllTickets = async (req, res) => {
  try {
    const { search = "", status = "ALL" } = req.query;

    const query = {};

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { ticketId: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("GET ALL TICKETS EXCEPTION:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// ===================== GET TICKET BY ID (Admin Only) =====================
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    let ticket;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await Ticket.findById(id);
    } else {
      ticket = await Ticket.findOne({ ticketId: id });
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("GET TICKET BY ID EXCEPTION:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// ===================== UPDATE TICKET STATUS (Admin Only) =====================
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    let ticket;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await Ticket.findById(id);
    } else {
      ticket = await Ticket.findOne({ ticketId: id });
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    ticket.status = status;
    await ticket.save();

    return res.json({
      success: true,
      message: "Ticket status updated successfully",
      ticket,
    });
  } catch (error) {
    console.error("UPDATE TICKET EXCEPTION:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};
