// Power: abilities like magic spells and stamina techniques

Game.Powers = {};

Game.Powers.createPower = function(power) {
    // What if, unlike createSkill, this took in: Game.Powers.TestPower?
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