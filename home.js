const nav = document.getElementById("nav")
const uSrc = localStorage.getItem("pfpSrc")
const uName = localStorage.getItem("userName")
console.log(uSrc)
console.log(uName)

nav.innerHTML = `
    <nav>
        <span>
            <img class="uSrc" src="${uSrc}" alt="skull">
            <p>/ @${uName}</p>
        </span>
        <div>
            <img src="./imgs/stash--save-ribbon-solid.png" alt="saved">
            <img src="./imgs/jam--world.png" alt="world"> 
            <img src="./imgs/icon-park-solid--peoples-two.png" alt="all users"> 
        </div>
    </nav>
`

