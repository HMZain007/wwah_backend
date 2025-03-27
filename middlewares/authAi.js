const jwt = require("jsonwebtoken");

const authenticateAiToken = (req, res, next) => {
  // Retrieve the token from the Authorization header
  const token = req.cookies.authToken;
  // const token = authHeader && authHeader.split(" ")[1]; // Expect 'Bearer <token>'
  if (!token) {
    req.user = null; // No user logged in
    next();
  } else {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Invalid or Expired Token", success: false });
      }
      // Attach user information to the request object
      req.user = user;
      next();
    });
  }
  // Verify the token
};

module.exports = authenticateAiToken;