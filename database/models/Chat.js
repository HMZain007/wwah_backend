// models/Chat.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: { type: String, enum: ["user", "admin"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, unique: true },
    messages: [MessageSchema],
});

module.exports = mongoose.model("Chat", ChatSchema);