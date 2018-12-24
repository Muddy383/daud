﻿import Cookies from "js-cookie";
import nipplejs from "nipplejs";
import { setInterval, setTimeout } from "timers";
import { Settings } from "./settings";

export const nipple = nipplejs.create({
    zone: document.getElementById("nipple-zone"),
    resetJoystick: false
});
const isMobile = "ontouchstart" in document.documentElement;
if (!isMobile) {
    nipple.destroy();
    document.getElementById("niple-buttons").style.display = "none";
}

// this script makes new ship selector work

const selector = document.querySelector("#shipSelector");

/*
selector.addEventListener("change", e => {
    Controls.ship = `ship_${selector.value}` || "ship_green";
    Controls.color = selector.value || "green";

    save();
});
*/

var shipSelectorSwitch = document.getElementById("shipSelectorSwitch");
var ships = shipSelectorSwitch.getElementsByTagName("img");

for (var i = 0; i < ships.length; i++) {
	ships[i].addEventListener("click", function() {
		document.querySelector(".selected").classList.remove("selected");
		var color = this.getAttribute("data-color");
		this.classList.add("selected");
		selector.value = color;
		
		Controls.ship = `ship_${selector.value}` || "ship_green";
		Controls.color = selector.value || "green";
		
		save();
	});
}

const nick = document.querySelector("#nick");
nick.addEventListener("change", e => {
    Controls.nick = nick.value;
    if (Controls && Controls.canvas) Controls.canvas.focus();

    save();
});

export var Controls = {
    left: false,
    up: false,
    right: false,
    down: false,
    boost: false,
    shoot: false,
    downSince: false,
    registerCanvas(canvas) {
        const getMousePos = (canvas, { clientX, clientY }) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };
        if (isMobile) {
            nipple.on("move", (e, { angle, force }) => {
                Controls.angle = angle.radian;
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                Controls.mouseX = Math.cos(angle.radian) * force * window.innerHeight + cx;
                Controls.mouseY = Math.sin(-angle.radian) * force * window.innerHeight + cy;
            });
            document.getElementById("shoot").addEventListener("touchstart", e => {
                Controls.shoot = true;
            });
            document.getElementById("shoot").addEventListener("touchend", e => {
                Controls.shoot = false;
            });
            document.getElementById("boost").addEventListener("touchstart", e => {
                Controls.boost = true;
            });
            document.getElementById("boost").addEventListener("touchend", e => {
                Controls.boost = false;
            });
        } else {
            window.addEventListener("mousemove", e => {
                const pos = getMousePos(canvas, e);
                Controls.mouseX = pos.x;
                Controls.mouseY = pos.y;
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                const dy = pos.y - cy;
                const dx = pos.x - cx;

                Controls.angle = Math.atan2(dy, dx);
            });
            window.addEventListener("mousedown", ({ button }) => {
                if (button == 2)
                    //right click
                    Controls.boost = true;
                else {
                    if (Settings.mouseOneButton > 0) {
                        Controls.downSince = new Date().getTime();
                    } else {
                        Controls.shoot = true;
                    }
                }
            });

            window.addEventListener("mouseup", ({ button }) => {
                if (button == 2)
                    //right click
                    Controls.boost = false;
                else {
                    if (Settings.mouseOneButton > 0) {
                        var timeDelta = new Date().getTime() - Controls.downSince;
                        Controls.downSince = false;
                        if (timeDelta < Settings.mouseOneButton) {
                            Controls.shoot = true;
                            setTimeout(function() {
                                Controls.shoot = false;
                            }, 100);
                        } else {
                            Controls.boost = true;
                            setTimeout(function() {
                                Controls.boost = false;
                            }, 100);
                        }
                    } else Controls.shoot = false;
                }
            });
            window.addEventListener("contextmenu", e => {
                e.preventDefault();
                return false;
            });
        }
        Controls.canvas = canvas;
    },
    ship: "ship_green"
};

window.addEventListener(
    "keydown",
    ({ keyCode }) => {
        switch (keyCode) {
            case 37: // left arrow
                Controls.left = true;
                break;
            case 38: // up arrow
                Controls.up = true;
                break;
            case 39: // right arrow
                Controls.right = true;
                break;
            case 40: // down arrow
                Controls.down = true;
                break;
            case 83: // s
                Controls.boost = true;
                break;
            case 32: // space
                Controls.shoot = true;
                break;
        }
    },
    false
);

window.addEventListener(
    "keyup",
    ({ keyCode }) => {
        switch (keyCode) {
            case 37: // left arrow
                Controls.left = false;
                break;
            case 38: // up arrow
                Controls.up = false;
                break;
            case 39: // right arrow
                Controls.right = false;
                break;
            case 40: // down arrow
                Controls.down = false;
                break;
            case 83: // s
                Controls.boost = false;
                break;
            case 32: // space
                Controls.shoot = false;
                break;
        }
    },
    false
);

function save() {
    const cookieOptions = { expires: 300 };

    if (Controls.nick) Cookies.set("nick", Controls.nick, cookieOptions);
    Cookies.set("color", Controls.color, cookieOptions);
}

const savedNick = Cookies.get("nick");
const savedColor = Cookies.get("color");

if (savedNick !== undefined) {
    Controls.nick = savedNick;
    nick.value = savedNick;
}

if (savedColor !== undefined) {
    Controls.color = savedColor;
    selector.value = savedColor;
}

const event = document.createEvent("Event");
event.initEvent("change", true, true);
selector.dispatchEvent(event);
