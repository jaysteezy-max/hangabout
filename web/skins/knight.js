// Blue Knight: fan art of the Blue Knight from Castle Crashers, a game by The Behemoth. Fan-made and unofficial, not
// affiliated with or endorsed by The Behemoth. Drawn three-quarters from the game's art: his tall helmet with its white
// faceplate, his gauntlets free at his sides, his sheathed sword and shield on his back.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). He's laid out facing right from x 0 and stands X further in;
// facing left is the mirror image. Turned right, his right side is toward you: his near arm is on your left.
{
  const COLORS = ['#669AF7', '#9AC0F9', '#3F6FD6', '#101010'] // BODY (his helmet), TOP (its lit edge), SIDE (its shade), EYE
  const [B, L, D] = COLORS, LINE = '#000000', TEAR = '#7FC4FF'
  const INK = {B, L, D, w: '#FFFFFF', s: '#D9DEEA', c: '#A9B4C8',
    a: '#333333', A: '#666666', k: '#424242', t: '#575757', // armor, its highlight, boots, toes
    p: '#322C3B', P: '#63566E', y: '#8E7FA0'} // his scabbard, its hilt, a glint on the pommel
  // His helmet, rows 7 to 28 from x 8: w its white faceplate (a band down the middle with a V cut into its top, widening
  // across his face, pointed at his chin), c the ridge across the band, D the ridge and shade on the blue.
  const HELMET = [
    '..LLLLLwBBBBBw',
    '.LBBBBBwwBBBwwB',
    'LBBBBBBwwwBwwwBD',
    'LBBBBBBwwwwwwwBD',
    'LBBBBBBwwwwwwwBD',
    'LBBBBBBwwwwwwwBD',
    'LBBBBBBwwwwwwwBD',
    'LBBBBBBwwwwwwwBD',
    'LBBBBBBwwwcwwwBD',
    'LBBBBBBwwcwcwwBD',
    'LBBBBBBwcwwwcwBD',
    'LBBBBBBcwwwwwcBD',
    'LBBBBBDwwwwwwwDD',
    'LBBBBDBwwwwwwwBD',
    'BBwwwwwwwwwwwwww',
    'BBwwwwwwwwwwwwww',
    'BBwwwwwwwwwwwwww',
    'BBswwwwwwwwwwwww',
    'BBBBswwwwwwwwwwB',
    '..DDDDDwwwwwwBB',
    '......DDDwwwBB',
    '.........DwB',
  ]
  const KNOB = ['LB', 'BB', 'BD'] // the round knob on the side of his helmet, from x 5, row 21
  // His body from x 10, row 28: a blue collar round his chin, a white tunic with a blue cross, a blue belt, its hem.
  const TORSO = ['BBBBBBBBBBB', 'DBBBBBBBBBD', 'wwwwwwBwwww', 'wwwwwBBBwww', 'wwwwwwBwwww', 'BBBBBBBBBBB', '.wwwwwwwww.']
  // His near arm (in front of him) has the wider pauldron and the bigger mitt; the far one is half hidden behind him.
  // A pauldron is a flat dome with a plate across it; a fist has a row of black knuckles and a thumb.
  const PAULDRON = [['.AAAAA.', 'AaaaaaA', 'AAAAAAA', 'aaaaaaa'], ['.AAA.', 'Aaaaa', 'AAAAa']]
  const FIST = [['.AAaa.', 'Aaaaaa', 'a####a', 'aaaaaA', '.aaaa.'], ['.Aaa.', 'Aaaaa', 'a###a', '.aaa.']]
  const SHIELD = ['BBBBD', 'BLLLD', ...Array(8).fill('BLBLD'), 'BLLLD', 'BBBBD'] // on his back, tall and narrow, from x -1, row 24
  const HILT = ['pp.', 'yp.', '.P.', '..P', 'PPP'] // his sheathed sword's hilt, angled out of the top of the shield, from x -1, row 19
  // His eyes, as dots from the top-left of each (the near one at x 12, the far one at x 20, row 22). Bored is his normal
  // face: heavy lids, the inner end of each a step lower.
  const EYES = {
    open: [[[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2]], [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2]]],
    blink: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[0, 1], [1, 1], [2, 1]]],
    happy: [[[0, 2], [1, 1], [2, 1], [3, 2]], [[0, 2], [1, 1], [2, 2]]],
    sad: [[[0, 1], [1, 1], [2, 0], [3, 0]], [[0, 0], [1, 1], [2, 1]]],
    angry: [[[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2], [3, 2]], [[2, 0], [1, 1], [2, 1], [0, 1], [0, 2], [1, 2]]],
    dizzy: [[[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]]],
  }
  const SHOCKED = [['####', '#ww#', '#we#', '####'], ['###', '#w#', '#e#', '###']] // strain: big round eyes, wide open
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]], X = 5
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const lift = pose => { // how far his upper body moves: hops, crouches and stretches, his helmet never above row 1
    const sq = pose.squash || 0, st = pose.stretch || 0
    return Math.max(pose.dy || 0, st - sq - 6) + sq - st
  }
  console.assert(HELMET.length === 22, 'Blue Knight: his helmet is rows 7 to 28')

  SKINS.knight = {
    name: 'Blue Knight', label: 'Blue Knight (fan art)', colors: COLORS, sideOn: true, pack: 'fan',
    /** Where costumes find his face, as drawn facing left: his near eye, the top of his helmet, the front of his faceplate. */
    head(pose){
      const y0 = lift(pose)
      return {x: GW - 1 - X - 13, y: 22 + y0, top: 7 + y0, nose: GW - 1 - X - 23}
    },
    /** The Blue Knight in a pose: legs stepping, tucked or bent, gauntlets at his sides or raised, then his face. */
    draw(pose, eyeColor){
      const m = new Map(), put = (x, y, c) => m.set(x + ',' + y, [x, y, c])
      const cells = (rows, x0, y0) => rows.flatMap((r, j) => [...r].flatMap((ch, i) => ch === '#' ? [[x0 + i, y0 + j, LINE]] : ch === 'e' ? [[x0 + i, y0 + j, eyeColor]] : INK[ch] ? [[x0 + i, y0 + j, INK[ch]]] : []))
      const under = pts => { // a part tucked under what's drawn: it takes their outline's place, outlined only where nothing is
        for (const p of pts) put(...p)
        for (const [x, y] of pts) for (const [ax, ay] of N4) if (!m.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
      }
      const over = pts => { // a part in front of what's drawn, with its own outline
        const mine = new Set(pts.map(([x, y]) => x + ',' + y))
        for (const [x, y] of pts) for (const [ax, ay] of N4) if (!mine.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
        for (const p of pts) put(...p)
      }
      const right = pose.face > 0, y0 = lift(pose), dy = y0 - (pose.squash || 0) + (pose.stretch || 0) // dy as clamped
      const arms = pose.arms || [], [near, far] = right ? arms : [arms[1], arms[0]] // arms are [screen left, screen right]
      const crossed = near === 'cross' || far === 'cross', swing = pose.swing || 0
      const hip = 35 + y0, ground = 38 + dy, lifted = pose.lift || []
      // A gauntlet (n 0 his near arm, 1 his far one) from its pauldron (sx, row 26) to a fist whose top-left is (fx, fy).
      const arm = (n, sx, fx, fy) => {
        fy = clamp(fy, 1, ground - FIST[n].length) // a fist stays in the grid and off the ground
        const pts = cells(PAULDRON[n], sx, 26 + y0), from = [sx + 2 - n, 29 + y0], to = [fx + 1, fy + 1]
        for (let i = 0, k = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])); i <= k; i++) {
          const x = Math.round(from[0] + (to[0] - from[0]) * i / (k || 1)), y = Math.round(from[1] + (to[1] - from[1]) * i / (k || 1))
          pts.push([x, y, INK.a], [x + 1, y, INK.a], [x + 2, y, INK.a])
        }
        over([...pts, ...cells(FIST[n], fx, fy)])
      }
      // His far arm, behind him: at his side (swinging as he walks), up beside his helmet, or out in front (hand, reach).
      const farArm = () => {
        if (pose.hand != null || pose.reach) arm(1, 20, 24 + (pose.reach || 0), clamp(21 + (pose.hand ?? 8), 18, 33) + y0)
        else if (far === 'up') arm(1, 20, 23, 21 + y0)
        else if (far === 'high') arm(1, 20, 24, 8 + y0)
        else if (!crossed) arm(1, 20, 21 + swing, 32 + y0)
      }
      // His near arm, in front of him: at his side, raised to his chin (up) or beside his helmet (high), or folded.
      const nearArm = () => {
        if (near === 'up') arm(0, 4, 12, 26 + y0) // under his chin, clear of his eyes
        else if (near === 'high') arm(0, 4, 1, 8 + y0)
        else if (crossed) { over(cells(PAULDRON[0], 4, 26 + y0)); over(cells(['AAAAAAAAAAA', 'aaaaaaaaaaa'], 8, 31 + y0)); over(cells(FIST[0], 16, 30 + y0)) }
        else arm(0, 4, 3 - swing, 31 + y0)
      }

      over(cells(HILT, -1, 19 + y0)); over(cells(SHIELD, -1, 24 + y0))
      farArm()
      over(cells(TORSO, 10, 28 + y0))
      // Two legs, short, under his hem down to his boots: lifted, a boot comes up and steps forward; tucked, both come up
      // under him. Of a stride's pairs the first index lifts: even his near leg, odd his far one.
      const step = lifted.length ? lifted[0] % 2 : pose.tapLeg != null ? pose.tapLeg % 2 : -1
      for (const n of [0, 1]) {
        const up = pose.tuck ? ground - hip - 1 : step === n ? (lifted.length ? 2 : 1) : 0, x = n ? 16 : 12, fwd = step === n && lifted.length ? 1 : 0
        const leg = []
        for (let y = hip; y < ground - 1 - up; y++) leg.push([x + fwd, y, INK.a], [x + 1 + fwd, y, y === hip ? INK.A : INK.a], [x + 2 + fwd, y, INK.a])
        under([...leg, ...cells(['AAk', 'kkt'], x + fwd, ground - 1 - up)])
      }
      over(cells(HELMET, 8, 7 + y0)); over(cells(KNOB, 5, 21 + y0))
      for (const y of [20, 21, 22]) put(18, y + y0, LINE) // the slit between his eyes
      nearArm()

      // His face, in screen directions: his eyes look about with the same keys as Clawd's and keep his expressions.
      const kind = pose.eyes || 'open', ey = 22 + y0
      const lx = clamp(kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0, -1, 1) * (right ? 1 : -1)
      const ly = kind === 'up' ? -1 : kind === 'down' ? 1 : clamp(pose.lookY || 0, -1, 1)
      if (kind === 'strain') { for (const p of cells(SHOCKED[0], 12, ey - 1)) put(...p); for (const p of cells(SHOCKED[1], 20, ey - 1)) put(...p) }
      else {
        const [a, b] = EYES[kind] || EYES.open, [ox, oy] = EYES[kind] && kind !== 'open' ? [0, 0] : [lx, ly]
        for (const [x, y] of a) put(12 + ox + x, ey + oy + y, eyeColor)
        for (const [x, y] of b) put(20 + ox + x, ey + oy + y, eyeColor)
      }
      if (kind === 'sad') { put(17, 25 + y0, LINE); put(18, 25 + y0, LINE); put(12, 24 + y0, TEAR); put(12, 25 + y0, TEAR) } // mouth open, a tear

      const out = [...m.values()].map(([x, y, c]) => [right ? x + X : GW - 1 - x - X, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
  console.assert(SKINS.knight.draw({face: 1, dy: -8, stretch: 2, arms: ['high', 'high']}, COLORS[3]).every(([, y]) => y >= 0), 'Blue Knight: he stays in the grid on his highest hop')
}
