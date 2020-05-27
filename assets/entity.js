// Entity: position, glyph, name, can have other things, too. E.g. the player, an item on the ground, a creature
// Use the mixin pattern: small functions/etc to add to entities to grant behaviors, e.g. mobile, openable (contains other items)

Game.Entity = function(properties) {
    properties = properties || {};
    Game.Glyph.call(this, properties);
    // Instantiate properties from the passed object.
    this._name = properties["name"] || "";
    this._x = properties["x"] || 0;
    this._y = properties["y"] || 0;
    this._map = null; // Entities have an attached map
    
    this._attachedMixins = {}; // Keep track of mixins based on name property
    this._attachedMixinGroups = {}; // Likewise, for groups (e.g. different kinds of Mobile, like Flying, Ghost, Digging)

    // Setup mixins
    var mixins = properties["mixins"];
    for (i=0; i<mixins.length; i++) {
        // Copy over all non-name, non-init properties. Don't override existing properties.
        for (var key in mixins[i]) {
            if (key !="init" && key != "name" && !this.hasOwnProperty(key)) {
                this[key] = mixins[i][key];
            }
        }
        // Add mixin name to our attached mixins
        this._attachedMixins[mixins[i].name] = true;
        // If it has a group name, add it
        if (mixins[i].groupName) {
            this._attachedMixinGroups[mixins[i].groupName] = true;
        }
        // Finally, call init of mixin, if there is one
        if (mixins[i].init) {
            mixins[i].init.call(this, properties);
        }
    }
}
Game.Entity.extend(Game.Glyph);

// Getters, setters
Game.Entity.prototype.setName = function(name) {this._name = name; }
Game.Entity.prototype.setX = function(x) {this._x = x;}
Game.Entity.prototype.setY = function(y) {this._y = y;}
Game.Entity.prototype.getName = function() {return this._name;}
Game.Entity.prototype.getX = function() {return this._x;}
Game.Entity.prototype.getY   = function() {return this._y;}
Game.Entity.prototype.setMap = function(map) {this._map = map};
Game.Entity.prototype.getMap = function(map) {return this._map};

Game.Entity.prototype.hasMixin = function(obj) {
    // Allow passing the mixin itself or its name/group name as a string
    if (typeof obj == "object") {
        return this._attachedMixins[obj.name];
    } else {
        return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
}

