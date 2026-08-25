import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folderName = "blogs";
    if (req.baseUrl.includes("category")) {
      folderName = "categories";
    } else if (req.baseUrl.includes("product")) {
      folderName = "products";
    } else if (req.baseUrl.includes("gallery")) {
      folderName = "gallery";
    } else if (req.baseUrl.includes("order")) {
      folderName = "orders";
    } else if (req.baseUrl.includes("campaign")) {
      folderName = "campaigns";
    } else if (req.baseUrl.includes("ticket")) {
      folderName = "tickets";
    }
    return {
      folder: folderName,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png"],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG/PNG images allowed"), false);
    }
  },
});

export default upload;
