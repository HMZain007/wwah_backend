// const express = require("express");
// const UserDb = require("../../database/models/UserDb");
// const applicationInfo = require("../../database/models/stdDashboard/applicationInfoDb");
// const basicInfo = require("../../database/models/stdDashboard/basicInfoDb");
// const router = express.Router();
// router.get("/", async (req, res) => {
//   try {
//     const [Users, applications, basics] = await Promise.all([
//       UserDb.find({ role: { $ne: "admin" } }),
//       applicationInfo.find(),
//       basicInfo.find(),
//     ]);
//     res.json({ Users, applications, basics });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// module.exports = router;

const express = require("express");
const UserDb = require("../../database/models/UserDb");
const applicationInfo = require("../../database/models/stdDashboard/applicationInfoDb");
const basicInfo = require("../../database/models/stdDashboard/basicInfoDb");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { id } = req.query; // Get user ID from query params

    if (id) {
      // Fetch a single user by ID
      const user = await UserDb.findOne({ _id: id, role: { $ne: "admin" } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({ user }); // Return user object instead of array
    }

    // Fetch all users when no ID is provided
    const [Users, applications, basics] = await Promise.all([
      UserDb.find({ role: { $ne: "admin" } }),
      applicationInfo.find(),
      basicInfo.find(),
    ]);

    res.json({ Users, applications, basics });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
