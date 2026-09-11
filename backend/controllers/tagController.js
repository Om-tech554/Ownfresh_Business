import Tag from "../models/tagModel.js";

// GET ALL TAGS (Admin)
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });
    res.json({ success: true, tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ACTIVE TAGS (Public)
export const getActiveTags = async (req, res) => {
  try {
    const tags = await Tag.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE TAG
export const createTag = async (req, res) => {
  try {
    const { name = "", icon = "", imageUrl = "", bgColor, textColor, description = "", isActive } = req.body;

    let finalImageUrl = imageUrl || "";
    if (req.file) {
      finalImageUrl = req.file.path;
    }

    const trimmedName = (name || "").trim();
    const finalIcon = (icon || "").trim();

    if (!trimmedName && !finalIcon && !finalImageUrl) {
      return res.status(400).json({ success: false, message: "A badge name, icon, or custom image is required." });
    }

    const slugBase = trimmedName || finalIcon || "badge";
    const slug = `${slugBase.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${Date.now().toString(36)}`;

    const tag = await Tag.create({
      name: trimmedName,
      slug,
      icon: finalIcon,
      imageUrl: finalImageUrl,
      bgColor: bgColor || "#1E971D",
      textColor: textColor || "#ffffff",
      description: description.trim(),
      isActive: isActive !== undefined ? (isActive === true || isActive === "true") : true
    });

    res.status(201).json({ success: true, tag, message: "Badge created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE TAG
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, imageUrl, bgColor, textColor, description, isActive } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Badge not found" });
    }

    if (name !== undefined) {
      tag.name = name.trim();
      if (tag.name) {
        tag.slug = `${tag.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${Date.now().toString(36)}`;
      }
    }
    if (icon !== undefined) tag.icon = icon.trim();
    if (req.file) {
      tag.imageUrl = req.file.path;
    } else if (imageUrl !== undefined) {
      tag.imageUrl = imageUrl;
    }
    if (bgColor !== undefined) tag.bgColor = bgColor;
    if (textColor !== undefined) tag.textColor = textColor;
    if (description !== undefined) tag.description = description;
    if (isActive !== undefined) tag.isActive = (isActive === true || isActive === "true");

    await tag.save();
    res.json({ success: true, tag, message: "Badge updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE TAG
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    await Tag.findByIdAndDelete(id);
    res.json({ success: true, message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SEED DEFAULT TAGS
export const seedDefaultTags = async (req, res) => {
  try {
    const defaultTags = [
      {
        name: "Best Seller",
        slug: "best-seller",
        icon: "Award",
        bgColor: "#EA580C", // Orange
        textColor: "#ffffff",
        description: "Customer favorite top seller",
        isActive: true
      },
      {
        name: "Stone Pressed",
        slug: "stone-pressed",
        icon: "Award",
        bgColor: "#1E971D", // Green
        textColor: "#ffffff",
        description: "Traditionally extracted with natural stone mill (Kolhu) without heat or chemicals",
        isActive: true
      },
      {
        name: "Organic",
        slug: "organic",
        icon: "Leaf",
        bgColor: "#15803D", // Emerald
        textColor: "#ffffff",
        description: "Naturally grown non-GMO seeds",
        isActive: true
      },
      {
        name: "Special Offer",
        slug: "special-offer",
        icon: "Sparkles",
        bgColor: "#DC2626", // Red
        textColor: "#ffffff",
        description: "Promotional festival discounted price",
        isActive: true
      },
      {
        name: "New Arrival",
        slug: "new-arrival",
        icon: "Star",
        bgColor: "#4F46E5", // Indigo
        textColor: "#ffffff",
        description: "Newly launched batch",
        isActive: true
      }
    ];

    for (const dt of defaultTags) {
      await Tag.findOneAndUpdate({ slug: dt.slug }, dt, { upsert: true, new: true });
    }

    const tags = await Tag.find();
    res.json({ success: true, tags, message: "Default tags seeded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
