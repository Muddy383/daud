import { Settings } from "./settings";
import { FleetRenderer } from "./renderers/fleetRenderer";
import images from "../img/*.png";
import {textures } from "./cache";

function sprite(name, scale, animated, loop, animationSpeed) {
    const img = new Image();
    img.src = images[name];

    return {
        image: img,
        name: name,
        scale: scale || 0.02,
        animated: animated,
        loop: loop,
        animationSpeed: animationSpeed || 1
    };
}

export const sprites = {
    ship0: sprite("ship0"),
    ship_green: sprite("ship_green"),
    ship_gray: sprite("ship_gray"),
    ship_orange: sprite("ship_orange"),
    ship_pink: sprite("ship_pink"),
    ship_red: sprite("ship_red"),
    ship_cyan: sprite("ship_cyan"),
    ship_yellow: sprite("ship_yellow"),
    ship_flash: sprite("ship_flash"),
    ship_secret: sprite("ship_secret"),
    ship_zed: sprite("ship_zed"),
    bullet_green: sprite("bullet_green", 0.03),
    bullet_orange: sprite("bullet_orange", 0.03),
    bullet_pink: sprite("bullet_pink", 0.03),
    bullet_red: sprite("bullet_red", 0.03),
    bullet_cyan: sprite("bullet_cyan", 0.03),
    bullet_yellow: sprite("bullet_yellow", 0.03),
    fish: sprite("ship0", 0.01),
    bullet: sprite("bullet", 0.02),
    seeker: sprite("seeker", 0.02),
    seeker_pickup: sprite("seeker_pickup", 0.02),
    obstacle: sprite("obstacle", 0.0028),
    arrow: sprite("arrow", 0.03)
};

export const spriteIndices = [
    "none",
    "ship0",
    "ship_green",
    "ship_gray",
    "ship_orange",
    "ship_pink",
    "ship_red",
    "ship_cyan",
    "ship_yellow",
    "ship_flash",
    "ship_secret",
    "ship_zed",
    "bullet_green",
    "bullet_orange",
    "bullet_pink",
    "bullet_red",
    "bullet_cyan",
    "bullet_yellow",
    "fish",
    "bullet",
    "seeker",
    "seeker_pickup",
    "obstacle",
    "arrow"
];

function addSprite(name, size, file) {
    sprites[name] = sprite(file || name, size);
    spriteIndices.push(name);
}

function addAnimation(name, size, loop, speed)
{
    sprites[name] = sprite(name, size, true, loop, speed);
    spriteIndices.push(name);    
}

const flagScale = 0.003;

addSprite("flag_blue_0", flagScale);
addSprite("flag_blue_1", flagScale);
addSprite("flag_blue_2", flagScale);
addSprite("flag_blue_3", flagScale);
addSprite("flag_blue_4", flagScale);
addSprite("flag_blue_5", flagScale);
addSprite("flag_red_0", flagScale);
addSprite("flag_red_1", flagScale);
addSprite("flag_red_2", flagScale);
addSprite("flag_red_3", flagScale);
addSprite("flag_red_4", flagScale);
addSprite("flag_red_5", flagScale);
addSprite("ctf_base", 0.0075);

addSprite("ctf_score_final");
addSprite("ctf_score_final_blue");
addSprite("ctf_score_final_red");
addSprite("ctf_score_left_0");
addSprite("ctf_score_left_1");
addSprite("ctf_score_left_2");
addSprite("ctf_score_left_3");
addSprite("ctf_score_left_4");
addSprite("ctf_score_right_0");
addSprite("ctf_score_right_1");
addSprite("ctf_score_right_2");
addSprite("ctf_score_right_3");
addSprite("ctf_score_right_4");
addSprite("ctf_score_stripes");
addSprite("ctf_arrow_red", 0.05);
addSprite("ctf_arrow_blue", 0.05);
addSprite("ctf_arrow_trans_flag", 0.1);
addAnimation("thruster_default_green");
addAnimation("thruster_default_orange");
addAnimation("thruster_default_pink");
addAnimation("thruster_default_red");
addAnimation("thruster_default_cyan");
addAnimation("thruster_default_yellow");
addAnimation("thruster_retro_green");
addAnimation("thruster_retro_orange");
addAnimation("thruster_retro_pink");
addAnimation("thruster_retro_red");
addAnimation("thruster_retro_cyan");
addAnimation("thruster_retro_yellow");
addAnimation("circles");

const background = new PIXI.Texture.fromImage(images["bg"]);
export const backgroundSprite = new PIXI.extras.TilingSprite(background, 200000, 200000);
backgroundSprite.tileScale.set(10, 10);
backgroundSprite.position.x = -100000;
backgroundSprite.position.y = -100000;

export class Renderer {
    constructor(container, settings = {}) {
        this.container = container;
        this.view = false;

        this.container.addChild(backgroundSprite);

        this.graphics = new PIXI.Graphics();
        this.updateWorldSize(6000);
        this.container.addChild(this.graphics);

        //this.fleetRenderer = new FleetRenderer(context, settings);
    }

    updateWorldSize(size) {
        const edgeWidth = 4000;
        this.graphics.clear();
        this.graphics.beginFill(0xff0000, 0.1);
        this.graphics.drawRect(-size - edgeWidth, -size - edgeWidth, 2 * size + 2 * edgeWidth, edgeWidth);
        this.graphics.drawRect(-size - edgeWidth, -size, edgeWidth, 2 * size);
        this.graphics.drawRect(+size, -size, edgeWidth, 2 * size);
        this.graphics.drawRect(-size - edgeWidth, +size, 2 * size + 2 * edgeWidth, edgeWidth);
        this.graphics.endFill();

        this.graphics.lineStyle(40, 0x0000ff);
        this.graphics.drawRect(-size, -size, size * 2, size * 2);

        this.worldSize = size;
    }
    draw(cache, interpolator, currentTime, fleetID) {
        const groupsUsed = [];

        if (Settings.background == "none" && backgroundSprite.visible)
            backgroundSprite.visible = false;
        if (Settings.background == "on" && !backgroundSprite.visible)
            backgroundSprite.visible = true;

        cache.foreach(function(body) {
            const object = body;
            let group = false;

            const position = interpolator.projectObject(object, currentTime);

            const objec2 = cache.bodies[`p-${body.ID}`];
            objec2.position.x = position.X;
            objec2.position.y = position.Y;
            objec2.rotation = position.Angle;

            // keep track of which "groups" are used, and collect the points of all the objects
            // in the groups... we'll use this later to draw a label on the group (eg, fleet of ships)
            if (object.Group) {
                for (let i = 0; i < groupsUsed.length; i++)
                    if (groupsUsed[i].id == object.Group) {
                        group = groupsUsed[i];
                        break;
                    }

                if (!group) {
                    group = {
                        id: object.Group,
                        group: cache.groups[`g-${object.Group}`],
                        points: []
                    };

                    groupsUsed.push(group);
                }

                group.points.push(position);
            }
        }, this);

        // draw labels on groups
        let ids = [];
        if (Settings.namesEnabled) {
            for (let i = 0; i < groupsUsed.length; i++) {
                const group = groupsUsed[i];

                if (group && group.group) {
                    ids.push(`g-${group.group.ID}`);
                    if (group.group.ID != fleetID || Settings.showOwnName) {
                        const pt = { X: 0, Y: 0 };

                        // average the location of all the points
                        // to find a "center"
                        for (let x = 0; x < group.points.length; x++) {
                            pt.X += group.points[x].X;
                            pt.Y += group.points[x].Y;
                        }
                        pt.X /= group.points.length;
                        pt.Y /= group.points.length;

                        // draw a caption relative to the average above
                        const body = cache.bodies[`p-${group.group.ID}`];
                        body.position.x = pt.X;
                        body.position.y = pt.Y;
                        body.visible = Settings.namesEnabled;
                    }
                }
            }
        }
        for (var k in cache.groups) {
            if (!ids.includes(k)) {
                const body = cache.bodies[`p-${k.substr(2)}`];
                body.visible = false;
            }
        }
    }

    colorValue(colorName) {
        switch (colorName) {
            case "cyan":
                return "rgba(0,255,255,.2)";
            case "gray":
                return "rgba(128,128,128,.2)";
            case "green":
                return "rgba(0,255,0,.2)";
            case "orange":
                return "rgba(255,140,0,.2)";
            case "pink":
                return "rgba(255,105,180,.2)";
            case "red":
                return "rgba(255,0,0,.2)";
            case "yellow":
                return "rgba(255,255,0,.2)";
        }
    }
}
