// const jwt = require("jsonwebtoken");
// const authenticateAdminToken = (req, res, next) => {
//   console.log(req.cookies.adminToken, "admin token in middleware");
//   // 🔹 Get token from `cookies` OR `Authorization` header
//   const token =
//     req.cookies.adminToken || req.headers.authorization?.split(" ")[1];
//   console.log("Admin Auth Token:", token);
//   if (!token) {
//     return res
//       .status(401)
//       .json({
//         message: "Access Denied: No Token Provided",
//         token,
//         success: false,
//       });
//   }

//   // 🔹 Verify the token
//   jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
//     if (err) {
//       return res
//         .status(403)
//         .json({ message: "Invalid or Expired Token", success: false });
//     }
//     req.user = user;
//     next();
//   });
// };
// module.exports = authenticateAdminToken;
const jwt = require("jsonwebtoken");

const authenticateAdminToken = (req, res, next) => {
//   console.log("=== MIDDLEWARE DEBUG ===");
//   console.log("All Cookies:", req.cookies);
//   console.log("adminToken:", req.cookies.adminToken);
//   console.log("Authorization Header:", req.headers.authorization);
//   console.log("Origin:", req.headers.origin);
//   console.log("Cookie Header:", req.headers.cookie);
  
  // Get token from cookies OR Authorization header
  const token =
    req.cookies.adminToken || req.headers.authorization?.split(" ")[1];
  
  console.log("Final Token:", token);

  if (!token) {
    return res.status(401).json({
      message: "Access Denied: No Token Provided",
      success: false,
      debug: {
        hasCookies: !!req.cookies,
        cookieKeys: Object.keys(req.cookies || {}),
        hasAuthHeader: !!req.headers.authorization,
      },
    });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(403).json({
        message: "Invalid or Expired Token",
        success: false,
      });
    }
    
    // console.log("✅ Token verified, user:", user);
    req.user = user;
    next();
  });
};

module.exports = authenticateAdminToken;
