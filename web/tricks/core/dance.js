// A little dance: side steps turning left and right, a hop, music notes floating up. Frames only, no drawing.
// Now and then he dances to celebrate a Claude turn that did real work with nothing failing.
hangabout.trick({
  name: 'dance', label: 'Dance ♪', rarity: 'rare', on: {cleanFinish: .25},
  frames: [
    ...[-1, 1, -1, 1].flatMap(face => [
      [{face, arms: ['up', 'mid'], lift: [0, 3], swing: 1, tilt: face * 4, notes: 1}, 190],
      [{face, dy: -2, arms: ['mid', 'mid'], swing: -1, tilt: -face * 4, notes: 1}, 190],
    ]),
    [{squash: 2, notes: 1}, 120], [{dy: -5, tuck: 1, arms: ['high', 'high'], eyes: 'happy', notes: 1}, 200],
    [{squash: 2, eyes: 'happy', notes: 1}, 140], [{arms: ['up', 'up'], eyes: 'happy', notes: 1}, 450], [{}, 200],
  ],
})
