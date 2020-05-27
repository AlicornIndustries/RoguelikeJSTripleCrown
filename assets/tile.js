// A tile has a glyph, info like isWalkable, isLava, etc., and how players can interact with the tile

Game.Tile = function(properties) {
    properties = properties || {};
    // Call Glyph constructor with our properties
    Game.Glyph.call(this, properties);
    // Set up the properties. Default to false.
    this._isWalkable = properties["isWalkable"] || false;
    this._isDiggable = properties["isDiggable"] || false;
};
Game.Tile.extend(Game.Glyph); // Tiles inherit from Game.Glyph

// Getters
Game.Tile.prototype.isWalkable = function() {
    return this._isWalkable;
}
Game.Tile.prototype.isDiggable = function() {
    return this._isDiggable;
}

// Define basic tiles
Game.Tile.nullTile = new Game.Tile(new Game.Glyph()); // Null object pattern. Returned whenever we try to access an out-of-bounds tile
Game.Tile.floorTile = new Game.Tile({
    character: ".",
    isWalkable: true
});
Game.Tile.wallTile = new Game.Tile({
    character: "#",
    foreground: "goldenrod",
    isDiggable: true
});