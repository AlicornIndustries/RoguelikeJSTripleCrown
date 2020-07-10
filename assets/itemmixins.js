Game.ItemMixins = {}; // Setup namespace

Game.ItemMixins.Edible = {
    name: "Edible",
    init: function(template) {
        // Number of points to add to fullness
        this._foodValue = template['foodValue'] || 5;
        // Number of times item can be consumed
        this._maxConsumptions = template["consumptions"] || 1;
        this._remainingConsumptions = this._maxConsumptions;
    },
    getFoodValue: function() {
        return this._foodValue;
    },
    changeRemainingConsumptions: function(delta) {
        this._remainingConsumptions = Math.max(this._remainingConsumptions+delta,0)
    },
    hasRemainingConsumptions: function() {
        return this._remainingConsumptions>0;
    },
    describe: function() {
        if(this._maxConsumptions!=this._remainingConsumptions) {
            return 'partly eaten '+Game.Item.prototype.describe.call(this);
        } else {
            return this._name;
        }
    },
    listeners: {
        details: function() {
            console.log("details was called");
            //console.log({key: "food", value: this._foodValue});
            //return [{key: "test", value: 69}]; // This still returns a blank array
            results = {key: "test", value: 69};
            //results = 420; // Even this still returns a blank array
            return results;
            //return [{key: "food", value: this._foodValue}];
        }
    }
}
Game.ItemMixins.Quaffable = {
    name: "Quaffable",
    init: function(template) {
        this._toxic = template["toxic"] || false;
        this._maxQuaffs = template["quaffs"] || 1;
        this._remainingQuaffs = this._maxQuaffs;
        this._effect = template["effect"]; // TODO: replace with effects[], apply all of them
        this._effect.init(template["effectTemplate"]);
    },
    getEffects: function() {
        return this._effect;
    },
    isToxic: function() {
        return this._toxic;
    },
    changeRemainingQuaffs: function(delta) {
        this._remainingQuaffs = Math.max(this._remainingQuaffs+delta,0)
    },
    hasRemainingQuaffs: function() {
        return this._remainingQuaffs>0;
    },
    describe: function() {
        if(this._maxQuaffs!=this._remainingQuaffs) {
            return 'partly empty '+Game.Item.prototype.describe.call(this);
        } else {
            return this._name;
        }
    },
}

Game.ItemMixins.Stackable = {
    name: "Stackable",
    init: function(template) {
        this._maxStackSize = template["maxStackSize"] || 99;
        this._stackSize = template["stackSize"] || this._maxStackSize;
    },
    setStackSize: function(newSize) {
        this._stackSize = newSize;
    },
    changeStackSize: function(delta) {
        // Returns remaining capacity (if initial stack is 50, max is 99, and you add 50, returns -1, since 99-100=-1 spaces left)
        this._stackSize += delta;
        var excess = this._stackSize-this._maxStackSize;
        this._stackSize = Math.min(this._stackSize,this._maxStackSize);
        return excess*-1;
        // Deleting the item when stackSize<=0 is caused by the entity doing the rangedAttack, in Attacker
    },
    splitStack: function() {
        // TODO. This might need to be a function of the InventoryHolder.
    },
    getStackSize: function() {
        return this._stackSize;
    },
    getMaxStackSize: function() {
        return this._maxStackSize
    },
    stacksWith: function(item) {
        // If this stack is already full, can't stack it at all
        if(this._stackSize == this._maxStackSize) {
            return false;
        }
        // If both items have same name and material, they can be stacked.
        if(this._name == item.getName()) {
            // Same name
            if(this.hasMixin("MaterialHaver") && item.hasMixin("MaterialHaver")) {
                if(this._material==item.getMaterial()) {
                    // Same name and material
                    return true;
                } else {
                    // Same name, different material
                    return false;
                }
            }
        } else {
            // Different names
            return false;
        }
    }
}

Game.ItemMixins.Equippable = {
    name: "Equippable",
    groupName: "Equippable",
    init: function(template) {
        this._wieldable = template["wieldable"] || false;
        this._wearable = template["wearable"] || false;
        this._quiverable = template["quiverable"] || false; // TODO: May remove this.
        this._passiveBoosts = {}; // Bonuses the item provides when equipped
        // Populate item passive boosts
        //this._passiveBoosts[Game.Enums.MELEEDAMAGE] = 100;
    },
    isWieldable: function() {return this._wieldable;},
    isWearable: function() {return this._wearable;},
    isQuiverable: function() {return this._quiverable;}, // TODO: Move this to ProjectileAmmo?
    getPassiveBoosts: function() {return this._passiveBoosts;},
    listeners: {
        details: function() {
            var results = [];
            if(this._wieldable) {
                results.push({key: "damage value", value: this._damageValue});
                results.push({key: "damage type", value: this._damageType});
                results.push({key: "attack value", value: this._attackValue});
            }
            if(this._wearable) {
                results.push({key: "durability", value: (this._armorDurability.toString()+"/"+this._maxArmorDurability.toString())});
                results.push({key: "damage reduction", value: this._armorReduction});
                results.push({key: "defense value", value: this._defenseValue});
            }
        }
    }
}
Game.ItemMixins.Weapon = {
    name: "Weapon",
    init: function(template) {
        this._weaponType = template["weaponType"] || null;
        this._attackValue = template["attackValue"] || 0;
        this._damageValue = template['damageValue'] || 0;
        this._damageType = template["damageType"] || null;
        this._defenseValue = template["defenseValue"] || 0;
        this._critChance = template["critChance"] || this._weaponType.critChanceBase;
        this._critDamageMult = template["critDamageMult"] || this._weaponType.critDamageMultBase;
        this._effectOnHit = template["effectOnHit"] || null; // TODO: replace with array of effects. FUTURE: Add effectsOnCrit, effectsOnKill...
        if(this._effectOnHit!=null) {
            this._effectOnHit.init(template["effectOnHitTemplate"])
        }
    },
    getWeaponType: function() {return this._weaponType},
    getAttackValue: function() {return this._attackValue;},
    getDamageValue: function(thrown=false) {  // FUTURE/TODO: Remove the 'thrown' check. Replace with a damageRange system for e.g. 2d6 or whatever damage. Weapons will do strength+damageValue.
        if(!thrown) {
            return this._damageValue;
        } else {
            return this._thrownDamageValue;
        }
    },
    getDamageType: function() {return this._damageType;},
    getCritChance: function() {return this._critChance},
    getCritDamageMult: function() {return this._critDamageMult},
    getWeaponType: function() {return this._weaponType},
    isWieldable: function() {return this._wieldable;},
    getEffectsOnHit: function() {return this._effectOnHit;}
}
Game.ItemMixins.Armor = {
    name: "Armor",
    init: function(template) {
        this._defenseValue = template["defenseValue"] || 0;
        this._maxArmorDurability = template["armorDurability"] || 0;
        this._armorDurability = this._maxArmorDurability || 0;
        this._armorReduction = template["armorReduction"] || 0;
        this._armorType = template["armorType"] || null;
    },
    getDefenseValue: function() {
        return this._defenseValue;
    },
    getMaxArmorDurability: function() {
        return this._maxArmorDurability;
    },
    getArmorDurability: function() {
        return this._armorDurability;
    },
    damageArmor: function(damage) { // TODO: add damageType
        // for a hit that deals damage, calculate reduction to armor durability
        // Return bleed-through damage transferred to the armor's wearer
        
        // Apply damage reduction
        damage = Math.max(1,damage-this._armorReduction);

        // For now, armor absorbs all damage while it's above 70% AD, falling off below that. TODO: replace with smooth curve, perhaps.
        var percentDurability = this._armorDurability * 1.0 / this._maxArmorDurability;
        var transferredDamage = 0;
        if(percentDurability>=0.7) {
            // Apply all damage to armor durability.
            this._armorDurability -= damage;
            if(this._armorDurability>=0) {
                return 0; // All damage absorbed by armor
            } else { // If AD is negative, set it to 0 and return the excess damage as bleed-through
                transferredDamage = -1 * this._armorDurability;
                this._armorDurability = 0;
                return transferredDamage;
            }
        } else if(percentDurability>=0.2) {
            var absorption = (1.6*percentDurability)-0.12; // % of damage taken by armor
            transferredDamage = damage*(1-absorption);
            // Apply non-transferred damage to armor to armor
            this._armorDurability -= damage-transferredDamage;
            if(this._armorDurability>=0) {
                return transferredDamage;
            } else { // AD negative, armor broken.
                transferredDamage += -1*this._armorDurability;
                this._armorDurability = 0;
                return transferredDamage;
            }
        } else if(percentDurability>0) { // Armor below 20%, absorbs flat 20% of damage
            var absorption = 0.2;
            transferredDamage = damage*(1-absorption);
            // Apply non-transferred damage to armor to armor
            this._armorDurability -= damage-transferredDamage;
            if(this._armorDurability>=0) {
                return transferredDamage;
            } else { // AD negative, armor broken.
                transferredDamage += -1*this._armorDurability;
                this._armorDurability = 0;
                return transferredDamage;
            }
        } else if(percentDurability<=0) {
            return damage+this._armorReduction; // All damage is transferred, and armor reduction does nothing (add it in to cancel out when we subtracted)
        }
    },
    getArmorReduction: function() {
        return this._armorReduction;
    },
    getArmorType: function() {
        return this._armorType;
    },
}

// For projectile weapons (bows, crossbows)
Game.ItemMixins.ProjectileLauncher = {
    name: "ProjectileLauncher",
    groupName: "ProjectileLauncher",
    init: function(template) {
        this._rangedAttackValue = template["rangedAttackValue"] || 50;
        this._rangedDamageValue = template["rangedDamageValue"];
        this._rangedDamageType = Game.Enums.DamageTypes.PIERCING; // TODO: get this from the ammo
        this._range = template['range'] || 5;
    },
    getRangedAttackValue: function() {
        return this._rangedAttackValue;
    },
    getRangedDamageValue: function() {
        return this._rangedDamageValue;
    },
    getRangedDamageType: function() {
        if(this._ammo!=null) {
            return this._ammo.getRangedDamageType();
        }
        else {
            return null;
        }
    },
    getRange: function() {
        return this._range;
    },
    getRangedCritChance: function() {return this._critChance}, // FUTURE/TODO: Separate these from the melee values. Make a getCritChance(attackType) method?
    getRangedCritDamageMult: function() {return this._critDamageMult},
    // FUTURE/TODO: add listeners, details
}
// For arrows 
Game.ItemMixins.ProjectileAmmo = {
    name: "ProjectileAmmo",
    groupName: "ProjectileAmmo",
    init: function(template) {
        this._rangedDamageValue = template["rangedDamageValue"] || 1;
        this._rangedDamageType = template["rangedDamageType"] || Game.Enums.DamageTypes.PIERCING;
    },
    getRangedDamageValue: function() {
        return this._rangedDamageValue;
    },
    getRangedDamageType: function() {
        return this._rangedDamageType;
    }
}

Game.ItemMixins.Throwable = {
    name: "Throwable",
    init: function(template) {
        this._thrownAttackValue = template["thrownAttackValue"] || 50;
        this._thrownDamageValue = template["thrownDamageValue"] || 1; // FUTURE: base this off of item's weight
        this._thrownCritChance = template["thrownCritChance"] || 5;
        this._thrownCritDamageMult = template["thrownCritDamageMult"] || 2;
        this._thrownDamageType = template["thrownDamageType"] || Game.Enums.DamageTypes.BLUNT
        this._quiverableThrowing = template["quiverableThrowing"] || false;
    },
    getThrownAttackValue: function() {return this._thrownAttackValue},
    getThrownDamageValue: function() {return this._thrownDamageValue;},
    getThrownDamageType: function() {return this._thrownDamageType;},
    getThrownCritChance: function() {return this._thrownCritChance;},
    getThrownCritDamageMult: function() {return this._thrownCritDamageMult;},
    isQuiverableThrowing: function() {return this._quiverableThrowing;}

}

// For items made of a particular material, such as bronze, steel, or silver
Game.ItemMixins.MaterialHaver = {
    name: "MaterialHaver",
    init: function(template) {
        this._material = template["material"] || template["defaultMaterial"];
    },
    getMaterial: function() {
        return this._material;
    },
    setMaterial: function(material) {
        this._material = material;
        /* // doesn't work (I suspect the "in" is used wrong)
        if(material in Game.Enums.Materials) {
            this._material = material;
        }
        else {
            console.log("Failed to set to nonexistent material: "+material.name);
        }
        */
    }
}