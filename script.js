//Constants
var PATH_COLOR = "#002828";
var BG_COLOR = "#008282";
var CURSOR_COLOR = "#FFFFFF";
var CURSOR_SIZE = 8;
var CURSOR_SPEED = 2;
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_DEL = 46;
var KEY_SPACE = 32;
var FPS = 30;
var WIDTH = 640;
var HEIGHT = 480;
var stage;
var cursor;

var randInt = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

var type1Spinograph = function() {
    var r = randInt(40, 100);
    var a = randInt(1, 640);
    var b = randInt(1, 10);
    var k = (1.0*a)/b;
    var tau = 2 * Math.PI;
    var points = [];
    for (var theta = 0; theta < tau; theta += tau / 48) {
        var x = r * Math.cos(k * theta);
        var y = r * Math.sin(k * theta);
        points.push({x: x, y: y});
    }
    return {data: points, radius: r};
};

var type2Spinograph = function() {
    var tau = 2 * Math.PI;
    var k = randInt(2, 20);
    var a = randInt(40, 100);
    var points = [];
    for (var theta = 0; theta < tau; theta += tau / 96) {
        var r = a * Math.cos(k * theta);
        var x = r * Math.cos(theta);
        var y = r * Math.sin(theta);
        points.push({x: x, y: y});
    }
    return {data: points, radius: a};
}

var type3Spinograph = function() {
    var tau = 2 * Math.PI;
    var k = randInt(1, 20);
    var points = [];
    for (var theta = 0; theta < tau * k; theta += tau / 48) {
        var r = theta;
        var x = r * Math.cos(theta);
        var y = r * Math.sin(theta);
        points.push({x: x, y: y});
    }
    return {data: points, radius: k * tau};
}

var randomSpinograph = function() {
    type = randInt(0, 3);
    spinographs = [type1Spinograph, type2Spinograph, type3Spinograph];
    return spinographs[type]();
}

var Cursor = function(x, y) {
    this.x = x;
    this.y = y;
    this.xSpeed = 0;
    this.ySpeed = 0;
    
    //The crosshairs of the cursor
    var cross = new createjs.Shape();
    cross.x = this.x;
    cross.y = this.y;
    var gfx = cross.graphics;
    gfx.beginStroke(CURSOR_COLOR);
    gfx.moveTo(-CURSOR_SIZE, 0);
    gfx.lineTo(CURSOR_SIZE, 0);
    gfx.endStroke();
    gfx.beginStroke(CURSOR_COLOR);
    gfx.moveTo(0, -CURSOR_SIZE);
    gfx.lineTo(0, CURSOR_SIZE);
    gfx.endStroke();
    stage.addChild(cross);
    this.cross = cross;
    
    //Update the cursor
    this.update = function() {
        if (this.xSpeed != 0 || this.ySpeed != 0) {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
            trace.addPoint(this);
            this.x = clamp(this.x, 0, WIDTH);
            this.y = clamp(this.y, 0, HEIGHT);
            console.log(this);
        }
        
        cross.x = this.x;
        cross.y = this.y;
    };
};

var Trace = function(startPoint) {
    
    var path = new createjs.Shape();
    path.x = 0;
    path.y = 0;
    path.xPrev = startPoint.x;
    path.yPrev = startPoint.y;
    stage.addChild(path);
    this.path = path;
    
    //Add a point to the graph and stroke it.
    this.addPoint = function(point) {
        path.xPrev = path.xCurrent;
        path.yPrev = path.yCurrent;
        path.xCurrent = point.x;
        path.yCurrent = point.y;
        var gfx = path.graphics;
        gfx.beginStroke(PATH_COLOR);
        gfx.moveTo(path.xPrev, path.yPrev);
        gfx.lineTo(path.xCurrent, path.yCurrent);
        gfx.endStroke();
    };
    
    //Add the first point
    this.addPoint(startPoint);
    
    //Add a spinograph pattern at the current position
    this.addSpinograph = function() {
        var data = randomSpinograph();
        var r = data.radius;
        var x = path.xCurrent;
        var y = path.yCurrent;
        data = data.data;
        
        var gfx = path.graphics;
        gfx.beginStroke(PATH_COLOR);
        gfx.moveTo(x + r, y);
        for (var i in data) {
            var polar = data[i];
            gfx.lineTo(x + polar.x, y + polar.y);
        }
        gfx.endStroke();
    };
    
    this.clear = function() {
        path.graphics.clear();
    }
};

var init = function() {
    stage = new createjs.Stage("stage");
    
    var background = new createjs.Shape();
    background.graphics.beginFill(BG_COLOR);
    background.graphics.drawRect(0, 0, WIDTH, HEIGHT);
    background.graphics.endFill();
    stage.addChild(background);
    
    cursor = new Cursor(WIDTH / 2, HEIGHT / 2);
    trace = new Trace(cursor);
    stage.setChildIndex(cursor.cross, stage.getNumChildren()-1)
    
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.setFPS(FPS);
};

var tick = function(event) {
    cursor.update();
    stage.update();
};

var keyDown = function(event) {
    if (event.keyCode == KEY_LEFT) {
        cursor.xSpeed = -CURSOR_SPEED;
		event.preventDefault();
	}
    else if (event.keyCode == KEY_RIGHT) {
        cursor.xSpeed = CURSOR_SPEED;
		event.preventDefault();
	}
    else if (event.keyCode == KEY_UP) {
        cursor.ySpeed = -CURSOR_SPEED;
		event.preventDefault();
	}
    else if (event.keyCode == KEY_DOWN) {
        cursor.ySpeed = CURSOR_SPEED;
		event.preventDefault();
	}
	else if (event.keyCode == KEY_SPACE) {
		event.preventDefault();
	}
};

var clamp = function(val, minimum, maximum) {
    if (val < minimum)
        return 0;
    else if (val > maximum)
        return maximum;
    else
        return val;
}

var keyReleased = function(event) {
    if (event.keyCode == KEY_DEL)
        trace.clear();
    else if (event.keyCode == KEY_SPACE) {
        trace.addSpinograph();
		event.preventDefault();
	}
    else if (event.keyCode == KEY_LEFT || event.keyCode == KEY_RIGHT) {
        cursor.xSpeed = 0;
		event.preventDefault();
	}
    else if (event.keyCode == KEY_UP || event.keyCode == KEY_DOWN) {
        cursor.ySpeed = 0;
		event.preventDefault();
	}
};

window.onload = init;
window.onkeydown = keyDown;
window.onkeyup = keyReleased;