import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "orders/receipts",
      resource_type: "auto", // Auto-detect PDF vs Image
      public_id: `receipt_${Date.now()}_${file.originalname.split('.')[0]}`
    };
  },
});

const uploadReceipt = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG images and PDF documents are allowed"), false);
    }
  },
});

export default uploadReceipt;
