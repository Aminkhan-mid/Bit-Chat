export {userDetails}
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
            <img src="./imgs/CubeShapeGif.gif" alt="skull">
    </div>`
    createAccBtn.innerHTML = "Building Profile..."
    createAccBtn.style.cursor = "none"
}

function showAccountCreated() {
  createAccBody.innerHTML = `
  <img class="confettiGif" src="./imgs/confettiGif.gif">
    <div class="account-created">
      <img class="selected-icon" src="${selectedIconSrc}" alt="${selectedIconAlt}">
      <p>@${usernameInput.value}</p>
      <h2>Account Created 🥳</h2>
    </div>`;
    localStorage.setItem("userName", usernameInput.value)
}

 createAccBtn.addEventListener("click", ()=>{
    if(!selectedIconSrc || !usernameInput.value.trim()){
        alert("Please choose an icon and enter a username first!")
        return
    }
    buildingProfile()
    setTimeout(() => {
        showAccountCreated()
    
    setTimeout(()=> {
        window.location.href = "./home.html"
    }, 3000)

    }, 3000)
})


let selectedIconSrc = null
let selectedIconAlt = null
getMatchingIcon()

const userDetails = {
    name: savedUserName,
    src: savedUserPfp
}
console.log("Create Account:", userDetails)

