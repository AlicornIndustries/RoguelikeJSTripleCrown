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
    eat: function(entity) {
        if(entity.hasMixin("FoodConsumer")) {
            if(this.hasRemainingConsumptions()) {
                entity.modifyFullnessBy(this._foodValue);
                this._remainingConsumptions--;
            }
        }
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
    }
}

Game.ItemMixins.Equippable = {
    name: "Equippable",
    groupName: "Equipable",
    init: function(template) {
        this._attackValue = template["attackValue"] || 0;
        this._damageValue = template['damageValue'] || 0; // TODO: Replace with a system for e.g. 2d6 or whatever damage. Weapons will do strength+damageValue.
        this._damageType = template["damageType"] || null;
        this._defenseValue = template["defenseValue"] || 0;
        this._maxArmorDurability = template["armorDurability"] || 0;
        this._armorDurability = this._maxArmorDurability || 0;
        this._armorReduction = template["armorReduction"] || 0;
        this._armorType = template["armorType"] || null;
        this._wieldable = template["wieldable"] || false;
        this._wearable = template["wearable"] || false;
    },
    getAttackValue: function() {
        return this._attackValue;
    },
    getDamageValue: function() {
        return this._damageValue;
    },
    getDamageType: function() {
        return this._damageType;
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
        console.log(damage);

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
            return damage; // All damage is transferred. TODO: this still has damage reduction, though.
        }
    },
    getArmorReduction: function() {
        return this._armorReduction;
    },
    getArmorType: function() {
        return this._armorType;
    },
    isWieldable: function() {
        return this._wieldable;
    },
    isWearable: function() {
        return this._wearable;
    }
}