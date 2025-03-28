const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const languageProficiencyDb = require("../database/models/languageProficiency");
const academicInfoDb = require("../database/models/userAcademicInfoDb");
const userPeferenceDb = require("../database/models/userPreference");
const UserDb = require("../database/models/UserDb");
const workExperience = require("../database/models/workExperience");

router.get("/", authenticateToken, async (req, res) => {  
       try {
    const user = await UserDb.findById(req.user.id).select(
      "-otp -otpExpiration"
    );
    const AcademmicInfo = await academicInfoDb.findOne({
      user: req.user.id,
    });
    const LanguageProf = await languageProficiencyDb.findOne({
      user: req.user.id,
    });
    const UserPref = await userPeferenceDb.findOne({
      user: req.user.id,
    });
    const workExp = await workExperience.findOne({
      user: req.user.id,
    });
        console.log(AcademmicInfo, "user from backend");
         if (!user ) {
           res.status(404).json({ message: "User not found Why" });
         }
         else res.json({ user, AcademmicInfo, LanguageProf, UserPref, workExp });
                
         
  } catch (error) {
    console.error("Error fetching profile in backend:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/data", authenticateToken, async (req, res) => {
  const id = req.user.id;
  try {
    const personalInfo = await UserDb.findById(id);
    const langPro = await languageProficiencyDb.findOne({ user: id });
    const majorSubject = await academicInfoDb.findOne({ user: id });
    const userPreference = await userPeferenceDb.findOne({ user: id });
    res.json({
      message: "Data Fetch",
      user: { personalInfo, majorSubject, langPro, userPreference },
    });
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
