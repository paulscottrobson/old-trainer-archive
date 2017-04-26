/// <reference path="../../lib/phaser.comments.d.ts"/>

class Instrument {

    private info:object;

    constructor(json:object) {
        this.info = json;
    }

    /**
     * Get number of voices
     * 
     * @returns {number} 
     * 
     * @memberOf Instrument
     */
    getVoices():number { 

        return this.info["voices"];
    };

    /**
     * Get top-bottom tuning
     * 
     * @returns {number[]} 
     * 
     * @memberOf Instrument
     */
    getTuning():number[] { 
        //return [3,10,10];
        return this.info["tuning"];
    }

    /**
     * Get volume top-bottom 0-1
     * 
     * @returns {number[]} 
     * 
     * @memberOf Instrument
     */
    getVolume():number[] { 
        return this.info["volume"];
    }

    /**
     * Check if double string
     * 
     * @param {number} str 
     * @returns {boolean} 
     * 
     * @memberOf Instrument
     */
    isDoubleString(str:number):boolean { 
        return this.info["visualtype"][str] == 2;
    }

    /**
     * Check if diatonic
     * 
     * @returns {boolean} 
     * 
     * @memberOf Instrument
     */
    isDiatonic():boolean { 
        return !this.info["chromatic"];
    }

    /**
     * Map chromatic offset to diatonic fretting
     * 
     * @private
     * @static
     * @type {number[]}
     * @memberOf Instrument
     */
    private static DIATONIC_MAPPING:number[] = [
        0,0.5,1,1.5,2,3,3.5,4,4.5,5,6,6.5
    ];

    /**
     * Get text name of fret.
     * 
     * @param {number} fret 
     * @returns {string} 
     * 
     * @memberOf Instrument
     */
    getDisplayedFretForChromatic(fret:number):string {
        if (!this.isDiatonic()) {
            return fret.toString();
        }
        // Calculation for octave
        var diatonic:number = Math.floor(fret/12) * 7;
        // Calculation for chromatic 
        diatonic += Instrument.DIATONIC_MAPPING[fret % 12];
        // Work out name of base fret
        var s:string = Math.floor(diatonic).toString();
        // If .5 then add a '+'
        if (Math.floor(diatonic) != diatonic) {
            s = s + "+";
        }
        return s;
    } 
}

