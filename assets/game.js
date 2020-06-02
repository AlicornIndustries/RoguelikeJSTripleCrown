// Add back in the extend function, which is missing in later versions of ROT.JS. See https://github.com/ondras/rot.js/blob/f8dfeb711bcef2659c491be11ee044e84bd01857/src/js/function.js
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
    _bottomUIHeight: 1, // For stats display, etc
    init: function() {
        // Create display (window.onload() is what actually appends it)
        this._display = new ROT.Display({width:this._screenWidth, height:this._screenHeight+this._bottomUIHeight});
        // Helper function to bind to events, to talk to screens.js
        var game=this;
        var bindEventToScreen=function(event) {
            window.addEventListener(event, function(e) {
                // When event is received, send it to currentScreen
                if(game._currentScreen !== null) {
                    // Send event type and data to the screen
                    game._currentScreen.handleInput(event, e);
                }
            });
        }
        // Bind keyboard events
        bindEventToScreen("keydown");
        //bindEventToScreen("keyup");
        bindEventToScreen("keypress");
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
    refresh: function() {
        // Clear, then render the screen
        this._display.clear();
        this._currentScreen.render(this._display);
    },
    switchScreen: function(screen) {
        // Notify the past screen that we exited it
        if(this._currentScreen !== null) {
            this._currentScreen.exit();
        }
        // Clear display
        this.getDisplay().clear(); //Q?: Why not just _display, like we do below?
        // Update currentScreen, notify it we entered, render
        this._currentScreen = screen;
        if(!this._currentScreen !== null) {
            this._currentScreen.enter();
            this.refresh();
        }
    },
}

window.onload = function() {
    Game.init();
    document.body.appendChild(Game.getDisplay().getContainer());
    Game.switchScreen(Game.Screen.startScreen);
}