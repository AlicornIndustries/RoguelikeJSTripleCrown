Game.Effects = {};

Game.Effects.Heal = {
    name: "heal",
    // have a "beneficial" or buff/debuff type/enum here?
    init: function(template) {
        this._healAmount = template["healAmount"] || 10;
        this._duration = template["duration"] || 0;
        this._done = false;
    },
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
Game.Effects.BuffStats = {
    name: "buffStats",
    init: function(template) {

    },
    update: function() {
        
    }
}
