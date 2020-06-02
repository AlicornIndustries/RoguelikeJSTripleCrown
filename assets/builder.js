Game.Builder = function(width, height, depth) {
    this._width = width;
    this._height = height;
    this._depth = depth;
    this._tiles = new Array(depth);
    this._regions = new Array(depth); // A region is a connected group of walkable tiles that can be reached without digging
    // Instantiate arrays as multi-dimensional
    // Uses d instead of z (in case we want to later use z for different elevations in a single level)
    for (var d=0; d<depth; d++) {
        // Create a new map at each depth level
        this._tiles[d] = this._generateLevel();
        // Setup regions array for each depth. TODO: only if levelType===Cellular
        this._regions[d] = new Array(width);
        for(var x=0; x<width; x++) {
            this._regions[d][x] = new Array(height);
            // Fill with zeroes
            for(var y=0; y<height; y++) {
                this._regions[d][x][y] = 0;
            }
        }
    }
    for(var d=0; d<this._depth; d++) {
        this._setupRegions(d);
    }
    this._connectAllRegions();
};

Game.Builder.prototype.getTiles = function () {
    return this._tiles;
}
Game.Builder.prototype.getDepth = function () {
    return this._depth;
}
Game.Builder.prototype.getWidth = function () {
    return this._width;
}
Game.Builder.prototype.getHeight = function () {
    return this._height;
}

// TODO: expand to take map type as input (Cellular, Dungeon, etc)
Game.Builder.prototype._generateLevel = function() {
    // Create an empty map
    var map = new Array(this._width);
    for (var w=0; w<this._width; w++) {
        map[w] = new Array(this._height);
    }
    // Setup cave generator
    var generator = new ROT.Map.Cellular(this._width, this._height);
    generator.randomize(0.5); // Probability of random cell being 1 (floor)
    var totalIterations = 3; // Loop over the generator a few times to smooth it out
    for (var i=0; i<totalIterations-1;i++) {
        generator.create();
    }
    // Smooth one last time, then update the map
    generator.create(function(x,y,v) {
        if(v===1) { // If the generator has a 1 for that tile, it's floor
            map[x][y] = Game.Tile.floorTile;
        } else {
            map[x][y] = Game.Tile.wallTile;
        }
    });
    return map;
};
Game.Builder.prototype._canFillRegion = function(x,y,d) {
    // Checks if tile is walkable and not already assigned to a region.
    // TODO: the name of this function is not very explanatory. Change it? See Part 7.
    // Ensure tile is within bounds
    if (x < 0 || y < 0 || d < 0 || x >= this._width || y >= this._height || d >= this._depth) {
        return false;
    }
    // Ensure tile is not already assigned to a region
    if(this._regions[d][x][y] != 0) {
        return false;
    }
    return this._tiles[d][x][y].isWalkable();
}
Game.Builder.prototype._fillRegion = function(region, x, y, d) {
    var tilesFilled = 1;
    var tiles = [{x:x, y:y}];
    var tile;
    var neighbors;
    // Update the region of the original tile
    this._regions[d][x][y] = region;
    // Loop over all tiles to process
    while(tiles.length>0) {
        tile = tiles.pop();
        neighbors = Game.getNeighborPositions(tile.x, tile.y);
        // Check if each neighbor can fill (is walkable and not already assigned to a region)
        // If so, update the region and add the neighbor tile to the list to process
        while(neighbors.length>0) {
            tile = neighbors.pop();
            if(this._canFillRegion(tile.x, tile.y, d)) {
                this._regions[d][tile.x][tile.y] = region;
                tiles.push(tile);
                tilesFilled++;
            }
        } 
    }
    return tilesFilled; // Return number of tiles filled in region
}
Game.Builder.prototype._removeRegion = function(region, d) {
    // Fills all tiles in depth's region with wall tiles
    for(var x=0; x<this._width; x++) {
        for(var y=0; y<this._height; y++) {
            if(this._regions[d][x][y] == region) {
                // Clear region and set the tile to a wall tile
                this._regions[d][x][y] = 0;
                this._tiles[d][x][y] = Game.Tile.wallTile;
            }
        }
    }
}
Game.Builder.prototype._setupRegions = function(d) {
    var region = 1;
    var tilesFilled;
    // Iterate through all tiles searching for one that can be used as the starting point for a flood fill
    for(var x=0; x<this._width; x++) {
        for(var y=0; y<this._height; y++) {
            if(this._canFillRegion(x,y,d)) {
                // Try to fill
                tilesFilled = this._fillRegion(region,x,y,d);
                // If too small, simply remove it. TODO: Make the size configurable easier
                var minRegionSize = 20;
                if(tilesFilled<=minRegionSize) {
                    this._removeRegion(region,d);
                } else {
                    region++;
                }
            }
        }
    }
}
Game.Builder.prototype._findRegionOverlaps = function(d, r1, r2) {
    // Returns list of points that overlap between a region at depth d and a region one level below it
    var matches = [];
    for(var x=0; x<this._width; x++) {
        for(var y=0; y<this._height; y++) {
            if(this._tiles[d][x][y] == Game.Tile.floorTile && this._tiles[d+1][x][y] == Game.Tile.floorTile && this._regions[d][x][y] == r1 && this._regions[d+1][x][y] == r2) {
                matches.push({x:x, y:y});
            }
        }
    }
    return ROT.RNG.shuffle(matches);

}
Game.Builder.prototype._connectRegions = function(d, r1, r2) {
    // Tries to connect two regions across depth d and d+1 by placing stairs at an overlap
    var overlap = this._findRegionOverlaps(d,r1,r2);
    if(overlap.length==0) {
        return false;
    }
    // Select the first tile from the overlap and make it a stair
    var point = overlap[0];
    this._tiles[d][point.x][point.y] = Game.Tile.stairsDownTile;
    this._tiles[d+1][point.x][point.y] = Game.Tile.stairsUpTile;
    return true;
}
Game.Builder.prototype._connectAllRegions = function() {
    // Tries to connect all regions across all depth levels, starting from the top.
    for(var d=0; d<this._depth-1; d++) {
        // Iterate through all tiles. If we haven't tried to connect that tile's region between depths, try to do so.
        var connected = {};
        var key;
        for(var x=0; x<this._width; x++) {
            for(var y=0; y<this._height; y++) {
                key = this._regions[d][x][y] + "," + this._regions[d+1][x][y];
                if(this._tiles[d][x][y] == Game.Tile.floorTile && this._tiles[d+1][x][y] == Game.Tile.floorTile && !connected[key]) {
                    // Both tiles are floors and not already connected, so connect them now.
                    this._connectRegions(d, this._regions[d][x][y], this._regions[d+1][x][y]);
                    connected[key] = true;
                }
            }
        }
    }
}