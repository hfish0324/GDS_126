/*---------------------------------
This file contains all of the code for the Main Menu
Uses parallax layers as the menu background (same canvas: 1024x512)
----------------------------------*/

// ---------- Button ----------
var startButton = new GameObject({
	x: canvas.width / 2,
	y: canvas.height * 0.68,
	width: 260,
	height: 70,
	color: `rgba(0,0,0,0)`
});
startButton.hitBoxWidth = startButton.width;
startButton.hitBoxHeight = startButton.height;

// ---------- Menu Parallax Layers ----------
function makeMenuLayer(src, speed, yAnchorBottom) {
	var o = new GameObject({ x: 0, y: 0, width: 1024, height: 512 });
	o.img.src = `images/` + src;
	o.scrollSpeed = speed;
	o.yAnchorBottom = !!yAnchorBottom;
	return o;
}

var menuSky = new GameObject({ width: canvas.width, height: canvas.height });
menuSky.img.src = `images/sky.png`;

var menuClouds   = makeMenuLayer("Clouds.png", 0.10, false);
var menuBack     = makeMenuLayer("Mountain_Back.png", 0.18, true);
var menuMiddle   = makeMenuLayer("Mountain_Middle.png", 0.28, true);
var menuFront    = makeMenuLayer("Mountain_Front.png", 0.40, true);
var menuFuji     = makeMenuLayer("Fuji.png", 0.32, true);
var menuBgTrees  = makeMenuLayer("BackgroundTrees.png", 0.55, true);
var menuTrees    = makeMenuLayer("Trees.png", 0.70, true);
var menuGrass    = makeMenuLayer("Gras.png", 0.90, true);
var menuGround   = makeMenuLayer("ground.png", 1.00, true);

// slight auto-scroll so menu feels alive
var menuScrollSpeed = 0.35;

function wrapMenuLayer(layer) {
	if (layer.x <= -layer.width) layer.x += layer.width;
	if (layer.x >= layer.width) layer.x -= layer.width;
}

function drawMenuLoop(layer) {
	var drawY = layer.yAnchorBottom ? (canvas.height - layer.height) : 0;
	layer.drawStaticImage({ x: 0, y: drawY });
	layer.drawStaticImage({ x: -layer.width, y: drawY });
	layer.drawStaticImage({ x: layer.width, y: drawY });
}

// ---------- Button Drawing ----------
function drawStartButton(isHover) {
	// button base
	context.save();
	context.translate(startButton.x, startButton.y);

	// shadow-ish backing
	context.globalAlpha = 0.85;
	context.fillStyle = isHover ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.65)";
	context.fillRect(-startButton.width / 2, -startButton.height / 2, startButton.width, startButton.height);

	// border
	context.globalAlpha = 1;
	context.strokeStyle = isHover ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.70)";
	context.lineWidth = 3;
	context.strokeRect(-startButton.width / 2, -startButton.height / 2, startButton.width, startButton.height);

	// text
	context.fillStyle = "rgba(255,255,255,0.95)";
	context.font = "28px Arial";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(isHover ? "START" : "START", 0, 2);

	context.restore();
}

// ---------- Menu State ----------
gameStates[`menu`] = function () {

	// auto parallax drift
	menuClouds.x  -= menuScrollSpeed * menuClouds.scrollSpeed;
	menuBack.x    -= menuScrollSpeed * menuBack.scrollSpeed;
	menuMiddle.x  -= menuScrollSpeed * menuMiddle.scrollSpeed;
	menuFuji.x    -= menuScrollSpeed * menuFuji.scrollSpeed;
	menuFront.x   -= menuScrollSpeed * menuFront.scrollSpeed;
	menuBgTrees.x -= menuScrollSpeed * menuBgTrees.scrollSpeed;
	menuTrees.x   -= menuScrollSpeed * menuTrees.scrollSpeed;
	menuGrass.x   -= menuScrollSpeed * menuGrass.scrollSpeed;
	menuGround.x  -= menuScrollSpeed * menuGround.scrollSpeed;

	wrapMenuLayer(menuClouds);
	wrapMenuLayer(menuBack);
	wrapMenuLayer(menuMiddle);
	wrapMenuLayer(menuFuji);
	wrapMenuLayer(menuFront);
	wrapMenuLayer(menuBgTrees);
	wrapMenuLayer(menuTrees);
	wrapMenuLayer(menuGrass);
	wrapMenuLayer(menuGround);

	// draw background stack
	// sky
	var skyPattern = context.createPattern(menuSky.img, `repeat`);
	menuSky.color = skyPattern;
	menuSky.render();

	// parallax layers
	drawMenuLoop(menuClouds);
	drawMenuLoop(menuBack);
	drawMenuLoop(menuMiddle);
	drawMenuLoop(menuFuji);
	drawMenuLoop(menuFront);
	drawMenuLoop(menuBgTrees);
	drawMenuLoop(menuTrees);
	drawMenuLoop(menuGrass);
	drawMenuLoop(menuGround);

	// hover + click
	var hover = startButton.overlap(mouse);

	if (hover && mouse.pressed) {
		gameStates.changeState(`level1`);
	}

	// draw the button
	drawStartButton(hover);
};