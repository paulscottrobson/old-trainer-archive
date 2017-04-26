/// <reference path="../../lib/phaser.comments.d.ts"/>
/// <reference path="../library/data/bar.ts"/>

/**
 * Each of these static methods creates an instance of a class which has been extended
 * (usually) where required.
 * 
 * @class MusicClassFactory
 */

class MusicClassFactory {
    static createBar(music:Music,barNumber:number,beats:number) : Bar {
        return new MyBar(music,barNumber,beats);
    }
    static createApplication() : MainApplication {
        return new MyApplication();
    }
    static createBootState() : BootState {
        return new MyBootState();
    }
    static createPreloadState() : PreloadState {
        return new MyPreloadState();
    }
    static createMusicPlayer(game:Phaser.Game,music:Music,firstNote:number = 1,
                             lastNote:number = PreloadState.NOTE_COUNT) : MusicPlayer {
        return new MyPlayer(game,music,firstNote,lastNote);
    }
}
