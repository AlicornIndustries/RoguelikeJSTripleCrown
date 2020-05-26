// Code for game screens (world, inventory, etc). Each screen handles its own rendering and input handling
// Basic structure of a screen: functions for enter, exit, render, handleInput

Game.Screen = {};

// Define the screens (start, play, win, loss)
Game.Screen.startScreen = {
    enter: function() {console.log("Entered start screen."); },
    exit: function() {console.log("Exited start screen."); },
    render: function(display) {
        display.drawText(1,1,"%c{yellow}GAMETITLE");
        display.drawText(1,2,"Press [Enter] to start!");
    },
    handleInput: function(inputType, inputData) {
        
        // On press Enter, go to play screen
        if(inputType==="keydown") {
            if(inputData.keyCode === ROT.KEYS.VK_RETURN) { // NOTE: Unlike the older guide, use ROT.KEYS.VK_RETURN, not ROT.VK_RETURN (likewise for other keycodes)
                console.log("Enter pressed");
                Game.switchScreen(Game.Screen.playScreen);
            }
        }
    }
}
Game.Screen.playScreen = {
    _map: null, // All screen logic and data is in the screen's class, so the map is here
    enter: function() {
        // For now, create map on enter
        console.log("Entered play screen.");
        var map = [];
        var mapWidth=80; var mapHeight=24;
        for (var x=0; x<mapWidth; x++) { // TODO: Replace with proper Game.Display.Options.Width or something
            map.push([]);
            // Add all the tiles
            for (var y=0; y<mapHeight; y++) {
                map[x].push(Game.Tile.nullTile);
            }
        }
        // Setup map generator
        var generator = new ROT.Map.Cellular(mapWidth,mapHeight);
        generator.randomize(0.5); // Probability of random cell being 1 (floor)
        var totalIterations = 3; // Loop over the generator a few times to smooth it out
        for (var i=0; i<totalIterations-1;i++) {
            generator.create();
        }
        // Smooth one last time, then update the map
        generator.create(function(x,y,v) {
            if(v===1) { // If the generator has a 1 for that tile, it's floor
                map[x][y] = Game.Tile.floorTile;
            } else {
                map[x][y] = Game.Tile.wallTile;
            }
        });
        // Create map from the tiles
        this._map = new Game.Map(map);
    },
    exit: function() {console.log("Exited play screen."); },
    render: function(display) {
        // Iterate through map tiles and render glyph
        for (var x=0; x<this._map.getWidth(); x++) {
            for (var y=0; y<this._map.getHeight(); y++) {
                var glyph = this._map.getTile(x,y).getGlyph();
                display.draw(x,y,glyph.getChar(),glyph.getForeground(),glyph.getBackground());
            }
        }
    },
    handleInput: function(inputType, inputData) {
    }
}
Game.Screen.winScreen = {
    enter: function() {console.log("Entered win screen."); },
    exit: function() {console.log("Exited win screen."); },
    render: function(display) {
        display.drawText(1,1,"Win screen placeholder.");
    },
    handleInput: function(inputType, inputData) {
        // Nothing here yet. Add restart button, etc
    }
}
Game.Screen.loseScreen = {
    enter: function() {console.log("Entered lose screen"); },
    exit: function() {console.log("Exited lose screen."); },
    render: function(display) {
        display.drawText(1,1,"Lose screen placeholder");
    },
    handleInput: function(inputType, inputData) {
        // Nothing here yet. Add restart button.
    }
}