import Plotly from './plotly-subset';

export class Overlay {
    constructor(container, canvas, plotly) {
        this.container = container;
        this.plotly = plotly;
        this.canvas = canvas;
        this.data = false;
    }

    update(customData) {
        this.data = customData;
    }

    draw(cache, interpolator, currentTime, fleetID)
    {
    }
}
