Game.EntityMixins = {};

// All Actor group mixins are scheduled
Game.EntityMixins.PlayerActor = {
    name: "PlayerActor",
    groupName: "Actor",
    act: function() {
        // Detect if game is over
        if(this.getHp() <= 0 ) {
            Game.Screen.playScreen.setGameEnded(true);
            Game.sendMessage(this, "You have died... Press [ENTER] to continue.");
        }
        // Re-render the screen on your turn
        Game.refresh();
        // Lock the engine, wait async for player input
        this.getMap().getEngine().lock();
        // Clear message queue
        this.clearMessages();
    }
}

Game.EntityMixins.Sight = { // Can see with given radius
    name: "Sight",
    groupName: "Sight",
    init: function(template) {
        this._sightRadius = template["sightRadius"] || 5;
    },
    getSightRadius: function() {
        return this._sightRadius;
    }
}

Game.EntityMixins.FungusActor = {
    name: "FungusActor",
    groupName: "Actor",
    init: function() {
        this._growthsRemaining = 5;
    },
    act: function() {
        // console.log("Fungus is trying to act at: "+this.getX()+","+this.getY()+". It has "+this._growthsRemaining+" growths remaining.");
        // Random chance to spread
        if(this._growthsRemaining>0) {
            var growthChance = 0.02 // Not exact, since can't grow on own tile
            if(Math.random() <= growthChance) {
                // Coords of random adj tile. Generate offset of [-1 0 1] by picking random number 0~2, then subtracting 1
                var xOffset = Math.floor(Math.random() * 3) - 1;
                var yOffset = Math.floor(Math.random() * 3) - 1;
                // Can't spawn on our own tile
                if (xOffset!=0 || yOffset!=0) {
                    // Grow
                    if(this.getMap().isEmptyFloor(this.getX()+xOffset, this.getY()+yOffset, this.getD())) {
                        var entity = Game.EntityRepository.create("fungus");
                        entity.setPosition(this.getX()+xOffset, this.getY()+yOffset, this.getD());
                        this.getMap().addEntity(entity);
                        this._growthsRemaining--;
                    }
                }
            }
        }
    }
}

Game.EntityMixins.WanderActor = { // Wanders randomly
    name: "WanderActor",
    groupName: "Actor",
    act: function() {
        // Pick a random direction x,y to move in
        var dirn = ROT.RNG.getItem(ROT.DIRS["8"]);
        this.tryMove(this.getX()+dirn[0], this.getY()+dirn[1], this.getD());
    }
}

// TODO: Make an alternate Destructible setup for entities with only armor (no HP), like living statues
Game.EntityMixins.Destructible = {
    // Creatures, etc. Has HP.
    name: "Destructible",
    init: function(template) {
        this._maxHp = template["maxHp"] || 1;
        this._hp = template["hp"] || this._maxHp;

        // Armor system. Probably redo this later.
        this._armorDurability = template["armorDurability"] || 0;
        this._armorReduction = template["armorReduction"] || 0;
        // TODO: Armor coverage
        
        // Defense (dodge) values
        this._defenseValue = template["defenseValue"] || 0;
    },
    getHp: function() {
        return this._hp;
    },
    getMaxHp: function() {
        return this._maxHp;
    },
    getDefenseValue: function() {
        // TODO: function should take damageType as input
        return this._defenseValue;
    },
    takeDamage: function(attacker, damage) {
        this._hp -= damage;
        if(this._hp<=0) {
            Game.sendMessage(attacker,"You destroy the %s!",[this.getName()]);
            Game.sendMessage(this, "You die!");
            this.die();
        }
    },
    die: function() {
        if(this.hasMixin(Game.EntityMixins.PlayerActor)) {
            this.act(); // handles the game ending
        } else {
            this.getMap().removeEntity(this); // Non-players just die.
        }
    }
}

Game.EntityMixins.Attacker = {
    name: "Attacker",
    groupName: "Attacker",
    init: function(template) {
        this._attackValue = template["attackValue"] || 1;
    },
    attack: function(target) { // TODO: also take weapon used as input?
        // Only works on destructibles
        if(target.hasMixin("Destructible")) {
            var attackValue = this.getAttackValue();
            var defenseValue = target.getDefenseValue();
            // Clamp between 10% and 90%
            var hitChance = Math.min(Math.max(attackValue-defenseValue, 10),90);
            var roll = ROT.RNG.getPercentage();
            if (hitChance >= roll) {
                // Hit
                var damage = 1; // TODO: Flat 1 damage for now
                Game.sendMessage(this, "You strike the %s for %d damage!",[target.getName(), damage]);
                Game.sendMessage(target, "The %s strikes you for %d damage!",[this.getName(),damage]);
                target.takeDamage(this, damage); 

            } else {
                // Miss
                Game.sendMessage(this, "You miss the %s.", [target.getName()]);
                Game.sendMessage(target, "The %s misses you.", [this.getName()]);

            }
            // FUTURE: On miss, drain opponent's stamina or some other "Dodge Meter?"      
        }
    },
    getAttackValue: function() {
        return this._attackValue;
    }
}

Game.EntityMixins.MessageRecipient = {
    name: "MessageRecipient",
    init: function(template) {
        this._messages = []; // Other entities fill up message queue
    },
    receiveMessage: function(message) {
        this._messages.push(message);
    },
    getMessages:  function() {
        return this._messages;
    },
    clearMessages: function() {
        this._messages = [];
    }
}
Game.sendMessage = function(recipient, message, args) {
    if(recipient.hasMixin(Game.EntityMixins.MessageRecipient)) {
        // If args passed, format message.
        if(args) {
            message = vsprintf(message,args);
        }
        recipient.receiveMessage(message);
    }
}
Game.sendMessageNearby = function(map, centerX, centerY, radius, message, args) {
    if(args) {
        message = vsprintf(message, args);
    }
    // Get nearby entities, sendMessage to each of them
    entities = map.getEntitiesWithinRadius(centerX, centerY, radius);
    for(var i=0; i<entities.length; i++) {
        if(entities[i].hasMixin(Game.EntityMixins.MessageRecipient)) {
            entities[i].receiveMessage(message);
        }
    }
}

Game.EntityMixins.InventoryHolder = {
    name:"InventoryHolder",
    init: function(template) {
        var inventorySlots = template['inventorySlots'] || 10;
        this._items = new Array(inventorySlots);
    },
    getItems: function() {
        return this._items;
    },
    getItem: function(i) {
        return this._items[i];
    },
    addItem: function(item) {
        // Try to find a slot
        for(var i=0; i<this._items.length; i++) {
            if(!this._items[i]) {
                this._items[i] = item;
                return true;
            }
        }
        return false; // No empty slot found
    },
    removeItem: function(i) {
        this._items[i] = null;
    },
    canAddItem: function() {
        // Check if we have an empty slot
        for(var i=0; i<this._items.length; i++) {
            if(!this._items[i]) {
                return true;
            }
        }
        return false;
    },
    pickupItems: function(indices) {
        // Pick up all items at our position. Indices for array returned by map.getItemsAt
        var mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getD());
        var added = 0; // number of items added
        // Iterate through all indices
        for(var i=0; i<indices.length; i++) {
            // Try to add. If inventory not full, splice item out of list of items.
            if(this.addItem(mapItems[indices[i]-added])) {
                mapItems.splice(indices[i]-added, 1);
                added++;
            } else {
                // Inventory is full
                break;
            }
        }
        // Update map items
        this._map.setItemsAt(this.getX(), this.getY(), this.getD(), mapItems);
        // True only if we added all items
        return added===indices.length;
    },
    dropItem: function(i) {
        // Drop item on current map tile
        if(this._items[i]) {
            if(this._map) {
                this._map.addItem(this.getX(), this.getY(), this.getD(), this._items[i]);
            }
            this.removeItem(i);
        }
    }
}