// Fan pack: Guardian down, after Destiny. Fan-made, unofficial, not affiliated with its rights holders.
// He takes a hit and keels over onto his back, grey and still; his Ghost transmats in and circles him, notices him, gives
// a little wiggle and scans him back and forth with a beam of light; he's revived in a flash, the Light rising off him,
// and the Ghost transmats away.
{
  const {GH, BODY, TOP, SIDE, recolor, paint} = hangabout
  const DEAD = {[BODY]: '#8A8A8A', [TOP]: '#A8A8A8', [SIDE]: '#6C6C6C'}, HURT = {[BODY]: '#FF6A6A', [TOP]: '#FF9C9C', [SIDE]: '#C83C3C'}
  const LIT = {[BODY]: '#FFFFFF', [TOP]: '#FFFFFF', [SIDE]: '#FFFFFF'}
  const SHELL = ['..X.X..', '.XXXXX.', 'XXGEGXX', '.XEWEX.', 'XXGEGXX', '.XXXXX.', '..X.X..'] // spiky shell, glowing eye
  const SHELL_INK = {X: '#E4E7EE', G: '#3A3F4D', E: '#6FE3FF', W: '#FFFFFF'}
  const BANG = ['#', '#', '#', '.', '#']
  const DOWN = {squash: 2, eyes: 'dizzy'}, UP = [29, 3] // where his Ghost waits while he gets up
  const R = Math.round
  // A frame of him lying on his back with his Ghost out at `at`.
  const lying = (ghost, ms, pose = DOWN) => [{...pose, ghost: {dead: 1, down: 1, shell: 1, ...ghost}}, ms]
  const orbit = Array.from({length: 29}, (_, i) => { const a = i / 22.4 * 2 * Math.PI; return [R(18 + 15 * Math.cos(a)), R(14 - 8 * Math.sin(a))] }) // 1¼ laps round him, ending above him
  const scan = Array.from({length: 29}, (_, i) => lying({at: [R(18 + 10 * Math.sin(i / 14 * 2 * Math.PI)), 6], look: 1, scan: 1}, 55)) // twice back and forth over him

  hangabout.trick({
    name: 'ghost', label: 'Ghost revive ✦', rarity: 'rare', pack: 'fan', on: {bigDrop: 1}, // dropped from way up
    frames: [
      [{squash: 1, eyes: 'strain', ghost: {hit: 1}}, 120],
      [{...DOWN, tilt: -12, ghost: {dead: .4}}, 140], // keels over
      [{...DOWN, tilt: -70, ghost: {dead: .7}}, 80],
      [{...DOWN, tilt: -130, ghost: {dead: .9}}, 80],
      lying({shell: 0}, 450),
      lying({shell: 0}, 90, {...DOWN, lift: [2]}), // a last twitch
      lying({shell: 0}, 300),
      lying({at: orbit[0], shell: .4, vanish: 1}, 120), // his Ghost transmats in
      lying({at: orbit[0]}, 300),
      ...orbit.map(at => lying({at}, 60)),
      lying({at: [18, 6], look: 1, bang: 1}, 380), // there you are
      ...[1, -1, 1, -1, 0].map(dx => lying({at: [18 + dx, 6], look: 1}, 70)),
      ...scan,
      lying({at: [23, 4]}, 70),
      lying({at: UP}, 70),
      lying({at: UP, dead: 0, flash: 1}, 90),
      [{stretch: 2, dy: -2, arms: ['up', 'up'], ghost: {flash: 1, shell: 1}}, 120], // revived
      [{stretch: 1, dy: -3, arms: ['up', 'up'], eyes: 'happy', ghost: {shell: 1, light: 1}}, 320],
      [{squash: 1, arms: ['up', 'up'], eyes: 'happy', ghost: {shell: .5, light: .6}}, 220],
      [{eyes: 'happy', ghost: {vanish: 1, light: .3}}, 220],
      [{}, 200],
    ],
    pixels({d: g, px}){
      if (g.dead) px = recolor(px, DEAD, g.dead)
      if (g.hit) px = recolor(px, HURT, 1)
      if (g.flash) px = recolor(px, LIT, 1)
      if (g.down) { const top = Math.min(...px.map(p => p[1])); px = px.map(([x, y, c]) => [x, top + GH - 1 - y, c]) } // on his back, legs in the air
      return px
    },
    /** His Ghost bobbing where it is, the scan beam it sweeps over him, and the Light rising off him as he comes back. */
    front({ctx, d: g, now}){
      const [gx, gy] = [(g.at || UP)[0], (g.at || UP)[1] + Math.floor(now / 260) % 2]
      if (g.scan) { // widening down over him, a bright line running down it
        const sweep = gy + 8 + Math.floor(now / 45) % (GH - gy - 9)
        for (let y = gy + 7; y < GH; y++) {
          const half = R((y - gy - 6) * .3)
          ctx.globalAlpha = y === sweep ? .75 : .26; ctx.fillStyle = '#7FE6FF'
          ctx.fillRect(gx + 3 - half, y, half * 2 + 1, 1)
        }
      }
      if (g.shell) {
        ctx.globalAlpha = g.shell
        paint(ctx, SHELL, gx, gy, SHELL_INK)
        ctx.fillStyle = '#A6ACBA' // a little shading on the shell's spikes
        SHELL.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'X' && (i + j) % 3 === 0) ctx.fillRect(gx + i, gy + j, 1, 1) }))
        if (g.look) { ctx.fillStyle = SHELL_INK.E; ctx.fillRect(gx + 3, gy + 3, 1, 1); ctx.fillStyle = SHELL_INK.W; ctx.fillRect(gx + 3, gy + 4, 1, 1) } // eye turned down at him
      }
      ctx.globalAlpha = 1
      if (g.bang) paint(ctx, BANG, gx + 3, gy - 6, {'#': '#FFD84D'})
      if (g.vanish) { ctx.fillStyle = '#BFF4FF'; for (const [a, b] of [[0, 0], [6, 1], [3, -2], [1, 5], [5, 6]]) ctx.fillRect(gx + a, gy + b, 1, 1) } // transmats in or out
      if (g.light) for (let i = 0; i < 8; i++) {
        const age = (now / 6 + i * 37) % 30
        ctx.globalAlpha = g.light * (1 - age / 30); ctx.fillStyle = i % 2 ? '#FFFFFF' : '#FFE9A8'
        ctx.fillRect(6 + (i * 5) % 32, GH - 6 - R(age), 1, 1)
      }
      ctx.globalAlpha = 1
    },
    glow: g => g.scan ? ' drop-shadow(0 0 3px rgba(120,230,255,.6))' : '',
  })
}
