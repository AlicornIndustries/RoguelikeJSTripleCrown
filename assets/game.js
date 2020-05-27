// Add back in the extend function, which is missing in later versions of ROT.JS
Function.prototype.extend = function(parent) {
    this.prototype = Object.create(parent.prototype);
    this.prototype.constructor = this;
    return this;
}


var Game = {
    _display: null,
    _currentScreen: null,
    _screenWidth: 80,
    _screenHeight: 24,
    init: function() {
        // Create display (window.onload() is what actually appends it)
        this._display = new ROT.Display({width:this._screenWidth, height:this._screenHeight});
        // Helper function to bind to events, to talk to screens.js
        var game=this;
        var bindEventToScreen=function(event) {
            window.addEventListener(event, function(e) {
                // When event is received, send it to currentScreen
                if(game._currentScreen !== null) {
                    game._currentScreen.handleInput(event, e)
                    game._display.clear();
                    game._currentScreen.render(game._display); // Re-render (could be refactored to only re-render when needed. Use a flag)
                }
            });
        }
        bindEventToScreen("keydown");
        //bindEventToScreen("keyup");
        //bindEventToScreen("keypress");
    },
    getDisplay: function() {
        return this._display;
    },
    getScreenWidth: function() {
        return this._screenWidth;
    },
    getScreenHeight: function() {
        return this._screenHeight;
    },
    switchScreen: function(screen) {
        // Notify the past screen that we exited it
        if(this._currentScreen !== null) {
            this._currentScreen.exit();
        }
        // Clear display
        this.getDisplay().clear(); //Q?: Why not just _display, like we do below?
        // Update to the new currentScreen, enter, render
        this._currentScreen = screen;
        if(!this._currentScreen !== null) {
            this._currentScreen.enter();
            this._currentScreen.render(this._display);
        }
    },
}

window.onload = function() {
    Game.init();
    document.body.appendChild(Game.getDisplay().getContainer());
    Game.switchScreen(Game.Screen.startScreen);
}