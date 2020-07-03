// Entity: position, glyph, name, can have other things, too. E.g. the player, an item on the ground, a creature
// Use the mixin pattern: small functions/etc to add to entities to grant behaviors, e.g. mobile, openable (contains other items)

Game.Entity = function(properties) {
    properties = properties || {};
    Game.DynamicGlyph.call(this, properties);
    // Instantiate properties from the passed object.
    this._name = properties["name"] || "";
    this._x = properties["x"] || 0;
    this._y = properties["y"] || 0;
    this._d = properties["d"] || 0; // depth
    this._map = null; // Entities have an attached map
    this._alive = true;
    // Speed for scheduler
    this._speed = properties["speed"] || 1000;
}
Game.Entity.extend(Game.DynamicGlyph);

// Getters, setters
Game.Entity.prototype.setX = function(x) {this._x = x;}
Game.Entity.prototype.setY = function(y) {this._y = y;}
Game.Entity.prototype.setD = function(d) {this._d = d;}
Game.Entity.prototype.setName = function(name) {this._name = name};
Game.Entity.prototype.setMap = function(map) {this._map = map;}
Game.Entity.prototype.setPosition = function(x,y,d) {
    var oldX = this._x;
    var oldY = this._y;
    var oldD = this._d;
    // Update position    
    this._x = x;
    this._y = y;
    this._d = d;
    // If on a map, tell the map we moved
    if(this._map) {
        this._map.updateEntityPosition(this, oldX, oldY, oldD);
    }
}
Game.Entity.prototype.setSpeed = function(speed) {
    this._speed = speed;
}
Game.Entity.prototype.getX = function() {return this._x;}
Game.Entity.prototype.getY = function() {return this._y;}
Game.Entity.prototype.getD = function() {return this._d;}
Game.Entity.prototype.getKey = function() {
    return this.getX()+","+this.getY()+","+this.getD();
}
Game.Entity.prototype.getMap = function() {return this._map;}
Game.Entity.prototype.isAlive = function() {return this._alive;}
Game.Entity.prototype.getSpeed = function() {
    return this._speed;
}
Game.Entity.prototype.kill = function(message) {
    // You cannot kill that which already lies beyond the grave.
    if(!this._alive) {
        return;
    }
    this._alive = false;
    if(message) {
        Game.sendMessage(this,message);
    } else {
        Game.sendMessage(this,"You have died.");
    }

    // Check if player died. If so, call their act() to prompt user.
    if(this.hasMixin(Game.EntityMixins.PlayerActor)) {
        this.act();
    } else {
        this.getMap().removeEntity(this);
    }
}
Game.Entity.prototype.tryMove = function(x,y,d,map) {
    // True if successful move/attack
    var map = this.getMap();
    var tile = map.getTile(x,y,this.getD());
    var target = map.getEntityAt(x,y,this.getD());
    // If we're targeting a different depth level, check if we're on stairs
    if(d<this.getD()) {
        if(tile != Game.Tile.stairsUpTile) {
            Game.sendMessage(this, "You can't go up here!");
            return false;
        } else {
            Game.sendMessage(this, "You ascend to level %d!", [d+1]); // +1 because zero-indexed
            this.setPosition(x,y,d);
            return true;
        }
    } else if(d>this.getD()) {
        if(tile===Game.Tile.holeToCavernTile && this.hasMixin(Game.EntityMixins.PlayerActor)) {
            // Switch entity to a different map, the boss cavern
            // FUTURE: rebuild this for the other possible maps
            this.switchMap(new Game.Map.BossCavern);
        } else if(tile != Game.Tile.stairsDownTile) {
            Game.sendMessage(this, "You can't go down here!");
            return false;
        } else {
            this.setPosition(x,y,d);
            Game.sendMessage(this, "You descend to level %d!", [d+1]);
            return true;
        }
    } else if(target) { // If an entity is present at the target tile
        // If we are an attacker, try to attack
        // Can only attack if we have Attacker and either we are the player or our target is the player (to avoid monsters attacking each other)
        // TODO: Replace with factions system.
        if(this.hasMixin("Attacker") && (this.hasMixin(Game.EntityMixins.PlayerActor) || target.hasMixin(Game.EntityMixins.PlayerActor))) {
            this.attack(target);
            return true;
        } else {
            return false; // Nothing we can do, but we can't move there
        }
    } else if (tile.isWalkable()) { // If no other entity there, check if we can move there
        // Update our position
        this.setPosition(x,y,d);
        // If there are items on the tile, send message
        var items=this.getMap().getItemsAt(x,y,d);
        if(items) {
            if(items.length===1) {
                if(items[0].hasMixin("Stackable")) {
                    Game.sendMessage(this,"There is a stack of %s on the floor.",[items[0].describe()])
                } else {
                    Game.sendMessage(this,"There is %s on the floor.",[items[0].describeA()]);
                }
            } else {
                Game.sendMessage(this, "There are several objects here.");
            }
        }
        return true;
    } else if (tile.isDiggable()) {
        map.dig(x,y,d);
        return true;
    }
    return false;
}
Game.Entity.prototype.switchMap = function(newMap) {
    if(newMap===this.getMap()) {
        return;
    }
    this.getMap().removeEntity(this);
    // Clear position
    this._x=0; this._y=0; this._d=0;
    // Add to new map
    newMap.addEntity(this);
}