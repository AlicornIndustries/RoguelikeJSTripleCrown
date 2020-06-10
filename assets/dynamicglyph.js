// Glyphs with mixin logic. Entity and Item classes extend DynamicGlyph
Game.DynamicGlyph = function(properties) {
    properties = properties || {};
    // Call constructor
    Game.Glyph.call(this, properties);
    // Instantiate properties from the passed object
    this._name = properties["name"] || "defaultname";
    
    this._attachedMixins = {};
    this._attachedMixinGroups = {};
    // Setup mixins
    var mixins = properties["mixins"] || [];
    for(var i=0; i<mixins.length; i++) {
        // Copy over all non-name, non-init properties from mixins
        // Don't override properties that already exist
        for(var key in mixins[i]) {
            if(key!="init" && key!="name" && !this.hasOwnProperty(key)) {
                this[key]=mixins[i][key];
            }
        }
        // Add the mixin's name to our attached mixins
        this._attachedMixins[mixins[i].name] = true;
        // If group name is present, add it.
        if(mixins[i].groupName) {
            this._attachedMixinGroups[mixins[i].groupName] = true;
        }
        // Finally, call init of mixin
        if(mixins[i].init) {
            mixins[i].init.call(this,properties);
        }
    }
};
// Dynamic glyphs inherit all functionality from Glyphs
Game.DynamicGlyph.extend(Game.Glyph);

Game.DynamicGlyph.prototype.hasMixin = function(obj) {
    // Allow passing the mixin itself or its name/group name as a string
    if (typeof obj === "object") {
        return this._attachedMixins[obj.name];
    } else {
        return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
};
Game.DynamicGlyph.prototype.setName = function(name) {this._name = name;};
Game.DynamicGlyph.prototype.getName = function() {return this._name;}
Game.DynamicGlyph.prototype.describe = function() {return this._name;}
Game.DynamicGlyph.prototype.describeA = function(capitalize) {
    // "a rock", "An apple." Capitalize article if true
    var prefixes = capitalize ? ['A', 'An'] : ['a','an'];
    var nameString = this.describe();
    var firstLetter = nameString.charAt(0).toLowerCase();
    // If word starts wit a vowel, use a. Else, an. Does not handle e.g. "hour"
    var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
    return prefixes[prefix]+" "+nameString;
};
Game.DynamicGlyph.prototype.describeThe = function(capitalize) {
    var prefix = capitalize ? "The" : "the";
    return prefix+" "+this.describe();
}