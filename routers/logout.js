/** 

  *@swagger
  * /logout:
  *   get:
  *     summary: Logout
  *     description: This route is used to logout the user.
  *     tags: [Logout]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  */
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // Determine environment
  const isProduction = (process.env.NODE_ENV || "production").trim() === "production";
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: isProduction, // only true on HTTPS
    sameSite: isProduction ? "none" : "lax", // allow cross-site cookies in prod, safe in dev
    path: "/", // ensure it clears on all routes
  });

  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
