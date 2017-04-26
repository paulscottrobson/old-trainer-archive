/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Uses the JSON type to identify what instrument is in use.
 * 
 * @class InstrumentFactory
 */
class InstrumentFactory {
    /**
     * Given an instrument name, return a class describing it.
     * 
     * @static
     * @param {string} name name of instrument
     * @returns {BaseInstrument} subclass of BaseInstrument describes it
     * 
     * @memberOf InstrumentFactory
     */
    public static get(name:string):BaseInstrument {
        // Basically a giant case statement.
        if (name === "DULCIMERDAA") { return new DulcimerDAA(); }
        if (name === "OCARINACSOP") { return new OcarinaCSoprano(); }
        if (name === "MANDOLIN") { return new Mandolin(); }
        // Don't recognise it.
        console.log("Unknown instrument type ",name);
        return null;
    }
}