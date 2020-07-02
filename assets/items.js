Game.ItemRepository = new Game.Repository("items", Game.Item);

Game.ItemRepository.define("apple", {
    name: "apple",
    character: "%",
    foreground: "red",
    foodValue: 50,
    mixins: [Game.ItemMixins.Edible]
});
Game.ItemRepository.define("melon", {
    name: "melon",
    character: "%",
    foreground: "lightGreen",
    foodValue: 35,
    consumptions: 4,
    mixins: [Game.ItemMixins.Edible]
});
Game.ItemRepository.define("horta blossom", { // For later alchemical uses. Greek for "weeds, wild green".
    name: "horta blossom",
    character: "%",
    foreground: "green",
    foodValue: 10,
    mixins: [Game.ItemMixins.Edible]
});
Game.ItemRepository.define("rock", {
    name: "rock",
    character: "*",
    foreground: "white"
});
Game.ItemRepository.define("corpse", {
    name: "corpse",
    character: "%",
    foodValue: 75,
    consumptions: 1,
    mixins: [Game.ItemMixins.Edible]},
    {disableRandomCreation: true
});

// Weapons
Game.ItemRepository.define("shortsword", {
    name:"shortsword",
    character: ")",
    foreground: "white",
    attackValue: 5,
    damageValue: 5,
    damageType: Game.Enums.DamageTypes.SLASHING,
    wieldable: true,
    possibleMaterials: [
        Game.Enums.Materials.IRON, Game.Enums.Materials.STEEL, Game.Enums.Materials.BRONZE, Game.Enums.Materials.SILVER
    ],
    defaultMaterial: Game.Enums.Materials.STEEL,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver]},
    {disableRandomCreation: true
});
Game.ItemRepository.define("longsword", {
    name:"longsword",
    character: ")",
    foreground: "white",
    attackValue: 5,
    damageValue: 8,
    damageType: Game.Enums.DamageTypes.SLASHING,
    wieldable: true,
    possibleMaterials: [
        Game.Enums.Materials.IRON, Game.Enums.Materials.STEEL, Game.Enums.Materials.BRONZE, Game.Enums.Materials.SILVER
    ],
    defaultMaterial: Game.Enums.Materials.STEEL,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver]},
    {disableRandomCreation: true
});
Game.ItemRepository.define("staff", {
    name: "staff",
    character: ")",
    foreground: "yellow",
    attackValue: 5,
    damageValue: 2,
    damageType: Game.Enums.DamageTypes.BLUNT,
    wieldable: true,
    possibleMaterials: [
        Game.Enums.Materials.WOOD
    ],
    defaultMaterial: Game.Enums.Materials.WOOD,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver]},
    {disableRandomCreation: true
});
// Wearables
Game.ItemRepository.define("padded barding", {
    name: "padded barding",
    character: "[",
    foreground: "DarkKhaki",
    defenseValue: 0,
    armorDurability: 25,
    armorReduction: 2,
    armorType: Game.Enums.ArmorTypes.LIGHT,
    wearable: true,
    possibleMaterials: [Game.Enums.Materials.CLOTH],
    defaultMaterial: Game.Enums.Materials.CLOTH,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver]},
    {disableRandomCreation: true
});
/*
Game.ItemRepository.define("chain mail barding", {
    name: "chain mail barding",
    character: "[",
    foreground: "aliceblue",
    defenseValue: 0, // No effect on dodge
    armorDurability: 40,
    armorReduction: 3,
    armorType: Game.Enums.ArmorTypes.CHAINMAIL,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]},
    {disableRandomCreation: true
});
Game.ItemRepository.define("crude plate barding", {
    name: "crude plate barding",
    character: "[",
    foreground: "dimGrey", // change color to something more visible. TODO
    defenseValue: -20, // Reduces dodge chance
    armorDurability: 60,
    armorReduction: 4,
    armorType: Game.Enums.ArmorTypes.PLATE,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]},
    {disableRandomCreation: true
})
Game.ItemRepository.define("orichalcum plate barding", {
    name: "orichalcum plate barding",
    character: "[",
    foreground: "firebrick",
    defenseValue: -10,
    armorDurability: 300,
    armorReduction: 10,
    armorType: Game.Enums.ArmorTypes.PLATE,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]},
    {disableRandomCreation: true
});
*/