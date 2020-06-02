// Map: 2D array of Tiles. XY coords are indices in 1st [0] and 2nd [1] dimensions, e.g. tiles[x][y]

Game.Map = function(tiles, player) {
    this._tiles = tiles;
    // Cache based on dimensions
    this._depth = tiles.length;
    this._width = tiles[0].length;
    this._height = tiles[0][0].length;
    // Setup FOV
    this._fov = [];
    this.setupFov();
    // Create list to hold entities on the map
    this._entities = [];
    // Create engine and scheduler
    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);
    // Add the player
    this.addEntityAtRandomPosition(player,0);
    // Add random fungi
    for(var d=0; d<this._depth; d++) {
        for (var i=0; i<25; i++) {
            //this.addEntityAtRandomPosition(new Game.Entity(Game.FungusTemplate));
            this.addEntityAtRandomPosition(new Game.Entity(Game.FungusTemplate), d);
        }
    }

    // Setup the explored array
    this._explored = new Array(this._depth);
    this._setupExploredArray();
};

// Getters
Game.Map.prototype.getWidth = function() { return this._width; }
Game.Map.prototype.getHeight = function() { return this._height; }
Game.Map.prototype.getDepth = function() {return this._depth;}
Game.Map.prototype.getTile = function(x,y,d) {
    // If out of bounds, return null tile
    if(x<0 || x>= this._width || y<0 || y>= this._height || d<0 || d>=this._depth) {
        return Game.Tile.nullTile;
    } else {
        return this._tiles[d][x][y] || Game.Tile.nullTile;
    }
}
Game.Map.prototype.getRandomFloorPosition = function(d) {
    // Random tile on level d that is a floor and does not have an entity
    var x, y;
    do {
        x = Math.floor(Math.random() * this._width);
        y = Math.floor(Math.random() * this._height); // Guide has width, which I believe is a typo
    } while (!this.isEmptyFloor(x,y,d));
    return {x: x, y: y, d: d};
}
Game.Map.prototype.getEngine = function() { return this._engine; }
Game.Map.prototype.getEntities = function() { return this._entities; }
Game.Map.prototype.getEntityAt = function(x,y,d) {
    // Iterate through all entities on the map, looking for one with matching position
    // TODO: Should tiles know what entities are on them, to speed this up?
    for (var i=0; i<this._entities.length; i++) {
        if (this._entities[i].getX() == x && this._entities[i].getY() == y && this._entities[i].getD() == d) {
            return this._entities[i];
        }
    }
    return false;
}
Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, radius) {
    // This is actually a square, not a circle.
    // Unlike the tutorial, this does *not* work across depth levels.
    results = [];
    // Determine bounds
    var leftX = centerX - radius;
    var rightX = centerX + radius;
    var topY = centerY - radius;
    var bottomY = centerY + radius;
    // Iterate through entities, adding all within bounds. TODO: Wildly inefficient, will be replaced later.
    for(var i=0; i<this._entities.length; i++) {
        if (this._entities[i].getX() >= leftX &&
            this._entities[i].getX() <= rightX && 
            this._entities[i].getY() >= topY &&
            this._entities[i].getY() <= bottomY) {
            results.push(this._entities[i]);
        }
    }

}
Game.Map.prototype.isEmptyFloor = function(x,y,d) {
    // True if tile is floor and has no entity on it
    return this.getTile(x,y,d) == Game.Tile.floorTile && !this.getEntityAt(x,y,d);
}

Game.Map.prototype.addEntity = function(entity) {
    // Ensure position within bounds
    if (entity.getX() < 0 || entity.getX() >= this._width ||
        entity.getY() < 0 || entity.getY() >= this._height ||
        entity.getD() < 0 || entity.getD() >= this._depth) {
        throw new Error("Adding entity out of bounds.");
    }
    // Update the entity's map
    entity.setMap(this);
    // Add the entity to the list of entities
    this._entities.push(entity);
    // Check if this entity is an actor, and if so add them to the scheduler
    if (entity.hasMixin('Actor')) {
       this._scheduler.add(entity, true);
       // console.log("Entity added to scheduler at: "+entity.getX()+","+entity.getY());
    }
}
Game.Map.prototype.addEntityAtRandomPosition = function(entity, d) {
    var position = this.getRandomFloorPosition(d);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setD(position.d);
    this.addEntity(entity);
}
Game.Map.prototype.removeEntity = function(entity) {
    // If entity is present in list of entities, remove it.
    for (var i=0; i<this._entities.length; i++) {
        if (this._entities[i] == entity) {
            this._entities.splice(i,1);
            break;
        }
    }
    // If entity is an actor, remove it from the scheduler
    if (entity.hasMixin("Actor")) {
        this._scheduler.remove(entity);
    }
}
Game.Map.prototype.dig = function(x,y,d) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x,y,d).isDiggable()) {
        this._tiles[d][x][y] = Game.Tile.floorTile;
    }
}
Game.Map.prototype.setupFov = function() {
    var map = this;
    for(var d=0; d<this._depth; d++) {
        // Wrap in its own scope to prevent depth var from being hoisted out of the loop
        (function() {
            // For each depth, create a callback to figure out if light can pass through a given tile
            var depth = d;
            map._fov.push(
                // DiscreteShadowcasting is obsoleted by PreciseShadowcasting, but so be it.
                new ROT.FOV.DiscreteShadowcasting(function(x, y) {
                    return !map.getTile(x,y,depth).isBlockingLight();
                }, {topology: 4}));
        })();
    }
}
Game.Map.prototype.getFov = function(depth) {
    return this._fov[depth];
}
Game.Map.prototype._setupExploredArray = function() {
    // Initialize all values to false
    for(var d=0; d<this._depth; d++) {
        this._explored[d] = new Array(this._width);
        for(var x=0; x<this._width; x++) {
            this._explored[d][x] = new Array(this._height);
            for(var y=0; y<this._height; y++) {
                this._explored[d][x][y] = false;
            }
        }
    }
}
Game.Map.prototype.setExplored = function(x,y,d,state) {
    // Only update if tile within bounds
    if(this.getTile(x,y,d) !== Game.Tile.nullTile) {
        this._explored[d][x][y] = state;
    }
};
Game.Map.prototype.isExplored = function(x,y,d) {
    if(this.getTile(x,y,d) !== Game.Tile.nullTile) {
        return this._explored[d][x][y];
    } else {
        return false;
    }
};