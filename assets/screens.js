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
    _player: null,
    _centerX: 0, // COords to center the view on
    _centerY: 0,
    enter: function() {
        // For now, create map on enter
        console.log("Entered play screen.");
        var map = [];
        var mapWidth=500; var mapHeight=500;
        for (var x=0; x<mapWidth; x++) {
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
        // Create map from the tiles and player
        this._player = new Game.Entity(Game.PlayerTemplate);
        this._map = new Game.Map(map, this._player);
        // Set player position        
        var position = this._map.getRandomFloorPosition();
        this._player.setX(position.x);
        this._player.setY(position.y);
        // Start map's engine
        this._map.getEngine().start();
    },
    exit: function() {console.log("Exited play screen."); },
    render: function(display) {
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();
        // Keep it centered on player (st. top-left corner is half a screen away from player)
        // Ensure x axis doesn't exceed left bound
        var topLeftX = Math.max(0, this._player.getX()-(screenWidth/2));
        // Ensure we have enough space to fit an entire screenWidth. If not, stop scrolling
        topLeftX = Math.min(topLeftX, this._map.getWidth()-screenWidth);
        // Ensure y axis doesn't exceed top bound
        var topLeftY = Math.max(0, this._player.getY()-(screenHeight/2));
        topLeftY = Math.min(topLeftY, this._map.getHeight()-screenHeight);

        // Iterate through visible map tiles and render glyph
        for (var x=topLeftX; x<topLeftX+screenWidth; x++) {
            for (var y=topLeftY; y<topLeftY+screenHeight; y++) {
                var tile = this._map.getTile(x,y);
                display.draw(x-topLeftX,y-topLeftY,tile.getChar(),tile.getForeground(),tile.getBackground());
            }
        }

        // Render entities on top
        var entities = this._map.getEntities();
        for (var i=0; i<entities.length; i++) {
            var entity = entities[i];
            // Only render entity if it would show up on-screen
            if (entity.getX() >= topLeftX && entity.getY() >= topLeftY && entity.getX() < topLeftX + screenWidth && entity.getY() < topLeftY + screenHeight) {
                display.draw(
                    entity.getX() - topLeftX, 
                    entity.getY() - topLeftY,    
                    entity.getChar(), 
                    entity.getForeground(), 
                    entity.getBackground()
                );
            }
        }
    },
    handleInput: function(inputType, inputData) {
        if (inputType === "keydown") {
            if(inputData.keyCode === ROT.KEYS.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else {
                // Movement
                if ((inputData.keyCode === ROT.KEYS.VK_LEFT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD4)) {
                    this.move(-1,0);
                } else if ((inputData.keyCode == ROT.KEYS.VK_RIGHT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD6)) {
                    this.move(1,0);
                } else if ((inputData.keyCode === ROT.KEYS.VK_UP) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD8)) {
                    this.move(0,-1);
                } else if ((inputData.keyCode === ROT.KEYS.VK_DOWN) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD2)) {
                    this.move(0,1);
                } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD7) {
                    this.move(-1,-1);
                } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD9) {
                    this.move(1,-1);
                } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD3) {
                    this.move(1,1);
                } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD1) {
                    this.move(-1,1);
                }
                // Unlock the engine after moving
                this._map.getEngine().unlock();
            }
            
        }
    },
    move: function(dX, dY) { // Move the player
        // +dX is right, -dX is left. +dY is down, -dY is up (centered on top left)
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        this._player.tryMove(newX, newY, this._map);
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