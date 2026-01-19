// routes/payment.routes.js - Simple and efficient

const express = require("express");
const router = express.Router();
const Payment = require('../../database/models/pricingPlan/payment');
const { createPayProOrder, createMultiplePayProOrders } = require('../../services/paypro/service');

// routes/payment.routes.js - Fixed

router.post("/", async (req, res) => {
  try {
    const products = req.body;

    console.log(`✅ Received ${products.length} products`);

    // Validate
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required'
      });
    }

    // Calculate total
    const totalAmount = products.reduce((sum, p) => sum + parseFloat(p.CurrencyAmount), 0);

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Get customer info from first product
    const firstProduct = products[0];
    const mainOrderNumber = `ORDER_${Date.now()}`;

    // Save to database
    const payment = new Payment({
      orderNumber: mainOrderNumber,
      customerName: firstProduct.CustomerName,
      customerId: firstProduct.CustomerId || 'guest',
      customerMobile: firstProduct.CustomerMobile,
      customerEmail: firstProduct.CustomerEmail,
      amount: totalAmount,
      orderDescription: products.map(p => p.CustomerAddress).join(", "),
      paymentStatus: 'PENDING',
      paymentDetails: { products }
    });

    await payment.save();
    console.log('✅ Payment saved:', mainOrderNumber);

    let payproResponse;
    let orderDataForPayPro;

    // Decide which endpoint to use
    if (products.length === 1) {
      // ✅ SINGLE ORDER - /co endpoint
      const product = products[0];

      orderDataForPayPro = [
        { MerchantId: process.env.PAYPRO_MERCHANT_ID},
        {
          OrderNumber: product.OrderNumber,
          CurrencyAmount: product.CurrencyAmount,
          OrderDueDate: product.OrderDueDate,
          OrderType: product.OrderType,
          IssueDate: product.IssueDate,
          OrderExpireAfterSeconds: product.OrderExpireAfterSeconds,
          CustomerName: product.CustomerName,
          CustomerMobile: String(product.CustomerMobile), // ✅ Convert to string
          CustomerEmail: product.CustomerEmail,
          CustomerAddress: product.CustomerAddress,
          Currency: product.Currency || "USD",
          IsConverted: product.IsConverted || "true"
        }
      ];

      // console.log('📤 Calling SINGLE order API (/co)');
      // console.log('Order data:', JSON.stringify(orderDataForPayPro, null, 2));
      payproResponse = await createPayProOrder(orderDataForPayPro);

    } else {
      // ✅ MULTIPLE ORDERS - /cmo endpoint
      const formattedProducts = products.map(p => ({
        OrderNumber: p.OrderNumber,
        CurrencyAmount: p.CurrencyAmount,  // ← Use CurrencyAmount, not OrderAmount
        Currency: p.Currency || "USD",     // ← ADD THIS
        IsConverted: p.IsConverted || "true", // ← ADD THIS
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
      // console.log('Order data:', JSON.stringify(orderDataForPayPro, null, 2));
      payproResponse = await createMultiplePayProOrders(orderDataForPayPro);
    }
    // console.log('✅ PayPro Response:', payproResponse);

    // Handle response
    if (Array.isArray(payproResponse) && payproResponse[0]?.Status === '00') {
      const orderDetails = payproResponse[1];

      // Update payment
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
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
});

module.exports = router;