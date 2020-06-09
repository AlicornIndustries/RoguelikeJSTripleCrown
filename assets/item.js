Game.Item = function(properties) {
    properties = properties || {};
    // Pass our properties to the Glyph constructor
    Game.Glyph.call(this, properties);
    this._name = properties["name"] || "defaultname";
};

// Items inherit all functionality from Glyphs
Game.Item.extend(Game.Glyph);

Game.Item.prototype.describe = function() {
    return this._name;
}
Game.Item.prototype.describeA = function(capitalize) {
    // "a rock", "An apple." Capitalize article if true
    var prefixes = capitalize ? ['A', 'An'] : ['a','an'];
    var nameString = this.describe();
    var firstLetter = nameString.charAt(0).toLowerCase();
    // If word starts wit a vowel, use a. Else, an. Does not handle e.g. "hour"
    var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
    return prefixes[prefix]+" "+nameString;
}