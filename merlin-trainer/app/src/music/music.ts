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
    private tuning:string[];

    constructor(musObj:any) {
        // Save standard values
        this.musObj = musObj;
        this.bar = [];
        // Convert tuning to an array
        this.tuning = this.musObj.tuning.toUpperCase().split(",");
        // Add each bar as appropriate.
        for (var barSrc of this.musObj.bars) {
            var b:Bar = new Bar(this.bar.length,
                                this.getVoices(),
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
    getTuning(): string[] {
        return this.tuning;    
    }
    getBarCount(): number {
        return this.bar.length;
    }
    getBar(barNumber: number): IBar {
        return this.bar[barNumber];
    }
    getVoices(): number {
        return parseInt(this.musObj.voices || "3",10)        
    }
    getVolume(str: number): number {
        return 1;
    }
    getInformation(info: InformationType): string {
        throw new Error('Method not implemented.');
    }
}

