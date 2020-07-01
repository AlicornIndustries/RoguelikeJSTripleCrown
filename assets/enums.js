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

// Make an enum for classes?

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