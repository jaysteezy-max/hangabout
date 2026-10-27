// Fan pack: Guardian down, after Destiny. Fan-made, unofficial, not affiliated with its rights holders.
// He takes a hit and collapses, grey and still; his Ghost pops out over his shoulder and scans him with a beam of light;
// he's revived in a flash, the Light rising off him, and the Ghost transmats away.
{
  const {GH, BODY, TOP, SIDE, recolor, paint} = hookpet
  const DEAD = {[BODY]: '#8A8A8A', [TOP]: '#A8A8A8', [SIDE]: '#6C6C6C'}, HURT = {[BODY]: '#FF6A6A', [TOP]: '#FF9C9C', [SIDE]: '#C83C3C'}
  const LIT = {[BODY]: '#FFFFFF', [TOP]: '#FFFFFF', [SIDE]: '#FFFFFF'}
  const SHELL = ['..X.X..', '.XXXXX.', 'XXGEGXX', '.XEWEX.', 'XXGEGXX', '.XXXXX.', '..X.X..'] // spiky shell, glowing eye
  const SHELL_INK = {X: '#E4E7EE', G: '#3A3F4D', E: '#6FE3FF', W: '#FFFFFF'}
  const DOWN = {squash: 2, eyes: 'dizzy'}

  hookpet.trick({
    name: 'ghost', label: 'Ghost revive ✦', rarity: 'rare', pack: 'fan',
    frames: [
      [{squash: 1, eyes: 'strain', ghost: {hit: 1}}, 120],
      [{...DOWN, tilt: -10, ghost: {dead: .5}}, 160],
      [{...DOWN, tilt: 6, ghost: {dead: 1}}, 140],
      [{...DOWN, ghost: {dead: 1}}, 800],
      [{...DOWN, ghost: {dead: 1, shell: .4}}, 120], // his Ghost pops out
      [{...DOWN, ghost: {dead: 1, shell: 1}}, 500],
      [{...DOWN, ghost: {dead: 1, shell: 1, scan: 1}}, 1400],
      [{stretch: 2, dy: -2, arms: ['up', 'up'], ghost: {flash: 1, shell: 1}}, 120], // revived
      [{stretch: 1, dy: -3, arms: ['up', 'up'], eyes: 'happy', ghost: {shell: 1, light: 1}}, 320],
      [{squash: 1, arms: ['up', 'up'], eyes: 'happy', ghost: {shell: .5, light: .6}}, 220],
      [{eyes: 'happy', ghost: {vanish: 1, light: .3}}, 220],
      [{}, 200],
    ],
    pixels({d: g, px}){
      if (g.dead) px = recolor(px, DEAD, g.dead)
      if (g.hit) px = recolor(px, HURT, 1)
      return g.flash ? recolor(px, LIT, 1) : px
    },
    /** His Ghost bobbing over his shoulder, the scan beam it sweeps over him, and the Light rising off him as he comes back. */
    front({ctx, d: g, now}){
      const gx = 28, gy = 6 + Math.floor(now / 260) % 2
      if (g.scan) { // widening down toward him, a bright line running through it
        const sweep = gy + 8 + Math.floor(now / 45) % (GH - gy - 10)
        for (let y = gy + 7; y < GH - 1; y++) {
          const half = Math.round((y - gy - 6) * .45), cx = Math.round(gx + 3 - (y - gy - 7) * .36)
          ctx.globalAlpha = y === sweep ? .75 : .26; ctx.fillStyle = '#7FE6FF'
          ctx.fillRect(cx - half, y, half * 2 + 1, 1)
        }
      }
      if (g.shell) {
        ctx.globalAlpha = g.shell
        paint(ctx, SHELL, gx, gy, SHELL_INK)
        ctx.fillStyle = '#A6ACBA' // a little shading on the shell's spikes
        SHELL.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'X' && (i + j) % 3 === 0) ctx.fillRect(gx + i, gy + j, 1, 1) }))
      }
      ctx.globalAlpha = 1
      if (g.vanish) { ctx.fillStyle = '#BFF4FF'; for (const [a, b] of [[0, 0], [6, 1], [3, -2], [1, 5], [5, 6]]) ctx.fillRect(gx + a, gy + b, 1, 1) } // transmats out
      if (g.light) for (let i = 0; i < 8; i++) {
        const age = (now / 6 + i * 37) % 30
        ctx.globalAlpha = g.light * (1 - age / 30); ctx.fillStyle = i % 2 ? '#FFFFFF' : '#FFE9A8'
        ctx.fillRect(6 + (i * 5) % 32, GH - 6 - Math.round(age), 1, 1)
      }
      ctx.globalAlpha = 1
    },
    glow: g => g.scan ? ' drop-shadow(0 0 3px rgba(120,230,255,.6))' : '',
  })
}
