const displayNav = document.getElementById("nav")
const uSrc = localStorage.getItem("pfpSrc") || "No Ppf"
const uName = localStorage.getItem("userName") || "Anonymous"
const sendBtn = document.getElementById("sendBtn")
const msgInput = document.getElementById("msgInput")
const chatBox = document.getElementById("chatBox")

// 🕓 Load last 100 messages from Firebase in order
db.ref("messages")
  .orderByChild("timestamp")
  .limitToLast(100)
  .on("value", (snapshot) => {
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
            <img class="uSrc" src="${uSrc}" alt="skull">
            <p>/ @${uName}</p>
        </span>
        <div>
            <img src="../imgs/stash--save-ribbon-solid.png" alt="saved">
            <img src="../imgs/jam--world.png" alt="world"> 
            <img src="../imgs/icon-park-solid--peoples-two.png" alt="all users"> 
        </div>
    </nav>
`

const socket = io()
// Tell server your username
socket.emit("join", uName);

// Handle if name is taken
socket.on("name-taken", () => {
  alert("⚠️ This username is already taken! Choose another.");
  localStorage.removeItem("userName");
  window.location.href = "../CreateAccount/createAcc.html"; // redirect back to signup
});

socket.on("joined", (data) => {
  console.log(`✅ Joined as ${data.name} with color ${data.color}`);
  localStorage.setItem("userColor", data.color);
});




sendBtn.addEventListener("click", () => {
    const msg = msgInput.value.trim()
    if(!msg) return
    socket.emit("chat message", msg) // send msg to server
    msgInput.value = ""

    // Show your message instantly (before Firebase reloads)
    const section = document.createElement("section");
    section.classList.add("text-container");
    section.innerHTML = `
    <p class="user-name" style="color:${localStorage.getItem("userColor") || "#ecea67"}">@${uName}</p>
    <p class="user-text">${msg}</p>
    <p class="text-time">${new Date().toLocaleTimeString()}</p>`;
    chatBox.append(section);
    chatBox.scrollTop = chatBox.scrollHeight;

})



socket.on("chat-message", (data) => {
  const section = document.createElement("section");
  section.classList.add("text-container");
  section.innerHTML = `
    <p class="user-name" style="color:${data.color}">@${data.name}</p>
    <p class="user-text">${data.msg}</p>
    <p class="text-time">${new Date().toLocaleTimeString()}</p>`;

  chatBox.append(section);
  chatBox.scrollTop = chatBox.scrollHeight;

  // 🧠 Save message to Firebase
    db.ref("messages").push({
  ...data,
  time: new Date().toLocaleTimeString(),
  timestamp: Date.now()
});

});
