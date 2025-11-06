// utils/generateToken.js
const jwt = require("jsonwebtoken");

function generateResetToken(email) {
  const payload = { email };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "10m" });
}

function verifyResetToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return null; // invalid or expired token
  }
}

module.exports = { generateResetToken, verifyResetToken };
