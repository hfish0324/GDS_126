var x = false;

/*
  CAVE VISUAL LAYERS (FULL IMAGES)
  These are NOT tilesheets. They are drawn as looping parallax layers in level1.js.
*/
var caveVisual = {
  width: 1024,
  height: 512,
  // Order: far -> near
  layers: [
    { src: `images/background1.png`, speed: 0.15 }, // farthest
    { src: `images/background2.png`, speed: 0.30 }, // mid
    { src: `images/background3.png`, speed: 0.55 }, // near
    { src: `images/background4a.png`, speed: 0.80 } // closest
  ],

  /*
    Cave entrance preview (visible BEFORE entering the cave zone)
    - image: what to show as the entrance (swap later with a doorway PNG)
    - previewWidth: how far BEFORE the cave start the entrance is visible
    - fadeWidth: soft fade region for the entrance overlay
  */
  entrance: {
    image: `images/background4a.png`,
    previewWidth: 420, // how early you start seeing the entrance
    fadeWidth: 160     // how soft the overlay fades in
  }
};

/*
  CAVE COLLISION GRID (HITBOX ONLY)
  This is ONLY for collision; it is NOT rendered.
  Layout is kept as you had it.
*/
var caveHitData = {
  info: {
    layout: [
      [0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,2],
      [2,8,1,8,1,1,8,1,1,1,1,1,1,8,8,1,8,8,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,x,x,8,x,x,8,x,x,x,x,x,x,8,8,x,1,1,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,2],
      [6,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,2],
      [x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,2],
      [x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,2],
      [x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,2],
      [x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,2]
    ],
    // required, but grid is not drawn
    src: `images/background1.png`
  },
  // dummy frames
  states: [
    { fps: 1, cycle: false, frames: [{ width: 1, height: 1, startX: 0, startY: 0 }] }, // 0
    { fps: 1, cycle: false, frames: [{ width: 1, height: 1, startX: 0, startY: 0 }] }, // 1
    { fps: 1, cycle: false, frames: [{ width: 1, height: 1, startX: 0, startY: 0 }] }, // 2
    { fps: 1, cycle: false, frames: [{ width: 1, height: 1, startX: 0, startY: 0 }] }, // 3
    { fps: 1, cycle: false, frames: [{ width: 1, height: 1, startX: 0, startY: 0 }] }, // 4
    { fps: 1, cycle: false, frames: [{ width: 1, height: 1, startX: 0, startY: 0 }] }, // 5
    { fps: 1, cycle: false, frames: [{ width: 1, height: 1, startX: 0, startY: 0 }] }, // 6
    { fps: 1, cycle: false, frames: [{ width: 1, height: 1, startX: 0, startY: 0 }] }, // 7
    { fps: 1, cycle: false, frames: [{ width: 1, height: 1, startX: 0, startY: 0 }] }  // 8
  ]
};