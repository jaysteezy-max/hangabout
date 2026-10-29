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
    '......GLLLLLLBBBBB........',
    '.....GGGLLLLBBBBBBB.......',
    '....FGGGGBBBBBBBBBBBB.....',
    '...FFGGGGGBBBBBBBBBBBB....',
    '...KFKFFFFFBBBBBBBBBBB....',
    '...FKFFFFFFBBBBBBBBBBBB...',
    '...FKFFFFFFBBBBBBBBBBBB...',
    '...FKFFFFFFBBBBBBBBBBBB...',
    '...FKFFFFFFBBBBBBBBBBBB...',
    '...FKFFFFFFBBBBBBBBBBBB...',
    '......FFFFFBBBBBBBBBBBB...',
    '..........BBBBBBBBBBBBS...',
    '........SBBBBBBBBBBBBBS...',
    '........BBBBBBBBBBBBBS....',
    '........BBBBBBBBBBSSS.....',
  ]
  const COLORS = ['#C27A55', '#C9825C', '#8D4241', '#0E0809'] // BODY, TOP (the top of his head), SIDE (his inner ear and haunch), EYE
  const LINE = '#1C1214', FOOT = '#7A3A3E', LID = '#5A322C'
  const INK = {B: COLORS[0], L: COLORS[1], S: COLORS[2], F: '#86655F', G: '#8F6F69', K: LINE, P: FOOT}
  const FEET = [17, 20, 25, 27] // each foot's left x: his front pair, then his hind pair under his haunch
  // His front leg off the ground, drawn over him with an outline of its own: [left x, top y, rows], P his toes. Reaching
  // out low (a jab reaches further, its leg longer behind his toes), up to his chin, and high in front of his face, from his chest.
  const PAW = {
    1: [12, 35, ['.PBBB', 'PPBBB']],
    2: [11, 32, ['.PP...', 'PBBB..', 'PBBBB.', '.BBBBB']],
    3: [8, 26, ['.PP....', 'PBBB...', 'PBBBB..', '.BBBB..', '..BBBB.', '...BBBB', '....BBB', '.....BBB', '......BBB', '.......BB']],
  }
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const settled = pose => pose.tuck && !(pose.dy < 0) ? 1 : 0 // feet tucked on the ground, his loaf rests on the floor (in the air it doesn't)
  console.assert(ROWS.every(r => r.length === 26), 'Cappy: every row is 26 wide')

  SKINS.cappy = {
    name: 'Cappy', colors: COLORS, sideOn: true,
    /** Where costumes find his face, as drawn facing left: his eye (x, y: its left pixel), the top of his head between his ears, and the front of his snout. */
    head(pose){
      const top = 38 - ROWS.length + (pose.squash || 0) - (pose.stretch || 0) + (pose.dy || 0) + settled(pose) // as draw() works it out
      return {x: 20, y: top + 5, top: top + 2, nose: 12}
    },
    /** Cappy in a pose: squashed or stretched through the middle, feet stepping or tucked, a front paw up instead of a hand, outlined, then his eye. */
    draw(pose, eyeColor){
      const rows = ROWS.slice(), sq = pose.squash || 0, st = pose.stretch || 0
      rows.splice(10, sq); for (let i = 0; i < st; i++) rows.splice(rows.length - 2, 0, rows[rows.length - 2]) // a shorter snout, or taller on his legs, so his face keeps its shape
      const dy = (pose.dy || 0) + settled(pose), top = 38 - rows.length + dy, px = [], seen = new Set() // his feet are on row 38
      const put = (x, y, c) => { px.push([x, y, c]); seen.add(x + ',' + y) }
      rows.forEach((r, j) => [...r].forEach((ch, i) => { if (INK[ch]) put(9 + i, top + j, INK[ch]) }))
      const arms = pose.arms || [], paw = pose.hand <= 4 ? 2 : pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : arms.includes('up') ? 2 : 0
      FEET.forEach((x, n) => {
        if (!(n === 0 && paw) && !pose.tuck && !pose.lift?.includes(n) && pose.tapLeg !== n) { put(x, 38 + dy, FOOT); put(x + 1, 38 + dy, FOOT) }
      })
      for (const [x, y] of px.slice()) for (const [ax, ay] of N4) if (!seen.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
      if (paw) {
        const r = paw === 1 ? Math.min(3, pose.reach || 0) : 0, [x0, y0, art] = PAW[paw], limb = [], at = paw === 1 ? dy : top - 20 // a raised paw keeps to his face
        art.forEach((row, j) => [...row.slice(0, 2) + 'B'.repeat(r) + row.slice(2)].forEach((ch, i) => { if (INK[ch]) limb.push([x0 - r + i, y0 + j + at, INK[ch]]) }))
        const mine = new Set(limb.map(([x, y]) => x + ',' + y))
        for (const [x, y] of limb) for (const [ax, ay] of N4) if (!mine.has(x + ax + ',' + (y + ay))) px.push([x + ax, y + ay, LINE])
        px.push(...limb)
      }
      const right = pose.face > 0, out = right ? px.map(([x, y, c]) => [GW - 1 - x, y, c]) : px
      // His eye, a dash: it looks about with the same keys as Clawd's (screen directions), and keeps his expressions.
      const kind = pose.eyes || 'open', ex = right ? 22 : 20, ey = top + 5
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      const eye = (pts, c = eyeColor) => { for (const [x, y] of pts) out.push([ex + x, ey + y, c]) }
      if (kind === 'blink') eye([[0, 0], [1, 0]], LID)
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
