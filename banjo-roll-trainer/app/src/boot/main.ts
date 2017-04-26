/// <reference path="../../lib/phaser.comments.d.ts"/>

window.onload = function() {
    var game = new MainApplication();
}

/**
 * Game Class
 * @class MainApplication
 * @extends {Phaser.Game}
 */
class MainApplication extends Phaser.Game {

    constructor() {
        // Call the super constructor.
        super(1024,768,Phaser.AUTO,"",null,false,false);
        // Create a new state and switch to it.
        this.state.add("Boot", new BootState());
        this.state.add("Preload", new PreloadState());
        this.state.add("Main",new GameState());
        this.state.start("Boot");
    }

    // var name:string = decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent("music").replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    
}

/**
 * Boot state. Preloads loader image, sets up display.
 */
class BootState extends Phaser.State {
    preload() : void {
        this.game.load.image("loader","assets/sprites/loader.png");
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
