// /routers/referralPortal/refupdateprofile.js
const express = require("express");
const router = express.Router();
const profileController = require("../../controller/refProfileController");
const authenticateRefToken = require("../../middlewares/refAuth");
// const authenticateRefToken = require("../../middlewares/authMiddleware");

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
