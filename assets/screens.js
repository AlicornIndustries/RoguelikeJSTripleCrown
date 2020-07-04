// Code for game screens (world, inventory, etc). Each screen handles its own rendering and input handling
// Basic structure of a screen: functions for enter, exit, render, handleInput

Game.Screen = {};

// Define the screens (start, play, win, loss)
Game.Screen.startScreen = {
    enter: function() {/*console.log("Entered start screen.");*/ },
    exit: function() {/*console.log("Exited start screen.");*/ },
    render: function(display) {
        display.drawText(1,1,"%c{yellow}CATACOMBS OF DOOM");
        display.drawText(1,2,"Press [Enter] to start!");
    },
    handleInput: function(inputType, inputData) {
        
        // On press Enter, go to play screen
        if(inputType==="keydown") {
            if(inputData.keyCode === ROT.KEYS.VK_RETURN) { // NOTE: Unlike the older guide, use ROT.KEYS.VK_RETURN, not ROT.VK_RETURN (likewise for other keycodes)
                Game.switchScreen(Game.Screen.raceSelectionScreen);
            }
        }
    }
}
Game.Screen.playScreen = {
    _player: null,
    _gameEnded: false,
    _subscreen: null,
    enter: function() {
        var mapWidth=100; var mapHeight=48; var mapDepth=2;
        // Create map
        var tiles = new Game.Builder(mapWidth,mapHeight,mapDepth).getTiles();
        //this._player = new Game.Entity(Game.PlayerTemplate);
        var map = new Game.Map.Cave(tiles, this._player);
        // Start map's engine
        map.getEngine().start();
    },
    exit: function() {console.log("Exited play screen."); },
    render: function(display) {
        // Render subscreen instead if there is one
        if(this._subscreen) {
            this._subscreen.render(display);
            return;
        }

        this.renderTiles(display);
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();

        // Render messages.
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
            stats+=vsprintf("\nAD: %d/%d (%d)",[this._player.getArmor().getArmorDurability(),this._player.getArmor().getMaxArmorDurability(),this._player.getArmor().getArmorReduction()]);
        }
        display.drawText(0, screenHeight, stats);
        // Render hunger stat
        var hungerState = this._player.getHungerState();
        display.drawText(screenWidth-hungerState.length, screenHeight, hungerState);
        // Render level
        var levelStr = '%c{white}%b{black}';
        var classString = this._player.getCharClass().name;
        classString = classString.charAt(0).toUpperCase() + classString.slice(1); // capitalize first letter of class
        levelStr += vsprintf("%s L: %d XP: %d", [classString, this._player.getLevel(), this._player.getExperience()]);
        // add 18 to account for length of %c{white}%b{black}
        display.drawText(screenWidth-levelStr.length+18, screenHeight+1, levelStr);
    },
    getScreenOffsets: function() {
        var map = this._player.getMap();
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();
        // Ensure x axis doesn't exceed left bound
        var topLeftX = Math.max(0, this._player.getX()-(screenWidth/2));
        // Ensure we have enough space to fit an entire screenWidth. If not, stop scrolling
        topLeftX = Math.min(topLeftX, map.getWidth()-screenWidth);
        // Ensure y axis doesn't exceed top bound
        var topLeftY = Math.max(0, this._player.getY()-(screenHeight/2));
        topLeftY = Math.min(topLeftY, map.getHeight()-screenHeight);

        return {x: topLeftX, y: topLeftY};

    },
    renderTiles: function(display) {
        var map = this._player.getMap();
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();
        // Keep it centered on player (st. top-left corner is half a screen away from player)
        var offsets = this.getScreenOffsets();
        var topLeftX = offsets.x;
        var topLeftY = offsets.y;
        // Cells in FOV
        var visibleCells = {};
        // Store player's depth to avoid losing it in callbacks.
        var currentDepth = this._player.getD();
        // Find all visible cells
        map.getFov(this._player.getD()).compute(
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
                    var glyph = map.getTile(x,y,currentDepth);
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
        // TODO: Should this be an "else if?"
        if (inputType === "keydown") {
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
            } else if(inputData.keyCode===ROT.KEYS.VK_F) {
                if(this._player.getProjectileLauncher()!=null) {
                    var ammo = this._player.getAmmo();
                    if(ammo!=null) {
                        var offsets = this.getScreenOffsets();
                        Game.Screen.fireScreen.setup(this._player, this._player.getX(), this._player.getY(), offsets.x, offsets.y);
                        this.setSubscreen(Game.Screen.fireScreen);
                        return;
                    }
                    else {
                        Game.sendMessage(this._player,"You can't fire without ammunition.");
                        Game.refresh();
                        return;
                    }
                }
                else {
                    Game.sendMessage(this._player,"You can't fire without a projectile weapon equipped.");
                    Game.refresh();
                    return;
                }
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
                    this.showItemsSubscreen(Game.Screen.wieldScreen, this._player.getItems(), "You have nothing to wield.");
                }
                return;
            } else if(inputData.keyCode===ROT.KEYS.VK_X) {
                // Examine
                this.showItemsSubscreen(Game.Screen.examineScreen, this._player.getItems(), "You have nothing to examine.");
                return;
            } else if(inputData.keyCode===ROT.KEYS.VK_COMMA) {
                // Pick up items
                var items = this._player.getMap().getItemsAt(this._player.getX(), this._player.getY(), this._player.getD());
                if(!items) {
                    Game.sendMessage(this._player, "There is nothing to pick up here.");
                } else if(items.length===1) {
                    // If only one item, try to pick it up
                    var item = items[0];
                    if(item.hasMixin("Stackable")) {
                        var itemString = items[0].describe();
                    } else {
                        var itemString = items[0].describeA();
                    }
                    if(this._player.pickupItems([0])) {
                        Game.sendMessage(this._player, "You pick up %s.",[itemString]);
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
            } else if(inputData.keyCode === ROT.KEYS.VK_C) {
                if(inputData.shiftKey) {
                    // Character/gainStat screen.
                    if(this._player.hasMixin("PlayerStatGainer")) {
                        if(this._player.getLevelUpEarned()) {
                            Game.Screen.gainStatScreen.setup(this._player);
                            Game.Screen.playScreen.setSubscreen(Game.Screen.gainStatScreen);    
                        } else {
                            Game.Screen.characterScreen.setup(this._player);
                            Game.Screen.playScreen.setSubscreen(Game.Screen.characterScreen);
                        }
                    }
                }
            } else if(inputData.keyCode === ROT.KEYS.VK_Q) {
                if(inputData.shiftKey) {
                    // Q: Quiver screen
                    this.showItemsSubscreen(Game.Screen.quiverScreen, this._player.getItems(), "You have nothing to put in your quiver.");
                } else {
                    // q: quaff screen
                    this.showItemsSubscreen(Game.Screen.quaffScreen, this._player.getItems(), "You have nothing to drink.");
                }
            } else {
                // Not a valid key
                return;
            }
            // Unlock the engine after moving/using item screen
            this._player.getMap().getEngine().unlock();
        }
        else if (inputType === "keypress") {
            var keyChar = String.fromCharCode(inputData.charCode);
            if(keyChar === ">") {
                this.move(0,0,1);
            } else if (keyChar === "<") {
                this.move(0,0,-1);
            } else if(keyChar === ";") {
                // Look screen
                var offsets = this.getScreenOffsets();
                Game.Screen.lookScreen.setup(this._player, this._player.getX(), this._player.getY(), offsets.x, offsets.y);
                this.setSubscreen(Game.Screen.lookScreen);
                return;
            } else if(keyChar === "?") {
                // Help screen
                this.setSubscreen(Game.Screen.helpScreen);
                return;
            } else {
                // Not a valid key
                return;
            }
            // Unlock engine after stairs
            this._player.getMap().getEngine().unlock();
        }
    },
    move: function(dX, dY, dD) { // Move the player
        // +dX is right, -dX is left. +dY is down, -dY is up (centered on top left)
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newD = this._player.getD() + dD;
        this._player.tryMove(newX, newY, newD, this._player.getMap());
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
    },
    createPlayer: function(playerName, playerRace, playerCharClass) {
        this._player = new Game.Entity(Game.PlayerTemplate);
        this._player.setName(playerName);
        if(this._player.hasMixin("Classy")) {
            this._player.setCharClass(playerCharClass);
        }
        if(this._player.hasMixin("RaceHaver")) {
            this._player.setRace(playerRace);
        }
        // Grant starting equipment
        var that = this;
        if(this._player.hasMixin("InventoryHolder") && this._player.hasMixin("Classy")) {
            playerCharClass.startingItems.forEach(function(item) {
                newItem = Game.ItemRepository.create(item.name,{material:item.material,stackSize:item.stackSize});
                that._player.addItem(newItem);
                // Equip weapons and armor
                if(newItem.hasMixin("Equippable")) {
                    if(newItem.isWieldable()) {
                        that._player.wield(newItem);
                    }
                    else if(newItem.isWearable()) {
                        that._player.wear(newItem);
                    }
                    else if(newItem.isQuiverable()) {
                        that._player.quiver(newItem);
                    }
                }
            })
        }
        //this._player.gainPower(Game.Powers.TestPower);
        //this._player._powers["TestPower"].activate(this._player);
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
            } else if(this._items[i]===this._player.getAmmo()) {
                suffix=" (quivered)";
            }
            // Add two to row to account for the caption and blank space
            display.drawText(0,2+row,letter+" "+selectionState+" "+this._items[i].describe()+suffix);
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
        this._player.eat(item);
        return true;
    }
});
Game.Screen.quaffScreen = new Game.Screen.ItemListScreen({
    caption: "Choose the item you list to quaff",
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin("Quaffable");
    },
    ok: function(selectedItems) {
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        Game.sendMessage(this._player, 'You drink %s.',[item.describeThe()]);
        this._player.quaff(item);
        return true;
    }
});
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
});
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
            this._player.unwear();
            Game.sendMessage(this._player, "You are not wearing anything.");
        } else {
            // Make sure to unequip the item first in case it is also being wielded as a weapon or something
            var item = selectedItems[keys[0]];
            this._player.unequip(item);
            this._player.wear(item);
            Game.sendMessage(this._player, "You are wearing %s.", [item.describeA()]);
        }
        return true;
    }
});
Game.Screen.quiverScreen = new Game.Screen.ItemListScreen({
    caption: "Choose the item you wish to quiver",
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin("Equippable") && item.isQuiverable();
    },
    ok: function(selectedItems) {
        // Check if we selected "no item"
        var keys = Object.keys(selectedItems);
        if(keys.length===0) {
            this._player.unquiver();
            Game.sendMessage(this._player, "Nothing is in your quiver.");
        } else {
            var item = selectedItems[keys[0]];
            this._player.unequip(item);
            this._player.quiver(item);
            Game.sendMessage(this._player, "You have %s in your quiver.", [item.describeA()]);
        }
        return true;
    }
});
Game.Screen.examineScreen = new Game.Screen.ItemListScreen({
    caption: "Choose the item you wish to examine",
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return true;
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        if(keys.length>0) {
            var item = selectedItems[keys[0]];
            Game.sendMessage(this._player, "It's %s.", // "It's %s (%s)" from back when we used item.details()
                //[item.describeA(false), item.details()])
                [item.describeA(false)])
        }
        return true;
    }
});

Game.Screen.gainStatScreen = {
    setup: function(entity) {
        // Must be called before rendering
        this._entity = entity;
        this._statOptions = entity.getStatOptions();
    },
    render: function(display) {
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        display.drawText(0,0,"Choose a stat to increase");
        // Iterate through each option
        for(var i=0; i<this._statOptions.length; i++) {
            display.drawText(0,2+i,
                letters.substring(i,i+1)+" - "+this._statOptions[i][0]);
        }
        // Show remaining stat points
        display.drawText(0,4+this._statOptions.length,"Remaining stat points: "+this._entity.getStatPoints());
    },
    handleInput: function(inputType,inputData) {
        if(inputType==="keydown") {
            // If letter pressed, check if it matches a valid option
            if(inputData.keyCode>=ROT.KEYS.VK_A && inputData.keyCode<=ROT.KEYS.VK_Z) {
                var index = inputData.keyCode - ROT.KEYS.VK_A;
                if(this._statOptions[index]) {
                    // Call the function to boost the stat
                    this._statOptions[index][1].call(this._entity);
                    // Decrease stat points
                    this._entity.setStatPoints(this._entity.getStatPoints()-1);
                    // If no stat points left, leave screen. Else, refresh.
                    if(this._entity.getStatPoints()==0) {
                        this._entity.setLevelUpEarned(false);
                        Game.Screen.playScreen.setSubscreen(undefined);
                    } else {
                        Game.refresh();
                    }
                }
            }
        }
    }
};
Game.Screen.characterScreen = {
    setup: function(entity) {
        this._entity = entity;
    },
    render: function(display) {
        // TODO: draw a pretty decorative border around the whole page
        var y=1;
        var titleString = this._entity.getName();
        if(this._entity.hasMixin("ExperienceGainer")) {
            titleString+=ROT.Util.format(", the level %s",this._entity.getLevel());
        }
        if(this._entity.hasMixin("RaceHaver")) {
            titleString+=ROT.Util.format(" %s",this._entity.getRace().name);
        }
        if(this._entity.hasMixin("Classy")) {
            titleString+=ROT.Util.format(" %s",this._entity.getCharClass().name);
        }
        var statString = "";
        if(this._entity.hasMixin("StatsHaver")) {
            statsString = ROT.Util.format("STR: %s END: %s AGI: %s INT: %s WIL: %s",
            this._entity.getStrength(),this._entity.getEndurance(),this._entity.getAgility(),
            this._entity.getIntelligence(),this._entity.getWillpower()); // TODO: change color if stats!=base stat (e.g. buffed/debuffed)
        }
        display.drawText(Game.getScreenWidth() / 2 - titleString.length / 2, y++, titleString);
        display.drawText(Game.getScreenWidth() / 2 - statsString.length / 2, y++, statsString);
        // Display skills
        y+=1;
        if(this._entity.hasMixin("SkillsHaver")) {
            var skills = this._entity.getSkills();
            for(var key in skills) {
                display.drawText(0,y++,ROT.Util.format("%s: %s",skills[key].name,skills[key].getSkillLevel()))
            }
        }
    },
    handleInput: function(inputType, inputData) {
        if(inputType==="keydown") {
            if((inputData.keyCode===ROT.KEYS.VK_ESCAPE) || (inputData.keyCode===ROT.KEYS.VK_RETURN)) {
                Game.Screen.playScreen.setSubscreen(undefined);
            }
        }
    }
}
// Target-based screens (look, fire, zap)
Game.Screen.TargetBasedScreen = function(template) {
    template = template || {};
    // By default, ok does nothing and does not consume a turn
    // CHANGED
    //this._isAcceptableFunction = template['okFunction'] || function(x,y) {return false;}
    this._okFunction = template['okFunction'] || function(x,y) {return false;}
    // Default caption function returns an empty string. Use for showing caption at the bottom of screen
    this._captionFunction = template['captionFunction'] || function(x,y) {return "";}
    this.handleInput = template['handleInput'] || function(inputType,inputData) {
        // Move the cursor
        if(inputType=="keydown") {
            if ((inputData.keyCode === ROT.KEYS.VK_LEFT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD4)) {
                this.moveCursor(-1,0);
            } else if ((inputData.keyCode === ROT.KEYS.VK_RIGHT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD6)) {
                this.moveCursor(1,0);
            } else if ((inputData.keyCode === ROT.KEYS.VK_UP) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD8)) {
                this.moveCursor(0,-1);
            } else if ((inputData.keyCode === ROT.KEYS.VK_DOWN) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD2)) {
                this.moveCursor(0,1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD7) {
                this.moveCursor(-1,-1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD9) {
                this.moveCursor(1,-1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD3) {
                this.moveCursor(1,1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD1) {
                this.moveCursor(-1,1);
            } else if(inputData.keyCode===ROT.KEYS.VK_RETURN) {
                this.executeOkFunction();
            }
        }
        Game.refresh();
    }
    this.setup = template['setup'] || function(player, startX, startY, offsetX, offsetY) {
        // FUTURE: Implement screen scrolling
        this._player = player;
        // Store original position. Subtract screen offset so we don't have to later
        this._startX = startX - offsetX;
        this._startY = startY - offsetY;
        // Store current cursor position
        this._cursorX = this._startX;
        this._cursorY = this._startY;
        // Store map offsets
        this._offsetX = offsetX;
        this._offsetY = offsetY;
        // Cache the FOV
        var visibleCells = {};
        this._player.getMap().getFov(this._player.getD()).compute(
            this._player.getX(), this._player.getY(),
            this._player.getSightRadius(),
            function(x,y,radius,visibility) {
                visibleCells[x+","+y] = true;
            });
        this._visibleCells = visibleCells;
    }
    this.render = template['render'] || function(display) {
        // Use playScreen to render
        Game.Screen.playScreen.renderTiles.call(Game.Screen.playScreen, display);
        
        /* BUG: removed for testing
        // Draw a line from start to cursor
        var points = Game.Geometry.getLine(this._startX, this._startY, this._cursorX, this._cursorY);
        //console.log(points);
        for(var i=0, l=points.length; i<l; i++) {
            display.drawText(points[i].x, points[i].y, "%c{magenta}*");
        }
        */

        // Only draw on the point we're targeting
        display.drawText(this._cursorX, this._cursorY, "%c{magenta}*");

        // Render caption at bottom
        display.drawText(0, Game.getScreenHeight()-2,
            this._captionFunction(this._cursorX+this._offsetX, this._cursorY+this._offsetY));
    }
    this.moveCursor = template['moveCursor'] || function(dx,dy) {
        // Ensure we stay within bounds
        this._cursorX = Math.max(0, Math.min(this._cursorX+dx, Game.getScreenWidth()));
        // Save the last line for the caption
        this._cursorY = Math.max(0, Math.min(this._cursorY+dy, Game.getScreenHeight()-1)); 
    }
};
Game.Screen.TargetBasedScreen.prototype.executeOkFunction = function() {
    // Switch back to play screen
    Game.Screen.playScreen.setSubscreen(undefined);
    // Call OK function and end player's turn if return true
    if(this._okFunction(this._cursorX+this._offsetX, this._cursorY+this._offsetY)) {
        this._player.getMap().getEngine().unlock();
    }
};
Game.Screen.lookScreen = new Game.Screen.TargetBasedScreen({
    captionFunction: function(x,y) {
        var d = this._player.getD();
        var map = this._player.getMap();
        // If tile is explored, give a better caption
        if(map.isExplored(x,y,d)) {
            // If tile explored, check if we can see it
            if(this._visibleCells[x+","+y]) {
                var items = map.getItemsAt(x,y,d);
                // Topmost item
                if(items) {
                    var item = items[items.length-1];
                    // TODO: fix formating
                    //return String.format("%s - %s",item.getRepresentation(),item.describeA(true));
                    return item.getRepresentation()+" - "+item.describeA(true);
                } 
                else if(map.getEntityAt(x,y,d)) {
                    // Else check if there's an entity (TODO: shouldn't we do this first?)
                    // TODO: Wouldn't it be faster to save the getEntity from the if() statement?
                    var entity = map.getEntityAt(x,y,d)
                    //return String.format("%s - %s",entity.getRepresentation(),entity.describeA(true));
                    return entity.getRepresentation()+" - "+entity.describeA(true);

                }
            }
            // If no entity/item visible, use tile information
            //return String.format("%s - %s", map.getTile(x,y,d).getRepresentation(), map.getTile(x,y,d).getDescription());
            return `${map.getTile(x,y,d).getRepresentation()} - ${map.getTile(x,y,d).getDescription()}`;
        } else {
            // If tile not explored, show null tile description
            //return String.format('%s - %s',Game.Tile.nullTile.getRepresentation(),Game.Tile.nullTile.getDescription());
            return `${Game.Tile.nullTile.getRepresentation()} - ${Game.Tile.nullTile.getDescription()}`;

        }
    },
    handleInput: function(inputType, inputData) {
        // Move the cursor
        if(inputType=="keydown") {
            if ((inputData.keyCode === ROT.KEYS.VK_LEFT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD4)) {
                this.moveCursor(-1,0);
            } else if ((inputData.keyCode === ROT.KEYS.VK_RIGHT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD6)) {
                this.moveCursor(1,0);
            } else if ((inputData.keyCode === ROT.KEYS.VK_UP) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD8)) {
                this.moveCursor(0,-1);
            } else if ((inputData.keyCode === ROT.KEYS.VK_DOWN) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD2)) {
                this.moveCursor(0,1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD7) {
                this.moveCursor(-1,-1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD9) {
                this.moveCursor(1,-1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD3) {
                this.moveCursor(1,1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD1) {
                this.moveCursor(-1,1);
            } else if(inputData.keyCode===ROT.KEYS.VK_RETURN) {
                this.executeOkFunction();
            }
        }
        Game.refresh();
    },
});
// Help screen TODO: Move the text into a better file for this?
Game.Screen.helpScreen = {
    render: function(display) {
        var text = "Help"
        var border = '--------------';
        var y=0;
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
        display.drawText(Game.getScreenWidth() / 2 - border.length / 2, y++, border);
        display.drawText(0, y++, 'You have been chosen to root out the evil lurking beneath the Everfree Forest.');
        display.drawText(0, y++, 'Descend into its depths and vanquish that which dwells below.');
        y += 3;
        display.drawText(0, y++, '[,] to pick up items');
        display.drawText(0, y++, '[C] to level up');
        display.drawText(0, y++, '[f] to fire a weapon');
        display.drawText(0, y++, '[d] to drop items');
        display.drawText(0, y++, '[e] to eat items');
        display.drawText(0, y++, '[w] to wield items');
        display.drawText(0, y++, '[W] to wield items');
        display.drawText(0, y++, '[x] to examine items');
        display.drawText(0, y++, '[;] to look around you');
        display.drawText(0, y++, '[?] to show this help screen');
        y += 3;
        text = '--- press any key to continue ---';
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
    },
    handleInput: function(inputType, inputData) {
        Game.Screen.playScreen.setSubscreen(undefined);
    }
};
// Character creation screens
Game.Screen.raceSelectionScreen = {
    _races: [],
    _selectedIndex: null,
    _selectedRace: null,
    enter: function() {
        // Populate array of races based on the enum
        var that = this;
        Object.keys(Game.Enums.Races.PonyRaces).forEach(function(race) {
            that._races.push(Game.Enums.Races.PonyRaces[race]);
        })
    },
    exit: function() {/*console.log("Exited race selection screen.");*/ },
    render: function(display) {
        text = "What race are you, courageous adventurer?"; // FUTURE: random epithet (brave/loyal...)
        var border = '--------------';
        var y=0;
        display.drawText(Game.getScreenWidth()/2-text.length/2,y++,text);
        display.drawText(Game.getScreenWidth() / 2 - border.length / 2, y++, border);

        var letters = 'abcdefghijklmnopqrstuvwxyz';
        for(var i=0; i<this._races.length; i++) {
            var letter = letters.substring(i,i+1);
            var selectionState = this._selectedIndex==i ? "+" : "-";
            display.drawText(0,2+y,letter+" "+selectionState+" "+this._races[i].name);
            y++;
        }
        // Print race description
        if(this._selectedIndex!=null) {
            var leftSide = 20;
            var topSide = 4;
            display.drawText(leftSide,topSide,this._races[this._selectedIndex].raceSelectionDescription);    
        }
    },
    handleInput: function(inputType, inputData) {
        if(inputType==="keydown") {
            if((inputData.keyCode===ROT.KEYS.VK_RETURN) && this._selectedRace!=null) {
                // If race selected, proceed to class selection screen
                Game.Screen.classSelectionScreen.setPreviousSelections(this._selectedRace);
                Game.switchScreen(Game.Screen.classSelectionScreen);
            }
            else if(inputData.keyCode>=ROT.KEYS.VK_A && inputData.keyCode<=ROT.KEYS.VK_Z) {
                var index = inputData.keyCode-ROT.KEYS.VK_A;
                if(this._races[index]) {
                    this._selectedIndex = index;
                    this._selectedRace = this._races[index];
                    // Redraw screen to show selection status
                    Game.refresh();
                }
            }
        }
    },
};
Game.Screen.classSelectionScreen = {
    _charClasses: [],
    _selectedIndex: null,
    _selectedCharClass: null,
    _selectedRace: null, // set by raceSelectionScreen TODO: Get cleaner method
    enter: function() {
        // Populate class array based on allowed races for each class
        var that = this;
        Object.keys(Game.Enums.CharClasses.PlayerClasses).forEach(function(charClass) {
            if(Game.Enums.CharClasses.PlayerClasses[charClass].races.includes(that._selectedRace)) {
                that._charClasses.push(Game.Enums.CharClasses.PlayerClasses[charClass]);
            }
        })
    },
    exit: function() { },
    render: function(display) {
        // FUTURE/TODO: fix a/an
        text = ROT.Util.format("What class will you choose, %s?",this._selectedRace.name);
        var border = '--------------';
        var y=0;
        display.drawText(Game.getScreenWidth()/2-text.length/2,y++,text);
        display.drawText(Game.getScreenWidth() / 2 - border.length / 2, y++, border);

        var letters = 'abcdefghijklmnopqrstuvwxyz';
        for(var i=0; i<this._charClasses.length; i++) {
            var letter = letters.substring(i,i+1);
            var selectionState = this._selectedIndex==i ? "+" : "-";
            display.drawText(0,2+y,letter+" "+selectionState+" "+this._charClasses[i].name);
            y++;
        }
    },
    handleInput: function(inputType, inputData) {
        if(inputType==="keydown") {
            if((inputData.keyCode===ROT.KEYS.VK_RETURN) && this._selectedCharClass!=null) {
                Game.Screen.nameSelectionScreen.setPreviousSelections(this._selectedRace,this._selectedCharClass);
                Game.switchScreen(Game.Screen.nameSelectionScreen);
            }
            else if(inputData.keyCode>=ROT.KEYS.VK_A && inputData.keyCode<=ROT.KEYS.VK_Z) {
                var index = inputData.keyCode-ROT.KEYS.VK_A;
                if(this._charClasses[index]) {
                    this._selectedIndex = index;
                    this._selectedCharClass = this._charClasses[index];
                    // Redraw screen to show selection status
                    Game.refresh();
                }
            }
        }
    },
    setPreviousSelections: function(race) {
        this._selectedRace = race;
    }
};
Game.Screen.nameSelectionScreen = {
    _selectedCharClass: null,
    _selectedRace: null,
    _name: "PLACEHOLDERNAME",
    enter: function() {
    },
    exit: function() { },
    render: function(display) {
        text = "Finally, what is your name?";
        var border = '--------------';
        var y=0;
        display.drawText(Game.getScreenWidth()/2-text.length/2,y++,text);
        display.drawText(Game.getScreenWidth() / 2 - border.length / 2, y++, border);
        
        var nameString = "%c{blue}"+this._name;
        display.drawText(4,2+y,nameString);
    },
    handleInput: function(inputType, inputData) {
        if(inputType==="keydown") {
            if((inputData.keyCode===ROT.KEYS.VK_RETURN) && this._name!=null) {
                Game.Screen.playScreen.createPlayer(this._name,this._selectedRace,this._selectedCharClass);
                Game.switchScreen(Game.Screen.playScreen);
            }
            else if(inputData.keyCode===ROT.KEYS.VK_BACK_SPACE) {
                this._name = this._name.slice(0,-1);
                Game.refresh();
            }
        }
        else if(inputType==="keypress") {
            var code = inputData.charCode;
            // a-z, A-Z
            if((code>=97 && code<=122) || (code>=65 && code<=90)) {
                var ch = String.fromCharCode(code);
                this._name+=ch;
                Game.refresh();
            }
        }
    },
    setPreviousSelections: function(race,charClass) {
        this._selectedRace = race;
        this._selectedCharClass = charClass;
    }
}
// Projectile weapon firing screen
Game.Screen.fireScreen = new Game.Screen.TargetBasedScreen( {
    captionFunction: function(x,y) {
        var d = this._player.getD();
        var map = this._player.getMap();
        // If tile is explored, give a better caption
        if(map.isExplored(x,y,d)) {
            // If tile explored, check if we can see it
            if(this._visibleCells[x+","+y]) {
                var items = map.getItemsAt(x,y,d);
                // Topmost item
                if(items) {
                    var item = items[items.length-1];
                    // TODO: fix formating
                    //return String.format("%s - %s",item.getRepresentation(),item.describeA(true));
                    return item.getRepresentation()+" - "+item.describeA(true);
                } 
                else if(map.getEntityAt(x,y,d)) {
                    // Else check if there's an entity (TODO: shouldn't we do this first?)
                    // TODO: Wouldn't it be faster to save the getEntity from the if() statement?
                    var entity = map.getEntityAt(x,y,d)
                    //return String.format("%s - %s",entity.getRepresentation(),entity.describeA(true));
                    return entity.getRepresentation()+" - "+entity.describeA(true);

                }
            }
            // If no entity/item visible, use tile information
            //return String.format("%s - %s", map.getTile(x,y,d).getRepresentation(), map.getTile(x,y,d).getDescription());
            return `${map.getTile(x,y,d).getRepresentation()} - ${map.getTile(x,y,d).getDescription()}`;
        } else {
            // If tile not explored, show null tile description
            //return String.format('%s - %s',Game.Tile.nullTile.getRepresentation(),Game.Tile.nullTile.getDescription());
            return `${Game.Tile.nullTile.getRepresentation()} - ${Game.Tile.nullTile.getDescription()}`;

        }
    },
    handleInput: function(inputType, inputData) {
        // Move the cursor
        if(inputType=="keydown") {
            if ((inputData.keyCode === ROT.KEYS.VK_LEFT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD4)) {
                this.moveCursor(-1,0);
            } else if ((inputData.keyCode === ROT.KEYS.VK_RIGHT) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD6)) {
                this.moveCursor(1,0);
            } else if ((inputData.keyCode === ROT.KEYS.VK_UP) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD8)) {
                this.moveCursor(0,-1);
            } else if ((inputData.keyCode === ROT.KEYS.VK_DOWN) || (inputData.keyCode === ROT.KEYS.VK_NUMPAD2)) {
                this.moveCursor(0,1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD7) {
                this.moveCursor(-1,-1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD9) {
                this.moveCursor(1,-1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD3) {
                this.moveCursor(1,1);
            } else if (inputData.keyCode === ROT.KEYS.VK_NUMPAD1) {
                this.moveCursor(-1,1);
            } else if(inputData.keyCode === ROT.KEYS.VK_ESCAPE) {
                this.executeOkFunction();
                return;
            } else if((inputData.keyCode===ROT.KEYS.VK_RETURN) || (inputData.keyCode===ROT.KEYS.VK_F)) {
                // Fire at the target
                var x = this._cursorX+this._offsetX;
                var y = this._cursorY+this._offsetY;
                if((x==this._player.getX()) && (y==this._player.getY())) {
                    Game.sendMessage(this._player, "Shooting yourself would not be prudent.");
                    this.executeOkFunction();
                    return;
                } else {
                    var d = this._player.getD();
                    var map = this._player.getMap();
                    target = map.getEntityAt(x,y,d);
                    if(target!=null && target.hasMixin("Destructible")) {
                        this._player.projectileAttack(target);
                        this.executeOkFunction();
                        // Unlock engine after firing
                        this._player.getMap().getEngine().unlock();
                        return;
                    }
                }
                this.executeOkFunction();
            }
            
            // TODO: else if ESC, cancel w/o using turn
        }
        Game.refresh();
    },
    setup: function(player, startX, startY, offsetX, offsetY) {
        // FUTURE: Implement screen scrolling
        this._player = player;
        // Store original position. Subtract screen offset so we don't have to later
        this._startX = startX - offsetX;
        this._startY = startY - offsetY;
        // Store current cursor position
        this._cursorX = this._startX;
        this._cursorY = this._startY;
        // Store map offsets
        this._offsetX = offsetX;
        this._offsetY = offsetY;
        // Cache the FOV
        var visibleCells = {};
        this._player.getMap().getFov(this._player.getD()).compute(
            this._player.getX(), this._player.getY(),
            this._player.getSightRadius(),
            function(x,y,radius,visibility) {
                visibleCells[x+","+y] = true;
            });
        this._visibleCells = visibleCells;

        // Get player's ranged weapon
        this._projectileLauncher = this._player.getProjectileLauncher();
        this._range = this._projectileLauncher.getRange();
        this._rangeSquared = this._range*this._range;
    },
    render: function(display) {
        // Use playScreen to render
        Game.Screen.playScreen.renderTiles.call(Game.Screen.playScreen, display);

        // Draw targeting cursor
        display.drawText(this._cursorX, this._cursorY, "%c{magenta}*");

        // TODO: Highlight areas within range

        // Render caption at bottom
        display.drawText(0, Game.getScreenHeight()-2,
            this._captionFunction(this._cursorX+this._offsetX, this._cursorY+this._offsetY));
    },
    moveCursor: function(dx,dy) {
        // Accounts for weapon range
        var distanceX = (this._cursorX+dx)-this._startX;
        var distanceY = (this._cursorY+dy)-this._startY;

        if((distanceX*distanceX + distanceY*distanceY) <= this._rangeSquared) {
            // Ensure we stay within bounds
            this._cursorX = Math.max(0, Math.min(this._cursorX+dx, Game.getScreenWidth()));
            // Save the last line for the caption
            this._cursorY = Math.max(0, Math.min(this._cursorY+dy, Game.getScreenHeight()-1)); 
        }
    }
})