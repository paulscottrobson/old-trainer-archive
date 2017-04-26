/// <reference path="../../lib/phaser.comments.d.ts"/>

abstract class BaseInstrument implements IInstrument {

    private tuning:string[];

    constructor(musObj:any) {
        // Convert tuning to an array
        this.tuning = musObj.tuning.toUpperCase().split(",");
    }

    getTuning(): string[] {
        return this.tuning;
    }
    getVoices(): number {
        return this.tuning.length;
    }
    getVolume(str: number): number {
        return 1;
    }
    getFretNameFromChromatic(fret:number) : string {
        return fret.toString();
    }
    abstract getType(): InstrumentType;
}

class MountainDulcimer extends BaseInstrument implements IInstrument {

    private static NAMES:number[] = [
         0,  0.5, 1,  1.5, 2,  3,  3.5, 4,  4.5, 5,  6,  6.5
    //   D   D#   E   F    F#  G   G#   A   A#   B   C   C#
    ];

    getFretNameFromChromatic(fret:number):string {
        var n:number = MountainDulcimer.NAMES[fret % 12];
        var s:string = (Math.floor(n)+Math.floor(fret/12) * 7).toString();
        if (n != Math.floor(n)) { s = s + "+"; }
        return s;
    }
    getType() : InstrumentType {
        return InstrumentType.DULCIMER;
    }
}