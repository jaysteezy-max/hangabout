// Two cartwheels along the ledge, then a happy landing. Frames only: `tilt` turns him, `glide` carries him along
// (px per second, the way he's facing; while gliding, tilt follows that direction too).
hangabout.trick({
  name: 'cartwheel', label: 'Cartwheel ✺', rarity: 'rare',
  frames: [
    [{squash: 2, arms: ['up', 'up']}, 140],
    ...[...Array(16)].map((_, i) => [{face: 0, tilt: (i + 1) * 45, arms: ['high', 'high'], lift: i % 2 ? [0, 3] : [1, 2], glide: 160}, 70]),
    [{squash: 2, arms: ['high', 'high'], eyes: 'happy'}, 160],
    [{arms: ['up', 'up'], eyes: 'happy'}, 400],
    [{}, 200],
  ],
})
