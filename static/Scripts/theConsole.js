console.warn("↓↓↓ May look funky on small screen ↓↓↓");
console.log("%c\n" +
"                                                                           \n" +
"  ██████╗ ███████╗██████╗  █████╗ ███████╗                                 \n" +
"  ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝                                 \n" +
"  ██████╔╝█████╗  ██║  ██║███████║███████╗                                 \n" +
"  ██╔══██╗██╔══╝  ██║  ██║██╔══██║╚════██║                                 \n" +
"  ██║  ██║███████╗██████╔╝██║  ██║███████║                                 \n" +
"  ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝                                 \n" +
"  ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗   \n" +
"  ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗  \n" +
"  ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║  \n" +
"  ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║  \n" +
"  ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝  \n" +
"  ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝   \n" +
"                                                                           \n",
"color: #007bf6; background: #002855;");

let keysCompleted = 0;
const keys = [
    { code: 38, name: "ArrowUp" },
    { code: 38, name: "ArrowUp" },
    { code: 40, name: "ArrowDown" },
    { code: 40, name: "ArrowDown" },
    { code: 37, name: "ArrowLeft" },
    { code: 39, name: "ArrowRight" },
    { code: 37, name: "ArrowLeft" },
    { code: 39, name: "ArrowRight" },
    { code: 66, name: "b" },
    { code: 65, name: "a" }
]
let releasedKey = true;
const consoleApp = document.getElementById("console-app");
let activated = false;
gsap.set(consoleApp, { display: "none", autoAlpha: 0, scale: 2 });
document.addEventListener("keydown", function(e) {
    if (releasedKey)
    {
        if (keys[keysCompleted].code == e.keyCode || keys[keysCompleted].name == e.key)
            keysCompleted++;
        else
            keysCompleted = 0;
        if (keysCompleted == 10) {
            keysCompleted = 0;
            activated = !activated;
            gsap.to(consoleApp, activated ? { display: "block", autoAlpha:  1, scale: 1, ease: "expo.out" } : { display: "none", autoAlpha: 0, scale: 2, ease: "expo.out" });  
        }
        releasedKey = false;
    }
});
document.addEventListener("keyup", function() { releasedKey = true; });