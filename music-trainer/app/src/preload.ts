/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 *  Preloads all resources except those loaded in Boot for use in the preloader.
 * 
 * @class PreloadState
 * @extends {Phaser.State}
 */
class PreloadState extends Phaser.State {

    public static NOTE_COUNT:number;

    /**
     * Preloader. Loads sprite atlas, font, and the instrument notes.
     * 
     * @memberOf PreloadState
     */
    preload(): void {
        // Get information on music.
        var name:string = this.cache.getJSON("music")["type"];
        var instr:BaseInstrument = InstrumentFactory.get(name);

        // Create the loading sprite
        this.game.stage.backgroundColor = "#000000";
        var loader:Phaser.Sprite = this.add.sprite(this.game.width/2,
                                                   this.game.height/2,
                                                   "loader");
        loader.width = this.game.width * 9 / 10;
        loader.height = this.game.height / 8;        
        loader.anchor.setTo(0.5);
        this.game.load.setPreloadSprite(loader);

        // Load the sprite atlas.
        this.game.load.atlas("sprites","assets/sprites/sprites.png","assets/sprites/sprites.json");
        // Load the font we use throughout (probably)
        this.game.load.bitmapFont("font","assets/fonts/font.png","assets/fonts/font.fnt");

        // Get directory to use.
        var sndDir:string = (instr.getSoundSet() == SOUND_SET.STRUM ? 
                             "dulcimer":"ocarina");

        // Work out Note Count 
        PreloadState.NOTE_COUNT = instr.getSoundSetSize();

        // Load in sounds from correct directory.
        for (var i:number = 1;i <= PreloadState.NOTE_COUNT;i++) {
            var sound:string = i.toString();
            this.game.load.audio(sound,["assets/sounds/"+sndDir+"/"+sound+".mp3","assets/sounds/"+sndDir+"/"+sound+".ogg");
        }

        // Load OcPix if Ocarina of any sort
        if (name.indexOf("OCARINA") >= 0) {
            this.game.load.spritesheet("notes","assets/sprites/notes.png",200,201,21);
            this.game.load.atlas("4-hole-atlas","assets/sprites/ocarina/4-hole-atlas.png","assets/sprites/ocarina/4-hole-atlas.json");
            this.game.load.atlas("6-hole-atlas","assets/sprites/ocarina/6-hole-atlas.png","assets/sprites/ocarina/6-hole-atlas.json");        
        }

        // Switch to game state when load complete.        
        this.game.load.onLoadComplete.add(() => { this.game.state.start("Main",true,false,1); },this);
    }
}
