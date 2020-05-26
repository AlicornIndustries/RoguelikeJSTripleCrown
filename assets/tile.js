// A tile has a glyph, info like isWalkable, isLava, etc., and how players can interact with the tile

Game.Tile = function(glyph) {
    this._glyph = glyph;
}

Game.Tile.prototype.getGlyph = function() {
    return this._glyph;
}

// Define basic tiles
Game.Tile.nullTile = new Game.Tile(new Game.Glyph()); // Null object pattern. Returned whenever we try to access an out-of-bounds tile
Game.Tile.floorTile = new Game.Tile(new Game.Glyph("."));
Game.Tile.wallTile = new Game.Tile(new Game.Glyph("#", "goldenrod"));