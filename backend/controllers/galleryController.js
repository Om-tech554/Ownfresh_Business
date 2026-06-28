import mongoose from "mongoose";
import Gallery from "../models/galleryModel.js";
import User from "../models/usermodel.js";

// Helper function to auto-seed default images if collection is empty
const seedDefaultGalleryImages = async () => {
  try {
    const count = await Gallery.countDocuments();
    if (count === 0) {
      // Find an admin user to associate uploads with, or fallback to first user
      let uploader = await User.findOne({ role: "admin" });
      if (!uploader) {
        uploader = await User.findOne();
      }
      const uploaderId = uploader ? uploader._id : new mongoose.Types.ObjectId();

      const defaultGalleryImages = [
        {
          title: "Extraction process",
          imageUrl: "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1200&auto=format&fit=crop",
          category: "Extraction",
          description: "From Soil to Oil - Traditional stone-pressing",
          displayOrder: 1,
          isActive: true,
          uploadedBy: uploaderId,
        },
        {
          title: "Pure sesame oil",
          imageUrl: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?q=80&w=1200&auto=format&fit=crop",
          category: "Our Oils",
          description: "100% Pure Sesame Oil - No additives",
          displayOrder: 2,
          isActive: true,
          uploadedBy: uploaderId,
        },
        {
          title: "Groundnut oil in kitchen",
          imageUrl: "https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?q=80&w=1200&auto=format&fit=crop",
          category: "Culinary",
          description: "Kitchen Inspirations - Cook with purity",
          displayOrder: 3,
          isActive: true,
          uploadedBy: uploaderId,
        },
        {
          title: "Handpicked seeds",
          imageUrl: "https://images.unsplash.com/photo-1519996529931-28324d5a1f6a?q=80&w=1200&auto=format&fit=crop",
          category: "Ingredients",
          description: "Nature's Best - Handpicked nuts & seeds",
          displayOrder: 4,
          isActive: true,
          uploadedBy: uploaderId,
        },
        {
          title: "Healthy meal with OwnFresh oil",
          imageUrl: "https://images.unsplash.com/photo-1606914469725-e398d2f1d7ee?q=80&w=1200&auto=format&fit=crop",
          category: "Culinary",
          description: "Healthy Cooking - Every meal made better",
          displayOrder: 5,
          isActive: true,
          uploadedBy: uploaderId,
        },
        {
          title: "Oil pouring shot",
          imageUrl: "https://images.unsplash.com/photo-1600271881734-60ef0e5cb15b?q=80&w=1200&auto=format&fit=crop",
          category: "Our Oils",
          description: "Purity in Every Drop",
          displayOrder: 6,
          isActive: true,
          uploadedBy: uploaderId,
        },
        {
          title: "Community celebration",
          imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
          category: "Community",
          description: "Community & Celebrations",
          displayOrder: 7,
          isActive: true,
          uploadedBy: uploaderId,
        },
        {
          title: "Farm to bottle",
          imageUrl: "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?q=80&w=1200&auto=format&fit=crop",
          category: "Extraction",
          description: "Farm to Bottle - 100% Traceable",
          displayOrder: 8,
          isActive: true,
          uploadedBy: uploaderId,
        },
        {
          title: "Customer experience",
          imageUrl: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1200&auto=format&fit=crop",
          category: "Community",
          description: "Happy Customers Across India",
          displayOrder: 9,
          isActive: true,
          uploadedBy: uploaderId,
        },
      ];

      await Gallery.insertMany(defaultGalleryImages);
      console.log("✅ Seeded default gallery images successfully");
    }
  } catch (error) {
    console.error("❌ Error seeding default gallery images:", error);
  }
};

// ===================== GET ACTIVE GALLERY IMAGES (PUBLIC) =====================
export const getGalleryImages = async (req, res) => {
  try {
    await seedDefaultGalleryImages();
    const images = await Gallery.find({ isActive: true }).sort({
      displayOrder: 1,
      createdAt: -1,
    });
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== GET ALL IMAGES (ADMIN) =====================
export const adminGetGalleryImages = async (req, res) => {
  try {
    await seedDefaultGalleryImages();
    const { page = 1, limit = 12, search = "", category = "" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      query.category = category;
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const count = await Gallery.countDocuments(query);
    const images = await Gallery.find(query)
      .populate("uploadedBy", "name email")
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      images,
      totalPages: Math.ceil(count / limitNum) || 1,
      currentPage: pageNum,
      totalImages: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== UPLOAD GALLERY IMAGE =====================
export const uploadGalleryImage = async (req, res) => {
  try {
    const { title, category, description, displayOrder, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Title and Category are required",
      });
    }

    const image = await Gallery.create({
      title,
      imageUrl: req.file.path,
      category,
      description,
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive === "false" || isActive === false ? false : true,
      uploadedBy: req.userId,
    });

    res.status(201).json({ success: true, image });
  } catch (error) {
    console.error("UPLOAD GALLERY IMAGE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== UPDATE GALLERY IMAGE =====================
export const updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Image ID" });
    }

    const { title, category, description, displayOrder, isActive } = req.body;

    const updateData = {
      title,
      category,
      description,
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive === "false" || isActive === false ? false : true,
    };

    const image = await Gallery.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    res.json({ success: true, image });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== DELETE GALLERY IMAGE =====================
export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Image ID" });
    }

    const image = await Gallery.findByIdAndDelete(id);

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
