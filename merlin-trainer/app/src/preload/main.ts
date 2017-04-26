/// <reference path="../../lib/phaser.comments.d.ts"/>

window.onload = function() {
    var game = new SeagullMerlinApplication();
}

/**
 * Main Application class
 * 
 * @class SeagullMerlinApplication
 * @extends {Phaser.Game}
 */
class SeagullMerlinApplication extends Phaser.Game {

    constructor() {
        // Call the super constructor.
        super(1440,900,Phaser.AUTO,"",null,false,false);
        // Create a new state and switch to it.
        this.state.add("Boot", new BootState());
        this.state.add("Preload", new PreloadState());
        this.state.add("Main",new MainState());
        this.state.start("Boot");
    }

    /**
     * Extract a key from the query string, return default value if ""
     * 
     * @static
     * @param {string} key 
     * @param {string} [defaultValue=""] 
     * @returns {string} 
     * 
     * @memberOf SeagullMerlinApplication
     */
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
        this.game.load.onLoadComplete.add(() => { this.game.state.start("Preload",true,false,1); },this);
    }

    create() : void {        
        // Make the game window fit the display area. Doesn't work in the Game constructor.
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;        
    }
}
