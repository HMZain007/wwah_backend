// // // Importing necessary modules
// // const express = require("express");
// // const server = express(); // Initializing the Express application
// // const dbCon = require("./database/connection"); // Database connection
// // const bodyParser = require("body-parser");
// // const cors = require("cors");
// // const session = require("express-session");
// // const cookieParser = require("cookie-parser");
// // const helmet = require("helmet"); // For securing HTTP headers
// // require("dotenv").config(); // Load environment variables

// // // Importing routers
// // const signUp = require("./routers/siginUp");
// // const signIn = require("./routers/siginIn");
// // const profile = require("./routers/profile");
// // const forgotPassword = require("./routers/forgotPassword");
// // const verifyOtp = require("./routers/verifyOtp");
// // const resetPassword = require("./routers/resetPassword");
// // const updateProfile = require("./routers/updateprofile");
// // const logout = require("./routers/logout");
// // const chatZEUS = require("./routers/chatZEUS");
// // const bookAppointment = require("./routers/bookAppointment");
// // const contactUs = require("./routers/contactus");
// // const scheduleSession = require("./routers/scheduleSession");
// // const accommodationBooking = require("./routers/studentDashboard/accommodationBooking");
// // const airportPickup = require("./routers/studentDashboard/airportPickup");
// // const completeApplication = require("./routers/studentDashboard/completeApplication");
// // const createAdminRoute = require("./routers/createAdmin");
// // const studentData = require("./routers/adminDashboard/studentData");
// // // Middleware
// // server.use(
// //   cors({
// //     origin: ["https://www.worldwideadmissionshub.com" , "https://wwah.vercel.app", "http://localhost:3000"],
// //     credentials: true,
// //     allowedHeaders: ["Content-Type", "Authorization"], // Additional headers
// //     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
// //     optionsSuccessStatus: 200, // Allow requests with valid credentials to proceed

// //   })
// // ); // Adjust origin for production
// // server.use(helmet()); // Add security headers
// // server.use(express.json()); // Built-in JSON parser
// // server.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
// // server.use(cookieParser());
// // server.use(
// //   session({
// //     secret: process.env.SESSION_SECRET || "defaultSecret", // Use environment variable
// //     resave: false,
// //     saveUninitialized: true,
// //     cookie: {
// //       secure: process.env.NODE_ENV === "production", // Secure cookies in production
// //       maxAge: 5 * 60 * 1000, // 5 minutes
// //     },
// //   })
// // );

// // // Routes
// // server.use("/signup", signUp); // User signup
// // server.use("/createAdmin", createAdminRoute); // User signup
// // server.use("/signin", signIn); // User signin
// // server.use("/profile", profile); // User profile
// // server.use("/forgotpassword", forgotPassword); // Forgot password
// // server.use("/verifyOtp", verifyOtp); // Verify OTP
// // server.use("/resetpassword", resetPassword); // Reset password
// // server.use("/updateprofile", updateProfile); // Update profile
// // server.use("/logout", logout); // User logout
// // server.use("/chatZEUS", chatZEUS);
// // server.use("/bookappointment", bookAppointment);
// // server.use("/contactus", contactUs);
// // server.use("/scheduleSession", scheduleSession);
// // server.use("/studentDashboard/accommodationBooking", accommodationBooking);
// // server.use("/studentDashboard/accommodationBooking", accommodationBooking);
// // server.use("/studentDashboard/airportPickup", airportPickup);
// // server.use("/studentDashboard/completeApplication", completeApplication);
// // server.use("/adminDashboard/studentData", studentData);
// // // Default route
// // server.get("/", async (req, res) => {
// //   try {
// //     res.json({ message: "This is Home Page From Backend" });
// //   } catch (error) {
// //     res
// //       .status(500)
// //       .json({ message: `There is some Error in Server: ${error}` });
// //   }
// // });

// // // Health check route
// // server.get("/health", (req, res) => {
// //   res.status(200).json({ message: "Server is running smoothly" });
// // });

// // // Centralized error handler
// // server.use((err, req, res, next) => {
// //   console.error(`Error occurred: ${err.message}`);
// //   res.status(500).json({ message: "Internal Server Error" });
// // });

// // // Starting the server
// // const port = process.env.PORT || 8080;
// // server.listen(port, () => {
// //   console.log(`The Server is running at port ${port}`);
// // });
// const express = require("express");
// const server = express();
// const cors = require("cors");
// const helmet = require("helmet");
// const session = require("express-session");
// const cookieParser = require("cookie-parser");
// require("dotenv").config();

// // Database connection
// const dbCon = require("./database/connection");

// // Importing routers
// const signUp = require("./routers/siginUp");
// const signIn = require("./routers/siginIn");
// const profile = require("./routers/profile");
// const forgotPassword = require("./routers/forgotPassword");
// const verifyOtp = require("./routers/verifyOtp");
// const resetPassword = require("./routers/resetPassword");
// const updateProfile = require("./routers/updateprofile");
// const logout = require("./routers/logout");
// const chatZEUS = require("./routers/chatZEUS");
// const bookAppointment = require("./routers/bookAppointment");
// const contactUs = require("./routers/contactus");
// const scheduleSession = require("./routers/scheduleSession");
// const accommodationBooking = require("./routers/studentDashboard/accommodationBooking");
// const airportPickup = require("./routers/studentDashboard/airportPickup");
// const completeApplication = require("./routers/studentDashboard/completeApplication");
// const createAdminRoute = require("./routers/createAdmin");
// const studentData = require("./routers/adminDashboard/studentData");

// // CORS Configuration
// server.use(
//   cors({
//     origin: [
//       "https://www.worldwideadmissionshub.com",
//       "https://wwah.vercel.app",
//       "http://localhost:3000",
//     ],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   })
// );

// // Handle Preflight Requests
// server.options("*", cors());

// // Ensure CORS Headers on Every Request
// server.use((req, res, next) => {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://www.worldwideadmissionshub.com"
//   );
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });

// // Security Middleware
// server.use(helmet());
// server.use(express.json());
// server.use(express.urlencoded({ extended: true }));
// server.use(cookieParser());
// server.use(
//   session({
//     secret: process.env.SESSION_SECRET || "defaultSecret",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 5 * 60 * 1000,
//     },
//   })
// );

// // Routes
// server.use("/signup", signUp);
// server.use("/createAdmin", createAdminRoute);
// server.use("/signin", signIn);
// server.use("/profile", profile);
// server.use("/forgotpassword", forgotPassword);
// server.use("/verifyOtp", verifyOtp);
// server.use("/resetpassword", resetPassword);
// server.use("/updateprofile", updateProfile);
// server.use("/logout", logout);
// server.use("/chatZEUS", chatZEUS);
// server.use("/bookappointment", bookAppointment);
// server.use("/contactus", contactUs);
// server.use("/scheduleSession", scheduleSession);
// server.use("/studentDashboard/accommodationBooking", accommodationBooking);
// server.use("/studentDashboard/airportPickup", airportPickup);
// server.use("/studentDashboard/completeApplication", completeApplication);
// server.use("/adminDashboard/studentData", studentData);

// // Default route
// server.get("/", async (req, res) => {
//   try {
//     res.json({ message: "This is Home Page From Backend" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: `There is some Error in Server: ${error}` });
//   }
// });

// // Health Check Route
// server.get("/health", (req, res) => {
//   res.status(200).json({ message: "Server is running smoothly" });
// });

// // Error Handler
// server.use((err, req, res, next) => {
//   console.error(`Error occurred: ${err.message}`);
//   res.status(500).json({ message: "Internal Server Error" });
// });

// // Start Server
// const port = process.env.PORT || 8080;
// server.listen(port, () => {
//   console.log(`The Server is running at port ${port}`);
// });

// Importing necessary modules
const express = require("express");
const server = express(); // Initializing the Express application
const dbCon = require("./database/connection"); // Database connection
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const helmet = require("helmet"); // For securing HTTP headers
require("dotenv").config(); // Load environment variables

// Importing routers
const signUp = require("./routers/siginUp");
const signIn = require("./routers/siginIn");
const profile = require("./routers/profile");
const forgotPassword = require("./routers/forgotPassword");
const verifyOtp = require("./routers/verifyOtp");
const resetPassword = require("./routers/resetPassword");
const updateProfile = require("./routers/updateprofile");
const logout = require("./routers/logout");
const chatZEUS = require("./routers/chatZEUS");
const bookAppointment = require("./routers/bookAppointment");
const contactUs = require("./routers/contactus");
const scheduleSession = require("./routers/scheduleSession");
const accommodationBooking = require("./routers/studentDashboard/accommodationBooking");
const airportPickup = require("./routers/studentDashboard/airportPickup");
const completeApplication = require("./routers/studentDashboard/completeApplication");
const createAdminRoute = require("./routers/createAdmin");
const studentData = require("./routers/adminDashboard/studentData");
// Middleware
server.use(
  cors({
    origin: [
      "https://wwah.vercel.app",
      "http://localhost:3000",
      "https://www.worldwideadmissionshub.com",
    ],
    credentials: true,
  })
);

server.use(helmet()); // Add security headers
server.use(express.json()); // Built-in JSON parser
server.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
server.use(cookieParser());
server.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret", // Use environment variable
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      maxAge: 5 * 60 * 1000, // 5 minutes
    },
  })
);

// Routes
server.use("/signup", signUp); // User signup
server.use("/createAdmin", createAdminRoute); // User signup
server.use("/signin", signIn); // User signin
server.use("/profile", profile); // User profile
server.use("/forgotpassword", forgotPassword); // Forgot password
server.use("/verifyOtp", verifyOtp); // Verify OTP
server.use("/resetpassword", resetPassword); // Reset password
server.use("/updateprofile", updateProfile); // Update profile
server.use("/logout", logout); // User logout
server.use("/chatZEUS", chatZEUS);
server.use("/bookappointment", bookAppointment);
server.use("/contactus", contactUs);
server.use("/scheduleSession", scheduleSession);
server.use("/studentDashboard/accommodationBooking", accommodationBooking);
server.use("/studentDashboard/accommodationBooking", accommodationBooking);
server.use("/studentDashboard/airportPickup", airportPickup);
server.use("/studentDashboard/completeApplication", completeApplication);
server.use("/adminDashboard/studentData", studentData);
// Default route
server.get("/", async (req, res) => {
  try {
    res.json({ message: "This is Home Page From Backend" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `There is some Error in Server: ${error}` });
  }
});

// Health check route
server.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running " });
});

// Centralized error handler
server.use((err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);
  res.status(500).json({ message: "Internal Server Error" });
});

// Starting the server
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`The Server is running at port ${port}`);
});
