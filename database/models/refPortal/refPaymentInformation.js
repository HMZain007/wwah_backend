const mongoose = require("mongoose");

const PaymentInformationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRefDb", // Reference to UserRefDb model to link refPaymentInformation with user.
    },
    preferredPaymentMethod: {
      type: String,
      enum: [
        "none",
        "bank_transfer",
        "jazzcash",
        "easypaisa",
        "upaisa",
        "sadapay",
        "nayapay",
      ],
      required: true,
      default: "none",
    },
    // Bank Transfer Fields
    bankAccountTitle: {
      type: String,
    },
    bankName: {
      type: String,
    },
    accountNumberIban: {
      type: String,
    },

    // Mobile Wallet Fields
    mobileWalletNumber: {
      type: String,
    },
    accountHolderName: {
      type: String,
    },
    termsAndAgreement: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const refPaymentInformation =
  mongoose.models.refPaymentInformation ||
  mongoose.model("refPaymentInformation", PaymentInformationSchema);

// Export the model
module.exports = refPaymentInformation;
