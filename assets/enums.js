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
    WeaponTypes: Object.freeze({
        SWORD: {name: "sword"},
        AXE: {name: "axe"},
        POLEARM: {name: "polearm"},
        UNARMED: {name: "unarmed"},
        BOW: {name: "bow", SubTypes: {
            BOW: {name: "bow"},
            CROSSBOW: {name: "crossbow"}
        }},
    }),
    Races: Object.freeze({
        PonyRaces: {
            EARTH: {
                name: "earth pony", 
                raceSelectionDescription: "Sturdy and brave, earth ponies are ideal warriors. Their knack for nature makes them powerful druids, as well.",},
            UNICORN: {name: "unicorn", raceSelectionDescription: "Unicorns make up for their physical frailty with a capacity for magic unparalleled among the pony races."},
            PEGASUS: {name: "pegasus", raceSelectionDescription: "The noblest of the nimble pegasi serve as champions of the Royal Sisters sky cavalry or control the weather of Equestria, while pegasi lowlifes exploit their speed and unique capacity for flight to carry out grand larcenies."}
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
                {name: "apple"}
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
                {name: "arrow", stackSize:3},
                {name: "apple"}
            ],
        },
    }
});

// Another way to do it???:
/*
Game.Enums = {
    dtypes: Object.freeze({
        SLASHING: "slashing",
        BLUNT: "blunt"
    })
}
*/

// TODO: see here https://www.sohamkamani.com/blog/2017/08/21/enums-in-javascript/
// to consider embedded enums.

/*
Another way to format:
const damageTypes = Object.freeze({
    SLASHING: {name: "slashing", otherProp: "whatever"},
    etc
});
https://stackoverflow.com/questions/44447847/enums-in-javascript-with-es6
*/