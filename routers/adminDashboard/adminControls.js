const express = require("express");
const router = express.Router();
const adminDashboardController = require("../../controller/adminDashboardController");
const authenticateAdminToken = require("../../middlewares/adminAuthMiddleware");

router.post("/createPaymentTrack",
  authenticateAdminToken,
  adminDashboardController.createPaymentTrack);
router.get("/getPayments/:studentid",
  authenticateAdminToken,
  adminDashboardController.getPayments);
router.put(
  "/updatePaymentStatus",
   authenticateAdminToken,
  adminDashboardController.updatePaymentStatus
);
router.put(
  "/updatePayment",
   authenticateAdminToken,
  adminDashboardController.updatePayment
);
// router.delete(
//   "/deletePayment",
//   adminDashboardController.deletePayment
// );
router.get(
  "/getPaymentStats",
  authenticateAdminToken,
  adminDashboardController.getPaymentStats
);

module.exports = router;
