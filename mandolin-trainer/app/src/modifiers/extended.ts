/// <reference path="../../lib/phaser.comments.d.ts"/>
/// <reference path="../library/data/bar.ts"/>

/**
 * Information used to set up Phaser etc., all static
 * 
 * @class SetupPhaserInformation
 */
class SetupPhaserInformation {
    static WIDTH:number = 1440;
    static HEIGHT:number = 900;
}

/**
 * Personal application class
 * 
 * @class MyApplication
 * @extends {MainApplication}
 */
class MyApplication extends MainApplication {

    /**
     * Returns an instance of the main game state.
     * 
     * @returns {Phaser.State} 
     * 
     * @memberOf MyApplication
     */
    getMainState() : Phaser.State {
        return new GameState();
    }

    /**
     * Allows addition of extra states if required.
     * 
     * @memberOf MyApplication
     */
    addExtraStates() : void {
    }
}

/**
 * Allows tweaking of boot state where needed
 * 
 * @class MyBootState
 * @extends {BootState}
 */
class MyBootState extends BootState {

    /**
     * Allows early preloading of objects so they can be accessed in the preloader.
     * 
     * @memberOf MyBootState
     */
    preloadInBootState(musicName:string) : void {
         this.game.load.json("music",musicName);
    }
   
}

/**
 * State for modifying the main preloader.
 * 
 * @class MyPreloadState
 * @extends {PreloadState}
 */
class MyPreloadState extends PreloadState {
    /**
     * Number of notes counted 1.ogg to <n>.ogg
     * 
     * @returns {number} 
     * 
     * @memberOf MyPreloadState
     */
    getNoteCount():number { 
       return 31; 
    }
    /**
     * Get directory to use for notes
     * 
     * @returns {string} 
     * 
     * @memberOf MyPreloadState
     */
    getNoteDirectory():string { 
        return "assets/sounds"; 
    }    
    /**
     * Get list of fonts to load
     * 
     * @returns {string[]} 
     * 
     * @memberOf MyPreloadState
     */
    getFontList() : string[] {
        return [ "font","7seg" ];
    }
    /**
     * Get list of other audio items to load
     * 
     * @returns {string[]} 
     * 
     * @memberOf MyPreloadState
     */
    getAudioList(): string[] {
        return [ ];
    }

    /**
     * Load anything else
     * 
     * @memberOf MyPreloadState
     */
    loadOtherResources(musicName:string): void {

    }
}

/**
 * Allows loading of bar/note data to be customised.
 * 
 * @class MyBar
 * @extends {Bar}
 */
class MyBar extends Bar {

    /**
     * Loader for the JSON file for mandarin data.
     * 
     * @param {string} defn 
     * 
     * @memberOf MyBar
     */
    public load(defn:string) : void {
        var p:number = 0;
        var qbPos:number = 0;
        // Work through whole line.
        while (p < defn.length) {
            // Get next character
            var cc:number = defn.charCodeAt(p);
            // 0-9 advance by that many quarter-beats
            if (cc >= 48 && cc <= 57) {
                qbPos += (cc - 48);
                p = p + 1;
            } else {
                // - or A-Z fretting offset so read in for each string to create new note.
                var note:Note = new Note();  
                for (var s:number = 0;s < this.music.voices;s++) {
                    note.chromaticOffset[s] = defn.charCodeAt(p) - 65;
                    if (defn.charAt(p) == '-') { 
                        note.chromaticOffset[s] = Note.QUIET; 
                    }
                    p = p + 1;
                }
                // Set the QB position. 
                note.quarterBeatPos = qbPos;
                // Add to the note list
                this.note[this.count] = note;
                this.count++;
            }
        }
        // This can be used if you just set up quarterBeatPos - it calculates mbLength
        // and mbTime values in the note structure.
        this.updateMillibeatData();
    }
}


class MyPlayer extends MusicPlayer {
    fretToNote(str:number,fret:number) {
        return fret + (3-str)*7+1;
    }

    getStringVolume(str:number) {
        return 100;
    }
}

