//// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 *  Drawing things descend from this - has basic information.
 * 
 * @class BaseRenderingEntity
 * @extends {Phaser.Group}
 */

class BaseRenderingEntity extends Phaser.Group {

    protected xWidth:number;
    protected instrument:BaseInstrument;
    protected yHeight:number;
    protected yCentre:number;

    constructor(game:Phaser.Game,instrument:BaseInstrument) {
        super(game);
        this.instrument = instrument;
        // Work out the sizes of things
        this.xWidth = 550;
        this.yHeight = this.game.height * 0.4;
        this.yCentre = this.game.height * 0.9 - this.yHeight / 2;
    }

    destroy(): void {
        super.destroy();
        this.instrument = null;
    }
}