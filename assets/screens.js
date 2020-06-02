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
    enter: function() {
        console.log("Entered play screen.");
        var mapWidth=100; var mapHeight=48; var mapDepth=6;
        // Create map
        var tiles = new Game.Builder(mapWidth,mapHeight,mapDepth).getTiles();
        this._player = new Game.Entity(Game.PlayerTemplate);
        this._map = new Game.Map(tiles, this._player);
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

        // Cells in FOV
        var visibleCells = {};
        // Store this._map and player's depth to avoid losing it in callbacks.
        var map = this._map;
        var currentDepth = this._player.getD();
        // Find all visible cells
        this._map.getFov(this._player.getD()).compute(
            this._player.getX(), this._player.getY(),
            this._player.getSightRadius(),
            function(x,y,radius,visibility) {
                visibleCells[x+","+y] = true;
                // Mark cell as explored (even if it already was)
                map.setExplored(x,y,currentDepth,true);
            });

        // Render explored/visible map cells
        for (var x=topLeftX; x<topLeftX+screenWidth; x++) {
            for (var y=topLeftY; y<topLeftY+screenHeight; y++) {
                if(map.isExplored(x,y,currentDepth)) {
                    var tile = this._map.getTile(x,y,currentDepth);
                    // Use different foreground color is tile is explored but not visible
                    var foreground = visibleCells[x+","+y] ? tile.getForeground() : "darkGray";
                    display.draw(
                        x-topLeftX,
                        y-topLeftY,
                        tile.getChar(),
                        foreground,
                        tile.getBackground()
                    );
                }
            }
        }

        // Render entities on top
        var entities = this._map.getEntities();
        for (var i=0; i<entities.length; i++) {
            var entity = entities[i];
            // Only render entity if it would show up on-screen
            if (entity.getX() >= topLeftX && entity.getY() >= topLeftY && entity.getX() < topLeftX + screenWidth && entity.getY() < topLeftY + screenHeight && entity.getD() == this._player.getD()) {
                if(visibleCells[entity.getX()+","+entity.getY()]) {
                    display.draw(
                        entity.getX() - topLeftX, 
                        entity.getY() - topLeftY,    
                        entity.getChar(), 
                        entity.getForeground(), 
                        entity.getBackground()
                    );
                }
            }
        }

        // Render messages. TODO: Move to proper message box instead of top left
        var messages = this._player.getMessages();
        var messageY = 0;
        for(var i=0; i<messages.length; i++) {
            // Draw each message, moving down each line
            messageY += display.drawText(0, messageY, "%c{white}%b{black}"+messages[i]);
        }

        // Render player stats on last row of screen
        var stats = "%c{white}%b{black}";
        stats += vsprintf("HP: %d/%d",[this._player.getHp(), this._player.getMaxHp()]);
        display.drawText(0, screenHeight, stats);
    },
    handleInput: function(inputType, inputData) {
        if (inputType === "keydown") {
            if(inputData.keyCode === ROT.KEYS.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else {
                // Movement
                if ((inputData.keyCode === ROT.KEYS.VK_LEFT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD4)) {
                    this.move(-1,0,0);
                } else if ((inputData.keyCode == ROT.KEYS.VK_RIGHT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD6)) {
                    this.move(1,0,0);
                } else if ((inputData.keyCode === ROT.KEYS.VK_UP) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD8)) {
                    this.move(0,-1,0);
                } else if ((inputData.keyCode === ROT.KEYS.VK_DOWN) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD2)) {
                    this.move(0,1,0);
                } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD7) {
                    this.move(-1,-1,0);
                } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD9) {
                    this.move(1,-1,0);
                } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD3) {
                    this.move(1,1,0);
                } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD1) {
                    this.move(-1,1,0);
                } else if (inputData.keyCode === ROT.KEYS.VK_Q) {
                    // For testing
                    console.log("Q");
                } else {
                    // Not a valid key
                    return;
                }
                // Unlock the engine after moving
                this._map.getEngine().unlock();
            }
        }
        else if (inputType === "keypress") {
            var keyChar = String.fromCharCode(inputData.charCode);
            if(keyChar === ">") {
                this.move(0,0,1);
            } else if (keyChar === "<") {
                this.move(0,0,-1);
            } else {
                // Not a valid key
                return;
            }
            // Unlock engine after moving
            this._map.getEngine().unlock();
        }
    },
    move: function(dX, dY, dD) { // Move the player
        // +dX is right, -dX is left. +dY is down, -dY is up (centered on top left)
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newD = this._player.getD() + dD;
        this._player.tryMove(newX, newY, newD, this._map);
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