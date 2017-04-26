/// <reference path="../lib/phaser.comments.d.ts"/>

class GameState extends Phaser.State {

    create() : void {
        var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","background");
        bgr.width = this.game.width;bgr.height = this.game.height;

        var marker:Phaser.Image = this.game.add.image(0,0,"sprites","rectangle");
        marker.tint = 0x0080F0;marker.alpha = 0.4;

        var fwr:IRoll = new TestFoggyMountainRoll();
        var rnd:IRenderer = new Renderer(this.game);
        rnd.render(fwr,512,256);
        rnd.x = rnd.y = 50;
        rnd.highlight(2,marker);
        console.log(rnd.x,rnd.y);
    }

    destroy() : void {
    }

    update() : void {
    }
}    
