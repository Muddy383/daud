import { fetch } from "whatwg-fetch";
import { toggleLobby } from "./lobby";
import Cookies from "js-cookie";
import JSZip from "jszip";
import { textureMap } from "./models/textureMap";
import { spriteModeMap } from "./models/spriteModeMap";

import * as PIXI from "pixi.js";
import { textureCache } from "./models/textureCache";

export const Settings = {
    theme: false,
    themeCustom: false,
    mouseScale: 1.0,
    font: "sans-serif",
    leaderboardEnabled: true,
	displayMinimap: "always",
    hudEnabled: true,
    namesEnabled: true,
    bandwidth: 100,
    showCooldown: true,
    logLength: 4,
    bigKillMessage: true,
    showPickupSprites: false,
    showThrusterSprites: true,
    showOwnName: true,
    nameSize: 48,
    background: "on"
};

function parseQuery(queryString) {
    const query = {};
    const pairs = (queryString[0] === "?" ? queryString.substr(1) : queryString).split("&");
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split("=");
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    }
    return query;
}

function save() {
    const cookieOptions = { expires: 300 };
    let reload = false;

    if (Settings.theme != document.getElementById("settingsThemeSelector").value) {
        Settings.theme = document.getElementById("settingsThemeSelector").value;
        reload = true;
    }
    if (Settings.themeCustom != document.getElementById("settingsThemeSelectorCustom").value) {
        Settings.themeCustom = document.getElementById("settingsThemeSelectorCustom").value;
        reload = true;
    }

    Settings.mouseScale = document.getElementById("settingsMouseScale").value;
    Settings.font = document.getElementById("settingsFont").value;
    Settings.leaderboardEnabled = document.getElementById("settingsLeaderboardEnabled").checked;
	Settings.displayMinimap = document.getElementById("settingsDisplayMinimap").value;
    Settings.namesEnabled = document.getElementById("settingsNamesEnabled").checked;
    Settings.bandwidth = document.getElementById("settingsBandwidth").value;
    Settings.hudEnabled = document.getElementById("settingsHUDEnabled").checked;
    Settings.showCooldown = document.getElementById("settingsShowCooldown").checked;
    Settings.logLength = document.getElementById("settingsLog").value;
    Settings.bigKillMessage = document.getElementById("settingsBigKillMessage").checked;
    Settings.showPickupSprites = document.getElementById("settingsShowPickupSprites").checked;
    Settings.showThrusterSprites = document.getElementById("settingsShowThrusterSprites").checked;
    Settings.showOwnName = document.getElementById("settingsShowOwnName").checked;
    Settings.nameSize = Number(document.getElementById("settingsNameSize").value);
    Settings.background = document.getElementById("settingsBackground").value;

    Cookies.set("settings", Settings, cookieOptions);

    console.log(Settings);

    if (reload) window.location.reload();
	
	//executeMinimapSettings()
}

function reset() {
    Cookies.remove("settings");
}

function load() {
    try {
        const savedSettings = Cookies.getJSON("settings");

        if (savedSettings) {
            // copying value by value because cookies can be old versions
            // any values NOT in the cookie will remain defined with the new defaults
            for (const key in savedSettings) Settings[key] = savedSettings[key];

            if (Settings.theme == "3ds2agh4z76feci")
                Settings.theme = "516mkwof6m4d4tg";
        }

        document.getElementById("settingsThemeSelector").value = Settings.theme;
        document.getElementById("settingsThemeSelectorCustom").value = Settings.themeCustom || "";

        document.getElementById("settingsMouseScale").value = Settings.mouseScale;
        document.getElementById("settingsFont").value = Settings.font;
        document.getElementById("settingsLeaderboardEnabled").checked = Settings.leaderboardEnabled;
		document.getElementById("settingsDisplayMinimap").checked = Settings.displayMinimap
        document.getElementById("settingsNamesEnabled").checked = Settings.namesEnabled;
        document.getElementById("settingsBandwidth").value = Settings.bandwidth;
        document.getElementById("settingsHUDEnabled").checked = Settings.hudEnabled;
        document.getElementById("settingsShowCooldown").checked = Settings.showCooldown;
        document.getElementById("settingsLog").value = Settings.logLength;
        document.getElementById("settingsBigKillMessage").checked = Settings.bigKillMessage;
        document.getElementById("settingsShowPickupSprites").checked = Settings.showPickupSprites;
        document.getElementById("settingsShowThrusterSprites").checked = Settings.showThrusterSprites;
        document.getElementById("settingsShowOwnName").checked = Settings.showOwnName;
        document.getElementById("settingsNameSize").value = Settings.nameSize;
        document.getElementById("settingsBackground").value = Settings.background;
    } catch (e) {
        // maybe reset()? will make debugging difficult
    }
}

async function theme(v) {
    const link = `https://dl.dropboxusercontent.com/s/${v}/daudmod.zip`;
    const zip = await fetch(link)
        .then(response => response.blob())
        .then(JSZip.loadAsync);
    zip.file("daudmod/info.json")
        .async("string")
        .then(text => {
            const info = JSON.parse(text);

            var version = 1;
            if (info.version) version = info.version;

            if (info.files) {
                // old format info.json
                info.files.forEach(element => {
                    zip.file(`daudmod/${element[0]}.png`)
                        .async("arraybuffer")
                        .then(ab => {
                            const arrayBufferView = new Uint8Array(ab);
                            const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
                            const urlCreator = window.URL || window.webkitURL;
                            const url = urlCreator.createObjectURL(blob);

                            textureMap[element[0]].url = url;
                            if (element[1]) {
                                var scale = element[1];
                                if (version == 1 && element[0].startsWith("ship")) scale = 0.03;

                                if (scale) textureMap[element[0]].scale = scale;
                            }

                            if (window.Game && window.Game.cache) {
                                textureCache.clear();
                                window.Game.cache.refreshSprites();
                                window.Game.reinitializeWorld();
                            }
                        });
                });
            }

            if (info.spriteModeMap)
            {
                for(var key in info.spriteModeMap)
                {
                    var modeMap = info.spriteModeMap[key];
                    
                    for(var mapKey in modeMap)
                        spriteModeMap[key][mapKey] = modeMap[mapKey];
                }
            }


            var downloadFile = function(key, filename)
            {
                zip.file(`daudmod/${filename}.png`)
                .async("arraybuffer")
                .then(ab => {
                    const arrayBufferView = new Uint8Array(ab);
                    const blob = new Blob([arrayBufferView], { type: "image/png" });
                    const urlCreator = window.URL || window.webkitURL;
                    const url = urlCreator.createObjectURL(blob);

                    textureMap[key].url = url;

                    if (window.Game && window.Game.cache)
                    {
                        textureCache.clear();
                        window.Game.cache.refreshSprites();
                        window.Game.reinitializeWorld();
                    }

                });

            };

            if (info.textureMap)
            {
                for(var key in info.textureMap)
                {
                    var map = info.textureMap[key];

                    for(var textureKey in map)
                    {
                        if (!textureMap[key])
                            textureMap[key] = {};

                        textureMap[key][textureKey] = map[textureKey];
                    }

                    downloadFile(key, map.file);
                }
            }
        });
}

load();

// override settins from querystring values
const qs = parseQuery(window.location.search);
if (qs.themeCustom) Settings.themeCustom = qs.themeCustom;
if (qs.leaderboardEnabled) Settings.leaderboardEnabled = qs.leaderboardEnabled == "true";
if (qs.hudEnabled) Settings.hudEnabled = qs.hudEnabled == "true";
if (qs.namesEnabled) Settings.namesEnabled = qs.namesEnabled == "true";
if (qs.bandwidth) Settings.bandwidth = Number(qs.bandwidth);

if (Settings.themeCustom) {
    theme(Settings.themeCustom);
} else if (Settings.theme) {
    theme(Settings.theme);
} // no good way to reset to default :(

const gear = document.getElementById("gear");
document.getElementById("settings").addEventListener("click", () => {
    toggleLobby();
    gear.classList.remove("closed");
});

document.getElementById("settingsCancel").addEventListener("click", () => {
    toggleLobby();
    gear.classList.add("closed");
});

document.getElementById("settingsSave").addEventListener("click", () => {
    save();
    load();
    toggleLobby();
    gear.classList.add("closed");
});

document.getElementById("settingsReset").addEventListener("click", () => {
    reset();
    window.location.reload();
});


// minimap

// executeMinimapSettings()

function executeMinimapSettings() {
	if (Settings.displayMinimap === "never") {
		document.getElementById("minimap").style.display = "none";
		document.getElementById("minimapTip").style.display = "none";
	} else if ( Settings.displayMinimap === "onkeypress") {
		document.getElementById("minimap").style.display = "none";
		document.getElementById("minimapTip").style.display = "block";
	} else if ( Settings.displayMinimap === "always") {
		document.getElementById("minimap").style.display = "block";
		document.getElementById("minimapTip").style.display = "none";
	}
}
