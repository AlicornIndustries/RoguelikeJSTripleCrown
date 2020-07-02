// For drawing useful shapes
Game.Geometry = {
    // Returns array of points along line from start to end
    getLine: function(startX, startY, endX, endY) {
        // Bresenham's line algorithm
        var points = [];
        var dx = Math.abs(endX-startX);
        var dy = Math.abs(endY-startY);
        var sx = (startX < endX) ? 1 : -1;
        var sy = (startY < endY) ? 1 : -1;
        var err = dx-dy;
        var e2;

        var loopCounter = 0;
        while(true) {
            // Debugging
            loopCounter++;

            points.push({x: startX, y: startY});
            if(startX==endX && startY==endY) {
                console.log(loopCounter);
                break;
            }
            
            // Debugging
            if(loopCounter>8) {
                break;
            }

            e2 = err*2;
            if(e2>-dx) {
                err -= dy;
                startX+=sx;
            }
            if(e2<dx) {
                err += dy;
                startY += sy;
            }
        }
        return points;
    },
    getFilledCircle: function(xc,yc,radius) {
        // xc, yc: center coords. https://stackoverflow.com/questions/1201200/fast-algorithm-for-drawing-filled-circles
        // Returns array of points
        rsquared = radius*radius;
        var points = [];
        for(var y=-radius; y<=radius; y++) {
            for(var x=-radius; x<=radius; x++) {
                if(x*x+y*y <= rsquared) {
                    points.push({x: x, y: y});
                }
            }
        }
    }
};