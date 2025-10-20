const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 6 },
  },
  {
    timestamps: true,
  }
);

const admin =
  mongoose.models.admin || mongoose.model("admin", userSchema);
module.exports = admin;