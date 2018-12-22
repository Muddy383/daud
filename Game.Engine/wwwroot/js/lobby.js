﻿import { fetch } from "whatwg-fetch";
import { Controls } from "./controls";

var worlds = document.getElementById("worlds");
var worldList = document.getElementById("worldList");

var allWorlds = {};
function refreshList() {
    fetch("/api/v1/server/worlds", {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    })
        .then(r => r.json())
        .then(({ success, response }) => {
            if (success) {
                if (window.location.hash) {
                    var selected = window.location.hash.substring(1);
                    window.Game.primaryConnection.connect(selected);
                    changeRoom(selected);
                }

                var options = "";
                allWorlds = {};

                for (var world of response) {
                    allWorlds[world.world] = world;
                    options += `<tr><td><b>${world.name}</b>: ${world.description} (${world.players})</td><td><button id="${world.world}" class="j">Join</button></div></td>`;
                }

                worldList.innerHTML = options;

                document.querySelectorAll(".j").forEach(j =>
                    j.addEventListener("click", function() {
                        const world = this.id;
                        window.Game.primaryConnection.disconnect();
                        window.Game.primaryConnection.connect(world);
                        changeRoom(world);
                    })
                );
            }
        });
}
function changeRoom(worldKey) {
    document.getElementById("wcancel").click();
    var world = allWorlds[worldKey];
    if (world) {
        var colors = world.allowedColors;
        var options = "";

        for (var i = 0; i < colors.length; i++) options += `<option value="${colors[i]}">${colors[i]}</option>`;

        document.getElementById("shipSelector").innerHTML = options;
        document.getElementById("shipSelector").value = colors[0];
        Controls.color = colors[0];
    } else console.log(`Warning: could not find selected world ${worldKey}`);
}

var controls = document.querySelector(".controls");
var social = document.querySelector(".social");
var blurred = false;
export function blur() {
    if (!blurred) {
        controls.classList.add("blur");
        social.classList.add("blur");
    } else {
        controls.classList.remove("blur");
        social.classList.remove("blur");
    }
    blurred = !blurred;
}

document.getElementById("arenas").addEventListener("click", () => {
    refreshList();
    worlds.classList.remove("closed");
    blur();
});
document.getElementById("wrefresh").addEventListener("click", () => {
    refreshList();
});
