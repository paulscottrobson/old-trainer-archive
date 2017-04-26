/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 * First preloader. We have already loaded the music ; this loads the instrument 
 * JSON file that that music needs. It has to be done seperately because the main 
 * preloader needs to know which sounds to read in.
 * 
 * @class InstrumentPreloadState
 * @extends {Phaser.State}
 */
class InstrumentPreloadState extends Phaser.State {

    preload(): void {
        var musicInfo:any = this.game.cache.getJSON("music");
        // Load the instrument data.
        this.game.load.json("instrument","assets/instruments/"+musicInfo["type"]+".json");
        // Go to next state when completed.
        this.game.load.onLoadComplete.add(() => { this.game.state.start("Preload",true,false,1); },this);
    }
}

/**
 *  Preloads all resources except those loaded in Boot for use in the preloader.
 * 
 * @class PreloadState
 * @extends {Phaser.State}
 */
class PreloadState extends Phaser.State {

    public static NOTE_COUNT:number = 48;

    /**
     * Preloader. Loads sprite atlas, font, and the instrument notes.
     * 
     * @memberOf PreloadState
     */
    preload(): void {
        // Create the loading sprite
        this.game.stage.backgroundColor = "#000000";
        var loader:Phaser.Sprite = this.add.sprite(this.game.width/2,
                                                   this.game.height/2,
                                                   "loader");
        loader.width = this.game.width * 9 / 10;
        loader.height = this.game.height / 8;        
        loader.anchor.setTo(0.5);
        this.game.load.setPreloadSprite(loader);
        // Get the music        
        var musicInfo:any = this.game.cache.getJSON("music");
        // Get the instrument
        var instrumentInfo:any = this.game.cache.getJSON("instrument");
        var soundSet:string = instrumentInfo["soundset"];
        console.log(soundSet);
        // Notes to load.
        PreloadState.NOTE_COUNT = 48;
        // Load the sprite atlas.
        this.game.load.atlas("sprites","assets/sprites/sprites.png","assets/sprites/sprites.json");
        // Load the fonts
        this.game.load.bitmapFont("font","assets/fonts/font.png","assets/fonts/font.fnt");
        this.game.load.bitmapFont("7seg","assets/fonts/7seg.png","assets/fonts/7seg.fnt");
        // Load instrument notes - hopefully cached after first time.
        for (var i:number = 1;i <= PreloadState.NOTE_COUNT;i++) {
            var sound:string = soundSet+"/"+(i.toString());
            this.game.load.audio(i.toString(),["assets/sounds/"+sound+".mp3","assets/sounds/"+sound+".ogg"]);
        }
        // Load metronome tick.
        this.game.load.audio("metronome",["assets/sounds/metronome.mp3","assets/sounds/metronome.ogg"]);
        // Switch to game state when load complete.        
        this.game.load.onLoadComplete.add(() => { this.game.state.start("Main",true,false,1); },this);
    }
}
