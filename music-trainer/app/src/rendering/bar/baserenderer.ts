//// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Base class for rendering bars on screen.
 * 
 * @class BaseRenderer
 * @extends {Phaser.Group}
 */
class BaseRenderer extends BaseRenderingEntity {

    protected isDrawn:boolean;
    private static DEBUG:boolean = true;
    private debugRect:Phaser.Image
    protected background:Background;

    /**
     * Creates an instance of BaseRenderer.
     * @param {Phaser.Game} game 
     * @param {BaseInstrument} instrument 
     * 
     * @memberOf BaseRenderer
     */
    constructor(game:Phaser.Game,instrument:BaseInstrument,background:Background) {
        super(game,instrument);
        this.instrument = instrument;
        this.background = background;
        this.isDrawn = false;
        this.initialiseRenderer();
    }

    /**
     * Called when object is destroyed.
     * 
     * @memberOf BaseRenderer
     */
    destroy() : void {
        super.destroy();
        this.terminateRenderer();
        this.isDrawn = false;
    }

    /**
     * Instantiate, but don't position, the objects making up the 
     * display.
     * 
     * @param {Bar} bar 
     * 
     * @memberOf BaseRenderer
     */
    draw(bar:Bar) : void {
        // If not drawn already
        if (!this.isDrawn) {
            // Draw frames and stuff.
            this.renderDrawBarFrame(bar);
            // Draw notes
            for (var n:number = 0;n < bar.count;n++) {
                this.renderDrawBarNote(bar,bar.note[n]);
            }
            // Draw debug rectangle
            if (BaseRenderer.DEBUG) {
                this.debugRect = this.game.add.image(0,0,"sprites","frame",this);
                this.debugRect.tint = 0xFF0000;this.debugRect.width = this.xWidth;
                this.debugRect.height = this.yHeight;this.debugRect.anchor.setTo(0,0.5);
                this.debugRect.alpha = 0.5;
            }                

            this.isDrawn = true;
        }
    }

    /**
     * Position a drawn bar. Will create bar using draw if required.
     * 
     * @param {Bar} bar bar
     * @param {number} xPos left side of box. 
     * 
     * @memberOf BaseRenderer
     */
    move(bar:Bar,xPos:number) : void {        
        // Draw it if not drawn already
        if (!this.isDrawn) {
            this.draw(bar);
        }
        // Move frames
        this.renderMoveBarFrame(bar,xPos);
        // Move notes
        for (var n:number = 0;n < bar.count;n++) {
            this.renderMoveBarNote(bar,bar.note[n],xPos);
        }
        // Move debug rectangle
        if (BaseRenderer.DEBUG) {
            this.debugRect.position.setTo(xPos,this.yCentre);
        }
    }

    /**
     * Erase a drawn bar.
     * 
     * @param {Bar} bar 
     * 
     * @memberOf BaseRenderer
     */
    erase(bar:Bar) : void {        
        // If not deleted already.
        if (this.isDrawn) {
            // Erase frames
            this.renderEraseBarFrame(bar);
            // Erase notes
            for (var n:number = 0;n < bar.count;n++) {
                this.renderEraseBarNote(bar,bar.note[n]);
            }
            // Erase debug bar.
            if (BaseRenderer.DEBUG) {
                this.debugRect.destroy();
                this.debugRect = null;
            }
            this.isDrawn = false;
        }
    }

    /**
     * Called when rendering first starts
     * 
     * @protected
     * 
     * @memberOf BaseRenderer
     */
    protected initialiseRenderer(): void { }

    /**
     * Called when renderer group destroyed
     * 
     * @protected
     * 
     * @memberOf BaseRenderer
     */
    protected terminateRenderer(): void { }

    /**
     * Draw the non note parts of the bar
     * 
     * @protected
     * @param {Bar} bar 
     * 
     * @memberOf BaseRenderer
     */
    protected renderDrawBarFrame(bar:Bar) : void {  }
    
    /**
     * Erase the non note parts of the bar
     * 
     * @protected
     * @param {Bar} bar 
     * 
     * @memberOf BaseRenderer
     */
    protected renderEraseBarFrame(bar:Bar) : void {  }
    
    /**
     * Move the non note parts of the bar
     * 
     * @protected
     * @param {Bar} bar 
     * @param {number} xPos 
     * 
     * @memberOf BaseRenderer
     */
    protected renderMoveBarFrame(bar:Bar,xPos:number) : void {  }

    /**
     * Draw a note
     * 
     * @protected
     * @param {Bar} bar 
     * @param {Note} note 
     * 
     * @memberOf BaseRenderer
     */
    protected renderDrawBarNote(bar:Bar,note:Note) : void {  }

    /**
     * Erase a note
     * 
     * @protected
     * @param {Bar} bar 
     * @param {Note} note 
     * 
     * @memberOf BaseRenderer
     */
    protected renderEraseBarNote(bar:Bar,note:Note) : void {  }

    /**
     * Move a note
     * 
     * @protected
     * @param {Bar} bar 
     * @param {Note} note 
     * @param {number} xPos 
     * 
     * @memberOf BaseRenderer
     */
    protected renderMoveBarNote(bar:Bar,note:Note,xPos:number) : void {  }    
}