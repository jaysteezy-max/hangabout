// Pusheen (fan art): Pusheen the cat, by Pusheen Corp. (pusheen.com). Fan-made and unofficial, not affiliated with or
// endorsed by Pusheen Corp. Her classic loaf: lying side on, head on the left, facing left (facing right is the mirror
// image), after the well-known Pusheen pixel sprite, redrawn at about Cappy's size.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). Rows of her body; her eyes, whiskers and paws are added per
// pose: L is the top of her head and back, T her stripes, K her mouth, her far whiskers and the line over her tail.
{
  const ROWS = [
    '...B........B.............',
    '...BB......BBB............',
    '..BBBB....BBBBB...........',
    '.LLLLLLTLTLLLLLTTTLTT.....',
    '.BBBBBBTBTBBBBBBTTBBTTB...',
    '.BBBBBBBBBBBBBBKKTBBBTTB..',
    '.BBBBBBBKBBBBBBBBBBBBBBB..',
    'BBBBBBBKKKBBBBBKKBBBBBBBB.',
    'BBBBBBBBBBBBBBBBBBBBBBBBB.',
    'BBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBKBB',
    '.BBBBBBBBBBBBBBBBBKKKKKTB.',
    '..BBBBBBBBBBBBBBBKTBTBTB..',
  ]
  // Her ears laid back (sad, cross, yawning), in place of the first three rows.
  const FLAT = ['..........................', '....BB.......BB...........', '..BBBB.....BBBB...........']
  // Her bottom three rows with her tail off the floor (flicked up behind her), and the tail itself, from her rump's lower corner.
  const UNTUCKED = ['BBBBBBBBBBBBBBBBBBBBBBBBBB', '.BBBBBBBBBBBBBBBBBBBBBBBB.', '..BBBBBBBBBBBBBBBBBBBBBB..']
  const TAIL = [25, 7, ['.TT.', '..BT', '..TB', '..BT', '..TB', '.TB.', 'TB..']] // [x, row from her top, art]: out of her rump, curling up
  const COLORS = ['#A0A0A0', '#A6A6A6', '#627B87', '#0B0B0E'] // BODY, TOP (the top of her head and back), SIDE (her stripes), EYE
  const LINE = '#19191C', TOE = '#8B8B90', LID = '#5F5F64', PINK = '#F3A3B5', WET = '#9AD7F5', RED = '#E5484D', ZED = '#C3CCF5'
  const INK = {B: COLORS[0], L: COLORS[1], T: COLORS[2], K: LINE, P: TOE, W: PINK}
  const X0 = 10 // her face's front, as drawn facing left
  const FEET = [13, 17, 25, 29] // each paw's left x, front paw first
  const WHISKERS = [[7, 5], [8, 5], [9, 5], [7, 7], [8, 7]] // past her outline, by her near cheek: [x, row]
  const EYE_AT = [[13, 6], [22, 6]] // each eye's left pixel and row: near, far
  // Her eyes, two dashes, as the near one is drawn (the far one is its mirror): [x, y] from the eye's left pixel.
  const EYES = {
    blink: [[0, 0], [1, 0]],
    happy: [[0, 0], [1, -1], [2, 0]],
    content: [[0, -1], [1, 0], [2, -1]], // closed and smiling, for a nap or a cosy sit
    sad: [[0, 1], [1, 0]],
    angry: [[0, -1], [0, 0], [1, 0]],
    strain: [[0, -1], [1, 0], [0, 1]],
    dizzy: [[0, -1], [2, -1], [1, 0], [0, 1], [2, 1]],
  }
  // What else shows on her face with each look, from her face's front and her top: [x, row, color].
  const EMOTE = {
    happy: [[1, 7, PINK], [2, 7, PINK], [13, 7, PINK], [14, 7, PINK]], // blushing
    content: [[1, 7, PINK], [2, 7, PINK], [13, 7, PINK], [14, 7, PINK]],
    strain: [[17, 0, WET], [16, 1, WET], [17, 1, WET], [16, 2, WET], [17, 2, WET]], // a sweat drop
    angry: [[17, -2, RED], [19, -2, RED], [16, -1, RED], [17, -1, RED], [19, -1, RED], [20, -1, RED], [16, 1, RED], [17, 1, RED], [19, 1, RED], [20, 1, RED], [17, 2, RED], [19, 2, RED]], // a cross mark
  }
  const LAID_BACK = {angry: 1}, TEAR = [[3, 8, WET], [3, 9, WET]] // ears back when cross; a tear down her cheek when she sulks (`tear`)
  const MOUTH = { // over her usual one, from her face's front and her top
    yawn: [[8, 7, PINK], [7, 8, LINE], [8, 8, PINK], [9, 8, LINE], [8, 9, LINE]],
    lick: [[8, 8, PINK]],
  }
  // Her front paw off the ground, outlined on its own so it reads in front of her face: [left x, top y, art], with P its
  // toes. Pushed out low (a hand, longer for a jab), up (a wave), high.
  const PAW = {
    1: [6, 34, ['PBBBBB', 'PBBBBB']],
    2: [6, 29, ['.PP...', 'PBBB..', 'PBBBB.', '.BBBBB', '..BBBB']],
    3: [5, 25, ['.PP....', 'PBBB...', 'PBBBB..', '.BBBB..', '..BBBB.', '...BBBB', '....BBB']],
  }
  // A cat's stretch, drawn whole: front legs reaching out along the floor, chest down, rump and tail up. Rows of [y, from x,
  // to x] of body, then her stripes, paws and face, in the grid as she faces left.
  const STRETCH = {
    body: [[14, 35, 36], [15, 35, 36], [16, 35, 36], [17, 35, 36], [18, 35, 36], [19, 34, 35], [20, 34, 35], [21, 27, 35],
      [22, 12, 12], [22, 21, 21], [22, 25, 34], [23, 12, 13], [23, 20, 22], [23, 23, 34], [24, 11, 14], [24, 19, 34],
      [25, 10, 34], [26, 10, 34], [27, 10, 34], [28, 10, 34], [29, 9, 34], [30, 9, 34], [31, 9, 34], [32, 9, 27], [32, 29, 33],
      [33, 9, 25], [33, 29, 33], [34, 10, 22], [34, 29, 33], [35, 7, 19], [35, 29, 33], [36, 5, 17], [36, 29, 33], [37, 4, 14], [37, 29, 33]],
    stripes: [[35, 15], [36, 15], [35, 17], [36, 17], [34, 19], [35, 19], [34, 21], [35, 21], [16, 25], [16, 26], [18, 25], [18, 26],
      [26, 22], [27, 22], [27, 23], [29, 21], [30, 21], [30, 22], [31, 23]],
    paws: [[4, 38], [5, 38], [6, 38], [29, 38], [30, 38], [32, 38], [33, 38]],
    line: [[17, 28], [16, 29], [17, 29], [18, 29], [24, 27], [25, 27], [24, 29], [25, 29], [6, 27], [7, 27], [8, 27], [6, 29], [7, 29]], // her mouth and whiskers
    eyes: [[12, 28], [21, 28]],
  }
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const settled = pose => pose.tuck && !(pose.dy < 0) ? 1 : 0 // paws tucked on the ground, her loaf rests on the floor (in the air it doesn't)
  const STEP = i => [{legs: i % 2 ? 0 : 1, lift: [[0, 3], [], [1, 2], []][i % 4], tail: 1, tilt: 0, glide: 45}, 110] // her walk, gliding
  const HEART = ['.W.W.', 'WWWWW', '.WWW.', '..W..']
  const Z = [['ZZZ', '.Z.', 'Z..', 'ZZZ'], ['ZZZZ', '..Z.', '.Z..', 'Z...', 'ZZZZ']]
  console.assert(ROWS.every(r => r.length === 26) && UNTUCKED.every(r => r.length === 26) && FLAT.every(r => r.length === 26), 'Pusheen: every row is 26 wide')

  /** Her cat stretch, from STRETCH: outlined, then her face, eyes shut in bliss. */
  function stretched(pose, eyeColor){
    const px = new Map(), put = (x, y, c) => px.set(x + ',' + y, [x, y, c])
    for (const [y, a, b] of STRETCH.body) for (let x = a; x <= b; x++) put(x, y, INK.B)
    for (const [x, y] of STRETCH.stripes) put(x, y, INK.T)
    for (const [x, y] of STRETCH.paws) put(x, y, TOE)
    for (const [x, y] of [...px.values()]) for (const [ax, ay] of N4) if (!px.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
    for (const [x, y] of STRETCH.line) put(x, y, LINE)
    const shut = pose.eyes === 'blink' || pose.eyes === 'content'
    for (const [ex, ey] of STRETCH.eyes) { put(ex, ey, shut ? LID : eyeColor); put(ex + 1, ey, shut ? LID : eyeColor) }
    return [...px.values()]
  }

  SKINS.pusheen = {
    name: 'Pusheen', label: 'Pusheen (fan art)', colors: COLORS, sideOn: true,
    /** Where costumes find her face, as drawn facing left: her near eye (x, y: its left pixel), the top of her head between her ears, and the front of her face. */
    head(pose){
      const top = 38 - ROWS.length + (pose.squash || 0) - (pose.stretch || 0) + (pose.dy || 0) - (pose.legs ? 1 : 0) + settled(pose) // as draw() works it out
      return {x: EYE_AT[0][0], y: top + EYE_AT[0][1], top: top + 3, nose: X0}
    },
    /**
     * Pusheen in a pose: squashed or stretched through her middle, paws stepping or tucked, a front paw up, outlined,
     * whiskers, then her eyes and whatever her face is doing. Her own pose keys, beside the shared ones: `legs` (up on her
     * little legs, as she walks), `tail` (1: flicked up off the floor), `ears` ('flat'), `tear`, `mouth` ('yawn', 'lick'),
     * `cat: 'stretch'` (a cat's stretch, drawn whole), and her props: `zz` (how many z's as she naps), `heart`, `balls`
     * (0 to 1: how far round her juggling the balls are).
     */
    draw(pose, eyeColor){
      const kind = pose.eyes || 'open', right = pose.face > 0
      const out = (pose.cat === 'stretch' ? stretched(pose, eyeColor) : loaf(pose, eyeColor, kind)).map(([x, y, c]) => [right ? GW - 1 - x : x, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
    /** Her walk: up on her little legs in quick diagonal pairs, her heavy loaf dropping a pixel each time a pair lands, tail up the way cats walk. */
    walk(now, dir, arms){
      const i = Math.floor(now / 110) % 4
      return {face: dir, legs: i % 2 ? 0 : 1, lift: i === 0 ? [0, 3] : i === 2 ? [1, 2] : [], tail: 1, lookX: dir, ...(arms && {arms})}
    },
    // The everyday moves as a cat does them (see everyday.js and juggle.js for the shared ones).
    tricks: {
      stretch: [[{squash: 1}, 160], [{cat: 'stretch', eyes: 'blink'}, 1000], [{cat: 'stretch'}, 260], [{squash: 1}, 220], [{tail: 1}, 300], [{}, 200]],
      yawn: [[{squash: 1, eyes: 'blink'}, 260], [{stretch: 1, eyes: 'blink', mouth: 'yawn'}, 950], [{squash: 1, eyes: 'blink'}, 200], [{}, 250]],
      scratch: [ // washes: licks her paw, then wipes it over her face and ear
        ...[...Array(3)].flatMap(() => [[{arms: ['up', 'mid'], eyes: 'blink', mouth: 'lick'}, 170], [{arms: ['up', 'mid'], eyes: 'blink'}, 150]]),
        ...[...Array(2)].flatMap(() => [[{arms: ['mid', 'high'], eyes: 'blink', ears: 'flat'}, 220], [{arms: ['up', 'mid'], eyes: 'blink'}, 170]]),
        [{}, 200],
      ],
      sit: [[{squash: 2, tuck: 1}, 220], [{squash: 2, tuck: 1, eyes: 'content'}, 2700], [{squash: 1}, 220]], // tucks into a tight, content loaf
      wave: [...[1, 2, 3, 4, 5, 6].map(h => [{eyes: 'happy', arms: ['mid', h % 2 ? 'high' : 'up'], heart: h}, 200]), [{}, 200]],
      juggle: [ // her own balls, kept up over one paw (no `juggle` key, so the shared balls stay away)
        [{squash: 1, arms: ['up', 'mid']}, 160],
        ...[...Array(36)].map((_, i) => [{eyes: 'up', arms: [i % 4 < 2 ? 'up' : 'high', 'mid'], balls: (i % 12) / 12}, 80]),
        [{arms: ['up', 'mid'], eyes: 'happy'}, 450],
        [{}, 200],
      ],
      trip: [ // as trip.js, but in her own steps; it lays her flat itself (`trip`)
        STEP(0), STEP(1),
        [{legs: 1, lift: [2, 3], tail: 1, arms: ['mid', 'high'], eyes: 'up', tilt: 14, glide: 70}, 110], // a paw catches
        [{tuck: 1, dy: -1, arms: ['mid', 'high'], eyes: 'strain', tilt: 40, glide: 80}, 90],
        [{tuck: 1, dy: -1, arms: ['up', 'mid'], eyes: 'strain', tilt: 70, glide: 70}, 70],
        [{tilt: 0, trip: 0, glide: 40}, 100], // splat
        [{tilt: 0, trip: 1, glide: 20}, 160],
        [{tilt: 0, trip: 2, glide: 1}, 800],
        [{dy: -4, stretch: 1, tuck: 1, arms: ['up', 'mid'], eyes: 'up'}, 130], // up!
        [{squash: 2, eyes: 'strain'}, 110],
        [{eyes: 'side', look: -1, ears: 'flat'}, 420], [{eyes: 'side', look: 1, ears: 'flat'}, 420], // did anyone see?
        ...[0, 1, 2, 3, 4, 5, 6, 7].map(STEP), // as if nothing happened
        [{}, 200],
      ],
    },
    // Claude's states as she'd do them (see MOODS in pet.html): her tail flicks while she waits, she naps curled up with
    // z's, and when stuck she sulks in a loaf with her ears back.
    moods: {
      idle: (m => ({intro: m, loops: Infinity, rest: m}))([[{}, 3200], [{eyes: 'blink'}, 130], [{}, 2000], [{tail: 1}, 180], [{}, 140], [{tail: 1}, 180], [{}, 600], [{eyes: 'blink'}, 120], [{}, 2400], [{squash: 1}, 520]]),
      nap: (m => ({intro: m, loops: Infinity, rest: m}))([0, 1, 2, 3].flatMap(zz => [[{eyes: 'content', tuck: 1, squash: 1, zz}, 700], [{eyes: 'content', tuck: 1, squash: 2, zz}, 700]])),
      blocked: (m => ({intro: m, loops: 1, rest: m}))([[{squash: 2, tuck: 1, eyes: 'sad', ears: 'flat', tear: 1}, 2800], [{squash: 2, tuck: 1, eyes: 'blink', ears: 'flat'}, 450]]),
    },
  }

  /** Her usual loaf, as she faces left. */
  function loaf(pose, eyeColor, kind){
    const rows = ROWS.slice(), sq = pose.squash || 0, st = pose.stretch || 0
    if (pose.ears === 'flat' || LAID_BACK[kind] || pose.mouth === 'yawn') rows.splice(0, 3, ...FLAT)
    if (pose.tail > 0) rows.splice(15, 3, ...UNTUCKED)
    rows.splice(12, sq); for (let i = 0; i < st; i++) rows.splice(12, 0, rows[12]) // shorter or taller below her face, so it keeps its shape
    const legs = pose.legs ? 1 : 0, dy = (pose.dy || 0) + settled(pose), top = 38 - legs - rows.length + dy, px = new Map() // her paws are on row 38
    const put = (x, y, c) => px.set(x + ',' + y, [x, y, c]) // a later pixel covers an earlier one
    const cells = (x0, y0, a) => a.flatMap((r, j) => [...r].flatMap((ch, i) => INK[ch] ? [[x0 + i, y0 + j, INK[ch]]] : []))
    for (const p of cells(X0, top, rows)) put(...p)
    if (pose.tail > 0) for (const p of cells(X0 + TAIL[0], top + TAIL[1] - sq + st, TAIL[2])) put(...p)
    const arms = pose.arms || [], paw = pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : arms.includes('up') ? 2 : 0
    FEET.forEach((x, n) => { // planted, or lifted off the floor: on her legs a lifted paw shows, tucked up under her
      if ((n === 0 && paw) || pose.tuck) return
      const up = pose.lift?.includes(n) || pose.tapLeg === n
      if (up && !legs) return
      for (let i = 0; i < 2; i++) { if (!up && legs) put(x + i, 37 + dy, INK.B); put(x + i, (up ? 37 : 38) + dy, TOE) }
    })
    for (const [x, y] of [...px.values()]) for (const [ax, ay] of N4) if (!px.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
    for (const [x, j] of WHISKERS) put(x, top + j, LINE)
    if (paw) {
      const r = paw === 1 ? Math.min(3, pose.reach || 0) : 0, [x0, y0, a] = PAW[paw] // a jab sticks out r further
      const limb = cells(x0 - r, y0 + dy - legs, a.map(row => row[0] + 'B'.repeat(r) + row.slice(1))), mine = new Set(limb.map(([x, y]) => x + ',' + y))
      for (const [x, y] of limb) for (const [ax, ay] of N4) if (!mine.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
      for (const p of limb) put(...p)
    }
    for (const [x, j, c] of MOUTH[pose.mouth] || []) put(X0 + x, top + j, c)
    // Her eyes, short dashes: they look about with the same keys as Clawd's (screen directions), and keep her expressions.
    const right = pose.face > 0
    const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
    EYE_AT.forEach(([ex, j], far) => {
      const pts = EYES[kind] || [[right ? -lx : lx, ly], [(right ? -lx : lx) + 1, ly]]
      for (const [x, y] of pts) put(ex + (far && EYES[kind] ? 1 - x : x), top + j + y, kind === 'blink' ? LID : kind === 'content' ? LINE : eyeColor)
    })
    for (const [x, j, c] of [...EMOTE[kind] || [], ...pose.tear ? TEAR : []]) put(X0 + x, top + j, c)
    // Her props, drawn with her so they turn with her: z's as she naps, a heart for a wave, three balls juggled over her paw.
    for (let k = 0; k < (pose.zz || 0); k++) { const z = Z[k % 2]; z.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'Z') put(X0 + 17 + 4 * k + i, top - 3 - 5 * k + j, ZED) })) }
    if (pose.heart) HEART.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'W') put(X0 - 7 + i, top - 1 - pose.heart + j, PINK) }))
    if (pose.balls != null) {
      const C = globalThis.hangabout?.C || {}
      ;[C.peri || '#9AA6F0', C.ok || '#4CC38A', '#FFD84D'].forEach((c, i) => {
        const u = (pose.balls + i / 3) % 1, x = Math.round(X0 - 4 + 4 * Math.cos(2 * Math.PI * u)), y = Math.round(top + 2 - 7 * Math.sin(2 * Math.PI * u) - 3)
        for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) put(x + a, y + b, c)
      })
    }
    return [...px.values()]
  }
}
