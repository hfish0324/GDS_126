/*------------Use this if you want to implement States---------------*/
var gravity = 1;
var friction = { x: .85, y: .97 };

var stage = new GameObject({ width: canvas.width, height: canvas.height });

// A level object when it is moved other objects move with it.
var level = new GameObject({ x: 0, y: 0 });

// Avatar
var wiz = new GameObject({ width: 128, height: 128, spriteData: playerData }).makeSprite(playerData);
wiz.force = 1;

// The ground (collision + textured render)
var ground = new GameObject({
  width: canvas.width * 10,
  x: canvas.width * 10 / 2 - 200,
  height: 64,
  y: canvas.height - 32,
  world: level
});
ground.img.src = `images/ground.png`;

// Spawn player ON the ground
wiz.x = canvas.width * 0.25;
wiz.y = ground.y - (ground.height / 2) - (wiz.height / 2);
wiz.vx = 0;
wiz.vy = 0;
wiz.canJump = true;

var leftBorder = new GameObject({ width: 50, height: canvas.height, world: level, x: 0 });

// Cave foreground Tile Grid
var cave = new Grid(caveData, { world: level, x: 1024, tileHeight: 64, tileWidth: 64 });
// Cave background Tile Grid
var caveBack = new Grid(caveBackData, { world: level, x: 1024, tileHeight: 64, tileWidth: 64 });
// cave hitbox grid
var caveHit = new Grid(caveHitData, { world: level, x: 1024, tileHeight: 64, tileWidth: 64 });

// Collision group
var g1 = new Group();
g1.add([ground, leftBorder, caveHit.grid]);

// Sprite groups
var sprites = new Group();
sprites.add([caveBack.grid]);

var front = new Group();
front.add([cave.grid]);

/* -------------------- PARALLAX BACKGROUND SETUP -------------------- */

var sky = new GameObject({ width: canvas.width, height: canvas.height, color: "white" });
sky.img.src = `images/Sky.png`;

function makeLayer(src, speed, yAnchorBottom) {
  var o = new GameObject({ x: 0, y: 0, width: 1024, height: 512 });
  o.img.src = `images/` + src;
  o.scrollSpeed = speed;
  o.yAnchorBottom = !!yAnchorBottom;
  return o;
}

var clouds = makeLayer("Clouds.png", 0.10, false);
var mBack = makeLayer("Mountain_Back.png", 0.18, true);
var mMid = makeLayer("Mountain_Middle.png", 0.28, true);
var mFront = makeLayer("Mountain_Front.png", 0.40, true);
var bgTrees = makeLayer("BackgroundTrees.png", 0.55, true);
var trees = makeLayer("Trees.png", 0.70, true);
var gras = makeLayer("Gras.png", 0.90, true);
var groundStrip = makeLayer("Ground.png", 1.00, true);

function wrapLayer(layer) {
  if (layer.x <= -layer.width) layer.x += layer.width;
  if (layer.x >= layer.width) layer.x -= layer.width;
}

function drawLoop(layer) {
  var drawY = layer.yAnchorBottom ? canvas.height - layer.height : 0;

  layer.drawStaticImage({ x: 0, y: drawY });
  layer.drawStaticImage({ x: -layer.width, y: drawY });
  layer.drawStaticImage({ x: layer.width, y: drawY });
}

/* ------------------ BULLETS ---------------------- */

var bullets = [];
var canShoot = true;
var shotTimer = 0;
var shotDelay = 21;
var currentBullet = 0;

for (let i = 0; i < 100; i++) {
  bullets[i] = new GameObject({ width: 64, height: 64 });
  bullets[i].makeSprite(playerData);
  bullets[i].y = -10000;
  bullets[i].changeState(`walk`);
}

var wasAirborne = false;

// Cache ground pattern (will be created once image is loaded)
var groundPattern = null;

function drawTexturedGround() {
  if (!ground.img || ground.img.naturalWidth === 0) return;

  if (!groundPattern) {
    groundPattern = context.createPattern(ground.img, "repeat");
  }

  context.save();
  context.fillStyle = groundPattern;

  // draw in world space (ground has world: level)
  var drawX = (ground.x + ground.world.x) - ground.width / 2;
  var drawY = (ground.y + ground.world.y) - ground.height / 2;

  context.translate(drawX, drawY);
  context.fillRect(0, 0, ground.width, ground.height);
  context.restore();
}

gameStates[`level1`] = function () {

  // Idle only when truly not doing anything and grounded
  if (!keys[`W`] && !keys[`S`] && !keys[`D`] && !keys[`A`] && !keys[` `] && canShoot && wiz.canJump) {
    wiz.changeState(`idle`);
  }

  // Move right
  if (keys[`D`]) {
    wiz.dir = 1;
    if (wiz.canJump) wiz.changeState(`walk`);
    wiz.vx += wiz.force;
  }

  // Move left
  if (keys[`A`]) {
    wiz.dir = -1;
    if (wiz.canJump) wiz.changeState(`walk`);
    wiz.vx += -wiz.force;
  }

  // Jump
  if (keys[`W`] && wiz.canJump) {
    wiz.canJump = false;
    wiz.vy = wiz.jumpHeight;
    wiz.changeState(`jump`);
    wasAirborne = true;
  }

  // Shooting timer
  shotTimer--;
  canShoot = shotTimer <= 0;

  // Attack (space)
  if (keys[` `] && canShoot) {
    wiz.changeState(`attack`);
    shotTimer = shotDelay;

    bullets[currentBullet].vx = 5 * wiz.dir;
    bullets[currentBullet].world = level;
    bullets[currentBullet].x = wiz.x - level.x + (wiz.dir * 96);
    bullets[currentBullet].y = wiz.y + 20;
    bullets[currentBullet].dir = wiz.dir;

    currentBullet++;
    if (currentBullet >= bullets.length) currentBullet = 0;
  }

  /* -------- Movement -------- */

  wiz.vy += gravity;
  wiz.vx *= friction.x;
  wiz.vy *= friction.y;
  wiz.x += Math.round(wiz.vx);
  wiz.y += Math.round(wiz.vy);

  let offset = { x: Math.round(wiz.vx), y: Math.round(wiz.vy) };
  var landedThisFrame = false;

  while (g1.collide(wiz.bottom) && wiz.vy >= 0) {
    wiz.canJump = true;
    wiz.vy = 0;
    wiz.y--;
    offset.y--;
    landedThisFrame = true;
  }

  while (g1.collide(wiz.top) && wiz.vy <= 0) {
    wiz.vy = 0;
    wiz.y++;
    offset.y++;
  }

  while (g1.collide(wiz.left) && wiz.vx <= 0) {
    wiz.vx = 0;
    wiz.x++;
    offset.x++;
  }

  while (g1.collide(wiz.right) && wiz.vx >= 0) {
    wiz.vx = 0;
    wiz.x--;
    offset.x--;
  }

  // Jump/Fall/Land animation logic
  if (!wiz.canJump) {
    wasAirborne = true;
    if (wiz.vy > 1 && wiz.currentState !== `attack`) {
      wiz.changeState(`fall`);
    }
  } else {
    if (wasAirborne && landedThisFrame) {
      wiz.changeState(`land`);
      wasAirborne = false;
    }
  }

  // Camera movement
  if (wiz.x < canvas.width * .33 || wiz.x > canvas.width * .66) {
    wiz.x -= offset.x;
    level.x -= offset.x;

    clouds.x -= offset.x * clouds.scrollSpeed;
    mBack.x -= offset.x * mBack.scrollSpeed;
    mMid.x -= offset.x * mMid.scrollSpeed;
    mFront.x -= offset.x * mFront.scrollSpeed;
    bgTrees.x -= offset.x * bgTrees.scrollSpeed;
    trees.x -= offset.x * trees.scrollSpeed;
    gras.x -= offset.x * gras.scrollSpeed;
    groundStrip.x -= offset.x * groundStrip.scrollSpeed;

    wrapLayer(clouds);
    wrapLayer(mBack);
    wrapLayer(mMid);
    wrapLayer(mFront);
    wrapLayer(bgTrees);
    wrapLayer(trees);
    wrapLayer(gras);
    wrapLayer(groundStrip);
  }

  /* -------- DRAW -------- */

  // Draw sky
  var skyPattern = context.createPattern(sky.img, `repeat`);
  sky.color = skyPattern;
  sky.render();

  // Draw parallax layers
  drawLoop(clouds);
  drawLoop(mBack);
  drawLoop(mMid);
  drawLoop(mFront);
  drawLoop(bgTrees);
  drawLoop(trees);
  drawLoop(gras);
  drawLoop(groundStrip);

  // Draw textured collision ground (no green rect)
  drawTexturedGround();

  // Cave back tiles
  sprites.play().render(`drawSprite`);

  // Player
  wiz.play(function(){ return; }).drawSprite();

  // Bullets
  for (let i = 0; i < bullets.length; i++) {
  bullets[i].move();
  // No drawSprite() → bullets are invisible but still active
}

  // Cave front tiles
  front.play().render(`drawSprite`);
};