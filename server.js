import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import admin from "firebase-admin";

// =======================
// 🔥 Firebase Setup
// =======================
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bit-chat-986cf-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

// =======================
// ⚙️ Express + Socket.io Setup
// =======================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// =======================
// 👥 User Tracking
// =======================
const users = {};
const nameColorMap = {};

// =======================
// 🎨 Random Unique Color
// =======================
function randomColor() {
  const colors = [
    "#E85D75", "#CAF0F8", "#D96C06", "#fca311", "#ecea67",
    "#00c851", "#ffb703", "#8338ec", "#3a86ff", "#ff006e"
  ];
  const usedColors = Object.values(users).map(u => u.color);
  const available = colors.filter(c => !usedColors.includes(c));
  return available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : colors[Math.floor(Math.random() * colors.length)];
}

// =======================
// ⚡ Socket.io Logic
// =======================
io.on("connection", (socket) => {
  console.log("🥳 A user connected!");

  // 🕓 Load and send last 100 messages
  db.ref("messages")
    .orderByChild("timestamp")
    .limitToLast(100)
    .once("value")
    .then((snapshot) => {
      if (!snapshot.exists()) {
        socket.emit("load old messages", []);
        return;
      }

      const messages = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });

      socket.emit("load old messages", messages);
    })
    .catch((err) => console.error("❌ Error loading messages:", err));

  // 🧍 Handle user join
  socket.on("join", (userName) => {
    const nameTaken = Object.values(users).some(u => u.name === userName);
    if (nameTaken) {
      socket.emit("name-taken");
      return;
    }

    let color = nameColorMap[userName];
    if (!color) {
      color = randomColor();
      nameColorMap[userName] = color;
    }

    users[socket.id] = { name: userName, color };
    socket.emit("joined", { name: userName, color });
  });

  // 💬 New chat message
  socket.on("chat message", async (msg) => {
    const user = users[socket.id];
    if (!user) return;

    const data = {
      name: user.name,
      color: user.color,
      msg,
      time: new Date().toLocaleTimeString("en-IN", { hour12: true }),
      timestamp: Date.now()
    };

    const ref = await db.ref("messages").push(data);
    const messageWithId = { id: ref.key, ...data };
    io.emit("chat message", messageWithId);
  });

  // 🧹 Reset all chats
  socket.on("reset chats", async () => {
    try {
      await db.ref("messages").remove();
      io.emit("chats reset");
      console.log("🔥 All chats deleted");
    } catch (err) {
      console.error("❌ Error deleting chats:", err);
    }
  });

  // 🗑 Delete single chat message
  socket.on("delete message", async (msgId) => {
    try {
      await db.ref(`messages/${msgId}`).remove();
      io.emit("message deleted", msgId);
      console.log(`🗑 Message ${msgId} deleted`);
    } catch (err) {
      console.error("❌ Error deleting message:", err);
    }
  });

  // 🔌 Disconnect
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) delete users[socket.id];
  });
});

// =======================
// 🚀 Start Server
// =======================
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
