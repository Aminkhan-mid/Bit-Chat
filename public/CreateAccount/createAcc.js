const socket = io()
const createAccBtn = document.getElementById("createAcc-btn")
const createAccBody = document.getElementById("createAcc-body")
const usernameInput = document.getElementById("username-input")
const savedUserName = localStorage.getItem("userName") || "Local storage is empty."
const savedUserPfp = localStorage.getItem("pfpSrc") || "Local storage is empty."


usernameInput.addEventListener("input", ()=> {
    if(usernameInput.value.trim() !== ""){
        createAccBtn.disabled = false
    } else {
        createAccBtn.disabled = true
    }
})


function getMatchingIcon(){
    document.addEventListener("click", (e) => {
        if(!e.target.classList.contains("pfps-icon")) return

        document.querySelectorAll(".pfps-icon").forEach( (m) => {
            if(m.id === e.target.id) {
                m.style.border = "2px solid yellow"
                localStorage.setItem("pfpSrc", m.src)
            } else{
                m.style.border = "1px solid gainsboro"
            }
        })
        selectedIconSrc = e.target.src
        selectedIconAlt = e.target.alt
    })
}

function buildingProfile(){
    document.getElementById("building-profile").innerHTML = `
    <div class="creating-account">
            <img src="../imgs/CubeShapeGif.gif" alt="shape shifting cubes">
    </div>`
    createAccBtn.innerHTML = "Building Profile..."
    createAccBtn.style.cursor = "none"
}

function showAccountCreated() {
  createAccBody.innerHTML = `
  <img class="confettiGif" src="../imgs/confettiGif.gif">
    <div class="account-created">
      <img class="selected-icon" src="${selectedIconSrc}" alt="${selectedIconAlt}">
      <p>@${usernameInput.value}</p>
      <h2>Account Created 🥳</h2>
    </div>`;
    localStorage.setItem("userName", usernameInput.value)
}

createAccBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!selectedIconSrc || !name) {
    alert("Please choose an icon and enter a username first!");
    return;
  }

  // Step 1: Start animation
  buildingProfile();

  // Step 2: Ask the server if username exists
  socket.emit("join", name);

  // Step 3: Wait exactly 3 seconds before deciding what to show
  setTimeout(() => {
    if (!window.serverResponded) {
      // No response (server slow or disconnected)
      document.getElementById("building-profile").innerHTML = `
        <div class="creating-account">
          <p style="color:orange; font-weight:bold;">⚠️ Server not responding. Try again.</p>
        </div>`;
      createAccBtn.innerHTML = "Try Again";
      createAccBtn.style.cursor = "pointer";
    }
  }, 3000);
});

// ✅ When username is already taken
socket.on("name-taken", () => {
  window.serverResponded = true;
  document.getElementById("building-profile").innerHTML = `
    <div class="creating-account">
      <p style="color:red; font-weight:bold;">Username already exists. Pick a new name.</p>
    </div>`;
  createAccBtn.innerHTML = "Try Again";
  createAccBtn.style.cursor = "pointer";
});

// ✅ When username is accepted
socket.on("joined", (data) => {
  window.serverResponded = true;

  // Keep the cube animation for 3 seconds before showing success
  setTimeout(() => {
    showAccountCreated();
    setTimeout(() => {
      window.location.href = "../HomePage/home.html";
    }, 3000);
  }, 3000);
});


let selectedIconSrc = null
let selectedIconAlt = null
getMatchingIcon()




