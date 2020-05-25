var Game = {
    display: null,
    displayOptions: {width:50, height:35, fontSize:15, forceSquareRatio:true},
    map: {},
    engine: null,
    player: null,
    init: function() {
        this._createDisplay();
        this._generateMap();
        this._createPlayer();
        this.player._draw();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },
    _createDisplay: function() {
        this.display = new ROT.Display(this.displayOptions);
        document.body.appendChild(this.display.getContainer());
        //this.map.create(this.display.DEBUG);
    },
    _generateMap: function() {
        this.map = new ROT.Map.Uniform(this.displayOptions.width,this.displayOptions.height-2); // Reserve a little space at the bottom for stats TODO: Make this part of the options
        this.map.create(this.display.DEBUG); // TODO: Is there a better callback to use than DEBUG? The manual is unclear
    },
    _createPlayer: function() {
        // Choose a random room, place player in the center
        var rooms = this.map.getRooms();
        var index = Math.floor(ROT.RNG.getUniform() * rooms.length);
        var x = rooms[index].getCenter()[0];
        var y = rooms[index].getCenter()[1];
        this.player = new Player(x,y);
    },
}

var Player = function(x,y) {
    this._x = x;
    this._y = y;
    this._draw();
}

// TODO: Figure out better why we need to use prototypes instead of defining this in var Player
// Player.prototype.act = function(e) {
//     // Process user input. Called on keydown by Player.prototype.act()'s event listener
//     // TODO: make keymapping configurable. Put it in a separate var?
//     var keyMap = {};
//     // Numpad keys (Top is 0 (aka the 8 key), going clockwise)
//     keyMap[38] = 0;keyMap[33] = 1;keyMap[39] = 2;keyMap[34] = 3;keyMap[40] = 4;keyMap[35] = 5;keyMap[37] = 6;keyMap[36] = 7;

//     var code = e.keyCode; // button pressed by user

//     // Validate input: is the key code mapped?
//     if(!(code in keyMap)) {return;}
//     // Now check if player can move in that direction. TODO: replace with canMoveInDirection() function of Player
//     var diff = ROT.DIRS[8][keyMap[code]]; // x,y dirs of the move (e.g. 6 on the numpad is 1,0)
//     var newX = this._x + diff[0];
//     var newY = this._y + diff[1];
// }

Player.prototype._draw = function() {
    // Call this after moving
    Game.display.draw(this._x, this._y, "@", "#FFFFFF");
}