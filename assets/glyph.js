// Glyph: character with foreground and background color

Game.Glyph = function(char, foreground, background) {
    // Instantiate default properties if they weren't manually passed
    this._char = char || " ";
    this._foreground = foreground || "white";
    this._background = background || "black";
}

// Boilerplate getters
Game.Glyph.prototype.getChar = function(){ 
    return this._char; 
}
Game.Glyph.prototype.getBackground = function(){
    return this._background;
}
Game.Glyph.prototype.getForeground = function(){ 
    return this._foreground; 
}