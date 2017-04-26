// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Base Background Class. Not abstract but should be overridden.
 * 
 * @class Background
 * @extends {BaseRenderingEntity}
 */
class Background extends BaseRenderingEntity {

    protected isDrawn:boolean;

    /**
     * Creates an instance of Background.
     * @param {Phaser.Game} game 
     * 
     * @memberOf Background
     */
    constructor (game:Phaser.Game,instrument:BaseInstrument) {
        super(game,instrument);
        // Initial creation        
        this.isDrawn = false;
        this.create();
    }

    /**
     * Destroy routine from Phaser.
     * 
     * @memberOf Background
     */
    destroy() : void {
        this.delete();
        super.destroy();
    }

    /**
     * Create the background - this is a dummy one.
     * 
     * @returns {void} 
     * 
     * @memberOf Background
     */
    create(): void {
        if (this.isDrawn) { return; }
        this.isDrawn = true;
        this.createBackground();
    }

    /**
     * Does the actual work, override this one.
     * 
     * @memberOf Background
     */
     protected createBackground(): void {
        var img:Phaser.Image = this.game.add.image(0,this.yCentre,"sprites","rectangle",this);
        img.anchor.setTo(0,0.5);img.tint = 0x800000;
        img.height = this.yHeight;img.width = this.game.width;
        img = this.game.add.image(0,this.yCentre,"sprites","rectangle",this);
        img.width = this.game.width;img.height = 4;img.anchor.setTo(0,0.5);
        img.tint = 0xFFFF00;
    }

    /**
     * Delete the background.
     * 
     * @returns {void} 
     * 
     * @memberOf Background
     */
    delete(): void {
        if (!this.isDrawn) { return; }
        this.isDrawn = false;
        this.deleteBackground();
        // Deletes any objects in the group.
        this.forEachAlive((obj:any) => { obj.pendingDestroy = true; },this);
    }

    /**
     *  Does the actual work, override if required, not usually required.
     * 
     * @memberOf Background
     */
    protected deleteBackground(): void {
    }
}