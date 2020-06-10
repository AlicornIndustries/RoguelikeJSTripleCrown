// Repository: set of named templates, e.g. Items or Monsters.

// Repos have name and constructor used to create items in the repository.
Game.Repository = function(name, ctor) {
    this._name = name;
    this._templates = {};
    this._randomTemplates = {}; // only randomly generate these. TODO: this seems inefficient
    this._ctor = ctor;
};

// Define a new named template
Game.Repository.prototype.define = function(name, template, options) {
    this._templates[name] = template;
    // Apply any options
    var disableRandomCreation = options && options['disableRandomCreation'];
    if(!disableRandomCreation) {
        this._randomTemplates[name] = template;
    }
};
// Create an object based on a template
Game.Repository.prototype.create = function(name, extraProperties) {
    // Ensure there is a template with the given name
    if(!this._templates[name]) {
        throw new Error("No template named '"+name+"'in repository '"+this._name+"'");
    }
    // Copy the template
    var template = Object.create(this._templates[name]);
    //OLD: var template = this._templates[name];
    if(extraProperties) {
        for(var key in extraProperties) {
            template[key] = extraProperties[key];
        }
    }
    // Create the object
    return new this._ctor(template);
};
// Create an object based on a random template in the repository
Game.Repository.prototype.createRandom = function() {
    var keys = Object.keys(this._randomTemplates); // Array of keys
    var randomKey = ROT.RNG.getItem(keys);
    var item = this.create(randomKey);
    return item;
    //return new this.create(randomKey); // doesn't work, because "this" is a bizarre keyword
}