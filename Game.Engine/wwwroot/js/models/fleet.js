﻿import { Settings } from "../settings";

export class Fleet {
    constructor(container, cache) {
        this.container = container;
        this.caption = false;
        this.ships = [];
        this.ID = false;

        this.text = new PIXI.Text("", { fontFamily: Settings.font, fontSize: Settings.nameSize, fill: 0xffffff });
        this.text.anchor.set(0.5, 0.5);
        this.text.position.x = 0;
        this.text.position.y = 0;
        this.container.addChild(this.text);

    }

    addShip(ship)
    {
        this.ships.push(ship);
        ship.fleet = this;
    }

    removeShip(ship)
    {
        this.ships = this.ships.filter(s => s != ship);
    }
    
    update(groupUpdate)
    {
        this.caption = groupUpdate.Caption;
        this.ID = groupUpdate.ID;

    }

    preRender(time, interpolator, myfleetID)
    {
        //console.log(`Group: ${this.ID} ${this.caption} ${this.ships.length}`);
        if (this.ships.length > 0 && (this.ID != myfleetID || Settings.showOwnName || document.body.classList.contains("spectating")))
        {
            if (this.text.visible != Settings.namesEnabled)
                this.text.visible = Settings.namesEnabled;

            if (Settings.nameSize)
            {
                if (this.caption)
                    this.text.text = this.caption;
                else
                    this.text.text = "";

                //this.text.text += " " + this.ships.length;
                var accX = 0, accY = 0, count = 0;

                this.ships.forEach(ship => {
                    var position = interpolator.projectObject(ship.body, time);
                    accX += position.X;
                    accY += position.Y;
                    count++;
                });


                const offsetY = 180;
                this.text.position.x = accX / count;
                this.text.position.y = accY / count + offsetY;
            }
        }
        else
            this.text.visible = false;
    }

    destroy()
    {
        this.container.removeChild(this.text);
        //console.log("fleet destroyed");
    }
}
