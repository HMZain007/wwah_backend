const express = require("express");
const mongoose = require("mongoose");
const pricingPlanPayment = require("../../database/models/pricingPlan/payment");
const authenticateToken = require("../../middlewares/authMiddleware");
const router = express.Router();

// Get payments for authenticated user
router.get("/payments/user/me", authenticateToken, async (req, res) => {
  try {
    // Debug: Log the entire user object to see what's available
    console.log("Full req.user object:", JSON.stringify(req.user, null, 2));
    
    // Try different possible property names from JWT
    const userId = req.user._id || req.user.id || req.user.userId || req.user.sub;
    
    console.log("Extracted userId:", userId);
    console.log("userId type:", typeof userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated - no user ID found in token",
      });
    }

    // Validate and convert to ObjectId
    let customerObjectId;
    try {
      // Handle if userId is already an ObjectId or a string
      if (userId instanceof mongoose.Types.ObjectId) {
        customerObjectId = userId;
      } else if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
        customerObjectId = new mongoose.Types.ObjectId(userId);
      } else {
        throw new Error('Invalid ObjectId format');
      }
    } catch (objectIdError) {
      console.error("ObjectId conversion error:", objectIdError);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        debug: {
          userId: userId,
          userIdType: typeof userId,
        }
      });
    }

    console.log("Querying with customerId:", customerObjectId);

    const payments = await pricingPlanPayment
      .find({
        customerId: customerObjectId,
      })
      .sort({ createdAt: -1 });

    console.log(`Found ${payments.length} payments for user ${customerObjectId}`);

    res.json({
      success: true,
      data: payments || [],
      count: payments ? payments.length : 0,
    });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user payments",
      error: error.message,
    });
  }
});

// Get payments by specific customer ID (admin route)
router.get("/payments/user/:customerId", async (req, res) => {
  try {
    console.log("Received customerId:", req.params.customerId);

    if (!mongoose.Types.ObjectId.isValid(req.params.customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format",
      });
    }

    const payments = await pricingPlanPayment
      .find({
        customerId: new mongoose.Types.ObjectId(req.params.customerId),
      })
      .sort({ createdAt: -1 });

    console.log("Found payments:", payments.length);

    res.json({
      success: true,
      data: payments || [],
      count: payments ? payments.length : 0,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user payments",
      error: error.message,
    });
  }
});

// Get all payments with filters
router.get("/payments", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      paymentStatus,
      customerId,
      customerEmail,
    } = req.query;

    // Build filter object
    const filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      filter.customerId = new mongoose.Types.ObjectId(customerId);
    }
    if (customerEmail) filter.customerEmail = customerEmail;

    const payments = await pricingPlanPayment
      .find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .exec();

    const count = await pricingPlanPayment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
});

// Get single payment by ID
router.get("/payments/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID format",
      });
    }

    const payment = await pricingPlanPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
});

module.exports = router;