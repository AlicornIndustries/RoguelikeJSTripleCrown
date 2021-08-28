Game.Map.Cave = function(tiles, player) {
    // Call the Map constructor
    Game.Map.call(this, tiles);
    // Add the player
    this.addEntityAtRandomPosition(player, 0);
    // Add random monsters and items
    var entitiesPerFloor = 25;
    var itemsPerFloor = 10; // Currently only non-gear items (gear created with gearTemplates)
    var monsterTemplates = ["timberwolf","timberwolf","timberwolf","timberwolf","timberwolf","dire timberwolf","dire timberwolf","dire timberwolf"];
    for(var d=0; d<this._depth; d++) {
        for (var i=0; i<entitiesPerFloor; i++) {
            // Add a random entity from monsterTemplates to each depth. TODO: implement better rarity system, modify by depth.
            var entity = Game.EntityRepository.create(monsterTemplates[Math.floor(monsterTemplates.length*Math.random())])
            this.addEntityAtRandomPosition(entity, d);
            // Debug
            console.log("Created entity "+entity.getName()+" on depth "+d);
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
    var gearTemplates = ["shortsword","longsword","staff","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow","arrow"];
    for(var i=0; i<gearTemplates.length;i++) {
        this.addItemAtRandomPosition(Game.ItemRepository.create(gearTemplates[i]), Math.floor(this._depth*Math.random()));
    }

    // Add a hole to the final cavern on the last level
    var holePosition = this.getRandomFloorPosition(this._depth-1);
    this._tiles[this._depth-1][holePosition.x][holePosition.y] = Game.Tile.holeToCavernTile;
};
Game.Map.Cave.extend(Game.Map);