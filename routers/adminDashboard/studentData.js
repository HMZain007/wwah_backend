// const express = require("express");
// const UserDb = require("../../database/models/UserDb");
// const applicationInfo = require("../../database/models/stdDashboard/applicationInfoDb");
// const basicInfo = require("../../database/models/stdDashboard/basicInfoDb");
// const userFiles = require("../../database/models/stdDashboard/uploadFilesDb");
// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const { id } = req.query; // Get user ID from query params

//     if (id) {
//       // Fetch a single user by ID
//       const user = await UserDb.findOne({ _id: id, role: { $ne: "admin" } });

//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       return res.json({ user }); // Return user object instead of array
//     }

//     // Fetch all users when no ID is provided
//     const [Users, applications, basics, documents] = await Promise.all([
//       UserDb.find({ role: { $ne: "admin" } }),
//       applicationInfo.find(),
//       basicInfo.find(),
//       userFiles.find(),
//     ]);

//     res.json({ Users, applications, basics, documents });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// module.exports = router;
// routers/adminDashboard/studentData.js
const express = require("express");
const UserDb = require("../../database/models/UserDb");
const applicationInfo = require("../../database/models/stdDashboard/applicationInfoDb");
const basicInfo = require("../../database/models/stdDashboard/basicInfoDb");
const userFiles = require("../../database/models/stdDashboard/uploadFilesDb");
const authenticateAdminToken = require("../../middlewares/adminAuthMiddleware");
const router = express.Router();

// router.get("/", authenticateAdminToken, async (req, res) => {
//   try {
//     const { id } = req.query; // Get user ID from query params

//     if (id) {
//       // Fetch a single user by ID
//       const user = await UserDb.findOne({ _id: id, role: { $ne: "admin" } });

//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       return res.json({ user }); // Return user object instead of array
//     }

//     // Fetch all users when no ID is provided - SORTED BY CREATION DATE (newest first)
//     const [Users, applications, basics, documents] = await Promise.all([
//       UserDb.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }), // Sort by createdAt descending (newest first)
//       applicationInfo.find(),
//       basicInfo.find(),
//       userFiles.find(),
//     ]);

//     res.json({ Users, applications, basics, documents });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
// routers/adminDashboard/studentData.js
router.get("/", authenticateAdminToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const user = await UserDb.findOne({ _id: id, role: { $ne: "admin" } });
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      return res.json({ success: true, user });
    }

    const [Users, applications, basics, documents] = await Promise.all([
      UserDb.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }),
      applicationInfo.find(),
      basicInfo.find(),
      userFiles.find(),
    ]);

    res.json({ 
      success: true,
      Users, 
      applications, 
      basics, 
      documents 
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    // Return JSON, not HTML
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
module.exports = router;
