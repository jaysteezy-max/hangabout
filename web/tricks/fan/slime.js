// The Minecraft slime's own tricks: fan art of the slime from Minecraft, by Mojang Studios / Microsoft. Fan-made and
// unofficial, not affiliated with or endorsed by Mojang or Microsoft. They play only while the slime is the pet (see
// web/skins/slime.js) and are listed in the Tricks menu like its everyday moves, not hidden as secrets: picking the
// slime already takes the Fan pack. It splits into little slimes, bounces like a slime block, gets something stuck to
// it, and melts into a puddle.
if (hangabout.skin === 'slime') {
  const {BODY, TOP, EYE, paint, facing, head} = hangabout
  const LINE = '#6A9D23', LEAF = '#E8873A', STEM = '#9A4A1C'

  // A little slime, the size the game's splits into, facing left (the far eye, the near eye, the mouth on its face side).
  const MINI = ['....###....', '..##TTT##..', '##TWTTTTT##', '#BB##T##BB#', '#KBBB#BBBB#', '#KBKB#BBBB#', '#BBKB#BBBB#', '#BKBB#BBBB#', '.##BB#BB##.', '...#####...']
  const MINK = {'#': LINE, T: TOP, B: BODY, W: '#FFFFFF', K: EYE}
  // Where each of the three little slimes lands, hop by hop, from where it split to where they merge again (x of its middle).
  const PATHS = [[21, 13, 5, 5, 9, 5, 13, 21], [21, 21, 17, 25, 21, 17, 25, 21], [21, 29, 37, 37, 33, 37, 29, 21]]
  const HOPS = PATHS[0].length - 1, N = 56
  /** A puff of slime bits round x, y: out as u goes 0 to 1. */
  const puff = (ctx, u, x, y) => { for (let i = 0; i < 8; i++) { const a = i / 8 * 2 * Math.PI, r = 2 + 7 * u; ctx.fillStyle = i % 2 ? BODY : TOP; ctx.fillRect(Math.round(x + r * Math.cos(a)), Math.round(y + .6 * r * Math.sin(a)), 1, 1) } }
  console.assert(MINI.every(r => r.length === 11) && PATHS.every(p => p.length === HOPS + 1), 'slime tricks: a little slime is 11 wide, every path the same length')

  hangabout.trick({
    name: 'split', label: 'Split ⁂', rarity: 'rare',
    frames: [
      [{squash: 2}, 140], [{stretch: 2, dy: -1, eyes: 'happy'}, 90],
      ...[...Array(N + 1)].map((_, i) => [{split: i / N}, 50]), // three little slimes, hopping apart and back
      [{squash: 2, eyes: 'happy'}, 130], [{stretch: 1}, 90], [{squash: 1}, 90], [{eyes: 'happy'}, 400], [{}, 200],
    ],
    pixels: () => [], // the big one is the three little ones for now
    front({ctx, d}){
      if (d < .08) puff(ctx, d / .08, 21, 33)
      if (d > .92) puff(ctx, (1 - d) / .08, 21, 33)
      PATHS.forEach((p, n) => {
        const u = d * HOPS, k = Math.min(HOPS - 1, Math.floor(u)), f = u - k
        const x = p[k] + (p[k + 1] - p[k]) * f, up = Math.round((n === 1 ? 7 : 5) * 4 * f * (1 - f))
        const dir = p[k + 1] - p[k] || p[Math.min(HOPS, k + 2)] - p[k + 1], rows = f < .12 || f > .88 ? MINI.filter((_, j) => j !== 6) : MINI // squashed as it lands and takes off
        paint(ctx, dir > 0 ? rows.map(r => [...r].reverse().join('')) : rows, Math.round(x) - 5, 40 - rows.length - up, MINK)
      })
    },
  })

  // Like a slime block: pressed flat, it springs up far past its usual hop, flips once at the top and lands with a squish.
  hangabout.trick({
    name: 'superBounce', label: 'Super bounce ⇡', rarity: 'rare', on: {doubleClick: 1},
    trip({x, y, dir}){
      const s = hangabout.size, H = Math.max(20 * s, Math.min(70 * s, y - hangabout.scr.top - 60 * s)), T = 1000
      const air = t => { const u = t / T; return u < .18 ? {stretch: 2} : u < .3 ? {stretch: 1} : u < .7 ? {tilt: dir * 360 * (u - .3) / .4, eyes: 'happy'} : u < .85 ? {eyes: 'happy'} : {stretch: 1} }
      return [
        {go: 'hold', T: 120, pose: {squash: 1}},
        {go: 'hold', T: 280, pose: {squash: 2, eyes: 'strain'}},
        {go: 'move', pose: air, fn: t => { const u = Math.min(1, t / T); hangabout.putFeet(x, y - H * 4 * u * (1 - u)); return u >= 1 }},
        {go: 'hold', T: 110, pose: {squash: 2}}, {go: 'hold', T: 90, pose: {stretch: 1}}, {go: 'hold', T: 90, pose: {squash: 1}},
        {go: 'hold', T: 300, pose: {eyes: 'happy'}},
      ]
    },
  })

  // A leaf drifts down and sticks to its top. It shakes, it jiggles, and at last a big boing flings it off.
  const LEAF_ROWS = ['.LL..', 'LLLL.', '.LLLs', '...s.']
  const stuck = .3 // how far into the trick the leaf lands
  hangabout.trick({
    name: 'sticky', label: 'Sticky ✿', rarity: 'rare',
    frames: [
      ...[...Array(14)].map((_, i) => [{sticky: i / 14 * stuck, eyes: i > 8 ? 'up' : 'open'}, 70]),
      [{sticky: stuck, squash: 1, eyes: 'up'}, 160], [{sticky: stuck, eyes: 'up'}, 300],
      ...[-6, 6, -6, 6, -4, 4].map(tilt => [{sticky: stuck, tilt, eyes: 'strain'}, 80]),
      [{sticky: stuck, eyes: 'sad'}, 350],
      ...[0, 1, 2].flatMap(() => [[{sticky: stuck, squash: 2, eyes: 'angry'}, 90], [{sticky: stuck, stretch: 2, eyes: 'angry'}, 90]]),
      [{sticky: stuck, squash: 2}, 140],
      ...[...Array(10)].map((_, i) => [{sticky: stuck + (1 - stuck) * (i + 1) / 10, ...i < 2 ? {stretch: 2, dy: -3 + i} : {}, eyes: 'happy'}, 70]),
      [{eyes: 'happy'}, 300], [{}, 200],
    ],
    front({ctx, d, pose}){
      const top = head(pose).top, flip = d < stuck && Math.floor(d * 40) % 2 // it flutters as it falls
      let x = 23, y = top - 1, alpha = 1
      if (d < stuck) { const u = d / stuck; x = Math.round(30 - 7 * u + 2 * Math.sin(u * 10)); y = Math.round(2 + (top - 3) * u) }
      else if (d > stuck) { const u = (d - stuck) / (1 - stuck); x = Math.round(23 + 18 * u); y = Math.round(top - 1 - 30 * u + 40 * u * u); alpha = 1 - u }
      ctx.globalAlpha = alpha
      facing(ctx, pose, () => paint(ctx, flip ? LEAF_ROWS.map(r => [...r].reverse().join('')) : LEAF_ROWS, x, y, {L: LEAF, s: STEM}))
      ctx.globalAlpha = 1
    },
  })

  // Now and then it lets go: it sags into a mound, settles into a happy puddle, then pulls itself back into a cube.
  hangabout.trick({
    name: 'melt', label: 'Melt ≈', rarity: 'common',
    frames: [
      [{squash: 1}, 300], [{squash: 2, eyes: 'blink'}, 400], [{puddle: 1, eyes: 'blink'}, 450], [{puddle: 2, eyes: 'happy'}, 1800],
      [{puddle: 2}, 500], [{puddle: 2, eyes: 'blink'}, 120], [{puddle: 2}, 300],
      [{puddle: 1, eyes: 'strain'}, 260], [{squash: 2, eyes: 'strain'}, 160], [{stretch: 2}, 140], [{squash: 1}, 110], [{stretch: 1}, 100],
      [{eyes: 'happy'}, 350], [{}, 200],
    ],
  })
}
