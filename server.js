import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const users = {}; // { socketId: { name, color } }
const nameColorMap = {}; // { name: color } to reuse same color

// Function to generate random color
function randomColor() {
  const colors = ["#ecea67", "#dc250d", "#32e6e3", "#fca311", "#ecea67", "#00c851"];
  return colors[Math.floor(Math.random() * colors.length)];
}

io.on("connection", (socket) => {
  console.log("🥳 A user connected!");

  // When a user joins with a name
  socket.on("join", (userName) => {
    // Check if username already exists
    const nameTaken = Object.values(users).some(u => u.name === userName);
    if (nameTaken) {
      socket.emit("name-taken");
      return;
    }

    // Assign color (reuse if known)
    const color = nameColorMap[userName] || randomColor();
    nameColorMap[userName] = color;

    // Save user
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



server.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
