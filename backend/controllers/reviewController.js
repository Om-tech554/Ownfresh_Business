import Review from "../models/reviewModel.js";
import User from "../models/usermodel.js";
import Order from "../models/ordermodel.js";

// ADD REVIEW (User)
export const addReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, rating, title, comment, location } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Please provide a rating between 1 and 5 stars" });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: "Review text is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has purchased this product (if productId provided)
    let isVerified = false;
    if (productId) {
      const orderCount = await Order.countDocuments({
        user: userId,
        status: { $in: ["delivered", "completed"] },
        "items.product": productId
      });
      isVerified = orderCount > 0;
    } else {
      isVerified = true;
    }

    const review = await Review.create({
      user: userId,
      product: productId || null,
      userName: user.fullName || "OwnFresh Customer",
      userAvatar: user.avatar || "",
      rating: Number(rating),
      title: title ? title.trim() : "",
      comment: comment.trim(),
      location: location ? location.trim() : "India",
      isVerifiedBuyer: isVerified,
      status: "APPROVED" // Auto-approve or admin moderate
    });

    res.status(201).json({
      success: true,
      message: "Thank you for your review!",
      review
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

// GET PRODUCT REVIEWS (Public)
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      product: productId,
      status: "APPROVED"
    }).sort({ createdAt: -1 });

    const totalCount = reviews.length;

    // Calculate rating stats
    let totalRatingSum = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(r => {
      totalRatingSum += r.rating;
      const roundedRating = Math.round(r.rating);
      if (distribution[roundedRating] !== undefined) {
        distribution[roundedRating] += 1;
      }
    });

    const averageRating = totalCount > 0 ? (totalRatingSum / totalCount).toFixed(1) : 5.0;

    res.status(200).json({
      success: true,
      totalCount,
      averageRating: Number(averageRating),
      distribution,
      reviews
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({ message: "Failed to fetch product reviews" });
  }
};

// GET FEATURED TESTIMONIALS (Public - for Homepage)
export const getFeaturedTestimonials = async (req, res) => {
  try {
    let testimonials = await Review.find({
      status: "APPROVED"
    }).sort({ isFeatured: -1, rating: -1, createdAt: -1 }).limit(12);

    // Fallback initial seeded testimonials if database has few reviews
    if (testimonials.length < 3) {
      const defaultTestimonials = [
        {
          _id: "seed1",
          userName: "Dr. Rajesh K.",
          location: "Mumbai",
          rating: 5,
          title: "Authentic Stone Pressed Oil!",
          comment: "I have been using OwnFresh Mustard Oil for 6 months now. The aroma and purity are unmatched compared to store-bought refined oils.",
          isVerifiedBuyer: true,
          createdAt: new Date()
        },
        {
          _id: "seed2",
          userName: "Ananya Sharma",
          location: "Bengaluru",
          rating: 5,
          title: "Extremely Pure Coconut Oil",
          comment: "You can tell the difference in quality right away. Perfect for cooking and hair care. Quick delivery and beautiful packaging!",
          isVerifiedBuyer: true,
          createdAt: new Date()
        },
        {
          _id: "seed3",
          userName: "Sunil Deshmukh",
          location: "Pune",
          rating: 5,
          title: "Traditional Quality Revived",
          comment: "Reminds me of traditional oil mills from my childhood. Stone pressing really preserves the natural nutrients and rich taste.",
          isVerifiedBuyer: true,
          createdAt: new Date()
        }
      ];
      return res.status(200).json({ success: true, testimonials: defaultTestimonials });
    }

    res.status(200).json({ success: true, testimonials });
  } catch (error) {
    console.error("Get featured testimonials error:", error);
    res.status(500).json({ message: "Failed to fetch testimonials" });
  }
};

// ADMIN: GET ALL REVIEWS
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product", "name image")
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: UPDATE REVIEW STATUS / FEATURED
export const updateReviewStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;

    const review = await Review.findByIdAndUpdate(id, updateData, { new: true });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: DELETE REVIEW
export const deleteReviewAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
