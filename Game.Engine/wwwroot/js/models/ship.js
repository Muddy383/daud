﻿import { RenderedObject } from "./renderedObject";

export class Ship extends RenderedObject {
    constructor(container) {
        super(container);
    }

    getMode(mode) {
        switch (mode) {
            case 0: return "default";
            case 1: return "boost";
            case 2: return "weaponupgrade";
            case 3: return "invulnerable";
            default: return "default";
        }
    }

    static getSelectorImage(spriteName)
    {
        var spriteDefinition = RenderedObject.getSpriteDefinition(spriteName);

        if (spriteDefinition.selector)
            return RenderedObject.getTextureImage(spriteDefinition.selector);
        else
            return false;
    }
}
