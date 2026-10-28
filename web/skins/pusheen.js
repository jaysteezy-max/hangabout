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
  const COLORS = ['#A0A0A0', '#A6A6A6', '#627B87', '#0B0B0E'] // BODY, TOP (the top of her head and back), SIDE (her stripes), EYE
  const LINE = '#19191C', TOE = '#8B8B90', LID = '#5F5F64'
  const INK = {B: COLORS[0], L: COLORS[1], T: COLORS[2], K: LINE, P: TOE}
  const X0 = 10 // her face's front, as drawn facing left
  const FEET = [13, 17, 25, 29] // each paw's left x, front paw first
  const WHISKERS = [[7, 5], [8, 5], [9, 5], [7, 7], [8, 7]] // past her outline, by her near cheek: [x, row]
  const EYE_AT = [[13, 6], [22, 6]] // each eye's left pixel and row: near, far
  // Her eyes, two dashes, as the near one is drawn (the far one is its mirror): [x, y] from the eye's left pixel.
  const EYES = {
    blink: [[0, 0], [1, 0]],
    happy: [[0, 0], [1, -1], [2, 0]],
    sad: [[0, 1], [1, 0]],
    angry: [[0, -1], [0, 0], [1, 0]],
    strain: [[0, -1], [1, 0], [0, 1]],
    dizzy: [[0, -1], [2, -1], [1, 0], [0, 1], [2, 1]],
  }
  // Her front paw off the ground, outlined on its own so it reads in front of her face: [left x, top y, art], with P its
  // toes. Pushed out low (a hand, longer for a jab), up (a wave), high.
  const PAW = {
    1: [6, 34, ['PBBBBB', 'PBBBBB']],
    2: [6, 29, ['.PP...', 'PBBB..', 'PBBBB.', '.BBBBB', '..BBBB']],
    3: [5, 25, ['.PP....', 'PBBB...', 'PBBBB..', '.BBBB..', '..BBBB.', '...BBBB', '....BBB']],
  }
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  console.assert(ROWS.every(r => r.length === 26), 'Pusheen: every row is 26 wide')

  SKINS.pusheen = {
    name: 'Pusheen', label: 'Pusheen (fan art)', pack: 'fan', colors: COLORS, sideOn: true,
    /** Where costumes find her face, as drawn facing left: her near eye (x, y: its left pixel), the top of her head between her ears, and the front of her face. */
    head(pose){
      const top = 38 - ROWS.length + (pose.squash || 0) - (pose.stretch || 0) + (pose.dy || 0) // as draw() works it out
      return {x: EYE_AT[0][0], y: top + EYE_AT[0][1], top: top + 3, nose: X0}
    },
    /** Pusheen in a pose: squashed or stretched through her middle, paws stepping or tucked, a front paw up, outlined, whiskers, then her eyes. */
    draw(pose, eyeColor){
      const rows = ROWS.slice(), sq = pose.squash || 0, st = pose.stretch || 0
      rows.splice(12, sq); for (let i = 0; i < st; i++) rows.splice(12, 0, rows[12]) // shorter or taller below her face, so it keeps its shape
      const dy = pose.dy || 0, top = 38 - rows.length + dy, px = new Map() // her paws are on row 38
      const put = (x, y, c) => px.set(x + ',' + y, [x, y, c]) // drawn as she faces left; a later pixel covers an earlier one
      const cells = (x0, y0, a) => a.flatMap((r, j) => [...r].flatMap((ch, i) => INK[ch] ? [[x0 + i, y0 + j, INK[ch]]] : []))
      for (const p of cells(X0, top, rows)) put(...p)
      const arms = pose.arms || [], paw = pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : arms.includes('up') ? 2 : 0
      FEET.forEach((x, n) => {
        if (n === 0 && paw) return
        if (!pose.tuck && !pose.lift?.includes(n) && pose.tapLeg !== n) { put(x, 38 + dy, TOE); put(x + 1, 38 + dy, TOE) }
      })
      for (const [x, y] of [...px.values()]) for (const [ax, ay] of N4) if (!px.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
      for (const [x, j] of WHISKERS) put(x, top + j, LINE)
      if (paw) {
        const r = paw === 1 ? Math.min(3, pose.reach || 0) : 0, [x0, y0, a] = PAW[paw] // a jab sticks out r further
        const limb = cells(x0 - r, y0 + dy, a.map(row => row[0] + 'B'.repeat(r) + row.slice(1))), mine = new Set(limb.map(([x, y]) => x + ',' + y))
        for (const [x, y] of limb) for (const [ax, ay] of N4) if (!mine.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
        for (const p of limb) put(...p)
      }
      // Her eyes, short dashes: they look about with the same keys as Clawd's (screen directions), and keep her expressions.
      const right = pose.face > 0, kind = pose.eyes || 'open'
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      EYE_AT.forEach(([ex, j], far) => {
        const pts = EYES[kind] || [[right ? -lx : lx, ly], [(right ? -lx : lx) + 1, ly]]
        for (const [x, y] of pts) put(ex + (far && EYES[kind] ? 1 - x : x), top + j + y, kind === 'blink' ? LID : eyeColor)
      })
      const out = [...px.values()].map(([x, y, c]) => [right ? GW - 1 - x : x, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
}
