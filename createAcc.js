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

 createAccBtn.addEventListener("click", ()=>{
    buildingProfile()
    setInterval(()=>{
        createAccBody.innerHTML = window.location.href = "./home.html"}, 10000)
})


function buildingProfile(){
    document.getElementById("building-profile").innerHTML = `
    <div class="creating-account">
            <img src="./imgs/robotic-arm.gif" alt="skull">
    </div>`
    createAccBtn.innerHTML = "Building Profile..."
}

