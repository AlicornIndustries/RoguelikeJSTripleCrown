Game.Skills = {};

Game.Skills.createSkill = function(skillTerm) {
    // TODO: Should this call the new skill's init?
    // in: Game.Enums.Skills.ARCHERY, out: Game.Skills.Archery
    if(skillTerm==Game.Enums.Skills.ARMORER) {
        return Object.create(Game.Skills.Armorer);
    } else if(skillTerm==Game.Enums.Skills.ARCHERY) {
        return Object.create(Game.Skills.Archery);
    } else if(skillTerm==Game.Enums.Skills.MELEEWEAPONS) {
        return Object.create(Game.Skills.MeleeWeapons);
    } else if(skillTerm==Game.Enums.Skills.SCOUTING) {
        return Object.create(Game.Skills.Scouting);
    } else {
        console.log("Tried to create unsupported skill "+skillTerm.name);
        return false;
    }
}

Game.Skills.Armorer = {
    name: Game.Enums.Skills.ARMORER.name,
    init: function() {
        this._skillLevel = 0;
        this._armorReductionBoost = 0;
    },
    getSkillLevel: function() {
        return this._skillLevel;
    },
    getArmorReductionBoost: function() {
        return this._armorReductionBoost;
    },
    levelUp: function(level) {
        level = level || 1; // Default to 1
        this._skillLevel += level;
        this.updateBoosts();
    },
    updateBoosts: function() {
        // After leveling up skill, update the bonuses it provides
        this._armorReductionBoost = this._skillLevel;
    }
}

Game.Skills.Archery = {
    name: Game.Enums.Skills.ARCHERY.name,
    init: function() {
        this._skillLevel = 0;
        this._rangedDamageValueBoost = 0; // make this only apply to Bow-type weapons?
    },
    getSkillLevel: function() {
        return this._skillLevel;
    },
    getRangedDamageValueBoost() { // should this also care about the weapon in question?
        return this._rangedDamageValueBoost;
    },
    levelUp: function(level) {
        level = level || 1; // Default to 1
        this._skillLevel += level;
        this.updateBoosts();
    },
    updateBoosts: function() {
        // After leveling up skill, update the bonuses it provides
        this._rangedDamageValueBoost = this._skillLevel;
    }
}

Game.Skills.MeleeWeapons = {
    name: Game.Enums.Skills.MELEEWEAPONS.name,
    init: function() {
        this._skillLevel = 0;
        this._damageValueBoost = 0;
    },
    getSkillLevel: function() {
        return this._skillLevel;
    },
    getDamageValueBoost: function() {
        return this._damageValueBoost;
    },
    levelUp: function(level) {
        level = level || 1; // Default to 1
        this._skillLevel += level;
        this.updateBoosts();
    },
    updateBoosts: function() {
        // After leveling up skill, update the bonuses it provides
        this._damageValueBoost = this._skillLevel;
    }
}

Game.Skills.Scouting = {
    name: Game.Enums.Skills.SCOUTING.name,
    init: function() {
        this._skillLevel = 0;
        this._sightRadiusBoost = 0;
    },
    getSkillLevel: function() {
        return this._skillLevel;
    },
    getSightRadiusBoost: function() {
        return this._sightRadiusBoost;
    },
    levelUp: function(level) {
        level = level || 1; // Default to 1
        this._skillLevel += level;
        this.updateBoosts();
    },
    updateBoosts: function() {
        // After leveling up skill, update the bonuses it provides
        this._sightRadiusBoost = this._skillLevel;
    }
}