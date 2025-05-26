const mongoose = require("mongoose");

const statusUpdateSchema = new mongoose.Schema(
  {
    applicationStatus: {
      type: String,
      enum: [1, 2, 3, 4, 5, 6, 7],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDb", // Reference to UserDb model
      required: true,
    },
  },
  { timestamps: true }
);

const statusUpdate =
  mongoose.models.statusUpdate ||
  mongoose.model("statusUpdate", statusUpdateSchema);

module.exports = statusUpdate;
