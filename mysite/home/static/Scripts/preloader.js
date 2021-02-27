const preloaderDiv = document.getElementById("preloader");
window.addEventListener("load", function() {
    preloaderDiv.style.opacity = 0;
    function hide() { preloaderDiv.classList.add("hide") };
    preloaderDiv.ontransitionend = hide;
    preloaderDiv.onclick = hide;
});