/// <reference path="../lib/phaser.comments.d.ts"/>

class GameState extends Phaser.State {

    private music:IMusic;
    private manager:IManager;
    private player:IPlayer;
    private panel:ControlPanel;

    create() : void {
        // Stretched background
        var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","background");
        bgr.width = this.game.width;bgr.height = this.game.height;

        // Load in music which should have been preloaded.
        var musd:Object = this.game.cache.getJSON("music");
        this.music = new Music(musd);

        var dType:string = MainApplication.getURLName("type","horizontal").toLowerCase();

        // Create render manager
        if (dType == "horizontal") {
            this.manager = new HorizontalManager(this.game,this.music,
                                                        this.game.width,this.game.height*0.45);
        } else {
            if  (dType == "stab") {
                this.manager = new ScrollingTabManager(this.game,this.music,
                                                              this.game.width-40,this.game.height*0.8);
                this.manager.x = 20;                                                                                                                            
            } else {
                this.manager = new StaticTabManager(this.game,this.music,
                                                              this.game.width-40,this.game.height*0.8);                
                this.manager.x = 20;                                                                                                                            
            }
        }

        // Create music player                                                                      
        this.player = MusicClassFactory.createMusicPlayer(this.game,this.music);

        // Create control panel.
        this.panel = new ControlPanel(this.game,this.manager,this.player,false);

        // Scale control panel and player (LED display)
        this.panel.scale.x = this.panel.scale.y = this.game.height / 10 / this.panel.height;
        this.panel.x = this.panel.y = 10;

        this.player.height = this.panel.height;this.player.width = this.panel.height * 2;
        this.player.x = this.game.width-15-this.player.width / 2;
        this.player.y = this.panel.y+this.panel.height/2;

        // Position manager
        if (dType == "horizontal") {
            this.manager.x = 0;this.manager.y = this.game.height - this.manager.height - 20;
        } else {
            this.manager.y = this.panel.bottom + 20;
        }

        // Update display position as player plays.
        this.player.onPositionUpdate.add((obj:any,bar:number,millibeats:number) => {
            this.manager.moveCursor(bar,millibeats);
        },this);

        // Clicking on a clickable manager (the tabs) repositions the cursor.
        this.manager.onSelect.add((obj:any,bar:number,millibeats:number,note:number) => {
            this.player.moveTo(bar,note);
        },this);

    }

    destroy() : void {
        this.music = null;
        this.player = null;
        this.panel = null;
        this.music = null;
    }

    update() : void {
    }
}    
