﻿import { sprites } from "./renderer";
import { Settings } from "./settings";

var record = document.getElementById("record");
var leaderboard = document.getElementById("leaderboard");
var leaderboardLeft = document.getElementById("leaderboard-left");
var leaderboardCenter = document.getElementById("leaderboard-center");
const minimap = document.getElementById("minimap");
var minimapCtx = minimap.getContext("2d");


export function clear() {
    leaderboard.innerHTML = "";
    leaderboardLeft.innerHTML = "";
    leaderboardCenter.innerHTML = "";
    leaderboardCenter.style.width = null;
    leaderboardCenter.style.height = null;
}
export class Leaderboard {
    constructor() {
        this.data = false;
    }

    setData(data, position, worldSize, fleetID) {
        this.data = data;
        if (this.data.Record) {
            record.style.fontFamily = Settings.font;
            record.innerHTML = `record: ${this.data.Record.Name || "Unknown Fleet"} - ${this.data.Record.Score}`;
        }

        //Hide or show elements based on Arena.
        if (this.data.Type == "CTF") {
            document.getElementById("ctf_arena").classList.remove("hide");
        } else {
            document.getElementById("ctf_arena").classList.add("hide");
        }

        if (this.data.Type == "FFA") {
            let out = "";
			
			minimapCtx.clearRect(0, 0, minimap.width, minimap.height);
            
			for (let i = 0; i < this.data.Entries.length; i++) {
                const entry = this.data.Entries[i];
                const angle = Math.atan2(entry.Position.Y - position.Y, entry.Position.X - position.X);
				
				var entryIsSelf = (entry.FleetID == fleetID);
				
				// minimap
				var minimapX = (entry.Position.X + worldSize) / 2 / worldSize * minimap.width - 2;
				var minimapY = (entry.Position.Y + worldSize) / 2 / worldSize * minimap.height - 2;
				
				drawMinimap(entry.Position.X, entry.Position.Y, entry.Color, entryIsSelf);
				
				/*
                if (!entryIsSelf) {
					minimapCtx.fillStyle = entry.Color;
					minimapCtx.fillRect(minimapX, minimapY, 4, 4);
                } else {
					minimapCtx.fillStyle = "white";
					minimapCtx.fillRect(minimapX-1, minimapY-1, 6, 6);
				}*/

                out +=
                    `<tr>` +
                    `<td style="width:28px;height:28px;background:${entry.Color}"><img class="arrow" src="${require("../img/arrow.png")}" style="transform:rotate(${angle}rad)"></img></td>` +
                    `<td style="width:5px" class="blue">${entry.Token ? "✓" : ""}</td>` +
                    `<td class="name">${entry.Name || "Unknown Fleet"}</td>` +
                    `<td class="score">${entry.Score}</td>` +
                    `</tr>`;
            }
            leaderboard.innerHTML = `<tbody>${out}</tbody>`;
        } else if (this.data.Type == "Team") {
            let outL = "";
            let outR = "";
            let outC = "";
			
			minimapCtx.clearRect(0, 0, minimap.width, minimap.height);
			
            for (let i = 0; i < this.data.Entries.length; i++) {
                const entry = this.data.Entries[i];
                const angle = Math.atan2(entry.Position.Y - position.Y, entry.Position.X - position.X);
				
				// minimap
				if (i > 1) {
					var minimapX = (entry.Position.X + worldSize) / 2 / worldSize * minimap.width - 2;
					var minimapY = (entry.Position.Y + worldSize) / 2 / worldSize * minimap.height - 2;
					
					var entryIsSelf = (entry.FleetID == fleetID);
					if (!entryIsSelf) {
						minimapCtx.fillStyle = entry.Color;
						minimapCtx.fillRect(minimapX, minimapY, 4, 4);
					} else {
						minimapCtx.fillStyle = "white";
						minimapCtx.fillRect(minimapX-1, minimapY-1, 6, 6);
					}
				}

                let str =
                    `<tr>` +
                    `<td style="width:28px;height:28px;background:${entry.Color}"><img class="arrow" src="${require("../img/arrow.png")}" style="transform:rotate(${angle}rad)"></img></td>` +
                    `<td style="width:5px" class="blue">${entry.Token ? "✓" : ""}</td>` +
                    `<td class="name">${entry.Name || "Unknown Fleet"}</td>` +
                    `<td class="score">${entry.Score}</td>` +
                    `</tr>`;
                if (i == 0 || i == 1) {
                    outC += str;
                } else if (entry.Color == "cyan") {
                    outL += str;
                } else {
                    outR += str;
                }
            }
            leaderboard.innerHTML = `<tbody>${outR}</tbody>`;
            leaderboardLeft.innerHTML = `<tbody>${outL}</tbody>`;
            leaderboardCenter.innerHTML = `<tbody>${outC}</tbody>`;
        } else if (this.data.Type == "CTF") {
            let outL = "";
            let outR = "";
            let redFlag = false;
            let cyanFlag = false;
			
			minimapCtx.clearRect(0, 0, minimap.width, minimap.height);
			
            for (let i = 0; i < this.data.Entries.length; i++) {
                const entry = this.data.Entries[i];
                const angle = Math.atan2(entry.Position.Y - position.Y, entry.Position.X - position.X);
				
				// minimap
				if (i > 1) {
					var minimapX = (entry.Position.X + worldSize) / 2 / worldSize * minimap.width - 2;
					var minimapY = (entry.Position.Y + worldSize) / 2 / worldSize * minimap.height - 2;
					
					var entryIsSelf = (entry.FleetID == fleetID);
					if (!entryIsSelf) {
						minimapCtx.fillStyle = entry.Color;
						minimapCtx.fillRect(minimapX, minimapY, 4, 4);
					} else {
						minimapCtx.fillStyle = "white";
						minimapCtx.fillRect(minimapX-1, minimapY-1, 6, 6);
					}
				}
				
                let str =
                    `<tr>` +
                    `<td style="width:28px;height:28px;background:${entry.Color}"><img class="arrow" src="${require("../img/arrow.png")}" style="transform:rotate(${angle}rad)"></img></td>` +
                    `<td style="width:5px" class="blue">${entry.Token ? "✓" : ""}</td>` +
                    `<td class="name">${entry.Name || "Unknown Fleet"}</td>` +
                    `<td class="score">${entry.Score}</td>` +
                    `</tr>`;
                if (i == 0) {
                    cyanFlag = entry;
                } else if (i == 1) {
                    redFlag = entry;
                } else if (entry.Color == "cyan") {
                    outL += str;
                } else {
                    outR += str;
                }
            }

            const self = this;

            const flagStatus = {
                cyan: self.data.Entries[0].ModeData.flagStatus,
                red: self.data.Entries[1].ModeData.flagStatus
            };

            const cyanFlagStatus = document.getElementById("ctf_cyan").getElementsByClassName("flag_status")[0];
            const redFlagStatus = document.getElementById("ctf_red").getElementsByClassName("flag_status")[0];

            if (flagStatus.cyan == "Home") {
                cyanFlagStatus.getElementsByClassName("home")[0].classList.remove("hide");
                cyanFlagStatus.getElementsByClassName("taken")[0].classList.add("hide");
            } else if (flagStatus.cyan == "Taken") {
                cyanFlagStatus.getElementsByClassName("home")[0].classList.add("hide");
                cyanFlagStatus.getElementsByClassName("taken")[0].classList.remove("hide");
            }

            if (flagStatus.red == "Home") {
                redFlagStatus.getElementsByClassName("home")[0].classList.remove("hide");
                redFlagStatus.getElementsByClassName("taken")[0].classList.add("hide");
            } else if (flagStatus.red == "Taken") {
                redFlagStatus.getElementsByClassName("home")[0].classList.add("hide");
                redFlagStatus.getElementsByClassName("taken")[0].classList.remove("hide");
            }

            const findTeam = teamName => {
                for (let i = 0; i < self.data.Entries.length; i++) {
                    if (self.data.Entries[i].Name == teamName) return self.data.Entries[i];
                }
                return false;
            };

            const cyan = findTeam("cyan") || { Score: 0 };
            const red = findTeam("red") || { Score: 0 };

            const cyanScore = Math.min(cyan.Score, 5);
            const redScore = Math.min(red.Score, 5);

            const image = i => {
                return `<img class="overlap" src="${sprites[i].image.src}"></img>`;
            };
            const cyanAngle = Math.atan2(cyanFlag.Position.Y - position.Y, cyanFlag.Position.X - position.X);
            const redAngle = Math.atan2(redFlag.Position.Y - position.Y, redFlag.Position.X - position.X);
            leaderboard.innerHTML = `<tbody>${outR}</tbody>`;
            leaderboardLeft.innerHTML = `<tbody>${outL}</tbody>`;
            leaderboardCenter.style.width = "372px";
            leaderboardCenter.style.height = "83px";
            leaderboardCenter.innerHTML =
                `<tbody><tr>` +
                `<td class="flag"><img class="flag-arrow" src="${sprites["ctf_arrow_blue"].image.src}" style="transform:rotate(${cyanAngle}rad);right:-50px"></img></td>` +
                `<td style="width:300px;position:relative">` +
                image("ctf_score_stripes") +
                image(`ctf_score_left_${Math.min(cyanScore, 4)}`) +
                image(`ctf_score_right_${Math.min(redScore, 4)}`) +
                image(`ctf_score_final${cyanScore >= 5 ? "_blue" : redScore >= 5 ? "_red" : ""}`) +
                `</td>` +
                `<td class="flag"><img class="flag-arrow" src="${sprites["ctf_arrow_red"].image.src}" style="transform:rotate(${redAngle}rad);left:-50px"></img></td>` +
                `</tr></tbody>`;
            console.log("leaderboarded");
        }
    }
}

function drawMinimap(x, y, color, self) {
	var minimapX = (x + worldSize) / 2 / worldSize * minimap.width - 2;
	var minimapY = (y + worldSize) / 2 / worldSize * minimap.height - 2;
	
	if (!self) {
		minimapCtx.fillStyle = entry.Color;
		minimapCtx.fillRect(minimapX, minimapY, 4, 4);
	} else {
		minimapCtx.fillStyle = "white";
		minimapCtx.fillRect(minimapX-1, minimapY-1, 6, 6);
	}
}
