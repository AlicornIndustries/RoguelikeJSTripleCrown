Game.Item = function(properties) {
    properties = properties || {};
    // Pass our properties to the DynamicGlyph constructor
    Game.DynamicGlyph.call(this, properties);
};

// Items inherit all functionality from DynamicGlyphs
Game.Item.extend(Game.DynamicGlyph);