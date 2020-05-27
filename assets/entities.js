// Not to be confused with entity.js

// Create mixins namespace
Game.Mixins = {};

Game.Mixins.Mobile = { // Guide calls this "moveable"
    name: "Mobile",
    tryMove: function(x,y,map) { // Check if tile isWalkable/diggable. If so, walk (doesn't regard pathfinding)
        var tile = map.getTile(x,y);
        var target = map.getEntityAt(x,y);
        // If an entity is present, we can't walk there. TODO: Expand to deal with e.g. items on ground entities
        if(target) {
            return false;
        }
        if (tile.isWalkable()) {
            // Update entity's position
            this._x = x;
            this._y = y;
            return true;
        } else if (tile.isDiggable()) {
            map.dig(x,y,);
            return true;
        }
        return false;
    }
}

// All Actor group mixins are scheduled
Game.Mixins.PlayerActor = {
    name: "PlayerActor",
    groupName: "Actor",
    act: function() {
        // Re-render the screen on your turn
        Game.refresh();
        // Lock the engine, wait async for player input
        this.getMap().getEngine().lock();
    }
}

Game.Mixins.FungusActor = {
    name: "FungusActor",
    groupName: "Actor",
    act: function() {
        // Do nothing
    }
}

// Player template. Will be refactored later
Game.PlayerTemplate = {
    character: "@",
    foreground: "white",
    background: "black",
    mixins: [Game.Mixins.Mobile, Game.Mixins.PlayerActor]
}

Game.FungusTemplate = {
    character: "F",
    foreground: "chartreuse",
    background: "black",
    mixins: [Game.Mixins.FungusActor]
}