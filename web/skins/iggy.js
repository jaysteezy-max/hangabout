// Iggy: a teal-blue lizard, the owner's own character, drawn from his sketch: Clawd's flat colors and square eyes on a
// lizard side on, facing left (facing right is the mirror image), his face turned to you, his tail curled up over his back.
// Original art.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). Rows of his body; his legs, eyes and tongue are added per pose.
// L is his pale grin, throat, belly, the spots down his back and the underside of his tail. No outline, like Clawd.
{
  const ROWS = [
    '..........................BBBB...',
    '........................BBBBBBB..',
    '........................BBBLLBBB.',
    '...........................LLLBB.',
    '............................LLLBB',
    '....BBBB...BBBB..............BLBB', // the bumps over his eyes
    '...BBBBBBBBBBBBB............BBLBB',
    '.BBBBBBBBBBBBBBBB..........BBBLBB',
    '.BBBBBBBBBBBBBBBB..........BBLLB.',
    '.BBBBBBBBBBBBBBBBBBB......BBBLLB.', // his eyes, on this row and the next
    'BBBBBBBBBBBBBBBBBLLBBBBBBBBBLLB..',
    'BBBBBBBBBBBBBBBBBLLBLLBBBBLLLBB..',
    'BLLBBBBBBBBBBLLBBBBBLLBLLBLLLB...', // the corners of his grin
    '.LLLLLLLLLLLLLLBBBBBBBBLLBLLB....',
    '..LLLLLLLLLLLLBBBBBBBBBBBBLLB....',
    '....LLLLLLLLLBBBBBBBBBBBBLLB.....',
    '....BBBLLLLBBBBLLLLLLBBBLLB......', // his throat and belly, between the tops of his legs
    '...BBB..LLLBBBBLLLLLLBBBBB.......',
  ]
  const FLICK = ROWS.slice(0, 5).map(r => r.slice(1) + '.') // the tip of his tail flicked forward a pixel
  const DROOP = ROWS.slice(0, 6).map((r, j) => r.slice(0, 24) + (j ? ROWS[j - 1] : '').slice(24).padEnd(9, '.')) // its curl a row lower: lagging as he rises, settling as he lands
  // Face on, for the frame halfway through a turn (the page's `half`): his head square to you, the curl of his tail over
  // his shoulder, his front feet planted either side of his chest. Same rows as side on, so his eyes stay where they were.
  const FRONT = [
    ...ROWS.slice(0, 5).map(r => '............' + r.slice(24)),
    '...BBBB...BBBB...' + ROWS[5].slice(29), '..BBBBBBBBBBBBB..' + ROWS[6].slice(29), '.BBBBBBBBBBBBBBBB' + ROWS[7].slice(29),
    '.BBBBBBBBBBBBBBBBB' + ROWS[8].slice(30), 'BBBBBBBBBBBBBBBBBB...', 'BBBBBBBBBBBBBBBBB....', 'BBBBBBBBBBBBBBBBB....',
    'BLLBBBBBBBBBBBLLB....', '.LLLLLLLLLLLLLLL.....', '..LLLLLLLLLLLLL......', '....LLLLLLLLL........',
    '..BBBBLLLLLBBBB......', '..BBB.LLLLL.BBB......', '..BBB..LLL..BBB......', 'BBBBBB.....BBBBBB....', '.PP.PP.....PP.PP.....',
  ]
  const FRONT_EYES = [[3, 9], [12, 9]], FRONT_X = 13 // his eyes, and his head's left edge on the grid (centred)
  const COLORS = ['#0A8FD6', '#8FF0E8', '#06679E', '#05060F'] // BODY, TOP (his pale grin, belly and spots), SIDE (the side of him turned away), EYE
  const TOE = '#0988CC', TONGUE = '#FF6B9A' // TOE: a teal used nowhere else on him, so tricks find a lifted front foot by it
  const INK = {B: COLORS[0], L: COLORS[1], S: COLORS[2], P: TOE, T: TONGUE}
  const X0 = 5 // the front of his face, as drawn facing left
  const EYE_AT = [[3, 9], [11, 9]] // each eye's top-left [col, row]: front, back
  // His feet, from under his belly to the floor: [left col, art], P his toes on the floor. A lizard's splayed foot, two toes
  // down and one up. 0 and 1 are his front feet, 3 his hind foot; his other hind foot is hidden behind him.
  const FEET = {0: [1, ['..BBB.', 'BBBBBB', '.PP.PP']], 1: [10, ['.BBB..', 'BBBBBB', '.PP.PP']], 3: [21, ['.BBBB..', 'BBBBBBB', 'PP.PP..']]}
  // His front foot off the ground, in place of foot 0: [left col, top row, art], from his shoulder under his chin. Held out
  // low in front (a hand; a jab reaches further), up by his chin, high beside his head, and a breakdown between each
  // (`paw: 1.5`, `2.5`) so a raised foot travels on an arc instead of snapping. It keeps a pixel clear of his face: with
  // no outline, they would run together.
  const ARM = ['.BB........', '.BB........', '.BBB.......', '..BBB......', '...BBBBBBBB'] // wrist down to shoulder
  const PAW = {
    1: [-3, 15, ['PBB.......', '.BBBBBBBBB', 'PBBBBBBBB.']],
    1.5: [-4, 13, ['P..........', 'PBB........', '..BBB......', '....BBBBBBB']],
    2: [-4, 12, ['P.P........', 'BBB........', ...ARM.slice(2)]],
    2.5: [-4, 10, ['P.P........', 'BBB........', ...ARM]],
    3: [-4, 9, ['P.P........', 'BBB........', 'BBB........', ...ARM]],
  }
  // His eyes, 2 px squares, in each look, as the front eye is drawn (the back one is its mirror): [x, y] from its top-left.
  const EYES = {
    blink: [[0, 1], [1, 1]],
    happy: [[-1, 1], [0, 0], [1, 0], [2, 1]],
    sad: [[1, 0], [0, 1], [1, 1]], // up at the middle
    angry: [[-1, -1], [0, -1], [1, 0], [0, 1], [1, 1]], // a brow slanting down to the middle
    strain: [[0, -1], [1, 0], [0, 1]], // > <
    dizzy: [[0, -1], [2, -1], [1, 0], [0, 1], [2, 1]],
  }
  // His grin with each look, as [col, row, letter] over his rows: its corners turn down when he's sad, and flatten when he's cross or straining.
  const FLAT = [[1, 12, 'B'], [2, 12, 'B'], [13, 12, 'B'], [14, 12, 'B']]
  const MOUTH = {sad: [...FLAT, [1, 13, 'B'], [2, 13, 'B'], [13, 13, 'B'], [14, 13, 'B']], angry: FLAT, strain: FLAT}
  const SPLAY = '.BBBBBBB..BBBBBB.....BBBBBBB.....' // his feet splayed out flat beside him, over his last row, as he lies on his belly
  const FORK = [[0, 13], [-1, 13], [-2, 12], [-2, 14]] // his tongue flicked out of the front of his grin
  const lying = pose => pose.tuck && !(pose.dy < 0) // feet tucked on the ground, he lies on his belly (in the air he doesn't)
  /** His legs' rows under him: 3 standing, longer stretched, bent shorter as he crouches (his face never squashes), none lying flat. */
  const legRows = pose => lying(pose) ? 0 : 3 + (pose.stretch || 0) - Math.min(2, pose.squash || 0)
  /** His top row: lying flat, a squash is his belly letting a breath out (one row of it gone), never his face. */
  const topOf = pose => 40 - ROWS.length + (lying(pose) ? pose.squash || 0 : 0) - legRows(pose) + (pose.dy || 0)
  console.assert(ROWS.every(r => r.length === 33) && FRONT.every(r => r.length === 21), 'Iggy: every row is 33 wide (face on, 21)')

  // How he moves his own way (see "Skins" in TRICKS.md), designed as key poses and timed (the bible in the skill's notes):
  // anticipation before each big move, his tail lagging behind and settling after, his raised foot travelling on arcs.
  // While he waits his tongue flicks, his tail twitches and he does a lizard's push-ups; he lies flat on his belly to nap
  // or to sulk when he's stuck.
  const PUSHUPS = [[{squash: 1}, 80], [{stretch: 1}, 140], [{}, 60], [{squash: 1}, 80], [{stretch: 1}, 140], [{tail: 1}, 160]] // dip, up, twice; his tail tip follows through
  const IDLE = [[{}, 3200], [{eyes: 'blink'}, 130], [{}, 1800], [{tail: 1}, 160], [{}, 120], [{tail: 1}, 160], [{}, 1600],
    [{tongue: 1}, 80], [{}, 60], [{tongue: 1}, 80], [{}, 2200], [{eyes: 'blink'}, 120], [{}, 1400], ...PUSHUPS, [{}, 300]]
  const LIE = e => [[{squash: 1, eyes: e}, 120], [{squash: 2, eyes: e}, 120], [{tuck: 1, eyes: e}, 260]] // legs bend, he sinks, then his tail settles (LYING)
  const LYING = {tuck: 1, tail: 'low'} // lying on his belly, his tail settled low
  const NAP = [[{...LYING, eyes: 'blink'}, 2000], [{...LYING, squash: 1, eyes: 'blink'}, 2800]] // flat out, breathing in, and slowly out
  const SLUMP = [[{...LYING, eyes: 'sad'}, 5000], [{...LYING, squash: 1, eyes: 'blink'}, 750], [{...LYING, eyes: 'blink'}, 200]] // flat, glum, a long sigh now and then
  // A hop: crouch, push off with his tail dragging behind, tuck at the top, reach for the floor, land low with his tail
  // still coming down, then it flicks and settles. o: what else he does through it (a face, a raised foot).
  // p: his raised foot through each of the hop's seven beats (null: down).
  const HOP = (o = {}, p = []) => [[{squash: 1}, 50], [{squash: 2}, 110], [{stretch: 1, dy: -2, tail: 'low'}, 70], [{dy: -6, tuck: 1, tail: 'low'}, 140],
    [{dy: -2, stretch: 1}, 80], [{squash: 2, tail: 'low'}, 100], [{squash: 1, tail: 1}, 110], [{}, 160]].map(([f, ms], i) => [{...f, ...o, ...p[i] && {paw: p[i]}}, ms])
  const RAISE = [[{paw: 1.5, eyes: 'up'}, 70], [{paw: 2, eyes: 'up'}, 70], [{paw: 2.5, eyes: 'up'}, 70]] // his foot up on its arc
  const PUMP = e => [[{paw: 3, eyes: e}, 200], [{paw: 2.5, eyes: e}, 50], [{paw: 2, eyes: e}, 110], [{paw: 2.5, eyes: e}, 50]] // high down to his chin and back, through the breakdown
  const WAVE = [...RAISE, ...PUMP('up'), ...PUMP('up'), ...PUMP('up')]
  const ASK = [[{paw: 3, eyes: 'up'}, 1400], ...HOP({eyes: 'up'}, [3, 3, 3, 3, 3, 3, 3, 3])] // foot up, a hop for attention now and then
  const CHEER = [...HOP({eyes: 'happy'}, [null, null, 2, 3, 3, 2.5, 3, 2.5]), ...PUMP('happy'), [{paw: 3, eyes: 'happy'}, 200], // his foot comes up as he springs and pumps
    [{paw: 2.5, eyes: 'happy'}, 50], [{paw: 2, eyes: 'happy'}, 70], [{paw: 1.5, eyes: 'happy'}, 70], [{eyes: 'happy'}, 600]] // and comes down on its arc

  SKINS.iggy = {
    name: 'Iggy', colors: COLORS, sideOn: true,
    tricks: {hop: HOP()},
    moods: {
      idle: {intro: IDLE, rest: IDLE},
      nap: {intro: [...LIE('blink'), ...NAP], loops: 1, rest: NAP},
      blocked: {intro: [...LIE('sad'), ...SLUMP], rest: SLUMP},
      needs: {intro: WAVE, loops: 1, rest: ASK},
      done: {intro: CHEER, loops: 1, rest: IDLE},
    },
    /** Where costumes find his face, as drawn facing left: his front eye (x, y: its top-left), the top of his head between the bumps, and the front of his face. */
    head(pose){
      const top = topOf(pose)
      return {x: X0 + EYE_AT[0][0], y: top + EYE_AT[0][1], top: top + 6, nose: X0}
    },
    /**
     * Iggy in a pose: crouched on bent legs when squashed, taller on his legs when stretched, feet planted, stepping
     * forward or tucked under him, his front foot up instead of a hand, then his eyes; face on halfway through a turn. His
     * own keys: `tail` (1: its tip flicked; 'low': its curl lagging a row down), `tongue` (flicked out), `push` (feet
     * pushing back a column as he walks) and `paw` (his raised foot's position, breakdowns included).
     */
    draw(pose, eyeColor){
      const kind = pose.eyes || 'open', st = pose.stretch || 0, flat = lying(pose)
      const rows = (pose.half ? FRONT : ROWS).slice()
      if (!pose.half && pose.tail) rows.splice(0, 6, ...(pose.tail === 'low' ? DROOP : [...FLICK, rows[5]]))
      for (const [x, y, ch] of pose.half ? [] : MOUTH[kind] || []) rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1)
      if (flat && !pose.half) rows.splice(16, pose.squash || 0)
      if ((flat || pose.squash >= 2) && !pose.half) rows[rows.length - 1] = [...rows.at(-1)].map((ch, i) => SPLAY[i] === '.' ? ch : SPLAY[i]).join('') // lying or crouched right down, his feet splay beside him
      const arms = pose.arms || [], paw = pose.half ? 0 : pose.paw ?? (pose.hand <= 4 ? 2 : pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : arms.includes('up') ? 2 : 0)
      const top = pose.half ? 40 - FRONT.length + (pose.dy || 0) : topOf(pose), px = new Map() // his toes are on row 39
      const put = (x, y, c) => px.set(x + ',' + y, [x, y, c]) // a later pixel covers an earlier one
      const ox = pose.half ? FRONT_X - X0 : 0
      const art = (x0, y0, a) => a.forEach((r, j) => [...r].forEach((ch, i) => { if (INK[ch]) put(X0 + ox + x0 + i, y0 + j, INK[ch]) }))
      art(0, top, rows)
      if (!pose.half) for (const [n, [x, foot]] of Object.entries(FEET)) {
        if (+n === 0 && paw) continue
        if (pose.tuck) { if (!flat) art(x, top + rows.length, [foot[1]]); continue } // drawn up under his belly as he hops (on the floor, SPLAY)
        const step = pose.lift?.includes(+n), up = step || pose.tapLeg === +n // a step goes forward as it lifts; a tap doesn't
        const legs = [...Array(st)].map(() => foot[0]).concat(foot).slice(Math.min(2, pose.squash || 0)) // crouched, his legs fold up under him
        const at = x - (step ? 1 : 0) + (pose.push?.includes(+n) ? 1 : 0)
        art(at, top + rows.length - (up ? 1 : 0), legs)
      }
      if (paw) {
        const r = paw === 1 ? Math.min(2, pose.reach || 0) : 0, [x0, y0, a] = PAW[paw] // a jab reaches r further
        // As he crouches, a raised foot holds steady (and what it holds) while his body dips, a pixel further out to clear
        // his face; beside his face it gives one row of a deep crouch, or his elbow would close on his grin.
        const sq = flat ? 0 : Math.min(paw > 1 ? 1 : 2, pose.squash || 0), out = paw > 1 && sq ? 1 : 0
        art(x0 - r - out, top + y0 - sq, r ? a.map((row, j) => row.slice(0, 3) + (j ? 'B' : '.').repeat(r) + row.slice(3)) : a)
      }
      if (pose.tongue && !pose.half) for (const [x, y] of FORK) put(X0 + x, top + y, TONGUE)
      const right = pose.face > 0
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      ;(pose.half ? FRONT_EYES : EYE_AT).forEach(([ex, ey], back) => {
        const pts = EYES[kind] || [[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => [x + (right ? -lx : lx), y + ly])
        for (const [x, y] of pts) put(X0 + ox + ex + (back && EYES[kind] ? 1 - x : x), top + ey + y, eyeColor)
      })
      const out = [...px.values()].map(([x, y, c]) => [right ? GW - 1 - x : x, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
    /** His walk: quick diagonal steps, his far front foot and hind foot together, then his near front foot, each pushing back after it lands, the tip of his tail twitching. */
    walk(now, dir, arms){
      const i = Math.floor(now / 100) % 4
      return {face: dir, lift: i === 0 ? [0, 3] : i === 2 ? [1] : [], push: i === 1 ? [1] : i === 3 ? [0, 3] : [], squash: i === 3 ? 1 : 0, tail: i === 1 || i === 2 ? 1 : 0, lookX: dir, ...(arms && {arms})} // the tail tip a frame behind his feet
    },
  }
}
