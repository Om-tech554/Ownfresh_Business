import Campaign from "../models/campaignModel.js";
import Coupon from "../models/couponModel.js";
import mongoose from "mongoose";

// Helper function to resolve campaign statuses dynamically based on dates
const resolveCampaignStatuses = async () => {
  const now = new Date();
  try {
    // 1) "Scheduled" or "Draft" (that was somehow active) whose start time has arrived -> "Active"
    // Only transition if they are currently "Scheduled"
    await Campaign.updateMany(
      { status: "Scheduled", startDate: { $lte: now }, endDate: { $gte: now } },
      { $set: { status: "Active" } }
    );

    // 2) "Active" or "Scheduled" whose end date has passed -> "Expired"
    await Campaign.updateMany(
      { status: { $in: ["Active", "Scheduled"] }, endDate: { $lt: now } },
      { $set: { status: "Expired" } }
    );

    // 3) "Active" whose start date is now in the future (edited start date) -> "Scheduled"
    await Campaign.updateMany(
      { status: "Active", startDate: { $gt: now } },
      { $set: { status: "Scheduled" } }
    );
  } catch (error) {
    console.error("Error resolving campaign statuses:", error.message);
  }
};

// CREATE CAMPAIGN (Admin)
export const createCampaign = async (req, res) => {
  try {
    const {
      festivalName,
      title,
      description,
      promoCode, // Mongoose Coupon ID
      startDate,
      endDate,
      status,
      ctaText,
      ctaUrl,
      priority,
      displayLocation,
      showCountdown
    } = req.body;

    // Validate images
    const bannerImage = req.files?.bannerImage?.[0]?.path;
    const mobileBannerImage = req.files?.mobileBannerImage?.[0]?.path || "";

    if (!festivalName || !title || !promoCode || !startDate || !endDate) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (!bannerImage) {
      return res.status(400).json({ message: "Desktop banner image is required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: "Start date must be before end date." });
    }

    // Verify Coupon exists
    const coupon = await Coupon.findById(promoCode);
    if (!coupon) {
      return res.status(404).json({ message: "Selected Promo Code (coupon) does not exist." });
    }

    // Determine initial status based on date if scheduled or active is set
    let finalStatus = status || "Draft";
    if (finalStatus === "Active" || finalStatus === "Scheduled") {
      const now = new Date();
      if (now < start) {
        finalStatus = "Scheduled";
      } else if (now > end) {
        finalStatus = "Expired";
      } else {
        finalStatus = "Active";
      }
    }

    const campaign = await Campaign.create({
      festivalName,
      title,
      description: description || "",
      bannerImage,
      mobileBannerImage,
      promoCode,
      startDate: start,
      endDate: end,
      status: finalStatus,
      ctaText: ctaText || "Shop Now",
      ctaUrl: ctaUrl || "/shop",
      priority: Number(priority) || 0,
      displayLocation: displayLocation || "home_banner",
      showCountdown: showCountdown !== undefined ? showCountdown === "true" || showCountdown === true : true,
      createdBy: req.userId || null
    });

    res.status(201).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL CAMPAIGNS (Admin)
export const getAllCampaigns = async (req, res) => {
  try {
    await resolveCampaignStatuses();
    const campaigns = await Campaign.find()
      .populate("promoCode")
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email")
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CAMPAIGN BY ID (Admin)
export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID." });
    }

    const campaign = await Campaign.findById(id).populate("promoCode");
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE CAMPAIGN (Admin)
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID." });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    const {
      festivalName,
      title,
      description,
      promoCode,
      startDate,
      endDate,
      status,
      ctaText,
      ctaUrl,
      priority,
      displayLocation,
      showCountdown
    } = req.body;

    // Verify Coupon exists if promoCode is modified
    if (promoCode) {
      const coupon = await Coupon.findById(promoCode);
      if (!coupon) {
        return res.status(404).json({ message: "Selected Promo Code (coupon) does not exist." });
      }
      campaign.promoCode = promoCode;
    }

    if (festivalName) campaign.festivalName = festivalName;
    if (title) campaign.title = title;
    if (description !== undefined) campaign.description = description;

    if (startDate) campaign.startDate = new Date(startDate);
    if (endDate) campaign.endDate = new Date(endDate);

    if (campaign.startDate >= campaign.endDate) {
      return res.status(400).json({ message: "Start date must be before end date." });
    }

    if (ctaText) campaign.ctaText = ctaText;
    if (ctaUrl) campaign.ctaUrl = ctaUrl;
    if (priority !== undefined) campaign.priority = Number(priority) || 0;
    if (displayLocation) campaign.displayLocation = displayLocation;
    if (showCountdown !== undefined) {
      campaign.showCountdown = showCountdown === "true" || showCountdown === true;
    }

    // Process uploaded files if any
    if (req.files?.bannerImage?.[0]) {
      campaign.bannerImage = req.files.bannerImage[0].path;
    }
    if (req.files?.mobileBannerImage?.[0]) {
      campaign.mobileBannerImage = req.files.mobileBannerImage[0].path;
    }

    // Determine final status
    if (status) {
      let finalStatus = status;
      if (finalStatus === "Active" || finalStatus === "Scheduled") {
        const now = new Date();
        if (now < campaign.startDate) {
          finalStatus = "Scheduled";
        } else if (now > campaign.endDate) {
          finalStatus = "Expired";
        } else {
          finalStatus = "Active";
        }
      }
      campaign.status = finalStatus;
    }

    campaign.updatedBy = req.userId || null;
    await campaign.save();

    res.status(200).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH CAMPAIGN STATUS (Admin - Fast Toggle)
export const patchCampaignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID." });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    campaign.status = status;
    campaign.updatedBy = req.userId || null;
    await campaign.save();

    await resolveCampaignStatuses(); // re-resolve to align states with current dates

    res.status(200).json({ success: true, message: `Campaign status updated to ${status}.` });
  } catch (error) {
    console.error("Error in patchCampaignStatus:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE CAMPAIGN (Admin)
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID." });
    }

    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    res.status(200).json({ success: true, message: "Campaign deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DUPLICATE CAMPAIGN (Admin)
export const duplicateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID." });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign to duplicate not found." });
    }

    const duplicatedCampaign = await Campaign.create({
      festivalName: campaign.festivalName,
      title: `Copy of ${campaign.title}`,
      description: campaign.description,
      bannerImage: campaign.bannerImage,
      mobileBannerImage: campaign.mobileBannerImage,
      promoCode: campaign.promoCode,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: "Draft", // Always set duplicated to draft first
      ctaText: campaign.ctaText,
      ctaUrl: campaign.ctaUrl,
      priority: campaign.priority,
      displayLocation: campaign.displayLocation,
      showCountdown: campaign.showCountdown,
      createdBy: req.userId || null
    });

    res.status(201).json({ success: true, campaign: duplicatedCampaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ACTIVE CAMPAIGN (Public)
export const getActiveCampaign = async (req, res) => {
  try {
    await resolveCampaignStatuses();
    const now = new Date();

    // Query active campaigns from DB where status is Active
    const activeCampaigns = await Campaign.find({
      status: "Active",
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate("promoCode")
      .sort({ priority: -1, createdAt: -1 });

    if (activeCampaigns.length === 0) {
      return res.status(200).json({ success: true, campaign: null, campaigns: [] });
    }

    res.status(200).json({
      success: true,
      campaign: activeCampaigns[0],
      campaigns: activeCampaigns
    });
  } catch (error) {
    console.error("Error getting active campaign:", error.message);
    // Graceful degradation: return empty values if error occurs
    res.status(200).json({ success: true, campaign: null, campaigns: [] });
  }
};
