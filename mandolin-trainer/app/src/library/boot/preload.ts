/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 *  Preloads all resources except those loaded in Boot for use in the preloader.
 * 
 * @class PreloadState
 * @extends {Phaser.State}
 */
abstract class PreloadState extends Phaser.State {

    public static NOTE_COUNT:number ;

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
        // Get objects to load
        PreloadState.NOTE_COUNT = this.getNoteCount();
        // Load the sprite atlas.
        this.game.load.atlas("sprites","assets/sprites/sprites.png",
                                       "assets/sprites/sprites.json");
        // Load the fonts
        for (var fontName of this.getFontList()) {
            this.game.load.bitmapFont(fontName,"assets/fonts/"+fontName+".png",
                                               "assets/fonts/"+fontName+".fnt");
        }
        // Load instrument notes - hopefully cached after first time.
        var noteDir:string = this.getNoteDirectory();
        for (var i:number = 1;i <= PreloadState.NOTE_COUNT;i++) {
            var sound:string = i.toString();
            this.game.load.audio(sound,[noteDir+"/"+sound+".mp3",noteDir+"/"+sound+".ogg"]);
        }
        // Load metronome sounds
        this.game.load.audio("metronome",["assets/sounds/metronome.mp3",
                                          "assets/sounds/metronome.ogg"]);
        // Load other audio 
        for (var audioName of this.getAudioList()) {
            this.game.load.audio(audioName,["assets/sounds/"+audioName+".mp3",
                                            "assets/sounds/"+audioName+".ogg"]);
        }
        // Load anything else
        this.loadOtherResources(MainApplication.getURLName("music","music.json"));
        // Switch to game state when load complete.        
        this.game.load.onLoadComplete.add(() => { this.game.state.start("Main",true,false,1); },this);
    }

    abstract getNoteCount(): number ;
    abstract getNoteDirectory(): string;
    abstract getFontList(): string[];
    abstract getAudioList(): string[];
    abstract loadOtherResources(musicName:string): void;
}
