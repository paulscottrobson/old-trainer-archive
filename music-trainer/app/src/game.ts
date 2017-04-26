/// <reference path="../lib/phaser.comments.d.ts"/>

class GameState extends Phaser.State {

    private music:Music;
    private bgr:Background;
    private brd:BaseRenderer;

    create() : void {
        var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","background");
        bgr.width = this.game.width;bgr.height = this.game.height;

        this.music = new Music();
        this.music.load(this.game.cache.getJSON("music"));
        this.bgr = new FretboardBackground(this.game,this.music.instrument);
        console.log(this.music);
        for (var b = 0;b < 2;b++) {
            var brd:BaseRenderer = new FretboardBarRenderer(this.game,this.music.instrument,this.bgr);
            brd.draw(this.music.bar[b+0]);
            brd.move(this.music.bar[b+0],100+b*550);
        }
        //this.brd.erase(this.music.bar[0]);
        //this.bgr.delete();
    }

    destroy() : void {
    }

    update() : void {
    }
}    
