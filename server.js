// server.js
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
const http = require("http");
const { Server } = require("socket.io");
const Chat = require("./database/models/Chat");

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
const adminControls = require("./routers/adminDashboard/adminControls");
const createAdminRoute = require("./routers/createAdmin");
const studentData = require("./routers/adminDashboard/studentData");
const successChance = require("./routers/success-chance");
const sendMail = require("./routers/sendMail");
const chatRouter = require("./routers/counselorChat");
const favorites = require("./routers/favourites");
const toggleFavorites = require("./routers/favourites");
const appliedcourses = require("./routers/appliedCourses");

const path = require("path");
// Middleware
const app = http.createServer(server);
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://wwah.vercel.app",
    "https://www.worldwideadmissionshub.com",
    "https://www.wwah.ai",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};
server.use(cors(corsOptions)); // Enable CORS with specific options

const io = new Server(app, {
  cors: corsOptions,
});
// ✅ Handle preflight (OPTIONS) requests globally
// server.options("*", cors(corsOptions));

io.on("connection", (socket) => {
  // console.log("🔌 New client connected:", socket.id);
  // ✅ Handle regular room join
  socket.on("join", (email) => {
    const userEmail =
      typeof email === "object" && email.email ? email.email : email;
    socket.userEmail = userEmail;
    socket.join(userEmail);
    console.log(`✅ ${userEmail} joined chat room: [${userEmail}]`);

    socket.emit("joined", {
      email: userEmail,
      message: "Successfully joined chat room",
    });
  });

  // ✅ Handle notification room join (SEPARATE EVENT)
  socket.on("join_notification_room", ({ userId }) => {
    const userEmail = userId || socket.userEmail;
    if (userEmail) {
      socket.join(`notifications:${userEmail}`);
      // console.log(
      //   `🔔 ${userEmail} joined notification room: [notifications:${userEmail}]`
      // );

      socket.emit("notification_room_joined", {
        userId: userEmail,
        message: "Successfully joined notification room",
      });
    }
  });

  socket.on("send_message", async ({ email, text, sender, file }) => {
    const userEmail =
      typeof email === "object" && email.email ? email.email : email;

    try {
      let chat = await Chat.findOne({ userEmail });
      if (!chat) {
        chat = new Chat({ userEmail, messages: [] });
      }

      const message = {
        text,
        sender,
        timestamp: new Date(),
      };

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

      // Send message to chat room
      io.to(userEmail).emit("receive_message", message);

      let notificationRecipient = null;

      if (sender === "user") {
        // User sent message, notify admin
        io.to("admin").emit("receive_message", { ...message, userEmail });
        notificationRecipient = "admin";
      } else if (sender === "admin") {
        // Admin sent message, notify the specific user
        notificationRecipient = userEmail;
      }

      // ✅ IMPROVED NOTIFICATION LOGIC
      if (notificationRecipient) {
        const chatRoomSockets = await io
          .in(notificationRecipient)
          .fetchSockets();
        const isInChatRoom = chatRoomSockets.length > 0;

        // console.log(
        //   `🔍 Checking if ${notificationRecipient} is in chat room: ${isInChatRoom}`
        // );

        if (!isInChatRoom) {
          const notificationData = {
            message: `New message from ${sender === "admin" ? "Admin" : userEmail
              }`,
            sender,
            username: sender === "admin" ? "Admin" : userEmail,
            text: message.text,
            timestamp: message.timestamp,
            userEmail,
            recipientEmail: notificationRecipient,
          };

          io.to(`notifications:${notificationRecipient}`).emit(
            "new_notification",
            notificationData
          );
          console.log(
            `🔔 Notification sent to: notifications:${notificationRecipient}`
          );
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
    console.log(
      "🔌 Client disconnected:",
      socket.id,
      "User:",
      socket.userEmail
    );
  });

  // ✅ Debug event
  socket.on("ping", () => {
    // console.log("🏓 Ping received from client:", socket.id);
    socket.emit("pong", { timestamp: new Date(), userId: socket.userEmail });
  });
});


server.use(helmet()); // Add security headers
server.use(express.json()); // Built-in JSON parser
server.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
server.use(cookieParser());

server.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // true if you're using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 10, // 10 minutes
      sameSite: "none"
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
server.use("/appliedcourses", appliedcourses);

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

//for running script for automatically updating embeddings
// watchCollections().catch((err) =>
//   console.error("❌ Failed to start Change Stream Watcher:", err)
// );
// Health check route
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
  res.status(500).json({ message: "Internal Server Error" });
});

// Starting the server
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`The Server is running at port ${port}`);
});
