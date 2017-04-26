/// <reference path="../lib/phaser.comments.d.ts"/>

class MainState extends Phaser.State {

    private player:IPlayer;
    private music:IMusic;
    private manager:IManager;
    private metronome:IMetronome;
    private panel:ControlPanel;
    private controlBar:IControlBar;

    create() : void {
        // Stretched background
        var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","background");
        bgr.width = this.game.width;bgr.height = this.game.height;


        this.metronome = new Metronome(this.game);

        this.music = new Music(this.game.cache.getJSON("music"));

        this.player = new MusicPlayer(this.game,this.music);
        this.player.x = 160;this.player.y = 110;
        this.player.width = 300;this.player.height = 200;

        this.manager = new DisplayManager(this.game,this.music,this.game.width,this.game.height/2);
        this.manager.y = this.game.height - 100 - this.manager.getHeight();

        this.panel = new ControlPanel(this.game,this.manager,this.player,false);
        this.panel.scale.x = this.panel.scale.y = this.game.width * 0.75 / this.panel.width;
        this.panel.x = this.game.width - this.panel.width - 10;this.panel.y = 10;

        this.controlBar = new ControlBar(this.game,this.game.width * 0.9,this.music.getBarCount());
        this.controlBar.x = this.game.width * 0.05;
        this.controlBar.y = (this.manager.bottom+this.game.height) / 2;

        this.controlBar.setPosition.add((ctrlBar:IControlBar,bar:number,mbPos:number) => {
            this.player.moveTo(bar,mbPos);
        },this);

        this.metronome.x = this.game.width * 0.85;this.metronome.y = this.manager.y;

        this.player.onPositionUpdate.add((player:IPlayer,bar:number,mbPos:number) => {
            this.manager.moveCursor(bar,mbPos);
            this.controlBar.moveCursor(bar,mbPos);
            this.metronome.updatePosition(mbPos,this.music.getStandardBeats());
        },this);
    }

    destroy() : void {
        this.player = this.music = this.manager = this.metronome = this.panel = null;
    }

    update() : void {
    }
}    
