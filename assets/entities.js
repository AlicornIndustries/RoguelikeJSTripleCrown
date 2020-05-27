// Not to be confused with entity.js

// Create mixins namespace
Game.Mixins = {};

Game.Mixins.Mobile = { // Guide calls this "moveable"
    name: "Mobile",
    tryMove: function(x,y,map) { // Check if tile isWalkable/diggable. If so, walk (doesn't regard pathfinding)
        var tile = map.getTile(x,y);
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

// Player template. Will be refactored later
Game.PlayerTemplate = {
    character: "@",
    foreground: "white",
    background: "black",
    mixins: [Game.Mixins.Mobile]
}