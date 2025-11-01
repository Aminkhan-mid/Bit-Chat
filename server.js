import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // or your frontend URL if you want to restrict it
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000
app.use(express.static("public"));

const users = {}; // { socketId: { name, color } }
const nameColorMap = {}; // { name: color } to reuse same color

// Function to generate a unique color for each user
function randomColor() {
  const colors = ["#E85D75", "#CAF0F8", "#D96C06", "#fca311", "#ecea67", "#00c851", "#ffb703", "#8338ec", "#3a86ff", "#ff006e"];
  
  // Get all colors currently being used
  const usedColors = Object.values(users).map(u => u.color);
  
  // Filter to get unused colors
  const available = colors.filter(c => !usedColors.includes(c));
  
  // Pick from available colors or fallback to any color if all used
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return colors[Math.floor(Math.random() * colors.length)];
}

io.on("connection", (socket) => {
  console.log("🥳 A user connected!");

  socket.on("join", (userName) => {
    const nameTaken = Object.values(users).some(u => u.name === userName);
    if (nameTaken) {
      socket.emit("name-taken");
      return;
    }

    // Get color (reuse if user reconnected)
    let color = nameColorMap[userName];
    if (!color) {
      color = randomColor();
      nameColorMap[userName] = color;
    }

    users[socket.id] = { name: userName, color };

    console.log(`👤 ${userName} joined with color ${color}`);
    socket.emit("joined", { name: userName, color });
  });


  // When chat message received
  socket.on("chat message", (msg) => {
    const user = users[socket.id];
    if (!user) return;
    io.emit("chat message", { name: user.name, color: user.color, msg });
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
