const express = require('express')
const router = express.Router();
const profileController = require('../controller/profileController')
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/academicInformation', authenticateToken, profileController.getAcademicInformation)

router.post('/personal-Information', authenticateToken, profileController.personalInfomation)
router.post('/academic-Information', authenticateToken, profileController.academicInformation)
router.post('/english-proficiency', authenticateToken, profileController.languageProficiency)
router.post('/userPreference', authenticateToken, profileController.userPreference)
router.post(
    "/workExperience",
    authenticateToken,
    profileController.workExperience
);
module.exports = router;
