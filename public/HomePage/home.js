const displayNav = document.getElementById("nav");
const uSrc = localStorage.getItem("pfpSrc") || "No Pfp";
const uName = localStorage.getItem("userName") || "Anonymous";
const resetChats = document.getElementById("resetChats")
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("msgInput");
const chatBox = document.getElementById("chatBox");

// ✅ Connect to your deployed Socket.io server
const socket = io("https://bit-chat-nmy3.onrender.com", {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("🥳 Connected to Render!");
  socket.emit("join", uName);
});

// 🧭 Display top navigation
displayNav.innerHTML = `
  <nav>
    <span>
      <img class="uSrc" src="${uSrc}" alt="pfp">
      <p>/ @${uName}</p>
    </span>
    <div>
      <button id="resetChats">Reset</button>
    </div>
  </nav>
`;


socket.on("name-taken", () => {
  alert("⚠️ This username is already taken! Choose another.");
  localStorage.removeItem("userName");
  window.location.href = "../CreateAccount/createAcc.html";
});

socket.on("joined", (data) => {
  console.log(`✅ Joined as ${data.name} (${data.color})`);
  localStorage.setItem("userColor", data.color);
});

// ✉️ Send new message
sendBtn.addEventListener("click", () => {
  const msg = msgInput.value.trim();
  if (!msg) return;
  socket.emit("chat message", msg);
  msgInput.value = "";
});

// 🕓 Load old messages (from Firebase via server)
socket.on("load old messages", (messages) => {
  console.log("🕓 Loading old messages:", messages.length);
  chatBox.innerHTML = "";

  messages.forEach((data) => {
    appendMessage(data);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
});

// 💬 Receive new chat messages
socket.on("chat message", (data) => {
  appendMessage(data);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// 🧩 Helper function to render a message
function appendMessage(data) {
  const section = document.createElement("section");
  section.classList.add("text-container");

  // 🕒 Convert UTC time to local
  const localTime = new Date(data.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  section.innerHTML = `
    <p class="user-name" style="color:${data.color}">@${data.name}</p>
    <p class="user-text">${data.msg}</p>
    <p class="text-time">${localTime}</p>
  `;

  chatBox.append(section);
}



resetChats.addEventListener("click", () => {
  if (confirm("⚠️ Are you sure you want to delete all chats? This cannot be undone!")) {
    socket.emit("reset chats");
  }
});

socket.on("chats reset", () => {
  chatBox.innerHTML = "";
  alert("✅ All chats have been deleted!");
});