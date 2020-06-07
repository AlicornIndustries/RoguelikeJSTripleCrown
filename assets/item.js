Game.Item = function(properties) {
    properties = properties || {};
    // Pass our properties to the Glyph constructor
    Game.Glyph.call(this, properties);
    this._name = properties["name"] || "defaultname";
};

// Items inherit all functionality from Glyphs
Game.Item.extend(Game.Glyph);