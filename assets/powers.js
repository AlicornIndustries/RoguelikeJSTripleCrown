// Power: abilities like magic spells and stamina techniques

Game.Powers = {};

Game.Powers.createPower = function(power) {
    // in: Game.Powers.TestPower
}

Game.Powers.TestPower = {
    name: "TestPower",
    staminaCost: 5,
    activate: function(activator) {
        console.log("TestPower activated!");
        Game.sendMessage(activator,"You activate TestPower!");
    },
    canActivate: function(activator) {
        if(activator.getStamina()>=this.staminaCost) {
            return true;
        } else {
            return false;
        }
    }
}

Game.Powers.TestAttackPower = {
    name: "TestAttackPower",
    staminaCost: 10,
    activate: function(activator) {
        // Deals STR*5 damage to target
        console.log("Str*5="+activator.getStrength());
        // TODO: switch to targetting subscreen with range=1
    },
    canActivate: function(activator) {
        if(activator.getStamina()>=this.staminaCost) {
            return true;
        } else {
            return false;
        }
    }
}