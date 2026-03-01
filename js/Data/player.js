/*----------------------------------------------
player.js (UPDATED for strip-based animations)

Adds: jump, fall, land (optional) using your strips.
Each state uses its own horizontal spritesheet strip.

IMPORTANT: In your engine, "fps" is actually "ticks per frame"
(counter decrements each update). Smaller = faster animation.
----------------------------------------------*/

function buildFrames(count, frameW, frameH, startY) {
  frameW = frameW ?? 64;
  frameH = frameH ?? 48;
  startY = startY ?? 0;

  const frames = [];
  for (let i = 0; i < count; i++) {
    frames.push({
      width: frameW,
      height: frameH,
      startX: i * frameW,
      startY: startY
    });
  }
  return frames;
}

var playerData = {
  // Kept for backwards compatibility; GameObject will prefer per-state src.
  info: {
    src: `images/idle_R.png`
  },

  states: {
    idle: {
      src: `images/idle_R.png`,
      fps: 2,
      cycle: true,
      frames: buildFrames(16, 64, 48)
    },

    // Your engine expects "walk" state name.
    // We map it to the run strip.
    walk: {
      src: `images/run_R.png`,
      fps: 1,
      cycle: true,
      frames: buildFrames(12, 64, 48)
    },

    // Jump start / ascent (non-looping)
    jump: {
      src: `images/jump_R.png`,
      fps: 2,
      cycle: false,
      frames: buildFrames(3, 64, 48)
    },

    // Falling / in-air descent (usually looping)
    fall: {
      src: `images/fall_R.png`,
      fps: 2,
      cycle: true,
      frames: buildFrames(4, 64, 48)
    },

    // Landing impact (non-looping)
    land: {
      src: `images/land_R.png`,
      fps: 2,
      cycle: false,
      frames: buildFrames(2, 64, 48)
    },

    // You don’t have a crouch strip in what you posted.
    // This makes crouch a static hold on the first idle frame.
    crouch: {
      src: `images/idle_R.png`,
      fps: 999999,
      cycle: false,
      frames: [
        { width: 64, height: 48, startX: 0, startY: 0 }
      ]
    },

    attack: {
      src: `images/attack_R.png`,
      fps: 1,
      cycle: false,
      frames: buildFrames(9, 64, 48)
    }
  }
};