const express = require('express');
const router = express.Router();
const userSuccessDb = require('../models/SuccessChance');
const authenticateToken = require("../middlewares/authMiddleware");
const UserDb = require("../database/models/UserDb");

router.post("/add", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const {
            studyLevel,
            gradetype,
            grade,
            dateOfBirth,
            nationality,
            majorSubject,
            livingCosts,
            tuitionFee,
            languageProficiency,
            workExperience,
            studyPreferenced
        } = req.body;

        const newEntry = new userSuccessDb({
            userId,
            studyLevel,
            gradetype,
            grade,
            dateOfBirth,
            nationality,
            majorSubject,
            livingCosts,
            tuitionFee,
            languageProficiency,
            workExperience,
            studyPreferenced
        });

        const saved = await newEntry.save();
        res.status(201).json({ success: true, data: saved });

    } catch (error) {
        console.error("Error saving success chance data:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
router.patch("/update", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Find the latest document for this user
        const entry = await userSuccessDb.findOne({ userId });

        if (!entry) {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

        // Loop over each key in req.body and update the entry
        Object.keys(req.body).forEach(key => {
            entry[key] = req.body[key];
        });

        const updated = await entry.save();

        res.status(200).json({ success: true, data: updated });

    } catch (error) {
        console.error("Error updating success chance data:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
router.get("/get", authenticateToken, async (req, res) => {
    const id = req.user.id;
    try {
        const userSuccessData = await userSuccessDb.findOne({ userId: id });
        res.json({
            message: "Data Fetch",
            userSuccessData,
            success: true
        });
    } catch (error) {
        console.error("❌ Error fetching user data:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
            success: false
        });
    }
}
);

module.exports = router;
