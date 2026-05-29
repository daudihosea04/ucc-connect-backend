const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const server = http.createServer(app);

// DB
const db = require("./config/db");

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// =========================
// ROUTES
// =========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

app.use("/uploads", express.static("uploads"));

// =========================
// HOME ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("🚀 UCC SYSTEM RUNNING");
});

// =========================
// PUSH NOTIFICATION STORAGE
// =========================
let tokens = [];

app.post("/api/save-token", (req, res) => {
  const { token } = req.body;

  if (token) {
    tokens.push(token);
    console.log("📱 Token saved:", token);
  }

  res.json({ success: true });
});

// =========================
// 🔥 TEST PUSH NOTIFICATION
// 📍 EXACT POSITION (HERE)
// =========================
app.post("/api/test-push", async (req, res) => {
  const admin = require("firebase-admin");

  const message = {
    notification: {
      title: "🎓 UCC System",
      body: "New assignment uploaded!",
    },
    token: tokens[0],
  };

  try {
    await admin.messaging().send(message);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ error: err.message });
  }
});

// =========================
// SOCKET.IO
// =========================
const io = new Server(server, {
  cors: { origin: "*" },
});

// JWT AUTH SOCKET
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) return next(new Error("NO_TOKEN"));

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("INVALID_TOKEN"));
  }
});

// ONLINE USERS
const onlineUsers = new Map();

// SOCKET EVENTS
io.on("connection", (socket) => {
  const user = socket.user;

  console.log("🟢 Connected:", user.name);

  onlineUsers.set(user.id, user);
  io.emit("online_users", Array.from(onlineUsers.values()));

  // JOIN ROOM
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  // CHAT MESSAGE
  socket.on("send_message", (data) => {
    db.query(
      "INSERT INTO messages (room_id, sender, message, role) VALUES (?,?,?,?)",
      [data.roomId, data.sender, data.message, data.role]
    );

    io.to(data.roomId).emit("receive_message", data);
  });

  // NOTIFICATION
  socket.on("notification", (data) => {
    io.to(data.roomId || "global").emit("notification", data);
  });

  // CUSTOM NOTIFICATION
  socket.on("trigger_notification", (data) => {
    io.emit("notification", {
      message: data.message,
      type: data.type || "info",
    });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    onlineUsers.delete(user.id);
    io.emit("online_users", Array.from(onlineUsers.values()));
  });
});

// =========================
// SERVER START
// =========================
server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});