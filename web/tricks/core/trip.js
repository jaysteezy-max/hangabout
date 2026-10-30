// A trip: halfway through a walk he catches a foot, pitches forward and faceplants, lies there a beat, pops up, glances
// round to check nobody saw, and carries on. The stumble glides, so he keeps going the way he was walking; `trip` is how
// long he's been down, and its pixels hook lays him flat on his front (tilting him 90° would stand him on his side).
{
  const {GW, GH, EYE} = hangabout
  const CHICKEN = hangabout.skin === 'chicken' // an egg: he tips right over onto his side, rocks there, dazed, and pops back up
  const CAPPY = hangabout.skin === 'cappy' // a loaf side on: he flops flat on his belly where he is
  const DOWN = CHICKEN ? {eyes: 'dizzy'} : {}
  // A walking step, as his own walk draws it, gliding the way he's going.
  const STEP = i => [{lift: [[0, 3], [], [1, 2], []][i % 4], dy: i % 2 ? -1 : 0, swing: i % 4 < 2 ? 1 : -1, tilt: i % 4 < 2 ? -3.5 : 3.5, glide: 45}, 130]

  hangabout.trick({
    name: 'trip', label: 'Trip ⤓', rarity: 'manual', on: {midWalk: .04},
    frames: [
      STEP(0), STEP(1),
      [{lift: [2, 3], arms: ['high', 'high'], eyes: 'up', tilt: 14, glide: 70}, 110], // a toe catches
      [{tuck: 1, arms: ['high', 'high'], eyes: 'strain', tilt: 40, glide: 80}, 90],
      [{tuck: 1, arms: ['up', 'up'], eyes: 'strain', tilt: 70, glide: 70}, 70],
      [{...DOWN, tilt: 0, trip: 0, glide: 40}, 100], // splat
      [{...DOWN, tilt: CHICKEN ? -7 : 0, trip: 1, glide: 20}, 160],
      [{...DOWN, tilt: 0, trip: 2, glide: 1}, 800], // a glide this slow keeps him facing the way he was going
      [{dy: -4, stretch: 1, tuck: 1, arms: ['up', 'up'], eyes: 'up'}, 130], // up!
      [{squash: 2}, 110],
      [{eyes: 'side', look: -1}, 420], [{eyes: 'side', look: 1}, 420],
      ...[0, 1, 2, 3].map(STEP), // as if nothing happened
      [{}, 200],
    ],
    pixels({d, px, pose}){
      if (CHICKEN) { // turned 90° forward about his middle, his crest ahead and his foot behind, then set down on the ground
        const s = pose.face < 0 ? -1 : 1, out = px.map(([x, y, c]) => [22 - s * (y - 29), 29 + s * (x - 22), c]), low = Math.max(...out.map(p => p[1]))
        return out.map(([x, y, c]) => [x, y + GH - 1 - low, c])
      }
      if (CAPPY) return px.filter(([, , c]) => c !== EYE).map(([x, y, c]) => [x, 39 - Math.round((39 - y) * (d ? .6 : .45)), c])
      // Face down, so no eyes. Turned his way, his front edge is x 32: it goes to the ground, his head (y 20) forward and
      // his legs trailing, and his width is squashed to a slab, flattest the moment he lands.
      const flip = x => pose.face < 0 ? GW - 1 - x : x, k = d ? .4 : .3
      return px.filter(([, , c]) => c !== EYE).map(([x, y, c]) => [flip(53 - y), 39 - Math.round((32 - flip(x)) * k), c])
    },
    behind({ctx, d}){
      if (!d) ctx.clearRect(-12, 0, GW + 24, GH) // the trail still holds his falling frame, which would flash upright now he isn't tilted
    },
    front({ctx, d, pose}){
      if (d > 1) return // dust kicked up at his head and feet, spreading and fading
      ctx.fillStyle = '#CFC4BA'; ctx.globalAlpha = d ? .5 : .9
      for (const [x, y] of [[36 + 2 * d, 38 - d], [38 + 2 * d, 39], [12 - 2 * d, 38 - d], [10 - 2 * d, 39]]) ctx.fillRect(pose.face < 0 ? GW - 2 - x : x, y, 2, 1)
      ctx.globalAlpha = 1
    },
  })
}
