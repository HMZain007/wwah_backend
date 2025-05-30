const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middlewares/authMiddleware");
const stdDashboardController = require("../../controller/StdDashboardController");
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
router.get("/getStatusUpdate/:studentid",stdDashboardController.getStatusUpdate);
router.get(
  "/getStatusUpdateStudent",
  authenticateToken,
  stdDashboardController.getStatusUpdateStudent
);

module.exports = router;
