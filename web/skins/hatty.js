// Hatty Hattington: fan art of Hatty Hattington from BattleBlock Theater, a game by The Behemoth. Fan-made and
// unofficial, not affiliated with or endorsed by The Behemoth. Drawn front on from a pixel-art portrait of him, at about
// four fifths its size so his top hat stays in the grid when he hops.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). His hat, head and suit are rows of art from x 11; his legs,
// hands, cane, eyes, tears and mouth are added per pose. # is his outline, s the shaded side of his head and its lit edges.
{
  const HEAD = [ // rows 7 to 30: his top hat (g its felt, b its band, y the buckle), then his head
    '...##############',
    '...##ggggggg#####',
    '...##ggggggg#####',
    '....##ggggg#####',
    '....##ggggg#####',
    '....############',
    '....##wyyyyb####',
    '.....#y##yyb#b#',
    '.....#y#byyb#b#',
    '.....##########',
    '....##ggggg#####',
    '..###############',
    '..#wwwwwwwwwww#ss##',
    '..swwwwwwwwwww#sss#',
    '..swwwwwwwwwww#sss#',
    '..swwwwwwwwwww#sss#',
    '..swwwwwwwwwwwssss#',
    '..swwwwwwwwwwwssss#',
    '..#wwwwwwwwwwwssss#',
    '..#wwwwwwwwwww#sss#',
    '..#wwwwwwwwwww#sss#',
    '..#wwwwwwwwwww#sss#',
    '..#wwwwwwwwwww#sss#',
    '..#################',
  ]
  const SUIT = [ // rows 31 to 36: c his collar, m his tie, b his jacket with its lapels, sleeves and flaps, g his trousers
    '....##c#mm##c####',
    '...#bb#cmmmc##bb#',
    '...#bbb#cmc##bbb#',
    '...#b#bb#c##bbbb#',
    '...#b#bbb#bbbb#b#',
    '...###bb#g#bbb###',
  ]
  const HAND = ['..s', '.sw', '#w#', '.##'] // his free hand hanging at his side: rows 35 to 38 from x 11
  const CANE_HAND = ['##s', 'swws', 's#ws', '####'] // his arm and his other hand on top of his cane: rows 32 to 35 from x 28
  const FOLDED = ['.##############', '#bbbbbbbbbbbbsw', '#bbbbbbbbbbbbww', '.##############'] // his free arm across him to his cane, under his tie: rows 33 to 36 from x 13
  const COLORS = ['#FFFFFF', '#F4F4F8', '#A6A6BD', '#141414'] // BODY (his head and hands), TOP (his collar), SIDE, EYE
  const LINE = '#000000', CANE = '#000000'
  const INK = {'#': LINE, w: COLORS[0], c: COLORS[1], s: COLORS[2], g: '#4E4E4E', y: '#FCF054', b: '#915544', m: '#9B225D'}
  const TEAR = '#4BA2CE', MOUTH = COLORS[2]
  const M = 42 // a mirrored x is M - x: he turns about the middle of his head (x 13 to 29)
  // His eyes in each expression, as dots around the top-left of his screen-left eye (the other eye is its mirror image).
  const EYES = {
    blink: [[0, 1], [1, 1]], happy: [[-1, 1], [0, 0], [1, 0], [2, 1]], // narrowed under a brow, sad rising to the middle, angry falling to it:
    sad: [[0, 1], [1, 1], [-1, 0], [0, -1], [1, -1]], angry: [[0, 1], [1, 1], [-1, -1], [0, -1], [1, 0]],
    strain: [[0, -1], [1, 0], [0, 1]], dizzy: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  }
  const HAT = HEAD.slice(0, 11), FACE = HEAD.slice(11), BRIM = ['....############'] // the underside of his brim, under it when it's off his head
  // His free hand up in front of his face: its top-left and the sleeve that reaches it from his shoulder.
  const TOUCH = {eye: [14, 27, [[14, 31], [14, 30], [14, 29]]], mouth: [17, 27, [[14, 31], [15, 30], [16, 29]]], chin: [17, 29, [[14, 31], [15, 31], [16, 31]]]}
  console.assert(HEAD.length === 24 && SUIT.length === 6, 'Hatty: his head is rows 7 to 30, his suit 31 to 36')

  // His own moves, for his short legs, big hat and cane. A step of his stroll (also his walk):
  const stride = i => ({lift: [[0], [], [2], []][i], stretch: i % 2, cane: [1, 0, -1, 0][i], swing: i < 2 ? -1 : 1, tilt: [-1.5, 0, 1.5, 0][i]})
  const STEP = i => [{...stride(i % 4), glide: 45}, 160]
  // Tipping his hat: lifted off by the brim, a little bow, put back on.
  const tip = (more = {}) => [
    [{hatHand: 1, ...more}, 140], [{hatHand: 1, hat: 2, hatX: -1, ...more}, 120],
    [{hatHand: 1, hat: 4, hatX: -3, eyes: 'happy', ...more}, 200],
    [{hatHand: 1, hat: 4, hatX: -3, eyes: 'happy', squash: 1, ...more}, 380], // the bow
    [{hatHand: 1, hat: 4, hatX: -3, eyes: 'happy', ...more}, 160],
    [{hatHand: 1, hat: 2, hatX: -1, ...more}, 120], [{hatHand: 1, ...more}, 140],
  ]
  const MOVES = { // his frames for tricks, in place of the shared frames, which are made for a small four-legged body
    wave: [...tip(), [{}, 200]], // hello, with a tip of his hat
    scratch: [...[...Array(4)].flatMap(() => [[{hatHand: 1, hatX: -1, eyes: 'up'}, 170], [{hatHand: 1, eyes: 'up', lookX: 1}, 170]]), [{}, 200]], // no scratching under a top hat: he straightens its brim
    hop: [[{squash: 2}, 110], [{dy: -4, stretch: 1, tuck: 1, hatHand: 1}, 150], [{dy: -6, tuck: 1, hatHand: 1, hat: 1}, 150], [{dy: -2, hatHand: 1}, 110], [{squash: 2, hatHand: 1}, 130], [{}, 220]], // holding his hat on
    yawn: [[{squash: 1, eyes: 'blink'}, 260], [{stretch: 1, eyes: 'blink', touch: 'mouth'}, 950], [{squash: 1, eyes: 'blink'}, 200], [{}, 250]], // a hand politely over his mouth
    ledgeSit: [ // his legs dangle over the edge one at a time
      [{sink: 6}, 120], [{sink: 12, arms: ['down', 'down']}, 300],
      ...[...Array(8)].map((_, i) => [{sink: 12, arms: ['down', 'down'], lift: i % 2 ? [0] : [2], eyes: i === 5 ? 'blink' : 'open'}, 380]),
      [{sink: 6}, 120], [{}, 200],
    ],
    dance: [ // a soft-shoe: side steps tapping his cane ahead, kicks with the cane flourished up, a hop, a tip of the hat
      ...[-1, 1, -1, 1].flatMap(face => [
        [{face, lift: [0], cane: 1, swing: 1, tilt: face * 2, notes: 1}, 190],
        [{face, stretch: 1, lift: [2], arms: ['mid', 'up'], swing: -1, tilt: -face * 2, notes: 1}, 190],
      ]),
      [{squash: 2, notes: 1}, 120], [{dy: -5, tuck: 1, arms: ['high', 'high'], eyes: 'happy', notes: 1}, 200],
      [{squash: 2, eyes: 'happy', notes: 1}, 140], ...tip({notes: 1}), [{}, 200],
    ],
    sneeze: [ // a hand to his face for the ah... ahh... AHH, then the CHOO blows his hat clean off his head, and it drops back on
      [{eyes: 'up', tilt: -3}, 300],
      [{eyes: 'blink', stretch: 1, dy: -1, tilt: -6, touch: 'mouth'}, 360],
      ...[-10, -9, -11, -9].map(tilt => [{eyes: 'strain', stretch: 2, dy: -2, touch: 'mouth', tilt}, 150]),
      [{eyes: 'up', stretch: 1, dy: -1, tilt: -4}, 400],
      [{squash: 1, eyes: 'blink'}, 180], [{eyes: 'happy'}, 550],
      [{face: 1, squash: 2, dy: -1, tilt: 12, arms: ['down', 'down'], eyes: 'strain', shake: 1, sneeze: 0, hat: 6}, 200],
      [{face: 1, squash: 1, tilt: 5, eyes: 'blink', sneeze: 1, hat: 4}, 180],
      [{eyes: 'blink', hat: 2}, 110], [{eyes: 'blink', squash: 1}, 130],
      [{eyes: 'side', look: -1}, 400], [{eyes: 'side', look: 1}, 400], [{}, 200],
    ],
    trip: [ // his hat flies off ahead of him as he falls, and he grabs it and plops it back on when he's up
      STEP(0), STEP(1),
      [{lift: [2], arms: ['high', 'high'], eyes: 'up', tilt: 14, glide: 70, hat: 1}, 110],
      [{tuck: 1, arms: ['high', 'high'], eyes: 'strain', tilt: 40, glide: 80, hat: 3}, 90],
      [{tuck: 1, arms: ['up', 'up'], eyes: 'strain', tilt: 70, glide: 70, hat: 5}, 70],
      [{tilt: 0, trip: 0, glide: 40, hat: 6}, 100],
      [{tilt: 0, trip: 1, glide: 20, hat: 6}, 160],
      [{tilt: 0, trip: 2, glide: 1, hat: 6}, 800],
      [{dy: -4, stretch: 1, tuck: 1, hatHand: 1, hat: 3, eyes: 'up'}, 130],
      [{squash: 2, hatHand: 1, hat: 1}, 130], [{hatHand: 1}, 120],
      [{eyes: 'side', look: -1}, 420], [{eyes: 'side', look: 1}, 420],
      ...[0, 1, 2, 3].map(STEP), [{}, 200],
    ],
  }
  // His own poses for Claude's states: he taps his cane and dabs his tears while idle, thinks with a hand to his chin,
  // tips his hat when it's done, sobs on his cane when it's blocked, and naps with his hat pulled over his eyes.
  const TAP = [[{caneUp: 1}, 110], [{}, 130], [{caneUp: 1}, 110], [{}, 130]]
  const DAB = [[{touch: 'eye', eyes: 'blink'}, 600], [{eyes: 'blink'}, 140]]
  const IDLE = [[{}, 3000], [{eyes: 'blink'}, 130], [{}, 1500], ...TAP, [{}, 1800], [{eyes: 'blink'}, 120], [{}, 180], [{eyes: 'blink'}, 120], [{}, 1500], ...DAB, [{}, 1200], [{squash: 1}, 520]]
  const CHIN = {touch: 'chin'}
  const sweep = [[-1, 180], [0, 240], [1, 160], [1, 300]].map(([dx, ms], i) => [{...CHIN, dx, caneUp: i % 2}, ms]), snap = [{...CHIN, dx: -1}, 90]
  const SOB = [ // leaning on his cane, sobbing: his shoulders heave, a tear drips off his chin, he dabs an eye
    ...[0, 1, 2, 3].map(k => [{squash: 2 - k % 2, eyes: k === 2 ? 'blink' : 'sad', tilt: 3, drip: k}, 260]),
    [{squash: 2, eyes: 'sad', tilt: 3, touch: 'eye'}, 900], [{squash: 2, eyes: 'sad', tilt: 3}, 1600],
  ]
  const NAP = [[{eyes: 'blink', hat: -5, tilt: 2}, 2400], [{eyes: 'blink', hat: -5, tilt: 2, squash: 1}, 2400]]
  const STATES = {
    idle: {intro: IDLE, loops: Infinity, rest: IDLE},
    thinking: {intro: [...sweep, snap, ...sweep, snap, [{...CHIN, eyes: 'blink'}, 120], [CHIN, 400]], loops: 3, rest: [[CHIN, 2600], ...sweep, snap, [{...CHIN, eyes: 'blink'}, 120]]},
    done: {intro: [[{squash: 2, eyes: 'happy'}, 110], [{dy: -3, stretch: 1, tuck: 1, hatHand: 1, hat: 1, eyes: 'happy'}, 150], [{squash: 1, hatHand: 1, eyes: 'happy'}, 120], ...tip({eyes: 'happy'}), [{eyes: 'happy'}, 600]], loops: 1, rest: IDLE},
    blocked: {intro: SOB, loops: 1, rest: SOB},
    nap: {intro: NAP, loops: Infinity, rest: NAP},
  }

  SKINS.hatty = {
    name: 'Hatty', label: 'Hatty Hattington (fan art)', colors: COLORS, pack: 'fan',
    mirror: M, // turned right he's mirrored, x to M - x: facing() turns a costume drawn on him the same way
    /** Where costumes find his face, as drawn facing you or to his left: his screen-left eye (x, y: its top-left pixel) and the top of his head, just under his hat (the 11 rows above it). */
    head(pose){
      const sq = pose.squash || 0, st = pose.stretch || 0, y0 = Math.max(pose.dy || 0, st - sq - 7) + sq - st // as draw() works it out
      return {x: pose.face && !pose.half ? 14 : 15, y: 25 + y0, top: 18 + y0}
    },
    /** His walk: a gentleman's stroll. Short steps for his short legs, the cane swinging ahead to plant on every other
     * step and trailing as he passes it, his heavy head and hat rising over each straight leg (his feet stay down), and
     * hardly any sway. */
    walk(now, dir, arms){ return {face: dir, ...stride(Math.floor(now / 160) % 4), arms: arms || ['mid', 'mid'], lookX: 1} },
    tricks: MOVES, moods: STATES,
    /** Hatty in a pose: his legs bend, step and tuck, his free arm waves and reaches, his cane hand raises it, then his face. */
    draw(pose, eyeColor){
      const sq = pose.squash || 0, st = pose.stretch || 0
      const dy = Math.max(pose.dy || 0, st - sq - 7) // however high he hops, his hat (row 7 standing) stays in the grid
      const y0 = dy + sq - st // his hat, head and suit sink as he crouches and rise as he stretches; his legs take it up
      const g = new Map(), has = (x, y) => g.has(x + ',' + y), put = (x, y, c) => g.set(x + ',' + y, c)
      const art = (rows, x, y, under) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (INK[ch] && !(under && has(x + i, y + j))) put(x + i, y + j, INK[ch]) }))
      const outline = pts => { for (const [x, y] of pts) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!has(x + ax, y + ay)) put(x + ax, y + ay, LINE) }

      // His head, with tears down from his eyes and the line of his mouth across them (turned, they slide the way he faces),
      // then his hat: on his head, lifted off it (hat: rows up), pulled down over his brow (hat < 0) or held aside (hatX).
      const f = pose.face && !pose.half ? -1 : 0, tl = 15 + f, tr = 22 + f
      const hat = Math.min(pose.hat || 0, 7 + y0), hatX = pose.hatX || 0
      art(FACE, 11, 18 + y0)
      for (const x of [tl, tl + 1, tr, tr + 1]) { put(x, 27 + y0, TEAR); put(x, 29 + y0, TEAR) }
      for (let x = 14; x <= 24; x++) put(x, 28 + y0, x > tl + 1 && x < tr ? MOUTH : LINE)
      art(HAT, 11 + hatX, 7 + y0 - hat)
      if (hat) art(BRIM, 11 + hatX, 18 + y0 - hat)
      art(SUIT, 11, 31 + y0)
      if (pose.drip != null) for (const x of [tl, tr + 1]) put(x, 31 + y0 + pose.drip, TEAR) // a tear dripping off his chin

      // His legs, under his jacket down to the ground: the seat of his trousers, then each leg to its shoe. Of a stride's
      // pairs, 0 lifts his left leg and 2 his right.
      const top = 37 + y0, ground = 39 + dy, lift = pose.lift || [], seat = !pose.tuck && ground > top
      const up = [lift.includes(0) || [0, 1].includes(pose.tapLeg), lift.includes(2) || [2, 3].includes(pose.tapLeg)]
      if (seat) { art(['###ggg###'], 16, top); if (ground > top + 1) put(20, top + 1, LINE) }
      for (const i of [0, 1]) {
        const bottom = pose.tuck ? top : Math.max(top + (seat ? 1 : 0), ground - (up[i] ? 1 : 0))
        const leg = (r, x, y) => art([r], i ? 41 - x - r.length : x, y) // his right leg mirrors his left about x 20
        for (let y = top + (seat ? 1 : 0); y < bottom; y++) leg('#gg#', 16, y)
        leg(i ? '#gg##' : '##gg#', 15, bottom)
      }

      // His free arm (his left, on your left as you face him): hanging, up beside his head (high: out above it), held out
      // in front of him when he turns (hand: its height, reach: how far out), at his hat's brim (hatHand), or up in front of
      // his face (touch: eye, mouth or chin), which is drawn last, over his eyes.
      const arms = pose.arms || [], swing = pose.face ? pose.swing || 0 : 0, front = []
      const hand = (hx, hy) => [[hx, hy, INK.s], [hx + 1, hy, INK.w], [hx, hy + 1, INK.w], [hx + 1, hy + 1, INK.w]]
      const raise = (hy, hx, side) => { // an arm from his shoulder to a hand whose top-left is (hx, hy), drawn on your left; side 1 mirrors it
        const [tx, ty] = hy >= 29 ? [hx + 2, hy + 1] : [hx + 1, hy + 2], pts = [[14, 31], [13, 31]]
        const to = (gx, gy) => { let [x, y] = pts.at(-1); while (x !== gx || y !== gy) { x += Math.sign(gx - x); y += Math.sign(gy - y); pts.push([x, y]) } }
        if (ty < 30) { pts.push([12, 30], [11, 29]); to(Math.min(tx, 11), ty) } // up the outside of his head
        to(tx, ty)
        const at = ([x, y, c]) => [side ? M - x : x, y + y0, c]
        const limb = [...pts.map(([x, y]) => at([x, y, INK.b])).filter(([x, y]) => !has(x, y)), ...hand(hx, hy).map(at)]
        for (const [x, y, c] of limb) put(x, y, c)
        outline(limb)
        return at([hx, hy])
      }
      const level = {up: [26, 10], high: [20, 9]}
      if (pose.hand != null || pose.reach) raise(Math.max(18, Math.min(32, 20 + (pose.hand ?? 8))), 10 - (pose.reach || 0) - swing, 0)
      else if (TOUCH[pose.touch]) {
        const [hx, hy, sleeve] = TOUCH[pose.touch], limb = new Map([...sleeve.map(([x, y]) => [x, y, INK.b]), ...hand(hx, hy)].map(([x, y, c]) => [x + ',' + (y + y0), c]))
        for (const k of limb.keys()) { const [x, y] = k.split(',').map(Number); for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!limb.has(x + ax + ',' + (y + ay))) front.push([x + ax, y + ay, LINE]) }
        for (const [k, c] of limb) front.push([...k.split(',').map(Number), c])
      }
      else if (pose.hatHand) raise(16 - hat, 12 + hatX, 0)
      else if (level[arms[0]]) raise(...level[arms[0]], 0)
      else if (arms[0] === 'cross') art(FOLDED, 13, 33 + y0)
      else art(HAND, 11 - swing, 35 + Math.min(y0, dy + 1), true) // hanging, never below the ground

      // His other hand rests on his cane, or raises it up beside his head.
      if (level[arms[1]]) { const [x, y] = raise(...level[arms[1]], 1); for (let j = 1; j <= 5; j++) { put(x, y - j, CANE); put(x - 1, y - j, CANE) } }
      else { // cane: 1 swings its tip ahead of him to plant it, -1 trails it behind, just off the ground; caneUp lifts it to tap
        const c = pose.cane || 0, u = pose.caneUp || 0
        art(CANE_HAND, 28, 32 + y0 - u)
        for (let y = 36 + y0 - u, k = 0; y <= ground - u - (c < 0 ? 1 : 0); y++, k++) { const x = 29 - c * (k + 1 >> 1); put(x, y, CANE); put(x + 1, y, CANE) }
      }

      // Turned to his left he's drawn as is; to his right, mirrored. Then his eyes, in screen directions.
      const out = [...g].map(([k, c]) => { const [x, y] = k.split(',').map(Number); return [pose.face > 0 ? M - x : x, y, c] })
      const kind = pose.eyes || 'open', ey = 25 + y0
      // As on Clawd, look is a screen direction, while dx and lookX look ahead once he's turned (1: the way he faces).
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : (pose.dx ?? pose.lookX ?? 0) * (pose.face || 1))), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      const xs = pose.face > 0 ? [M - 1 - tr, M - 1 - tl] : [tl, tr] // each eye's left pixel, screen left first
      const [lo, hi] = pose.face > 0 ? [M - 24, M - 14] : [14, 24] // the white of his face
      const shape = EYES[kind] || [[lx, ly], [lx + 1, ly], [lx, ly + 1], [lx + 1, ly + 1]]
      for (const [n, ex] of xs.entries()) for (const [x, y] of shape) out.push([Math.max(lo, Math.min(hi, ex + (n && EYES[kind] ? 1 - x : x))), ey + y, eyeColor])
      for (const [x, y, c] of front) out.push([pose.face > 0 ? M - x : x, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
  console.assert(SKINS.hatty.draw({dy: -8, stretch: 2, arms: ['high', 'high']}, '#000000').every(([, y]) => y >= 0), 'Hatty: his hat stays in the grid on his highest hop')
}
