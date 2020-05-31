// Not to be confused with entity.js

// Create mixins namespace
Game.Mixins = {};

Game.Mixins.Mobile = { // Guide calls this "moveable"
    name: "Mobile",
    tryMove: function(x,y,map) { // Doesn't regard pathfinding or distance
        var tile = map.getTile(x,y);
        var target = map.getEntityAt(x,y);
        // If entity present, attack it
        if(target) {
            // If we are an attacker, try to attack
            if(this.hasMixin("Attacker")) {
                this.attack(target);
                return true;
            } else {
                // If we're not an attacker, do nothing
                return false;
            }
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

Game.Mixins.TestActor = {
    name: "TestActor",
    groupName: "Actor",
    act: function() {
        console.log("TestActor acts.");
    }
}

Game.Mixins.FungusActor = {
    name: "FungusActor",
    groupName: "Actor",
    init: function() {
        this._growthsRemaining = 5;
    },
    act: function() {
        console.log("Fungus is trying to act at: "+this.getX()+","+this.getY()+". It has "+this._growthsRemaining+" growths remaining.");
        // Random chance to spread
        if(this._growthsRemaining>0) {
            var growthChance = 1 // Not exact, since can't grow on own tile
            if(Math.random() <= growthChance) {
                // Coords of random adj tile. Generate offset of [-1 0 1] by picking random number 0~2, then subtracting 1
                var xOffset = Math.floor(Math.random() * 3) - 1;
                var yOffset = Math.floor(Math.random() * 3) - 1;
                // Can't spawn on our own tile
                if (xOffset!=0 || yOffset!=0) {
                    // Grow
                    if(this.getMap().isEmptyFloor(this.getX()+xOffset, this.getY()+yOffset)) {
                        var entity = new Game.Entity(Game.FungusTemplate);
                        entity.setX(this.getX() + xOffset);
                        entity.setY(this.getY() + yOffset);
                        this.getMap().addEntity(entity);
                        this._growthsRemaining--;
                    }
                }
            }
        }
    }
}

Game.Mixins.Destructible = {
    // Creatures, etc. Has HP.
    name: "Destructible",
    init: function() {
        this._hp = 1;
    },
    takeDamage: function(attacker, damage) {
        this._hp -= damage;
        if(this._hp<=0) {
            //this.die();
            this.getMap().removeEntity(this);
            console.log("entity died");
        }
    },
    die: function() {
        this.getMap().removeEntity(this);
    }
}

Game.Mixins.SimpleAttacker = {
    name: "SimpleAttacker",
    groupName: "Attacker",
    attack: function(target) {
        // Only works on destructibles
        if(target.hasMixin("Destructible")) {
            target.takeDamage(this, 1); // Flat 1 damage for now
        }
    }
}

// Player template. Will be refactored later
Game.PlayerTemplate = {
    character: "@",
    foreground: "white",
    background: "black",
    mixins: [Game.Mixins.Mobile, Game.Mixins.PlayerActor,
             Game.Mixins.SimpleAttacker, Game.Mixins.Destructible]
}

Game.TestActorTemplate = {
    character: "T",
    foreground: "aqua",
    background: "lawngreen",
    mixins: [Game.Mixins.TestActor]
}

Game.FungusTemplate = {
    character: "F",
    foreground: "chartreuse",
    background: "black",
    mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
}