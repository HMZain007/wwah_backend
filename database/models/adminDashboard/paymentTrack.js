const mongoose = require("mongoose");
const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDb",
    },
    transactionName: {
      type: String,
    },
    transactionId: {
      type: String,

    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
