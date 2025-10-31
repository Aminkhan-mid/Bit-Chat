const createAccBtn = document.getElementById("createAcc-btn")
const createAccBody = document.getElementById("createAcc-body")
const usernameInput = document.getElementById("username-input")

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
            <img src="./imgs/robotic-arm.gif" alt="skull">
    </div>`
    createAccBtn.innerHTML = "Building Profile..."
}

function showAccountCreated() {
  createAccBody.innerHTML = `
    <div class="account-created">
      <img class="pfps-icon" src="${selectedIconSrc}" alt="${selectedIconAlt}">
      <p>@${usernameInput.value}</p>
    </div>`;
}

 createAccBtn.addEventListener("click", ()=>{
    if(!selectedIconSrc || !usernameInput.value.trim()){
        alert("Please choose an icon and enter a username first!")
        return
    }
    buildingProfile()
    setTimeout(() => {showAccountCreated()}, 2000)
})


let selectedIconSrc = null
let selectedIconAlt = null
getMatchingIcon()

//  createAccBody.innerHTML = window.location.href = "./home.html"}, 10000)