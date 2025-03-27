const mongoose = require('mongoose');
// const url = 'mongodb+srv://umberfatimi:hbVA5f7LjmCjyRo6@cluster0.9v7pd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const url = 'mongodb+srv://hafizainsarwar007:AI37K7TloQhBqRrj@cluster0.kz0pu.mongodb.net/wwah'
mongoose.connect(url, {})
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