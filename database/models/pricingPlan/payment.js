const mongoose = require("mongoose");

const pricingPlanPaymentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDb", // Assuming a User model exists
      required: true, // Ensure the preference is tied to a user
      index: true
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    currency: {
      type: String,
      required: true,
      default: 'USD'
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
    },

    customerMobile: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    orderDescription: {
      type: String,
      default: "",
    },

    // Payment Method
    paymentMethod: {
      type: String,
      enum: ['CARD', 'CREDIT_CARD', 'MOBILE_WALLET', 'BANK_TRANSFER'],
      default: 'CARD',
      index: true
    },

    // Payment Status
    paymentStatus: {
      type: String,
      enum: [
        'PENDING',
        'PAID',
        'COMPLETED',
        'UNPAID',
        'CANCELLED',
        'EXPIRED',
        'FAILED',
        'REJECTED',
        'REFUNDED',
        'VERIFIED'
      ],
      default: 'PENDING',
      index: true
    },

    // ✅ MANUAL PAYMENT: Transaction ID
    transactionId: {
      type: String,
      sparse: true, // Only for manual payments
      index: true
    },

    // ✅ S3 RECEIPT STORAGE (replaces receiptPath)
    receiptUrl: {
      type: String,
      required: false,
      // S3 public URL: 'https://bucket-name.s3.region.amazonaws.com/path/to/receipt.jpg'
    },

    receiptKey: {
      type: String,
      required: false,
      // S3 key: 'payment-receipts/2025/01/receipt_john_doe_TXN123_1234567890.jpg'
    },

    receiptFileName: {
      type: String,
      required: false,
      // Original filename
    },

    receiptMimeType: {
      type: String,
      required: false,
      // MIME type: 'image/jpeg', 'image/png', 'application/pdf'
    },

    receiptSize: {
      type: Number,
      required: false,
      // File size in bytes
    },

    // ✅ BACKWARD COMPATIBILITY: Keep old receiptPath field
    receiptPath: {
      type: String,
      required: false,
      // Deprecated: Use receiptUrl instead
    },

    // ✅ VERIFICATION FIELDS (for manual payments)
    verifiedAt: {
      type: Date,
      default: null
    },

    verifiedBy: {
      type: String, // Admin ID who verified
      default: null
    },

    // ✅ PAYPRO INTEGRATION (for card payments)
    payproOrderId: {
      type: String,
      sparse: true
    },

    paymentUrl: {
      type: String,
      required: false
    },

    // ✅ PAYMENT DETAILS (products, paypro response, etc.)
    paymentDetails: {
      type: Object,
      default: {},
      // Structure:
      // {
      //   products: [...],
      //   paymentType: 'ONLINE' | 'MANUAL',
      //   payproResponse: {...},
      //   submittedAt: Date,
      //   verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED',
      //   verificationNotes: String,
      //   paymentMethodDetails: {
      //     type: String,
      //     transactionId: String
      //   }
      // }
    },

    // ✅ WEBHOOK DATA (for PayPro callbacks)
    webhookData: {
      type: Object,
      default: {}
    },

    // ✅ PAID AT (timestamp when payment completed)
    paidAt: {
      type: Date,
      default: null,
    },

  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// ================================
// INDEXES FOR PERFORMANCE
// ================================
pricingPlanPaymentSchema.index({ createdAt: -1 });
pricingPlanPaymentSchema.index({ customerId: 1, createdAt: -1 });
pricingPlanPaymentSchema.index({ paymentStatus: 1, createdAt: -1 });
pricingPlanPaymentSchema.index({ paymentMethod: 1, paymentStatus: 1 });
pricingPlanPaymentSchema.index({ transactionId: 1 }, { sparse: true });

// ================================
// VIRTUAL FIELDS
// ================================
pricingPlanPaymentSchema.virtual('isManualPayment').get(function () {
  return this.paymentDetails?.paymentType === 'MANUAL' ||
    this.paymentMethod === 'MOBILE_WALLET' ||
    this.paymentMethod === 'BANK_TRANSFER';
});

pricingPlanPaymentSchema.virtual('isVerified').get(function () {
  return this.paymentStatus === 'VERIFIED' ||
    this.paymentStatus === 'PAID' ||
    this.paymentStatus === 'COMPLETED';
});

pricingPlanPaymentSchema.virtual('isPending').get(function () {
  return this.paymentStatus === 'PENDING' ||
    this.paymentStatus === 'PENDING';
});

pricingPlanPaymentSchema.virtual('hasReceipt').get(function () {
  return !!(this.receiptUrl || this.receiptPath);
});

// ================================
// INSTANCE METHODS
// ================================

// Get receipt size in human-readable format
pricingPlanPaymentSchema.methods.getReceiptSizeFormatted = function () {
  if (!this.receiptSize) return 'N/A';

  const kb = this.receiptSize / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

// Check if payment is expired (for card payments)
pricingPlanPaymentSchema.methods.isExpired = function () {
  if (this.paymentMethod !== 'CARD' && this.paymentMethod !== 'CREDIT_CARD') {
    return false;
  }

  // Assuming 24 hours expiry
  const expiryTime = new Date(this.createdAt);
  expiryTime.setHours(expiryTime.getHours() + 24);

  return new Date() > expiryTime && this.paymentStatus === 'PENDING';
};

// Mark payment as paid
pricingPlanPaymentSchema.methods.markAsPaid = function () {
  this.paymentStatus = 'PAID';
  this.paidAt = new Date();
  return this.save();
};

// Verify manual payment
pricingPlanPaymentSchema.methods.verify = function (adminId, notes) {
  this.paymentStatus = 'VERIFIED';
  this.verifiedAt = new Date();
  this.verifiedBy = adminId;
  this.paidAt = new Date();

  if (this.paymentDetails) {
    this.paymentDetails.verificationStatus = 'APPROVED';
    if (notes) {
      this.paymentDetails.verificationNotes = notes;
    }
  }

  return this.save();
};

// Reject manual payment
pricingPlanPaymentSchema.methods.reject = function (adminId, reason) {
  this.paymentStatus = 'REJECTED';
  this.verifiedAt = new Date();
  this.verifiedBy = adminId;

  if (this.paymentDetails) {
    this.paymentDetails.verificationStatus = 'REJECTED';
    this.paymentDetails.verificationNotes = reason;
  }

  return this.save();
};

// ================================
// STATIC METHODS
// ================================

// Get payments by customer
pricingPlanPaymentSchema.statics.getByCustomer = function (customerId, options = {}) {
  const query = this.find({ customerId });

  if (options.status) {
    query.where('paymentStatus', options.status);
  }

  if (options.method) {
    query.where('paymentMethod', options.method);
  }

  return query
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Get pending verifications (for admin)
pricingPlanPaymentSchema.statics.getPendingVerifications = function () {
  return this.find({
    paymentStatus: 'PENDING',
    $or: [
      { 'paymentDetails.paymentType': 'MANUAL' },
      { paymentMethod: 'MOBILE_WALLET' },
      { paymentMethod: 'BANK_TRANSFER' }
    ]
  })
    .sort({ createdAt: 1 }); // Oldest first
};

// Get payment statistics
pricingPlanPaymentSchema.statics.getStats = async function (startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  return stats;
};

// Get total revenue
pricingPlanPaymentSchema.statics.getTotalRevenue = async function (options = {}) {
  const query = {
    paymentStatus: { $in: ['PAID', 'COMPLETED', 'VERIFIED'] }
  };

  if (options.startDate && options.endDate) {
    query.createdAt = {
      $gte: options.startDate,
      $lte: options.endDate
    };
  }

  if (options.customerId) {
    query.customerId = options.customerId;
  }

  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { totalRevenue: 0, count: 0 };
};

// ================================
// PRE-SAVE HOOKS
// ================================

// Validate payment data before saving
pricingPlanPaymentSchema.pre('save', function (next) {
  // Ensure manual payments have receipt
  if (this.paymentDetails?.paymentType === 'MANUAL' ||
    this.paymentMethod === 'MOBILE_WALLET' ||
    this.paymentMethod === 'BANK_TRANSFER') {

    if (this.paymentStatus === 'PENDING' &&
      !this.receiptUrl && !this.receiptPath) {
      return next(new Error('Manual payment requires receipt'));
    }

    if (!this.transactionId) {
      return next(new Error('Manual payment requires transaction ID'));
    }
  }

  // Ensure card payments have PayPro data
  if ((this.paymentMethod === 'CARD' || this.paymentMethod === 'CREDIT_CARD') &&
    this.paymentDetails?.paymentType === 'ONLINE') {
    if (this.paymentStatus === 'PENDING' && !this.paymentUrl) {
      return next(new Error('Card payment requires payment URL'));
    }
  }

  // Auto-set paidAt when status changes to PAID/COMPLETED/VERIFIED
  if (this.isModified('paymentStatus')) {
    if (['PAID', 'COMPLETED', 'VERIFIED'].includes(this.paymentStatus) && !this.paidAt) {
      this.paidAt = new Date();
    }
  }

  next();
});

// ================================
// JSON TRANSFORMATION
// ================================
pricingPlanPaymentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    delete ret.__v;
    return ret;
  }
});

// ================================
// EXPORT MODEL
// ================================
const pricingPlanPayment = mongoose.model(
  "pricingPlanPayment",
  pricingPlanPaymentSchema
);

module.exports = pricingPlanPayment;

// ================================
// USAGE EXAMPLES
// ================================

/*

// CREATE CARD PAYMENT
const cardPayment = new pricingPlanPayment({
  customerId: '507f1f77bcf86cd799439011',
  orderNumber: 'ORDER_123456',
  currency: 'USD',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerMobile: '03001234567',
  amount: 500,
  paymentStatus: 'PENDING',
  paymentMethod: 'CARD',
  paymentDetails: {
    products: [...],
    paymentType: 'ONLINE'
  },
  payproOrderId: 'PPO123',
  paymentUrl: 'https://paypro.com/pay/...'
});
await cardPayment.save();

// CREATE MANUAL PAYMENT (S3)
const manualPayment = new pricingPlanPayment({
  customerId: '507f1f77bcf86cd799439011',
  orderNumber: 'MANUAL_123456',
  currency: 'USD',
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
  customerMobile: '03009876543',
  amount: 1000,
  paymentStatus: 'PENDING_VERIFICATION',
  paymentMethod: 'MOBILE_WALLET',
  paymentDetails: {
    products: [...],
    paymentType: 'MANUAL',
    submittedAt: new Date(),
    verificationStatus: 'PENDING'
  },
  transactionId: 'TXN789',
  receiptUrl: 'https://bucket.s3.region.amazonaws.com/receipts/receipt.jpg',
  receiptKey: 'payment-receipts/2025/01/receipt.jpg',
  receiptFileName: 'receipt.jpg',
  receiptMimeType: 'image/jpeg',
  receiptSize: 123456
});
await manualPayment.save();

// QUERY EXAMPLES

// Get customer payments
const payments = await pricingPlanPayment.getByCustomer(
  '507f1f77bcf86cd799439011',
  { status: 'PENDING_VERIFICATION', limit: 20 }
);

// Get pending verifications (admin)
const pending = await pricingPlanPayment.getPendingVerifications();

// Verify payment
const payment = await pricingPlanPayment.findById(paymentId);
await payment.verify('admin123', 'Payment verified successfully');

// Reject payment
await payment.reject('admin123', 'Invalid receipt');

// Get revenue
const revenue = await pricingPlanPayment.getTotalRevenue({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31')
});

// Get statistics
const stats = await pricingPlanPayment.getStats(
  new Date('2025-01-01'),
  new Date('2025-12-31')
);

*/