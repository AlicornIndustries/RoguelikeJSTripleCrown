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
    foreground: "brightGreen",
    foodValue: 35,
    consumptions: 4,
    mixins: [Game.ItemMixins.Edible]
});
Game.ItemRepository.define("horta blossom", { // For later alchemical uses. Greek for "weeds, wild green".
    name: "horta blossom",
    character: "%",
    foreground: "ffcc33",
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

// TODO: Make a cooking system. Eezee Bake Oven item. Or ignore that and just go with alchemy.