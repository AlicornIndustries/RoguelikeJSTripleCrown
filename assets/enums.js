const DamageTypes = Object.freeze({
    SLASHING: "slashing",
    BLUNT: "blunt",
    PIERCING: "piercing"
});

// Probably won't use this much, beyond UNARMORED.
const ArmorTypes = Object.freeze({
    UNARMORED: "unarmored",
    CLOTH: "cloth",
    PLATE: "plate",
    CHAINMAIL: "chain mail",
});

const SkillTerms = Object.freeze({
    ARMORER: "armorer", // could use the "another way to format" to have different names for each level.
    MELEEWEAPONS: "melee weapons",
    SCOUT: "scout",

});

const Races = Object.freeze({
    PonyRaces: {
        EARTH: {name: "earth pony", raceSelectionDescription: "Sturdy and brave, earth ponies are ideal warriors. Their knack for nature makes them powerful druids, as well."},
        UNICORN: {name: "unicorn", raceSelectionDescription: "Unicorns make up for their physical frailty with a capacity for magic unparalleled among the pony races."},
        PEGASUS: {name: "pegasus", raceSelectionDescription: "The noblest of the nimble pegasi serve as champions of the Royal Sisters sky cavalry or control the weather of Equestria, while pegasi lowlifes exploit their speed and unique capacity for flight to carry out grand larcenies."}
    },
    SingularMonsterRaces: {
        // For monsters with only one race
        WINDIGO: {name: "windigo"},
        MANTICORE: {name: "manticore"},
    },
    // then have e.g. TimberwolfRaces, 
});

const CharClasses = Object.freeze({
    PlayerClasses: {
        SOLDIER: {name: "soldier", races: [Races.PonyRaces.EARTH,Races.PonyRaces.PEGASUS,Races.PonyRaces.UNICORN]},
        WIZARD: {name: "wizard", races: [Races.PonyRaces.UNICORN]},
        DRUID: {name: "druid", races: [Races.PonyRaces.EARTH]},
        ROGUE: {name: "rogue", races:[Races.PonyRaces.PEGASUS]},
    }

    /*
    BARBARIAN: "barbarian", // earth/pegasus
    SOLDIER: "soldier",     // any
    RANGER: "ranger",       // any
    MAGE: "mage",           // unicorn
    DRUID: "druid",         // earth
    THIEF: "thief",         // any
    */
});

// const CharRaces = Object.freeze({
//     EARTH: {name: "earth pony", raceSelectionDescription: "Sturdy and brave, earth ponies are ideal warriors. Their knack for nature makes them powerful druids, as well."},
//     UNICORN: {name: "unicorn", raceSelectionDescription: "Unicorns make up for their physical frailty with a capacity for magic unparalleled among the pony races."},
//     PEGASUS: {name: "pegasus", raceSelectionDescription: "The noblest of the nimble pegasi serve as champions of the Royal Sisters sky cavalry or control the weather of Equestria, while pegasi lowlifes exploit their speed and unique capacity for flight to carry out grand larcenies."}
// })


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