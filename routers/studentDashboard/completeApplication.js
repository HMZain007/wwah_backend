const express = require("express");
const router = express.Router();
const stdDashboardController = require("../../controller/StdDashboardController");
const authenticateToken = require("../../middlewares/authMiddleware");
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
  "/getStatusUpdate",
  stdDashboardController.getStatusUpdate
);
module.exports = router;
