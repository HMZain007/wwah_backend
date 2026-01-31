// routes/payment.routes.js
// ✅ S3 VERSION - Stores S3 URLs in MongoDB (NOT file paths or Base64)

const express = require("express");
const router = express.Router();
const Payment = require('../../database/models/pricingPlan/payment');
const { createPayProOrder, createMultiplePayProOrders } = require('../../services/paypro/service');
const sendEmail = require('../../utils/sendEmail');

// ================================
// EMAIL TEMPLATES
// ================================

const getCardPaymentAdminEmail = (payment, products) => {
  const productRows = products.map((p, i) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${p.CustomerAddress || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${p.Currency} ${p.CurrencyAmount}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .info-row { margin: 10px 0; padding: 10px; background-color: white; border-left: 4px solid #4CAF50; }
        .label { font-weight: bold; color: #555; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; background-color: white; }
        th { background-color: #4CAF50; color: white; padding: 10px; text-align: left; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 New Card Payment Received</h2>
        </div>
        <div class="content">
          <div class="info-row">
            <span class="label">Order Number:</span> ${payment.orderNumber}
          </div>
          <div class="info-row">
            <span class="label">Customer Name:</span> ${payment.customerName}
          </div>
          <div class="info-row">
            <span class="label">Email:</span> ${payment.customerEmail}
          </div>
          <div class="info-row">
            <span class="label">Mobile:</span> ${payment.customerMobile}
          </div>
          <div class="info-row">
            <span class="label">Total Amount:</span> ${payment.currency} ${payment.amount}
          </div>
          <div class="info-row">
            <span class="label">Payment Method:</span> Card (Online)
          </div>
          <div class="info-row">
            <span class="label">Status:</span> <span style="color: #ff0000ff;">PENDING</span>
          </div>
          <div class="info-row">
            <span class="label">Payment URL:</span> <a href="${payment.paymentUrl}" target="_blank">View Payment</a>
          </div>

          <h3 style="margin-top: 20px;">Products:</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <div class="info-row">
            <span class="label">Order Created:</span> ${new Date(payment.createdAt).toLocaleString()}
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from WWAH Payment System</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getManualPaymentAdminEmail = (payment, receiptUrl) => {
  const productRows = payment.paymentDetails.products.map((p, i) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${p.productName || p.CustomerAddress}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${p.Currency} ${p.CurrencyAmount}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ff0000ff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .info-row { margin: 10px 0; padding: 10px; background-color: white; border-left: 4px solid #ff0000ff; }
        .label { font-weight: bold; color: #555; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; background-color: white; }
        th { background-color: #ff0000ff; color: white; padding: 10px; text-align: left; }
        .receipt-section { margin: 20px 0; padding: 15px; background-color: white; border: 2px dashed #ff0000ff; text-align: center; }
        .receipt-image { max-width: 100%; height: auto; border: 1px solid #ddd; margin-top: 10px; }
        .alert { background-color: #fff3cd; border: 1px solid #ff0707ff; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📋 New Manual Payment Submitted</h2>
          <p style="margin: 5px 0;">Requires Verification</p>
        </div>
        <div class="content">
          <div class="alert">
            ⚠️ <strong>Action Required:</strong> Please verify this payment within 24-48 hours
          </div>

          <h3>Customer Information:</h3>
          <div class="info-row">
            <span class="label">Order Number:</span> ${payment.orderNumber}
          </div>
          <div class="info-row">
            <span class="label">Customer Name:</span> ${payment.customerName}
          </div>
          <div class="info-row">
            <span class="label">Email:</span> ${payment.customerEmail}
          </div>
          <div class="info-row">
            <span class="label">Mobile:</span> ${payment.customerMobile}
          </div>

          <h3>Payment Details:</h3>
          <div class="info-row">
            <span class="label">Total Amount:</span> ${payment.currency} ${payment.amount}
          </div>
          <div class="info-row">
            <span class="label">Payment Method:</span> ${payment.paymentMethod === 'MOBILE_WALLET' ? 'Mobile Wallet' : 'Bank Transfer'}
          </div>
          <div class="info-row">
            <span class="label">Transaction ID:</span> ${payment.transactionId}
          </div>
          <div class="info-row">
            <span class="label">Status:</span> <span style="color: #ff0000ff;">PENDING VERIFICATION</span>
          </div>

          <h3>Products:</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <div class="receipt-section">
            <h3 style="margin-top: 0;">📸 Payment Receipt</h3>
            <p><a href="${receiptUrl}" target="_blank" style="color: #ff0000ff; text-decoration: none; font-weight: bold;">Click to view full size</a></p>
            <img src="${receiptUrl}" alt="Payment Receipt" class="receipt-image" />
          </div>

          <div class="info-row">
            <span class="label">Submitted:</span> ${new Date(payment.createdAt).toLocaleString()}
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from WWAH Payment System</p>
          <p>Please verify and update the payment status in the admin panel</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getCustomerConfirmationEmail = (orderNumber, customerName, amount, transactionId) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .success-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 15px 0; border-radius: 4px; text-align: center; }
        .info-row { margin: 10px 0; padding: 10px; background-color: white; border-left: 4px solid #2196F3; }
        .label { font-weight: bold; color: #555; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Payment Proof Received</h2>
        </div>
        <div class="content">
          <div class="success-box">
            <h3 style="margin: 0; color: #155724;">Thank you for your payment!</h3>
            <p style="margin: 5px 0;">We have received your payment proof and will verify it shortly.</p>
          </div>

          <h3>Order Details:</h3>
          <div class="info-row">
            <span class="label">Order Number:</span> ${orderNumber}
          </div>
          <div class="info-row">
            <span class="label">Transaction ID:</span> ${transactionId}
          </div>
          <div class="info-row">
            <span class="label">Amount:</span> USD ${amount}
          </div>
          <div class="info-row">
            <span class="label">Status:</span> Pending Verification
          </div>

          <div style="margin: 20px 0; padding: 15px; background-color: #ffcdcdff; border: 1px solid #b10000ff; border-radius: 4px;">
            <strong>⏱️ Next Steps:</strong>
            <ul style="margin: 10px 0;">
              <li>Our team will verify your payment within 24-48 hours</li>
              <li>You will receive a confirmation email once verified</li>
              <li>If you have any questions, please contact us at info@wwah.ai</li>
            </ul>
          </div>

          <p>Thank you for choosing WWAH!</p>
        </div>
        <div class="footer">
          <p>This is an automated email from WWAH</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ================================
// EMAIL NOTIFICATION FUNCTIONS
// ================================

const notifyAdminCardPayment = async (payment, products) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wwah.ai';
    const html = getCardPaymentAdminEmail(payment, products);
    
    await sendEmail(
      adminEmail,
      `💳 New Card Payment - ${payment.orderNumber}`,
      html
    );
    
    console.log('✅ Admin notification email sent for card payment');
  } catch (error) {
    console.error('❌ Failed to send admin email for card payment:', error);
    // Don't throw - email failure shouldn't stop the payment process
  }
};

const notifyAdminManualPayment = async ({ payment, receiptUrl }) => {
  try {
    const adminEmail = 'info@wwah.ai';
    const html = getManualPaymentAdminEmail(payment, receiptUrl);
    
    await sendEmail(
      adminEmail,
      `📋 Manual Payment Verification Required - ${payment.orderNumber} 
         Payment Receipt URL: ${receiptUrl}
      `,
      html
    );
    
    console.log('✅ Admin notification email sent for manual payment');
  } catch (error) {
    console.error('❌ Failed to send admin email for manual payment:', error);
    // Don't throw - email failure shouldn't stop the payment process
  }
};

const sendCustomerConfirmation = async ({ email, name, orderNumber, transactionId, amount }) => {
  try {
    const html = getCustomerConfirmationEmail(orderNumber, name, amount, transactionId);
    
    await sendEmail(
      email,
      `Payment Proof Received - Order ${orderNumber}`,
      html
    );
    
    console.log('✅ Customer confirmation email sent');
  } catch (error) {
    console.error('❌ Failed to send customer confirmation email:', error);
    // Don't throw - email failure shouldn't stop the payment process
  }
};

// ================================
// CARD PAYMENT ROUTE (PayPro)
// ================================
router.post("/", async (req, res) => {
  try {
    const products = req.body;

    console.log(`✅ Received ${products.length} products for card payment`);

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required'
      });
    }

    const totalAmount = products.reduce((sum, p) => sum + parseFloat(p.CurrencyAmount || 0), 0);

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const firstProduct = products[0];
    const mainOrderNumber = `ORDER_${Date.now()}`;

    const payment = new Payment({
      orderNumber: mainOrderNumber,
      customerName: firstProduct.CustomerName,
      customerId: firstProduct.CustomerId || 'guest',
      customerMobile: firstProduct.CustomerMobile,
      customerEmail: firstProduct.CustomerEmail,
      amount: totalAmount,
      orderDescription: products.map(p => p.CustomerAddress || 'Item').join(", "),
      paymentStatus: 'PENDING',
      paymentMethod: 'CARD',
      paymentDetails: { 
        products,
        paymentType: 'ONLINE'
      },
      currency: firstProduct.Currency || "USD",
    });

    await payment.save();

    let payproResponse;
    let orderDataForPayPro;

    if (products.length === 1) {
      const product = products[0];

      orderDataForPayPro = [
        { MerchantId: process.env.PAYPRO_MERCHANT_ID },
        {
          OrderNumber: product.OrderNumber,
          CurrencyAmount: product.CurrencyAmount,
          OrderDueDate: product.OrderDueDate,
          OrderType: product.OrderType,
          IssueDate: product.IssueDate,
          OrderExpireAfterSeconds: product.OrderExpireAfterSeconds,
          CustomerName: product.CustomerName,
          CustomerMobile: String(product.CustomerMobile),
          CustomerEmail: product.CustomerEmail,
          CustomerAddress: product.CustomerAddress,
          Currency: product.Currency || "USD",
          IsConverted: product.IsConverted || "true"
        }
      ];

      payproResponse = await createPayProOrder(orderDataForPayPro);

    } else {
      const formattedProducts = products.map(p => ({
        OrderNumber: p.OrderNumber,
        CurrencyAmount: p.CurrencyAmount,
        Currency: p.Currency || "USD",
        IsConverted: p.IsConverted || "true",
        OrderDueDate: p.OrderDueDate,
        OrderType: p.OrderType,
        IssueDate: p.IssueDate,
        OrderExpireAfterSeconds: p.OrderExpireAfterSeconds,
        CustomerName: p.CustomerName,
        CustomerMobile: String(p.CustomerMobile),
        CustomerEmail: p.CustomerEmail,
        CustomerAddress: p.CustomerAddress
      }));

      orderDataForPayPro = [
        { MerchantId: process.env.PAYPRO_MERCHANT_ID },
        ...formattedProducts
      ];

      payproResponse = await createMultiplePayProOrders(orderDataForPayPro);
    }

    if (Array.isArray(payproResponse) && payproResponse[0]?.Status === '00') {
      const orderDetails = payproResponse[1];

      payment.payproOrderId = orderDetails.OrderId || mainOrderNumber;
      payment.paymentUrl = orderDetails.Click2Pay;
      payment.paymentDetails.payproResponse = orderDetails;
      await payment.save();

      // ✅ Send email notification to admin
      await notifyAdminCardPayment(payment, products);

      return res.json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: payment._id,
          orderNumber: mainOrderNumber,
          paymentUrl: orderDetails.Click2Pay,
          amount: totalAmount,
          productCount: products.length,
          status: payment.paymentStatus
        }
      });
    } else {
      const errorMsg = Array.isArray(payproResponse)
        ? payproResponse[1]?.Description
        : payproResponse.Message || 'Failed to create order';

      console.error('❌ PayPro failed:', payproResponse);
      throw new Error(errorMsg);
    }

  } catch (error) {
    console.error('❌ Card payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
});

// ================================
// MANUAL PAYMENT ROUTE (S3 URLs)
// ✅ STORES S3 URL (NOT FILE OR BASE64)
// ================================
router.post('/manual', async (req, res) => {
  try {
    const {
      receiptUrl,
      receiptKey,
      receiptFileName,
      receiptMimeType,
      receiptSize,
      transactionId,
      paymentMethod,
      userId,
      customerId,
      amount,
      items,
      customerName,
      customerEmail,
      customerMobile
    } = req.body;

    // ================================
    // VALIDATION
    // ================================
    
    if (!transactionId || !paymentMethod || !userId || !amount || !items) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: transactionId, paymentMethod, userId, amount, items'
      });
    }

    if (!customerName || !customerEmail || !customerMobile) {
      return res.status(400).json({
        success: false,
        message: 'Missing customer information: customerName, customerEmail, customerMobile'
      });
    }

    if (!receiptUrl || !receiptUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: 'Valid receipt URL is required'
      });
    }

    const validPaymentMethods = ['wallet', 'bank'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be "wallet" or "bank"'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items must be a non-empty array'
      });
    }

    const calculatedTotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.price || item.CurrencyAmount || 0);
    }, 0);
    
    if (Math.abs(calculatedTotal - parseFloat(amount)) > 0.01) {
      console.error('❌ Amount mismatch:', {
        calculated: calculatedTotal,
        received: parseFloat(amount)
      });
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch. Please refresh and try again.'
      });
    }

    // ================================
    // CREATE PRODUCTS ARRAY
    // ================================
    
    const orderNumber = `ORDER_${Date.now()}`;

    const productsFormatted = items.map((item, index) => ({
      OrderNumber: item.OrderNumber || `${orderNumber}_ITEM_${index + 1}`,
      CurrencyAmount: item.price || item.CurrencyAmount,
      Currency: item.Currency || "USD",
      IsConverted: "true",
      OrderType: item.OrderType || (item.name?.includes("Scholarship") ? "Scholarship" : "Service"),
      OrderDueDate: item.OrderDueDate || "",
      IssueDate: item.IssueDate || "",
      OrderExpireAfterSeconds: "0",
      CustomerName: customerName,
      CustomerMobile: customerMobile,
      CustomerEmail: customerEmail,
      CustomerAddress: item.name || item.description || 'Manual Payment Item',
      productId: item.id,
      productName: item.name,
      productDetails: item
    }));

    // ================================
    // CREATE PAYMENT RECORD
    // ================================
    
    const payment = new Payment({
      orderNumber: orderNumber,
      customerName: customerName,
      customerId: customerId || userId,
      customerMobile: customerMobile,
      customerEmail: customerEmail,
      amount: parseFloat(amount),
      orderDescription: items.map(item => item.name || item.description).join(", "),
      paymentStatus: 'PENDING',
      paymentDetails: { 
        products: productsFormatted,
        paymentType: 'MANUAL',
        submittedAt: new Date(),
        verificationStatus: 'PENDING',
        paymentMethodDetails: {
          type: paymentMethod,
          transactionId: transactionId
        }
      },
      currency: 'USD',
      paymentMethod: paymentMethod === 'wallet' ? 'MOBILE_WALLET' : 'BANK_TRANSFER',
      transactionId: transactionId,
      receiptUrl: receiptUrl,
      receiptKey: receiptKey,
      receiptFileName: receiptFileName,
      receiptMimeType: receiptMimeType,
      receiptSize: receiptSize,
      verifiedAt: null,
      verifiedBy: null,
    });

    await payment.save();

    // ✅ Send email notifications
    await notifyAdminManualPayment({
      payment,
      receiptUrl: receiptUrl
    });

    await sendCustomerConfirmation({
      email: customerEmail,
      name: customerName,
      orderNumber: orderNumber,
      transactionId: transactionId,
      amount: amount
    });

    return res.status(200).json({
      success: true,
      message: 'Payment proof submitted successfully. We will verify within 24-48 hours.',
      data: {
        orderId: payment._id,
        orderNumber: orderNumber,
        transactionId: transactionId,
        amount: parseFloat(amount),
        productCount: items.length,
        status: 'PENDING_VERIFICATION',
        estimatedVerificationTime: '24-48 hours',
        receiptUploaded: true
      }
    });

  } catch (error) {
    console.error('❌ Manual payment error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment proof'
    });
  }
});
// Update payment status (Admin)
router.put("/update-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "PAID", "UNPAID", "CANCELLED", "EXPIRED", "FAILED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        paymentStatus: status,
        ...(status === "PAID" ? { paidAt: new Date() } : {}),
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
    });
  }
});
module.exports = router;