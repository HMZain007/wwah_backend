/**
 * @swagger
 * /refprofile/profile:
 *   get:
 *     summary: Get Complete Profile Information
 *     description: Retrieves complete profile information for the authenticated referral portal user including personal details, academic info, work experience, and payment information. OTP fields are excluded from the response.
 *     tags:
 *       - Referral Portal
 *       - Profile
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: User personal information (excluding OTP fields)
 *                   properties:
 *                     _id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     contactNo:
 *                       type: string
 *                     countryCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                     city:
 *                       type: string
 *                     dob:
 *                       type: string
 *                       format: date
 *                     profilePicture:
 *                       type: string
 *                     coverPhoto:
 *                       type: string
 *                     facebook:
 *                       type: string
 *                     instagram:
 *                       type: string
 *                     linkedin:
 *                       type: string
 *                     referralCode:
 *                       type: string
 *                     totalReferrals:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 AcademmicInfo:
 *                   type: object
 *                   nullable: true
 *                   description: Academic information
 *                   properties:
 *                     currentDegree:
 *                       type: string
 *                     program:
 *                       type: string
 *                     uniName:
 *                       type: string
 *                     currentSemester:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 paymentInfo:
 *                   type: object
 *                   nullable: true
 *                   description: Payment information
 *                   properties:
 *                     preferredPaymentMethod:
 *                       type: string
 *                     bankAccountTitle:
 *                       type: string
 *                     bankName:
 *                       type: string
 *                     accountNumberIban:
 *                       type: string
 *                     mobileWalletNumber:
 *                       type: string
 *                     accountHolderName:
 *                       type: string
 *                     termsAndAgreement:
 *                       type: boolean
 *                 workExp:
 *                   type: object
 *                   nullable: true
 *                   description: Work experience information
 *                   properties:
 *                     hasWorkExperience:
 *                       type: boolean
 *                     hasBrandAmbassador:
 *                       type: boolean
 *                     jobDescription:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found Why"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

/**
 * @swagger
 * /refprofile/profile/data:
 *   get:
 *     summary: Get User Data with All Related Information
 *     description: Retrieves comprehensive user data including personal information, academic details, work experience, and payment information for the authenticated referral portal user.
 *     tags:
 *       - Referral Portal
 *       - Profile
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Data Fetch"
 *                 user:
 *                   type: object
 *                   properties:
 *                     personalInfo:
 *                       type: object
 *                       description: Personal user information
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         contactNo:
 *                           type: string
 *                         countryCode:
 *                           type: string
 *                         country:
 *                           type: string
 *                         city:
 *                           type: string
 *                         dob:
 *                           type: string
 *                           format: date
 *                         profilePicture:
 *                           type: string
 *                         coverPhoto:
 *                           type: string
 *                         facebook:
 *                           type: string
 *                         instagram:
 *                           type: string
 *                         linkedin:
 *                           type: string
 *                         referralCode:
 *                           type: string
 *                         totalReferrals:
 *                           type: integer
 *                     academic:
 *                       type: object
 *                       nullable: true
 *                       description: Academic information
 *                       properties:
 *                         currentDegree:
 *                           type: string
 *                         program:
 *                           type: string
 *                         uniName:
 *                           type: string
 *                         currentSemester:
 *                           type: string
 *                     work:
 *                       type: object
 *                       nullable: true
 *                       description: Work experience
 *                       properties:
 *                         hasWorkExperience:
 *                           type: boolean
 *                         hasBrandAmbassador:
 *                           type: boolean
 *                         jobDescription:
 *                           type: string
 *                           nullable: true
 *                     payment:
 *                       type: object
 *                       nullable: true
 *                       description: Payment information
 *                       properties:
 *                         preferredPaymentMethod:
 *                           type: string
 *                         bankAccountTitle:
 *                           type: string
 *                         bankName:
 *                           type: string
 *                         accountNumberIban:
 *                           type: string
 *                         mobileWalletNumber:
 *                           type: string
 *                         accountHolderName:
 *                           type: string
 *                         termsAndAgreement:
 *                           type: boolean
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /refprofile/profile/update:
 *   patch:
 *     summary: Update Multiple Profile Sections
 *     description: Updates multiple sections of the user's profile in a single request. Supports updating personal info, academic info, work experience, and payment information with upsert capability.
 *     tags:
 *       - Referral Portal
 *       - Profile
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 description: Personal information to update
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     example: "John"
 *                   lastName:
 *                     type: string
 *                     example: "Smith"
 *                   contactNo:
 *                     type: string
 *                     example: "5551234567"
 *                   countryCode:
 *                     type: string
 *                     example: "+1"
 *                   country:
 *                     type: string
 *                     example: "United States"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   dob:
 *                     type: string
 *                     format: date
 *                     example: "1995-05-15"
 *                   facebook:
 *                     type: string
 *                   instagram:
 *                     type: string
 *                   linkedin:
 *                     type: string
 *                   profilePicture:
 *                     type: string
 *                   coverPhoto:
 *                     type: string
 *               AcademicInformation:
 *                 type: object
 *                 description: Academic information to update
 *                 properties:
 *                   currentDegree:
 *                     type: string
 *                     example: "Bachelor's Degree"
 *                   program:
 *                     type: string
 *                     example: "Computer Science"
 *                   uniName:
 *                     type: string
 *                     example: "Stanford University"
 *                   currentSemester:
 *                     type: string
 *                     example: "6th Semester"
 *               paymentInformation:
 *                 type: object
 *                 description: Payment information to update
 *                 properties:
 *                   preferredPaymentMethod:
 *                     type: string
 *                     enum: [none, bank_transfer, easypaisa, jazzcash, other_wallet]
 *                     example: "bank_transfer"
 *                   bankAccountTitle:
 *                     type: string
 *                     example: "John Smith"
 *                   bankName:
 *                     type: string
 *                     example: "Bank of America"
 *                   accountNumberIban:
 *                     type: string
 *                     example: "US12345678901234567890"
 *                   mobileWalletNumber:
 *                     type: string
 *                     example: "+1 555-123-4567"
 *                   accountHolderName:
 *                     type: string
 *                     example: "John Smith"
 *                   termsAndAgreement:
 *                     type: boolean
 *                     example: true
 *               workExperience:
 *                 type: object
 *                 description: Work experience to update
 *                 properties:
 *                   hasWorkExperience:
 *                     type: boolean
 *                     example: true
 *                   hasBrandAmbassador:
 *                     type: boolean
 *                     example: false
 *                   jobDescription:
 *                     type: string
 *                     example: "Software Engineer at Tech Corp"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 embeddingUpdate:
 *                   type: string
 *                   description: Embedding update status for frontend compatibility
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   description: Updated profile sections
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Updated personal information
 *                     academic:
 *                       type: object
 *                       description: Updated academic information
 *                     payment:
 *                       type: object
 *                       description: Updated payment information
 *                     work:
 *                       type: object
 *                       description: Updated work experience
 *       400:
 *         description: Bad request - No update data provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No update data provided"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to update profile"
 *                 error:
 *                   type: string
 *                 embeddingUpdate:
 *                   type: string
 *                   example: "error"
 */

const express = require("express");
const router = express.Router();
const refAcademicInfo = require("../../database/models/refPortal/refAcademicInfo");
const refWorkExperience = require("../../database/models/refPortal/refWorkExperience");
const refPaymentInfo = require("../../database/models/refPortal/refPaymentInformation");
const refUserDb = require("../../database/models/refPortal/refuser");
const authenticateRefToken = require("../../middlewares/refAuth");

router.get("/", authenticateRefToken, async (req, res) => {
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
    // console.log(AcademmicInfo, "user from backend");
    if (!user) {
      res.status(404).json({ message: "User not found Why" });
    } else res.json({ user, AcademmicInfo, paymentInfo, workExp });
  } catch (error) {
    console.error("Error fetching profile in backend:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/data", authenticateRefToken, async (req, res) => {
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
router.patch("/update", authenticateRefToken, async (req, res) => {
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
