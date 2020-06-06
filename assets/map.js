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
    // Create hash table, indexed by position, to hold entities on the map
    this._entities = {}; // NOTE: This makes it tricky to have multiple entities on the same tile, but greatly speeds up finding entities
    // Create engine and scheduler
    this._scheduler = new ROT.Scheduler.Simple(); // TODO: Move Scheduler and Engine to a World class?
    this._engine = new ROT.Engine(this._scheduler);
    // Add the player
    this.addEntityAtRandomPosition(player,0);
    // Add random monsters
    var templates = [Game.FungusTemplate, Game.TimberwolfTemplate, Game.DireTimberwolfTemplate];
    for(var d=0; d<this._depth; d++) {
        for (var i=0; i<25; i++) {
            // Pick a random entity template to create
            var template = templates[Math.floor(Math.random() * templates.length)];
            this.addEntityAtRandomPosition(new Game.Entity(template), d);
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
    // Get entity with position index
    return this._entities[x+","+y+","+d];
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
    // Iterate through entities, adding all within bounds. 
    for(var key in this._entities) {
        var entity = this._entities[key];
        if (entity.getX() >= leftX && entity.getX() <= rightX && 
            entity.getY() >= topY && entity.getY() <= bottomY &&
            entity.getZ() == centerZ) {
            results.push(entity);
        }
    }
    return results;
}
Game.Map.prototype.isEmptyFloor = function(x,y,d) {
    // True if tile is floor and has no entity on it
    return this.getTile(x,y,d) == Game.Tile.floorTile && !this.getEntityAt(x,y,d);
}

Game.Map.prototype.addEntity = function(entity) {
    // Update the entity's map
    entity.setMap(this);
    // Add the entity to the list of entities
    this.updateEntityPosition(entity);
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
Game.Map.prototype.updateEntityPosition = function(entity, oldX, oldY, oldD) {
    // Updates entity that the map thinks is at oldCoords to match the entity's internal location
    
    // If oldX, oldY, oldD are null, we're really adding a new entity
    // Delete the old key if it is the same entity and we have old positions
    if(typeof(oldX)!== "undefined") {
        var oldKey = oldX+","+oldY+","+oldD;
        if(this._entities[oldKey] == entity) {
            delete this._entities[oldKey];
        }
    }
    // Ensure position within bounds
    if (entity.getX() < 0 || entity.getX() >= this._width ||
        entity.getY() < 0 || entity.getY() >= this._height ||
        entity.getD() < 0 || entity.getD() >= this._depth) {
        throw new Error("Entity's position is out of bounds.");
    }
    // Sanity check to ensure there is no entity at the new position
    var key = entity.getKey();
    if(this._entities[key]) {
        throw new Error("Tried to add an entity at an occupied position.");
    }    
    // Add entity to the table
    this._entities[key] = entity;
}
Game.Map.prototype.removeEntity = function(entity) {
    // Remove from the map
    var key = entity.getKey();
    if(this._entities[key] == entity) {
        delete this._entities[key];
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