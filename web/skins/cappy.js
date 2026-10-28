// Cappy: the default pet. A capybara loaf drawn side on, facing left (facing right is the mirror image). Original art.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). Rows of his body; his eye and feet are added per pose:
// F is his snout, K the line of his mouth, R inside his ears.
{
  const ROWS = [
    '.........BB....BB.........',
    '.........RB....RB.........',
    '......LLLLLLLLBBBBB.......',
    '.....GLLLLLLLBBBBBBB......',
    '....GGGLLLLLBBBBBBBBB.....',
    '...FGGGGBBBBBBBBBBBBBB....',
    '..FFGGGGGBBBBBBBBBBBBBB...',
    '.FKFFFFFFBBBBBBBBBBBBBBB..',
    '.FFFFFFFFBBBBBBBBBBBBBBB..',
    '.FKFFFFFFBBBBBBBBBBBBBBS..',
    '.FKFFFFFFBBBBBBBBBBBBBBS..',
    '.FKFFFFFFBBBBBBBBBBBBBBS..',
    '.FKFFFFFFBBBBBBBBBBBBBBS..',
    '.FKFFFFFFBBBBBBBBBBBBBBS..',
    '..KFFFFFFBBBBBBBBBBBBBBS..',
    '....FFFFFBBBBBBBBBBBBBBS..',
    '........SBBBBBBBBBBBBBBS..',
    '........SBBBBBBBBBBBBBSS..',
    '........SSBBBBBBBBBBBSS...',
  ]
  const COLORS = ['#C27A55', '#C9825C', '#9C5644', '#0E0809'] // BODY, TOP (the top of his head), SIDE (his shaded rump), EYE
  const LINE = '#1C1214', FOOT = '#7A3A3E'
  const INK = {B: COLORS[0], L: COLORS[1], S: COLORS[2], F: '#86655F', G: '#8F6F69', K: LINE, R: '#8C463E'}
  const FEET = [18, 22, 26, 30] // each foot's left x, front foot first
  const PAW_LIMB = [[16, 36], [15, 36], [15, 35], [14, 35], [14, 34], [13, 34], [13, 33], [12, 33], [12, 32], [11, 32], [11, 31], [10, 31]]
  // His front leg off the ground, from his chest forward: [how much of PAW_LIMB, where his toes are]. Reaching out low, up (a wave), high.
  const PAW = {1: [0, [[16, 37], [15, 37], [14, 37], [13, 37], [12, 37], [12, 36]]], 2: [8, [[12, 32], [11, 32]]], 3: [12, [[9, 30], [10, 30]]]}
  console.assert(ROWS.every(r => r.length === 26), 'Cappy: every row is 26 wide')

  SKINS.cappy = {
    name: 'Cappy', colors: COLORS, sideOn: true,
    /** Cappy in a pose: squashed or stretched through the middle, feet stepping or tucked, a front paw up instead of a hand, outlined, then his eye. */
    draw(pose, eyeColor){
      const rows = ROWS.slice(), sq = pose.squash || 0, st = pose.stretch || 0
      rows.splice(10, sq); for (let i = 0; i < st; i++) rows.splice(10, 0, rows[10]) // shorter or taller through the middle, so his face keeps its shape
      const dy = pose.dy || 0, top = 38 - rows.length + dy, px = [], seen = new Set() // his feet are on row 38
      const put = (x, y, c) => { px.push([x, y, c]); seen.add(x + ',' + y) }
      rows.forEach((r, j) => [...r].forEach((ch, i) => { if (INK[ch]) put(9 + i, top + j, INK[ch]) }))
      const arms = pose.arms || [], paw = pose.hand != null || pose.reach ? 1 : arms.includes('high') ? 3 : arms.includes('up') ? 2 : 0
      FEET.forEach((x, n) => {
        if (n === 0 && paw) { const [reach, toes] = PAW[paw]; for (const [x, y] of PAW_LIMB.slice(0, reach)) put(x, y + dy, INK.B); for (const [x, y] of toes) put(x, y + dy, FOOT) }
        else if (!pose.tuck && !pose.lift?.includes(n) && pose.tapLeg !== n) { put(x, 38 + dy, FOOT); put(x + 1, 38 + dy, FOOT) }
      })
      for (const [x, y] of px.slice()) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!seen.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
      const right = pose.face > 0, out = right ? px.map(([x, y, c]) => [GW - 1 - x, y, c]) : px
      // His eye, a dash: it looks about with the same keys as Clawd's (screen directions), and keeps his expressions.
      const kind = pose.eyes || 'open', ex = right ? 22 : 20, ey = top + 5
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      const eye = (pts, c = eyeColor) => { for (const [x, y] of pts) out.push([ex + x, ey + y, c]) }
      if (kind === 'blink') eye([[0, 0], [1, 0]], INK.S)
      else if (kind === 'happy') eye([[0, 0], [1, -1], [2, 0]])
      else if (kind === 'sad') eye([[0, 1], [1, 1]])
      else if (kind === 'dizzy') eye([[0, -1], [2, -1], [1, 0], [0, 1], [2, 1]])
      else if (kind === 'strain') eye([[0, -1], [1, 0], [0, 1]])
      else if (kind === 'angry') eye([[0, 0], [1, 0], [right ? 0 : 1, -1]])
      else eye([[lx, ly], [lx + 1, ly]])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
}
