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
  const COLORS = ['#0A8FD6', '#8FF0E8', '#06679E', '#05060F'] // BODY, TOP (his pale grin, belly and spots), SIDE (the side of him turned away), EYE
  const TOE = '#0988CC', TONGUE = '#FF6B9A' // TOE: a teal used nowhere else on him, so tricks find a lifted front foot by it
  const INK = {B: COLORS[0], L: COLORS[1], S: COLORS[2], P: TOE, T: TONGUE}
  const X0 = 5 // the front of his face, as drawn facing left
  const EYE_AT = [[3, 9], [11, 9]] // each eye's top-left [col, row]: front, back
  // His feet, from under his belly to the floor: [left col, art], P his toes on the floor. A lizard's splayed foot, two toes
  // down and one up. 0 and 1 are his front feet, 3 his hind foot; his other hind foot is hidden behind him.
  const FEET = {0: [1, ['..BBB.', 'BBBBBB', '.PP.PP']], 1: [10, ['.BBB..', 'BBBBBB', '.PP.PP']], 3: [21, ['.BBBB..', 'BBBBBBB', 'PP.PP..']]}
  // His front foot off the ground, in place of foot 0: [left col, top row, art], from his shoulder under his chin. Held out
  // low in front (a hand; a jab reaches further), up by his chin, high beside his head. It keeps a pixel clear of his face:
  // with no outline, they would run together.
  const ARM = ['.BB........', '.BBB.......', '..BBB......', '...BBB.....', '....BBBBBBB'] // wrist down to shoulder
  const PAW = {
    1: [-3, 15, ['PBB.......', '.BBBBBBBBB', 'PBBBBBBBB.']],
    2: [-4, 12, ['P.P........', ...ARM.slice(1)]],
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
  const settled = pose => pose.tuck && !(pose.dy < 0) ? 3 : 0 // feet tucked on the ground, he lies on his belly (in the air he doesn't)
  console.assert(ROWS.every(r => r.length === 33), 'Iggy: every row is 33 wide')

  // How he moves his own way (see "Skins" in TRICKS.md): his tongue flicks, his tail twitches and he does a lizard's
  // push-ups while he waits, and he lies flat on his belly to nap or to sulk when he's stuck.
  const IDLE = [[{}, 3200], [{eyes: 'blink'}, 130], [{}, 1800], [{tail: 1}, 160], [{}, 120], [{tail: 1}, 160], [{}, 1600],
    [{tongue: 1}, 130], [{}, 90], [{tongue: 1}, 130], [{}, 2200], [{eyes: 'blink'}, 120], [{}, 1400],
    [{stretch: 1}, 140], [{}, 140], [{stretch: 1}, 140], [{}, 140]]
  const NAP = [[{tuck: 1, eyes: 'blink'}, 2000], [{tuck: 1, squash: 1, eyes: 'blink'}, 2800]] // flat out, breathing in, and slowly out
  const SLUMP = [[{tuck: 1, eyes: 'sad'}, 5000], [{tuck: 1, squash: 1, eyes: 'blink'}, 750], [{tuck: 1, eyes: 'blink'}, 200]] // flat, glum, a long sigh now and then

  SKINS.iggy = {
    name: 'Iggy', colors: COLORS, sideOn: true,
    moods: { // he crouches before he lies down, rather than dropping flat in one frame
      idle: {intro: IDLE, rest: IDLE},
      nap: {intro: [[{squash: 1, eyes: 'blink'}, 300], ...NAP], loops: 1, rest: NAP},
      blocked: {intro: [[{squash: 1, eyes: 'sad'}, 120], ...SLUMP], rest: SLUMP},
    },
    /** Where costumes find his face, as drawn facing left: his front eye (x, y: its top-left), the top of his head between the bumps, and the front of his face. */
    head(pose){
      const top = 39 - ROWS.length - 2 + (pose.squash || 0) - (pose.stretch || 0) + (pose.dy || 0) + settled(pose) // as draw() works it out
      return {x: X0 + EYE_AT[0][0], y: top + EYE_AT[0][1], top: top + 6, nose: X0}
    },
    /**
     * Iggy in a pose: shorter through his chin and belly when squashed, taller on his legs when stretched, feet planted,
     * stepping forward or tucked under him, his front foot up instead of a hand, then his eyes. His own keys: `tail` (its
     * tip flicked), `tongue` (flicked out) and `push` (the feet pushing back a column as he walks).
     */
    draw(pose, eyeColor){
      const kind = pose.eyes || 'open', sq = pose.squash || 0, st = pose.stretch || 0
      const rows = ROWS.slice(); if (pose.tail) rows.splice(0, FLICK.length, ...FLICK)
      for (const [x, y, ch] of MOUTH[kind] || []) rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1)
      rows.splice(14, sq)
      if (settled(pose)) rows[rows.length - 1] = [...rows.at(-1)].map((ch, i) => SPLAY[i] === '.' ? ch : SPLAY[i]).join('')
      const arms = pose.arms || [], paw = pose.hand <= 4 ? 2 : pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : arms.includes('up') ? 2 : 0
      const dy = (pose.dy || 0) + settled(pose), top = 39 - rows.length - 2 - st + dy, px = new Map() // his toes are on row 39
      const put = (x, y, c) => px.set(x + ',' + y, [x, y, c]) // a later pixel covers an earlier one
      const art = (x0, y0, a) => a.forEach((r, j) => [...r].forEach((ch, i) => { if (INK[ch]) put(X0 + x0 + i, y0 + j, INK[ch]) }))
      art(0, top, rows)
      for (const [n, [x, foot]] of Object.entries(FEET)) {
        if (+n === 0 && paw) continue
        if (pose.tuck) { if (!settled(pose)) art(x, top + rows.length, [foot[1]]); continue } // drawn up under his belly as he hops (on the floor, SPLAY)
        const step = pose.lift?.includes(+n), up = step || pose.tapLeg === +n // a step goes forward as it lifts; a tap doesn't
        art(x - (step ? 1 : 0) + (pose.push?.includes(+n) ? 1 : 0), top + rows.length - (up ? 1 : 0), [...Array(st)].map(() => foot[0]).concat(foot))
      }
      if (paw) {
        const r = paw === 1 ? Math.min(2, pose.reach || 0) : 0, [x0, y0, a] = PAW[paw] // a jab reaches r further
        const out = paw > 1 && sq ? 1 : 0 // squashed, his face drops onto a foot raised beside it: it moves a pixel further out
        art(x0 - r - out, top + y0 - sq, r ? a.map((row, j) => row.slice(0, 3) + (j ? 'B' : '.').repeat(r) + row.slice(3)) : a)
      }
      if (pose.tongue) for (const [x, y] of FORK) put(X0 + x, top + y, TONGUE)
      const right = pose.face > 0
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      EYE_AT.forEach(([ex, ey], back) => {
        const pts = EYES[kind] || [[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => [x + (right ? -lx : lx), y + ly])
        for (const [x, y] of pts) put(X0 + ex + (back && EYES[kind] ? 1 - x : x), top + ey + y, eyeColor)
      })
      const out = [...px.values()].map(([x, y, c]) => [right ? GW - 1 - x : x, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
    /** His walk: quick diagonal steps, his far front foot and hind foot together, then his near front foot, each pushing back after it lands, the tip of his tail twitching. */
    walk(now, dir, arms){
      const i = Math.floor(now / 100) % 4
      return {face: dir, lift: i === 0 ? [0, 3] : i === 2 ? [1] : [], push: i === 1 ? [1] : i === 3 ? [0, 3] : [], tail: i < 2 ? 1 : 0, lookX: dir, ...(arms && {arms})}
    },
  }
}
