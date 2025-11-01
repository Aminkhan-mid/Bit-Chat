const displayNav = document.getElementById("nav")
const uSrc = localStorage.getItem("pfpSrc") || "No Ppf"
const uName = localStorage.getItem("userName") || "Anonymous"
const sendBtn = document.getElementById("sendBtn")
const msgInput = document.getElementById("msgInput")
const chatBox = document.getElementById("chatBox")


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

// When joined successfully
socket.on("joined", (data) => {
  console.log(`✅ Joined as ${data.name} with color ${data.color}`);
});



sendBtn.addEventListener("click", () => {
    const msg = msgInput.value.trim()
    if(!msg) return
    socket.emit("chat message", msg) // send msg to server
    msgInput.value = ""
})



socket.on("chat message", (data) => {
  const section = document.createElement("section");
  section.classList.add("text-container");
  section.innerHTML = `
      <p class="user-name" style="color:${data.color}">@${data.name}</p>
      <p class="user-text">${data.msg}</p>
      <p class="text-time">${new Date().toLocaleTimeString()}</p>`;
  chatBox.append(section);
  chatBox.scrollTop = chatBox.scrollHeight;
});


