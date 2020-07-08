Game.Skills = {};

Game.Skills.createSkill = function(skillTerm, skillOwner) {
    // TODO: Should this call the new skill's init?
    // in: Game.Enums.Skills.ARCHERY, out: Game.Skills.Archery

    if(skillTerm==Game.Enums.Skills.MELEEWEAPONS) {
        var skill = Object.create(Game.Skills.MeleeWeapons);
        skill.init(skillOwner);
        return skill;
    } else if(skillTerm==Game.Enums.Skills.ARCHERY) {
        var skill = Object.create(Game.Skills.Archery);
        skill.init(skillOwner);
        return skill;
    } else {
        console.log("Tried to create unsupported skill "+skillTerm.name);
        return false;
    }
}

Game.Skills.MeleeWeapons = {
    name: Game.Enums.Skills.MELEEWEAPONS.name,
    init: function(skillOwner) {
        this._owner = skillOwner; // entity with the SkillsHaver plugin
        this._skillLevel = 0;
        this._meleeDamageBoost = 0;
        this._swordDamageBoost = 10; // Testing value TODO: Could be remade as:
        // this._weaponDamageBoosts = {Game.Enums.WeaponTypes.SWORD: 50, Game.Enums.WeaponTypes.AXE: 25}
        this._weaponDamageBoosts = {};
        // Populate weapon damage boosts
        this._weaponDamageBoosts[Game.Enums.WeaponTypes.SWORD.name] = 0;
        this._weaponDamageBoosts[Game.Enums.WeaponTypes.KNIFE.name] = 0;
        this._weaponDamageBoosts[Game.Enums.WeaponTypes.AXE.name] = 0;
        this._weaponDamageBoosts[Game.Enums.WeaponTypes.POLEARM.name] = 0;
        this._weaponDamageBoosts[Game.Enums.WeaponTypes.UNARMED.name] = 0;
        this._weaponDamageBoosts[Game.Enums.WeaponTypes.BOW.Subtypes.BOW.name] = 0;
        this._weaponDamageBoosts[Game.Enums.WeaponTypes.BOW.Subtypes.CROSSBOW.name] = 0;
        //console.log(this._weaponDamageBoosts[Game.Enums.WeaponTypes.SWORD.name]);
    },
    getSkillLevel: function() {return this._skillLevel},
    getBoost: function(boostType,extraProperties) {
        switch(boostType) {
            case Game.Enums.BoostTypes.MELEEDAMAGE:
                var modifier = 0;
                console.log(extraProperties);
                if(extraProperties["weapon"]!=null) {
                    modifier+=this._weaponDamageBoosts[extraProperties["weapon"].getWeaponType().name];
                }
                return this._meleeDamageBoost+modifier;
            default:
                return null;
        }



        // if(typeof boostType==="object") { // boostType is e.g. Game.Enums.BoostTypes.MELEEDAMAGE
        //     switch(boostType) {
        //         case Game.Enums.BoostTypes.MELEEDAMAGE: 
        //             console.log(this._meleeDamageBoost);
        //             return this._meleeDamageBoost;
        //         default:
        //             return null;
        //     }
        // } else { // typeof boostType==="string", e.g. "MELEEDAMAGE"
        //     switch(boostType) {
        //         case "MELEEDAMAGE":
        //             return this._meleeDamageBoost;
        //         default:
        //             return null;
        //     }
        // }
    },
    levelUp: function(level=1) {
        this._skillLevel += level;
        this.updateBoosts();
    },
    updateBoosts: function() {
        this._meleeDamageBoost = this._skillLevel;
    }
}
Game.Skills.Archery = {
    name: Game.Enums.Skills.ARCHERY.name,
    init: function(skillOwner) {
        this._owner = skillOwner; // entity with the SkillsHaver plugin
        this._skillLevel = 0;
        this._rangedDamageBoost = 0;
    },
    getSkillLevel: function() {return this._skillLevel},
    getBoost: function(boostType) {
        if(typeof boostType==="object") { // boostType is e.g. Game.Enums.BoostTypes.MELEEDAMAGE
            switch(boostType) {
                case Game.Enums.BoostTypes.RANGEDDAMAGE:
                    return this._rangedDamageBoost;
                default:
                    return null;
            }
        } else { // typeof boostType==="string", e.g. "MELEEDAMAGE"
            switch(boostType) {
                case "RANGEDDAMAGE":
                    return this._rangedDamageBoost;
                default:
                    return null;
            }
        }
    },
    levelUp: function(level=1) {
        this._skillLevel += level;
        this.updateBoosts();
    },
    updateBoosts: function() {
        this._rangedDamageBoost = this._skillLevel;
    }
}

// Game.Skills.Armorer = {
//     name: Game.Enums.Skills.ARMORER.name,
//     init: function() {
//         this._skillLevel = 0;
//         this._armorReductionBoost = 0;
//     },
//     getSkillLevel: function() {
//         return this._skillLevel;
//     },
//     getArmorReductionBoost: function() {
//         return this._armorReductionBoost;
//     },
//     levelUp: function(level) {
//         level = level || 1; // Default to 1
//         this._skillLevel += level;
//         this.updateBoosts();
//     },
//     updateBoosts: function() {
//         // After leveling up skill, update the bonuses it provides
//         this._armorReductionBoost = this._skillLevel;
//     }
// }

// Game.Skills.Archery = {
//     name: Game.Enums.Skills.ARCHERY.name,
//     init: function() {
//         this._skillLevel = 0;
//         this._rangedDamageValueBoost = 0; // make this only apply to Bow-type weapons?
//     },
//     getSkillLevel: function() {
//         return this._skillLevel;
//     },
//     getRangedDamageValueBoost() { // should this also care about the weapon in question?
//         return this._rangedDamageValueBoost;
//     },
//     levelUp: function(level) {
//         level = level || 1; // Default to 1
//         this._skillLevel += level;
//         this.updateBoosts();
//     },
//     updateBoosts: function() {
//         // After leveling up skill, update the bonuses it provides
//         this._rangedDamageValueBoost = this._skillLevel;
//     }
// }

// Game.Skills.MeleeWeapons = {
//     name: Game.Enums.Skills.MELEEWEAPONS.name,
//     init: function() {
//         this._skillLevel = 0;
//         this._damageValueBoost = 0;
//     },
//     getSkillLevel: function() {
//         return this._skillLevel;
//     },
//     getDamageValueBoost: function() {
//         return this._damageValueBoost;
//     },
//     levelUp: function(level) {
//         level = level || 1; // Default to 1
//         this._skillLevel += level;
//         this.updateBoosts();
//     },
//     updateBoosts: function() {
//         // After leveling up skill, update the bonuses it provides
//         this._damageValueBoost = this._skillLevel;
//     }
// }

// Game.Skills.Scouting = {
//     name: Game.Enums.Skills.SCOUTING.name,
//     init: function() {
//         this._skillLevel = 0;
//         this._sightRadiusBoost = 0;
//     },
//     getSkillLevel: function() {
//         return this._skillLevel;
//     },
//     getSightRadiusBoost: function() {
//         return this._sightRadiusBoost;
//     },
//     levelUp: function(level) {
//         level = level || 1; // Default to 1
//         this._skillLevel += level;
//         this.updateBoosts();
//     },
//     updateBoosts: function() {
//         // After leveling up skill, update the bonuses it provides
//         this._sightRadiusBoost = this._skillLevel;
//     }
// }