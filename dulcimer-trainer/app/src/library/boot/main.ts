/// <reference path="../../../lib/phaser.comments.d.ts"/>

window.onload = function() {
    var game = MusicClassFactory.createApplication();
}

/**
 * Game Class
 * @class MainApplication
 * @extends {Phaser.Game}
 */
abstract class MainApplication extends Phaser.Game {

    constructor() {
        // Call the super constructor.
        super(SetupPhaserInformation.WIDTH,SetupPhaserInformation.HEIGHT,
                                                Phaser.AUTO,"",null,false,false);
        // Create a new state and switch to it.
        this.state.add("Boot", MusicClassFactory.createBootState());
        this.state.add("Preload", MusicClassFactory.createPreloadState());
        this.addExtraStates();
        this.state.add("Main",this.getMainState());
        this.state.start("Boot");
    }

    abstract getMainState(): Phaser.State;
    abstract addExtraStates(): void;

    static getURLName(key:string,defaultValue:string = "") : string {
        var name:string = decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key.toLowerCase()).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        return (name == "") ? defaultValue:name;
    }
}

/**
 * Boot state. Preloads loader image, sets up display.
 */
class BootState extends Phaser.State {
    preload() : void {
        this.game.load.image("loader","assets/sprites/loader.png");
        this.preloadInBootState(MainApplication.getURLName("music","music.json"));
        this.game.load.onLoadComplete.add(() => { this.game.state.start("Preload",true,false,1); },this);
    }

    preloadInBootState(musicName:string) : void {}

    create() : void {        
        // Make the game window fit the display area. Doesn't work in the Game constructor.
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;        
        //this.game.state.start("Preload",true,false,1);
    }
}
