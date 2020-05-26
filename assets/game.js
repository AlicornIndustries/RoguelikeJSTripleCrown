var Game = {
    _display: null,
    _currentScreen: null,
    init: function() {
        // Create display (window.onload() is what actually appends it)
        this._display = new ROT.Display({width:80, height:24});
        // Helper function to bind to events, to talk to screens.js
        var game=this;
        var bindEventToScreen=function(event) {
            window.addEventListener(event, function(e) {
                // When event is received, send it to currentScreen
                if(game._currentScreen !== null) {
                    game._currentScreen.handleInput(event, e)
                }
            });
        }
        bindEventToScreen("keydown");
        bindEventToScreen("keyup");
        bindEventToScreen("keypress");
    },
    getDisplay: function() {
        return this._display;
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