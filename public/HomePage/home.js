const displayNav = document.getElementById("nav");
const uSrc = localStorage.getItem("pfpSrc") || "No Ppf";
const uName = localStorage.getItem("userName") || "Anonymous";
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("msgInput");
const chatBox = document.getElementById("chatBox");

const socket = io("https://bit-chat-nmy3.onrender.com", {
  transports: ["websocket"]
});

// ✅ Load last 100 messages once from Firebase
db.ref("messages")
  .orderByChild("timestamp")
  .limitToLast(100)
  .once("value")
  .then((snapshot) => {
    chatBox.innerHTML = "";

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();

      const section = document.createElement("section");
      section.classList.add("text-container");
      section.innerHTML = `
        <p class="user-name" style="color:${data.color}">@${data.name}</p>
        <p class="user-text">${data.msg}</p>
        <p class="text-time">${data.time || "⏰"}</p>`;
      chatBox.append(section);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });

displayNav.innerHTML = `
  <nav>
    <span>
      <img class="uSrc" src="${uSrc}" alt="pfp">
      <p>/ @${uName}</p>
    </span>
    <div>
      <img src="../imgs/stash--save-ribbon-solid.png" alt="saved">
      <img src="../imgs/jam--world.png" alt="world"> 
      <img src="../imgs/icon-park-solid--peoples-two.png" alt="users"> 
    </div>
  </nav>
`;

socket.on("connect", () => {
  console.log("🥳 Connected to Render!");
});

socket.emit("join", uName);

socket.on("name-taken", () => {
  alert("⚠️ This username is already taken! Choose another.");
  localStorage.removeItem("userName");
  window.location.href = "../CreateAccount/createAcc.html";
});

socket.on("joined", (data) => {
  console.log(`✅ Joined as ${data.name} (${data.color})`);
  localStorage.setItem("userColor", data.color);
});

sendBtn.addEventListener("click", () => {
  const msg = msgInput.value.trim();
  if (!msg) return;

  socket.emit("chat message", msg);
  msgInput.value = "";

  const section = document.createElement("section");
  section.classList.add("text-container");
  section.innerHTML = `
    <p class="user-name" style="color:${localStorage.getItem("userColor") || "#ecea67"}">@${uName}</p>
    <p class="user-text">${msg}</p>
    <p class="text-time">${new Date().toLocaleTimeString()}</p>`;
  chatBox.append(section);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("chat message", (data) => {
  const section = document.createElement("section");
  section.classList.add("text-container");
  section.innerHTML = `
    <p class="user-name" style="color:${data.color}">@${data.name}</p>
    <p class="user-text">${data.msg}</p>
    <p class="text-time">${data.time}</p>`;
  chatBox.append(section);
  chatBox.scrollTop = chatBox.scrollHeight;
});
