// Fan pack: Guardian down, after Destiny. Fan-made, unofficial, not affiliated with its rights holders.
// He takes a hit and keels over onto his back, grey and still; his Ghost transmats in and circles him, notices him, gives
// a little wiggle and scans him back and forth with a beam of light; he's revived in a flash, the Light rising off him,
// and the Ghost transmats away.
{
  const {GW, GH, BODY, TOP, SIDE, EYE, recolor, paint, head} = hangabout
  const DEAD = {[BODY]: '#8A8A8A', [TOP]: '#A8A8A8', [SIDE]: '#6C6C6C'}, HURT = {[BODY]: '#FF6A6A', [TOP]: '#FF9C9C', [SIDE]: '#C83C3C'}
  const LIT = {[BODY]: '#FFFFFF', [TOP]: '#FFFFFF', [SIDE]: '#FFFFFF'}
  const CHICKEN = hangabout.skin === 'chicken' // rolled belly-up onto his back, not flipped (he'd stand on his crest), his blue and yellow gone faint too
  const LINE = '#16161A' // the chicken's outline
  if (CHICKEN) { // his crest, wattle and tail, beak and wing, toes and mouth (web/skins/chicken.js)
    Object.assign(DEAD, {'#44AEF6': '#68819A', '#0060A0': '#46586B', '#FFF050': '#CBC49A', '#B8960F': '#7B7150', '#F2BE2E': '#BDB08A', '#6B2020': '#4A3A3A'}) // just a hint of color left, so his beak and wattle still read
    for (const c of ['#44AEF6', '#0060A0', '#FFF050', '#B8960F', '#F2BE2E', '#6B2020']) LIT[c] = '#FFFFFF' // he's white already: the flash shows in them
  }
  const CAPPY = hangabout.skin === 'cappy' // rolls over sideways onto his back, legs in the air, his snout and toes gone grey and white too
  if (CAPPY) { // his snout, its highlight and his toes (web/skins/cappy.js)
    Object.assign(DEAD, {'#86655F': '#727272', '#8F6F69': '#7C7C7C', '#7A3A3E': '#555555'})
    Object.assign(HURT, {'#86655F': '#D45A5A', '#8F6F69': '#E06C6C', '#7A3A3E': '#9E2C2C'})
    Object.assign(LIT, {'#86655F': '#E4E4E4', '#8F6F69': '#F0F0F0', '#7A3A3E': '#D8D8D8'}) // a hint of his face left in the flash
  }
  const CAPPY_LINE = '#1C1214', CAPPY_TOES = '#7A3A3E', N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const LEGS = [[18, -1, 0], [21, 0, 1], [24, 0, 1], [27, 1, 0]] // his legs in the air, facing left, [left x, lean, far]: his near pair splayed out front and back, his far pair shorter between them, in shadow
  /**
   * Cappy turned roll degrees about his long body toward his back, as seen side on: squashed toward the ground, then the
   * other way up, his ears gone under him and his legs in the air (one kicking while it's lifted), outlined fresh, his eye
   * moved unturned so its X stays an X.
   */
  function onBack(px, roll, pose){
    const s = Math.cos(roll * Math.PI / 180), ox = pose.ox || 0, turn = x => pose.face > 0 ? GW - 1 - x : x, t = head(pose).top
    const has = new Set(px.map(([x, y]) => x + ',' + y)), at = new Map(), eye = []
    for (const [x, y, c] of px) { // facing left, without his outline (the lines on his snout and ear stay)
      if (c === EYE) { eye.push([turn(x - ox), y, c]); at.set(turn(x - ox) + ',' + y, BODY) }
      else if (!(c === CAPPY_LINE && N4.some(([ax, ay]) => !has.has(x + ax + ',' + (y + ay)))) && (s > 0 || y >= t && y < 38)) at.set(turn(x - ox) + ',' + y, c) // over, his ears and toes go
    }
    const out = new Map(), put = (x, y, c) => out.set(x + ',' + y, [x, y, c]), to = y => R(s > 0 ? 38 - (38 - y) * s : 38 + (y - t) * s)
    for (let y = 0; y < GH; y++) { // each row takes the one turned onto it, so no gaps
      const sy = R(s > 0 ? 38 - (38 - y) / s : t + (y - 38) / s)
      for (let x = -12; x < GW + 12; x++) { const c = at.get(x + ',' + sy); if (c) put(x, y, c) }
    }
    if (s < 0) LEGS.forEach(([x, lean, far], n) => {
      const h = R((far - 5) * s) + (pose.lift?.includes(n) ? 1 : 0), y0 = to(37) - 1
      for (let k = 0; k < h; k++) for (const i of [0, 1]) put(x + i + lean * k, y0 - k, k === h - 1 ? CAPPY_TOES : far ? SIDE : BODY)
    })
    for (const [x, y] of [...out.values()]) for (const [ax, ay] of N4) if (!out.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, CAPPY_LINE)
    const ey = eye.reduce((a, p) => a + p[1], 0) / eye.length, dy = to(ey) - R(ey) - (s < 0) // on his back, up a row: on his face by his snout, not on his crown
    for (const [x, y, c] of eye) put(x, y + dy, c)
    return [...out.values()].map(([x, y, c]) => [turn(x) + ox, y, c])
  }
  // The slime has no back to fall on: it melts into a grey puddle (its own `puddle` pose, web/skins/slime.js) and springs
  // back up a cube. Its outline, glints and cheeks go grey too, a hint of pink left.
  const SLIME = hangabout.skin === 'slime'
  if (SLIME) Object.assign(DEAD, {'#6A9D23': '#4E4E4E', '#DCF9B6': '#C4C4C4', '#EC9291': '#A38E8E'})
  const SHELL = ['..X.X..', '.XXXXX.', 'XXGEGXX', '.XEWEX.', 'XXGEGXX', '.XXXXX.', '..X.X..'] // spiky shell, glowing eye
  const SHELL_INK = {X: '#E4E7EE', G: '#3A3F4D', E: '#6FE3FF', W: '#FFFFFF'}
  const BANG = ['#', '#', '#', '.', '#']
  const DOWN = SLIME ? {puddle: 2, eyes: 'blink'} : {squash: 2, eyes: 'dizzy'}, UP = [29, 3] // where his Ghost waits while he gets up
  const R = Math.round
  /** Him turned deg toward his back (clockwise as he faces left) about his middle and set down on the ground with his tail under him, his outline drawn fresh (turned, it would break up) and his eye moved unturned, so its X stays an X. */
  function rolled(px, deg, face){
    const a = (face > 0 ? -deg : deg) * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a), at = new Map(px.filter(p => p[2] !== LINE).map(([x, y, c]) => [x + ',' + y, c]))
    const xs = px.map(p => p[0]), ys = px.map(p => p[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2
    const eye = px.filter(p => p[2] === EYE), ex = eye.reduce((s, p) => s + p[0], 0) / eye.length, ey = eye.reduce((s, p) => s + p[1], 0) / eye.length
    for (const [x, y] of eye) at.set(x + ',' + y, at.get(R(ex) + ',' + R(ey - 2))) // his face over it, from just above
    const out = new Map(), put = (x, y, c) => out.set(x + ',' + y, [x, y, c])
    let low = 0 // his lowest pixel that isn't tail: his tail goes into the ground under him
    for (let y = -GH; y < 2 * GH; y++) for (let x = -10; x < GW + 10; x++) { // each cell takes the color of the one turned onto it, so no holes
      const sx = R(cx + (x - cx) * cos + (y - cy) * sin), c = at.get(sx + ',' + R(cy - (x - cx) * sin + (y - cy) * cos))
      if (c) { put(x, y, c); if ((face > 0 ? GW - 1 - sx : sx) < 34) low = Math.max(low, y) }
    }
    for (const [x, y] of [...out.values()]) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!out.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
    const nx = R(cx + (ex - cx) * cos - (ey - cy) * sin - ex), ny = R(cy + (ex - cx) * sin + (ey - cy) * cos - ey)
    for (const [x, y, c] of eye) put(x + nx, y + ny, c)
    return [...out.values()].map(([x, y, c]) => [x, y + GH - 2 - low, c]) // his outline under him on the bottom row
  }
  // A frame of him lying on his back with his Ghost out at `at`.
  const lying = (ghost, ms, pose = DOWN) => [{...pose, ghost: {dead: 1, down: 1, shell: 1, ...ghost}}, ms]
  const orbit = Array.from({length: 29}, (_, i) => { const a = i / 22.4 * 2 * Math.PI; return [R(18 + 15 * Math.cos(a)), R(14 - 8 * Math.sin(a))] }) // 1¼ laps round him, ending above him
  const scan = Array.from({length: 29}, (_, i) => lying({at: [R(18 + 10 * Math.sin(i / 14 * 2 * Math.PI)), 6], look: 1, scan: 1}, 55)) // twice back and forth over him

  hangabout.trick({
    name: 'ghost', label: 'Ghost revive ✦', rarity: 'rare', pack: 'fan', on: {bigDrop: 1}, // dropped from way up
    frames: [
      [{squash: 1, eyes: 'strain', ghost: {hit: 1}}, 120],
      ...CHICKEN ? [[25, .4, 140], [65, .7, 80], [100, .9, 80]].map(([roll, dead, ms]) => [{...DOWN, ghost: {dead, roll}}, ms])
        : CAPPY ? [[{...DOWN, tilt: -12, ghost: {dead: .4}}, 140], [{...DOWN, ghost: {dead: .7, roll: 60}}, 80], [{...DOWN, ghost: {dead: .9, roll: 120}}, 80]] // Cappy rolls over on the ground
        : SLIME ? [[{squash: 2, eyes: 'dizzy', ghost: {dead: .4}}, 140], [{puddle: 1, eyes: 'sad', ghost: {dead: .7}}, 120], [{...DOWN, ghost: {dead: .9}}, 80]] : [ // melts
        [{...DOWN, tilt: -12, ghost: {dead: .4}}, 140], // keels over
        [{...DOWN, tilt: -70, ghost: {dead: .7}}, 80],
        [{...DOWN, tilt: -130, ghost: {dead: .9}}, 80],
      ],
      lying({shell: 0}, 450),
      lying({shell: 0}, 90, {...DOWN, lift: [2]}), // a last twitch
      lying({shell: 0}, 300),
      lying({at: orbit[0], shell: .4, vanish: 1}, 120), // his Ghost transmats in
      lying({at: orbit[0]}, 300),
      ...orbit.map(at => lying({at}, 60)),
      lying({at: [18, 6], look: 1, bang: 1}, 380), // there you are
      ...[1, -1, 1, -1, 0].map(dx => lying({at: [18 + dx, 6], look: 1}, 70)),
      ...scan,
      lying({at: [23, 4]}, 70),
      lying({at: UP}, 70),
      lying({at: UP, dead: 0, flash: 1}, 90),
      [{stretch: 2, dy: -2, arms: ['up', 'up'], ghost: {flash: 1, shell: 1}}, 120], // revived
      [{stretch: 1, dy: -3, arms: ['up', 'up'], eyes: 'happy', ghost: {shell: 1, light: 1}}, 320],
      [{squash: 1, arms: ['up', 'up'], eyes: 'happy', ghost: {shell: .5, light: .6}}, 220],
      [{eyes: 'happy', ghost: {vanish: 1, light: .3}}, 220],
      [{}, 200],
    ],
    pixels({d: g, px, pose}){
      if (CAPPY && (g.down || g.roll)) px = onBack(px, g.down ? 140 : g.roll, pose) // lying a little flatter than he stands; before the recolors, so his legs take them
      if (g.dead) px = recolor(px, DEAD, g.dead)
      if (g.hit) px = recolor(px, HURT, 1)
      if (g.flash) px = recolor(px, LIT, 1)
      if (CHICKEN && (g.down || g.roll)) px = rolled(px, g.roll || 90, pose.face)
      else if (g.down && !CAPPY && !SLIME) { const top = Math.min(...px.map(p => p[1])); px = px.map(([x, y, c]) => [x, top + GH - 1 - y, c]) } // on his back, legs in the air
      return px
    },
    /** His Ghost bobbing where it is, the scan beam it sweeps over him, and the Light rising off him as he comes back. */
    front({ctx, d: g, now}){
      const [gx, gy] = [(g.at || UP)[0], (g.at || UP)[1] + Math.floor(now / 260) % 2]
      if (g.scan) { // widening down over him, a bright line running down it
        const sweep = gy + 8 + Math.floor(now / 45) % (GH - gy - 9)
        for (let y = gy + 7; y < GH; y++) {
          const half = R((y - gy - 6) * .3)
          ctx.globalAlpha = y === sweep ? .75 : .26; ctx.fillStyle = '#7FE6FF'
          ctx.fillRect(gx + 3 - half, y, half * 2 + 1, 1)
        }
      }
      if (g.shell) {
        ctx.globalAlpha = g.shell
        paint(ctx, SHELL, gx, gy, SHELL_INK)
        ctx.fillStyle = '#A6ACBA' // a little shading on the shell's spikes
        SHELL.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'X' && (i + j) % 3 === 0) ctx.fillRect(gx + i, gy + j, 1, 1) }))
        if (g.look) { ctx.fillStyle = SHELL_INK.E; ctx.fillRect(gx + 3, gy + 3, 1, 1); ctx.fillStyle = SHELL_INK.W; ctx.fillRect(gx + 3, gy + 4, 1, 1) } // eye turned down at him
      }
      ctx.globalAlpha = 1
      if (g.bang) paint(ctx, BANG, gx + 3, gy - 6, {'#': '#FFD84D'})
      if (g.vanish) { ctx.fillStyle = '#BFF4FF'; for (const [a, b] of [[0, 0], [6, 1], [3, -2], [1, 5], [5, 6]]) ctx.fillRect(gx + a, gy + b, 1, 1) } // transmats in or out
      if (g.light) for (let i = 0; i < 8; i++) {
        const age = (now / 6 + i * 37) % 30
        ctx.globalAlpha = g.light * (1 - age / 30); ctx.fillStyle = i % 2 ? '#FFFFFF' : '#FFE9A8'
        ctx.fillRect(6 + (i * 5) % 32, GH - 6 - R(age), 1, 1)
      }
      ctx.globalAlpha = 1
    },
    glow: g => g.scan ? ' drop-shadow(0 0 3px rgba(120,230,255,.6))' : '',
  })
}
