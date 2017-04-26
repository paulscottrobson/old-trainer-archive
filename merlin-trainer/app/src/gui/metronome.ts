/// <reference path="../../lib/phaser.comments.d.ts"/>

class Metronome extends Phaser.Group implements IMetronome {
    
    private metroImg:Phaser.Image;
    constructor(game:Phaser.Game) {
        super(game);
        this.metroImg = this.game.add.image(0,0,"sprites","metronome",this);
        this.metroImg.anchor.setTo(0.5,1);
        this.metroImg.scale.x = this.metroImg.scale.y = this.game.height / 5 / this.metroImg.height;
    }

    destroy(): void {
        this.metroImg = null;
    }

    updatePosition(mbPos:number,beats:number): void {
        var twoBeat = Math.round(1000 / (beats / 2));
        var rot:number = (mbPos % twoBeat) / twoBeat;
        if (rot > 0.5) { rot = 1-rot; }
        this.metroImg.rotation =(rot -0.25) * Math.PI / 2;
    }

}