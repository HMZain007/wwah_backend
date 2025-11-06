
require("dotenv").config();
const express = require("express");
const server = express();
const dbCon = require("./database/connection");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // ⚠️ INSTALL THIS: npm install connect-mongo
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
const Chat = require("./database/models/Chat");

// Import routers
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
const adminControls = require("./routers/adminDashboard/adminControls");
const createAdminRoute = require("./routers/createAdmin");
const studentData = require("./routers/adminDashboard/studentData");
const successChance = require("./routers/success-chance");
const sendMail = require("./routers/sendMail");
const chatRouter = require("./routers/counselorChat");
const favorites = require("./routers/favourites");
const appliedCourses = require("./routers/appliedCourses");
const appliedScholarshipRoutes = require("./routers/appliedScholarshipCourses");
const favoritescholarship = require("./routers/favoriteScholarships");
const favoritesuniversity = require("./routers/favouriteUniversities");
const toggleFavorites = require("./routers/favourites");
const refSignUp = require("./routers/referralPortal/auth/signup");
const refSignIn = require("./routers/referralPortal/auth/signin");
const refProfile = require("./routers/referralPortal/refProfile");
const refupdateProfile = require("./routers/referralPortal/refupdateprofile");
const refPortalAuth = require("./routers/referralPortal/refPortalAuth");
const refforget = require("./routers/referralPortal/auth/forget");
const refcontact = require("./routers/referralPortal/refcontact");
const mbaData = require("./routers/adminDashboard/mbaData");
const referrals = require("./routers/adminDashboard/referrals");
const EmailRoutes = require("./routers/referralPortal/emailroutes");
const commisionRoutes = require("./routers/referralPortal/commissionRoutes");
const jobApplicationForm = require("./routers/jobApplicationForm");
const sessionBooking=require("./routers/sessionBooking")
const path = require("path");
const refForgotPassword = require("./routers/referralPortal/ref-forgotpassword");
const refverifyOtp = require("./routers/referralPortal/ref-verify-otp");
const refResetPassword = require("./routers/referralPortal/resetpassword");
// super admin
const superAdminSignIn = require("./routers/adminDashboard/auth/signin");
const superAdminOtp = require("./routers/adminDashboard/auth/otp");

// ============================================
// MIDDLEWARE SETUP (ORDER MATTERS!)
// ============================================

// 1. Trust proxy (MUST be first for secure cookies)
server.set("trust proxy", 1);

// 2. Body parsers (BEFORE session)
server.use(express.json());
server.use(cookieParser());
server.use(express.json({ limit: "20mb" }));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.urlencoded({ limit: "20mb", extended: true }));
// 3. CORS Configuration (BEFORE session)
const allowedOrigins = [
  "https://wwah.ai",
  "https://www.wwah.ai",
  "http://localhost:3000",
  "https://wwah.vercel.app",
  "https://www.worldwideadmissionshub.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🔍 Incoming Origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ Blocked Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

server.use(cors(corsOptions));
server.options("*", cors(corsOptions));

// 4. Security headers
server.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const isProduction = process.env.NODE_ENV === "production";

const sessionConfig = {
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || process.env.DATABASE_URL,
    ttl: 60 * 10, // 10 minutes
    touchAfter: 24 * 3600,
  }),
  cookie: {
    secure: isProduction,           // false in dev, true in prod
    httpOnly: isProduction,         // false in dev, true in prod
    sameSite: isProduction ? "none" : "lax",  // ✅ KEY FIX: 'lax' in dev, 'none' in prod
    maxAge: 1000 * 60 * 10,         // 10 minutes
  },
  name: "wwah.sid",
  rolling: true,
  
};
server.use(session(sessionConfig));

// ============================================
// SOCKET.IO SETUP
// ============================================

const app = http.createServer(server);
const io = new Server(app, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  socket.on("join", (email) => {
    const userEmail = typeof email === "object" && email.email ? email.email : email;
    socket.userEmail = userEmail;
    socket.join(userEmail);
    console.log(`✅ ${userEmail} joined chat room: [${userEmail}]`);
    socket.emit("joined", { email: userEmail, message: "Successfully joined chat room" });
  });

  socket.on("join_notification_room", ({ userId }) => {
    const userEmail = userId || socket.userEmail;
    if (userEmail) {
      socket.join(`notifications:${userEmail}`);
      socket.emit("notification_room_joined", {
        userId: userEmail,
        message: "Successfully joined notification room",
      });
    }
  });

  socket.on("send_message", async ({ email, text, sender, file }) => {
    const userEmail = typeof email === "object" && email.email ? email.email : email;
    try {
      let chat = await Chat.findOne({ userEmail });
      if (!chat) {
        chat = new Chat({ userEmail, messages: [] });
      }

      const message = { text, sender, timestamp: new Date() };
      if (file) {
        message.file = {
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size,
          s3Key: file.s3Key,
        };
      }

      chat.messages.push(message);
      await chat.save();
      io.to(userEmail).emit("receive_message", message);

      let notificationRecipient = null;
      if (sender === "user") {
        io.to("admin").emit("receive_message", { ...message, userEmail });
        notificationRecipient = "admin";
      } else if (sender === "admin") {
        notificationRecipient = userEmail;
      }

      if (notificationRecipient) {
        const chatRoomSockets = await io.in(notificationRecipient).fetchSockets();
        const isInChatRoom = chatRoomSockets.length > 0;
        if (!isInChatRoom) {
          const notificationData = {
            message: `New message from ${sender === "admin" ? "Admin" : userEmail}`,
            sender,
            username: sender === "admin" ? "Admin" : userEmail,
            text: message.text,
            timestamp: message.timestamp,
            userEmail,
            recipientEmail: notificationRecipient,
          };
          io.to(`notifications:${notificationRecipient}`).emit("new_notification", notificationData);
          console.log(`🔔 Notification sent to: notifications:${notificationRecipient}`);
        } else {
          console.log("👀 Recipient is active in chat, skipping notification");
        }
      }
    } catch (error) {
      console.error("❌ Error processing message:", error);
      socket.emit("error", { message: "Failed to process message" });
    }
  });

  socket.on("disconnect", () => {
    // console.log("🔌 Client disconnected");
  });

  socket.on("ping", () => {
    socket.emit("pong", { timestamp: new Date(), userId: socket.userEmail });
  });
});

// ============================================
// ROUTES
// ============================================

server.use("/signup", signUp);
server.use("/createAdmin", createAdminRoute);
server.use("/signin", signIn);
server.use("/forgotpassword", forgotPassword);
server.use("/verifyOtp", verifyOtp);
server.use("/resetpassword", resetPassword);
server.use("/updateprofile", updateProfile);
server.use("/logout", logout);
server.use("/chatZEUS", chatZEUS);
server.use("/bookappointment", bookAppointment);
server.use("/contactus", contactUs);
server.use("/scheduleSession", scheduleSession);
server.use("/success-chance", successChance);
server.use("/studentDashboard/accommodationBooking", accommodationBooking);
server.use("/studentDashboard/airportPickup", airportPickup);
server.use("/studentDashboard/completeApplication", completeApplication);
server.use("/adminDashboard/adminControls", adminControls);
server.use("/adminDashboard/studentData", studentData);
server.use("/sendMail", sendMail);
server.use("/auth", require("./routers/auth"));
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
server.use("/chat", chatRouter);
server.use("/favorites", toggleFavorites);
server.use("/favorites/toggle", toggleFavorites);
server.use("/appliedCourses", appliedCourses);
server.use("/appliedScholarshipCourses", appliedScholarshipRoutes);
server.use("/getUniversities", require("./routers/getUniversities"));
server.use("/scholarships", favoritescholarship);
server.use("/universities", favoritesuniversity);
server.use("/profile", profile);
server.use("/profile", require("./routers/embedding-refresh"));
server.use("/refportal/signup", refSignUp);
server.use("/refportal/signin", refSignIn);
server.use("/refupdateprofile", refupdateProfile);
server.use("/refprofile", refProfile);
server.use("/refportal/auth", refPortalAuth);
server.use("/refportal", refPortalAuth);
server.use("/refportal/forgotpassword", refforget);
server.use("/refcontact", refcontact);
server.use("/adminDashboard/mbaData", mbaData);
server.use("/adminDashboard/referrals", referrals);
server.use("/refportal/commission", commisionRoutes);
server.use("/refportal/email", EmailRoutes);
server.use("/jobapplicationform",jobApplicationForm)
server.use("/sessionbooking",sessionBooking)
server.use("/refral/forgot",refForgotPassword);
server.use("/refal/verify-otp", refverifyOtp);
server.use("/refal/reset-password", refResetPassword);
server.use("/superadmin/signin", superAdminSignIn);
server.use("/superadmin/otp", superAdminOtp);

// ============================================
// Default routes
server.get("/", async (req, res) => {
  try {
    res.json({ message: "This is Home Page From Backend" });
  } catch (error) {
    res.status(500).json({ message: `There is some Error in Server: ${error}` });
  }
});

server.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running smoothly" });
});

server.get("/admin/chats", async (req, res) => {
  console.log("Fetching all chats for admin");
  const chats = await Chat.find();
  res.json(chats);
});

server.get("/chat/messages/:email", async (req, res) => {
  try {
    const chat = await Chat.findOne({ userEmail: req.params.email });
    res.json(chat ? chat.messages : []);
  } catch (err) {
    console.error("❌ Error fetching chat:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Centralized error handler
server.use((err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);
  res.status(500).json({ 
    message: "Internal Server Error, Cause in Main Server", 
    success: false 
  });
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 The Server is running at port ${port}`);
  console.log(`📦 Session store: MongoDB`);
  console.log(`🔒 Secure cookies: ${process.env.NODE_ENV === "production"}`);
});