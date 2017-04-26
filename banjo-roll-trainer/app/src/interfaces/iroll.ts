/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Represents a single roll in a bar.
 * 
 * @interface IRoll
 */
interface IRoll {
    /**
     * Returns number of beats in the bar. There are normally twice as many notes.
     * 
     * @returns {number} 
     * 
     * @memberOf ibar
     */
    getBeats():number;

    /**
     * Get an array of plucks that are played on the given half beats.
     * 
     * @param {number} halfBeat 
     * @returns {Pluck[]} array of Pluck objects
     * 
     * @memberOf IBar
     */
    getPlucks(halfBeat:number): Pluck[];
}

//
//  Test Rolls
//
class TestBasicForwardRoll implements IRoll {

    private static plucks:Pluck[][] = [
        [ new Pluck(1,Finger.INDEX) ],
        [ new Pluck(0,Finger.MIDDLE) ],
        [ new Pluck(4,Finger.THUMB) ],
        [ new Pluck(1,Finger.INDEX) ],
        [ new Pluck(0,Finger.MIDDLE) ],
        [ new Pluck(4,Finger.THUMB) ],
        [ new Pluck(1,Finger.INDEX) ],
        [ new Pluck(0,Finger.MIDDLE) ]
    ];

    getBeats():number { 
        return 4; 
    }

    getPlucks(halfBeat:number) {
        return TestBasicForwardRoll.plucks[halfBeat];
    }
}

class TestFoggyMountainRoll implements IRoll {

    private static plucks:Pluck[][] = [
        [ new Pluck(1,Finger.THUMB) ],
        [ new Pluck(0,Finger.MIDDLE) ],
        [ new Pluck(1,Finger.INDEX) ],
        [ new Pluck(0,Finger.MIDDLE) ],
        [ new Pluck(4,Finger.THUMB) ],
        [ new Pluck(1,Finger.INDEX) ],
        [ new Pluck(0,Finger.MIDDLE) ],
        [ new Pluck(4,Finger.THUMB) ]
    ];

    getBeats():number { 
        return 4; 
    }

    getPlucks(halfBeat:number) {
        return TestFoggyMountainRoll.plucks[halfBeat];
    }
}