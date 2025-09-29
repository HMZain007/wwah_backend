const jwt = require("jsonwebtoken");

const authenticateRefToken = (req, res, next) => {
  // 🔹 Get token from `cookies` OR `Authorization` header
  const token = req.cookies.refToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No Token Provided", success: false });
  }

  // 🔹 Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or Expired Token", success: false });
    }
    req.user = user; 
    next();
  });
};

module.exports = authenticateRefToken;