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
var GameState = (function (_super) {
    __extends(GameState, _super);
    function GameState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameState.prototype.create = function () {
        var bgr = this.game.add.image(0, 0, "sprites", "background");
        bgr.width = this.game.width;
        bgr.height = this.game.height;
        var marker = this.game.add.image(0, 0, "sprites", "rectangle");
        marker.tint = 0x0080F0;
        marker.alpha = 0.4;
        var fwr = new TestFoggyMountainRoll();
        var rnd = new Renderer(this.game);
        rnd.render(fwr, 512, 256);
        rnd.x = rnd.y = 50;
        rnd.highlight(2, marker);
        console.log(rnd.x, rnd.y);
    };
    GameState.prototype.destroy = function () {
    };
    GameState.prototype.update = function () {
    };
    return GameState;
}(Phaser.State));
var Finger;
(function (Finger) {
    Finger[Finger["THUMB"] = 0] = "THUMB";
    Finger[Finger["INDEX"] = 1] = "INDEX";
    Finger[Finger["MIDDLE"] = 2] = "MIDDLE";
})(Finger || (Finger = {}));
var Pluck = (function () {
    function Pluck(stringID, finger) {
        this.stringID = stringID;
        this.finger = finger;
    }
    Pluck.prototype.getName = function (finger) {
        if (finger == Finger.THUMB)
            return "thumb";
        if (finger == Finger.INDEX)
            return "index";
        if (finger == Finger.MIDDLE)
            return "middle";
        return "???";
    };
    Pluck.prototype.getLetter = function (finger) {
        return this.getName(finger).charAt(0);
    };
    return Pluck;
}());
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer(game) {
        var _this = _super.call(this, game) || this;
        _this.roll = null;
        _this.barWidth = _this.barHeight = -1;
        return _this;
    }
    Renderer.prototype.destroy = function () {
        this.roll = null;
        _super.prototype.destroy.call(this);
    };
    Renderer.prototype.render = function (roll, barWidth, barHeight) {
        this.erase();
        this.roll = roll;
        this.barWidth = barWidth;
        this.barHeight = barHeight;
        this.yBottom = barHeight * 0.95;
        for (var l = 0; l < 5; l++) {
            var stl = this.game.add.image(0, this.getY(l), "sprites", "rectangle", this);
            stl.width = this.barWidth;
            stl.height = Math.max(2, this.barHeight / 64);
            stl.tint = 0x000000;
            stl.anchor.setTo(0, 0.5);
        }
        for (var n = 0; n < 2; n++) {
            var bln = this.game.add.image(n * this.barWidth, this.getY(0), "sprites", "rectangle", this);
            bln.width = Math.max(2, this.barWidth / 64);
            bln.height = this.getY(4) - this.getY(0);
            bln.tint = 0x000000;
            bln.anchor.setTo(0.5, 0);
        }
        for (var n = 0; n < this.roll.getBeats() * 2; n++) {
            this.drawPluck(n);
        }
        for (var n = 0; n < 2; n++) {
            var con = this.game.add.image(this.getX(n * this.roll.getBeats()), this.yBottom, "sprites", "rectangle", this);
            con.tint = 0x000000;
            con.anchor.setTo(0, 1);
            con.width = this.getX(this.roll.getBeats() - 1) - this.getX(0);
            con.height = Math.max(3, this.barHeight / 16);
        }
        if (Renderer.DEBUG) {
            var dbi = this.game.add.image(0, 0, "sprites", "frame", this);
            dbi.width = this.barWidth;
            dbi.height = this.barHeight;
            dbi.tint = 0xFF8000;
            dbi.alpha = 0.5;
        }
    };
    Renderer.prototype.drawPluck = function (n) {
        var plucks = this.roll.getPlucks(n);
        var highestPoint = 5;
        for (var _i = 0, plucks_1 = plucks; _i < plucks_1.length; _i++) {
            var pluck = plucks_1[_i];
            highestPoint = Math.min(highestPoint, pluck.stringID);
            var note = this.game.add.bitmapText(this.getX(n), this.getY(pluck.stringID), "font", "0", this.barHeight / 6, this);
            note.anchor.setTo(0.5, 0.4);
            note.tint = 0x000000;
            note.height = (this.getY(1) - this.getY(0)) * 0.9;
            note.width = note.height * 0.6;
        }
        var bar = this.game.add.image(this.getX(n), this.getY(highestPoint + 0.5), "sprites", "rectangle", this);
        bar.anchor.setTo(0.5, 0);
        bar.width = Math.max(2, this.barWidth / 128);
        bar.tint = 0x000000;
        bar.height = this.yBottom - bar.y;
    };
    Renderer.prototype.getX = function (halfbeat) {
        return (halfbeat + 0.5) / (this.roll.getBeats() * 2) * this.barWidth;
    };
    Renderer.prototype.getY = function (stave) {
        return (stave + 1) / 6 * this.barHeight * 0.85;
    };
    Renderer.prototype.erase = function () {
        this.forEachAlive(function (obj) { obj.pendingDestroy = true; }, this);
    };
    Renderer.prototype.highlight = function (halfBeat, marker) {
        marker.x = this.x + this.getX(halfBeat);
        marker.y = this.y;
        marker.anchor.setTo(0.5, 0);
        marker.width = this.barWidth / (this.roll.getBeats() * 2);
        marker.height = this.barHeight;
        marker.bringToTop();
    };
    Renderer.prototype.getWidth = function () {
        return this.barWidth;
    };
    Renderer.prototype.getHeight = function () {
        return this.barHeight;
    };
    return Renderer;
}(Phaser.Group));
Renderer.DEBUG = true;
window.onload = function () {
    var game = new MainApplication();
};
var MainApplication = (function (_super) {
    __extends(MainApplication, _super);
    function MainApplication() {
        var _this = _super.call(this, 1024, 768, Phaser.AUTO, "", null, false, false) || this;
        _this.state.add("Boot", new BootState());
        _this.state.add("Preload", new PreloadState());
        _this.state.add("Main", new GameState());
        _this.state.start("Boot");
        return _this;
    }
    return MainApplication;
}(Phaser.Game));
var BootState = (function (_super) {
    __extends(BootState, _super);
    function BootState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BootState.prototype.preload = function () {
        var _this = this;
        this.game.load.image("loader", "assets/sprites/loader.png");
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Preload", true, false, 1); }, this);
    };
    BootState.prototype.preloadInBootState = function (musicName) { };
    BootState.prototype.create = function () {
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
        this.game.load.atlas("sprites", "assets/sprites/sprites.png", "assets/sprites/sprites.json");
        for (var _i = 0, _a = ["7seg", "font"]; _i < _a.length; _i++) {
            var fontName = _a[_i];
            this.game.load.bitmapFont(fontName, "assets/fonts/" + fontName + ".png", "assets/fonts/" + fontName + ".fnt");
        }
        for (var i = 1; i <= PreloadState.NOTE_COUNT; i++) {
            var sound = i.toString();
            this.game.load.audio(sound, ["assets/sounds/" + sound + ".mp3", "assets/sounds/" + sound + ".ogg"]);
        }
        this.game.load.audio("metronome", ["assets/sounds/metronome.mp3",
            "assets/sounds/metronome.ogg"]);
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false, 1); }, this);
    };
    return PreloadState;
}(Phaser.State));
PreloadState.NOTE_COUNT = 5;
var TestBasicForwardRoll = (function () {
    function TestBasicForwardRoll() {
    }
    TestBasicForwardRoll.prototype.getBeats = function () {
        return 4;
    };
    TestBasicForwardRoll.prototype.getPlucks = function (halfBeat) {
        return TestBasicForwardRoll.plucks[halfBeat];
    };
    return TestBasicForwardRoll;
}());
TestBasicForwardRoll.plucks = [
    [new Pluck(1, Finger.INDEX)],
    [new Pluck(0, Finger.MIDDLE)],
    [new Pluck(4, Finger.THUMB)],
    [new Pluck(1, Finger.INDEX)],
    [new Pluck(0, Finger.MIDDLE)],
    [new Pluck(4, Finger.THUMB)],
    [new Pluck(1, Finger.INDEX)],
    [new Pluck(0, Finger.MIDDLE)]
];
var TestFoggyMountainRoll = (function () {
    function TestFoggyMountainRoll() {
    }
    TestFoggyMountainRoll.prototype.getBeats = function () {
        return 4;
    };
    TestFoggyMountainRoll.prototype.getPlucks = function (halfBeat) {
        return TestFoggyMountainRoll.plucks[halfBeat];
    };
    return TestFoggyMountainRoll;
}());
TestFoggyMountainRoll.plucks = [
    [new Pluck(1, Finger.THUMB)],
    [new Pluck(0, Finger.MIDDLE)],
    [new Pluck(1, Finger.INDEX)],
    [new Pluck(0, Finger.MIDDLE)],
    [new Pluck(4, Finger.THUMB)],
    [new Pluck(1, Finger.INDEX)],
    [new Pluck(0, Finger.MIDDLE)],
    [new Pluck(4, Finger.THUMB)]
];
