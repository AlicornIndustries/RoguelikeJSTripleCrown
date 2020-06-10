Game.ItemMixins = {}; // Setup namespace

Game.ItemMixins.Edible = {
    name: "Edible",
    init: function(template) {
        // Number of points to add to fullness
        this._foodValue = template['foodValue'] || 5;
        // Number of times item can be consumed
        this._maxConsumptions = template["maxConsumptions"] || 1;
        this._remainingConsumptions = this._maxConsumptions;
    },
    eat: function(entity) {
        if(entity.hasMixin("FoodConsumer")) {
            if(this.hasRemainingConsumptions()) {
                entity.modifyFullnessBy(this._foodValue);
                this._remainingConsumptions--;
            }
        }
    },
    hasRemainingConsumptions: function() {
        return this._remainingConsumptions>0;
    },
    describe: function() {
        if(this._maxConsumptions!=this._remainingConsumptions) {
            return 'partly eaten '+Game.Item.prototype.describe.call(this);
        } else {
            return this._name;
        }
    }
}