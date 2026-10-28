// Hippo: a pygmy hippo on all fours, drawn three-quarters on, facing left (facing right is the mirror image). Original art.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). Rows of his body down to his belly; his eye and legs are added
// per pose: M is his muzzle, P his pink cheek, Q his lip and toes, U his belly, K his mouth and nostril, R inside his ears.
{
  const ROWS = [
    '...BB......BB..........',
    '...RRB.....RRB.........',
    '...BRB.....BRB.........',
    '...LLLLLLLLLLLL........',
    '...LLLLLLLLLLLLB.......',
    '..KLLLLLLLLLLLBB.......',
    '.LLKLLLLLLLLLLBS.......',
    'BBBBBBLLLLLLLLBSBLLL...',
    'BBBBBBBBLLLLLBBSBBBBL..',
    'MMMMMMMBBPPPPPBSBBBBBB.',
    'MMMMMMMMBPPPPPPSBBBBBBB',
    'MMMMMMMMBPPPPPPSBBBBBBB',
    'KKKKKKKKKPPPPDPBBBBBBBB',
    '.QQQQQQQPPPDDPPBBBBBBBB',
    '..QQQPPPDDDPPPPBBBBBBBS',
    '....PDDDPPPPPPBBBBBBBBS',
    '.....PPPPPPPPPBBBBBBBBS',
    '.....PPPPPPPBBBBBBBBBBS',
    '.....BBPPPBBBBUUUUBBBSS',
    '.....BBBBBBBBUUUUUUBBS.',
  ]
  const COLORS = ['#585566', '#726F82', '#433F4F', '#0F0B12'] // BODY, TOP (the top of his head and back), SIDE (his shade), EYE
  const LINE = '#17121B', GLINT = '#FFFFFF'
  const INK = {B: COLORS[0], L: COLORS[1], S: COLORS[2], M: '#B68797', P: '#E2A4B2', Q: '#EBB0BB', U: '#8A7C92', D: '#C98394', K: LINE, R: '#E2A4B2'}
  const LEGS = [[15, INK.B, INK.Q], [21, INK.B, INK.Q], [25, INK.S, INK.S], [29, INK.B, INK.Q]] // each leg's left x, color, toes; front leg first
  // His eye, 3 × 3, as he faces left (mirrored when he faces right): e is the eye color, w its glint, s his shade.
  const OPEN = ['wes', 'eee', 'see'], EYES = {
    blink: ['...', '...', 'eee'],
    happy: ['...', '.e.', 'e.e'],
    sad: ['e..', 'ee.', 'eee'],
    angry: ['..e', '.ee', 'eee'],
    strain: ['ee.', '..e', 'ee.'],
    dizzy: ['e.e', '.e.', 'e.e'],
  }
  // His front leg off the ground, outlined on its own so it reads in front of his face: [left x, top y, art], with Q his
  // toes. Pushed out low (a hand or a jab), up (a wave), high.
  const PAW = {
    1: [11, 34, ['QBBBBBB', 'QBBBBBB', 'QBBB...']],
    2: [9, 29, ['QQ......', 'QBBB....', 'QBBBB...', '.BBBBB..', '..BBBBB.', '...BBBBB', '....BBBB']],
    3: [8, 25, ['QQ.......', 'QBBB.....', 'QBBBB....', '.BBBBB...', '..BBBBB..', '...BBBBB.', '....BBBBB', '.....BBBB', '.....BBBB', '......BBB']],
  }
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  console.assert(ROWS.every(r => r.length === 23), 'Hippo: every row is 23 wide')

  SKINS.hippo = {
    name: 'Hippo', colors: COLORS, sideOn: true,
    /** Hippo in a pose: squashed or stretched through the middle, legs stepping or tucked, a front foot up instead of a hand, outlined, then his eye. */
    draw(pose, eyeColor){
      const rows = ROWS.slice(), sq = pose.squash || 0, st = pose.stretch || 0
      rows.splice(16, sq); for (let i = 0; i < st; i++) rows.splice(16, 0, rows[16]) // shorter or taller through the throat, so his face keeps its shape
      const dy = pose.dy || 0, top = 36 - rows.length + dy, px = new Map() // his legs stand on rows 36 to 38
      const put = (x, y, c) => px.set(x + ',' + y, [x, y, c]) // drawn as he faces left; a later pixel covers an earlier one
      const art = (x0, y0, a, ink) => a.forEach((r, j) => [...r].forEach((ch, i) => { if (ink(ch)) put(x0 + i, y0 + j, ink(ch)) }))
      art(10, top, rows, ch => INK[ch])
      const arms = pose.arms || [], paw = pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : arms.includes('up') ? 2 : 0
      LEGS.forEach(([x, c, toe], n) => {
        if (n === 0 && paw) return
        const up = pose.lift?.includes(n) || pose.tapLeg === n, h = pose.tuck ? 1 : up ? 2 : 3 // a lifted leg reaches forward
        for (let j = 0; j < h; j++) for (let i = 0; i < 3; i++) put(x + i - (up ? 1 : 0), 36 + j + dy, j === h - 1 ? toe : c)
      })
      for (const [x, y] of [...px.values()]) for (const [ax, ay] of N4) if (!px.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
      if (paw) {
        const [x0, y0, a] = PAW[paw], limb = new Map()
        a.forEach((r, j) => [...r].forEach((ch, i) => { if (INK[ch]) limb.set(x0 + i + ',' + (y0 + j + dy), [x0 + i, y0 + j + dy, INK[ch]]) }))
        for (const [x, y] of limb.values()) for (const [ax, ay] of N4) if (!limb.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
        for (const [x, y, c] of limb.values()) put(x, y, c)
      }
      // His eye, round with a glint: it looks about with the same keys as Clawd's (screen directions), and keeps his expressions.
      const right = pose.face > 0, kind = pose.eyes || 'open'
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      const look = EYES[kind] ? [0, 0] : [right ? -lx : lx, ly]
      art(18 + look[0], top + 5 + look[1], EYES[kind] || OPEN, ch => ({e: eyeColor, w: GLINT, s: INK.S})[ch])
      const out = [...px.values()].map(([x, y, c]) => [right ? GW - 1 - x : x, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
}
