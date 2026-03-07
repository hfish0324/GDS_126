/*----------------------------------------------

player.js (UPDATED for strip-based animations
+ jump and attack sounds)

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

  // Default sprite
  info: {
    src: `images/idle_R.png`
  },

  states: {

    /*-------------------
    IDLE
    -------------------*/
    idle: {
      src: `images/idle_R.png`,
      fps: 2,
      cycle: true,
      frames: buildFrames(16, 64, 48)
    },

    /*-------------------
    WALK
    -------------------*/
    walk: {
      src: `images/run_R.png`,
      fps: 1,
      cycle: true,
      frames: buildFrames(12, 64, 48)
    },

    /*-------------------
    JUMP
    -------------------*/
    jump: {
      src: `images/jump_R.png`,
      fps: 2,
      cycle: false,

      // sound played when jump starts
      sound: "jump",

      frames: buildFrames(3, 64, 48)
    },

    /*-------------------
    FALL
    -------------------*/
    fall: {
      src: `images/fall_R.png`,
      fps: 2,
      cycle: true,
      frames: buildFrames(4, 64, 48)
    },

    /*-------------------
    LAND
    -------------------*/
    land: {
      src: `images/land_R.png`,
      fps: 2,
      cycle: false,
      frames: buildFrames(2, 64, 48)
    },

    /*-------------------
    CROUCH
    -------------------*/
    crouch: {
      src: `images/idle_R.png`,
      fps: 999999,
      cycle: false,
      frames: [
        {
          width: 64,
          height: 48,
          startX: 0,
          startY: 0
        }
      ]
    },

    /*-------------------
    ATTACK
    -------------------*/
    attack: {
      src: `images/attack_R.png`,
      fps: 1,
      cycle: false,

      // sound played when attack starts
      sound: "attack",

      frames: buildFrames(9, 64, 48)
    }

  }
};