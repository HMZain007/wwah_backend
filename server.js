require("dotenv").config(); // Load environment variables
// Importing necessary modules
const express = require("express");
const server = express(); // Initializing the Express application
const dbCon = require("./database/connection"); // Database connection
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const helmet = require("helmet"); // For securing HTTP headers


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
const successChance = require('./routers/success-chance');
// Middleware
server.use(
  cors({
    origin: [
      "https://wwah.vercel.app",
      "http://localhost:3000",
      "https://www.worldwideadmissionshub.com",
      "https://www.wwah.ai"
    ],
    credentials: true,
  })
); // Adjust origin for production
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
      httpOnly: true,                     // JS can’t tamper with it
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",                   // ← allow cross-site send
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
server.use('/success-chance', successChance);
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
  res.status(200).json({ message: "Server is running smoothly" });
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
