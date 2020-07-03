Game.Skills = {};

Game.Skills.Armorer = {
    name: Game.Enums.SkillTerms.ARMORER,
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

Game.Skills.MeleeWeapons = {
    name: Game.Enums.SkillTerms.MELEEWEAPONS,
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

Game.Skills.Scout = {
    name: Game.Enums.SkillTerms.Scout,
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