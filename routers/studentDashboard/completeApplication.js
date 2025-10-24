const express = require("express");
const router = express.Router();
// const authenticateToken = require("../../middlewares/authMiddleware");
const stdDashboardController = require("../../controller/StdDashboardController");
const authenticateToken = require("../../middlewares/authMiddleware");

// Existing routes
router.post(
  "/basicInformation",
  authenticateToken,
  stdDashboardController.basicInformation
);

router.get(
  "/getBasicInformation",
  authenticateToken,
  stdDashboardController.getBasicInformation
);

router.post(
  "/applicationInformation",
  authenticateToken,
  stdDashboardController.applicationInformation
);

router.get(
  "/getApplicationInformation",
  authenticateToken,
  stdDashboardController.getApplicationInformation
);

router.get(
  "/getDocuments",
  authenticateToken,
  stdDashboardController.getDocuments
);

router.post(
  "/uploadDocument",
  authenticateToken,
  stdDashboardController.uploadDocument
);

router.delete(
  "/deleteDocument",
  authenticateToken,
  stdDashboardController.deleteDocument
);

router.post(
  "/createStatusUpdate",
  authenticateToken,
  stdDashboardController.createStatusUpdate
);

router.put(
  "/updateStatus",
  authenticateToken,
  stdDashboardController.updateStatus
);

router.get(
  "/getStatusUpdate/:studentid",
  stdDashboardController.getStatusUpdate
);

router.get(
  "/getStatusUpdateStudent",
  authenticateToken,
  stdDashboardController.getStatusUpdateStudent
);

// NEW ROUTES FOR FIELD-SPECIFIC UPDATES
router.patch(
  "/updateBasicInfoField",
  authenticateToken,
  stdDashboardController.updateBasicInfoField
);

router.patch(
  "/updateApplicationInfoField",
  authenticateToken,
  stdDashboardController.updateApplicationInfoField
);

router.patch(
  "/updateFamilyMembers",
  authenticateToken,
  stdDashboardController.updateFamilyMembers
);

router.patch(
  "/updateEducationalBackground",
  authenticateToken,
  stdDashboardController.updateEducationalBackground
);

router.patch(
  "/updateWorkExperience",
  authenticateToken,
  stdDashboardController.updateWorkExperience
);

router.post(
  "/finalSubmission",
  authenticateToken,
  stdDashboardController.finalSubmission
);

module.exports = router;
