/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * The sound sets. Encoded in this (lower 3 digits) is the
 * number of sounds in that set.
 * 
 * @enum {number}
 */
enum SOUND_SET {
    STRUM = 10048,                               // Guitar, Dulcimer etc.
    WOODWIND = 11042                             // Ocarina etc.    
};

/**
 * Base Abstract class, Chromatic
 * 
 * @abstract
 * @class BaseInstrument
 */
abstract class BaseInstrument {
    abstract getVoices():number;
    abstract getTuning():number[];
    abstract getVolume():number[];
    abstract getSoundSet():SOUND_SET;
    isDoubleString(str:number):boolean { return false; }
    getDisplayedFretForChromatic(fret:number):string { return fret.toString(); }
    isDiatonic():boolean { return false; }  
    getSoundSetSize(): number { return this.getSoundSet() % 1000; }  
}

/**
 * Base Abstract class, Diatonic.
 * 
 * @abstract
 * @class DiatonicInstrument
 * @extends {BaseInstrument}
 */
abstract class DiatonicInstrument extends BaseInstrument {

    private static DIATONIC_MAPPING:number[] = [
        0,0.5,1,1.5,2,3,3.5,4,4.5,5,6,6.5
    ];

    isDiatonic():boolean { return true; }   

    getDisplayedFretForChromatic(fret:number):string {
        // Calculation for octave
        var diatonic:number = Math.floor(fret/12) * 7;
        // Calculation for chromatic 
        diatonic += DiatonicInstrument.DIATONIC_MAPPING[fret % 12];
        // Work out name of base fret
        var s:string = Math.floor(diatonic).toString();
        // If .5 then add a '+'
        if (Math.floor(diatonic) != diatonic) {
            s = s + "+";
        }
        return s;
    } 
}

/**
 * A DAA tuned Dulcimer
 * 
 * @class DulcimerDAA
 * @extends {DiatonicInstrument}
 */
class DulcimerDAA extends DiatonicInstrument {
    getVoices(): number { return 3; }
    getTuning(): number[] { return [3,10,10]; }
    getVolume(): number[] { return [50,50,100]; }
    getSoundSet(): SOUND_SET { return SOUND_SET.STRUM; }
    isDoubleString(str:number):boolean { return (str == 2); }
}

/**
 * A Soprana Ocarina, Key C
 * 
 * @class OcarinaCSoprano
 * @extends {BaseInstrument}
 */
class OcarinaCSoprano extends BaseInstrument {
    getVoices(): number { return 1; }
    getTuning(): number[] { return [13]; }
    getVolume(): number[] { return [100]; }    
    getSoundSet(): SOUND_SET { return SOUND_SET.WOODWIND; }
}


/**
 * A standard GDAE Mandolin
 * 
 * @class Mandolin
 * @extends {BaseInstrument}
 */
class Mandolin extends BaseInstrument {
    getVoices():number { return 4; }
    getTuning():number[] { return [8,15,22,29]; }
    getVolume():number[] { return [100,100,100,100]; }
    getSoundSet():SOUND_SET { return SOUND_SET.STRUM; }
}