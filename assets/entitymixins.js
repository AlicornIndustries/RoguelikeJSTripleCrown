Game.EntityMixins = {};

Game.EntityMixins.StatsHaver = {
    name: "StatsHaver",
    init: function(template) {
        // FUTURE: Currently, only Strength and Endurance affect anything.
        this._strength = template["strength"] || 1;
        this._strengthBase = this._strength;
        this._endurance = template["endurance"] || 1;
        this._enduranceBase = this._endurance;
        this._agility = template["agility"] || 1;
        this._agilityBase = this._agility;
        this._intelligence = template["intelligence"] || 0;
        this._intelligenceBase = this._intelligence;
        this._willpower = template["willpower"] || 0;
        this._willpowerBase = this._willpower;

    },
    getStrength: function() {return this._strength;},
    getStrengthBase: function() {return this._strengthBase;},
    getEndurance: function() {return this._endurance;},
    getEnduranceBase: function() {return this._enduranceBase;},
    getAgility: function() {return this._agility;},
    getAgilityBase: function() {return this._agilityBase;},
    getIntelligence: function() {return this._intelligence},
    getIntelligenceBase: function() {return this._intelligenceBase},
    getWillpower: function() {return this._willpower},
    getWillpowerBase: function() {return this._willpowerBase},
    recalcDerivedStats: function(restoreToFull=false) {
        if(this.hasMixin("Destructible")) {
            this.recalcMaxHp(restoreToFull);
        }
        if(this.hasMixin("StaminaHaver")) {
            this.recalcStamina(restoreToFull);
        }
    },
    changeStrength: function(value=1, temporary=false) {
        // If temporary, don't change the base value
        this._strength += value;
        if(!temporary) {
            this._strengthBase += value;
        }
        if(value>0) {
            Game.sendMessage(this,"You feel stronger!");
        } else {
            Game.sendMessage(this,"You feel weaker!");
        }
        // Recalculate derived statistics
    },
    changeEndurance: function(value=1, temporary=false) {
        // If temporary, don't change the base value
        this._endurance += value;
        if(!temporary) {
            this._enduranceBase += value;
        }
        if(value>0) {
            Game.sendMessage(this,"You feel stouter!");
        } else {
            Game.sendMessage(this,"You feel sicklier!");
        }
        this.recalcDerivedStats(false);

    },
    changeAgility: function(value=1, temporary=false) {
        // If temporary, don't change the base value
        this._agility += value;
        if(!temporary) {
            this._agilityBase += value;
        }
        if(value>0) {
            Game.sendMessage(this,"You feel nimbler!");
        } else {
            Game.sendMessage(this,"You feel clumsier!");
        }
        // Recalculate derived statistics
    },
    changeIntelligence: function(value=1, temporary=false) {
        // If temporary, don't change the base value
        this._intelligence += value;
        if(!temporary) {
            this._intelligenceBase += value;
        }
        if(value>0) {
            Game.sendMessage(this,"You feel smarter!");
        } else {
            Game.sendMessage(this,"You feel dumber!");
        }
        // Recalculate derived statistics
    },
    changeWillpower: function(value=1, temporary=false) {
        // If temporary, don't change the base value
        this._willpower += value;
        if(!temporary) {
            this._willpowerBase += value;
        }
        if(value>0) {
            Game.sendMessage(this,"You are filled with determination!");
        } else {
            Game.sendMessage(this,"You feel dispirited!");
        }
        // Recalculate derived statistics TODO: put MP here
    },
}
Game.EntityMixins.StaminaHaver = {
    // Requires StatsHaver
    name: "StaminaHaver",
    init: function(template) {
        this._stamina = 0;
        this._staminaMax = 0;
        this.recalcStamina(true);
    },
    getStamina: function() {return this._stamina},
    getStaminaMax: function() {return this._staminaMax},
    changeStamina: function(delta) {
        this._stamina = ROT.Util.clamp(this._stamina+delta,0,this._staminaMax);
    },
    recalcStamina: function(restoreToFull=false) {
        this._staminaMax = 10*this.getEndurance();
        if(restoreToFull) {
            this._stamina = this._staminaMax;
        }
    },
}

// All Actor group mixins are scheduled
Game.EntityMixins.PlayerActor = {
    name: "PlayerActor",
    groupName: "Actor",
    act: function() {
        if(this._acting) {
            // Skip if we're already acting (avoids double-calling things like kill())
            return;
        }
        this._acting = true;
        this.addTurnHunger();
        this.updateEffects();
        // Detect if game is over
        if(!this.isAlive()) {
            Game.Screen.playScreen.setGameEnded(true);
            Game.sendMessage(this, "Press [ENTER] to continue.");
        }
        // Re-render the screen on your turn
        Game.refresh();
        // Lock the engine, wait async for player input
        this.getMap().getEngine().lock();
        // Clear message queue
        this.clearMessages();
        this._acting = false;
    }
}
Game.EntityMixins.Sight = { // Can see with given radius
    name: "Sight",
    groupName: "Sight",
    init: function(template) {
        this._sightRadius = template["sightRadius"] || 5;
    },
    getSightRadius: function() {
        return this._sightRadius;
    },
    canSee: function(entity) {
        // Can't see if not on the same map/depth
        if(!entity || this._map !== entity.getMap() || this._d !== entity.getD()) {
            return false;
        }

        var otherX = entity.getX();
        var otherY = entity.getY();

        // If not in sight radius, don't need to calculate actual FOV
        if((otherX - this._x) * (otherX -this._x) + (otherY - this._y) * (otherY - this._y) > this._sightRadius * this._sightRadius) {
            return false;
        }

        // Compute FOV
        // TODO: Optimize. Currently, this recomputes the whole FOV.
        var found = false;
        this.getMap().getFov(this.getD()).compute(this.getX(), this.getY(), this.getSightRadius(),
            function(x,y,radius,visibility){
                if(x===otherX && y===otherY) {
                    found = true;
                }
            });
        return found;    
    }
}
Game.EntityMixins.TaskActor = {
    name: "TaskActor",
    groupName: "Actor",
    init: function(template) {
        // Load tasks
        this._tasks = template["tasks"] || ["wander"];
    },
    act: function() {
        if(this.hasMixin("Affectable")) {
            this.updateEffects();
        }
        // Iterate through our tasks
        for(var i=0; i<this._tasks.length; i++) {
            if(this.canDoTask(this._tasks[i])) {
                // Do the first task we can
                this[this._tasks[i]]();
                return;
            }
        }
    },
    canDoTask: function(task) {
        if(task==="hunt") {
            // Can hunt if can see player
            return this.hasMixin("Sight") && this.canSee(this.getMap().getPlayer());
        } else if(task==="wander") {
            return true;
        } else {
            throw new Error("Tried to perform undefined task "+ task);
        }
    },
    hunt: function() {
        var player = this.getMap().getPlayer();
        var offsets = Math.abs(player.getX()-this.getX()) + Math.abs(player.getY()-this.getY());
        if(offsets===1) { // If adjacent to player, attack
            if(this.hasMixin("Attacker")) {
                this.meleeAttack(player);
                return;
            }
        }
        // If not adjacent, calc path and move a step closer
        var source = this;
        var d = source.getD();
        var path = new ROT.Path.AStar(player.getX(), player.getY(), function(x,y) {
            // Function to determine what's pathable
            // Can't move through entities
            var entity = source.getMap().getEntityAt(x,y,d);
            if(entity && entity!==player && entity!==source) {
                return false;
            }
            return source.getMap().getTile(x,y,d).isWalkable();
        }, {topology: 8});
        // Once path is found, move to the second cell passed in the callback (first is starting point)
        var count = 0;
        path.compute(source.getX(), source.getY(), function(x,y) {
            if(count==1) {
                source.tryMove(x,y,d);
            }
            count++;
        });
    },
    wander: function() {
        // Pick a random direction x,y to move in
        var dirn = ROT.RNG.getItem(ROT.DIRS["8"]);
        this.tryMove(this.getX()+dirn[0], this.getY()+dirn[1], this.getD());
        
    }
}
Game.EntityMixins.FungusActor = {
    name: "FungusActor",
    groupName: "Actor",
    init: function() {
        this._growthsRemaining = 5;
    },
    act: function() {
        if(this.hasMixin("Affectable")) {
            this.updateEffects();
        }
        // Random chance to spread
        if(this._growthsRemaining>0) {
            var growthChance = 0.02 // Not exact, since can't grow on own tile, simulating overcrowding
            if(Math.random() <= growthChance) {
                // Coords of random adj tile. Generate offset of [-1 0 1] by picking random number 0~2, then subtracting 1
                // TODO: swap with ROT.RNG.getItem(ROT.DIRS["8"])
                var xOffset = Math.floor(Math.random() * 3) - 1;
                var yOffset = Math.floor(Math.random() * 3) - 1;
                // Can't spawn on our own tile
                if (xOffset!=0 || yOffset!=0) {
                    // Grow
                    if(this.getMap().isEmptyFloor(this.getX()+xOffset, this.getY()+yOffset, this.getD())) {
                        var entity = Game.EntityRepository.create("fungus");
                        entity.setPosition(this.getX()+xOffset, this.getY()+yOffset, this.getD());
                        this.getMap().addEntity(entity);
                        this._growthsRemaining--;
                    }
                }
            }
        }
    }
}
// TODO: Make an alternate Destructible setup for entities with only armor (no HP), like living statues
Game.EntityMixins.Destructible = {
    // Creatures, etc. Has HP.
    name: "Destructible",
    init: function(template) {
        this._maxHp = template["maxHp"] || 1;
        this._maxHpBase = this._maxHp;
        this._hp = template["hp"] || this._maxHp;
        // Defense (dodge) values
        this._defenseValue = template["defenseValue"] || 0;
    },
    getHp: function() {return this._hp;},
    getMaxHp: function() {return this._maxHp;},
    getHpBase: function() {return this._hpBase;},
    getHpPercent: function() {
        // Returns as e.g. 0.7, not 70%
        return (this._hp * 1.0 / this._maxHp);
    },
    setHp: function(hp) {this._hp = hp;},
    heal: function(hp) {
        this._hp = Math.min(this._hp+hp, this._maxHp);
    },
    recalcMaxHp: function(healToFull=false) {
        // Updates max HP after e.g. changing endurance. If healToFull=true, also fully heal
        // FUTURE: add in all other hp effecting things, like skills
        if(this.hasMixin("StatsHaver")) {
            this._maxHp = this._maxHpBase + this.getEndurance()*10;
        } else {
            this._maxHp = this._maxHpBase;
        }
        if(healToFull) {
            this.setHp(this._maxHp);
        }
    },
    increaseMaxHp: function(value) {
        value = value | 10; // Default to 10
        this._maxHp += value;
        this._hp += value;
        Game.sendMessage(this,"You look healthier!");
    },
    getArmorDurability: function() {
        if(this.hasMixin(Game.EntityMixins.Equipper)) {
            if(this.getArmor()) {
                return this.getArmor().getArmorDurability();
            }
        }
        return 0;
    },
    getArmorReduction: function() {
        if(this.hasMixin(Game.EntityMixins.Equipper)) {
            if(this.getArmor()) {
                return this.getArmor().getArmorReduction();
            }
        }
        return 0;
    },
    getDefenseValue: function() {
        var modifier=0;
        if(this.hasMixin(Game.EntityMixins.Equipper)) {
            // if(this.getWeapon()) {
            //     modifier+=this.getWeapon().getDefenseValue();
            // }
            if(this.getArmor()) {
                modifier+=this.getArmor().getDefenseValue();
            }
        }
        return this._defenseValue+modifier;
    },
    takeDamage: function(attacker, damage, bypassesArmor=false) {
        if(!bypassesArmor && this.hasMixin(Game.EntityMixins.Equipper)) {
            if(this.getArmor()) {
                damage = this.getArmor().damageArmor(damage);        
            }
        }
        this._hp -= damage;
        if(this._hp<=0) {
            Game.sendMessage(attacker,"You destroy the %s!",[this.getName()]);
            Game.sendMessage(this, "You die!");
            
            this.raiseEvent("onDeath", attacker);
            attacker.raiseEvent("onKill", this);
            this.kill();
        }
    },
    listeners: {
        onGainLevel: function() {
            // Destructible entities heal to full hp
            Game.sendMessage(this,"You feel strangely invigorated."); // FUTURE: Replace with alignment-based phrases, "You feel your heart beat in harmony with the world."
            this.setHp(this.getMaxHp());
        },
        details: function() {
            return [
                {key: "HP", value: (this.getHp().toString()+"/"+this._maxHp().toString())},
                {key: "defense value", value: this.getDefenseValue()}
            ];
        }
    }
}
Game.EntityMixins.Attacker = {
    name: "Attacker",
    groupName: "Attacker",
    init: function(template) {
        this._attackValue = template["attackValue"] || 1;
        this._unarmedDamageType = template["unarmedAttackType"] || Game.Enums.DamageTypes.BLUNT;
        this._rangedAttackValue = template['rangedAttackValue'] || 1;
    },
    // TODO: Make this take in attackType as input (and make a getMeleeAttackValue function it can call)
    getAttackValue: function(weapon=false) {
        var modifier = 0;
        // If weapon wasn't passed, default to the equipped weapon, if available
        // If we can equip items, take them into account
        if(!weapon && this.hasMixin(Game.EntityMixins.Equipper)) {
            if(this.getWeapon()) {
                modifier+=this.getWeapon().getAttackValue();
            }
            // if(this.getArmor()) {
            //     modifier+=this.getArmor().getAttackValue();
            // }
        } else {
            // If a weapon was not passed in
            // unarmed
        }
        return this._attackValue+modifier;
    },
    getRangedAttackValue: function(weapon=false) {
        var modifier = 0;
        if(weapon!=false && this.hasMixin(Game.EntityMixins.Equipper)) {
            modifier+=weapon.getRangedAttackValue();
        }
        else {
            // unarmed, no weapon
        }
        return this._rangedAttackValue+modifier;
    },
    getThrownAttackValue: function(weapon) {
        var modifier = 0;
        modifier=weapon.getThrownAttackValue();
        return this._rangedAttackValue+modifier; // TODO: for now, use the base ranged attack value to double for thrown attacks (they probably should be similar)
    },
    getMeleeDamage: function(weapon,target=undefined) {
        var modifier=0;
        // TODO: Figure out a more efficient way to handle this conditional
        if(weapon) {
            modifier+=weapon.getDamageValue();
        }
        else {
            // TODO: unarmed 
        }
        if(this.hasMixin("SkillsHaver")) {
            modifier+=this.getBoost(Game.Enums.BoostTypes.MELEEDAMAGE,{"target":target,"weapon":weapon});
        }
        return this._strength+modifier;
    },
    getRangedDamage: function(weapon,target=undefined) {
        var modifier = 0;
        if(weapon) {
            modifier+=weapon.getRangedDamageValue();
        }
        var ammo = this.getAmmo();
        if(ammo!=null) {
            modifier+=ammo.getRangedDamageValue();
        }
        if(this.hasMixin("SkillsHaver")) {
            modifier+=this.getBoost(Game.Enums.BoostTypes.RANGEDDAMAGE,{"target":target,"weapon":weapon});
        }
        return modifier;
    },
    getThrownDamage: function(weapon,target=undefined) {
        var damage = 0;
        if(this.hasMixin(Game.EntityMixins.SkillsHaver)) {
            damage+=this.getBoost(Game.Enums.BoostTypes.THROWNDAMAGE,{"target":target,"weapon":weapon});
        }
        if(weapon.hasMixin(Game.ItemMixins.Throwable)) {
            damage+=weapon.getThrownDamageValue();
        }
        return damage;
    },
    getAttackDamage: function(target,attackType,weapon=false,crit=false,critDamageMult=2) {
        if(crit) {
            var damageMult = critDamageMult;
        } else {
            damageMult = 1;
        }
        switch(attackType) {
            case Game.Enums.AttackTypes.MELEE:
                return this.getMeleeDamage(weapon,target)*damageMult;
            case Game.Enums.AttackTypes.RANGED:
                return this.getRangedDamage(weapon,target)*damageMult;
            case Game.Enums.AttackTypes.THROWN:
                return this.getThrownDamage(weapon,target)*damageMult;
            default:
                console.log("Invalid attackType");
                return undefined;
        }
    },
    getHit: function(target,attackType=Game.Enums.AttackTypes.MELEE,weapon=false) {
        // Returns an object with info about damage dealt, whether it was a critical. FUTURE: add hit location, etc here
        // Pass in the item that was thrown (e.g. shuriken)
        var attackRoll = ROT.RNG.getPercentage();
        switch(attackType) {
            case Game.Enums.AttackTypes.MELEE:
                var attackValue = this.getAttackValue(weapon);
                break;
            case Game.Enums.AttackTypes.RANGED:
                var attackValue = this.getRangedAttackValue(weapon);
                break;
            case Game.Enums.AttackTypes.THROWN:
                var attackValue = this.getThrownAttackValue(weapon);
                break;
            default:
                console.log("Invalid attack type.");
                console.log(attackType);
                break;
        }
        var defenseValue = target.getDefenseValue();
        var critChance = 0;
        var critDamageMult = 1;
        var critChanceMult = 1;

        // Setup variables
        if(weapon) {
            if(attackType==Game.Enums.AttackTypes.MELEE) {
                critChance = weapon.getCritChance();
                critDamageMult = weapon.getCritDamageMult();
                // TODO: Incorporate critChanceMult
            } else if(attackType==Game.Enums.AttackTypes.RANGED && weapon.hasMixin(Game.ItemMixins.ProjectileLauncher)) {
                critChance = weapon.getRangedCritChance();
                critDamageMult = weapon.getRangedCritDamageMult();
            } else if(attackType==Game.Enums.AttackTypes.THROWN && weapon.hasMixin(Game.ItemMixins.Throwable)) {
                critChance = weapon.getThrownCritChance();
                critDamageMult = weapon.getThrownCritDamageMult();
            }
        }
        // TODO: else, unarmed
        if(this.hasMixin("SkillsHaver")) {
            switch(attackType) {
                case Game.Enums.AttackTypes.MELEE:
                    critChanceMult+=this.getBoost(Game.Enums.BoostTypes.MELEECRITCHANCE,{"target":target});
                    break;
                case Game.Enums.AttackTypes.RANGED:
                    critChanceMult+=this.getBoost(Game.Enums.BoostTypes.RANGEDCRITCHANCE,{"target":target});
                    break;
                case Game.Enums.AttackTypes.THROWN:
                    critChanceMult+=this.getBoost(Game.Enums.BoostTypes.THROWNCRITCHANCE,{"target":target});
                    break;
                default:
                    critChanceMult=0;
            }
        }
        // Figure out if we crit
        if(attackRoll<=(critChance*critChanceMult)) {
            return {"damage":this.getAttackDamage(target,attackType,weapon,true,critDamageMult), "crit":true, "hitSuccess":true}
        } else {
            var hitChance = ROT.Util.clamp(attackValue-defenseValue,0,90);
            if(attackRoll<=hitChance) {
                // Regular hit
                return {"damage":this.getAttackDamage(target,attackType,weapon,false), "crit":false, "hitSuccess":true}
            } else {
                // Miss
                return {"hitSuccess":false};
            }
        }

    },
    // Not currently used
    // attack: function(target,attackType=Game.Enums.AttackTypes.MELEE,distance=undefined) {
    //     switch(attackType) {
    //         case Game.Enums.AttackTypes.MELEE:
    //             this.meleeAttack(target);
    //             return;
    //         case Game.Enums.AttackTypes.RANGED:
    //             this.rangedAttack(target,distance);
    //             return;
    //         default:
    //             console.log("Invalid attack type.");
    //             return;
    //     }
    // },
    meleeAttack: function(target,weapon=false) {
        // Only works on destructibles
        if(target.hasMixin("Destructible")) {
            hit = this.getHit(target,Game.Enums.AttackTypes.MELEE,weapon);
            if(hit.crit) {
                // Critical hit
                Game.sendMessage(this, "You critically strike the %s for %d damage!",[target.getName(), hit.damage]);
                Game.sendMessage(target, "The %s critically strikes you for %d damage!",[this.getName(), hit.damage]);
                target.takeDamage(this,hit.damage);
            } else if(hit.hitSuccess) {
                // Regular hit
                Game.sendMessage(this, "You strike the %s for %d damage!",[target.getName(), hit.damage]);
                Game.sendMessage(target, "The %s strikes you for %d damage!",[this.getName(), hit.damage]);
                target.takeDamage(this,hit.damage);

            } else {
                // Miss
                Game.sendMessage(this, "You miss the %s.", [target.getName()]);
                Game.sendMessage(target, "The %s misses you.", [this.getName()]);
            }
            // FUTURE: On miss, drain opponent's stamina or some other "Dodge Meter?"      
        }
    },
    rangedAttack: function(target, weapon, distance) { // TODO: distance currently unused
        if(target.hasMixin("Destructible")) {
            // Consume a unit of ammunition
            var ammo = this.getAmmo();
            if(ammo.hasMixin("Stackable")) {
                ammo.changeStackSize(-1);
                if(ammo.getStackSize()<=0) {
                    var index = this.getItemIndex(ammo);
                    this.removeItem(index);
                }
                // TODO: Else, if not stackable, just remove the item. Search for another identical item and quiver it to replace it?
            }
            hit = this.getHit(target,Game.Enums.AttackTypes.RANGED,weapon);
            if(hit.crit) {
                // Critical hit
                Game.sendMessage(this, "You critically strike the %s for %d damage!",[target.getName(), hit.damage]);
                Game.sendMessage(target, "The %s critically strikes you for %d damage!",[this.getName(), hit.damage]);
                target.takeDamage(this,hit.damage);
            } else if(hit.hitSuccess) {
                // Regular hit
                Game.sendMessage(this, "You strike the %s for %d damage!",[target.getName(), hit.damage]);
                Game.sendMessage(target, "The %s strikes you for %d damage!",[this.getName(), hit.damage]);
                target.takeDamage(this,hit.damage);

            } else {
                // Miss
                Game.sendMessage(this, "You miss the %s.", [target.getName()]);
                Game.sendMessage(target, "The %s misses you.", [this.getName()]);
            }
        }
    },
    // TODO: Merge this into rangedAttack?
    thrownAttack: function(target, weapon, distance=undefined) {
        if(target.hasMixin(Game.EntityMixins.Destructible)) {
            hit = this.getHit(target,Game.Enums.AttackTypes.THROWN,weapon);
            if(hit.crit) {
                // Critical hit
                Game.sendMessage(this, "You critically strike the %s for %d damage!",[target.getName(), hit.damage]);
                Game.sendMessage(target, "The %s critically strikes you for %d damage!",[this.getName(), hit.damage]);
                target.takeDamage(this,hit.damage);
            } else if(hit.hitSuccess) {
                // Regular hit
                Game.sendMessage(this, "You strike the %s for %d damage!",[target.getName(), hit.damage]);
                Game.sendMessage(target, "The %s strikes you for %d damage!",[this.getName(), hit.damage]);
                target.takeDamage(this,hit.damage);

            } else {
                // Miss
                Game.sendMessage(this, "You miss the %s.", [target.getName()]);
                Game.sendMessage(target, "The %s misses you.", [this.getName()]);
            }
        }
    },
    listeners: {
        details: function() {
            var results = [];
            results.push({key: "attack value", value: this._attackValue});
            results.push({key: "strength", value: this._strength});
            return results;
        }
    }
}
Game.EntityMixins.MessageRecipient = {
    name: "MessageRecipient",
    init: function(template) {
        this._messages = []; // Other entities fill up message queue
    },
    receiveMessage: function(message) {
        this._messages.push(message);
    },
    getMessages:  function() {
        return this._messages;
    },
    clearMessages: function() {
        this._messages = [];
    }
}
Game.sendMessage = function(recipient, message, args) {
    if(recipient.hasMixin(Game.EntityMixins.MessageRecipient)) {
        // If args passed, format message.
        if(args) {
            message = vsprintf(message,args);
        }
        recipient.receiveMessage(message);
    }
}
Game.sendMessageNearby = function(map, centerX, centerY, radius, message, args) {
    if(args) {
        message = vsprintf(message, args);
    }
    // Get nearby entities, sendMessage to each of them
    entities = map.getEntitiesWithinRadius(centerX, centerY, radius);
    for(var i=0; i<entities.length; i++) {
        if(entities[i].hasMixin(Game.EntityMixins.MessageRecipient)) {
            entities[i].receiveMessage(message);
        }
    }
}
Game.EntityMixins.InventoryHolder = {
    name:"InventoryHolder",
    init: function(template) {
        var inventorySlots = template['inventorySlots'] || 10;
        this._items = new Array(inventorySlots);
    },
    getItems: function() {return this._items;},
    getItem: function(i) {return this._items[i];},
    getItemIndex: function(item) {
        // Converts an item into its index in the inventory
        // TODO: Refactor this kludge.
        for(var i=0; i<this._items.length; i++) {
            if(this._items[i]==item) {
                return i;
            }
        }
        // If item not in inventory, return null
        return null;
    },
    addItem: function(item) {
        var that = this;

        // If the item is stackable, first check to see if we have an item it stacks with
        if(item.hasMixin("Stackable")) {
            for(var i=0; i<this._items.length; i++) {
                if(this._items[i]!=null) {
                    var ithitem = this._items[i];
                    if(ithitem.hasMixin("Stackable") && ithitem.stacksWith(item)) {
                        // Stack items together
                        // Add to the ith item in inventory, then subtract that from the item to be added to inventory
                        var initialItemStackSize = item.getStackSize();
                        var remainingSpace = ithitem.changeStackSize(initialItemStackSize);
                        item.changeStackSize(-1*initialItemStackSize);
                        // If remainingSpace>=0, then we've used up the other item with space to spare. Delete the item.
                        if(remainingSpace<0) {
                            // Otherwise, if remainingSpace<0, then we can't fit it all into one slot.
                            // Make a new item. If it can fit in our inventory, do so. Else, drop it on the ground at our location
                            var newItem = Game.ItemRepository.create(item.getName(),{material:item.getMaterial(),stackSize:-1*remainingSpace});
                            if(!that.addItem(newItem)) {
                                that.getMap().addItem(that.getX(),that.getY(),that.getD(),newItem);
                            }
                        }
                        // The item (the stack we picked up) will be deleted by pickupItems()'s mapItems.splice
                        // TODO: might not work when items are granted by methods other than pickupItems()
                        return true;              
                    }
                }
            }
        }
        // Either the item isn't stackable, or the stack in inventory is already full.
        // Try to find a slot
        for(var i=0; i<this._items.length; i++) {
            if(!this._items[i]) {
                this._items[i] = item;
                return true;
            }
        }
        return false; // No empty slot found
    },
    removeItem: function(i) { // i: index of item in inventory
        // First, unequip it
        if(this._items[i] && this.hasMixin(Game.EntityMixins.Equipper)) {
            this.unequip(this._items[i]);
        }
        // Clear the inventory slot 
        this._items[i] = null; // TODO: should I use the filter technique from Affectable's removeEffect here, to get rid of null array elements?
    },
    canAddItem: function() {
        // TODO: if item is stackable, first see if we have an item we can stack it with
        // Check if we have an empty slot
        for(var i=0; i<this._items.length; i++) {
            if(!this._items[i]) {
                return true;
            }
        }
        return false;
    },
    pickupItems: function(indices) {
        // Pick up all items at our position. Indices for array returned by map.getItemsAt
        var mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getD());
        var added = 0; // number of items added
        // Iterate through all indices
        for(var i=0; i<indices.length; i++) {
            // Try to add. If inventory not full, splice item out of list of items.
            if(this.addItem(mapItems[indices[i]-added])) {
                mapItems.splice(indices[i]-added, 1);
                added++;
            } else {
                // Inventory is full
                break;
            }
        }
        // Update map items
        this._map.setItemsAt(this.getX(), this.getY(), this.getD(), mapItems);
        // True only if we added all items
        return added===indices.length;
    },
    dropItem: function(i) {
        // Drop item on current map tile
        if(this._items[i]) {
            if(this._map) {
                this._map.addItem(this.getX(), this.getY(), this.getD(), this._items[i]);
            }
            this.removeItem(i);
        }
    },
    throwItem(itemToThrow,x,y) {
        var i = this.getItemIndex(itemToThrow);
        var d = this.getD();
        if(this._items[i] && this._map) {
            if(this.hasMixin(Game.EntityMixins.Equipper)) {
                this.unequip(itemToThrow);
            }
            // Put item on the thrown location
            this._map.addItem(x,y,d,this._items[i]);
            this.removeItem(i);
        }
        var target = this._map.getEntityAt(x,y,d);
        if(target!=null && this.hasMixin(Game.EntityMixins.Attacker)) {
            // Perform a projectile attack on the target
            this.thrownAttack(target,itemToThrow);
        }
    }
}
Game.EntityMixins.FoodConsumer = {
    name: "FoodConsumer",
    init: function(template) {
        this._maxFullness = template["maxFullness"] || 1000;
        // Start at 50% fullness
        this._fullness = template["fullness"] || (this._maxFullness/2);
        // Fullness drain rate per turn
        this._fullnessDepletionRate = template["fullnessDepletionRate"] || 1;
    },
    addTurnHunger: function() {
        // Reduce fullness by standard rate
        this.modifyFullnessBy(-this._fullnessDepletionRate);
    },
    modifyFullnessBy: function(points) {
        this._fullness = this._fullness + points;
        if(this._fullness<=0) {
            this.kill("You have died of starvation!"); // TODO: Replace with gradual health loss while starving.
        } else if(this._fullness>this._maxFullness) {
            this._fullness=this._maxFullness;
            this.sendMessage("You're absolutely stuffed!");
        }
    },
    getHungerState: function() {
        // Fullness points per percent of max fullness
        var perPercent = this._maxFullness / 100;
        if (this._fullness <= perPercent * 5) {
            return 'Starving';
        // 25% of max fullness or less = hungry
        } else if (this._fullness <= perPercent * 25) {
            return 'Hungry';
        // 95% of max fullness or more = oversatiated
        } else if (this._fullness >= perPercent * 95) {
            return 'Glutted';
        // 75% of max fullness or more = full
        } else if (this._fullness >= perPercent * 75) {
            return 'Full';
        // Anything else = not hungry
        } else {
            return 'Not Hungry';
        }
    },
    eat: function(food) {
        if(!food.hasMixin("Edible") || !food.hasRemainingConsumptions()) {
            Game.sendMessage(this,"You can't eat that!")
        } else {
            this.modifyFullnessBy(food.getFoodValue());
            food.changeRemainingConsumptions(-1);
            if(!food.hasRemainingConsumptions()) {
                var index = this.getItemIndex(food);
                this.removeItem(index);
            }
        }
    },
    quaff: function(item) {
        if(!item.hasMixin("Quaffable") || !item.hasRemainingQuaffs()) {
            Game.sendMessage("You can't drink that!");
        } else {
            item.changeRemainingQuaffs(-1);
            // Apply effects of potion
            if(this.hasMixin("Affectable")) {
                this.addEffect(item.getEffects(),this);
            }
            if(!item.hasRemainingQuaffs()) {
                var index = this.getItemIndex(item);
                this.removeItem(index);
            }
        }
    }
}

Game.EntityMixins.CorpseDropper = {
    name: "CorpseDropper",
    init: function(template) {
        // Chance of dropping a corpse
        this._corpseDropRate = template["corpseDropRate"] || 100;
    },
    listeners: {
        onDeath: function(attacker) {
            if(Math.round(Math.random()*100) < this._corpseDropRate) {
                // Create new corpse item
                this._map.addItem(this.getX(), this.getY(), this.getD(),Game.ItemRepository.create("corpse", {name: this._name+" corpse",foreground: this._foreground}));

            }
        }
    }
}
Game.EntityMixins.Equipper = {
    name: "Equipper",
    init: function(template) {
        this._weapon = null;
        this._armor = null;
        this._quivered = null;
        this._quiveredThrowing = null;
    },
    wield: function(item) {
        this._weapon = item;
    },
    unwield: function() {
        this._weapon = null;
    },
    wear: function(item) {
        this._armor = item;
    },
    unwear: function() { // TODO: account for multiple slots. This should take in an item/item slot as input
        this._armor = null;
    },
    quiver: function(item) {this._quivered = item;},
    unquiver: function() {this._quivered = null;},
    quiverThrowing: function(item) {this._quiveredThrowing = item;},
    unquiverThrowing: function(item) {this._quiveredThrowing = null;},
    getWeapon: function() {return this._weapon;},
    getProjectileLauncher: function() {
        if(this._weapon.hasMixin("ProjectileLauncher")) {
            return this._weapon;
        }
        else {
            return null;
        }
    },
    getArmor: function() {
        return this._armor;
    },
    getAmmo: function() {
        return this._quivered;
    },
    unequip: function(item) {
        // Helper function called before removing item
        if(this._weapon===item) {
            this.unwield();
        }
        if(this._armor===item) {
            this.unwear();
        }
        if(this._quivered===item) {
            this.unquiver();
        }
    },
    getThrowingRange: function(item) {
        // Get range the entity can throw something.
        // FUTURE: have an equation based on strength and weight
        if(this.hasMixin(Game.EntityMixins.StatsHaver)) {
            return this.getStrength();
        } else {
            return 1;
        }
    },
}

Game.EntityMixins.ExperienceGainer = {
    name: "ExperienceGainer",
    init: function(template) {
        this._level = template["level"] || 1;
        this._experience = template["experience"] || 0;
        this._statPointsPerLevel = template['statPointsPerLevel'] || 1;
        this._statPoints = 0;
        this._levelUpEarned = false; // onGainLevel listener sets this to true for PlayerStatGainer. NPCs level up immediately.

        // Determine what stats can be leveled up
        // Any non-zero stats are eligible
        // In future, use a different system for NPCs (a Timberwolf may have Willpower, but not level it up)
        this._statOptions = [];
        if(this.hasMixin("StatsHaver")) {
            if(this.getStrengthBase()>0) {
                this._statOptions.push(["Increase strength", this.changeStrength]);
            }
            if(this.getEnduranceBase()>0) {
                this._statOptions.push(["Increase endurance", this.changeEndurance]);
            }
            if(this.getAgilityBase()>0) {
                this._statOptions.push(["Increase agility", this.changeAgility]);
            }
            if(this.getIntelligenceBase()>0) {
                this._statOptions.push(["Increase intelligence", this.changeIntelligence]);
            }
            if(this.getWillpowerBase()>0) {
                this._statOptions.push(["Increase willpower", this.changeWillpower]);
            }
        }
    },
    getLevel: function() {return this._level;},
    getLevelUpEarned: function() {
        return this._levelUpEarned;
    },
    setLevelUpEarned: function(value) {
        this._levelUpEarned = value;
    },
    getExperience: function() {return this._experience;},
    getNextLevelExperience: function() {return (this._level*this._level)*10},
    getStatPoints: function() {return this._statPoints},
    setStatPoints: function(statPoints) {this._statPoints = statPoints},
    getStatOptions: function() {return this._statOptions},
    gainExperience: function(xp) {
        var statPointsGained = 0; // TODO: But we never really use this value?
        var levelsGained = 0;
        // Loop until all xp allocated
        while(xp>0) {
            // Check if adding xp exceeds threshold
            if(this._experience+xp>=this.getNextLevelExperience()) {
                // Fill our experience until next threshold
                var usedXp = this.getNextLevelExperience()-this._experience;
                xp -= usedXp;
                // Level up
                this._level++;
                levelsGained++;
                this._statPoints += this._statPointsPerLevel;
                statPointsGained += this._statPointsPerLevel;
            } else {
                // Not enough to clear next threshold
                this._experience += xp;
                xp = 0;
            }
        }
        if(levelsGained>0) {
            Game.sendMessage(this,"You advance to level %d.",[this._level]);
            this.raiseEvent("onGainLevel");
        }
    },
    listeners: {
        onKill: function(victim) {
            var xp = victim.getMaxHp(); // TODO: replace with better equation, base xp value in entity template
            if(victim.hasMixin("Attacker")) {
                xp += victim.getStrength();
            }
            // Account for level differences
            if(victim.hasMixin("ExperienceGainer")) {
                xp -= (this.getLevel() - victim.getLevel()) * 3;
            }
            // Only give experience if greater than 0
            if(xp>0) {
                this.gainExperience(xp);
            }
        },
        details: function() {
            return [{key: "level", value: this.getLevel()}];
        }
    }
}

// Gains stats randomly on level up (for monsters)
Game.EntityMixins.RandomStatGainer = {
    name: "RandomStatGainer",
    groupName: "StatGainer",
    listeners: {
        onGainLevel: function() {
            var statOptions = this.getStatOptions();
            // Randomly pick a stat, execute its callback for each stat point
            var stat = ROT.RNG.getItem(statOptions);
            stat[1].call(this); // Call stat increasing function with "this" as context
            this.setStatPoints(this.getStatPoints()-1);
            this.setLevelUpEarned(false); // TODO: Make this work when earning multiple levels at once
        }
    }
};
Game.EntityMixins.PlayerStatGainer = {
    name: "PlayerStatGainer",
    groupName: "StatGainer",
    listeners: {
        onGainLevel: function() {
            this._levelUpEarned = true;
            /* Stopped using this since it didn't work when leveling up in another subscreen (e.g. firing)
            Game.Screen.gainStatScreen.setup(this);
            Game.Screen.playScreen.setSubscreen(Game.Screen.gainStatScreen);
            */
        }
    }
};
Game.EntityMixins.WindigoActor = Game.extend(Game.EntityMixins.TaskActor, {
    init: function(template) {
        // Call TaskActor init with predefined tasks
        Game.EntityMixins.TaskActor.init.call(this, Game.extend(template, {
            "tasks": ["becomeEnraged", "spawnSpitesprite", "hunt", "wander"]
        }));
        this._hasBecomeEnraged = false;
        this._enragedThreshold = 0.4; // enraged below this % HP
        this._spitespriteSpawnChance = 10;
    },
    canDoTask: function(task) {
        // If we haven't become enraged and our HP<=threshold%, do so
        if(task==="becomeEnraged") {
            console.log("Windigo's HP%: "+this.getHpPercent()+" Threshold: "+this._enragedThreshold);
            return this.getHpPercent()<=this._enragedThreshold && !this._hasBecomeEnraged;
        // Spawn spitespite only 10% of the time
        } else if(task==="spawnSpitesprite") {
            return Math.round(Math.random()*100) <= this._spitespriteSpawnChance;
        // Call parent canDoTask if one of these special actions are available
        } else {
            return Game.EntityMixins.TaskActor.canDoTask.call(this,task);
        }
    },
    becomeEnraged: function() {
        this._hasBecomeEnraged = true;
        this.increaseStrength(7);
        Game.sendMessageNearby(this.getMap(),
            this.getX(), this.getY(), this.getD(), "The windigo whips itself into a fury!");
    },
    spawnSpitesprite: function() {
        // Random position nearby
        var adjPosition = ROT.RNG.getItem(ROT.DIRS["8"]);
        // Check if we can spawn at that position
        if(!this.getMap().isEmptyFloor(this.getX()+adjPosition[0], this.getY()+adjPosition[1], this.getD())) {
            return; // Do nothing if position occupied
        }
        // Create the entity
        var spitesprite = Game.EntityRepository.create("spitesprite");
        spitesprite.setX(this.getX()+adjPosition[0]);
        spitesprite.setY(this.getY()+adjPosition[1]);
        spitesprite.setD(this.getD());
        this.getMap().addEntity(spitesprite);
        Game.sendMessageNearby(this.getMap(),
        this.getX(), this.getY(), this.getD(), "Icy whirlwinds spin off the windigo!");
    },
    listeners: {
        onDeath: function(attacker) {
            // Switch to win screen when killed
            Game.switchScreen(Game.Screen.winScreen);
        }
    }
})

Game.EntityMixins.SkillsHaver = {
    name: "SkillsHaver",
    init: function(template) { // TODO: check if this is true: SkillsHaver init needs to be called last. Or, use a better template.
        this._skills = {};
        for(var i=0; i<template["skills"].length; i++) {
            var skillName = template["skills"][i].skill.name; // Use skillName (the string), not the actual Skill object
            var skillLevel = template["skills"][i].skillLevel;
            this._skills[skillName] = Game.Skills.createSkill(template["skills"][i].skill,this);
            //this._skills[skillName].init();
            this._skills[skillName].levelUp(skillLevel);
        }
    },
    getSkill: function(skill) {
        // in: "archery" or Game.Enums.Skill.ARCHERY
        if(typeof skill === "object") {
            return this._skills[skill.name];
        } else {
            return this._skills[skill];
        }
    },
    getSkills: function() {return this._skills;},
    getBoost: function(boostType,extraProperties) {
        // FUTURE: Once all the skills are designed, hardcode optimizations st. e.g. when checking for melee damage, we only test the skills we know could affect it.
        var boostValue = 0;
        // Loop through all skills, summing their boosts of that type
        for(var skill in this._skills) {
            if(extraProperties!=null) {
                var boostFromSkill = this._skills[skill].getBoost(boostType,extraProperties);
            } else {
                var boostFromSkill = this._skills[skill].getBoost(boostType);
            }
            if(boostValue!=null) {
                boostValue+=boostFromSkill;
            }
        }
        return boostValue;
    },
};
// for entities that can be affected by effects (most entities are this)
Game.EntityMixins.Affectable = {
    name: "Affectable",
    init: function(template) {
        this._effects = [];
    },
    addEffect: function(effect,inflictor) {
        effect.setInflictor(inflictor);
        this._effects.push(effect);
        effect.start(this);
        // Immediately remove the effect if it's finished
        if(effect.getDuration()<=0) {
            this.removeEffect(effect);
        }
    },
    updateEffects: function() {
        if(this._effects.length>0) {
            var indicesToRemove = [];
            for(var i=0; i<this._effects.length; i++) {
                this._effects[i].update(this);
                if(this._effects[i].getDuration()<=0) {
                    indicesToRemove.push(i);
                }
            }
            // Wait to clear effects until after we've finished the loop
            for(var j=0; j<indicesToRemove.length; j++) {
                this.removeEffect(indicesToRemove[j]);
            }
        }
    },
    getEffects: function() {
        return this._effects;
    },
    getEffect: function(index) {
        return this._effects[index];
    },
    getEffectIndex: function(effect) {
        // TODO: Refactor this kludge, like getItemIndex
        for(var i=0; i<this._effects.length; i++) {
            if(this._effects[i]==effect) {
                return i;
            }
        }
        // If no such effect, return null
        return null;
    },
    removeEffect: function(index) {
        if(this._effects[index]!=null) {
            this._effects[index].end(this);
            this._effects[index] = null;
            this._effects = this._effects.filter(function(element) {
                if(element!=null) {
                    return element;
                }
            })
            console.log("effect removed");
        }
    }
}

// For entities with character classes
Game.EntityMixins.Classy = {
    name: "Classy",
    init: function(template) {
        this._charClass = template["charClass"];
    },
    hasCharClass: function(charClass) {
        return this._charClass===charClass;
    },
    getCharClass: function() {
        return this._charClass;
    },
    setCharClass: function(charClass) {
        this._charClass = charClass;
    }
}
// For entities with races (earth/unicorn/pony etc)
Game.EntityMixins.RaceHaver = {
    name: "RaceHaver",
    init: function(template) {
        this._race = template["race"];
        if(this._race!=null) {
            this.applyRaceBonuses();
        }
    },
    hasRace: function(race) {
        return this._race===race;
    },
    getRace: function() {
        return this._race;
    },
    setRace: function(race) {
        this._race = race;
        this.applyRaceBonuses();
    },
    applyRaceBonuses: function() {
        if(this.hasMixin("StatsHaver")) {
            for(var key in this._race.statBonuses) {
                if(key==="strength") {
                    this.changeStrength(this._race.statBonuses.strength);
                } else if(key==="endurance") {
                    this.changeEndurance(this._race.statBonuses.endurance);
                } else if(key==="agility") {
                    this.changeAgility(this._race.statBonuses.agility);
                } else if(key==="intelligence") {
                    this.changeIntelligence(this._race.statBonuses.intelligence);
                } else if(key==="willpower") {
                    this.changeWillpower(this._race.statBonuses.willpower);
                }
            }
            this.recalcDerivedStats(true);
        }
    }
}
Game.EntityMixins.PowersHaver = {
    name: "PowersHaver",
    init: function(template) {
        this._powers = {};
        // Populate powers table
        for(var i=0; i<template["powers"].length; i++) {
            this.gainPower(template["powers"][i])
            // Ex: this._powers[template["powers"][i].name].activate(this);
        }
    },
    // getPower: function(power) {
    //     return this._powers[power];
    // },
    // getPowers: function() {
    //     return this._powers;
    // },
    // gainPower: function(power) {
    //     // Create an instance of the power and assign it to the entity?
    //     // Or:
    //     this._powers[power.name] = power;
    // },
    // activatePower: function(power) {
    //     // Call powers by name, e.g. "TestAttackPower"
    //     this._powers[power].activate(this);
    // },
    // canActivatePower: function(power) {
    //     return power.canActivate(this);
    //     //return this._powers[power].canActivate(this);
    // }
}