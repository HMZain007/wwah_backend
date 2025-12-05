/**
 * @swagger
 * tags:
 *   - name: Profile Update Auth User
 *     description: Routes for updating user profile information
 */

/**
 * @swagger
 * /updateprofile/academicInformation:
 *   get:
 *     summary: Get academic information
 *     description: Fetches the academic information of the authenticated user.
 *     tags: [Profile Update Auth User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic information retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /updateprofile/personal-Information:
 *   post:
 *     summary: Add personal information
 *     description: Adds personal information for the authenticated user.
 *     tags: [Profile Update Auth User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               firstName: "John"
 *               lastName: "Doe"
 *               phone: "1234567890"
 *               nationality: "Pakistan"
 *     responses:
 *       200:
 *         description: Personal information saved successfully
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /updateprofile/academic-Information:
 *   post:
 *     summary: Add academic information
 *     description: Saves academic information for the user.
 *     tags: [Profile Update Auth User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               studyLevel: "Bachelors"
 *               gradeType: "CGPA"
 *               grade: "3.5"
 *               majorSubject: "Computer Science"
 *     responses:
 *       200:
 *         description: Academic information saved
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /updateprofile/english-proficiency:
 *   post:
 *     summary: Add English proficiency details
 *     description: Saves language proficiency details for the user.
 *     tags: [Profile Update Auth User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               testName: "IELTS"
 *               score: "6.5"
 *     responses:
 *       200:
 *         description: English proficiency saved
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /updateprofile/update-personal-infomation:
 *   patch:
 *     summary: Update personal information
 *     description: Updates the existing personal information of the user.
 *     tags: [Profile Update Auth User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               phone: "9876543210"
 *               nationality: "UAE"
 *     responses:
 *       200:
 *         description: Personal information updated
 *       400:
 *         description: Invalid fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /updateprofile/workExperience:
 *   post:
 *     summary: Add work experience
 *     description: Saves the user's work experience.
 *     tags: [Profile Update Auth User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               company: "Tech Solutions"
 *               years: 2
 *               role: "Software Developer"
 *     responses:
 *       200:
 *         description: Work experience saved
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /updateprofile/change-password:
 *   put:
 *     summary: Change password
 *     description: Allows the authenticated user to change their password.
 *     tags: [Profile Update Auth User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               oldPassword: "oldpassword123"
 *               newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

const express = require("express");
const router = express.Router();
const profileController = require("../controller/profileController");
const authenticateToken = require("../middlewares/authMiddleware");
// const authenticateToken = require("../middlewares/authMiddleware");

router.get(
  "/academicInformation",
  authenticateToken,
  profileController.getAcademicInformation
);
router.post(
  "/personal-Information",
  authenticateToken,
  profileController.personalInfomation
);
router.post(
  "/academic-Information",
  authenticateToken,
  profileController.academicInformation
);
router.post(
  "/english-proficiency",
  authenticateToken,
  profileController.languageProficiency
);
router.patch(
  "/update-personal-infomation",
  authenticateToken,
  profileController.updatePersonalInfomation
);
router.post(
  "/workExperience",
  authenticateToken,
  profileController.workExperience
);
router.put(
  "/change-password",
  authenticateToken,
  profileController.changePassword
);

module.exports = router;
