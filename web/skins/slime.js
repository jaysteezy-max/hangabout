// Minecraft slime (fan art): the slime from Minecraft, by Mojang Studios / Microsoft. Fan-made and unofficial, not
// affiliated with or endorsed by Mojang or Microsoft. A jelly cube seen from its front corner, its face on the side it
// faces, facing left (facing right is the mirror image), after a cute fan piece ("Slime pixelart (OC)", r/Minecraft)
// checked against the game's own slime, redrawn at the pet's size.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). Rows of its body: # its outline and the shell's edges, T and
// B the clear shell over its top and sides, b and C the inner cube seen through them (as in the game: a darker core),
// W and H its glints. Its face and nubs are added per pose.
{
  const ROWS = [
    '.........#####.........',
    '.......##TTTTT##.......',
    '.....##TTWWbbbTT##.....',
    '...##TTWWWHbbbWWTT##...',
    '.##TTWWWHbbbbbbHbbTT##.',
    '#BB##TTbbbbbbbbbTT##BB#',
    '#BCBB##TTbbbbbTT##BBCB#',
    '#WCCCBB##TTTTT##BBCCCB#',
    '#WCCCCCBB#####BBCCCCCB#',
    '#HCCCCCCCBB#BBCCCCCWCB#',
    '#BCCCCCCCCB#BCCCCCWWCB#',
    '#BCCCCCCCCB#BCCCCCWWCB#',
    '#BCCCCCCCCB#BCCCCCCHCB#',
    '#BCCCCCCCCB#BCCCCCCCCB#',
    '#BCCCCCCCCB#BCCCCCCCCB#',
    '#BCCCCCCCCB#BCCCCCCCCB#',
    '#CCCCCCCCCB#BCCWCCCCCC#',
    '.###CCCCCCB#BCCCCCC###.',
    '....##CCCCB#BCCCC##....',
    '......##CCC#CCC##......',
    '........##C#C##........',
    '..........###..........',
  ]
  const COLORS = ['#9BE838', '#A4EC47', '#8DD832', '#1D1B1C'] // BODY, TOP (the shell over its top), SIDE (its core through its sides), EYE
  const LINE = '#6A9D23', BLUSH = '#EC9291', GLINT = '#FFFFFF'
  const INK = {B: COLORS[0], T: COLORS[1], b: COLORS[0], C: COLORS[2], '#': LINE, W: GLINT, H: '#DCF9B6'}
  const X0 = 10, SEAM = 11 // its left edge and its front edge (the seam between its sides), as drawn facing left
  const EYE_AT = [[3, 9], [7, 10]] // each eye's top-left [x, row], 2 wide and 4 tall: far (by its outer edge), near (by the seam)
  const MOUTH = [5, 14], CHEEKS = [[1, 14], [2, 14], [1, 15], [2, 15], [9, 15], [10, 15], [9, 16], [10, 16]] // a cheek below each eye, outside it; the mouth between
  // Its eyes in each look, as the far eye is drawn (the near eye is its mirror image): [x, y] from the eye's top-left.
  const OPEN = [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3]]
  const EYES = {
    blink: [[0, 2], [1, 2]], happy: [[-1, 2], [0, 1], [1, 2]],
    sad: [[1, 1], [0, 2], [1, 2], [0, 3], [1, 3]], angry: [[0, 1], [0, 2], [1, 2], [0, 3], [1, 3]],
    strain: [[0, 1], [1, 2], [0, 3]], dizzy: [[-1, 1], [1, 1], [0, 2], [-1, 3], [1, 3]], // these two reach out past the eye, away from the other
  }
  // Its nubs: a blob of slime bulging out of a side as a hand, as [left x, top row, art] from its outer edge on its face
  // side (x 0 is that edge, less is out past it); H is a glint, C its shaded underside. The second nub comes out of its other side, mirrored.
  // Up (a wave) and high (raised by its top corner); held out ahead, see goo().
  const NUB = {
    up: [-5, 6, ['.HB...', 'BBBBB.', 'CBBBB.', '.CBBBB', '..CBBB', '...CBB', '....CB']],
    high: [-3, 0, ['.HB..', 'BBBB.', 'CBBB.', '.CBB.', '..CBB', '...CB', '...C.']],
  }
  // Its mouth with each look, in place of the dot (from its far eye's side of the face): a smile, a frown, a grimace, an o.
  const MOUTHS = {
    yawn: [[5, 14], [6, 14], [5, 15], [6, 15], [5, 16], [6, 16]], // its own key, `mouth: 'yawn'`
    happy: [[4, 14], [5, 15], [6, 14]], sad: [[4, 15], [5, 14], [6, 15]], strain: [[4, 14], [5, 14], [6, 14]],
    angry: [[4, 14], [5, 14], [6, 14]], dizzy: [[5, 14], [6, 14], [5, 15], [6, 15]],
  }
  /** A nub held out ahead, n long, from row y: thick where it leaves its body, drooping to a round tip, like goo. */
  const goo = (n, y) => [1 - n, y, ['.'.repeat(n - 2) + 'BB', '.'.repeat(n - 4) + 'HBBB', 'B'.repeat(n), 'B'.repeat(n), '.' + 'C'.repeat(n - 1)]]
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  // Melted (`puddle` 1: a sagging mound, 2: a puddle): its cube gone soft, w wide and h tall, its face peeking out on
  // the side it faces. Eyes 2x2 here, from their top-left: [x, y].
  const PUDDLE = {1: [27, 14], 2: [33, 7]}
  const PEYES = {open: [[0, 0], [1, 0], [0, 1], [1, 1]], blink: [[0, 1], [1, 1]], happy: [[-1, 1], [0, 0], [1, 1]], sad: [[1, 0], [0, 1], [1, 1]]}
  /** A jelly mound w wide and h tall standing on row 38, outlined, lit on top, its core showing, a glint; then its face. */
  function puddle(stage, kind, eyeColor){
    const [w, h] = PUDDLE[stage], cx = X0 + SEAM, px = new Map(), put = (x, y, c) => px.set(x + ',' + y, [x, y, c])
    const half = j => Math.round(w / 2 * Math.sqrt(1 - (1 - (j + 1) / h) ** 2)) // round on top, widest where it meets the ground
    for (let j = 0; j < h; j++) for (let x = cx - half(j); x <= cx + half(j); x++) put(x, 38 - h + 1 + j, 'fill')
    const inside = (x, y) => px.has(x + ',' + y)
    for (const [x, y] of [...px.values()]) put(x, y, !inside(x, y - 1) ? COLORS[1] : N4.every(([ax, ay]) => inside(x + ax, y + ay)) ? COLORS[2] : COLORS[0])
    for (const [x, y] of [...px.values()]) for (const [ax, ay] of N4) if (!inside(x + ax, y + ay)) put(x + ax, y + ay, LINE)
    const top = 39 - h, ex = cx - Math.round(w / 4), ey = top + Math.max(2, Math.round(h / 3))
    put(cx - 3, top + 1, GLINT); put(cx - 2, top + 1, GLINT); put(cx - 1, top + 1, INK.H) // its glint, on top
    for (const [x, y] of [[-2, 3], [-1, 3], [5, 3], [6, 3]]) put(ex + x, ey + y, BLUSH)
    for (const [far, x0] of [[1, ex], [0, ex + 4]]) for (const [x, y] of PEYES[kind] || PEYES.open) put(x0 + (far ? x : 1 - x), ey + y, eyeColor)
    put(ex + 2, ey + 3, eyeColor) // its mouth
    return [...px.values()]
  }
  /** Base indices kept, in order, with some dropped and some doubled: how its rows or columns squash and stretch. */
  const keep = (n, del = [], dup = []) => [...Array(n).keys()].flatMap(i => del.includes(i) ? [] : dup.includes(i) ? [i, i] : [i])
  /** Where base index i lands among the kept ones: its first copy, or the kept one above it if it was dropped. */
  const at = (list, i) => { const k = list.findIndex(s => s >= i); return k < 0 ? list.length - 1 : list[k] === i ? k : k - 1 }
  /** Its body in a pose: squashed is shorter and wider, stretched taller and narrower, like jelly; base x, y to the grid. */
  function body(pose){
    const sq = Math.max(0, Math.round(pose.squash || 0)), st = Math.max(0, Math.round(pose.stretch || 0))
    const rows = keep(22, [16, 11, 15].slice(0, sq), st ? [16] : []).flatMap(i => i === 16 && st > 1 ? Array(st).fill(16) : [i])
    const wide = [[], [1, 21], [1, 10, 12, 21]][Math.min(sq, 2)], narrow = st ? [9, 13] : [] // pairs either side of its seam, clear of its face
    const cols = keep(23, narrow, wide), top = 40 - rows.length + (pose.dy || 0), seam = at(cols, SEAM)
    const x = i => X0 + SEAM + at(cols, i) - seam
    return {rows, cols, top, x, y: y => top + at(rows, y), xs: i => cols.flatMap((c, k) => c === i ? [x(0) + k] : []).concat(cols.includes(i) ? [] : [x(i)])} // xs: every copy of a column
  }

  // A hop, as the game's slime moves: it squashes, springs up stretched tall and thin, rounds out at the top, and lands
  // squashed flat, wobbling back to a cube. [pose, ms]; its hop is always the same height.
  const HOP = [[{squash: 1}, 60], [{stretch: 2, dy: -2}, 80], [{stretch: 1, dy: -5}, 100], [{dy: -6}, 100], [{dy: -4}, 80],
    [{stretch: 1, dy: -1}, 60], [{squash: 2}, 80], [{squash: 1}, 80]]
  console.assert(HOP.reduce((s, [, ms]) => s + ms, 0) === 640, 'Slime: a hop is 640 ms')
  const JIGGLE = [[{squash: 1}, 90], [{stretch: 1}, 90], [{squash: 1}, 90], [{}, 120]] // a jelly wobble
  const loop = m => ({intro: m, loops: Infinity, rest: m})
  // Thinking: no hand to its chin, so it sways a little, eyes up and wandering.
  const PONDER = [[-1, 260], [0, 300], [1, 260], [1, 400]].map(([dx, ms], i) => [{eyes: 'up', dx, tilt: [-2, 0, 2, 0][i]}, ms])
  const ASK = {eyes: 'up', arms: ['mid', 'high']} // a nub up, and a hop now and then until you answer
  const ASK_HOP = [[ASK, 1500], [{...ASK, squash: 2}, 110], [{...ASK, stretch: 2, dy: -3}, 120], [{...ASK, dy: -5}, 120], [{...ASK, stretch: 1, dy: -2}, 90], [{...ASK, squash: 2}, 110], [{...ASK, squash: 1}, 90]]

  SKINS.slime = {
    name: 'Slime', label: 'Minecraft slime (fan art)', pack: 'fan', colors: COLORS, sideOn: true,
    /** Where costumes find its face, as drawn facing left: its far eye's top-left, the top of its top face, and its front edge. */
    head(pose){
      const b = body(pose)
      return {x: b.x(EYE_AT[0][0]), y: b.y(EYE_AT[0][1]), top: b.top, nose: b.x(0)}
    },
    /**
     * The slime in a pose: its jelly body squashed or stretched, nubs of slime for hands (`arms` up or high, `hand`,
     * `reach`), outlined, then its face: eyes, mouth and cheeks. Its own keys: `mouth: 'yawn'`, and `puddle` (1, 2: melted).
     */
    draw(pose, eyeColor){
      if (pose.puddle) return puddle(pose.puddle, pose.eyes || 'open', eyeColor).map(([x, y, c]) => [pose.face > 0 ? GW - 1 - x + (pose.ox || 0) : x + (pose.ox || 0), y + (pose.dy || 0), c])
      const b = body(pose), px = new Map(), put = (x, y, c) => px.set(x + ',' + y, [x, y, c])
      b.rows.forEach((r, j) => b.cols.forEach((i, k) => { const c = INK[ROWS[r][i]]; if (c) put(b.x(0) + k, b.top + j, c) }))
      // Nubs: the first from its face side, a second (both arms up) from its other side.
      const arms = pose.arms || [], lifts = arms.filter(a => a === 'up' || a === 'high')
      const nubs = pose.hand != null || pose.reach ? [['hand', 0]] : lifts.map((a, n) => [a, n])
      for (const [kind, back] of nubs) {
        const [nx, ny, art] = kind === 'hand' ? goo(5 + Math.min(3, pose.reach || 0), Math.max(5, Math.min(11, (pose.hand ?? 7) + 2))) : NUB[kind] // at the height of Clawd's hand (from OY)
        const cells = art.flatMap((row, j) => [...row].flatMap((ch, i) => ch === '.' ? [] : [[nx + i, ny + j, INK[ch]]]))
        const mine = cells.map(([x, y, c]) => [back ? b.x(22) - x : b.x(0) + x, b.y(y), c]), own = new Set(mine.map(([x, y]) => x + ',' + y))
        for (const [x, y] of mine) for (const [ax, ay] of N4) if (!own.has(x + ax + ',' + (y + ay)) && !px.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
        for (const p of mine) put(...p)
      }
      // Its face: eyes that look about with the same keys as Clawd's (screen directions), keep their expressions, then its mouth and cheeks.
      const kind = pose.eyes || 'open', right = pose.face > 0
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      const shape = EYES[kind] || OPEN.map(([x, y]) => [x + (right ? -lx : lx), y + ly])
      const fy = y => b.y(13) + y - 13 // rows below its eyes, kept whole as the jelly squashes beneath
      for (const [x, y] of CHEEKS) for (const sx of b.xs(x)) put(sx, fy(y) + Math.max(0, ly), BLUSH) // squashed wide, its cheeks spread
      EYE_AT.forEach(([ex, ey], near) => { for (const [x, y] of shape) put(b.x(ex + (near && EYES[kind] ? 1 - x : x)), b.y(ey + y), eyeColor) }) // squashed hard, they squish too
      for (const [x, y] of MOUTHS[pose.mouth] || MOUTHS[kind] || [[MOUTH[0], MOUTH[1] + Math.max(0, ly)]]) put(b.x(x), fy(y), eyeColor) // looking down, it drops clear of the eye
      const out = [...px.values()].map(([x, y, c]) => [right ? GW - 1 - x : x, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
    // The everyday moves as jelly does them (see everyday.js for the shared ones).
    tricks: {
      hop: [...HOP.map(([p, ms]) => [{...p, eyes: p.squash ? 'blink' : 'happy'}, ms * 1.4]), [{}, 220]], // its own hop, a happy one
      yawn: [[{squash: 1, eyes: 'blink'}, 260], [{stretch: 2, eyes: 'blink', mouth: 'yawn'}, 950], [{squash: 1, eyes: 'blink'}, 200], ...JIGGLE],
    },
    // Claude's states as it'd do them (see MOODS in pet.html): it wobbles now and then while idle, sways as it thinks,
    // hops for your attention with a nub up, sulks half melted when it's stuck, and naps settled low, breathing deep.
    moods: {
      idle: loop([[{}, 3000], [{eyes: 'blink'}, 130], [{}, 2200], ...JIGGLE, [{}, 2400], [{eyes: 'blink'}, 120], [{}, 180], [{eyes: 'blink'}, 120], [{}, 1800], [{squash: 1}, 520]]),
      thinking: {intro: [...PONDER, ...PONDER, [{eyes: 'blink'}, 120], [{eyes: 'up'}, 400]], loops: 3, rest: [[{eyes: 'up'}, 2600], ...PONDER, [{eyes: 'blink'}, 120]]},
      needs: {rest: ASK_HOP},
      blocked: {intro: [[{squash: 2, eyes: 'sad'}, 300], [{puddle: 1, eyes: 'sad'}, 2500], [{puddle: 1, eyes: 'blink'}, 450]], loops: 1, rest: [[{puddle: 1, eyes: 'sad'}, 2800], [{puddle: 1, eyes: 'blink'}, 450]]},
      nap: loop([[{eyes: 'blink', squash: 1}, 2400], [{eyes: 'blink', squash: 2}, 2400]]),
    },
    /** Hovered: a jelly wobble, not the usual tilt, at t ms into the half second. */
    wiggle: t => ({...[{squash: 2}, {stretch: 1}, {squash: 1}, {stretch: 1}, {}][Math.min(4, Math.floor(t / 100))], eyes: 'happy'}),
    /** Its walk: no legs, so it hops along, looking where it's going (also used to climb). */
    walk(now, dir, arms){
      let t = now % 640
      for (const [p, ms] of HOP) { if (t < ms) return {...p, face: dir, lookX: dir, ...(arms && {arms})}; t -= ms }
    },
  }
}
