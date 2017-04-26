/// <reference path="../lib/phaser.comments.d.ts"/>

class MainState extends Phaser.State {

    create() : void {
        // Stretched background
        var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","background");
        bgr.width = this.game.width;bgr.height = this.game.height;
    }

    destroy() : void {
    }

    update() : void {
    }
}    
