/*------------Use this if you want to implement States---------------*/
var gravity = 1;
var friction = { x: .85, y: .97 };

/**
 * IMPORTANT FIX:
 * Your images are in src/images/, so they must be referenced through the bundler.
 * This helper makes a correct URL to those files in production (GitHub Pages) too.
 *
 * Works great in Vite (and most ESM bundlers).
 */
function asset(fileName) {
  return new URL(`./images/${fileName}`, import.meta.url).href;
}

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

// ✅ FIXED: was `images/ground.png`
ground.img.src = asset("ground.png");

// Spawn player ON the ground
wiz.x = canvas.width * 0.25;
wiz.y = ground.y - (ground.height / 2) - (wiz.height / 2);
wiz.vx = 0;
wiz.vy = 0;
wiz.canJump = true;

var leftBorder = new GameObject({ width: 50, height: canvas.height, world: level, x: 0 });

/* -------------------- CAVE COLLISION GRID (HITBOX ONLY) -------------------- */
var caveHit = new Grid(caveHitData, { world: level, x: 1024, tileHeight: 64, tileWidth: 64 });

// Collision group
var g1 = new Group();
g1.add([ground, leftBorder, caveHit.grid]);

/* -------------------- OUTDOOR PARALLAX -------------------- */
var sky = new GameObject({ width: canvas.width, height: canvas.height, color: "white" });
// ✅ FIXED: was `images/Sky.png`
sky.img.src = asset("Sky.png");

function makeLayer(src, speed, yAnchorBottom) {
  var o = new GameObject({ x: 0, y: 0, width: 1024, height: 512 });
  // ✅ FIXED: was `images/` + src
  o.img.src = asset(src);
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

function drawLoopOutdoor(layer) {
  var drawY = layer.yAnchorBottom ? canvas.height - layer.height : 0;
  layer.drawStaticImage({ x: 0, y: drawY });
  layer.drawStaticImage({ x: -layer.width, y: drawY });
  layer.drawStaticImage({ x: layer.width, y: drawY });
}

/* -------------------- CAVE VISUAL LAYERS (FULL IMAGES) -------------------- */
var caveLayers = [];
for (let i = 0; i < caveVisual.layers.length; i++) {
  let L = caveVisual.layers[i];

  let obj = new GameObject({
    x: 0,
    y: 0,
    width: caveVisual.width,
    height: caveVisual.height,
    world: { x: 0, y: 0 }
  });

  obj.img.src = L.src;
  obj.scrollSpeed = L.speed;
  caveLayers.push(obj);
}

function wrapLoopX(layer) {
  if (layer.x <= -layer.width) layer.x += layer.width;
  if (layer.x >= layer.width) layer.x -= layer.width;
}

function drawLoopCave(layer) {
  layer.drawStaticImage({ x: layer.x, y: 0, w: layer.width, h: layer.height });
  layer.drawStaticImage({ x: layer.x - layer.width, y: 0, w: layer.width, h: layer.height });
  layer.drawStaticImage({ x: layer.x + layer.width, y: 0, w: layer.width, h: layer.height });
}

/* -------------------- CAVE ENTRANCE PREVIEW (VISIBLE BEFORE ENTERING) -------------------- */
var caveEntrance = new GameObject({
  x: 0,
  y: 0,
  width: caveVisual.width,
  height: caveVisual.height,
  world: { x: 0, y: 0 }
});
caveEntrance.img.src = caveVisual.entrance.image;

/* -------------------- CAVE ZONE -------------------- */
var CAVE_START_X = 1024;
var CAVE_TILE_W = 64;
var CAVE_TILES_W = (caveHitData && caveHitData.info && caveHitData.info.layout && caveHitData.info.layout[0])
  ? caveHitData.info.layout[0].length
  : 35;
var CAVE_END_X = CAVE_START_X + (CAVE_TILES_W * CAVE_TILE_W);

function cameraX() {
  return -level.x;
}

function inCaveZone() {
  var cx = cameraX();
  return cx >= CAVE_START_X && cx <= CAVE_END_X;
}

// 0..1 alpha for entrance overlay before cave starts
function entranceAlpha() {
  var cx = cameraX();
  var preview = caveVisual.entrance.previewWidth;
  var fade = caveVisual.entrance.fadeWidth;

  // show between (start - preview) to start
  var startPreview = CAVE_START_X - preview;
  if (cx < startPreview) return 0;
  if (cx >= CAVE_START_X) return 0; // once inside, we switch to cave visuals

  // fade in from startPreview..(startPreview+fade), then stay at 1 until start
  var t = (cx - startPreview);
  if (t <= 0) return 0;
  if (t >= preview) return 1;

  // smoothstep-ish fade for first 'fade' pixels
  var a = t / fade;
  if (a < 0) a = 0;
  if (a > 1) a = 1;
  return a;
}

/* ------------------ BULLETS (INVISIBLE HITBOXES) ---------------------- */
var bullets = [];
var canShoot = true;
var shotTimer = 0;
var shotDelay = 21;
var currentBullet = 0;

for (let i = 0; i < 100; i++) {
  bullets[i] = new GameObject({ width: 20, height: 20 });
  bullets[i].y = -10000;
}

var wasAirborne = false;

// Cache ground pattern
var groundPattern = null;

function drawTexturedGround() {
  if (!ground.img || ground.img.naturalWidth === 0) return;

  if (!groundPattern) {
    groundPattern = context.createPattern(ground.img, "repeat");
  }

  context.save();
  context.fillStyle = groundPattern;

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

  // Attack (space) -> invisible hitbox "bullet"
  if (keys[` `] && canShoot) {
    wiz.changeState(`attack`);
    shotTimer = shotDelay;

    bullets[currentBullet].vx = 5 * wiz.dir;
    bullets[currentBullet].world = level;
    bullets[currentBullet].x = wiz.x - level.x + (wiz.dir * 96);
    bullets[currentBullet].y = wiz.y + 20;

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

  // Camera movement + parallax movement
  if (wiz.x < canvas.width * .33 || wiz.x > canvas.width * .66) {
    wiz.x -= offset.x;
    level.x -= offset.x;

    if (inCaveZone()) {
      // move cave layers when inside cave
      for (let i = 0; i < caveLayers.length; i++) {
        caveLayers[i].x -= offset.x * caveLayers[i].scrollSpeed;
        wrapLoopX(caveLayers[i]);
      }
    } else {
      // move outdoor parallax when outside cave
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
  }

  /* -------- DRAW -------- */

  if (inCaveZone()) {
    // Inside cave: draw cave layers
    for (let i = 0; i < caveLayers.length; i++) {
      drawLoopCave(caveLayers[i]);
    }
  } else {
    // Outside cave: draw outdoor
    var skyPattern = context.createPattern(sky.img, `repeat`);
    sky.color = skyPattern;
    sky.render();

    drawLoopOutdoor(clouds);
    drawLoopOutdoor(mBack);
    drawLoopOutdoor(mMid);
    drawLoopOutdoor(mFront);
    drawLoopOutdoor(bgTrees);
    drawLoopOutdoor(trees);
    drawLoopOutdoor(gras);
    drawLoopOutdoor(groundStrip);

    // Entrance preview overlay (fades in as you approach cave)
    var a = entranceAlpha();
    if (a > 0) {
      context.save();
      context.globalAlpha = a;

      // Draw entrance as a centered overlay (same size as cave visuals)
      caveEntrance.drawStaticImage({ x: 0, y: 0, w: caveEntrance.width, h: caveEntrance.height });
      caveEntrance.drawStaticImage({ x: -caveEntrance.width, y: 0, w: caveEntrance.width, h: caveEntrance.height });
      caveEntrance.drawStaticImage({ x: caveEntrance.width, y: 0, w: caveEntrance.width, h: caveEntrance.height });

      context.restore();
    }
  }

  // Draw textured collision ground
  drawTexturedGround();

  // Player
  wiz.play(function () { return; }).drawSprite();

  // Invisible bullets still move (do not draw)
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].move();
  }
};