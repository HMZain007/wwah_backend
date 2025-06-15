// models/Chat.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "admin"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  file: {
    name: { type: String },
    url: { type: String }, // S3 URL
    type: { type: String },
    size: { type: Number },
    s3Key: { type: String }, // S3 object key for deletion and pre-signed URLs
  },
});

const ChatSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, unique: true },
    messages: [MessageSchema],
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Chat", ChatSchema);
