/*--------------------------Audio System--------------------------*/
let currentSounds = [];
let globalVolume = 1;
function PlaySound(src, volume) {
	const soundElement = document.createElement("audio");
	soundElement.src = src;
	soundElement.setAttribute("data-volume", volume);
	soundElement.volume = volume * globalVolume;
	soundElement.play();
	document.body.appendChild(soundElement);
	currentSounds.push(soundElement);
	return soundElement;
}
function StopSound(removeSound) {
	let soundIndex = currentSounds.findIndex(function(sound) { return sound === removeSound; });
	if (soundIndex != -1) {
		currentSounds[soundIndex].pause();
		currentSounds.splice(soundIndex, 1);
	}
}
function SetGlobalVolume(newGlobal) {
	currentSounds.forEach(function(audio) { audio.volume = parseFloat(audio.getAttribute("data-volume")) * newGlobal; });
	globalVolume = newGlobal;
}

/*--------------------------Message System--------------------------*/
let xmlhttp = new XMLHttpRequest();
let messages = [];
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
	messages = JSON.parse(this.responseText);
	messageTime = new Date().toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
	const messagesFragment = document.createDocumentFragment();
	messages.forEach(function(message) {
		AddMessage(`<h1>${message.title}</h1><h2>${messageTime}</h2><p>${message.contents}</p>`, messagesFragment);
	});
	PushMessages(messagesFragment);
  }
};
xmlhttp.open("GET", "../static/Jsons/MyMessages.json", true);
xmlhttp.send();

const messagesMenu = document.getElementById("message-menu");
let scrollHideTimer = null;
messagesMenu.addEventListener('scroll', function() {
	messagesMenu.classList.add("scrolling");
	if (timer !== null)
	{
		scrollHideTimer.kill();
		scrollHideTimer = null;
	}
	scrollHideTimer = gsap.delayedCall(5, function() { messagesMenu.classList.remove("scrolling"); });
});
const messagesQuanity = document.getElementById("messages-num");
gsap.set(messagesQuanity, { autoAlpha: 0 });
function AddMessage(htmlContents, fragment) {
	const message = document.createElement("li");
	message.classList.add("message");
	const messageContents = document.createElement("section");
	messageContents.innerHTML = htmlContents;
	message.appendChild(messageContents);
	fragment.appendChild(message);
	gsap.to(messagesQuanity, { autoAlpha: 1, duration: 1, ease: "Power2.out" });

	const buttonsPanel = document.createElement("section");
	message.appendChild(buttonsPanel);

	const clearButton = document.createElement("button");
	clearButton.onclick = function(e) { e.stopPropagation(); RemoveMessage(message); };
	buttonsPanel.appendChild(clearButton);
	const clearImg = document.createElement("img");
	clearImg.src = "../static/SVGs/close.svg";
	clearImg.alt = "clear";
	clearButton.appendChild(clearImg);

	const expandButton = document.createElement("button");
	expandButton.onclick = function() { message.classList.toggle("expand"); };
	expandButton.classList.add("expand-button");
	buttonsPanel.appendChild(expandButton);
	const expandImg = document.createElement("img");
	expandImg.src = "../static/SVGs/expand.svg";
	expandImg.alt = "expand";
	expandButton.appendChild(expandImg);
}
function PushMessages(fragment) {
	messagesMenu.appendChild(fragment);
	const messageNum = messagesMenu.children.length;
	if (messageNum >= 1)
		messagesQuanity.firstElementChild.textContent = messageNum;
}
function RemoveMessage(message) {
	//Get values for animating
	const messageSiblings = NextSiblings(message);
	const messageHeight = parseFloat(getComputedStyle(message).getPropertyValue("margin-top")) + message.offsetHeight;

	//Animating deletion sequence
	const deleteAnim = new gsap.timeline({ defaults: { duration: .5, ease: "Power2.out", overwrite: true }, onComplete: function() {
		message.remove();
	}}).to(message, { x: "150%" });
	if (messageSiblings.length > 0) {
		deleteAnim.to(messageSiblings, { y: -messageHeight, stagger: .1, onComplete: function() {	
			TweenMax.set(messageSiblings, { clearProps: "all" });
		}});
	}

	//Update message quantity
	const newNum = parseInt(messagesQuanity.firstElementChild.innerText) - 1
	messagesQuanity.firstElementChild.innerText = newNum;
	if (newNum <= 0) {
		const noMessagesDiv = document.createElement("div");
		noMessagesDiv.innerHTML = "<h1>No recent notifications</h1>";
		noMessagesDiv.id = "no-messages";
		messagesMenu.appendChild(noMessagesDiv);

		gsap.to(messagesQuanity, { autoAlpha: 0, duration: 1, ease: "Power2.out" });
	}
}

/*--------------------------Menu Updates--------------------------*/
const osMenu = document.getElementById("os-menu");

const volumeMenu = document.getElementById("audio-menu");
const volumeIcon = volumeMenu.firstElementChild.firstElementChild;
const volumeSlider = document.getElementById("volume");
const volumePercent = volumeMenu.lastElementChild;
volumeIcon.onclick = function() {
	SetGlobalVolume(globalVolume == 0 ? volumeSlider.value / 100 : 0);
	volumeIcon.src = globalVolume == 0 ? "../static/SVGs/mute.svg" : "../static/SVGs/audio.svg";
}
volumeSlider.oninput = function() {
	SliderFill(volumeSlider);
	volumePercent.textContent = volumeSlider.value + "%";
	SetGlobalVolume(volumeSlider.value / 100);
	volumeIcon.src = globalVolume == 0 ? "../static/SVGs/mute.svg" : "../static/SVGs/audio.svg";
}

const batteryElement = document.getElementById("battery");
const batteryBar = batteryElement.lastElementChild;
const batteryPercent = document.getElementById("battery-percent");
const batteryTime = document.getElementById("battery-time");
const batteryVals = {
	low: .3,
	getWidth: gsap.utils.interpolate(0, parseFloat(batteryBar.getAttribute("width"))),
	setBattery: function(percent) {
		batteryBar.setAttribute("width", this.getWidth(percent));

		batteryPercent.textContent = Math.floor(percent * 100) + "%";

		const isLow = batteryElement.classList.contains("low");
		if (!isLow && percent < this.low)
			batteryElement.classList.add("low");
		else if (isLow && percent > this.low)
			batteryElement.classList.remove("low");
	},
}
if ('getBattery' in navigator) {
	navigator.getBattery().then(function(battery) {
		battery.onchargingchange = function() {
			const charging = batteryElement.classList.contains("charging");
			if (charging && !battery.charging)
				batteryElement.classList.remove("charging");
			else if (!charging && battery.charging)
				batteryElement.classList.add("charging");
			UpdateTimeRemaining();
		};
		battery.onlevelchange = function() {
			batteryVals.setBattery(battery.level);
			UpdateTimeRemaining();
		};
		function UpdateTimeRemaining() {
			batteryTime.textContent = battery.charging ? 
				isFinite(battery.chargingTime) && battery.chargingTime > 0 ? Math.floor(battery.chargingTime / 60) + " minutes until 100%" : "" :
				isFinite(battery.dischargingTime) && battery.dischargingTime > 0 ? Math.floor(battery.dischargingTime / 60) + " minutes remaining" : "";
			batteryTime.style.display = batteryTime.textContent === "" ? "none": null;
		}
		battery.onchargingchange();
		battery.onlevelchange();
	});
}
else {
	console.log("getBattery not supported!");
	batteryVals.setBattery(Math.random());
}

function TimeFormattingSupport() {
	try {
		new Intl.DateTimeFormat("i");
	} catch (e) {
		return e.name === 'RangeError';
	}
	return false;
}

if (TimeFormattingSupport()) {
	//Get needed elements
	const timeElement = document.getElementById("time").lastElementChild.lastElementChild;
	const detailedTime = document.getElementById("detailed-time");
	const date = document.getElementById("date");
	const hourHand = document.getElementById("hour-hand");
	const minuteHand = document.getElementById("minute-hand");
	const secondHand = document.getElementById("second-hand");

	//Set other important variables
	const timeFormat = new Intl.DateTimeFormat(navigator.language, { hour: '2-digit', minute: '2-digit' });
	const mobileTimeFormat = new Intl.DateTimeFormat(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false });
	let currentTime = new Date();
	date.textContent = currentTime.toLocaleDateString(navigator.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	todaysDate = currentTime.toLocaleDateString();
	const interpolate360 = gsap.utils.interpolate(0, 360);

	//Update With Screen Change
	mediaTester.addEventListener("change", function() {time(true)});

	function time(forceUpdate) {
		//Update Time
		const lastTime = currentTime;
		currentTime = new Date();

		let updateTimes = forceUpdate;
		if (updateTimes || lastTime.getHours() != currentTime.getHours())
		{
			updateTimes = true;
			gsap.to(hourHand, { rotate: interpolate360((currentTime.getHours() % 12) / 12) + "_cw", transformOrigin: "bottom", duration: .5, ease: Elastic.out });
		}
		if (updateTimes || lastTime.getMinutes() != currentTime.getMinutes())
		{
			updateTimes = true;
			timeElement.textContent = !smallScreen ? timeFormat.format(currentTime) + "\r\n" + todaysDate : mobileTimeFormat.format(currentTime);
			gsap.to(minuteHand, { rotate: interpolate360(currentTime.getMinutes() / 60) + "_cw", transformOrigin: "bottom", duration: .5, ease: Elastic.out });
		}
		if (updateTimes || lastTime.getSeconds() != currentTime.getSeconds())
		{
			updateTimes = true;
			detailedTime.textContent = currentTime.toLocaleTimeString();
			gsap.to(secondHand, { rotate: interpolate360(currentTime.getSeconds() / 60) + "_cw", transformOrigin: "bottom", duration: .5, ease: Elastic.out });
		}
		//Repeat
		requestAnimationFrame(function() { time() });
	};
	time(true);
}

/*--------------------------Intro--------------------------*/
const powerButton = document.getElementById("power-button");
const introDiv = document.getElementById("intro");
const introText = document.getElementById("intro-text").firstElementChild;
const title = document.getElementsByTagName("title")[0];
const topDash = powerButton.firstElementChild.firstElementChild;
const circleDash = powerButton.firstElementChild.lastElementChild;

let dots = 3;
let bootNum = 0;
let ambience;
const possibleTitles = [
	"Reda_Elmountassir()",
	"Running...",
	"Entering the Mainframe",
	"Generating Simulations",
	"Activating Reda OS"
]
function boot() {
	bootNum = setInterval(function() {
		dots = dots % 3 + 1;
		introText.textContent = "Booting Reda_Elmountassir()" + ".".repeat(dots);
		title.textContent = "Booting" + ".".repeat(dots);
	}, 500);
}
const powerOn = gsap.timeline({ defaults: { ease: "Power2.out", duration: .25 }, paused: true })
	.to(circleDash, { strokeDashoffset: -60, opacity: 0 })
	.to(topDash, { scaleY: 0, opacity: 0, onComplete: boot }, "<.1")
	.to(introText, { y: "0%" })
	.to(introText, { y: "100%" }, ">3")
	.to("#swiper", { duration: 1, x: "-100%" })
	.to(introDiv, { duration: 1, y: "-100%", display: "none" }, "<.25")
	.call(function() {
		clearInterval(bootNum);
		ambience = PlaySound("../static/Audio/ambience.mp3", .1);
		ambience.loop = true;
		setInterval(function() {
			title.textContent = Math.random() < .00001 ? "HEY THIS IS A SECRET" : title.textContent = gsap.utils.random(possibleTitles);
		}, 5000);
	})
	.fromTo("#apps-area button, nav", { opacity: 0 }, { opacity: 1 , duration: 1, stagger: .1 });

function skip(e) {
	//Skip to end
	if ((e.key == "Enter" || e.keyCode == 115) && powerOn.time() < 4)
		powerOn.time(4);
}	
powerButton.onclick = function(e) {
	if (powerOn.isActive()) {
		e.preventDefault();
		return;
	}
	powerButton.disabled = true;
	PlaySound("../static/Audio/power-on.mp3", .05);
	if (!reducedMotion)
		powerOn.play();
	else {
		introDiv.style.display = "none";
		ambience = PlaySound("../static/Audio/ambience.mp3", .1);
		powerOn.time(powerOn.endTime());
		return;
	}
	document.addEventListener("keyup", skip);
}

/*--------------------------Shutdown--------------------------*/
function Shutdown(restart) {
	PlaySound("../static/Audio/power-off.mp3", .05);
	StopSound(ambience);
	gsap.timeline({ defaults: { ease: Power2.easeInOut, duration: .25 } })
		.to(document.body, { scaleY: .007 })
		.to(document.body, { scaleX: 0, onComplete: function() { if (restart) gsap.delayedCall(5, function() { window.location.reload() }); } }, "<.2");
}

/*--------------------------Menus System--------------------------*/
const menuButtons = document.querySelectorAll(".menu-button, .large-menu-button");
for (let i = menuButtons.length - 1; i >= 0; i--) {
	const button = menuButtons[i];
	const menuID = button.getAttribute("data-menu-id");
	if (menuID) {
		const menu = document.getElementById(menuID);
		if (menu) {
			const defaultAction = menu.classList.contains("basic-menu");
			function forceHide() {
				if (menu.classList.contains("show"))
				{
					menu.classList.remove("show");
					if (defaultAction)
						Tipper.utils.positionBelow(menu, { duration: .25 });
				}
			}
			document.addEventListener('mousedown', function(e) { if (!menu.contains(e.target) && !button.contains(e.target)) forceHide(); });
			window.addEventListener('resize', forceHide);

			button.onclick = function(e) {
				e.stopPropagation();
				const opened = menu.classList.toggle("show");
				if (defaultAction)
					opened ? Tipper.utils.positionAbove(button, menu, { duration: .25 }) : Tipper.utils.positionBelow(menu, { duration: .25 });
			};
		}
	}
}

/*--------------------------Options--------------------------*/
let optionsOpen;
const fullscreenSupport = 'onfullscreenchange' in document;
let lightmode = false;
const lightmodeInquires = [
	"Lightmode",
	"Why would you want lightmode?",
	"Ha, I get it! You think your funny. You are sadly mistaken.",
	"Do you want to burn your eyes?",
	"SERIOUSLY?",
	"Masochist. Pure masochism.",
	"Believe me when I say I'm doing you a favor.",
	"You don't understand.",
	"It is for your own good!!!",
	"I will play this game of yours.",
	"Click again.",
	"Click again.",
	"Click again.",
	"Click again.",
	"Click again...",
	"Click again....",
	"Click again.....",
	"And still he persists...",
	"Must you go?",
	"So be it. Don't be crying on the way back.",
	"Let there be light",
	"GO BACK!!!",
	"You could not live with your own failure. Where did that bring you? Back to me.",
	"You're just going back because you're salty aren't you. You'll be back before long.",
	"There is no hope for you. Adios. Vamanos. Bye-ios. I don't care.",
	"Lightmode"
];
let inquiryNum = 0;
let maxInquiries = lightmodeInquires.length - 1;
const filterSupport = 'filter' in document.documentElement.style;
let brightness = 100;

function CreateOptionsWindow() {
	let htmlString = 
		"<header><h1>Settings</h1></header><section>" +
		(filterSupport ? "<label for='lightmode'>Lightmode</label><input class='toggle' type='checkbox' id='lightmode'>" : "<label>light mode not supported on your browser</label>") + 
		(filterSupport ? "<label for='brightness'>Brightness</label><input type='range' min='0' max='100' step='1' value='100' id='brightness' class='slider'>" : "<label>brightness not supported on your browser</label>") + 
		(fullscreenSupport ? "<label for='fullscreen'>Fullscreen<h2>Different from F11 (F11 maximizes your browser, not your window)</h2></label><input class='toggle' type='checkbox' id='fullscreen'>" : "<label>fullscreen not supported on your browser</label>") +
		(support3D ? "<label for='3D-background'>3D Background</label><input class='toggle' type='checkbox' id='3D-background'>" : "<label>3D not supported on your browser</label>") +
		"</section>";
    CreateWindow(htmlString, "Settings", "../static/SVGs/settings.svg", true).id = "settings";

	if (filterSupport) {
		const lightmodeToggle = document.getElementById("lightmode");
		lightmodeToggle.checked = lightmode;
		const lightmodeLabel = lightmodeToggle.previousSibling;
		lightmodeLabel.textContent = lightmodeInquires[inquiryNum];
		lightmodeToggle.onchange = function() {
			if (inquiryNum < maxInquiries) {
				if (inquiryNum > 19) {
					ToggleFilter("hue-rotate", "180deg", document.documentElement, true);
					ToggleFilter("invert", 1, document.documentElement, true);
					lightmode = lightmodeToggle.checked;
				}
				else
					lightmodeToggle.checked = false;
				inquiryNum++;
				lightmodeLabel.textContent = lightmodeInquires[inquiryNum];
			}
			else {
				ToggleFilter("hue-rotate", "180deg", document.documentElement, true);
				ToggleFilter("invert", 1, document.documentElement, true);
				lightmode = lightmodeToggle.checked;
			}
		};

		const brightnessSlider = document.getElementById("brightness");
		brightnessSlider.value = brightness;
		brightnessSlider.oninput = function() {
			SliderFill(brightnessSlider);
			brightness = brightnessSlider.value;
			SetFilter("brightness", brightnessSlider.value / 100, document.documentElement);
		}
	}
	if (fullscreenSupport) {
		fullscreenToggle = document.getElementById("fullscreen");
		fullscreenToggle.checked = document.fullscreenElement != null;
		document.onfullscreenchange = function() {
			if (fullscreenToggle)
				fullscreenToggle.checked = document.fullscreenElement !== null;
		};
		fullscreenToggle.onchange = function() {
			if (document.fullscreenEnabled)
				fullscreenToggle.checked ? document.documentElement.requestFullscreen() : document.exitFullscreen();
			fullscreenToggle.checked = false;
		};
	}
	if (support3D) {
		const background3DToggle = document.getElementById("3D-background");
		background3DToggle.checked = showBackground;
		background3DToggle.onchange = function() { toggle3D(background3DToggle.checked) };
	}
}

/*--------------------------Miscellaneous--------------------------*/
function SliderFill(sliderElement) {
	sliderElement.style.background = `linear-gradient(to right, #024fa1 ${sliderElement.value}%, #454e5e ${sliderElement.value}%)`;
}

/*--------------------------Utils--------------------------*/
function SetFilter(filterName, filterVal, element) {
	let filters = element.style.filter.split(" ");
	let existingFilter = filters.findIndex(function(filter) { return filter.includes(filterName) });
	if (existingFilter != -1) {
		let filter = filters[existingFilter];
		let oldVal = filter.substring(filter.indexOf("(") + 1, filter.indexOf(")"));
		filters[existingFilter] = filter.replace(oldVal, filterVal);
	}
	else
		filters.push(filterName + `(${ filterVal })`);
	element.style.filter = filters.join(" ");
}
function RemoveFilter(filterName, element) {
	let filters = element.style.filter.split(" ");
	let existingFilter = filters.findIndex(function(filter) { return filter.includes(filterName) });
	if (existingFilter != -1)
		filters.splice(existingFilter, 1);
	element.style.filter = filters.join(" ");
}
function ToggleFilter(filterName, filterVal, element, addToBeginning) {
	let filters = element.style.filter.split(" ");
	let existingFilter = filters.findIndex(function(filter) { return filter.includes(filterName) });
	if (existingFilter != -1)
		filters.splice(existingFilter, 1);
	else {
		if (addToBeginning)
			filters.unshift(filterName + `(${ filterVal })`);
		else
			filters.push(filterName + `(${ filterVal })`);
	}
	element.style.filter = filters.join(" ");
}
function NextSiblings(element) {
	nextSiblings = [];
	currentElement = element.nextSibling;
	while (currentElement) {
		nextSiblings.push(currentElement);
		currentElement = currentElement.nextSibling;
	}
	return nextSiblings;
}