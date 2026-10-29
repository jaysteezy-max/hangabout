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
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2, r = 3 + k * 12, n = k < .6 ? 2 : 1 // solid chunks, breaking smaller as they fall
      ctx.fillStyle = [ICE.W, ICE.L, ICE.B][i % 3]
      ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * .7 + k * k * 10), n, n)
    }
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

  const BURST = ['W..L..W', '.L.W.L.', '..LWL..', 'LWWWWWL', '..LWL..', '.L.W.L.', 'W..L..W'] // ice going to pieces
  const STAR = ['...W...', '...W...', '..WLW..', 'WWLWLWW', '..WLW..', '...W...', '...W...'] // a flash
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

  // Ice Fist, his magic jump: a giant fist of ice punches up out of the ground under him and carries him up on its
  // knuckles; at the top he raises his sword, it shatters, and he drops back down into a crouch. The fist is a page
  // element under his boots, so it can be bigger than his canvas. A trip that stays put.
  const FIST = [ // knuckles up, wider than he is, its thumb across the front; its wrist is the last row, repeated down to the ground
    '...OOOOO.OOOOO.OOOOO.OOOO...',
    '..OWWLLLOWWLLLOWWLLLOWWLLO..',
    '.OWWLLLBOWLLLBOWLLLBOWLLLBO.',
    '.OWLLLLBOLLLLBOLLLLBOLLLLBO.',
    '.OLLLLBBOLLLBBOLLLBBOLLLBBO.',
    '.ODDDDDDODDDDDDODDDDDODDDDO.',
    '.OLLLLLBOLLLLBOLLLLBOLLLLBO.',
    'OOOOOOOOOOOOLLBOLLLBOLLLBBO.',
    'OWWWWWWWWLLLOOBOLLBBOLLBBO..',
    'OWLLLLLLLLLLLLOOLBBDOLBBDO..',
    'OLLLLLLLLLLLLLBOOBDDOBDDO...',
    'OBBLLLLLLLLLLBBBOODDODDO....',
    '.OBBBBBBBBBBBBBBBDOOOOO.....',
    '..OOODBBBBBBBBBBBDDO........',
    '....OBLLLLLLLLLLLBDO........',
  ]
  hangabout.trick({
    name: 'iceFist', label: 'Ice Fist ❄', rarity: 'rare', pack: 'fan', on: {cleanFinish: .25},
    trip({x, y}){
      const s = hangabout.size, a = 3 * s, H = 22, w = FIST[0].length * a // H: how high it lifts him, in his pixels
      const el = document.createElement('canvas'), g = el.getContext('2d')
      el.className = 'knightShot'; el.width = FIST[0].length
      let h = 0
      const rise = n => { // the fist n pixels out of the ground, its knuckles under his boots, and him on them
        h = n; el.height = n
        paint(g, [...FIST, ...Array(Math.max(0, n - FIST.length)).fill(FIST.at(-1))].slice(0, n), 0, 0, ICE)
        Object.assign(el.style, {width: w + 'px', height: n * a + 'px', left: x - w / 2 + 'px', top: y - n * a + 'px'})
        hangabout.putFeet(x, y - n * a)
      }
      const shatter = () => { // it breaks into its own pieces (four knuckles, thumb, fingers, wrist), flung out and dropping to the ground, gone as he lands
        const rows = [...FIST, ...Array(Math.max(0, h - FIST.length)).fill(FIST.at(-1))], top = y - h * a
        el.remove()
        for (const [cx, cy, cw, ch] of [[0, 0, 8, 7], [8, 0, 6, 7], [14, 0, 6, 7], [20, 0, 8, 7], [0, 7, 14, 6], [14, 7, 14, 6], [3, 13, 17, h - 13]]) {
          const b = sprite(rows.slice(cy, cy + ch).map(r => r.slice(cx, cx + cw)), ICE, a, 1), out = (cx + cw / 2 - 14) / 14
          Object.assign(b.style, {left: x - w / 2 + cx * a + 'px', top: top + cy * a + 'px', transition: 'transform .17s ease-in, opacity .17s ease-in'})
          b.getBoundingClientRect() // lay it out where it was, so the fall below animates
          Object.assign(b.style, {transform: `translate(${Math.round(out * 4) * a}px, ${(h - cy - ch) * a}px)`, opacity: 0})
          setTimeout(() => b.remove(), 220)
        }
      }
      return [
        {go: 'hold', T: 260, pose: {squash: 2, eyes: 'angry'}}, // gathers the cold
        {go: 'do', fn: () => { desk.append(el); live.push(el); rise(2) }}, // it breaks the ground
        {go: 'move', fn: t => { rise(Math.min(H, 2 + Math.round(t / 9))); return h >= H }, pose: {squash: 2, eyes: 'strain'}}, // and up he goes
        {go: 'hold', T: 140, pose: {squash: 1, eyes: 'strain'}},
        {go: 'hold', T: 460, pose: {sword: 'raise', stretch: 1, eyes: 'happy'}}, // on top of it, sword high
        {go: 'do', fn: shatter},
        {go: 'move', fn: t => { const fy = Math.min(y, y - H * a + .0025 * s * t * t); hangabout.putFeet(x, fy); return fy >= y }, pose: {tuck: 1, eyes: 'up'}},
        {go: 'hold', T: 140, pose: {squash: 2}}, {go: 'hold', T: 140, pose: {squash: 1}}, {go: 'hold', T: 200, pose: {}},
      ]
    },
    end: clear,
  })

  // Ice Bolt, his magic projectile: he gathers cold round his free gauntlet, thrusts it and fires a pointed bolt of ice
  // that flies off across the screen and shatters at its edge. A trip that stays put; the bolt is a page element.
  const BOLT = ['.....LW...', '..BBBLWWW.', 'OBBLLLWWWW', '..BBBLWWW.', '.....LW...']
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
        {go: 'move', fn: t => shot.fly(t), pose: t => ({face: dir, hand: 6, reach: 6, ox: t < 200 ? dir : 0, eyes: 'side', look: dir, iceBolt: {star: t < 110}})}, // thrust: arm straight out, leaning in
        {go: 'hold', T: 400, pose: {face: dir, eyes: 'happy'}},
        {go: 'hold', T: 200, pose: {}},
      ]
    },
    end: clear,
    front({ctx, d, pose, now}){
      facing(ctx, pose, () => { // the cold gathering into an orb in his front fist, flickering; a flash as the bolt leaves it
        const y = 27 + (pose.squash || 0), hot = Math.floor(now / 80) % 2 ? ICE.W : ICE.L
        if (d.charge === 1) paint(ctx, ['.B.', 'BWB', '.B.'], 5, y - 1, {...ICE, W: hot})
        if (d.charge === 2) paint(ctx, ['.LBL.', 'LBWBL', 'BWWWB', 'LBWBL', '.LBL.'], 3, y - 2, {...ICE, W: hot})
        if (d.star) paint(ctx, STAR, -5, y - 4, ICE) // ahead of his fist, thrust out
      })
    },
  })

  // Ice Shards, his splash magic: he raises his sword and shards of ice rain down all round him, shattering on the ground.
  const SHARD = ['OOOOO', 'OWLBO', 'OWLBO', '.OLO.', '.OLO.', '..O..'] // an icicle, point down
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
        if (u > 0 && u < 1) paint(ctx, SHARD, x - 1, Math.round(-6 + u * 39), ICE) // from above his canvas to the ground
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
      [{sword: 'down', squash: 2, eyes: 'strain', shake: 1, swordCombo: {dust: .2, star: 1}}, 130], // slam
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
        if (d.star) paint(ctx, STAR, -2, 32, {W: '#FFFFFF', L: '#FFD84D'}) // a flash at its tip as it hits
      })
    },
    behind({ctx, d, pose}){ // under the sword: dust kicked up past its tip, two puffs billowing out and fading
      if (d.dust) facing(ctx, pose, () => {
        ctx.globalAlpha = 1 - d.dust * .7
        for (const [cx, r, c] of [[-4, 3, '#BDB6A8'], [-10, 2, '#9E978A']]) {
          const R = r + d.dust * 2, x0 = cx - Math.round(d.dust * 2)
          ctx.fillStyle = c
          for (let y = -Math.ceil(R); y <= 0; y++) { const w = Math.round(Math.sqrt(Math.max(0, R * R - y * y))); ctx.fillRect(x0 - w, 38 + y, 2 * w + 1, 1) }
        }
        ctx.globalAlpha = 1
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
        {go: 'hold', T: 500, pose: {...down, hand: 7, eyes: 'happy', arms: dir > 0 ? ['high', 'mid'] : ['mid', 'high'], bowShot: {pull: 0}}}, // a hit! his other fist up
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
      [{stretch: 1, beefy: 1, sword: 'dropped', arms: ['up', 'up'], eyes: 'angry', shake: 1, sandwich: {beefy: 1}}, 560], // Beefy! a flex, fists up, elbows out
      [{squash: 1, beefy: 1, sword: 'dropped', arms: ['high', 'high'], eyes: 'happy', sandwich: {beefy: .7}}, 300],
      [{beefy: 1, sword: 'dropped', arms: ['up', 'up'], eyes: 'happy', sandwich: {beefy: .4}}, 260],
      [{sword: 'poof', eyes: 'happy'}, 220], [{}, 200],
    ],
    front({ctx, d, pose, now}){
      facing(ctx, pose, () => {
        const cols = 8 - 3 * (d.bites || 0), cut = d.mouth ? 0 : 8 - cols // bitten from the end at his mouth; what's left stays in his fist
        if (cols > 0 && !d.beefy) { const [x, y] = d.mouth ? [12, 22] : [1, 22]; paint(ctx, SANDWICH.map(r => r.slice(cut, cut + cols)), x + cut, y + (pose.dy || 0), FILLING) }
        if (d.mouth) for (const [x, y] of [[16, 29], [18, 31]]) dot(ctx, x, y, FILLING.b) // crumbs
      })
      if (d.beefy) sparkles(ctx, now, d.beefy)
    },
    glow: d => d.beefy ? ` drop-shadow(0 0 ${2 + 3 * d.beefy}px rgba(255,216,77,${.9 * d.beefy}))` : '',
  })
}
