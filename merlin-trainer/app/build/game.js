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
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MainState.prototype.create = function () {
        var _this = this;
        var bgr = this.game.add.image(0, 0, "sprites", "background");
        bgr.width = this.game.width;
        bgr.height = this.game.height;
        this.metronome = new Metronome(this.game);
        this.music = new Music(this.game.cache.getJSON("music"));
        this.player = new MusicPlayer(this.game, this.music);
        this.player.x = 160;
        this.player.y = 110;
        this.player.width = 300;
        this.player.height = 200;
        this.manager = new DisplayManager(this.game, this.music, this.game.width, this.game.height / 2);
        this.manager.y = this.game.height - 100 - this.manager.getHeight();
        this.panel = new ControlPanel(this.game, this.manager, this.player, false);
        this.panel.scale.x = this.panel.scale.y = this.game.width * 0.75 / this.panel.width;
        this.panel.x = this.game.width - this.panel.width - 10;
        this.panel.y = 10;
        this.controlBar = new ControlBar(this.game, this.game.width * 0.9, this.music.getBarCount());
        this.controlBar.x = this.game.width * 0.05;
        this.controlBar.y = (this.manager.bottom + this.game.height) / 2;
        this.controlBar.setPosition.add(function (ctrlBar, bar, mbPos) {
            _this.player.moveTo(bar, mbPos);
        }, this);
        this.metronome.x = this.game.width * 0.85;
        this.metronome.y = this.manager.y;
        this.player.onPositionUpdate.add(function (player, bar, mbPos) {
            _this.manager.moveCursor(bar, mbPos);
            _this.controlBar.moveCursor(bar, mbPos);
            _this.metronome.updatePosition(mbPos, _this.music.getStandardBeats());
        }, this);
    };
    MainState.prototype.destroy = function () {
        this.player = this.music = this.manager = this.metronome = this.panel = null;
    };
    MainState.prototype.update = function () {
    };
    return MainState;
}(Phaser.State));
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(game, image) {
        var _this = _super.call(this, game) || this;
        _this.onPress = new Phaser.Signal();
        _this.box = game.add.image(0, 0, "sprites", "icon_frame", _this);
        _this.stdSize = _this.game.width / 10;
        _this.box.anchor.setTo(0.5, 0.5);
        _this.box.inputEnabled = true;
        _this.box.events.onInputDown.add(_this.clickHandler, _this);
        _this.icon = game.add.image(0, 0, "sprites", image, _this);
        _this.icon.anchor.setTo(0.5, 0.5);
        _this.resetSize();
        return _this;
    }
    Button.prototype.resetSize = function () {
        this.box.width = this.box.height = this.stdSize;
        this.icon.width = this.icon.height = this.stdSize * 0.75;
    };
    Button.prototype.clickHandler = function () {
        this.onPress.dispatch(this);
        if (!this.game.tweens.isTweening(this)) {
            this.game.add.tween(this).to({ "width": this.width - 10, "height": this.height - 10 }, 50, Phaser.Easing.Bounce.In, true, 0, 0, true);
        }
    };
    Button.prototype.destroy = function () {
        this.onPress = null;
        this.icon = null;
        _super.prototype.destroy.call(this);
    };
    return Button;
}(Phaser.Group));
var ToggleButton = (function (_super) {
    __extends(ToggleButton, _super);
    function ToggleButton(game, onImage, offImage) {
        var _this = _super.call(this, game, onImage) || this;
        _this.onImage = onImage;
        _this.offImage = offImage;
        _this.isOn = true;
        return _this;
    }
    ToggleButton.prototype.clickHandler = function () {
        this.isOn = !this.isOn;
        this.icon.loadTexture("sprites", this.isOn ? this.onImage : this.offImage);
        _super.prototype.clickHandler.call(this);
    };
    return ToggleButton;
}(Button));
var ControlBar = (function (_super) {
    __extends(ControlBar, _super);
    function ControlBar(game, width, barCount) {
        var _this = _super.call(this, game) || this;
        _this.currentGrabbed = -1;
        _this.barWidth = width;
        _this.barCount = barCount;
        _this.ballSize = width / 16;
        _this.setPosition = new Phaser.Signal();
        var bar = game.add.image(0, 0, "sprites", "rectangle", _this);
        bar.anchor.setTo(0, 0.5);
        bar.tint = 0x00;
        bar.width = width;
        bar.height = _this.ballSize / 8;
        _this.balls = [];
        for (var n = 0; n < 3; n++) {
            var img = game.add.image((n == 1) ? width : 0, 0, "sprites", (n == 2) ? "sphere_green" : "sphere_yellow", _this);
            _this.balls[n] = img;
            img.inputEnabled = true;
            img.input.enableDrag();
            img.events.onDragStart.add(_this.dragStart, _this);
            img.events.onDragUpdate.add(_this.dragUpdate, _this);
            img.events.onDragStop.add(_this.dragStop, _this);
            img.anchor.setTo(0.5, 0.5);
            img.height = img.width = _this.ballSize;
        }
        _this.currentGrabbed = -1;
        return _this;
    }
    ControlBar.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.balls = null;
        this.setPosition = null;
    };
    ControlBar.prototype.dragStart = function (obj) {
        for (var n = 0; n < this.balls.length; n++) {
            if (this.balls[n] == obj) {
                this.currentGrabbed = n;
                console.log(n);
            }
        }
    };
    ControlBar.prototype.dragUpdate = function (obj, pointer, dragX, dragY) {
        if (this.currentGrabbed >= 0) {
            var xNew = dragX;
            xNew = Math.max(0, Math.min(xNew, this.barWidth));
            if (this.currentGrabbed == 0) {
                xNew = Math.min(xNew, this.balls[1].position.x);
            }
            if (this.currentGrabbed == 1) {
                xNew = Math.max(xNew, this.balls[0].position.x);
            }
            if (this.currentGrabbed == 2) {
                this.moveMusicPosition(this.balls[2].position.x);
            }
            this.balls[this.currentGrabbed].position.x = xNew;
            this.balls[this.currentGrabbed].position.y = 0;
        }
    };
    ControlBar.prototype.dragStop = function () {
        this.currentGrabbed = -1;
    };
    ControlBar.prototype.moveCursor = function (bar, mbPos) {
        if (this.currentGrabbed < 0) {
            this.balls[2].x = (bar + mbPos / 1000) / this.barCount * this.barWidth;
        }
    };
    ControlBar.prototype.update = function () {
        if (this.currentGrabbed >= 0) {
        }
        else {
            if (this.balls[2].x < this.balls[0].x) {
                this.moveMusicPosition(this.balls[0].x);
            }
            if (this.balls[2].x >= this.balls[1].x) {
                this.moveMusicPosition(this.balls[0].x);
            }
        }
    };
    ControlBar.prototype.moveMusicPosition = function (x) {
        var prop = Math.floor(x / this.barWidth * this.barCount * 1000);
        this.setPosition.dispatch(this, Math.floor(prop / 1000), prop % 1000);
    };
    return ControlBar;
}(Phaser.Group));
var Metronome = (function (_super) {
    __extends(Metronome, _super);
    function Metronome(game) {
        var _this = _super.call(this, game) || this;
        _this.metroImg = _this.game.add.image(0, 0, "sprites", "metronome", _this);
        _this.metroImg.anchor.setTo(0.5, 1);
        _this.metroImg.scale.x = _this.metroImg.scale.y = _this.game.height / 5 / _this.metroImg.height;
        return _this;
    }
    Metronome.prototype.destroy = function () {
        this.metroImg = null;
    };
    Metronome.prototype.updatePosition = function (mbPos, beats) {
        var twoBeat = Math.round(1000 / (beats / 2));
        var rot = (mbPos % twoBeat) / twoBeat;
        if (rot > 0.5) {
            rot = 1 - rot;
        }
        this.metroImg.rotation = (rot - 0.25) * Math.PI / 2;
    };
    return Metronome;
}(Phaser.Group));
var ControlPanel = (function (_super) {
    __extends(ControlPanel, _super);
    function ControlPanel(game, displayManager, player, isVertical) {
        if (isVertical === void 0) { isVertical = false; }
        var _this = _super.call(this, game) || this;
        _this.count = 0;
        _this.manager = displayManager;
        _this.player = player;
        _this.isVertical = isVertical;
        _this.addButton("RST", new Button(game, "i_restart")).onPress.add(function (btn) {
            _this.manager.moveCursor(0, 0);
            _this.player.moveTo(0, 0);
        }, _this);
        _this.addButton("SLO", new Button(game, "i_slower")).onPress.add(function (btn) {
            _this.player.adjustTempo(-10);
        }, _this);
        _this.addButton("NRM", new Button(game, "i_normal")).onPress.add(function (btn) {
            _this.player.resetTempo();
        }, _this);
        _this.addButton("FST", new Button(game, "i_faster")).onPress.add(function (btn) {
            _this.player.adjustTempo(10);
        }, _this);
        _this.addButton("PAU", new ToggleButton(game, "i_stop", "i_play")).onPress.add(function (btn) {
            _this.player.setPause(!btn.isOn);
        }, _this);
        _this.addButton("MUS", new ToggleButton(game, "i_music_off", "i_music_on")).onPress.add(function (btn) {
            _this.player.setInstrument(btn.isOn);
        }, _this);
        _this.addButton("MET", new ToggleButton(game, "i_metronome_off", "i_metronome_on")).onPress.add(function (btn) {
            _this.player.setMetronome(btn.isOn);
        }, _this);
        return _this;
    }
    ControlPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.manager = this.player = null;
    };
    ControlPanel.prototype.addButton = function (key, button) {
        button.height = button.width = button.game.width / 16;
        if (this.isVertical) {
            button.x = button.width / 2;
            button.y = (this.count + 0.5) * (button.width + 4);
        }
        else {
            button.x = (this.count + 0.5) * (button.width + 4);
            button.y = button.height / 2;
        }
        this.add(button);
        this.count++;
        return button;
    };
    return ControlPanel;
}(Phaser.Group));
var MusicPlayer = (function (_super) {
    __extends(MusicPlayer, _super);
    function MusicPlayer(game, music) {
        var _this = _super.call(this, game) || this;
        _this.music = music;
        if (_this.music.getBarCount() == 0) {
            throw new Error("Cannot play empty music object");
        }
        _this.createDisplay();
        _this.onPositionUpdate = new Phaser.Signal();
        _this.resetTempo();
        _this.setPause(false);
        _this.setMetronome(true);
        _this.setInstrument(true);
        _this.moveTo(0, 0);
        _this.metronomeSound = _this.game.add.audio("metronome");
        _this.stringSound = [];
        for (var n = 0; n < _this.music.getVoices(); n++) {
            _this.stringSound[n] = _this.loadInstrument(_this.music.getTuning()[n]);
        }
        return _this;
    }
    MusicPlayer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.music = null;
        this.onPositionUpdate = null;
        this.speedDisplay = null;
    };
    MusicPlayer.prototype.createDisplay = function () {
        var img = this.game.add.image(0, 0, "sprites", "rectangle", this);
        img.anchor.setTo(0.5, 0.5);
        img.tint = 0xC0C0C0;
        img.width = 200;
        img.height = 100;
        this.speedDisplay = this.game.add.bitmapText(0, 0, "7seg", "888", img.height, this);
        this.speedDisplay.tint = 0xFF0000;
        this.speedDisplay.anchor.setTo(0.5, 0.4);
    };
    MusicPlayer.prototype.updateTempo = function () {
        var s = "00" + Math.floor(this.tempo).toString();
        this.speedDisplay.setText(s.slice(-3));
    };
    MusicPlayer.prototype.loadInstrument = function (base) {
        var baseNote = Strum.convertNoteToIndex(base) - Strum.convertNoteToIndex("B3") + 1;
        var sounds = [];
        for (var offset = 0; offset < 16; offset++) {
            var soundName = (baseNote + offset).toString();
            sounds.push(this.game.add.audio(soundName));
        }
        return sounds;
    };
    MusicPlayer.prototype.update = function () {
        var elapsed = this.game.time.elapsedMS / 1000;
        var beats = this.tempo / 60 * 1000 / this.music.getBar(this.barPosition).beats;
        elapsed = Math.round(elapsed * beats);
        if (this.isInstrumentOn && !this.isPaused) {
            var bar = this.music.getBar(this.barPosition);
            for (var n = 0; n < bar.count; n++) {
                var time = bar.strums[n].time + 1;
                if (time < this.mbPosition && time + elapsed >= this.mbPosition) {
                    for (var v = 0; v < this.music.getVoices(); v++) {
                        var note = bar.strums[n].fretting[v];
                        if (note != Strum.SILENT) {
                            this.stringSound[v][note].play();
                        }
                    }
                }
            }
        }
        if (this.isMetronomeOn && !this.isPaused) {
            var mbPerBeat = 1000 / this.music.getBar(this.barPosition).beats;
            var b1 = Math.floor(this.mbPosition / mbPerBeat);
            var b2 = Math.floor((this.mbPosition + elapsed) / mbPerBeat);
            if (b1 != b2 || this.mbPosition == 0) {
                this.metronomeSound.play();
            }
        }
        if (!this.isPaused) {
            this.mbPosition += elapsed;
            if (this.mbPosition >= 1000 - 4) {
                this.mbPosition = 0;
                this.barPosition++;
                if (this.barPosition >= this.music.getBarCount()) {
                    this.moveTo(0, 0);
                }
            }
        }
        if (!this.isPaused) {
            this.onPositionUpdate.dispatch(this, this.barPosition, this.mbPosition);
        }
    };
    MusicPlayer.prototype.moveTo = function (bar, mbPosition) {
        this.barPosition = bar;
        this.mbPosition = mbPosition;
        if (this.barPosition >= this.music.getBarCount()) {
            this.barPosition = this.mbPosition = 0;
        }
    };
    MusicPlayer.prototype.resetTempo = function () {
        this.tempo = this.music.getTempo();
        this.updateTempo();
    };
    MusicPlayer.prototype.adjustTempo = function (adjust) {
        this.tempo += adjust;
        this.tempo = Math.max(40, this.tempo);
        this.tempo = Math.min(240, this.tempo);
        this.updateTempo();
    };
    MusicPlayer.prototype.setPause = function (isOn) {
        this.isPaused = isOn;
    };
    MusicPlayer.prototype.setMetronome = function (isOn) {
        this.isMetronomeOn = isOn;
    };
    MusicPlayer.prototype.setInstrument = function (isOn) {
        this.isInstrumentOn = isOn;
    };
    return MusicPlayer;
}(Phaser.Group));
var InformationType;
(function (InformationType) {
    InformationType[InformationType["TITLE"] = 0] = "TITLE";
    InformationType[InformationType["AUTHOR"] = 1] = "AUTHOR";
})(InformationType || (InformationType = {}));
var Bar = (function () {
    function Bar(barNumber, voices, beatsDefault, strumData) {
        this.barNumber = barNumber;
        this.beats = beatsDefault;
        this.strums = [];
        this.count = 0;
        var mbPosition = 0;
        var currentLabel = "";
        var p = 0;
        strumData = strumData.toUpperCase();
        while (p < strumData.length) {
            var ch = strumData.charCodeAt(p);
            var processed = false;
            if (ch == 45 || (ch >= 65 && ch < 91)) {
                this.strums[this.count] = new Strum(strumData.slice(p, p + 3), mbPosition, currentLabel);
                this.count++;
                p = p + 3;
                processed = true;
            }
            if (ch >= 49 && ch < 57) {
                mbPosition += 1000 / this.beats / 4 * (ch - 48);
                p = p + 1;
                processed = true;
            }
            if (ch == 40) {
                var p2 = strumData.indexOf(")", p);
                if (p2 < 0) {
                    throw new SyntaxError("Missing ( in " + strumData);
                }
                currentLabel = strumData.slice(p + 1, p2 - 1);
                p = p2 + 1;
                processed = true;
            }
            if (!processed) {
                throw new SyntaxError("Bar " + barNumber + " Error in " + strumData);
            }
        }
        for (var n = 0; n < this.count; n++) {
            if (n == this.count - 1) {
                this.strums[n].length = 1000 - this.strums[n].time;
            }
            else {
                this.strums[n].length = this.strums[n + 1].time - this.strums[n].time;
            }
        }
    }
    Bar.prototype.toString = function () {
        var s = "Bar " + this.barNumber + " { B:" + this.beats + " C:" + this.count;
        for (var _i = 0, _a = this.strums; _i < _a.length; _i++) {
            var strum = _a[_i];
            s = s + " " + strum.toString();
        }
        return s + " }";
    };
    return Bar;
}());
var Music = (function () {
    function Music(musObj) {
        this.musObj = musObj;
        this.bar = [];
        this.tuning = this.musObj.tuning.toUpperCase().split(",");
        for (var _i = 0, _a = this.musObj.bars; _i < _a.length; _i++) {
            var barSrc = _a[_i];
            var b = new Bar(this.bar.length, this.getVoices(), this.getStandardBeats(), barSrc);
            this.bar.push(b);
        }
    }
    Music.prototype.getTempo = function () {
        return parseInt(this.musObj.tempo || "100", 10);
    };
    Music.prototype.getStandardBeats = function () {
        return parseInt(this.musObj.beats || "4", 10);
    };
    Music.prototype.getTuning = function () {
        return this.tuning;
    };
    Music.prototype.getBarCount = function () {
        return this.bar.length;
    };
    Music.prototype.getBar = function (barNumber) {
        return this.bar[barNumber];
    };
    Music.prototype.getVoices = function () {
        return parseInt(this.musObj.voices || "3", 10);
    };
    Music.prototype.getVolume = function (str) {
        return 1;
    };
    Music.prototype.getInformation = function (info) {
        throw new Error('Method not implemented.');
    };
    return Music;
}());
var Strum = (function () {
    function Strum(fretting, time, label) {
        this.fretting = [];
        for (var n = 0; n < fretting.length; n++) {
            this.fretting[n] = Strum.SILENT;
            if (fretting.charAt(n) != '-') {
                this.fretting[n] = fretting.charCodeAt(n) - 65;
            }
        }
        this.time = time;
        this.label = label;
        this.isChordDisplay = (label != "");
    }
    Strum.prototype.toString = function () {
        var s = "";
        for (var n = 0; n < this.fretting.length; n++) {
            if (this.fretting[n] == Strum.SILENT) {
                s = s + "-";
            }
            else {
                s = s + this.fretting[n].toString();
            }
        }
        s = s + "@" + this.time.toString();
        if (this.isChordDisplay) {
            s = s + "(" + this.label + ")";
        }
        return s;
    };
    Strum.convertNoteToIndex = function (note) {
        note = note.toUpperCase();
        var re = /([A-Z]\#?)([1-5])/;
        var res = re.exec(note);
        return Strum.NOTENAMES.indexOf(res[1]) + (parseInt(res[2]) - 1) * 12;
    };
    return Strum;
}());
Strum.SILENT = -1;
Strum.NOTENAMES = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#"
];
window.onload = function () {
    var game = new SeagullMerlinApplication();
};
var SeagullMerlinApplication = (function (_super) {
    __extends(SeagullMerlinApplication, _super);
    function SeagullMerlinApplication() {
        var _this = _super.call(this, 1440, 900, Phaser.AUTO, "", null, false, false) || this;
        _this.state.add("Boot", new BootState());
        _this.state.add("Preload", new PreloadState());
        _this.state.add("Main", new MainState());
        _this.state.start("Boot");
        return _this;
    }
    SeagullMerlinApplication.getURLName = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = ""; }
        var name = decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key.toLowerCase()).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        return (name == "") ? defaultValue : name;
    };
    return SeagullMerlinApplication;
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
            this.game.load.audio(sound, ["assets/sounds/" + sound + ".mp3",
                "assets/sounds/" + sound + ".ogg"]);
        }
        this.game.load.audio("metronome", ["assets/sounds/metronome.mp3",
            "assets/sounds/metronome.ogg"]);
        this.game.load.json("music", SeagullMerlinApplication.getURLName("music", "music.json"));
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false, 1); }, this);
    };
    return PreloadState;
}(Phaser.State));
PreloadState.NOTE_COUNT = 36;
var DisplayManager = (function (_super) {
    __extends(DisplayManager, _super);
    function DisplayManager(game, music, width, height) {
        if (width === void 0) { width = null; }
        if (height === void 0) { height = null; }
        var _this = _super.call(this, game) || this;
        _this.drawWidth = width || game.width;
        _this.drawHeight = height || game.height;
        _this.music = music;
        _this.onSelect = new Phaser.Signal();
        _this.sphere = game.add.image(0, 0, "sprites", "sphere_red", _this);
        _this.sphere.anchor.setTo(0.5, 1);
        _this.sphere.height = _this.sphere.width = _this.drawHeight / 8;
        _this.barWidth = _this.drawWidth / 2.2;
        _this.renderer = [];
        for (var n = 0; n < _this.music.getBarCount(); n++) {
            var rnd = new HorizontalScrollRenderer(game, music.getBar(n), music, _this.barWidth, _this.drawHeight);
            _this.add(rnd);
            rnd.visible = false;
            _this.renderer[n] = rnd;
        }
        for (var p = 1; p <= 4; p++) {
            _this.renderer[-p] = new HorizontalScrollRenderer(game, null, music, _this.barWidth, _this.drawHeight);
            _this.add(_this.renderer[-p]);
        }
        _this.sphere.bringToTop();
        _this.moveCursor(0, 0);
        return _this;
    }
    DisplayManager.prototype.getHeight = function () {
        return this.drawHeight;
    };
    DisplayManager.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.music = null;
        this.onSelect = null;
        this.sphere = null;
    };
    DisplayManager.prototype.moveCursor = function (bar, millibeat) {
        millibeat = Math.round(millibeat);
        for (var n = -4; n < this.music.getBarCount(); n++) {
            var n1 = n;
            if (n < -1) {
                n1 = -n - 2 + this.music.getBarCount();
            }
            var x = this.drawWidth * 0.2 + (n1 - bar - millibeat / 1000) * this.barWidth;
            this.renderer[n].x = Math.round(x);
            this.renderer[n].y = 0;
            var isVisible = true;
            if (x + this.barWidth < 0) {
                isVisible = false;
            }
            if (x > this.drawWidth) {
                isVisible = false;
            }
            this.renderer[n].visible = isVisible;
        }
        this.renderer[bar].positionSphere(this.sphere, millibeat);
    };
    return DisplayManager;
}(Phaser.Group));
DisplayManager.DEBUG = false;
var HorizontalScrollRenderer = (function (_super) {
    __extends(HorizontalScrollRenderer, _super);
    function HorizontalScrollRenderer(game, bar, music, width, height) {
        var _this = _super.call(this, game) || this;
        _this.rWidth = width;
        _this.rHeight = height;
        _this.bar = bar;
        _this.music = music;
        _this.curveHeight = 0.3 * _this.rHeight;
        _this.renderBar();
        return _this;
    }
    HorizontalScrollRenderer.prototype.renderBar = function () {
        var bgr = this.game.add.image(0, 0, "sprites", "rectangle", this);
        bgr.width = this.rWidth;
        bgr.height = this.rHeight * 0.9;
        bgr.tint = 0x303030;
        var bgr2 = this.game.add.image(0, bgr.bottom, "sprites", "rectangle", this);
        bgr2.height = this.rHeight - bgr.height;
        bgr2.width = this.width;
        bgr2.tint = 0x000000;
        var bc = (this.bar == null) ? this.music.getStandardBeats() : this.bar.beats;
        for (var n = 0; n <= bc; n++) {
            var vbr = this.game.add.image(this.rWidth * n / bc, 0, "sprites", "rectangle", this);
            vbr.width = Math.max(2, this.rWidth / 128);
            vbr.height = bgr.height;
            vbr.tint = 0x00000;
            vbr.anchor.setTo(0.5, 0);
            if (n == 0 || n == bc) {
                vbr.tint = 0xFFD700;
                vbr.width *= 2;
                vbr.anchor.setTo(n == 0 ? 0 : 1, 0);
            }
        }
        var c = (this.music.getVoices() == 3) ? 4 : this.music.getVoices();
        for (var s = 0; s < c; s++) {
            var str = this.game.add.image(0, this.yString(s), "sprites", "rectangle", this);
            str.width = this.rWidth;
            str.anchor.setTo(0, 0.5);
            str.tint = 0xE0DFDB;
            if (this.music.getVoices() != 3) {
                str.height = this.rHeight / 64 + s;
            }
            else {
                str.height = this.rHeight / 64 + (this.music.getVoices() - s);
                if (s == 3) {
                    str.y = this.yString(2) - str.height * 2;
                    str.height += 2;
                }
            }
            var ss = this.game.add.image(0, str.bottom, "sprites", "rectangle", this);
            ss.width = this.rWidth;
            ss.height = this.rHeight / 128;
            ss.tint = 0x000000;
        }
        if (this.bar != null) {
            this.drawNotesSeperate();
        }
        var dbg = this.game.add.image(0, 0, "sprites", "frame", this);
        dbg.width = this.rWidth;
        dbg.height = this.rHeight;
        dbg.tint = 0xFF8000;
        dbg.alpha = 0.3;
    };
    HorizontalScrollRenderer.prototype.drawNotesSeperate = function () {
        var hPix = 0.7 * Math.abs(this.yString(0) - this.yString(1));
        var rrSizes = [102 / 50, 124 / 50, 152 / 50, 183 / 50, 199 / 50, 75 / 50, 50 / 50, 250 / 50];
        this.currentSinePos = 0;
        for (var _i = 0, _a = this.bar.strums; _i < _a.length; _i++) {
            var strum = _a[_i];
            this.drawSineCurveTo(strum.time);
            for (var strn = 0; strn < this.music.getVoices(); strn++) {
                if (strum.fretting[strn] != Strum.SILENT) {
                    var wPix = strum.length * this.rWidth / 1000;
                    var best = 2;
                    var nearest = 42;
                    for (var i = 0; i < rrSizes.length; i++) {
                        if (Math.abs(rrSizes[i] - wPix / hPix) < nearest) {
                            best = i;
                            nearest = Math.abs(rrSizes[i] - wPix / hPix);
                        }
                    }
                    var nbar = this.game.add.image(strum.time * this.rWidth / 1000, this.yString(strn), "sprites", "rr" + (best + 1), this);
                    nbar.height = hPix;
                    nbar.width = wPix;
                    nbar.anchor.setTo(0, 0.66);
                    nbar.tint = HorizontalScrollRenderer.COLOURS[strum.fretting[strn] % HorizontalScrollRenderer.COLOURS.length];
                    var n = strum.fretting[strn];
                    var s1 = HorizontalScrollRenderer.NAMES[n];
                    var txt = this.game.add.bitmapText(nbar.x + wPix * 0.5, nbar.y, "font", s1, hPix * 0.56, this);
                    txt.anchor.setTo(0.5, 0.65);
                    txt.tint = 0xFFFFFF;
                }
            }
        }
        this.drawSineCurveTo(1000);
    };
    HorizontalScrollRenderer.prototype.drawSineCurveTo = function (mbPos) {
        if (Math.abs(mbPos - this.currentSinePos) > 20) {
            var crv = this.game.add.image(this.currentSinePos * this.rWidth / 1000, this.getBounceY(), "sprites", mbPos - this.currentSinePos > 200 ? "sinecurve_wide" : "sinecurve", this);
            crv.width = (mbPos - this.currentSinePos) * this.rWidth / 1000;
            crv.height = this.curveHeight;
            crv.anchor.setTo(0, 1);
        }
        this.currentSinePos = mbPos;
    };
    HorizontalScrollRenderer.prototype.yString = function (s) {
        return (s + 0.5) / (this.music.getVoices() + 0) * this.rHeight * 0.9;
    };
    HorizontalScrollRenderer.prototype.positionSphere = function (sphere, millibeat) {
        sphere.x = this.x + millibeat * this.rWidth / 1000;
        sphere.y = this.getBounceY();
        var from = 0;
        var to = 1000;
        if (this.bar.count > 0) {
            if (millibeat < this.bar.strums[0].time) {
                to = this.bar.strums[0].time;
            }
            else {
                from = this.bar.strums[this.bar.count - 1].time;
                for (var _i = 0, _a = this.bar.strums; _i < _a.length; _i++) {
                    var strum = _a[_i];
                    if (millibeat >= strum.time && millibeat < strum.time + strum.length) {
                        from = strum.time;
                        to = strum.time + strum.length;
                    }
                }
            }
        }
        var angle = (millibeat - from) / (to - from) * Math.PI;
        sphere.y -= Math.sin(angle) * this.curveHeight;
        sphere.bringToTop();
    };
    HorizontalScrollRenderer.prototype.getBounceY = function () {
        return (this.music.getVoices() == 3) ? this.yString(1.5) : 0;
    };
    HorizontalScrollRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.music = null;
        this.bar = null;
    };
    return HorizontalScrollRenderer;
}(Phaser.Group));
HorizontalScrollRenderer.COLOURS = [
    0x0000FF, 0x00FF00, 0xFF0000, 0x008080, 0x808000, 0xFF8000, 0x808080,
    0xFF00FF, 0x800000, 0x808000, 0x008040, 0xA03030, 0x80FF00, 0xFFC0D0
];
HorizontalScrollRenderer.NAMES = [
    "0", "0+", "1", "1+", "2", "3", "3+", "4", "4+", "5", "5+", "6", "7", "8", "8+"
];
