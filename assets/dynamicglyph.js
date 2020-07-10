// Glyphs with mixin logic. Entity and Item classes extend DynamicGlyph
Game.DynamicGlyph = function(properties) {
    properties = properties || {};
    // Call constructor
    Game.Glyph.call(this, properties);
    // Instantiate properties from the passed object
    this._name = properties["name"] || "defaultname";
    
    this._attachedMixins = {};
    this._attachedMixinGroups = {};
    this._listeners = {};

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
        // Add listeners
        if(mixins[i].listeners) {
            for(var key in mixins[i].listeners) {
                // If we don't already track a key for this event in listeners array, add it
                if(!this._listeners[key]) {
                    this._listeners[key] = [];
                }
                // Add the listener, if we don't already know about it
                if(this._listeners[key].indexOf(mixins[i].listeners[key]===-1)) {
                    this._listeners[key].push(mixins[i].listeners[key]);
                }
            }
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
Game.DynamicGlyph.prototype.describe = function() {
    var prefix = "";
    var name = this._name;
    // If the item is stackable, mention the count ("100 arrows")
    if(this.hasMixin("Stackable")) {
        prefix+= (this.getStackSize()+" ");
        if(this.getStackSize()>1) {
            name+="s"; // TODO: have a pluralName system, optional, defaults to +"s"
        }
    }
    // If item has a material, mention it ("steel longsword")
    if(this.hasMixin("MaterialHaver")) {
        // A wood staff is a "wooden" staff
        if(this._material.adj!=null) {
            prefix+= this._material.adj;
        }
        else {
            prefix+= this._material.name;
        }
    }
    return prefix+" "+name;
}
Game.DynamicGlyph.prototype.describeA = function(capitalize) {
    // "a rock", "An apple." Capitalize article if true
    var prefixes = capitalize ? ['A', 'An'] : ['a','an'];
    var nameString = this.describe();
    var firstLetter = nameString.charAt(0).toLowerCase();
    // If word starts with a vowel, use a. Else, an. Does not handle e.g. "hour"
    var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
    return prefixes[prefix]+" "+nameString;
};
Game.DynamicGlyph.prototype.describeThe = function(capitalize) {
    var prefix = capitalize ? "The" : "the";
    return prefix+" "+this.describe();
};
Game.DynamicGlyph.prototype.raiseEvent = function(event) {
    // Sig: raiseEvent(eventName, arg1, arg2...argn)
    // Ensure we have a listener
    if(!this._listeners[event]) {
        return;
    }
    // Extract an args passed, removing the event name
    var args = Array.prototype.slice.call(arguments, 1);
    // Invoke each listener, with this entity as context, and the args
    /* REMOVED: I think this .apply is doubling up the one in the for loop below
    for(var i=0; i<this._listeners[event].length; i++) {
        this._listeners[event][i].apply(this,args);
    }
    */
    // Invoke each listener to see if they have something to return
    var results = [];
    for(var i=0; i<this._listeners[event].length; i++) {
        results.push(this._listeners[event][i].apply(this, args));
    }
    return results;
};
Game.DynamicGlyph.prototype.details = function() {
    // TODO: This doesn't work; even if I confirm the details function has the right stuff, it always returns an empty array
    var details = [];
    var detailGroups = this.raiseEvent('details');
    console.log(detailGroups);
    // Iterate through each returned value, grabbing details
    if(detailGroups) {
        for(var i=0; i<detailGroups.length; i++) {
            for(var j=0; j<detailGroups[i].length; i++) {
                details.push(detailGroups[i][j].key+": "+detailGroups[i][j].value);
            }
        }
    }
    console.log(details.join(", "));
    return details.join(", ");
    // TODO: Provide some kind of sort order
    // Probably hardcode it somewhere, group combat stats in order
    // Probably best to have the mixin know the correct order, and just return in that format.
}