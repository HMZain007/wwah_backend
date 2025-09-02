const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRefDb",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    referrals: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Requested"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to prevent duplicate month entries for same user
commissionSchema.index({ user: 1, month: 1 }, { unique: true });

const Commission =
  mongoose.models.Commission || mongoose.model("Commission", commissionSchema);

module.exports = Commission;
