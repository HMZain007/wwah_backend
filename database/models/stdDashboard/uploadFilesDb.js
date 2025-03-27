const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema({
  name: { type: String, required: true }, // File name
  url: { type: String, required: true }, // File URL (Cloudinary or any other storage)
  public_id: { type: String },
});
const documentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Document name
  files: [fileSchema], // Array of files related to this document
  date: { type: String, required: true }, // Upload date
  isChecked: { type: Boolean, default: false }, // Checkbox status
});
const userFilesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDb", // Reference to UserDb model
      required: true,
      unique: true, // Ensure each user has only one document entry
    },
    documents: [documentSchema], // Array of multiple documents per user
  },
  { timestamps: true }
);
const userFiles =
  mongoose.models.userFiles || mongoose.model("userFiles", userFilesSchema);
// Export the model
module.exports = userFiles;
