const express = require("express");
const router = express.Router();
const refAcademicInfo = require("../../database/models/refPortal/refAcademicInfo");
const refWorkExperience = require("../../database/models/refPortal/refWorkExperience");
const refPaymentInfo = require("../../database/models/refPortal/refPaymentInformation");
const refUserDb = require("../../database/models/refPortal/refuser");
const authenticateToken = require("../../middlewares/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await refUserDb
      .findById(req.user.id)
      .select("-otp -otpExpiration");
    const AcademmicInfo = await refAcademicInfo.findOne({
      user: req.user.id,
    });
    const paymentInfo = await refPaymentInfo.findOne({
      user: req.user.id,
    });
    const workExp = await refWorkExperience.findOne({
      user: req.user.id,
    });
    console.log(AcademmicInfo, "user from backend");
    if (!user) {
      res.status(404).json({ message: "User not found Why" });
    } else res.json({ user, AcademmicInfo, paymentInfo, workExp });
  } catch (error) {
    console.error("Error fetching profile in backend:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/data", authenticateToken, async (req, res) => {
  const id = req.user.id;
  try {
    const personalInfo = await refUserDb.findById(id);
    if (!personalInfo) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const academic = await refAcademicInfo.findOne({ user: id });
    const work = await refWorkExperience.findOne({ user: id });
    const payment = await refPaymentInfo.findOne({ user: id });
    res.json({
      message: "Data Fetch",
      user: { personalInfo, academic, work, payment },
    });
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
router.patch("/update", authenticateToken, async (req, res) => {
  const id = req.user.id;
  const updateData = req.body;

  try {
    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    let updateResults = {};

    // Update basic user info
    if (updateData.user) {
      const updatedBasicInfo = await refUserDb.findByIdAndUpdate(
        id,
        { $set: updateData.user },
        { new: true, runValidators: true }
      );

      if (!updatedBasicInfo) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      updateResults.user = updatedBasicInfo;
    }

    // Update Academic Information
    if (updateData.AcademicInformation) {
      const updatedAcademic = await refAcademicInfo.findOneAndUpdate(
        { user: id },
        { $set: { ...updateData.AcademicInformation, updatedAt: new Date() } },
        { new: true, runValidators: true, upsert: true }
      );
      updateResults.academic = updatedAcademic;
    }

    // Update Payment Information
    if (updateData.paymentInformation) {
      const updatedPayment = await refPaymentInfo.findOneAndUpdate(
        { user: id },
        { $set: { ...updateData.paymentInformation, updatedAt: new Date() } },
        { new: true, runValidators: true, upsert: true }
      );
      updateResults.payment = updatedPayment;
    }

    // Update Work Experience
    if (updateData.workExperience) {
      const updatedWork = await refWorkExperience.findOneAndUpdate(
        { user: id },
        { $set: { ...updateData.workExperience, updatedAt: new Date() } },
        { new: true, runValidators: true, upsert: true }
      );
      updateResults.work = updatedWork;
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      embeddingUpdate: "success", // For frontend store compatibility
      data: updateResults,
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
      embeddingUpdate: "error",
    });
  }
});
module.exports = router;
