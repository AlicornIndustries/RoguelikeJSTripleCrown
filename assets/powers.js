// Power: abilities like magic spells and stamina techniques

Game.Powers = {};

Game.Powers.createPower = function(power) {
    // in: Game.Powers.TestPower
}

// Game.Powers.TestAttackPower = {
//     name: "TestAttackPower",
//     _staminaCost: -10,
//     _subscreen: false,
//     activate: function(activator) {
//         // Activate returns false if the power should end the turn,
//         // returns relevant subscreen (e.g. targeting) if it should move there

//         // Deals STR*5 damage to target
//         console.log("Str*5="+activator.getStrength());
//         // TODO: switch to targetting subscreen with range=1
//         activator.changeStamina(this._staminaCost);
//         return this.moveToSubscreen;
//     },
//     canActivate: function(activator) {
//         if(activator.getStamina()>=this._staminaCost) {
//             return true;
//         } else {
//             return false;
//         }
//     },
//     usesSubscreen: function() {
//         return this._subscreen;
//     }
// }
// Game.Powers.TestRangedPower = {
//     name: "TestRangedPower",
//     _staminaCost: -15,
//     _range: 3,
//     _subscreen: Game.Screen.rangedPowerTargetingScreen,
//     getRange: function() {return this._range;},
//     activate: function(activator,x,y,d) {
//         console.log(map.getEntityAt(x,y,d));
//     },
//     canActivate: function(activator) {
//         if(activator.getStamina()>=this._staminaCost) {
//             return true;
//         } else {
//             return false;
//         }
//     },
//     usesSubscreen: function() {
//         return this._subscreen;
//     },
// }