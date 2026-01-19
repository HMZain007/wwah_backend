const mongoose = require('mongoose');

const pricingPlanPaymentSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerMobile: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    orderDescription: {
        type: String,
        default: ''
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'UNPAID', 'CANCELLED', 'EXPIRED', 'FAILED'],
        default: 'PENDING'
    },
    payproOrderId: {
        type: String,
        default: null
    },
    paymentUrl: {
        type: String,
        default: null
    },
    paymentDetails: {
        type: Object,
        default: {}
    },
    paidAt: {
        type: Date,
        default: null
    },
    webhookData: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('pricingPlanPayment', pricingPlanPaymentSchema);