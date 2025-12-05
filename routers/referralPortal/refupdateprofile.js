/**
 * @swagger
 * /referral-portal/profile/personalInformation:
 *   post:
 *     summary: Create or Update Personal Information (Legacy)
 *     description: Creates or updates personal information for the referral portal user. This is a legacy endpoint that uses fullName instead of separate firstName/lastName.
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
 *               fullName:
 *                 type: string
 *                 example: "John Smith"
 *               contactNo:
 *                 type: string
 *                 example: "5551234567"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1995-05-15"
 *               countryCode:
 *                 type: string
 *                 example: "+1"
 *               country:
 *                 type: string
 *                 example: "United States"
 *               city:
 *                 type: string
 *                 example: "New York"
 *               facebook:
 *                 type: string
 *                 example: "https://facebook.com/johnsmith"
 *               instagram:
 *                 type: string
 *                 example: "https://instagram.com/johnsmith"
 *               linkedin:
 *                 type: string
 *                 example: "https://linkedin.com/in/johnsmith"
 *     responses:
 *       200:
 *         description: Personal information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Updated Personal Information"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /referral-portal/profile/updatePersonalInfomation:
 *   patch:
 *     summary: Update Personal Information (Preferred)
 *     description: Updates personal information for the referral portal user with separate firstName/lastName fields and support for profile pictures. This is the preferred endpoint for updating personal info.
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
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Smith"
 *               contactNo:
 *                 type: string
 *                 description: Contact number without country code
 *                 example: "5551234567"
 *               countryCode:
 *                 type: string
 *                 description: Country code stored separately
 *                 example: "+1"
 *               country:
 *                 type: string
 *                 example: "United States"
 *               city:
 *                 type: string
 *                 example: "New York"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1995-05-15"
 *               facebook:
 *                 type: string
 *                 example: "https://facebook.com/johnsmith"
 *               instagram:
 *                 type: string
 *                 example: "https://instagram.com/johnsmith"
 *               linkedin:
 *                 type: string
 *                 example: "https://linkedin.com/in/johnsmith"
 *               profilePictureUrl:
 *                 type: string
 *                 description: URL of the profile picture (stored as profilePicture in DB)
 *                 example: "https://s3.amazonaws.com/bucket/profile.jpg"
 *               coverPhotoUrl:
 *                 type: string
 *                 description: URL of the cover photo (stored as coverPhoto in DB)
 *                 example: "https://s3.amazonaws.com/bucket/cover.jpg"
 *     responses:
 *       200:
 *         description: Personal information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Personal information updated successfully."
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /referral-portal/profile/academicInformation:
 *   post:
 *     summary: Create or Update Academic Information
 *     description: Creates or updates academic information for the referral portal user including current degree, program, university, and semester.
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
 *               currentDegree:
 *                 type: string
 *                 example: "Bachelor's Degree"
 *               program:
 *                 type: string
 *                 example: "Computer Science"
 *               uniName:
 *                 type: string
 *                 example: "Stanford University"
 *               currentSemester:
 *                 type: string
 *                 example: "6th Semester"
 *     responses:
 *       200:
 *         description: Academic information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Updated academic information successfully."
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 refAcademicInformation:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 *   get:
 *     summary: Get Academic Information
 *     description: Retrieves academic information for the authenticated referral portal user.
 *     tags:
 *       - Referral Portal
 *       - Profile
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Academic information retrieved successfully."
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 refAcademicInformation:
 *                   type: object
 *       403:
 *         description: Forbidden - User not logged in.
 *       404:
 *         description: No academic information found for this user.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /referral-portal/profile/englishProficiency:
 *   post:
 *     summary: Create or Update Language Proficiency
 *     description: Creates or updates English language proficiency information for the referral portal user.
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
 *               proficiencyLevel:
 *                 type: string
 *                 example: "Advanced"
 *               proficiencyTest:
 *                 type: string
 *                 example: "IELTS"
 *               proficiencyTestScore:
 *                 type: number
 *                 example: 7.5
 *     responses:
 *       200:
 *         description: English proficiency information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Updated English Proficiency information"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 languageProficiency:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /referral-portal/profile/workExperience:
 *   post:
 *     summary: Create or Update Work Experience
 *     description: Creates or updates work experience information for the referral portal user. Job description is only saved when hasWorkExperience is true.
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
 *               hasWorkExperience:
 *                 type: boolean
 *                 description: Whether user has work experience
 *                 example: true
 *               hasBrandAmbassador:
 *                 type: boolean
 *                 description: Whether user has been a brand ambassador (independent field)
 *                 example: false
 *               jobDescription:
 *                 type: string
 *                 description: Job description (only saved if hasWorkExperience is true)
 *                 example: "Software Engineer at Tech Corp"
 *     responses:
 *       200:
 *         description: Work experience updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Work experience updated successfully."
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 work_Experience:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /referral-portal/profile/paymentinformation:
 *   post:
 *     summary: Create or Update Payment Information
 *     description: Creates or updates payment information for the referral portal user. Supports bank transfer and mobile wallet payment methods with conditional field clearing.
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
 *               preferredPaymentMethod:
 *                 type: string
 *                 enum: [none, bank_transfer, easypaisa, jazzcash, other_wallet]
 *                 description: Payment method selection (determines which fields are saved)
 *                 example: "bank_transfer"
 *               bankAccountTitle:
 *                 type: string
 *                 description: Bank account title (only for bank_transfer)
 *                 example: "John Smith"
 *               bankName:
 *                 type: string
 *                 description: Name of bank (only for bank_transfer)
 *                 example: "Bank of America"
 *               accountNumberIban:
 *                 type: string
 *                 description: Account number or IBAN (only for bank_transfer)
 *                 example: "US12345678901234567890"
 *               mobileWalletNumber:
 *                 type: string
 *                 description: Mobile wallet number (for mobile wallet options)
 *                 example: "+1 555-123-4567"
 *               accountHolderName:
 *                 type: string
 *                 description: Account holder name (for mobile wallet options)
 *                 example: "John Smith"
 *               termsAndAgreement:
 *                 type: boolean
 *                 description: Terms and conditions acceptance
 *                 example: true
 *     responses:
 *       200:
 *         description: Payment information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment information updated successfully."
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 paymentInfo:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /referral-portal/profile/getPaymentInformation:
 *   get:
 *     summary: Get Payment Information
 *     description: Retrieves payment information for the authenticated referral portal user.
 *     tags:
 *       - Referral Portal
 *       - Profile
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment information retrieved successfully."
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     preferredPaymentMethod:
 *                       type: string
 *                     bankAccountTitle:
 *                       type: string
 *                       nullable: true
 *                     bankName:
 *                       type: string
 *                       nullable: true
 *                     accountNumberIban:
 *                       type: string
 *                       nullable: true
 *                     mobileWalletNumber:
 *                       type: string
 *                       nullable: true
 *                     accountHolderName:
 *                       type: string
 *                       nullable: true
 *                     termsAndAgreement:
 *                       type: boolean
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: No payment information found for this user.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /referral-portal/profile/updatePaymentInformation:
 *   patch:
 *     summary: Update Payment Information
 *     description: Updates payment information for the referral portal user with conditional field clearing based on payment method selection.
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
 *               preferredPaymentMethod:
 *                 type: string
 *                 enum: [none, bank_transfer, easypaisa, jazzcash, other_wallet]
 *                 description: |
 *                   Payment method selection:
 *                   - 'bank_transfer': Saves bank fields, clears wallet fields
 *                   - Mobile wallet options: Saves wallet fields, clears bank fields
 *                   - 'none': Clears all payment fields
 *                 example: "bank_transfer"
 *               bankAccountTitle:
 *                 type: string
 *                 example: "John Smith"
 *               bankName:
 *                 type: string
 *                 example: "Bank of America"
 *               accountNumberIban:
 *                 type: string
 *                 example: "US12345678901234567890"
 *               mobileWalletNumber:
 *                 type: string
 *                 example: "+1 555-123-4567"
 *               accountHolderName:
 *                 type: string
 *                 example: "John Smith"
 *     responses:
 *       200:
 *         description: Payment information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment information updated successfully."
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /referral-portal/profile/changePassword:
 *   put:
 *     summary: Change Password
 *     description: Changes the password for the authenticated referral portal user. Requires current password verification.
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
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: User's current password for verification
 *                 example: "OldPassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password to set
 *                 example: "NewSecurePass456"
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully."
 *       400:
 *         description: Bad request - All fields required or current password incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingFields:
 *                       value: "All fields are required."
 *                     incorrectPassword:
 *                       value: "Current password is incorrect."
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
// /routers/referralPortal/refupdateprofile.js
const express = require("express");
const router = express.Router();
const profileController = require("../../controller/refProfileController");
const authenticateRefToken = require("../../middlewares/refAuth");

router.post(
  "/personalInformation",
  authenticateRefToken,
  profileController.personalInfomation
);
router.get(
  "/academicInformation",
  authenticateRefToken,
  profileController.getAcademicInformation
);
router.post(
  "/academicInformation",
  authenticateRefToken,

  profileController.academicInformation
);
router.post(
  "/englishProficiency",
  authenticateRefToken,
  profileController.languageProficiency
);
router.patch(
  "/updatePersonalInfomation",
  authenticateRefToken,
  profileController.updatePersonalInfomation
);

router.post(
  "/workExperience",
  authenticateRefToken,
  profileController.workExperience
);
router.post(
  "/paymentinformation",
  authenticateRefToken,
  profileController.paymentInformation
);
router.put(
  "/changePassword",
  authenticateRefToken,
  profileController.changePassword
);

// **ADDITION: Add GET route for payment information**
router.get(
  "/getPaymentInformation",
  authenticateRefToken,
  profileController.getPaymentInformation
);
// **ADDITION: Add PATCH route for updating payment information**
router.patch(
  "/updatePaymentInformation",
  authenticateRefToken,
  profileController.updatePaymentInformation
);

module.exports = router;
