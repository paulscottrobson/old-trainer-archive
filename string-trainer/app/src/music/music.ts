/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Interface to a single piece of music.
 * 
 * @class Music
 * @implements {IMusic}
 */
class Music implements IMusic {

    private bar:IBar[];
    private musObj:any;

    constructor(musObj:any,instrument:IInstrument) {
        // Save standard values
        this.musObj = musObj;
        this.bar = [];
        // Add each bar as appropriate.
        for (var barSrc of this.musObj.bars) {
            var b:Bar = new Bar(this.bar.length,
                                instrument.getVoices(),
                                this.getStandardBeats(),
                                barSrc);
            this.bar.push(b);
        }
    }

    getTempo(): number {
        return parseInt(this.musObj.tempo || "100",10)
    }
    getStandardBeats(): number {
        return parseInt(this.musObj.beats || "4",10)
    }
    getBarCount(): number {
        return this.bar.length;
    }
    getBar(barNumber: number): IBar {
        return this.bar[barNumber];
    }
    getInformation(info: InformationType): string {
        throw new Error('Method not implemented.');
    }
}

