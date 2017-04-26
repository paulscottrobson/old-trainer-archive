/// <reference path="../lib/phaser.comments.d.ts"/>

class GameState extends Phaser.State {

    private music:Music;
    private player:MusicPlayer;    
    private manager:MusicDisplayManager;

    create() : void {
        var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","background");
        bgr.width = this.game.width;bgr.height = this.game.height;

        this.music = new Music()
        this.music.load(this.game.cache.getJSON("music"),
                        new Instrument(this.game.cache.getJSON("instrument")));

        var tabsheet:TabSheet = new TabSheet(this.game,this.music,this.game.width,this.game.height);
        this.game.add.existing(tabsheet);
        // tabsheet.destroy();
    }

    destroy() : void {
    }

    update() : void {
    }
}    
