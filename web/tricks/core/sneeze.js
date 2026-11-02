// A sneeze: ah... ahh... AHH... a false alarm... then out of nowhere, CHOO, hard enough to rattle the screen. He blinks,
// glances both ways to check nobody saw, and carries on. `sneeze` picks the spray: the burst, then the droplets flying on.
{
  const {OX, OY, paint, head, facing} = hangabout
  // Side on with a face (Cappy, Pusheen, the chicken), he keeps facing his way: glide turns each tilt the way he faces, so
  // the ahs rear his nose up and the CHOO pitches it down either way, and the spray comes out of his snout. Clawd turns to sneeze.
  const PROFILE = hangabout.sideOn && head, LEAN = PROFILE ? {glide: 1} : {}, CHOO = PROFILE ? LEAN : {face: 1}
  const AHH = {eyes: 'strain', stretch: 2, dy: -2, arms: ['up', 'up'], ...LEAN}
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
      [{eyes: 'up', tilt: -3, ...LEAN}, 300], // ah...
      [{eyes: 'blink', stretch: 1, dy: -1, tilt: -6, arms: ['mid', 'up'], ...LEAN}, 360], // ahh...
      ...[-10, -9, -11, -9].map(tilt => [{...AHH, tilt}, 150]), // AHH...
      [{eyes: 'up', stretch: 1, dy: -1, tilt: -4, ...LEAN}, 400], // ...
      [{squash: 1, eyes: 'blink'}, 180], [{eyes: 'happy'}, 550], // false alarm. Phew.
      [{...CHOO, squash: 2, dy: -1, tilt: 12, arms: ['down', 'down'], eyes: 'strain', shake: 1, sneeze: 0}, 200], // CHOO
      [{...CHOO, squash: 1, tilt: 5, eyes: 'blink', sneeze: 1}, 180],
      [{eyes: 'blink'}, 200], [{eyes: 'side', look: -1}, 400], [{eyes: 'side', look: 1}, 400],
      [{}, 200],
    ],
    front({ctx, d, pose}){
      ctx.globalAlpha = d ? .55 : 1
      if (PROFILE) { const h = head(pose); facing(ctx, pose, () => paint(ctx, SPRAY[d].map(r => [...r].reverse().join('')), h.nose - SPRAY[d][0].length, h.y - 2, {'#': '#FFFFFF'})) } // out of his snout, by Cappy's nose
      else paint(ctx, SPRAY[d], OX + 31, OY + 5, {'#': '#FFFFFF'}) // from just in front of his face
      ctx.globalAlpha = 1
    },
  })
}
