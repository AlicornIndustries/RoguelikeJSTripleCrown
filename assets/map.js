// Map: 2D array of Tiles. XY coords are indices in 1st [0] and 2nd [1] dimensions, e.g. tiles[x][y]

Game.Map = function(tiles) {
    this._tiles = tiles;
    // Cache width and height based on dimensions of tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;
};

// Getters
Game.Map.prototype.getWidth = function() { return this._width; }
Game.Map.prototype.getHeight = function() { return this._height; }
Game.Map.prototype.getTile = function(x,y,) {
    // If out of bounds, return null tile
    if(x<0 || x>= this._width || y<0 || y>= this._height) {
        return Game.Tile.nullTile;
    } else {
        return this._tiles[x][y] || Game.Tile.nullTile;
    }
}