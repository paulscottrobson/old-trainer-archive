var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MusicDisplayManager = (function (_super) {
    __extends(MusicDisplayManager, _super);
    function MusicDisplayManager(game, music, width, viewportHeight) {
        var _this = _super.call(this, game) || this;
        _this.music = music;
        _this.xWidth = width;
        _this.viewportHeight = viewportHeight;
        _this.yScroll = 0;
        _this.vMargin = 16;
        _this.background = _this.game.add.image(0, -_this.vMargin, "sprites", "rectangle", _this);
        _this.background.width = width;
        _this.background.height = viewportHeight + _this.vMargin * 2;
        _this.background.anchor.setTo(0, 0);
        _this.background.events.onInputDown.add(_this.clickHandler, _this);
        _this.background.inputEnabled = true;
        _this.cursorImg = _this.game.add.image(0, 0, "sprites", "cursor", _this);
        _this.createBarRenders();
        _this.moveCursor(0, 0);
        _this.reformat();
        _this.scrollToBar = 0;
        _this.onClick = new Phaser.Signal();
        return _this;
    }
    MusicDisplayManager.prototype.update = function () {
        var height = this.renderer[this.scrollToBar].getHeight();
        var reqdScroll = this.renderer[this.scrollToBar].y + this.yScroll;
        reqdScroll -= this.viewportHeight / 2 - height / 2;
        reqdScroll = Math.min(reqdScroll, this.yHeight - 3 * this.renderer[this.scrollToBar].getHeight());
        reqdScroll = Math.max(0, reqdScroll);
        if (reqdScroll != this.yScroll) {
            var dir = (reqdScroll > this.yScroll) ? 1 : -1;
            var step = 1000 * this.game.time.elapsed / 1000;
            this.yScroll += dir * Math.min(step, Math.abs(this.yScroll - reqdScroll));
            this.reformat();
        }
    };
    MusicDisplayManager.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.renderer = this.music = this.background = this.cursor = null;
        this.onClick = null;
    };
    MusicDisplayManager.prototype.clickHandler = function (object, pointer) {
        var x = pointer.x - this.x;
        var y = pointer.y - this.y;
        for (var n = 0; n < this.music.count; n++) {
            var br = this.renderer[n];
            if (x > br.x && y > br.y) {
                if (x < br.x + br.getWidth() && y < br.y + br.getHeight()) {
                    var nn = br.xPosToNote(x - br.x);
                    if (nn >= 0) {
                        this.onClick.dispatch(n, nn);
                    }
                }
            }
        }
    };
    MusicDisplayManager.prototype.createBarRenders = function () {
        this.renderer = [];
        for (var n = 0; n < this.music.count; n++) {
            this.renderer[n] = new BarRenderer(this.game, this.music.bar[n]);
            this.add(this.renderer[n]);
        }
    };
    MusicDisplayManager.prototype.scrollToView = function (barNumber) {
        this.scrollToBar = barNumber;
    };
    MusicDisplayManager.prototype.toHome = function () { this.scrollToView(0); };
    MusicDisplayManager.prototype.toEnd = function () { this.scrollToView(this.music.count - 1); };
    MusicDisplayManager.prototype.moveCursor = function (barNumber, noteNumber) {
        barNumber = Math.max(0, Math.min(barNumber, this.music.count - 1));
        if (noteNumber < 0 || noteNumber >= this.music.bar[barNumber].count) {
            console.log("Bad note number ?");
        }
        this.barCursor = barNumber;
        this.noteCursor = noteNumber;
        this.updateCursorPosition();
    };
    MusicDisplayManager.prototype.updateCursorPosition = function () {
        this.renderer[this.barCursor].positionCursor(this.noteCursor, this.cursorImg);
        this.cursorImg.visible = this.renderer[this.barCursor].visible;
    };
    MusicDisplayManager.prototype.reformat = function () {
        var hMargin = 16;
        var x = hMargin;
        var y = -Math.round(this.yScroll);
        this.yHeight = this.renderer[0].getHeight();
        for (var n = 0; n < this.music.count; n++) {
            if (x + this.renderer[n].getWidth() > this.xWidth - hMargin) {
                x = hMargin;
                y = y + this.renderer[n].getHeight();
                this.yHeight += this.renderer[n].getHeight();
            }
            this.renderer[n].position.setTo(x, y);
            this.renderer[n].visible = true;
            if (y + this.renderer[n].getHeight() > this.viewportHeight || y < 0) {
                this.renderer[n].visible = false;
            }
            x = x + this.renderer[n].getWidth();
        }
        this.updateCursorPosition();
    };
    return MusicDisplayManager;
}(Phaser.Group));
var GameState = (function (_super) {
    __extends(GameState, _super);
    function GameState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameState.prototype.create = function () {
        var _this = this;
        var bgr = this.game.add.image(0, 0, "sprites", "background");
        bgr.width = this.game.width;
        bgr.height = this.game.height;
        this.music = new Music();
        this.music.load(this.game.cache.getJSON("music"));
        console.log(this.music);
        this.dm = new MusicDisplayManager(this.game, this.music, this.game.width, this.game.height * 0.7);
        this.dm.x = 0;
        this.dm.y = 20;
        var s = this.game.add.audio("metronome");
        this.dm.onClick.add(function (bar, note) {
            console.log(bar, note);
            _this.dm.moveCursor(bar, note);
            _this.dm.scrollToView(bar);
            s.play();
        }, this);
    };
    GameState.prototype.destroy = function () {
    };
    GameState.prototype.update = function () {
    };
    return GameState;
}(Phaser.State));
window.onload = function () {
    var game = new OcarinaTrainer();
};
var OcarinaTrainer = (function (_super) {
    __extends(OcarinaTrainer, _super);
    function OcarinaTrainer() {
        var _this = _super.call(this, 1440, 900, Phaser.AUTO, "", null, false, false) || this;
        _this.state.add("Boot", new BootState());
        _this.state.add("Preload", new PreloadState());
        _this.state.add("Main", new GameState());
        _this.state.start("Boot");
        return _this;
    }
    return OcarinaTrainer;
}(Phaser.Game));
var BootState = (function (_super) {
    __extends(BootState, _super);
    function BootState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BootState.prototype.preload = function () {
        this.game.load.image("loader", "assets/sprites/loader.png");
        this.game.load.json("music", "music.json");
    };
    BootState.prototype.create = function () {
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.state.start("Preload");
    };
    return BootState;
}(Phaser.State));
var PreloadState = (function (_super) {
    __extends(PreloadState, _super);
    function PreloadState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PreloadState.prototype.preload = function () {
        var _this = this;
        this.game.stage.backgroundColor = "#000000";
        var loader = this.add.sprite(this.game.width / 2, this.game.height / 2, "loader");
        loader.width = this.game.width * 9 / 10;
        loader.height = this.game.height / 8;
        loader.anchor.setTo(0.5);
        this.game.load.setPreloadSprite(loader);
        var musicInfo = this.game.cache.getJSON("music");
        PreloadState.NOTE_COUNT = 48;
        this.game.load.atlas("sprites", "assets/sprites/sprites.png", "assets/sprites/sprites.json");
        this.game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");
        for (var i = 1; i <= PreloadState.NOTE_COUNT; i++) {
            var sound = i.toString();
            this.game.load.audio(sound, ["assets/sounds/" + sound + ".mp3", "assets/sounds/" + sound + ".ogg"]);
        }
        this.game.load.audio("metronome", ["assets/sounds/metronome.mp3", "assets/sounds/metronome.ogg"]);
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false, 1); }, this);
    };
    return PreloadState;
}(Phaser.State));
PreloadState.NOTE_COUNT = 48;
var BarRenderer = (function (_super) {
    __extends(BarRenderer, _super);
    function BarRenderer(game, bar) {
        var _this = _super.call(this, game) || this;
        _this.bar = bar;
        _this.draw();
        return _this;
    }
    BarRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.bar = null;
    };
    BarRenderer.prototype.getWidth = function () {
        return (this.bar.count + 0.5) * BarRenderer.xStep;
    };
    BarRenderer.prototype.getHeight = function () {
        return BarRenderer.barHeight;
    };
    BarRenderer.prototype.draw = function () {
        this.yStaveHeight = BarRenderer.barHeight * 0.7;
        this.yBarBottom = BarRenderer.barHeight * 0.95;
        var img;
        for (var n = 0; n < this.bar.music.voices; n++) {
            img = this.game.add.image(0, this.getYString(n), "sprites", "rectangle", this);
            img.tint = 0x000000;
            img.anchor.setTo(0, 0.5);
            img.width = this.getWidth();
            img.height = Math.max(1, this.yStaveHeight / 32);
        }
        for (var n = 0; n < 2; n++) {
            img = this.game.add.image(n * this.getWidth(), this.getYString(0), "sprites", "rectangle", this);
            img.tint = 0x000000;
            img.anchor.setTo(0.5, 0);
            img.width = Math.max(1, this.yStaveHeight / 16);
            img.height = this.getYString(this.bar.music.voices - 1) - this.getYString(0);
        }
        for (var n = 0; n < this.bar.count; n++) {
            this.drawNote(n);
        }
        var crotchet = Math.floor(1000 / this.bar.music.beats / 2) + 1;
        var n = 0;
        while (n < this.bar.count) {
            if (this.bar.note[n].len < crotchet) {
                var start = n;
                while (n != this.bar.count && this.bar.note[n].len < crotchet) {
                    n++;
                }
                n--;
                this.connectNotes(start, n);
            }
            n = n + 1;
        }
        if (BarRenderer.DEBUG) {
            img = this.game.add.image(0, 0, "sprites", "frame", this);
            img.width = this.getWidth();
            img.height = this.getHeight();
            img.tint = 0xFF0000;
            img.alpha = 0.3;
        }
    };
    BarRenderer.prototype.drawNote = function (n) {
        var img = this.game.add.image(this.getXNote(n), this.getYString(this.bar.music.voices - 0.5), "sprites", "rectangle", this);
        img.width = Math.max(1, this.yStaveHeight / 32);
        img.height = this.yBarBottom - img.y;
        img.anchor.setTo(0.5, 0);
        img.tint = 0x000000;
        for (var str = 0; str < this.bar.music.voices; str++) {
            var note = this.bar.note[n].chromaticOffsets[str];
            if (note != Note.NO_STRUM) {
                img = this.game.add.image(this.getXNote(n), this.getYString(str), "sprites", note.toString(), this);
                img.anchor.setTo(0.5, 0.5);
                img.width = BarRenderer.xStep * 0.7;
                img.height = (this.getYString(1) - this.getYString(0)) * 0.8;
            }
        }
        if (this.bar.note[n].len >= Math.floor(1000 * 2 / this.bar.music.beats)) {
            var crc = this.game.add.image(img.x, img.y, "sprites", "circle", this);
            crc.tint = 0x000000;
            crc.anchor.setTo(0.5, 0.5);
            crc.width = crc.height = img.height * 2.2;
        }
    };
    BarRenderer.prototype.connectNotes = function (first, last) {
        if (first == last) {
            if (first > 0) {
                this.drawConnection(first - 0.5, first, this.bar.note[first].len);
            }
            else {
                this.drawConnection(first, first + 0.5, this.bar.note[first].len);
            }
            return;
        }
        var shortestNote = 1000;
        var allSameLength = true;
        for (var n = first; n <= last; n++) {
            shortestNote = Math.min(shortestNote, this.bar.note[n].len);
            if (Math.abs(this.bar.note[first].len - this.bar.note[n].len) > 3) {
                allSameLength = false;
            }
        }
        if (allSameLength) {
            this.drawConnection(first, last, shortestNote);
            return;
        }
        this.drawConnection(first, last, 1000 / this.bar.music.beats / 2);
        var n = first;
        while (n <= last) {
            if (Math.abs(this.bar.note[n].len - 1000 / this.bar.music.beats / 4) < 3) {
                var isNext = false;
                var isPrev = false;
                if (n < last) {
                    if (Math.abs(this.bar.note[n + 1].len - 1000 / this.bar.music.beats / 4) < 3) {
                        isNext = true;
                    }
                }
                if (n > first) {
                    if (Math.abs(this.bar.note[n - 1].len - 1000 / this.bar.music.beats / 4) < 3) {
                        isPrev = true;
                    }
                }
                if (!isPrev) {
                    if (isNext) {
                        this.drawConnection(n, n + 1, this.bar.note[n].len);
                    }
                    else {
                        this.drawConnection(n - 0.5, n, this.bar.note[n].len);
                    }
                }
            }
            n++;
        }
    };
    BarRenderer.prototype.drawConnection = function (start, end, length) {
        var isDouble = (Math.abs(length - 1000 / this.bar.music.beats / 4) < 3);
        this.drawConnectingBar(start, end, this.yBarBottom);
        if (isDouble) {
            this.drawConnectingBar(start, end, this.yBarBottom - this.yStaveHeight / 8);
        }
    };
    BarRenderer.prototype.drawConnectingBar = function (start, end, y) {
        start = this.getXNote(start);
        end = this.getXNote(end);
        var img = this.game.add.image(start, y, "sprites", "rectangle", this);
        img.tint = 0x000000;
        img.anchor.setTo(0, 1);
        img.width = end - start;
        img.height = this.yStaveHeight / 16;
    };
    BarRenderer.prototype.positionCursor = function (pos, object) {
        var x = this.x + this.getXNote(pos + 0.35);
        var y = this.y + this.yStaveHeight / 2;
        object.width = BarRenderer.xStep * 0.6;
        object.height = this.yStaveHeight * 1.15;
        object.anchor.setTo(0.5, 0.5);
        object.bringToTop();
        object.x = x;
        object.y = y;
    };
    BarRenderer.prototype.getXNote = function (n) {
        return Math.round((n + 0.75) * BarRenderer.xStep);
    };
    BarRenderer.prototype.xPosToNote = function (x) {
        var result = -1;
        for (var n = 0; n < this.bar.count; n++) {
            if (x >= this.getXNote(n - 0.5) && x < this.getXNote(n + 0.5)) {
                result = n;
            }
        }
        return result;
    };
    BarRenderer.prototype.getYString = function (str) {
        return (str + 1) * this.yStaveHeight / (this.bar.music.voices + 1);
    };
    return BarRenderer;
}(Phaser.Group));
BarRenderer.barHeight = 200;
BarRenderer.xStep = 64;
BarRenderer.DEBUG = false;
var Bar = (function () {
    function Bar(barNumber, music) {
        this.barNumber = barNumber;
        this.music = music;
        this.note = [];
        this.count = 0;
    }
    Bar.prototype.decode = function (barDef) {
        var p = 0;
        var barPosition = 0;
        while (p < barDef.length) {
            var cc = barDef.charCodeAt(p);
            if (cc >= 48 && cc < 58) {
                barPosition = barPosition + 1000 / this.music.beats * (cc - 48) / 4;
                p++;
            }
            else {
                var note = new Note();
                note.chromaticOffsets = [];
                note.time = barPosition;
                note.len = 0;
                for (var n = 0; n < this.music.voices; n++) {
                    cc = barDef.charCodeAt(p);
                    p = p + 1;
                    if (cc >= 65 && cc <= 90) {
                        note.chromaticOffsets.push(cc - 65);
                    }
                    else {
                        if (cc != 45) {
                            console.log("WARN: Syntax " + barDef);
                        }
                        note.chromaticOffsets.push(Note.NO_STRUM);
                    }
                }
                this.note.push(note);
                this.count++;
            }
        }
        for (var n = 0; n < this.count; n++) {
            this.note[n].len = (n != this.count - 1 ?
                this.note[n + 1].time : 1000)
                - this.note[n].time;
        }
    };
    return Bar;
}());
var Music = (function () {
    function Music() {
        this.bar = [];
        this.count = 0;
        this.beats = -1;
        this.type = null;
    }
    Music.prototype.load = function (json) {
        this.beats = parseInt(json["beats"]);
        this.type = json["type"];
        this.musicName = json["name"] || "";
        this.authorName = json["author"] || "";
        this.instrumentName = json["instrument"] || "";
        this.beatsPerMinute = parseInt(json["speed"]);
        this.instrument = InstrumentFactory.get(this.type);
        this.voices = this.instrument.getVoices();
        for (var _i = 0, _a = json["bars"]; _i < _a.length; _i++) {
            var bDef = _a[_i];
            var bar = new Bar(this.count, this);
            bar.decode(bDef);
            this.bar.push(bar);
            this.count++;
        }
    };
    return Music;
}());
var Note = (function () {
    function Note() {
    }
    Note.prototype.toString = function () {
        return this.chromaticOffsets.join("-") + " @ " +
            this.time.toString() + " [" + this.len.toString() + "]";
    };
    return Note;
}());
Note.NO_STRUM = -1;
var InstrumentFactory = (function () {
    function InstrumentFactory() {
    }
    InstrumentFactory.get = function (name) {
        if (name === "DULCIMERDAA") {
            return new DulcimerDAA();
        }
        if (name === "OCARINACSOP") {
            return new OcarinaCSoprano();
        }
        if (name === "MANDOLIN") {
            return new Mandolin();
        }
        console.log("Unknown instrument type ", name);
        return null;
    };
    return InstrumentFactory;
}());
var SOUND_SET;
(function (SOUND_SET) {
    SOUND_SET[SOUND_SET["STRUM"] = 10048] = "STRUM";
    SOUND_SET[SOUND_SET["WOODWIND"] = 11042] = "WOODWIND";
})(SOUND_SET || (SOUND_SET = {}));
;
var BaseInstrument = (function () {
    function BaseInstrument() {
    }
    BaseInstrument.prototype.isDoubleString = function (str) { return false; };
    BaseInstrument.prototype.getDisplayedFretForChromatic = function (fret) { return fret.toString(); };
    BaseInstrument.prototype.isDiatonic = function () { return false; };
    BaseInstrument.prototype.getSoundSetSize = function () { return this.getSoundSet() % 1000; };
    return BaseInstrument;
}());
var DiatonicInstrument = (function (_super) {
    __extends(DiatonicInstrument, _super);
    function DiatonicInstrument() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DiatonicInstrument.prototype.isDiatonic = function () { return true; };
    DiatonicInstrument.prototype.getDisplayedFretForChromatic = function (fret) {
        var diatonic = Math.floor(fret / 12) * 7;
        diatonic += DiatonicInstrument.DIATONIC_MAPPING[fret % 12];
        var s = Math.floor(diatonic).toString();
        if (Math.floor(diatonic) != diatonic) {
            s = s + "+";
        }
        return s;
    };
    return DiatonicInstrument;
}(BaseInstrument));
DiatonicInstrument.DIATONIC_MAPPING = [
    0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 6, 6.5
];
var DulcimerDAA = (function (_super) {
    __extends(DulcimerDAA, _super);
    function DulcimerDAA() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DulcimerDAA.prototype.getVoices = function () { return 3; };
    DulcimerDAA.prototype.getTuning = function () { return [3, 10, 10]; };
    DulcimerDAA.prototype.getVolume = function () { return [50, 50, 100]; };
    DulcimerDAA.prototype.getSoundSet = function () { return SOUND_SET.STRUM; };
    DulcimerDAA.prototype.isDoubleString = function (str) { return (str == 2); };
    return DulcimerDAA;
}(DiatonicInstrument));
var OcarinaCSoprano = (function (_super) {
    __extends(OcarinaCSoprano, _super);
    function OcarinaCSoprano() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OcarinaCSoprano.prototype.getVoices = function () { return 1; };
    OcarinaCSoprano.prototype.getTuning = function () { return [13]; };
    OcarinaCSoprano.prototype.getVolume = function () { return [100]; };
    OcarinaCSoprano.prototype.getSoundSet = function () { return SOUND_SET.WOODWIND; };
    return OcarinaCSoprano;
}(BaseInstrument));
var Mandolin = (function (_super) {
    __extends(Mandolin, _super);
    function Mandolin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Mandolin.prototype.getVoices = function () { return 4; };
    Mandolin.prototype.getTuning = function () { return [8, 15, 22, 29]; };
    Mandolin.prototype.getVolume = function () { return [100, 100, 100, 100]; };
    Mandolin.prototype.getSoundSet = function () { return SOUND_SET.STRUM; };
    return Mandolin;
}(BaseInstrument));
