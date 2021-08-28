// Status effects, like healing or bleeding. Can be instantaneous or over time.

Game.Effects = {};

Game.Effects.Heal = {
    name: "heal",
    // have a "beneficial" or buff/debuff type/enum here?
    init: function(template) {
        this._healAmount = template["healAmount"] || 10;
        this._duration = template["duration"] || 0;
        this._inflictor = null; // Entity that inflicted the effect and gets the XP for the kill
        this._done = false;
    },
    setInflictor: function(inflictor) {this._inflictor=inflictor},
    update: function(entity) {
        console.log(entity);
        if(entity.hasMixin("Destructible")) {
            entity.heal(this._healAmount);
        }
        this.reduceDuration();
        return;
    },
    start: function(entity) {
        if(entity.hasMixin("Destructible")) {
            entity.heal(this._healAmount);
            Game.sendMessage(entity,"You feel healthier.");
        }
    },
    end: function(entity) {
        // Effect is deleted by the entity
        return;
    },
    reduceDuration: function() {
        this._duration--;
    },
    getDuration: function() {
        return this._duration;
    }
};
Game.Effects.Bleed = {
    name: "bleed",
    init: function(template) {
        this._bleedAmount = template["bleedAmount"];
        this._duration = template["duration"];
        this._inflictor = null; // Entity that inflicted the effect and gets the XP for the kill
        this._done = false;
    },
    setInflictor: function(inflictor) {this._inflictor=inflictor},
    update: function(entity) {
        if(entity.hasMixin("Destructible")) {
            entity.takeDamage(this._inflictor,this._bleedAmount,true);
        }
        this.reduceDuration();
        return;
    },
    start: function(entity) {
        if(entity.hasMixin("Destructible")) {
            Game.sendMessage(entity,"You're bleeding!");
        }
    },
    end: function(entity) {
        Game.sendMessage(entity,"You staunch your bleeding.")
        return;
    },
    reduceDuration: function() {
        this._duration--;
    },
    getDuration: function() {
        return this._duration;
    }
}