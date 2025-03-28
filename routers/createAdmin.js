const express = require("express");
const bcrypt = require("bcryptjs");
const UserDb = require("../database/models/UserDb");
const authenticateToken = require("../middlewares/authMiddleware");

const createAdminRoute = express.Router();
createAdminRoute.post(
  "/",
  async (req, res) => {
    try {
      console.log("Received request:", req.body); // Debugging log

      const { email, password, name } = req.body;

      // Check if admin already exists
      const existingAdmin = await UserDb.findOne({ email, role: "admin" });
      if (existingAdmin) {
        console.log("Admin already exists:", existingAdmin);
        return res.status(400).json({ message: "Admin already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new admin
      const newAdmin = new UserDb({
        email,
        password: hashedPassword,
        name,
        role: "admin",
      });

      await newAdmin.save();
      console.log("New admin created:", newAdmin);

      res.status(201).json({
        message: "Admin created successfully",
        adminId: newAdmin._id,
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({
        message: "Error creating admin",
        error: error.message,
      });
    }
  }
);
module.exports = createAdminRoute;
