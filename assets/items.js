Game.ItemRepository = new Game.Repository("items", Game.Item);

Game.ItemRepository.define("apple", {
    name: "apple",
    character: "%",
    foreground: "red",
    foodValue: 50,
    mixins: [Game.ItemMixins.Edible,Game.ItemMixins.Throwable]
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
    foreground: "white",
    mixins: [Game.ItemMixins.Throwable]
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
    weaponType: Game.Enums.WeaponTypes.SWORD,
    attackValue: 5,
    damageValue: 5,
    damageType: Game.Enums.DamageTypes.SLASHING,
    wieldable: true,
    effectOnHit: Game.Effects.Bleed,
    effectOnHitTemplate: {
        bleedAmount: 10,
        duration: 3
    },
    possibleMaterials: [
        Game.Enums.Materials.IRON, Game.Enums.Materials.STEEL, Game.Enums.Materials.BRONZE, Game.Enums.Materials.SILVER
    ],
    defaultMaterial: Game.Enums.Materials.STEEL,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver,Game.ItemMixins.Weapon]},
    {disableRandomCreation: true
});
Game.ItemRepository.define("shortsword of bleeding", {
    name:"shortsword",
    character: ")",
    foreground: "lightRed",
    weaponType: Game.Enums.WeaponTypes.SWORD,
    attackValue: 5,
    damageValue: 5,
    damageType: Game.Enums.DamageTypes.SLASHING,
    wieldable: true,
    effectOnHit: Game.Effects.Bleed,
    effectOnHitTemplate: {
        bleedAmount: 10,
        duration: 3
    },
    possibleMaterials: [
        Game.Enums.Materials.IRON, Game.Enums.Materials.STEEL, Game.Enums.Materials.BRONZE, Game.Enums.Materials.SILVER
    ],
    defaultMaterial: Game.Enums.Materials.STEEL,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver,Game.ItemMixins.Weapon]},
    {disableRandomCreation: true
});
Game.ItemRepository.define("longsword", {
    name:"longsword",
    character: ")",
    foreground: "white",
    weaponType: Game.Enums.WeaponTypes.SWORD,
    attackValue: 5,
    damageValue: 8,
    damageType: Game.Enums.DamageTypes.SLASHING,
    wieldable: true,
    possibleMaterials: [
        Game.Enums.Materials.IRON, Game.Enums.Materials.STEEL, Game.Enums.Materials.BRONZE, Game.Enums.Materials.SILVER
    ],
    defaultMaterial: Game.Enums.Materials.STEEL,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver,Game.ItemMixins.Weapon]},
    {disableRandomCreation: true
});
Game.ItemRepository.define("staff", {
    name: "staff",
    character: ")",
    foreground: "yellow",
    weaponType: Game.Enums.WeaponTypes.POLEARM,
    attackValue: 5,
    damageValue: 2,
    damageType: Game.Enums.DamageTypes.BLUNT,
    wieldable: true,
    possibleMaterials: [
        Game.Enums.Materials.WOOD
    ],
    defaultMaterial: Game.Enums.Materials.WOOD,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver,Game.ItemMixins.Throwable,Game.ItemMixins.Weapon]},
    {disableRandomCreation: true
});
Game.ItemRepository.define("bow", {
    name: "bow",
    character: ")",
    foreground: "yellow",
    weaponType: Game.Enums.WeaponTypes.BOW.Subtypes.BOW,
    attackValue: 0,
    damageValue: 1,
    damageType: Game.Enums.DamageTypes.BLUNT,
    rangedAttackValue: 10,
    rangedDamageValue: 0,
    range: 3,
    wieldable: true,
    possibleMaterials: [
        Game.Enums.Materials.WOOD
    ],
    defaultMaterial: Game.Enums.Materials.WOOD,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver,Game.ItemMixins.ProjectileLauncher,Game.ItemMixins.Weapon]},
    {disableRandomCreation: true
});
// Ammo
Game.ItemRepository.define("arrow", {
    name: "arrow",
    character: "*",
    foreground: "yellow",
    rangedDamageValue: 5,
    rangedDamageType: Game.Enums.DamageTypes.PIERCING,
    quiverable: true,
    possibleMaterials: [
        Game.Enums.Materials.WOOD
    ],
    defaultMaterial: Game.Enums.Materials.WOOD,
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.ProjectileAmmo,Game.ItemMixins.MaterialHaver,Game.ItemMixins.Stackable,Game.ItemMixins.Throwable]},
    {disableRandomCreation: true
});
// Throwing weapons
Game.ItemRepository.define("shuriken", {
    name: "shuriken",
    character: ")",
    foreground: "cornflowerBlue",
    thrownAttackValue: 10,
    thrownDamageValue: 5,
    thrownDamageType: Game.Enums.DamageTypes.SLASHING,
    thrownCritChance: 30,
    thrownCritDamageMult: 3,
    quiverableThrowing: true,
    possibleMaterials: [
        Game.Enums.Materials.IRON,
        Game.Enums.Materials.STEEL,
    ],
    defaultMaterial: Game.Enums.Materials.STEEL,
    mixins: [Game.ItemMixins.MaterialHaver]},
    {disableRandomCreation: true
});
// Potions/Quaffables
Game.ItemRepository.define("potion of healing", {
    name: "potion of healing",
    character: "!",
    foreground: "pink",
    effect: Game.Effects.Heal,
    effectTemplate: {
        healAmount: 5,
        duration: 3
    },
    mixins: [Game.ItemMixins.Quaffable,Game.ItemMixins.Throwable]},
    {disableRandomCreation: true
});
Game.ItemRepository.define("potion of bleeding", {
    name: "potion of bleeding",
    character: "!",
    foreground: "greenYellow",
    toxic: true,
    effect: Game.Effects.Bleed,
    effectTemplate: {
        bleedAmount: 10,
        duration: 3
    },
    intendedToBeThrown: true,
    mixins: [Game.ItemMixins.Quaffable,Game.ItemMixins.Throwable]},
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
    mixins: [Game.ItemMixins.Equippable,Game.ItemMixins.MaterialHaver,Game.ItemMixins.Armor]},
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