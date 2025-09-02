const express = require("express");
const router = express.Router();
const profileController = require("../../controller/refProfileController");
const authenticateToken = require("../../middlewares/authMiddleware");

router.post(
  "/personalInformation",
  authenticateToken,
  profileController.personalInfomation
);
router.get(
  "/academicInformation",
  authenticateToken,
  profileController.getAcademicInformation      
);
router.post(
  "/academicInformation",
  authenticateToken,
  profileController.academicInformation
);
router.post(
  "/englishProficiency",
  authenticateToken,
  profileController.languageProficiency
);
router.patch(
  "/updatePersonalInfomation",
  authenticateToken,
  profileController.updatePersonalInfomation
);

router.post(
  "/workExperience",
  authenticateToken,
  profileController.workExperience
);
router.post(
  "/paymentinformation",
  authenticateToken,
  profileController.paymentInformation
);
router.put(
  "/changePassword",
  authenticateToken,
  profileController.changePassword
);

// **ADDITION: Add GET route for payment information**
router.get(
  "/getPaymentInformation",
  authenticateToken,
  profileController.getPaymentInformation
);
// **ADDITION: Add PATCH route for updating payment information**
router.patch(
  "/updatePaymentInformation",
  authenticateToken,
  profileController.updatePaymentInformation
);


module.exports = router;
