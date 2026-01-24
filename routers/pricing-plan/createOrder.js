// routes/payment.routes.js
// ✅ S3 VERSION - Stores S3 URLs in MongoDB (NOT file paths or Base64)

const express = require("express");
const router = express.Router();
const Payment = require('../../database/models/pricingPlan/payment');
const { createPayProOrder, createMultiplePayProOrders } = require('../../services/paypro/service');

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
    // console.log('✅ Payment saved:', mainOrderNumber);

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

      // console.log('📤 Calling SINGLE order API (/co)');
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

      // console.log(`📤 Calling MULTIPLE orders API (/cmo) with ${products.length} products`);
      payproResponse = await createMultiplePayProOrders(orderDataForPayPro);
    }

    if (Array.isArray(payproResponse) && payproResponse[0]?.Status === '00') {
      const orderDetails = payproResponse[1];

      payment.payproOrderId = orderDetails.OrderId || mainOrderNumber;
      payment.paymentUrl = orderDetails.Click2Pay;
      payment.paymentDetails.payproResponse = orderDetails;
      await payment.save();

      // console.log('✅ Payment URL generated:', orderDetails.Click2Pay);

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
      receiptUrl,          // S3 URL from upload-receipt API
      receiptKey,          // S3 key
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

    // console.log('📥 Manual payment submission received');
    // console.log('   Transaction ID:', transactionId);
    // console.log('   Payment Method:', paymentMethod);
    // console.log('   Customer:', customerName);
    // console.log('   Amount:', amount);
    // console.log('   Receipt URL:', receiptUrl);

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

    // ✅ Validate S3 URL
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
    // ✅ STORES S3 URL (NOT FILE OR BASE64)
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
      
      // ✅ STORE S3 URL (NOT BASE64, NOT FILE PATH)
      receiptUrl: receiptUrl,                 // S3 public URL
      receiptKey: receiptKey,                 // S3 key for deletion if needed
      receiptFileName: receiptFileName,
      receiptMimeType: receiptMimeType,
      receiptSize: receiptSize,
      
      verifiedAt: null,
      verifiedBy: null,
    });

    await payment.save();

    // console.log('✅ Manual payment saved successfully with S3 URL!');
    // console.log('   Order Number:', orderNumber);
    // console.log('   Customer:', customerName);
    // console.log('   Amount:', amount);
    // console.log('   Transaction ID:', transactionId);
    // console.log('   Receipt S3 URL:', receiptUrl);
    // console.log('   Products count:', productsFormatted.length);

    // TODO: Send email notification to admin
    // await sendAdminNotification({
    //   payment,
    //   receiptUrl: receiptUrl
    // });

    // TODO: Send confirmation email to customer
    // await sendCustomerConfirmation({
    //   email: customerEmail,
    //   name: customerName,
    //   orderNumber: orderNumber,
    //   transactionId: transactionId,
    //   amount: amount
    // });

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

module.exports = router;