/// <reference path="../../lib/phaser.comments.d.ts"/>

interface IRenderer extends Phaser.Group {
    /**
     * Destroys the rendered object and group, must call super.destroy()
     * 
     * @memberOf IRenderer
     */
    destroy(): void;
    /**
     * Render a bar on the display.
     * 
     * @param {IRoll} roll roll to render
     * @param {number} barWidth width of bar in total
     * @param {number} barHeight height of bar in total
     * 
     * @memberOf IRenderer
     */
    render(roll:IRoll,barWidth:number,barHeight:number);
    /**
     * Erase the bar but do not delete the group.
     * 
     * @memberOf IRenderer
     */
    erase():void;
    /**
     * Highlight a particular half-beat in the bar using the marker.
     * 
     * @param {number} halfBeat half beat to highlight
     * @param {Phaser.Image} marker marker object.
     * 
     * @memberOf IRenderer
     */
    highlight(halfBeat:number,marker:Phaser.Image):void;
    /**
     * Get width of bar
     * 
     * @returns {number} 
     * 
     * @memberOf IRenderer
     */
    getWidth():number;
    /**
     * Get height of bar.
     * 
     * @returns {number} 
     * 
     * @memberOf IRenderer
     */
    getHeight():number;
}