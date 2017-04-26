/// <reference path="../../lib/phaser.comments.d.ts"/>

enum InstrumentType {
    DULCIMER
};

interface IInstrument {
    
    /**
     * Get the tuning of this instrument as three string values.
     * 
     * @returns {string[]} 
     * 
     * @memberOf IInstrument
     */
    getTuning(): string[];
    /**
     * Get the number of voices, for a Dulcimer this is three. 0 is the bass-most
     * string.
     * 
     * @returns {number} 
     * 
     * @memberOf IInstrument
     */
    getVoices(): number;
    /**
     * Get the volume of each voice, organised as for getTuning e.g. the bass-most 
     * string is zero.
     * 
     * @param {number} str 
     * @returns {number} 0-1 for string volume.
     * 
     * @memberOf IInstrument
     */
    getVolume(str:number): number;

    /**
     * Return enumerated type of instrument.
     * 
     * @returns {InstrumentType} 
     * 
     * @memberOf IInstrument
     */
    getType(): InstrumentType;
    
    /**
     * Get the name of a given chromatic fret offset.
     * 
     * @param {number} fret 
     * @returns {string} 
     * 
     * @memberOf IInstrument
     */
    getFretNameFromChromatic(fret:number) : string;

}
