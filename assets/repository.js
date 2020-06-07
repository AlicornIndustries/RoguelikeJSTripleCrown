// Repository: set of named templates, e.g. Items or Monsters.

// Repos have name and constructor used to create items in the repository.
Game.Repository = function(name, ctor) {
    this._name = name;
    this._templates = {};
    this._ctor = ctor;
};

// Define a new named template
Game.Repository.prototype.define = function(name, template) {
    this._templates[name] = template;
};
// Create an object based on a template
Game.Repository.prototype.create = function(name) {
    // Ensure there is a template with the given name
    var template = this._templates[name];
    if(!template) {
        throw new Error("No template named '"+name+"'in repository '"+this._name+"'");
    }
    // Create the object
    return new this._ctor(template);
};
// Create an object based on a random template in the repository
Game.Repository.prototype.createRandom = function() {
    var keys = Object.keys(this._templates); // Array of keys
    var randomKey = ROT.RNG.getItem(keys);
    var item = this.create(randomKey);
    return item;
    //return new this.create(randomKey); // doesn't work, because "this" is a bizarre keyword
}