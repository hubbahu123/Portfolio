/*--------------------------Tooltip System--------------------------*/
const Tipper = {
	transitionTime: .25,
	Tooltip: function(delay) {
		//Create the tooltip
		const tooltip = document.createElement("div");
		tooltip.classList.add("tooltip");
		const text = document.createElement("h2");
		tooltip.appendChild(text);
		document.body.appendChild(tooltip);

		//Initialize the variables
		this.domElement = tooltip;
		this.delay = delay;
		this.content = text;
	},

	/*-------------Utility Methods-------------*/
	utils: {
		positionAbove: function(target, element, extra) {
			//Get their px bounds
			const targetBounds = target.getBoundingClientRect();
			const elementBounds = element.getBoundingClientRect();
			//Get the new x and y for the element you want to position
			const x = gsap.utils.clamp(0, viewport.vw - elementBounds.width, targetBounds.x + targetBounds.width / 2 - elementBounds.width / 2);
			const startY = targetBounds.top;
			const endY = targetBounds.top - elementBounds.height;

			//Set up the animation objs
			const from = { x, y: startY, autoAlpha: 0 };
			const to = { y: endY, autoAlpha: 1, ease: "Power3.out", overwrite: true };
			//Add extra properties
			if (extra) {
				if (extra.duration) to.duration = extra.duration;
				if (extra.delay) to.delay = extra.delay;
				if (extra.callbackScope) to.callbackScope = extra.callbackScope;
				if (extra.onComplete) to.onComplete = extra.onComplete;
				if (extra.onStart) to.onStart = extra.onStart;
			}
			//Animate
			return gsap.fromTo(element, from, to);
		},
		positionTo: function(target, element, extra) {
			//Get their px bounds
			const targetBounds = target.getBoundingClientRect();
			const elementBounds = element.getBoundingClientRect();
			//Get the new x and y for the element you want to position
			const x = gsap.utils.clamp(0, viewport.vw - elementBounds.width, targetBounds.x + targetBounds.width / 2 - elementBounds.width / 2);
			const y = targetBounds.top - elementBounds.height;

			//Set up the animation objs
			const to = { x, y, autoAlpha: 1, ease: "Power3.out", overwrite: true };
			//Add extra properties
			if (extra) {
				if (extra.duration) to.duration = extra.duration;
				if (extra.delay) to.delay = extra.delay;
				if (extra.callbackScope) to.callbackScope = extra.callbackScope;
				if (extra.onComplete) to.onComplete = extra.onComplete;
			}
			//Animate
			return gsap.to(element, to);
		},
		positionBelow: function(positionObj, extra) {
			//Move down
			const to = { y: "+=" + positionObj.clientHeight, autoAlpha: 0, ease: "Power3.out", overwrite: true };
			//Add extra properties
			if (extra) {
				if (extra.duration) to.duration = extra.duration;
				if (extra.delay) to.delay = extra.delay;
				if (extra.callbackScope) to.callbackScope = extra.callbackScope;
				if (extra.onComplete) to.onComplete = extra.onComplete;
				if (extra.onStart) to.onStart = extra.onStart;
			}
			//Animate
			return gsap.to(positionObj, to);
		}
	}
};
Tipper.Tooltip.prototype.show = function(obj, content) {
	if (this.ignore) return;
	this.content.textContent = content;

	this.visible ?
		Tipper.utils.positionTo(obj, this.domElement, { duration: Tipper.transitionTime }) :
		Tipper.utils.positionAbove(obj, this.domElement, { delay: this.delay, duration: Tipper.transitionTime });
	this.visible = true;
}
Tipper.Tooltip.prototype.hide = function(instant) {
	if (this.ignore || !this.visible) return;
	instant ?
		Tipper.utils.positionBelow(this.domElement, { duration: .1, callbackScope: this, onStart: function() { this.visible = false } }) :
		Tipper.utils.positionBelow(this.domElement, { delay: this.delay, duration: Tipper.transitionTime, callbackScope: this, onStart: function() { this.visible = false; } });
}

/*--------------------------Windows System--------------------------*/
const WindowManager = {
	windowArea: document.getElementById("windows-area"),
	taskbar: document.querySelector("#taskbar ul"),
	windows: [],
	minSize: { width: 25, height: 7 },
	globalDefaults: { x: "25vw", y: "25vh", width: "50vw", height: "50vh" },
	animSpeed: .25,
	taskTooltip: new Tipper.Tooltip(.25),

	ordering: {
		focused: null,
		update: function() {
			const topMost = WindowManager.windows.length - 1;
			WindowManager.windows.forEach(function(window, index) {
				window.order = index;
				if (index === topMost) this.focused = window;
			}, this);
		}
	},

	//Methods
	getWindowByTitle: function(title) {
		for (let i = 0; i < WindowManager.windows.length; i++)
			if (WindowManager.windows[i].title === title) return { exists: true, index: i, window: WindowManager.windows[i] };
		return { exists: false, index: -1, window: null };
	},
	utils: {
		removeAllProps: function(element) { gsap.set(element, { clearProps: "all" }); },
		remove: function(element) { element.parentNode.removeChild(element) },
		uncondenseVals: function(string) {
			if (typeof string !== "string") return;
			const splitVals = string.split(" ");
			return {
				x: parseFloat(splitVals[0]),
				y: parseFloat(splitVals[1]),
				width: parseFloat(splitVals[2]),
				height: parseFloat(splitVals[3])
			}
		},
		fixValue: function(value) {
			//The value should either be a string or a number
			const valueType = typeof value;
			if (valueType === "string") {
				const unit = gsap.utils.getUnit(value);
				const amount = parseFloat(value);
				const isVW = unit === "vw";
				return isVW || unit === "vh" ? viewport.convertToPX(amount, isVW) : amount;
			}
			else if (valueType === "number")
				return value;
			else
				return undefined;
		},
		dragEvents: function(element, start, drag, end, thisObj) {
			//This function condenses many of the same actions needed for dragging into one organized function call
			if (!element) return;
			//Object to store useful info
			persistentData = {};
			element.addEventListener("mousedown", function(e) {
				e.preventDefault();
				//Go through each frame and prevent them from absorbing input
				persistentData.frames = document.getElementsByTagName("iframe");
				for (let i = 0; i < persistentData.frames.length; i++) persistentData.frames[i].style.pointerEvents = "none";
				//Call the start event with the correct this and if true is returned, cancel further stuff
				if (start && start.call(thisObj ? thisObj : this, e, persistentData)) return;
				document.addEventListener("mousemove", moveCallback);
				document.addEventListener("mouseup", upCallback);
			});
			function moveCallback(e) {
				e.preventDefault();
				//Call the move event with the correct this
				if (drag) drag.call(thisObj ? thisObj : this, e, persistentData);
			}
			function upCallback(e) {
				e.preventDefault();
				//Go through each frame and allow them to absorb input again
				for (let i = 0; i < persistentData.frames.length; i++) persistentData.frames[i].style.pointerEvents = null;
				//Call the end event with the correct this
				if (end) end.call(thisObj ? thisObj : this, e, persistentData);
				//Remove the event listeners
				document.removeEventListener("mousemove", moveCallback);
				document.removeEventListener("mouseup", upCallback);
			}
		}
	}
}
WindowManager.Window = function(title, content, iconSrc, defaults, htmlMode) {
	//If a window shares the same title, it cannot be made
	if (WindowManager.getWindowByTitle(title).exists)
		return;

	/*-------------Create Window Dom Structure-------------*/
	//Create a window
	const windowElement = document.createElement("div");
	windowElement.classList.add("window");
	//Add a header
	const header = document.createElement("header");
	header.classList.add("window-header");

	//Add title
	const titleElement = document.createElement("h2");
	titleElement.textContent = title;
	header.appendChild(titleElement);

	//Add minimize button
	const minimizeBtn = document.createElement("button");
	minimizeBtn.type = "button";
	minimizeBtn.classList.add("large-screen");
	const minimizeIcon = document.createElement("img");
	minimizeIcon.src = "../static/SVGs/minimize.svg";
	minimizeIcon.alt = "minimize";
	minimizeBtn.appendChild(minimizeIcon);
	header.appendChild(minimizeBtn);

	//Add maximize button
	const maximizeBtn = document.createElement("button");
	maximizeBtn.type = "button";
	maximizeBtn.classList.add("large-screen");
	const maximizeIcon = document.createElement("img");
	maximizeIcon.src = "../static/SVGs/maximize.svg";
	maximizeIcon.alt = "maximize";
	maximizeBtn.appendChild(maximizeIcon);
	header.appendChild(maximizeBtn);

	//Add close button
	const closeBtn = document.createElement("button");
	closeBtn.type = "button";
	closeBtn.classList.add("close-button", "large-screen");
	const closeIcon = document.createElement("img");
	closeIcon.src = "../static/SVGs/close.svg";
	closeIcon.alt = "close";
	closeBtn.appendChild(closeIcon);
	header.appendChild(closeBtn);

	//Finsish header
	windowElement.appendChild(header);

	//Add body (htmlMode determines whether content will be treated as html or the src to an iframe)
	const body = document.createElement(htmlMode ? "section" : "iframe");
	body.classList.add("window-body");
	windowElement.appendChild(body);
	if (!htmlMode) {
		body.src = content;
		//iframes will *absorb* click. this allows cliking on the iframe to count as clicking on the window
		body.onload = function() {
			try {
				let bodyContents = (body.contentWindow || body.contentDocument);
				if (bodyContents.document) bodyContents = bodyContents.document;
				bodyContents.body.onmousedown = windowElement.onmousedown;
			}
			catch { console.error("Cannot connect to cross origin iframe!") }
		};
	}
	else
		body.innerHTML = content;

	//The resizable areas container (the actual directions defined later)
	const resizeDiv = document.createElement("div");
	resizeDiv.classList.add("resizers", "large-screen");

	/*-------------Task (for taskbar)-------------*/
	//Tasks are the apps in the taskbar that you can interact with (for context)
	const taskContainer = document.createElement("li");
    const task = document.createElement("button");
    task.type = "button";
    task.classList.add("task");
    const taskIcon = document.createElement("img");
    taskIcon.src = iconSrc;
    taskIcon.alt = title;
    task.appendChild(taskIcon);
    taskContainer.appendChild(task);
	WindowManager.taskbar.appendChild(taskContainer);
	//Animate creation of active app
    gsap.from(taskContainer, { opacity: 0, duration: WindowManager.animSpeed, ease: "Power2.out" });

	/*-------------Add Window Functionality-------------*/
	//Add local properties and set
	this._xSet = gsap.quickSetter(windowElement, "x", "vw"),
	this._ySet = gsap.quickSetter(windowElement, "y", "vh"),
	this._widthSet = gsap.quickSetter(windowElement, "width", "vw"),
	this._heightSet = gsap.quickSetter(windowElement, "height", "vh");
	this.domElement = windowElement;
	this.taskElement = task;
	this.resizersElement = resizeDiv;
	this.title = title;
	this.content = content;
	this.iconSrc = iconSrc;
	this.maximized = false;
	this.minimized = false;
	this.animate = false;
	this.savedVals = typeof defaults === "object" ? defaults : WindowManager.globalDefaults;
	this.applySaved();
	//Animate on window creation
	if (!reducedMotion) gsap.from(windowElement, { scale: 0, opacity: 0, duration: WindowManager.animSpeed, ease: "Power2.out" });

	//Apply to DOM
	//all examples of bind make sure that this in the function refers to the constructor obj not the event obj
	closeBtn.onclick = this.close.bind(this);
	closeBtn.onmousedown = function(e) { e.stopPropagation() };
	minimizeBtn.onclick = this.toggleMinimize.bind(this);
	minimizeBtn.onmousedown = function(e) { e.stopPropagation() };
	maximizeBtn.onclick = this.toggleMaximize.bind(this);
	maximizeBtn.onmousedown = function(e) { e.stopPropagation() };
	
	//Task functionality
	taskContainer.onmouseenter = function() { WindowManager.taskTooltip.show(taskContainer, title) };
	taskContainer.onmouseleave = function() { WindowManager.taskTooltip.hide() };
	WindowManager.utils.dragEvents(taskContainer, 
		function(e, persist) {
			WindowManager.taskTooltip.hide(true);
			WindowManager.taskTooltip.ignore = true;
			const taskbarBounds = WindowManager.taskbar.getBoundingClientRect();
			const taskBounds = taskContainer.getBoundingClientRect();
			persist.xOffset = taskBounds.x - e.clientX;
			persist.taskWidth = taskBounds.width;
			persist.minBound = taskbarBounds.x;
			persist.maxBound = taskbarBounds.x + taskbarBounds.width - persist.taskWidth;

			//Add placeholder
			persist.placeholder = taskContainer.cloneNode(false);
			persist.placeholder.style.width = persist.taskWidth + "px";
			WindowManager.taskbar.insertBefore(persist.placeholder, taskContainer);

			persist.xSet = gsap.utils.pipe(
				gsap.utils.clamp(persist.minBound, persist.maxBound),
				gsap.quickSetter(taskContainer, "x", "px")
			);

			taskContainer.style.left = 0;
			taskContainer.style.position = "absolute";
			persist.xSet(e.clientX + persist.xOffset);

			persist.moved = false;
		},
		function(e, persist) {
			persist.xSet(e.clientX + persist.xOffset);

			//Fix ordering

			if (!persist.moved) persist.moved = true;
		},
		function(e, persist) {
			//REMOVE CLIENT LEFT (if possible)
			gsap.to(taskContainer, { x: persist.placeholder.offsetLeft, ease: "Power2.out", duration: .25, onComplete: function() {		
				taskContainer.style.position = null;
				taskContainer.style.transform = null;
				WindowManager.taskTooltip.ignore = false;
				WindowManager.taskbar.replaceChild(taskContainer, persist.placeholder);
			} });
			//If the mouse did not move at all "register as a click instead"
			if (!persist.moved) this.minimized || (this === WindowManager.ordering.focused) ? this.toggleMinimize() : this.sendToFront();
		},
	this);

	//Focus window when clicked
	windowElement.onmousedown = this.sendToFront().bind(this);

	WindowManager.utils.dragEvents(header,
		function(e, persist) {
			//Save mouse offset relative to element origin
			const xOffset = this.x - e.clientX;
			const yOffset = this.y - e.clientY;
			persist.offset = { xOffset, yOffset };
		},
		function(e, persist) {
			this.x = e.clientX + persist.offset.xOffset;
			this.y = e.clientY + persist.offset.yOffset;
		},
	null, this);


	/*-------------Make Resizeable-------------*/
    /*------Cardinal Directions------*/
	//North
    const north = document.createElement("div");
    north.classList.add("north");
	WindowManager.utils.dragEvents(north,
		function(e, persist) {
			persist.startMouseY = e.clientY;
			persist.startHeight = this.height;
			persist.startTop = this.y;
			persist.startBottom = persist.startTop + persist.startHeight;
		},
		function(e, persist) {
			const deltaY = persist.startMouseY - Math.max(0, e.clientY);
			const newHeight = persist.startHeight + deltaY;
			this.height = newHeight;
			//Adjust y to ensure height change makes sense (unless of course we reach the min size and height is staying the same)
			if (this.height === newHeight) this.y = persist.startTop - deltaY;
		},
	null, this);
	resizeDiv.appendChild(north);
	//East
	const east = document.createElement("div");
    east.classList.add("east");
	WindowManager.utils.dragEvents(east,
		function(e, persist) {
			persist.startMouseX = e.clientX;
			persist.startWidth = this.width;
		},
		function(e, persist) {
			const deltaX = Math.min(viewport.vw, e.clientX) - persist.startMouseX;
			this.width = persist.startWidth + deltaX;
		},
	null, this);
	resizeDiv.appendChild(east);
	//South
	const south = document.createElement("div");
    south.classList.add("south");
	WindowManager.utils.dragEvents(south,
		function(e, persist) {
			persist.startMouseY = e.clientY;
			persist.startHeight = this.height;
		},
		function(e, persist) {
			const deltaY = Math.min(viewport.vh, e.clientY) - persist.startMouseY;
			this.height = persist.startHeight + deltaY;
		},
	null, this);
	resizeDiv.appendChild(south);
	//West
	const west = document.createElement("div");
    west.classList.add("west");
	WindowManager.utils.dragEvents(west,
		function(e, persist) {
			persist.startMouseX = e.clientX;
			persist.startWidth = this.width;
			persist.startLeft = this.x;
			persist.startRight = persist.startLeft + persist.startWidth;
		},
		function(e, persist) {
			const deltaX = persist.startMouseX - Math.max(0, e.clientX);
			const newWidth = persist.startWidth + deltaX;
			this.width = newWidth;
			//Adjust x to ensure width change makes sense (unless of course we reach the min size and width is staying the same)
			if (this.width === newWidth) this.x = persist.startLeft - deltaX;
		},
	null, this);
	resizeDiv.appendChild(west);
	/*------Compound Directions------*/
	//Northeast
	const northeast = document.createElement("div");
    northeast.classList.add("northeast");
	WindowManager.utils.dragEvents(northeast,
		function(e, persist) {
			persist.startMouseX = e.clientX;
			persist.startMouseY = e.clientY;
			persist.startWidth = this.width;
			persist.startHeight = this.height;
			persist.startTop = this.y;
			persist.startBottom = persist.startTop + persist.startHeight;
		},
		function(e, persist) {
			const deltaX = Math.min(viewport.vw, e.clientX) - persist.startMouseX;
			const deltaY = persist.startMouseY - Math.max(0, e.clientY);
			this.width = persist.startWidth + deltaX;
			const newHeight = persist.startHeight + deltaY;
			this.height = newHeight;
			//Adjust y to ensure height change makes sense (unless of course we reach the min size and height is staying the same)
			if (this.height === newHeight) this.y = persist.startTop - deltaY;
		},
	null, this);
	resizeDiv.appendChild(northeast);
	//Southeast
	const southeast = document.createElement("div");
    southeast.classList.add("southeast");
	WindowManager.utils.dragEvents(southeast,
		function(e, persist) {
			persist.startMouseX = e.clientX;
			persist.startMouseY = e.clientY;
			persist.startWidth = this.width;
			persist.startHeight = this.height;
		},
		function(e, persist) {
			const deltaX = Math.min(viewport.vw, e.clientX) - persist.startMouseX;
			const deltaY = Math.min(viewport.vh, e.clientY) - persist.startMouseY;
			this.width = persist.startWidth + deltaX;
			this.height = persist.startHeight + deltaY;
		},
	null, this);
	resizeDiv.appendChild(southeast);
	//Southwest
	const southwest = document.createElement("div");
    southwest.classList.add("southwest");
	WindowManager.utils.dragEvents(southwest,
		function(e, persist) {
			persist.startMouseX = e.clientX;
			persist.startMouseY = e.clientY;
			persist.startWidth = this.width;
			persist.startHeight = this.height;
			persist.startLeft = this.x;
			persist.startRight = persist.startLeft + persist.startWidth;
		},
		function(e, persist) {
			const deltaX = persist.startMouseX - Math.max(0, e.clientX);
			const deltaY = Math.min(viewport.vh, e.clientY) - persist.startMouseY;
			const newWidth = persist.startWidth + deltaX;
			this.width = newWidth;
			this.height = persist.startHeight + deltaY;
			//Adjust x to ensure width change makes sense (unless of course we reach the min size and width is staying the same)
			if (this.width === newWidth) this.x = persist.startLeft - deltaX;
		},
	null, this);
	resizeDiv.appendChild(southwest);
	//Northwest
	const northwest = document.createElement("div");
    northwest.classList.add("northwest");
	WindowManager.utils.dragEvents(northwest,
		function(e, persist) {
			persist.startMouseX = e.clientX;
			persist.startMouseY = e.clientY;
			persist.startWidth = this.width;
			persist.startHeight = this.height;
			persist.startLeft = this.x;
			persist.startRight = persist.startLeft + persist.startWidth;
			persist.startTop = this.y;
			persist.startBottom = persist.startTop + persist.startHeight;
		},
		function(e, persist) {
			const deltaX = persist.startMouseX - Math.max(0, e.clientX);
			const deltaY = persist.startMouseY - Math.max(0, e.clientY);
			const newWidth = persist.startWidth + deltaX;
			const newHeight = persist.startHeight + deltaY;
			this.width = newWidth;
			this.height = newHeight;
			//Adjust x to ensure width change makes sense (unless of course we reach the min size and width is staying the same)
			if (this.width === newWidth) this.x = persist.startLeft - deltaX;
			//Adjust y to ensure height change makes sense (unless of course we reach the min size and height is staying the same)
			if (this.height === newHeight) this.y = persist.startTop - deltaY;
		},
	null, this);
	resizeDiv.appendChild(northwest);

	//Add the resize div
	windowElement.appendChild(resizeDiv);

	/*-------------Add to DOM-------------*/
	WindowManager.windowArea.appendChild(this.domElement);
}

//Add global properties
Object.defineProperties(WindowManager.Window.prototype, {
	/*------------Position and Size------------*/
	//only supports input of px, vw, vh
	animate: {
		get() { return this._animate },
		set(value) {
			//Make sure the right value is used
			this._animate = value && !reducedMotion;
		}
	},
	x: {
		get() { return this._x },
		set(value) {
			//Make sure the right value is used
			value = WindowManager.utils.fixValue(value);
			if (value === undefined) return;
			this._x = gsap.utils.clamp(0, viewport.vw - this.width, value);
			//Convert to vw
			const convertedValue = viewport.convertToVW(this._x, this.animate);
			this.animate ?
				gsap.to(this.domElement, { x: convertedValue, duration: WindowManager.animSpeed, ease: "Power2.out" }) :
				this. _xSet(convertedValue);
		}
	},
	y: {
		get() { return this._y },
		set(value) {
			//Make sure the right value is used
			value = WindowManager.utils.fixValue(value);
			if (value === undefined) return;
			this._y = gsap.utils.clamp(0, viewport.vh - this.height, value);
			//Convert to vh
			const convertedValue = viewport.convertToVH(this._y, this.animate);
			this.animate ?
				gsap.to(this.domElement, { y: convertedValue, duration: WindowManager.animSpeed, ease: "Power2.out" }) :
				this. _ySet(convertedValue);
		}
	},
	width: {
		get() { return this._width },
		set(value) {
			//Make sure the right value is used
			value = WindowManager.utils.fixValue(value);
			if (value === undefined) return;
			this._width = gsap.utils.clamp(viewport.convertToPX(WindowManager.minSize.width), viewport.vw, value);
			//Convert to vw
			const convertedValue = viewport.convertToVW(this._width, this.animate);
			this.animate ?
				gsap.to(this.domElement, { width: convertedValue, duration: WindowManager.animSpeed, ease: "Power2.out" }) :
				this. _widthSet(convertedValue);
		}
	},
	height: {
		get() { return this._height },
		set(value) {
			//Make sure the right value is used
			value = WindowManager.utils.fixValue(value);
			if (value === undefined) return;
			this._height = gsap.utils.clamp(viewport.convertToPX(WindowManager.minSize.height, true), viewport.vh, value);
			//Convert to vh
			const convertedValue = viewport.convertToVH(this._height, this.animate);
			this.animate ?
				gsap.to(this.domElement, { height: convertedValue, duration: WindowManager.animSpeed, ease: "Power2.out" }) :
				this. _heightSet(convertedValue);
		}
	},

	/*-------------Ordering/Z-indices------------*/
	order: {
		get() {	return this._order },
		set(value) {
			this._order = value;
			this.domElement.style.zIndex = value;
		}
	},
	sendToFront: {
		value: function() {
			if (this === WindowManager.ordering.focused) return true;
			//Move to front of list
			const thisIndex = WindowManager.windows.indexOf(this);
			if (thisIndex > -1) WindowManager.windows.splice(thisIndex, 1);
			WindowManager.windows.push(this);
			//Update ordering
			WindowManager.ordering.update();
			//A little weird, but nescessary for initialization
			return this.sendToFront;
		},
		writable: false
	},
	sendToBack: {
		value: function() {
			//Check if its already in the back
			if (this.order == 0) return true;
			//Move to back of list
			WindowManager.windows.splice(WindowManager.windows.indexOf(this), 1);
			WindowManager.windows.unshift(this);
			//Update ordering
			WindowManager.ordering.update();
		},
		writable: false
	},

	/*------------Saving values------------*/
	applySaved: {
		value: function() {
			//Apply the saved values
			this.width = this.savedVals.width;
			this.height = this.savedVals.height;
			this.x = this.savedVals.x;
			this.y = this.savedVals.y;
		},
		writable: false
	},
	setSaved: {
		value: function() {
			//Set the saved values to use later
			this.savedVals.x = viewport.convertToVW(this.x, true);
			this.savedVals.y = viewport.convertToVH(this.y, true);
			this.savedVals.width = viewport.convertToVW(this.width, true);
			this.savedVals.height = viewport.convertToVH(this.height, true);
		},
		writable: false
	},

	/*------------Window functions------------*/
	toggleMinimize: {
		value: function() {
			//Toggle bool
			this.minimized = !this.minimized;
			//To scale into the task effect
			const taskBounds = this.taskElement.getBoundingClientRect();
			this.domElement.style.transformOrigin = (taskBounds.x - this.x) + "px " + (taskBounds.y - this.y) + "px";
			//Minimize based off of reduced motion and on or off
			if (!reducedMotion) {
				if (this.minimized) {
					gsap.to(this.domElement, { scale: .5, opacity: 0, duration: WindowManager.animSpeed, ease: "Power2.out",
					callbackScope: this, onComplete: this.minimized ? this.sendToBack : this.sendToFront });
					this.domElement.style.pointerEvents = "none";
				}
				else {
					gsap.to(this.domElement, { scale: 1, opacity: 1, duration: WindowManager.animSpeed, ease: "Power2.out" });
					this.domElement.style.pointerEvents = null;
					this.sendToFront();
				}
			}
			else {
				if (this.minimized) {
					gsap.set(this.domElement, { scale: .5, opacity: 0 });
					this.domElement.style.pointerEvents = "none";
					this.sendToBack();
				}
				else {
					gsap.set(this.domElement, { scale: 1, opacity: 1 });
					this.domElement.style.pointerEvents = null;
					this.sendToFront();
				}
			}
		},
		writable: false
	},
	toggleMaximize: {
		value: function() {
			//Toggle bool
			this.maximized = !this.maximized;
			this.animate = true;
			if (this.maximized) {
				//Retain the old sizes before the maximize
				this.setSaved();
				//Animate to full size
				this.width = viewport.vw;
				this.height = viewport.vh;
				this.x = 0;
				this.y = 0;
				//Rezing is impossible when maximized
				this.resizersElement.style.display = "none";
			}
			else {
				this.applySaved();
				this.resizersElement.style.display = null;
			}
			this.animate = false;
		},
		writable: false
	},
	close: {
		value: function() {
			if (!reducedMotion) {
				//Remove window
				gsap.to(this.domElement, { scale: .5, opacity: 0, duration: WindowManager.animSpeed, ease: "Power2.out",
				callbackScope: this, onComplete: function() { WindowManager.utils.remove(this.domElement) }});
				//Remove task
				gsap.to(this.taskElement, { opacity: 0, duration: WindowManager.animSpeed, ease: "Power2.out",
				callbackScope: this, onComplete: function() { WindowManager.utils.remove(this.taskElement) }});
			}
			else {
				//Remove window
				WindowManager.utils.remove(this.domElement);
				//Remove task
				WindowManager.utils.remove(this.taskElement);
			}
			WindowManager.windows.splice(WindowManager.getWindowByTitle(this.title).index, 1);
			WindowManager.ordering.update();
		},
		writable: false
	}
});

/*-------------------------Responsiveness--------------------------*/
const mediaTester = window.matchMedia("(min-width: 50rem)");
let smallScreen;
function UpdateScreen() { ToggleOSMode(smallScreen = !mediaTester.matches) };
UpdateScreen();
mediaTester.addEventListener("change", UpdateScreen);
function ToggleOSMode(mobile) {
}
//Remove gsap anims if user wants none
const reducedMotionTester = window.matchMedia("(prefers-reduced-motion: reduce");
let reducedMotion;
function UpdateAnimations() { reducedMotion = reducedMotionTester.matches };
UpdateAnimations();
reducedMotionTester.addEventListener("change", UpdateAnimations);

//Update viewport size values
const viewport = {
	convertToVW: function(val, appendUnit) {
		if (typeof val === "string") val = parseFloat(val);
		if (typeof val !== "number") return undefined;
		return val / this.vw * 100 + (appendUnit ? "vw" : null);
	},
	convertToVH: function(val, appendUnit) {
		if (typeof val === "string") val = parseFloat(val);
		if (typeof val !== "number") return undefined;
		return val / this.vh * 100 + (appendUnit ? "vh" : null);
	},
	//vw = false, vh = true
	convertToPX: function(val, vh) {
		if (typeof val === "string") val = parseFloat(val);
		if (typeof val !== "number") return undefined;
		return  val / 100 * (vh ? this.vw : this.vh);
	}
};
getViewport();
function getViewport() {
	viewport.vw = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;
	viewport.vh = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;
}
window.addEventListener("resize", getViewport);

/*--------------------------Apps--------------------------*/
const apps = document.querySelectorAll(".app button");
apps.forEach(function(app) {
	//An app needs an asscociated window to open
	const associatedWindow = app.getAttribute("data-associated-window");
	if (associatedWindow) {
		//The variables needed for the window creation
		const appTitle = app.lastElementChild.textContent,
			appIcon = app.firstElementChild.src,
			defaults = WindowManager.utils.uncondenseVals(app.getAttribute("data-window-defaults"));
		//On small screens only 1 click is nescessary to open an app
		app.onclick = function() { if (smallScreen) new WindowManager.Window(appTitle, associatedWindow, appIcon, defaults) };
		app.ondblclick = function() { if (!smallScreen) new WindowManager.Window(appTitle, associatedWindow, appIcon, defaults) };
	}
});