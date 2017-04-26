/// <reference path="../../lib/phaser.comments.d.ts"/>

class DisplayManager extends Phaser.Group implements IManager {

    protected drawWidth:number;
    protected drawHeight:number;
    private music:IMusic;
    private instrument:IInstrument;
    private static DEBUG:boolean = false;
    /**
     * You cannot select, this is a requirement of the Interface.
     * 
     * @type {Phaser.Signal}
     * @memberOf DisplayManager
     */
    public  onSelect:Phaser.Signal;
    private sphere:Phaser.Image;
    private renderer:IRenderer[];
    private barWidth:number;

    /**
     * Creates an instance of DisplayManager. Note that it will appear outside
     * width and height without further clipping.
     * 
     * @param {Phaser.Game} game 
     * @param {IMusic} music 
     * @param {number} [width=null] 
     * @param {number} [height=null] 
     * 
     * @memberOf DisplayManager
     */
    constructor(game:Phaser.Game,music:IMusic,instrument:IInstrument,
                                    width:number = null,height:number = null) {
        super(game);
        // Defaults to game space
        this.drawWidth = width || game.width;
        this.drawHeight = height || game.height;
        this.music = music;
        this.instrument = instrument;
        this.onSelect = new Phaser.Signal();
        // Create sphere
        this.sphere = game.add.image(0,0,"sprites","sphere_red",this);
        this.sphere.anchor.setTo(0.5,1);
        this.sphere.height = this.sphere.width = this.drawHeight / 8;
        this.barWidth = this.drawWidth/2.2;
        // Create renderers for each bar.
        this.renderer = [];
        for (var n = 0;n < this.music.getBarCount();n++) {
            var rnd:HorizontalScrollRenderer = new HorizontalScrollRenderer(game,
                                                                            music.getBar(n),
                                                                            music,
                                                                            instrument,
                                                                            this.barWidth,
                                                                            this.drawHeight);
            this.add(rnd);
            rnd.visible = false;
            this.renderer[n] = rnd;
        }
        // Empty bar before the start and after
        for (var p:number = 1;p <= 4;p++) {
            this.renderer[-p] = new HorizontalScrollRenderer(game,null,music,instrument,
                                                             this.barWidth,this.drawHeight);
            this.add(this.renderer[-p]);                                                            
        }
        this.sphere.bringToTop();
        // Back to the start
        this.moveCursor(0,0);
    }

    getHeight(): number {
        return this.drawHeight;
    }

    destroy() : void {
        super.destroy();
        this.music = null;
        this.onSelect = null;
        this.sphere = null;
        this.instrument = null;
    }

    moveCursor(bar:number,millibeat:number) : void {        
        millibeat = Math.round(millibeat);
        for (var n = -4;n < this.music.getBarCount();n++) {
            var n1:number = n;
            if (n < -1) {
                n1 = -n - 2 + this.music.getBarCount();
            }
            var x:number = this.drawWidth * 0.2 + (n1 - bar - millibeat / 1000) * this.barWidth;
            this.renderer[n].x = Math.round(x);
            this.renderer[n].y = 0;
            var isVisible:boolean = true;
            if (x + this.barWidth < 0) { isVisible = false; }
            if (x > this.drawWidth) { isVisible = false; }
            this.renderer[n].visible = isVisible;
        }
        this.renderer[bar].positionSphere(this.sphere,millibeat);
    }
}

