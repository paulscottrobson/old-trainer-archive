/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Interface to a controllable music player object
 * 
 * @interface IPlayer
 * @extends {Phaser.Group}
 */
interface IPlayer extends Phaser.Group {
    /**
     * Move to given position in tune. If past end of tune starts at the beginning
     * 
     * @param {number} bar 
     * @param {number} mbPosition 
     * 
     * @memberOf IPlayer
     */
    moveTo(bar:number,mbPosition:number):void;
    /**
     * Reset the tempo to the default speed
     * 
     * 
     * @memberOf IPlayer
     */
    resetTempo():void;
    /**
     * Adjust the tempo by the given rate in beats/minute.
     * 
     * @param {number} adjust 
     * 
     * @memberOf IPlayer
     */
    adjustTempo(adjust:number):void;
    /**
     * Set pause on/off
     * 
     * @param {boolean} isOn 
     * 
     * @memberOf IPlayer
     */
    setPause(isOn:boolean):void;
    /**
     * Set metronome tick on/off
     * 
     * @param {boolean} isOn 
     * 
     * @memberOf IPlayer
     */
    setMetronome(isOn:boolean):void;
    /**
     * Set instrument sound on/off
     * 
     * @param {boolean} isOn 
     * 
     * @memberOf IPlayer
     */
    setInstrument(isOn:boolean):void;
    /**
     * Signal dispatched every time the clock is updated. Parameters are IPlayer reference
     * current barNumber, current millibeat position. Not sent when player is paused.
     * 
     * @type {Phaser.Signal}
     * @memberOf IPlayer
     */
    onPositionUpdate:Phaser.Signal;
}