// Map: 2D array of Tiles. XY coords are indices in 1st [0] and 2nd [1] dimensions, e.g. tiles[x][y]

Game.Map = function(tiles, player) {
    this._tiles = tiles;
    // Cache width and height based on dimensions of tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;
    // Create list to hold entities on the map
    this._entities = [];
    // Create engine and scheduler
    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);
    // Add the player
    var playerSpawnPoint = this.addEntityAtRandomPosition(player);
    console.log("Player position is: "+playerSpawnPoint.x+","+playerSpawnPoint.y);
    // Add random fungi
    for (var i=0; i<1000; i++) {
        F = this.addEntityAtRandomPosition(new Game.Entity(Game.FungusTemplate));
    }
};

// Getters
Game.Map.prototype.getWidth = function() { return this._width; }
Game.Map.prototype.getHeight = function() { return this._height; }
Game.Map.prototype.getTile = function(x,y) {
    // If out of bounds, return null tile
    if(x<0 || x>= this._width || y<0 || y>= this._height) {
        return Game.Tile.nullTile;
    } else {
        return this._tiles[x][y] || Game.Tile.nullTile;
    }
}
Game.Map.prototype.getRandomFloorPosition = function() {
    // Random tile that is a floor and does not have an entity
    var x, y;
    do {
        x = Math.floor(Math.random() * this._width);
        y = Math.floor(Math.random() * this._height); // Guide has width, which I believe is a typo
    } while (this.getTile(x,y) != Game.Tile.floorTile || this.getEntityAt(x,y));
    return {x: x, y: y};
}
Game.Map.prototype.getEngine = function() { return this._engine; }
Game.Map.prototype.getEntities = function() { return this._entities; }
Game.Map.prototype.getEntityAt = function(x,y) {
    // Iterate through all entities on the map, looking for one with matching position
    // TODO: Should tiles know what entities are on them, to speed this up?
    for (var i=0; i<this._entities.length; i++) {
        if (this._entities[i].getX() == x && this._entities[i].getY() == y) {
            return this._entities[i];
        }
    }
    return false;
}
Game.Map.prototype.addEntity = function(entity) {
    // Ensure position within bounds
    if (entity.getX() < 0 || entity.getX() >= this._width ||
        entity.getY() < 0 || entity.getY() >= this._height) {
        throw new Error("Adding entity out of bounds.");
    }
    // Update the entity's map
    entity.setMap(this);
    // Add the entity to the list of entities
    this._entities.push(entity);
    // Check if this entity is an actor, and if so add them to the scheduler
    if (entity.hasMixin("Actor")) {
       this._scheduler.add(entity, true);
    }
}
Game.Map.prototype.addEntityAtRandomPosition = function(entity) {
    // Returns position. For testing, it also returns the entity
    var position = this.getRandomFloorPosition();
    entity.setX(position.x);
    entity.setY(position.y);
    this.addEntity(entity);
    return{x:position.x, y:position.y, entity:entity}
}
Game.Map.prototype.dig = function(x,y) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x,y,).isDiggable()) {
        this._tiles[x][y] = Game.Tile.floorTile;
    }
}