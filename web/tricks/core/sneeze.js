// A sneeze: ah... ahh... AHH... a false alarm... then out of nowhere, CHOO, hard enough to rattle the screen. He blinks,
// glances both ways to check nobody saw, and carries on. `sneeze` picks the spray: the burst, then the droplets flying on.
{
  const {OX, OY, paint} = hangabout
  const AHH = {eyes: 'strain', stretch: 2, dy: -2, arms: ['up', 'up']}
  const SPRAY = [
    ['.........#....#',
     '.....#.........',
     '..#.....#....#.',
     '##..#......#...',
     '###..#..#.....#',
     '##..#.....#....',
     '..#....#.....#.',
     '.....#.........',
     '.........#...#.'],
    ['.............#.....#',
     '........#...........',
     '....#.......#.....#.',
     '.......#........#...',
     '.....#.....#.......#',
     '.......#.......#....',
     '....#......#......#.',
     '........#...........',
     '.............#....#.'],
  ]

  hangabout.trick({
    name: 'sneeze', label: 'Sneeze ✱', rarity: 'rare',
    frames: [
      [{eyes: 'up', tilt: -3}, 300], // ah...
      [{eyes: 'blink', stretch: 1, dy: -1, tilt: -6, arms: ['mid', 'up']}, 360], // ahh...
      ...[-10, -9, -11, -9].map(tilt => [{...AHH, tilt}, 150]), // AHH...
      [{eyes: 'up', stretch: 1, dy: -1, tilt: -4}, 400], // ...
      [{squash: 1, eyes: 'blink'}, 180], [{eyes: 'happy'}, 550], // false alarm. Phew.
      [{face: 1, squash: 2, dy: -1, tilt: 12, arms: ['down', 'down'], eyes: 'strain', shake: 1, sneeze: 0}, 200], // CHOO
      [{face: 1, squash: 1, tilt: 5, eyes: 'blink', sneeze: 1}, 180],
      [{eyes: 'blink'}, 200], [{eyes: 'side', look: -1}, 400], [{eyes: 'side', look: 1}, 400],
      [{}, 200],
    ],
    front({ctx, d}){
      ctx.globalAlpha = d ? .55 : 1
      paint(ctx, SPRAY[d], OX + 31, OY + 5, {'#': '#FFFFFF'}) // from just in front of his face
      ctx.globalAlpha = 1
    },
  })
}
