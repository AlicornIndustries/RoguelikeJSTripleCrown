// Code for game screens (world, inventory, etc). Each screen handles its own rendering and input handling
// Basic structure of a screen: functions for enter, exit, render, handleInput

Game.Screen = {};

// Define the screens (start, play, win, loss)
Game.Screen.startScreen = {
    enter: function() {console.log("Entered start screen."); },
    exit: function() {console.log("Exited start screen."); },
    render: function(display) {
        display.drawText(1,1,"%c{yellow}GAMETITLE");
        display.drawText(1,2,"Press [Enter] to start!");
    },
    handleInput: function(inputType, inputData) {
        
        // On press Enter, go to play screen
        if(inputType==="keydown") {
            if(inputData.keyCode === ROT.KEYS.VK_RETURN) { // NOTE: Unlike the older guide, use ROT.KEYS.VK_RETURN, not ROT.VK_RETURN (likewise for other keycodes)
                console.log("Enter pressed");
                Game.switchScreen(Game.Screen.playScreen);
            }
        }
    }
}
Game.Screen.playScreen = {
    enter: function() {console.log("Entered play screen."); },
    exit: function() {console.log("Exited play screen."); },
    render: function(display) {
        display.drawText(1,1,"Placeholder. Play screen.");
    },
    handleInput: function(inputType, inputData) {
    }
}
Game.Screen.winScreen = {
    enter: function() {console.log("Entered win screen."); },
    exit: function() {console.log("Exited win screen."); },
    render: function(display) {
        display.drawText(1,1,"Win screen placeholder.");
    },
    handleInput: function(inputType, inputData) {
        // Nothing here yet. Add restart button, etc
    }
}
Game.Screen.loseScreen = {
    enter: function() {console.log("Entered lose screen"); },
    exit: function() {console.log("Exited lose screen."); },
    render: function(display) {
        display.drawText(1,1,"Lose screen placeholder");
    },
    handleInput: function(inputType, inputData) {
        // Nothing here yet. Add restart button.
    }
}