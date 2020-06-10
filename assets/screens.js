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
    _gameEnded: false,
    _subscreen: null,
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
        // Render subscreen instead if there is one
        if(this._subscreen) {
            this._subscreen.render(display);
            return;
        }
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

        // Render explored/visible map cells and visible items
        for (var x=topLeftX; x<topLeftX+screenWidth; x++) {
            for (var y=topLeftY; y<topLeftY+screenHeight; y++) {
                if(map.isExplored(x,y,currentDepth)) {
                    var glyph = this._map.getTile(x,y,currentDepth);
                    var foreground = glyph.getForeground();
                    // Use different foreground color if tile is explored but not visible
                    //var foreground = visibleCells[x+","+y] ? tile.getForeground() : "darkGray";
                    // If cell in FOV, draw items and entities
                    if(visibleCells[x+","+y]) { // TODO: replace with an isVisible function
                        // Check for items first, since we want to draw entities over items
                        var items = map.getItemsAt(x,y,currentDepth);
                        // Render topmost item
                        if(items) {
                            glyph = items[items.length-1];
                        }
                        // Check if there's an entity on the tile
                        if(map.getEntityAt(x,y,currentDepth)) {
                            glyph = map.getEntityAt(x,y,currentDepth);
                        }
                        // Update foreground if our glyph changed to an item or entity
                        foreground = glyph.getForeground();
                    } else {
                        // Tile was previously explored but not currently visible
                        foreground = "darkGray";
                    }
                    display.draw(
                        x-topLeftX,
                        y-topLeftY,
                        glyph.getChar(),
                        foreground,
                        glyph.getBackground()
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
        if(this._player.getArmor()) {
            stats+=vsprintf("\nAD: %d/%d",[this._player.getArmor().getArmorDurability(),this._player.getArmor().getMaxArmorDurability()]);
        }
        display.drawText(0, screenHeight, stats);
        // Render hunger stat
        var hungerState = this._player.getHungerState();
        display.drawText(screenWidth-hungerState.length, screenHeight, hungerState);

    
    },
    handleInput: function(inputType, inputData) {
        // If game is over, enter will bring them to the lose screen
        if(this._gameEnded) {
            if(inputType==="keydown" && inputData.keyCode === ROT.KEYS.VK_RETURN) {
                Game.switchScreen(Game.Screen.loseScreen);
            }
            return;
        }
        // Handle subscreen input if there is one
        if(this._subscreen) {
            this._subscreen.handleInput(inputType, inputData);
            return;
        }
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
                } else if(inputData.keyCode === ROT.KEYS.VK_I) {
                    // Inventory
                    this.showItemsSubscreen(Game.Screen.inventoryScreen, this._player.getItems(), "You are not carrying anything.");
                    return;
                } else if(inputData.keyCode===ROT.KEYS.VK_D) {
                    // Drop items
                    this.showItemsSubscreen(Game.Screen.dropScreen, this._player.getItems(), "You have nothing to drop.");
                    return;
                } else if(inputData.keyCode===ROT.KEYS.VK_E) {
                    // Eat items
                    this.showItemsSubscreen(Game.Screen.eatScreen, this._player.getItems(), "You have nothing to eat.");
                    return;
                } else if(inputData.keyCode===ROT.KEYS.VK_W) {
                    if(inputData.shiftKey) {
                        // Wear screen
                        this.showItemsSubscreen(Game.Screen.wearScreen, this._player.getItems(), "You have nothing to wear. Rarity would be ashamed!"); // TODO: Make "Rarity would be ashamed!" a random chance to get.
                        return;
                    } else {
                        // Wield screen
                        this.showItemsSubscreen(Game.Screen.wieldScreen, this._player.getItems(), "You have nothing to wield!");
                    }
                    return;
                } else if(inputData.keyCode===ROT.KEYS.VK_COMMA) {
                    // Pick up items
                    var items = this._map.getItemsAt(this._player.getX(), this._player.getY(), this._player.getD());
                    if(!items) {
                        Game.sendMessage(this._player, "There is nothing to pick up here.");
                    } else if(items.length===1) {
                        // If only one item, try to pick it up
                        var item = items[0];
                        if(this._player.pickupItems([0])) {
                            Game.sendMessage(this._player, "You pick up %s.",[item.describeA()]);
                        } else {
                            Game.sendMessage(this._player, "Your inventory is full! Nothing was picked up.");
                        }
                    } else {
                        // Show pickup screen
                        this.showItemsSubscreen(Game.Screen.pickupScreen, items, "There is nothing to pick up here.")
                        //Game.Screen.pickupScreen.setup(this._player, items);
                        //this.setSubscreen(Game.Screen.pickupScreen);
                        return;
                    }

                } else if (inputData.keyCode === ROT.KEYS.VK_Q) {
                    // For testing
                    console.log("Q pressed");
                } else {
                    // Not a valid key
                    return;
                }
                // Unlock the engine after moving/using item screen
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
            // Unlock engine after stairs
            this._map.getEngine().unlock();
        }
    },
    move: function(dX, dY, dD) { // Move the player
        // +dX is right, -dX is left. +dY is down, -dY is up (centered on top left)
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newD = this._player.getD() + dD;
        this._player.tryMove(newX, newY, newD, this._map);
    },
    setGameEnded: function(gameEnded) {
        this._gameEnded = gameEnded;
    },
    setSubscreen: function(subscreen) {
        this._subscreen = subscreen;
        Game.refresh();
    },
    showItemsSubscreen: function(subscreen, items, emptyMessage) {
        // Go to subscreen, if you have no appropriate items, show message
        if(items && subscreen.setup(this._player, items)>0) {
            this.setSubscreen(subscreen);
        } else {
            Game.sendMessage(this._player, emptyMessage);
            Game.refresh();
        }
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

Game.Screen.ItemListScreen = function(template) {
    // Setup based on template
    this._caption = template['caption'];
    this._okFunction = template['ok'];
    this._hasNoItemOption = template['hasNoItemOption'];

    // Filter out some items (don't show non-edible on an "eat" screen, e.g.).
    this._isAcceptableFunction = template["isAcceptable"] || function(x){return x;} // By default, use identity function
    // Can the user select items on this screen?
    this._canSelectItem = template['canSelect'];
    this._canSelectMultipleItems = template['canSelectMultipleItems'];
};
Game.Screen.ItemListScreen.prototype.setup = function(player, items) {
    // Returns count of acceptable items
    // Call this before switching to the screen
    this._player = player;
    // Number of acceptable items
    var count = 0;
    // Keep only acceptable items
    var that = this;
    this._items = items.map(function(item) {
        // Null item if it's not acceptable
        if(that._isAcceptableFunction(item)) {
            count++;
            return item;
        } else {
            return null;
        }
    });
    // Clean set of selected indices
    this._selectedIndices = {};
    return count;
};


Game.Screen.ItemListScreen.prototype.render = function(display) {
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    // Render caption in top row
    display.drawText(0,0,this._caption);
    // Render "no item" row if enabled
    if(this._hasNoItemOption) {
        display.drawText(0,1,"0 - nothing");
    }
    var row = 0;
    for (var i=0; i<this._items.length; i++) {
        // If we have an item, render it
        if(this._items[i]) {
            // Get letter matching the item's index
            var letter = letters.substring(i,i+1);
            // If item selected, show +. Else, -.
            var selectionState = (this._canSelectItem && this._canSelectMultipleItems && this._selectedIndices[i] ? '+' : '-');
            // Check if item is worn or wielded
            var suffix = "";
            if(this._items[i]===this._player.getArmor()) {
                suffix=" (wearing)";
            } else if(this._items[i]===this._player.getWeapon()) {
                suffix=" (wielding)";
            }
            // Add two to row to account for the caption and blank space
            display.drawText(0,2+row,letter+" "+selectionState+""+this._items[i].describe()+suffix);
            row++;
        }
    }
};
Game.Screen.ItemListScreen.prototype.executeOkFunction = function() {
    // ok() is a method of the kind of item list screen (e.g. inventory, pickup...) that does something based on the selected item/s    
    // Gather selected items
    var selectedItems = {};
    for(var key in this._selectedIndices) {
        selectedItems[key] = this._items[key];
    }
    // Switch back to play screen
    Game.Screen.playScreen.setSubscreen(undefined);
    // Call the OK function and end the player's turn if true
    if(this._okFunction(selectedItems)) {
        this._player.getMap().getEngine().unlock();
    }
};
Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
    if(inputType === 'keydown') {
        // If user hit escape, hit enter and can't select an item, or hit enter w/o items selected, cancel ou
        if(inputData.keyCode === ROT.KEYS.VK_ESCAPE || (inputData.keyCode === ROT.KEYS.VK_RETURN && (!this._canSelectItem || Object.keys(this._selectedIndices).length===0))) {
            Game.Screen.playScreen.setSubscreen(undefined);
        } else if(inputData.keyCode===ROT.KEYS.VK_RETURN) {
            // Handle pressing return when items are selected
            this.executeOkFunction();
        } else if(this._canSelectItem && this._hasNoItemOption && inputData.keyCode===ROT.KEYS.VK_0) {
            // Handle pressing 0 when "no item" selection is enabled
            this._selectedIndices = {};
            this.executeOkFunction();
        } else if(this._canSelectItem && inputData.keyCode>=ROT.KEYS.VK_A && inputData.keyCode<=ROT.KEYS.VK_Z) {
            // Check if it maps to a valid item by subtracting the value of 'a'
            var index = inputData.keyCode-ROT.KEYS.VK_A;
            if(this._items[index]) {
                // If multiple selection is allowed, toggle the selection state of the item.
                // Else, select the item and exit the screen
                if(this._canSelectMultipleItems) {
                    if(this._selectedIndices[index]) {
                        delete this._selectedIndices[index];
                    } else {
                        this._selectedIndices[index] = true;
                    }
                    // Redraw screen to show selection status
                    Game.refresh();
                } else {
                    // canSelectMultipleItems is false
                    this._selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
}

// Subscreens based on ItemListScreen
Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
    caption: "Inventory",
    canSelect: false
});
Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    caption: "Choose the items you wish to pickup",
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems) {
        // Try to pickup all selected items
        if(!this._player.pickupItems(Object.keys(selectedItems))) {
            Game.sendMessage(this._player, "Your inventory is full! Not all items were picked up.");
        }
        return true; // Even if not all items were picked up
    }
});
Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    caption: "Choose the item you wish to drop",
    canSelect: true,
    canSelectMultipleItems: false,
    ok: function(selectedItems) {
        // Drop
        this._player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});
Game.Screen.eatScreen = new Game.Screen.ItemListScreen({
    caption: "Choose the item you wish to eat",
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin("Edible");
    },
    ok: function(selectedItems) {
        // Eat item. Remove it if no consumptions remain
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        Game.sendMessage(this._player, 'You eat %s.',[item.describeThe()]);
        item.eat(this._player);
        if(!item.hasRemainingConsumptions()) {
            this._player.removeItem(key);
        }
        return true;
    }
})

Game.Screen.wieldScreen = new Game.Screen.ItemListScreen({
    caption: "Choose the item you wish to wield",
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        return item && item.hasMixin("Equippable") && item.isWieldable();
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        // If no item selected, unwield
        if(keys.length===0) {
            this._player.unwield();
            Game.sendMessage(this._player, "You are empty hooved.");
        } else {
            // Make sure to unequip item first, in case it was also being used as armor or something
            var item = selectedItems[keys[0]];
            this._player.unequip(item);
            this._player.wield(item);
            Game.sendMessage(this._player, "You are wielding %s",[item.describeA()]);
        }
        return true;
    }
})
Game.Screen.wearScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to wear',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        return item && item.hasMixin('Equippable') && item.isWearable();
    },
    ok: function(selectedItems) {
        // Check if we selected 'no item'
        var keys = Object.keys(selectedItems);
        if (keys.length === 0) {
            this._player.unwield();
            Game.sendMessage(this._player, "You are not wearing anthing.")
        } else {
            // Make sure to unequip the item first in case it is also being wielded as a weapon or something
            var item = selectedItems[keys[0]];
            this._player.unequip(item);
            this._player.wear(item);
            Game.sendMessage(this._player, "You are wearing %s.", [item.describeA()]);
        }
        return true;
    }
})
