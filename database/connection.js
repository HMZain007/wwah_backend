const mongoose = require('mongoose');
require("dotenv").config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {})
const db = mongoose.connection;
// Connection successful
db.on('connected', () => {
    console.log('MongoDB connected with server  successfully');
});

// Connection error
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Optional: Once the connection is open
db.once('open', () => {
    console.log('MongoDB connection is open');
});

// Optional: When the connection is disconnected
db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});