const displayNav = document.getElementById("nav");
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("msgInput");

const uSrc = localStorage.getItem("pfpSrc") || "No Pfp";
const uName = localStorage.getItem("userName") || "Anonymous";

// ✅ Connect to Socket.io server
const socket = io("https://bit-chat-nmy3.onrender.com", {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("🥳 Connected to Render!");
  socket.emit("join", uName);
});

// 🧭 Navigation bar
displayNav.innerHTML = `
  <nav>
    <span>
      <img class="uSrc" src="${uSrc}" alt="pfp">
      <p>/ @${uName}</p>
    </span>
    <button id="resetChats">Reset</button>
  </nav>
`;

// 🧹 Reset all chats
const resetChats = document.getElementById("resetChats");
resetChats.addEventListener("click", () => {
  if (confirm("⚠️ Are you sure you want to delete all chats?")) {
    socket.emit("reset chats");
  }
});

socket.on("chats reset", () => {
  chatBox.innerHTML = "";
  alert("✅ All chats deleted!");
});

// 🧍 User handling
socket.on("name-taken", () => {
  alert("⚠️ This username is already taken!");
  localStorage.removeItem("userName");
  window.location.href = "../CreateAccount/createAcc.html";
});

socket.on("joined", (data) => {
  console.log(`✅ Joined as ${data.name}`);
  localStorage.setItem("userColor", data.color);
});

// ✉️ Send message
sendBtn.addEventListener("click", () => {
  const msg = msgInput.value.trim();
  if (!msg) return;
  socket.emit("chat message", msg);
  msgInput.value = "";
});

// 🕓 Load old messages
socket.on("load old messages", (messages) => {
  chatBox.innerHTML = "";
  messages.sort((a, b) => a.timestamp - b.timestamp)
    .forEach(data => appendMessage(data));
  chatBox.scrollTop = chatBox.scrollHeight;
});

// 💬 Receive new message
socket.on("chat message", (data) => {
  appendMessage(data);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// 🧩 Render message
function appendMessage(data) {
  const section = document.createElement("section");
  section.classList.add("text-container");
  section.dataset.id = data.id;
  section.dataset.name = data.name;

  const localTime = new Date(data.timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  section.innerHTML = `
    <p class="user-name" style="color:${data.color}">@${data.name}</p>
    <p class="user-text">${data.msg}</p>
    <p class="text-time">${localTime}</p>
  `;

  // 👇 Long-press (mobile) to show delete button if it's your own message
  if (data.name === uName) {
    let pressTimer;

    // For touch (mobile)
    section.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
        showDeleteButton(section, data.id);
      }, 1000); // hold for 1 second
    });
    section.addEventListener("touchend", () => clearTimeout(pressTimer));

    // For desktop (optional fallback)
    section.addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => {
        showDeleteButton(section, data.id);
      }, 1000);
    });
    section.addEventListener("mouseup", () => clearTimeout(pressTimer));
    section.addEventListener("mouseleave", () => clearTimeout(pressTimer));
  }

  chatBox.append(section);
}

// 🗑 Create and show delete button
function showDeleteButton(section, msgId) {
  if (section.querySelector(".delete-btn")) return;
  const delBtn = document.createElement("button");
  delBtn.classList.add("delete-btn");
  delBtn.textContent = "🗑 Delete";

  delBtn.addEventListener("click", () => {
    if (confirm("Delete this message?")) {
      socket.emit("delete message", msgId);
    }
  });

  section.append(delBtn);

  // Auto-hide after 4s
  setTimeout(() => delBtn.remove(), 4000);
}

// 🔔 When a message is deleted
socket.on("message deleted", (msgId) => {
  const msg = document.querySelector(`[data-id="${msgId}"]`);
  if (msg) {
    msg.classList.add("fade-out");
    setTimeout(() => msg.remove(), 400); // remove after animation ends
  }
});
