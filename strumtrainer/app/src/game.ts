/// <reference path="../lib/phaser.comments.d.ts"/>

class GameState extends Phaser.State {

    private music:Music;
    private dm:MusicDisplayManager;

    create() : void {
        var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","background");
        bgr.width = this.game.width;bgr.height = this.game.height;
        this.music = new Music()
        this.music.load(this.game.cache.getJSON("music"));
        console.log(this.music);
        this.dm = new MusicDisplayManager(this.game,this.music,this.game.width,this.game.height*0.7);
        this.dm.x = 0; this.dm.y = 20;
        var s:Phaser.Sound = this.game.add.audio("metronome");
        this.dm.onClick.add((bar,note) => {
            console.log(bar,note);
            this.dm.moveCursor(bar,note);
            this.dm.scrollToView(bar);
            s.play();
        },this);   
    }

    destroy() : void {
    }

    update() : void {
    }
}    
