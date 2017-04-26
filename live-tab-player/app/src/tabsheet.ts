/// <reference path="../lib/phaser.comments.d.ts"/>

class TabSheet extends Phaser.Group {

    private manager:MusicDisplayManager;
    private player:MusicPlayer;
    private music:Music;

    constructor(game:Phaser.Game,music:Music,width:number,height:number) {
        super(game);
        this.music = music;
        this.manager = new MusicDisplayManager(this.game,this.music,width,height);
        this.add(this.manager);

        this.manager.x = 0; this.manager.y = 0;

        this.player = new MusicPlayer(this.game,this.music,1,PreloadState.NOTE_COUNT);
        this.add(this.player);

        this.manager.onClick.add((bar,note) => {
            this.manager.moveCursor(bar,note);
            this.manager.scrollToView(bar);
            this.player.moveTo(bar,note);
        },this); 

        this.player.onPlayNote.add((bar:number,noteNumber:number,note:number) => {
            this.manager.moveCursor(bar,noteNumber);
            this.manager.scrollToView(bar);
        });  

        var pnl:ControlPanel = new ControlPanel(this.game,this.manager,this.player);
        this.add(pnl);
        pnl.scale.x = pnl.scale.y = width * 0.7 / pnl.width;
        pnl.x = 0;
        pnl.y = pnl.height / 2;
        this.manager.y = pnl.height;
        this.player.scale.x = this.player.scale.y = pnl.height * 0.9 / this.player.height;
        this.player.x = width-this.player.width;this.player.y = pnl.height / 2 - this.player.height / 2;
    }

    destroy() : void {
        super.destroy();
        this.manager = this.player = this.music = null;
    }
}