// const express = require("express");
// const router = express.Router();
// const authenticateToken = require("../../middlewares/authMiddleware");
// const adminDashboardController = require("../../controller/adminDashboardController");

// router.post(
//   "/createPaymentTrack",
//   authenticateToken,
//   adminDashboardController.createPaymentTrack
// );
// router.get(
//   "/getPayments/:studentid",
//   adminDashboardController.getPayments
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middlewares/authMiddleware");
const adminDashboardController = require("../../controller/adminDashboardController");

router.post("/createPaymentTrack", adminDashboardController.createPaymentTrack);
router.get("/getPayments/:studentid", adminDashboardController.getPayments);
router.put(
  "/updatePaymentStatus",
  adminDashboardController.updatePaymentStatus
);
router.put(
  "/updatePayment",
  adminDashboardController.updatePayment
);
// router.delete(
//   "/deletePayment",
//   adminDashboardController.deletePayment
// );
router.get(
  "/getPaymentStats",
  authenticateToken,
  adminDashboardController.getPaymentStats
);

module.exports = router;
