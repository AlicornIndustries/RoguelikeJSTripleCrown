const DamageTypes = Object.freeze({
    SLASHING: "slashing",
    BLUNT: "blunt",
    PIERCING: "piercing"
});

const ArmorTypes = Object.freeze({
    UNARMORED: "unarmored",
    CLOTH: "cloth",
    PLATE: "plate",
    CHAINMAIL: "chain mail",
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