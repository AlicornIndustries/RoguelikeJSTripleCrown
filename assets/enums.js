// Keep in mind that this is really e.g. Game.Enums.BoostTypes["MELEEDAMAGE"]


Game.Enums = {
    DamageTypes: Object.freeze({
        SLASHING: "slashing",
        BLUNT: "blunt",
        PIERCING: "piercing"
    }),
    Skills: Object.freeze({
        ARMORER: {name: "armorer"}, // could use the "another way to format" to have different names for each level.
        ARCHERY: {name: "archery"},
        MELEEWEAPONS: {name: "melee weapons"}, // "Swordsmareship?" Have skill SubTypes?
        SCOUTING: {name: "scouting"},
        THAUMATURGY: {name: "thaumaturgy"}
    }),
    Materials: Object.freeze({
        CLOTH: {name: "cloth", value: 5},
        IRON: {name: "iron", value: 10},    // Bonuses vs. magical creatures
        SILVER: {name: "silver", value: 20},    // Bonuses vs. were-creatures, vampires and slimes (poisonous)
        WOOD: {name: "wood", adj: "wooden", value: 5},
        BRONZE: {name: "bronze", value: 8},
        ORICHALCUM: {name: "orichalcum", value: 30},
        MYTHRIL: {name: "mythril", value: 30},
        STEEL: {name: "steel", value: 15}
    }),
    ArmorTypes: Object.freeze({
        UNARMORED: "unarmored",
        CLOTH: "cloth",
        PLATE: "plate",
        CHAINMAIL: "chain mail",
    }),
    AttackTypes: Object.freeze({
        MELEE: {name: "melee"},
        RANGED: {name: "ranged"},
        THROWN: {name: "thrown"}
    }),
    WeaponTypes: Object.freeze({
        SWORD: {name: "sword", critChanceBase: 10, critDamageMultBase: 2},
        KNIFE: {name: "knife", critChanceBase: 20, critDamageMultBase: 4},
        AXE: {name: "axe", critChanceBase: 5, critDamageMultBase: 4},
        POLEARM: {name: "polearm", critChanceBase: 10, critDamageMultBase: 2},
        UNARMED: {name: "unarmed", critChanceBase: 20, critDamageMultBase: 4},
        BOW: {name: "bow", Subtypes: {
            BOW: {name: "bow", critChanceBase: 10, critDamageMultBase: 2},
            CROSSBOW: {name: "crossbow", critChanceBase: 5, critDamageMultBase: 2}
        }},
    }),
    BoostTypes: Object.freeze({ // all the things a skill can potentially boost
        MELEEDAMAGE: {name:"melee damage"},
        MELEECRITCHANCE: {name: "melee crit chance"},
        MELEECRITMULT: {name: "melee crit mult"},
        RANGEDDAMAGE: {name: "ranged damage"},
        RANGEDCRITCHANCE: {name: "ranged crit chance"},
        RANGEDCRITMULT: {name: "ranged crit mult"},
        THROWNDAMAGE: {name: "thrown damage"},
        THROWNCRITCHANCE: {name: "thrown crit chance"},
        THROWNCRITMULT: {name: "thrown crit mult"},
        SIGHTRADIUS: {name: "sight radius"}
    }),
    Races: Object.freeze({
        PonyRaces: {
            EARTH: {
                name: "earth pony", 
                raceSelectionDescription: "Sturdy and brave, earth ponies are ideal warriors. Their knack for nature makes them powerful druids, as well.",
                statBonuses: {strength:1,endurance:1,agility:0,intelligence:0,willpower:1},
            },
            UNICORN: {
                name: "unicorn",
                raceSelectionDescription: "Unicorns make up for their physical frailty with a capacity for magic unparalleled among the pony races.",
                statBonuses: {strength:0,endurance:0,agility:1,intelligence:1,willpower:0},
            },
            PEGASUS: {
                name: "pegasus",
                raceSelectionDescription: "The noblest of the nimble pegasi serve as champions of the Royal Sisters sky cavalry or control the weather of Equestria, while pegasi lowlifes exploit their speed and unique capacity for flight to carry out grand larcenies.",
                statBonuses: {strength:0,endurance:0,agility:1,intelligence:0,willpower:1},
            },
        },
        SingularMonsterRaces: {
            // For monsters with only one race
            WINDIGO: {name: "windigo"},
            MANTICORE: {name: "manticore"},
        },
        // then have e.g. TimberwolfRaces, 
    }),
}
// Has to be defined here and added to the enum since it references things (races,materials) in the enum
Game.Enums.CharClasses = Object.freeze({
    PlayerClasses: {
        // NOTE: starting items are actually added using screens.js, createPlayer. The extraProperties need to be listed there, as well.
        SOLDIER: {
            name: "soldier", races: [Game.Enums.Races.PonyRaces.EARTH,Game.Enums.Races.PonyRaces.PEGASUS,Game.Enums.Races.PonyRaces.UNICORN],
            startingItems: [
                {name: "shortsword", material:Game.Enums.Materials.STEEL},
                {name: "padded barding"},
                {name: "potion of healing"},
                {name: "potion of bleeding"},
                {name: "apple"},
                {name: "shuriken"}
            ],
        },
        WIZARD: {
            name: "wizard", races: [Game.Enums.Races.PonyRaces.UNICORN],
            startingItems: [
                {name: "staff", material:Game.Enums.Materials.WOOD},
                {name: "apple"}
            ],
        },
        DRUID: {
            name: "druid", races: [Game.Enums.Races.PonyRaces.EARTH],
            startingItems: [
                {name: "staff", material:Game.Enums.Materials.WOOD},
                {name: "apple"}
            ],
        },
        RANGER: {
            name: "ranger", races:[Game.Enums.Races.PonyRaces.PEGASUS],
            startingItems: [
                {name: "shortsword", material: Game.Enums.Materials.STEEL},
                {name: "bow"},
                {name: "arrow", stackSize:10},
                {name: "apple"}
            ],
        },
    }
});