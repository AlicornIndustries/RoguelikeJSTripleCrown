// Entity templates.

// Player template.
Game.PlayerTemplate = {
    name: "pony (you)",
    character: "@",
    foreground: "white",
    background: "black",
    maxHp: 100,
    attackValue: 100,
    rangedAttackValue: 70,
    strength: 3,
    endurance: 3,
    agility: 3,
    intelligence: 3,
    willpower: 3,
    unarmedDamageType: Game.Enums.DamageTypes.BLUNT,
    defenseValue: 20,
    sightRadius: 6,
    inventorySlots: 22,
    skills: [
        {skill: Game.Enums.Skills.ARCHERY, skillLevel: 10},
        {skill: Game.Enums.Skills.MELEEWEAPONS, skillLevel: 5},
    ],
    powers: [
        Game.Powers.TestAttackPower
    ],
    mixins: [Game.EntityMixins.PlayerActor, Game.EntityMixins.StatsHaver, Game.EntityMixins.StaminaHaver, Game.EntityMixins.Attacker,
             Game.EntityMixins.Destructible, Game.EntityMixins.Sight,
             Game.EntityMixins.MessageRecipient, Game.EntityMixins.InventoryHolder,
             Game.EntityMixins.FoodConsumer, Game.EntityMixins.Equipper,
             Game.EntityMixins.Affectable,
             Game.EntityMixins.SkillsHaver, Game.EntityMixins.ExperienceGainer,
             Game.EntityMixins.PlayerStatGainer, Game.EntityMixins.Classy, Game.EntityMixins.RaceHaver,
             Game.EntityMixins.PowersHaver]
}

// Non-player templates are held in repositories
// Create central entity repository
Game.EntityRepository = new Game.Repository("entities", Game.Entity);

Game.EntityRepository.define("fungus", {
    name: "fungus",
    character: "F",
    foreground: "chartreuse",
    background: "black",
    speed: 250,
    maxHp: 15,
    defenseValue: 0,
    mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.StatsHaver, Game.EntityMixins.Destructible, Game.EntityMixins.Affectable,
             Game.EntityMixins.ExperienceGainer, Game.EntityMixins.RandomStatGainer]
});
Game.EntityRepository.define("timberwolf", {
    name: "timberwolf",
    character: "t",
    foreground: "chocolate",
    background: "black",
    speed: 1000,
    maxHp: 20,
    attackValue: 70,
    strength: 5,
    unarmedDamageType: Game.Enums.DamageTypes.SLASHING,
    defenseValue: 0,
    tasks: ["hunt", "wander"],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.StatsHaver, Game.EntityMixins.StaminaHaver, Game.EntityMixins.Sight, Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible, Game.EntityMixins.CorpseDropper, Game.EntityMixins.Affectable,
        Game.EntityMixins.ExperienceGainer, Game.EntityMixins.RandomStatGainer]
});
Game.EntityRepository.define("dire timberwolf", {
    name: "dire timberwolf",
    character: "T",
    foreground: "chocolate",
    background: "black",
    speed: 1000,
    maxHp: 35,
    attackValue: 80,
    strength: 7,
    unarmedDamageType: Game.Enums.DamageTypes.SLASHING,
    defenseValue: 0,
    tasks: ["hunt", "wander"],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.StatsHaver, Game.EntityMixins.StaminaHaver, Game.EntityMixins.Sight, Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible, Game.EntityMixins.CorpseDropper, Game.EntityMixins.Affectable,
        Game.EntityMixins.ExperienceGainer, Game.EntityMixins.RandomStatGainer]
});
Game.EntityRepository.define("vampire bat", {
    name: "vampire bat",
    character: "B",
    foreground: "brown",
    background: "black",
    speed: 1500,
    maxHp: 10,
    attackValue: 60,
    strength: 1,
    unarmedDamageType: Game.Enums.DamageTypes.PIERCING,
    defenseValue: 0,
    tasks: ["hunt", "wander"],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.StatsHaver, Game.EntityMixins.StaminaHaver, Game.EntityMixins.Sight, Game.EntityMixins.Attacker,
        Game.EntityMixins.Destructible, Game.EntityMixins.CorpseDropper, Game.EntityMixins.Affectable,
        Game.EntityMixins.ExperienceGainer, Game.EntityMixins.RandomStatGainer]
});
Game.EntityRepository.define("windigo", {
    name: "windigo",
    character: "w",
    foreground: "lightBlue",
    maxHp: 200,
    attackValue: 70,
    strength: 15,
    unarmedDamageType: Game.Enums.DamageTypes.PIERCING,
    defenseValue: 15,
    level: 10,
    sightRadius: 6,
    mixins: [Game.EntityMixins.WindigoActor, Game.EntityMixins.StatsHaver, Game.EntityMixins.StaminaHaver, Game.EntityMixins.Sight, Game.EntityMixins.Affectable,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.CorpseDropper, Game.EntityMixins.ExperienceGainer],
             // It doesn't actually do anything with its level, it's just for XP.
    }, {
    disableRandomCreation: true
});
Game.EntityRepository.define("spitesprite", {
    name: "spitesprite",
    character: "B",
    foreground: "lightBlue",
    maxHp: 25,
    attackValue: 50,
    strength: 4,
    unarmedDamageType: Game.Enums.DamageTypes.PIERCING,
    defenseValue: 10,
    sightRadius: 4,
    tasks: ["hunt", "wander"],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.StatsHaver, Game.EntityMixins.StaminaHaver, Game.EntityMixins.Sight, Game.EntityMixins.Affectable,
        Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
        Game.EntityMixins.CorpseDropper, Game.EntityMixins.ExperienceGainer, Game.EntityMixins.RandomStatGainer]
    }, {
    disableRandomCreation: true
});