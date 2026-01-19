// ============================================
// services/paypro.service.js - PayPro Service Functions
// ============================================

const mongoose = require('mongoose');


// Token storage
let PayProToken = null;
let tokenExpiry = null;

// Get authentication token
const getPayProToken = async () => {
  try {
    // Check if token is still valid
    if (PayProToken && tokenExpiry && Date.now() < tokenExpiry) {
      return PayProToken;  // ✅ Just return the token, nothing else!
    }
    const response = await fetch(`${process.env.PAYPRO_BASE_URL}auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientid: process.env.PAYPRO_CLIENT_ID,
        clientsecret: process.env.PAYPRO_CLIENT_SECRET
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.Message || 'Authentication failed');
    }

    // Extract token from response headers
    PayProToken = response.headers.get('token');
    const expiryMinutes = parseInt(response.headers.get('tokenexpiry') || '1440');
    
    // Set token expiry (subtract 5 minutes for safety)
    tokenExpiry = Date.now() + (expiryMinutes - 5) * 60 * 1000;

    if (!PayProToken) {
      throw new Error('Token not received from PayPro');
    }

    // console.log('✅ PayPro authentication successful');
    return PayProToken;

  } catch (error) {
    console.error('❌ PayPro Auth Error:', error.message);
    throw new Error('Failed to authenticate with PayPro');
  }
};
// Create a single order
// services/paypro/service.js - Updated with both endpoints

// Create a SINGLE order (uses /co endpoint)
const createPayProOrder = async (orderData) => {
//   console.log(orderData, "single order data");
  try {
    const token = await getPayProToken();
    console.log(token, "Token");
    
    const response = await fetch(`${process.env.PAYPRO_BASE_URL}co`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token  
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();
    // console.log(data, "single order response");
    
    if (!response.ok) {
      throw new Error(data.Message || 'Failed to create order');
    }
    return data;
  } catch (error) {
    console.error('❌ Create Single Order Error:', error.message);
    throw error;
  }
};

// Create MULTIPLE orders (uses /cmo endpoint)
const createMultiplePayProOrders = async (ordersData) => {
//   console.log(ordersData, "multiple orders data");
  try {
    const token = await getPayProToken();
    console.log(token, "Token");
    const response = await fetch(`${process.env.PAYPRO_BASE_URL}cmo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
         'Token': token  
      },
      body: JSON.stringify(ordersData)
    });

    const data = await response.json();
    // console.log(data, "multiple orders response");
    
    if (!response.ok) {
      throw new Error(data.Message || 'Failed to create orders');
    }
    return data;
  } catch (error) {
    console.error('❌ Create Multiple Orders Error:', error.message);
    throw error;
  }
};

// Get order status
const getPayProOrderStatus = async (orderNumber) => {
  try {
    const token = await getPayProToken();

    const url = new URL(`${process.env.PAYPRO_BASE_URL}`);
    url.searchParams.append('ordernumber', orderNumber);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Token': token
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.Message || 'Failed to get order status');
    }

    return data;

  } catch (error) {
    console.error('❌ Get Order Status Error:', error.message);
    throw error;
  }
};

module.exports = {
  getPayProToken,
  createPayProOrder,
  createMultiplePayProOrders,
  getPayProOrderStatus
};