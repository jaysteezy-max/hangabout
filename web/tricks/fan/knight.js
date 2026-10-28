// Fan pack: the Blue Knight's own moves, from Castle Crashers, a game by The Behemoth. Fan-made and unofficial, not
// affiliated with or endorsed by The Behemoth. They're his alone, registered only while he's the skin: his ice magic
// (the Ice Fist that launches him, an Ice Bolt, a rain of Ice Shards, freezing solid), a sword combo, a bow shot and a
// sandwich. When a move needs his hands, his sword and shield go down on the ground and come back with a sparkle.
// Drawn as if he faces left (facing() mirrors it when he faces right): his front fist, out for a prop, is at x 7 to 11.
if (hangabout.skin === 'knight') {
  const {paint, facing, mix, thickLine, desk} = hangabout
  const ICE = {W: '#F2FBFF', L: '#BFEFFF', B: '#7FD4FF', D: '#3E9BD6', O: '#1F5C8E'} // white-hot to deep ice; O its outline
  const dot = (ctx, x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1) }
  /** Ice breaking up: bits flying out from (x, y) and falling, k from 0 (whole) to 1 (gone). */
  const burst = (ctx, x, y, k) => {
    ctx.globalAlpha = 1 - k * .7
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2, r = 3 + k * 12
      ctx.fillStyle = i % 3 ? ICE.L : ICE.W
      ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * .7 + k * k * 10), 2, 2)
    }
    ctx.globalAlpha = 1
  }
  /** Gold sparkles round him, k their strength. */
  const sparkles = (ctx, now, k) => {
    for (let i = 0; i < 6; i++) {
      if ((Math.floor(now / 90) + i) % 3 === 0) continue
      const x = [4, 38, 9, 35, 2, 41][i], y = [12, 9, 30, 27, 21, 19][i]
      for (const [ax, ay] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.globalAlpha = k * (ax || ay ? .7 : 1); dot(ctx, x + ax, y + ay, ax || ay ? '#FFD84D' : '#FFFBD6') }
    }
    ctx.globalAlpha = 1
  }

  // Projectiles cross the screen as page elements of their own (as the paper plane does).
  document.head.insertAdjacentHTML('beforeend', '<style>.knightShot{position:absolute;pointer-events:none;z-index:11;image-rendering:pixelated;transition:opacity .5s}</style>')
  let live = [] // still on screen: cleared if a move is cut short
  const clear = () => { for (const el of live) el.remove(); live = [] }
  const fadeOut = (el, wait) => setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.remove(), 500) }, wait)
  /** Pixel art as a page element, a points per pixel, pointing right; flipped to point left when dir is -1. */
  const sprite = (rows, ink, a, dir) => {
    const el = document.createElement('canvas')
    el.className = 'knightShot'; el.width = rows[0].length; el.height = rows.length
    paint(el.getContext('2d'), rows, 0, 0, ink)
    Object.assign(el.style, {width: el.width * a + 'px', height: el.height * a + 'px', transform: `scaleX(${dir})`})
    desk.append(el); live.push(el)
    return el
  }
  /** Shoots rows, tip first, from (x0, y) toward dir at speed points per ms, to the screen's edge; there, land(el, x, y). */
  function shoot(rows, ink, x0, y, dir, speed, land){
    const s = hangabout.size, a = 3 * s, el = sprite(rows, ink, a, dir), w = rows[0].length * a, x1 = dir > 0 ? hangabout.width : 0
    const T = Math.abs(x1 - x0) / (speed * s), at = x => { el.style.left = (dir > 0 ? x - w : x) + 'px' }
    el.style.top = y - rows.length * a / 2 + 'px'
    at(x0)
    return {fly: t => { at(x0 + (x1 - x0) * Math.min(1, t / T)); if (t < T) return false; land(el, x1, y); return true }}
  }
  /** Turns toward the room when he's too near the edge he faces, as the paper plane does. */
  const roomward = (x, dir) => (dir > 0 ? hangabout.width - x : x) < hangabout.width / 3 ? -dir : dir

  // Ice Fist, his magic jump: a giant fist of ice punches up out of the ground under him and launches him; at the top it
  // shatters and he comes down into a crouch.
  const FIST = [ // knuckles up, wider than he is; its wrist is the last row, repeated down to the ground
    '..OOOO.OOOO.OOO..',
    '.OWWLLOWLLLOWLLO.',
    'OWLLBLLLLBLLLLBLO',
    'OLLBBLLLLBBLLBBLO',
    'OLLLLLLLLLLLLLLLO',
    'OBLLLLLLLLLLLLLBO',
    '.OBBLLLLLLLLLBBO.',
    '..OBBBBBBBBBBBO..',
  ]
  hangabout.trick({
    name: 'iceFist', label: 'Ice Fist ❄', rarity: 'rare', pack: 'fan', on: {cleanFinish: .25},
    frames: [
      [{squash: 2, eyes: 'angry', iceFist: {h: 0}}, 180],
      [{squash: 2, eyes: 'angry', iceFist: {h: 3}}, 70], // it breaks the ground under him
      [{dy: -3, tuck: 1, eyes: 'strain', iceFist: {h: 6}}, 70],
      [{dy: -6, tuck: 1, eyes: 'strain', iceFist: {h: 9}}, 90],
      [{dy: -6, sword: 'raise', eyes: 'happy', iceFist: {h: 9}}, 220], // up he goes on it, sword high
      [{dy: -6, sword: 'raise', eyes: 'happy', iceFist: {shatter: .35}}, 90],
      [{dy: -5, eyes: 'happy', iceFist: {shatter: .7}}, 90],
      [{dy: -2, iceFist: {shatter: 1}}, 80],
      [{squash: 2}, 130], [{squash: 1}, 140], [{}, 200],
    ],
    front({ctx, d}){ // in front of his boots, its knuckles under his feet
      if (d.h) {
        const top = 40 - d.h
        FIST.forEach((r, j) => { if (top + j < 40) paint(ctx, [r], 13, top + j, ICE) })
        for (let y = top + FIST.length; y < 40; y++) paint(ctx, [FIST.at(-1)], 13, y, ICE)
      }
      if (d.shatter) { burst(ctx, 17, 35, d.shatter); burst(ctx, 26, 36, d.shatter) }
    },
  })

  // Ice Bolt, his magic projectile: he gathers cold round his free gauntlet, thrusts it and fires a pointed bolt of ice
  // that flies off across the screen and shatters at its edge. A trip that stays put; the bolt is a page element.
  const BOLT = ['.....LW...', '..BBBLWWW.', 'OBBLLLWWWW', '..BBBLWWW.', '.....LW...']
  const BURST = ['W..L..W', '.L.W.L.', '..LWL..', 'LWWWWWL', '..LWL..', '.L.W.L.', 'W..L..W']
  hangabout.trick({
    name: 'iceBolt', label: 'Ice Bolt ➹', rarity: 'rare', pack: 'fan', on: {forcePush: 1},
    trip({x, y, dir}){
      const s = hangabout.size, a = 3 * s
      dir = roomward(x, dir)
      let shot
      const land = (el, ex, ey) => {
        el.remove()
        const b = sprite(BURST, ICE, a, 1), w = BURST[0].length * a
        Object.assign(b.style, {left: (dir > 0 ? ex - w : ex) + 'px', top: ey - w / 2 + 'px'})
        fadeOut(b, 250)
      }
      return [
        {go: 'hold', T: 300, pose: {face: dir, hand: 7, eyes: 'angry', iceBolt: {charge: 1}}},
        {go: 'hold', T: 140, pose: {face: dir, squash: 1, hand: 7, eyes: 'angry', iceBolt: {charge: 2}}},
        {go: 'do', fn: () => (shot = shoot(BOLT, ICE, x + dir * 45 * s, y - 38 * s, dir, 1.6, land))}, // from his fist's front (art 37, 27)
        {go: 'move', fn: t => shot.fly(t), pose: t => ({face: dir, hand: 6, reach: 2, dy: t < 120 ? -1 : 0, eyes: 'side', look: dir})},
        {go: 'hold', T: 400, pose: {face: dir, eyes: 'happy'}},
        {go: 'hold', T: 200, pose: {}},
      ]
    },
    end: clear,
    front({ctx, d, pose, now}){
      facing(ctx, pose, () => { // the cold gathering round his front fist
        for (let i = 0; i < 4 * d.charge; i++) {
          const a = now / 90 + i * 1.6
          dot(ctx, Math.round(9 + Math.cos(a) * 4), Math.round(27 + (pose.squash || 0) + Math.sin(a) * 3), i % 2 ? ICE.W : ICE.B)
        }
      })
    },
  })

  // Ice Shards, his splash magic: he raises his sword and shards of ice rain down all round him, shattering on the ground.
  const SHARD = ['OBO', 'BLB', 'BLB', '.L.', '.W.'] // point down
  const DROPS = [[-6, 0], [3, .15], [12, .05], [31, .2], [40, .1], [49, .25], [20, .35], [-2, .45], [45, .5]] // [x, when it starts to fall]
  hangabout.trick({
    name: 'iceShards', label: 'Ice Shards ✲', rarity: 'rare', pack: 'fan', on: {failStreak: .5},
    frames: [
      [{squash: 1, eyes: 'angry'}, 140],
      [{sword: 'raise', stretch: 1, eyes: 'angry'}, 200],
      ...[...Array(16)].map((_, i) => [{sword: 'raise', eyes: i % 6 === 5 ? 'blink' : 'up', iceShards: (i + 1) / 16}, 70]),
      [{squash: 1, eyes: 'happy'}, 200], [{}, 200],
    ],
    front({ctx, d}){
      for (const [x, at] of DROPS) {
        const u = (d - at) / .45 // each one falls for 45% of the rain
        if (u > 0 && u < 1) paint(ctx, SHARD, x, Math.round(-5 + u * 39), ICE) // from above his canvas to the ground
        else if (u >= 1 && u < 1.4) burst(ctx, x + 1, 37, (u - 1) / .4)
      }
    },
  })

  // Frozen, his elemental infusion turned on himself: ice climbs round him until he's frozen solid, wide-eyed; cracks
  // spread, it shatters, and he shivers it off.
  const CRACKS = [[[12, 8], [15, 12], [13, 16], [17, 21]], [[31, 10], [28, 15], [32, 19]], [[20, 26], [24, 29], [21, 34]], [[7, 22], [10, 26], [8, 31]]]
  hangabout.trick({
    name: 'frozen', label: 'Frozen ❆', rarity: 'rare', pack: 'fan', on: {drowsy: .5},
    frames: [
      [{eyes: 'down', frozen: {k: .25}}, 130], [{eyes: 'strain', frozen: {k: .55}}, 130], [{eyes: 'strain', frozen: {k: .85}}, 130],
      [{eyes: 'strain', frozen: {k: 1}}, 1100],
      [{eyes: 'strain', frozen: {k: 1, crack: 1}}, 350], [{eyes: 'strain', frozen: {k: 1, crack: 2}}, 300],
      [{squash: 1, eyes: 'strain', shake: 1, frozen: {shatter: .3}}, 90], [{dy: -2, stretch: 1, eyes: 'strain', frozen: {shatter: .7}}, 110],
      ...[1, -1, 1, -1, 1, -1].map((ox, i) => [{ox, eyes: 'blink', frozen: {chill: 1 - i / 6}}, 70]), // shivering it off
      [{eyes: 'happy'}, 300], [{}, 200],
    ],
    pixels({d, px}){
      const t = d.k ? .35 * d.k : d.chill ? .3 * d.chill : 0 // frosted over
      return t ? px.map(([x, y, c]) => [x, y, mix(c, ICE.L, t)]) : px
    },
    front({ctx, d}){
      if (d.k) { // the block, clear and pale, grown from the ground up
        const top = Math.round(39 - d.k * 35)
        ctx.globalAlpha = .28; ctx.fillStyle = ICE.B; ctx.fillRect(3, top, 38, 40 - top)
        ctx.globalAlpha = .85; ctx.fillStyle = ICE.W; ctx.fillRect(3, top, 38, 1); ctx.fillRect(3, top, 1, 40 - top); ctx.fillRect(40, top, 1, 40 - top)
        for (const [x, y, len] of [[7, 10, 6], [9, 18, 4], [36, 14, 5]]) if (y > top) ctx.fillRect(x, y, 1, len) // shine
        ctx.globalAlpha = 1
        for (const pts of CRACKS.slice(0, 2 * (d.crack || 0))) for (let i = 1; i < pts.length; i++) thickLine(ctx, ...pts[i - 1], ...pts[i], 1, ICE.W)
      }
      if (d.shatter) for (const [x, y] of [[8, 12], [20, 8], [34, 14], [12, 28], [30, 30]]) burst(ctx, x, y, d.shatter)
      if (d.chill) for (const [x, y] of [[6, 14], [37, 20], [11, 33]]) dot(ctx, x, y, ICE.W) // a few flakes still on him
    },
  })

  // Sword combo: light, light, heavy. Two quick thrusts with his sheathed sword, then he raises it and slams it down.
  hangabout.trick({
    name: 'swordCombo', label: 'Sword combo ⚔', rarity: 'rare', pack: 'fan', on: {beat: 1},
    frames: [
      [{squash: 1, eyes: 'angry'}, 140],
      [{sword: 'forward', eyes: 'angry', swordCombo: {whoosh: 1}}, 120], [{eyes: 'angry'}, 100],
      [{sword: 'forward', dy: -1, eyes: 'angry', swordCombo: {whoosh: 1}}, 120], [{eyes: 'angry'}, 100],
      [{sword: 'raise', stretch: 2, eyes: 'angry'}, 240], // winds up
      [{sword: 'down', squash: 2, eyes: 'strain', shake: 1, swordCombo: {dust: .2}}, 130], // slam
      [{sword: 'down', squash: 1, eyes: 'angry', swordCombo: {dust: .6}}, 160],
      [{sword: 'down', eyes: 'happy', swordCombo: {dust: 1}}, 240],
      [{}, 200],
    ],
    front({ctx, d, pose}){
      facing(ctx, pose, () => {
        if (d.whoosh) { // the thrust's whoosh, ahead of its tip
          ctx.globalAlpha = .75; ctx.fillStyle = '#FFFFFF'
          for (const [y, len] of [[28, 6], [30, 9], [32, 5]]) ctx.fillRect(-1 - len, y + (pose.dy || 0), len, 1)
          ctx.globalAlpha = 1
        }
        if (d.dust) { // where the sword hit the ground: round puffs, billowing out and fading
          ctx.globalAlpha = 1 - d.dust * .8
          for (const [cx, r, c] of [[3, 2, '#9E978A'], [8, 3, '#BDB6A8'], [13, 2, '#D6D0C4']]) {
            const R = r + d.dust * 2, x0 = cx - Math.round(d.dust * 2 * (cx < 8 ? 1 : cx > 8 ? -1 : 0))
            ctx.fillStyle = c
            for (let y = -Math.ceil(R); y <= 0; y++) { const w = Math.round(Math.sqrt(Math.max(0, R * R - y * y))); ctx.fillRect(x0 - w, 38 + y, 2 * w + 1, 1) }
          }
          ctx.globalAlpha = 1
        }
      })
    },
  })

  // Bow shot: he lays his sword and shield down, takes out his bow, draws, and fires an arrow that flies off and thunks
  // into the screen's edge, where it stays a moment and fades; then he has his gear back. A trip that stays put.
  const ARROW = ['F.........', 'FFSSSSSSHH', 'F.........'], FLIGHT = {F: '#E5484D', S: '#8A5A33', H: '#B9BDC6'}
  const BOW = '#8A5A33', BOW_LIT = '#B07A45', STRING = '#E8E2D4'
  hangabout.trick({
    name: 'bowShot', label: 'Bow shot ➶', rarity: 'rare', pack: 'fan', on: {midWalk: .08},
    trip({x, y, dir}){
      const s = hangabout.size, down = {face: dir, sword: 'dropped'}
      dir = roomward(x, dir); down.face = dir
      let shot
      return [
        {go: 'hold', T: 180, pose: {sword: 'dropped', squash: 1, eyes: 'down'}},
        {go: 'hold', T: 300, pose: {...down, hand: 7, eyes: 'side', look: dir, bowShot: {pull: 0}}}, // bow out
        {go: 'hold', T: 450, pose: {...down, hand: 7, pull: 1, squash: 1, eyes: 'angry', bowShot: {pull: 1}}}, // draws
        {go: 'do', fn: () => (shot = shoot(ARROW, FLIGHT, x + dir * 54 * s, y - 38 * s, dir, 2.2, el => fadeOut(el, 2000)))}, // from the bow (art 40, 27)
        {go: 'move', fn: t => shot.fly(t), pose: {...down, hand: 7, eyes: 'side', look: dir, bowShot: {pull: 0}}},
        {go: 'hold', T: 500, pose: {...down, eyes: 'happy', arms: dir > 0 ? ['mid', 'high'] : ['high', 'mid']}}, // a hit!
        {go: 'hold', T: 220, pose: {sword: 'poof', eyes: 'happy'}},
        {go: 'hold', T: 200, pose: {}},
      ]
    },
    end: clear,
    front({ctx, d, pose}){
      facing(ctx, pose, () => { // the bow in his front fist; drawn, its string back to his other hand with an arrow on it
        const y = (pose.squash || 0)
        for (let j = 0; j <= 19; j++) { const bulge = Math.round(3 * Math.sin(j / 19 * Math.PI)); dot(ctx, 6 - bulge, 18 + j + y, j % 5 ? BOW : BOW_LIT) }
        const nock = d.pull ? 12 : 7
        thickLine(ctx, 6, 18 + y, nock, 27 + y, 1, STRING); thickLine(ctx, nock, 28 + y, 6, 37 + y, 1, STRING)
        if (d.pull) paint(ctx, ['.........F', 'HHSSSSSSFF', '.........F'], 1, 26 + y, FLIGHT) // the arrow, nocked
      })
    },
  })

  // Sandwich: he lays his gear down, eats a sandwich in three bites, bulks up in a golden glow (his Beefy moment), flexes,
  // settles, and has his gear back with a sparkle.
  const SANDWICH = ['.bbbbbb.', 'gggggggg', 'rrrrrrrr', 'bbbbbbbb'], FILLING = {b: '#E8B66A', g: '#6CC24A', r: '#E07A7A'}
  hangabout.trick({
    name: 'sandwich', label: 'Sandwich ▤', rarity: 'rare', pack: 'fan', on: {longFinish: .5},
    frames: [
      [{squash: 1, sword: 'dropped', eyes: 'down'}, 220],
      [{sword: 'dropped', hand: 6, eyes: 'happy', sandwich: {bites: 0}}, 450],
      ...[1, 2, 3].flatMap(bites => [
        [{sword: 'dropped', chin: 1, eyes: 'blink', sandwich: {bites, mouth: 1}}, 220], // a bite
        [{sword: 'dropped', hand: 6, eyes: 'happy', sandwich: {bites}}, bites < 3 ? 240 : 120],
      ]),
      [{squash: 2, sword: 'dropped', eyes: 'strain'}, 240], // whoa
      [{stretch: 2, sword: 'dropped', arms: ['high', 'high'], eyes: 'angry', shake: 1, sandwich: {beefy: 1}}, 520], // beefy!
      [{squash: 1, sword: 'dropped', arms: ['up', 'up'], eyes: 'happy', sandwich: {beefy: .7}}, 260],
      [{stretch: 1, sword: 'dropped', arms: ['high', 'high'], eyes: 'happy', sandwich: {beefy: .4}}, 260],
      [{sword: 'poof', eyes: 'happy'}, 220], [{}, 200],
    ],
    front({ctx, d, pose, now}){
      facing(ctx, pose, () => {
        const cols = 8 - 3 * (d.bites || 0) // bitten from the end nearest him
        if (cols > 0 && !d.beefy) { const [x, y] = d.mouth ? [12, 22] : [1, 22]; paint(ctx, SANDWICH.map(r => r.slice(0, cols)), x, y + (pose.dy || 0), FILLING) }
        if (d.mouth) for (const [x, y] of [[16, 29], [18, 31]]) dot(ctx, x, y, FILLING.b) // crumbs
      })
      if (d.beefy) sparkles(ctx, now, d.beefy)
    },
    glow: d => d.beefy ? ` drop-shadow(0 0 ${2 + 3 * d.beefy}px rgba(255,216,77,${.9 * d.beefy}))` : '',
  })
}
