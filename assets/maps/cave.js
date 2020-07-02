Game.Map.Cave = function(tiles, player) {
    // Call the Map constructor
    Game.Map.call(this, tiles);
    // Add the player
    this.addEntityAtRandomPosition(player, 0);
    // Add random monsters
    var entitiesPerFloor = 25;
    var itemsPerFloor = 10;
    for(var d=0; d<this._depth; d++) {
        for (var i=0; i<entitiesPerFloor; i++) {
            // Pick a random entity template to create
            //var template = templates[Math.floor(Math.random() * templates.length)];
            //this.addEntityAtRandomPosition(new Game.Entity(template), d);
            //this.addEntityAtRandomPosition(Game.EntityRepository.createRandom(), d);
            var entity = Game.EntityRepository.createRandom();
            this.addEntityAtRandomPosition(entity, d);
            // Level up entity based on the floor
            if(entity.hasMixin("ExperienceGainer")) {
                for(var level=0; level<d; level++) {
                    entity.gainExperience(entity.getNextLevelExperience()-entity.getExperience());
                }
            }        
        }
        // Add random items
        // TODO: Move the weapons/armor code up to here, build a system for item rarity, modified by depth.
        for(var i=0; i<itemsPerFloor; i++) {
            this.addItemAtRandomPosition(Game.ItemRepository.createRandom(), d);
        }
    }
    // Add weapons and armor to the map in random positions and depths
    var gearTemplates = ["shortsword","longsword","staff"];
    for(var i=0; i<gearTemplates.length;i++) {
        this.addItemAtRandomPosition(Game.ItemRepository.create(gearTemplates[i]), Math.floor(this._depth*Math.random()));
    }

    // Add a hole to the final cavern on the last level
    var holePosition = this.getRandomFloorPosition(this._depth-1);
    this._tiles[this._depth-1][holePosition.x][holePosition.y] = Game.Tile.holeToCavernTile;
};
Game.Map.Cave.extend(Game.Map);