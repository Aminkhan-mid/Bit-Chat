import "dotenv/config"
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bit-chat-986cf-default-rtdb.asia-southeast1.firebasedatabase.app/"
});


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all frontends (Render + GitHub)
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;


const db = admin.database();

// 🧍 User tracking
const users = {}; // { socketId: { name, color } }
const nameColorMap = {}; // { name: color }

// 🎨 Function to give unique colors
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

// ⚡ Socket.io logic
io.on("connection", (socket) => {
  console.log("🥳 A user connected!");

    // 🕓 Send last 100 messages when a user joins
    const messagesRef = db.ref("messages").orderByChild("timestamp").limitToLast(100);
    messagesRef.once("value", (snapshot) => {
    const messages = [];
    snapshot.forEach((child) => messages.push(child.val()));
    socket.emit("load old messages", messages);
    });


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
    console.log(`👤 ${userName} joined with color ${color}`);
    socket.emit("joined", { name: userName, color });
  });

  // 💬 Handle messages
  socket.on("chat message", async (msg) => {
    const user = users[socket.id];
    if (!user) return;

    const data = {
      name: user.name,
      color: user.color,
      msg,
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now()
    };

    io.emit("chat message", data); // broadcast live
    await db.ref("messages").push(data); // ✅ save to Firebase
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`🔌 ${user.name} disconnected`);
      delete users[socket.id];
    }
  });
});

server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
