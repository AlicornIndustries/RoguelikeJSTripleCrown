// Entity templates.

// Player template.
Game.PlayerTemplate = {
    character: "@",
    foreground: "white",
    background: "black",
    maxHp: 40,
    attackValue: 70,
    defenseValue: 0,
    sightRadius: 6,
    inventorySlots: 22,
    mixins: [Game.EntityMixins.PlayerActor, Game.EntityMixins.Attacker,
             Game.EntityMixins.Destructible, Game.EntityMixins.Sight,
             Game.EntityMixins.MessageRecipient, Game.EntityMixins.InventoryHolder,
             Game.EntityMixins.FoodConsumer]
}

// Non-player templates are held in repositories
// Create central entity repository
Game.EntityRepository = new Game.Repository("entities", Game.Entity);

Game.EntityRepository.define("fungus", {
    name: "fungus",
    character: "F",
    foreground: "chartreuse",
    background: "black",
    maxHp: 3,
    defenseValue: 0,
    mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible]
});
Game.EntityRepository.define("timberwolf", {
    name: "timberwolf",
    character: "t",
    foreground: "chocolate",
    background: "black",
    maxHp: 5,
    attackValue: 50,
    defenseValue: 0,
    mixins: [Game.EntityMixins.WanderActor, Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible, Game.EntityMixins.CorpseDropper]
});
Game.EntityRepository.define("dire timberwolf", {
    name: "dire timberwolf",
    character: "T",
    foreground: "chocolate",
    background: "black",
    maxHp: 7,
    attackValue: 60,
    defenseValue: 0,
    mixins: [Game.EntityMixins.WanderActor, Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible, Game.EntityMixins.CorpseDropper]
});