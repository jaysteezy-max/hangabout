// Cappy: the default pet. A capybara loaf drawn side on, facing left (facing right is the mirror image). Original art,
// drawn closely from the owner's own reference.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). Rows of his body; his eye and feet are added per pose:
// F is his snout, K the lines of his nose and mouth, S the dark red inside his near ear, under his chin and round his haunch.
// His far ear sits behind his head; his near ear opens into it.
{
  const ROWS = [
    '..........BB...BB.........',
    '...............SBB........',
    '.......LLLLLLLKSSB........',
    '......FLLLLLLLLBBB........',
    '.....FFFLLLLLLBBBBB.......',
    '....FFFFFBBBBBBBBBBBB.....',
    '...FFFFFFFBBBBBBBBBBBB....',
    '...KFKFFFFFBBBBBBBBBBB....',
    '...FKFFFFFFBBBBBBBBBBBB...',
    '...FKFFFFFFBBBBBBBBBBBB...',
    '...FKFFFFFFBBBBBBBBBBBS...',
    '...FKFFFFFFBBBBBBBBBBBB...',
    '......FFFFBBBBBBBBBBBBS...',
    '..........BBBBBBBBBBBSS...',
    '........SBBBBBBBBBBBBSS...',
    '........BBBBBBBBBBBBSS....',
    '........BBBBBBBBBSSSS.....',
  ]
  const COLORS = ['#C27A55', '#C9825C', '#8D4241', '#0E0809'] // BODY, TOP (the top of his head), SIDE (his inner ear and haunch), EYE
  const LINE = '#1C1214', FOOT = '#7A3A3E', LID = '#5A322C'
  const INK = {B: COLORS[0], L: COLORS[1], S: COLORS[2], F: '#86655F', G: '#8F6F69', K: LINE, P: FOOT} // G: his snout's front, lit, only seen turned
  const FEET = [17, 20, 26, 27] // each foot's left x: his front pair, then his hind pair under his haunch
  // His front leg off the ground, drawn over him with an outline of its own: [left x, top y, rows], P his toes. Reaching
  // out low (a jab reaches further, its leg longer behind his toes), up to his chin, and high in front of his face, from his chest.
  const PAW = {
    1: [12, 34, ['.PBBB', 'PPBBB']],
    2: [11, 32, ['.PP...', 'PBBB..', 'PBBBB.', '.BBBBB']],
    3: [7, 28, ['.PP......', 'PBBB.....', 'PBBB.....', '.BBBB....', '..BBBB...', '...BBBBB.', '.....BBBBB']],
  }
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const YAWN = [[12, -3], [12, -2], [12, -1], [13, -2], [14, -1]] // his mouth open, from his chin up, a tongue at its bottom
  const settled = pose => pose.tuck && !(pose.dy < 0) ? 1 : 0 // feet tucked on the ground, his loaf rests on the floor (in the air it doesn't)
  console.assert(ROWS.every(r => r.length === 26), 'Cappy: every row is 26 wide')

  // Turning round (pose.view): -2 is the profile above, -1 three-quarters, 0 facing you; 1 and 2 mirror -1 and -2.
  // Each view is drawn on purpose with the profile's palette and light (lit top, shaded haunch and sides), the same
  // height and feet on row 38, so he turns on the spot: his snout swings from the left to the middle, its front (G, lit)
  // coming round with his nose's fork and mouth line on it, his near eye and ear slide right, and his far eye and ear
  // come into view. x is the left of the rows; feet are each foot's left x (the first one lifts as his paw); eyes are each
  // eye's left pixel on row top + 5 (three-quarters, the far one is a 1 px sliver); paw is where a lifted paw's toes go;
  // mid is the plain body row he squashes, stretches and lies flat through, so his face keeps its shape.
  const VIEWS = {
    [-1]: {x: 11, feet: [16, 19, 25, 27], eyes: [17, 23], paw: [14, 34], mid: 13, rows: [
      '....BB........BB......',
      '..............SBB.....',
      '...LLLLLLLLLLLKSSB....',
      '..GLLLLLLLLLLLBBBB....',
      '.GGGLLLLLLLLLBBBBBB...',
      'GGGGGFBBBBBBBBBBBBBBB.',
      'GGGGGFFBBBBBBBBBBBBBBB',
      'GKGKGFFFBBBBBBBBBBBBBB',
      'GGKGGFFFBBBBBBBBBBBBBB',
      'GGKGGFFFBBBBBBBBBBBBBS',
      'GGKGGFFFBBBBBBBBBBBBBS',
      '.GGGGFFFBBBBBBBBBBBBBB',
      '...GGFFBBBBBBBBBBBBBBS',
      '....SBBBBBBBBBBBBBBBBS',
      '....SBBBBBBBBBBBBBBBBS',
      '.....BBBBBBBBBBBBBBBS.',
      '.....BBBBBBBBBBBBSSS..',
    ]},
    0: {x: 13, feet: [17, 25, 14, 28], eyes: [15, 27], paw: [16, 34], mid: 13, rows: [
      '..BB..........BB..',
      '.BBS..........SBB.',
      '.LLLLLLLLLLLLLLLL.',
      'LLLLLLLLLLLLLLLLLL',
      'BBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBB',
      'SBBBBGGGGGGGGBBBBS',
      'SBBBGGGGGGGGGGBBBS',
      'SBBBGKGGGGGGKGBBBS',
      'SBBBGGGKGGKGGGBBBS',
      'SBBBGGGGKKGGGGBBBS',
      'SBBBFGGGGGGGGFBBBS',
      'SBBBBFFFFFFFFBBBBS',
      'SBBBBBBBBBBBBBBBBS',
      'SSBBBBBBBBBBBBBBSS',
      '.SBBBBBBBBBBBBBBS.',
      '.SSBBBBBBBBBBBBSS.',
    ]},
  }
  console.assert(Object.values(VIEWS).every(v => v.rows.length === ROWS.length && v.rows.every(r => r.length === v.rows[0].length)), 'Cappy: each view as tall as his profile, its rows even')
  // His lifted paw, seen from the front or three-quarters: toes on top of a short leg in shade, raised higher for up and
  // high. Facing you it's on the side he faces (pose.face), the side it was on as he turned.
  const VIEW_PAW = {1: ['PPP', 'SSS'], 2: ['PPP', 'SSS', '.SS'], 3: ['PP..', 'SSS.', '.SSS', '..SS']}
  /** His eye at (ex, ey) in one of its expressions; back is the eye on the side away from his snout (it mirrors slants). */
  const eyeAt = (kind, ex, ey, lx, ly, back) => kind === 'blink' ? [[ex, ey + 1], [ex + 1, ey + 1]]
    : kind === 'happy' ? [[ex, ey], [ex + 1, ey - 1], [ex + 2, ey]] : kind === 'sad' ? (back ? [[ex, ey + 1], [ex + 1, ey]] : [[ex, ey], [ex + 1, ey + 1]])
    : kind === 'dizzy' ? [[ex, ey - 1], [ex + 2, ey - 1], [ex + 1, ey], [ex, ey + 1], [ex + 2, ey + 1]]
    : kind === 'strain' ? (back ? [[ex + 1, ey - 1], [ex, ey], [ex + 1, ey + 1]] : [[ex, ey - 1], [ex + 1, ey], [ex, ey + 1]])
    : kind === 'angry' ? [[ex, ey], [ex + 1, ey], [ex + (back ? 0 : 1), ey - 1]] : [[ex + lx, ey + ly], [ex + lx + 1, ey + ly]]
  /** Cappy three-quarters or facing you (view -1, 0, 1), as drawn turned left, then mirrored for 1. */
  function turned(pose, eyeColor, view){
    const V = VIEWS[-Math.abs(view)], rows = V.rows.slice(), st = pose.stretch || 0, dy = (pose.dy || 0) + settled(pose)
    rows.splice(V.mid, (pose.squash || 0) + (pose.flat || 0)); for (let i = 0; i < st; i++) rows.splice(V.mid, 0, rows[V.mid])
    const top = 38 - rows.length + dy, px = [], seen = new Set(), put = (x, y, c) => { px.push([x, y, c]); seen.add(x + ',' + y) }
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (INK[ch]) put(V.x + i, top + j, INK[ch]) }))
    const arms = pose.arms || [], paw = pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : arms.includes('up') ? 2 : 0
    V.feet.forEach((x, n) => { if (!(n === 0 && paw) && !pose.tuck && !pose.lift?.includes(n) && pose.tapLeg !== n) { put(x, 38 + dy, FOOT); put(x + 1, 38 + dy, FOOT) } })
    for (const [x, y] of px.slice()) for (const [ax, ay] of N4) if (!seen.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
    if (paw) { // held up in front of him, with an outline of its own
      const art = VIEW_PAW[paw], [x0, y1] = V.paw, y0 = y1 + dy - st - art.length + 3, limb = []
      art.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') limb.push([view === 0 && pose.face > 0 ? GW - 1 - x0 - i : x0 + i, y0 + j, ch === 'P' ? FOOT : INK.S]) }))
      const mine = new Set(limb.map(([x, y]) => x + ',' + y))
      for (const [x, y] of limb) for (const [ax, ay] of N4) if (!mine.has(x + ax + ',' + (y + ay))) px.push([x + ax, y + ay, LINE])
      px.push(...limb)
    }
    const kind = pose.eyes || 'open', ey = top + 5
    const lx = Math.max(-1, Math.min(1, kind === 'side' ? -(pose.look ?? 1) * Math.sign(view || 1) : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
    V.eyes.forEach((ex, n) => { const pts = eyeAt(kind, ex, ey, view > 0 ? -lx : lx, ly, n > 0); for (const [x, y] of view && !n ? pts.slice(0, 1) : pts) px.push([x, y, kind === 'blink' ? LID : eyeColor]) })
    const out = view > 0 ? px.map(([x, y, c]) => [GW - 1 - x, y, c]) : px
    return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
  }

  // How he moves his own way (see "Skins" in TRICKS.md): a capybara's bow of a stretch, a yawn with his nose up, and lying
  // flat on the floor when he's stuck or dozing (flat: lower on his belly, his snout whole). glide turns a tilt the way he faces.
  const SLUMP = [[{flat: 2, tuck: 1, eyes: 'sad'}, 2800], [{flat: 1, tuck: 1, eyes: 'sad'}, 300], [{flat: 2, tuck: 1, eyes: 'blink'}, 450]] // flat on the floor, glum, a sigh now and then
  const NAP = [[{flat: 2, tuck: 1, eyes: 'blink'}, 2400], [{flat: 1, tuck: 1, eyes: 'blink'}, 2400]] // a loaf on the floor, breathing
  const MOVES = {
    tricks: {
      stretch: [[{squash: 1}, 160], [{tilt: 6, glide: 1, reach: 2, eyes: 'blink'}, 750], [{stretch: 1, eyes: 'blink'}, 180], [{squash: 1}, 220], [{}, 300]], // down on his front, a paw reaching out
      yawn: [[{squash: 1, eyes: 'blink'}, 260], [{stretch: 1, tilt: -5, glide: 1, eyes: 'blink', mouth: 'yawn'}, 950], [{squash: 1, eyes: 'blink'}, 200], [{}, 250]],
      lookAround: [[{eyes: 'side', look: -1, tilt: 3, glide: 1}, 650], [{eyes: 'side', look: 1, tilt: -3, glide: 1}, 650], [{eyes: 'up', stretch: 1, tilt: -5, glide: 1}, 450], [{}, 200]], // his head goes with his eye
      scratch: [...Array(4)].flatMap(() => [[{arms: ['up', 'up'], tilt: -4, glide: 1, eyes: 'blink'}, 170], [{arms: ['up', 'up'], squash: 1, tilt: -2, glide: 1, eyes: 'happy'}, 170]]), // his chin rubbed on his paw
      ledgeSit: [[{sink: 3}, 120], [{sink: 6, flat: 2, tuck: 1}, 300], // lounging on the ledge, a front paw dangling over it
        ...[...Array(8)].map((_, i) => [{sink: 6, flat: 2, tuck: 1, hand: 6, reach: i % 2 ? 2 : 0, eyes: i === 5 ? 'blink' : 'open'}, 380]), [{sink: 3}, 120], [{}, 200]],
    },
    moods: {blocked: {intro: SLUMP, rest: SLUMP}, nap: {intro: NAP, rest: NAP}},
  }

  SKINS.cappy = {
    ...MOVES,
    name: 'Cappy', colors: COLORS, sideOn: true, views: true,
    /** Where costumes find his face, as drawn facing left: his eye (x, y: its left pixel), the top of his head between his ears, and the front of his snout. */
    head(pose){
      const top = 38 - ROWS.length + (pose.squash || 0) + (pose.flat || 0) - (pose.stretch || 0) + (pose.dy || 0) + settled(pose) // as draw() works it out
      const v = pose.view ?? -2, near = VIEWS[-Math.abs(v)] // turned, his face is further round (only between views)
      return Math.abs(v) === 2 ? {x: 20, y: top + 5, top: top + 2, nose: 12} : {x: near.eyes.at(-1), y: top + 5, top: top + 2, nose: near.x + (v ? 0 : 5)}
    },
    /** Where his lifted paw's toes are (x, y) in this pose, as he's drawn on screen: props he holds hang from it. */
    hand(pose){
      const v = pose.view ?? (pose.face > 0 ? 2 : -2), at = (pose.dy || 0) - (pose.stretch || 0) + settled(pose), arms = pose.arms || []
      const paw = pose.hand <= 4 ? 2 : pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : 2 // as draw() picks it
      const [x, y] = Math.abs(v) < 2 ? VIEWS[-Math.abs(v)].paw.map((n, i) => n + 1 - i) : paw === 1 ? [12 - Math.min(3, pose.reach || 0), 35] : paw === 2 ? [11, 33] : [8, 29]
      return {x: (v > 0 || (v === 0 && pose.face > 0) ? GW - 1 - x : x) + (pose.ox || 0), y: y + at}
    },
    /** Where his feet are centred in each view (x, as drawn): the page keeps it still while he turns on the spot. */
    feetX: view => 21.5 - Math.sign(view), // three-quarters stands on the profile's footprint
    /** Cappy in a pose: squashed or stretched through the middle, feet stepping or tucked, a front paw up instead of a hand, outlined, then his eye. */
    draw(pose, eyeColor){
      if (pose.view != null && Math.abs(pose.view) < 2) return turned(pose, eyeColor, pose.view)
      const rows = ROWS.slice(), sq = pose.squash || 0, st = pose.stretch || 0
      rows.splice(13, pose.flat || 0); rows.splice(10, sq); for (let i = 0; i < st; i++) rows.splice(rows.length - 2, 0, rows[rows.length - 2]) // a shorter snout, or taller on his legs, so his face keeps its shape
      const dy = (pose.dy || 0) + settled(pose), top = 38 - rows.length + dy, px = [], seen = new Set() // his feet are on row 38
      const put = (x, y, c) => { px.push([x, y, c]); seen.add(x + ',' + y) }
      rows.forEach((r, j) => [...r].forEach((ch, i) => { if (INK[ch]) put(9 + i, top + j, INK[ch]) }))
      const arms = pose.arms || [], paw = pose.hand <= 4 ? 2 : pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : arms.includes('up') ? 2 : 0
      FEET.forEach((x, n) => {
        if (!(n === 0 && paw) && !pose.tuck && !pose.lift?.includes(n) && pose.tapLeg !== n) { put(x, 38 + dy, FOOT); put(x + 1, 38 + dy, FOOT) }
      })
      for (const [x, y] of px.slice()) for (const [ax, ay] of N4) if (!seen.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
      if (paw) {
        const r = paw === 1 ? Math.min(3, pose.reach || 0) : 0, [x0, y0, art] = PAW[paw], limb = [], at = dy - st // it keeps to his chin
        art.forEach((row, j) => [...row.slice(0, 2) + 'B'.repeat(r) + row.slice(2)].forEach((ch, i) => { if (INK[ch]) limb.push([x0 - r + i, y0 + j + at, INK[ch]]) }))
        const mine = new Set(limb.map(([x, y]) => x + ',' + y))
        for (const [x, y] of limb) for (const [ax, ay] of N4) if (!mine.has(x + ax + ',' + (y + ay))) px.push([x + ax, y + ay, LINE])
        px.push(...limb)
      }
      if (pose.mouth === 'yawn') { const chin = 33 + dy - st; for (const [x, y] of YAWN) px.push([x, chin + y, LINE]); px.push([13, chin - 1, INK.S]) }
      const right = pose.view != null ? pose.view > 0 : pose.face > 0, out = right ? px.map(([x, y, c]) => [GW - 1 - x, y, c]) : px
      // His eye, a dash: it looks about with the same keys as Clawd's (screen directions), and keeps his expressions.
      const kind = pose.eyes || 'open', ex = right ? 22 : 20, ey = top + 5
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      const eye = (pts, c = eyeColor) => { for (const [x, y] of pts) out.push([ex + x, ey + y, c]) }
      if (kind === 'blink') eye([[0, 1], [1, 1]], LID) // his lid, a row under his open eye
      else if (kind === 'happy') eye([[0, 0], [1, -1], [2, 0]])
      else if (kind === 'sad') eye(right ? [[0, 1], [1, 0]] : [[0, 0], [1, 1]]) // drooping at the back
      else if (kind === 'dizzy') eye([[0, -1], [2, -1], [1, 0], [0, 1], [2, 1]])
      else if (kind === 'strain') eye(right ? [[0, -1], [1, 0], [0, 1]] : [[1, -1], [0, 0], [1, 1]]) // a squint pointing at his snout
      else if (kind === 'angry') eye([[0, 0], [1, 0], [right ? 0 : 1, -1]])
      else eye([[lx, ly], [lx + 1, ly]])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
}
