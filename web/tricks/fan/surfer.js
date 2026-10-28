// Fan pack: the Silver Surfer, after Marvel's comics. Fan-made, unofficial, not affiliated with its rights holders.
// Power cosmic twinkles up and he turns to chrome; his board appears, he hops on and glides across your screen with a
// trail streaming behind; then he kicks the board up into his hand and the shine fades.
{
  const {GW, GH, BODY, TOP, SIDE, EYE, mix} = hangabout
  const CHROME = {[BODY]: '#C3CCD6', [TOP]: '#EEF3F8', [SIDE]: '#8793A1', [EYE]: '#3B4654'}
  const ON = {cosmic: 1, chrome: 1, board: 1}

  hangabout.trick({
    name: 'surfer', label: 'Silver Surfer 🏄', rarity: 'rare', pack: 'fan', on: {windowSurf: 1}, // you drag his window fast
    frames: [
      [{eyes: 'up', surfer: {cosmic: .5, chrome: .3}}, 260],
      [{eyes: 'up', surfer: {cosmic: 1, chrome: .7}}, 200],
      [{surfer: {cosmic: 1, chrome: 1, board: .5}}, 180],
      [{surfer: ON}, 220],
      [{squash: 2, surfer: ON}, 140],
      [{dy: -6, tuck: 1, arms: ['up', 'up'], surfer: ON}, 120], // hops on
      ...[...Array(12)].map((_, i) => [{dy: i % 2 ? -5 : -4, arms: ['mid', 'mid'], swing: 1, glide: 150, surfer: {...ON, ride: 1, bob: i % 2 ? -1 : 0}}, 220]),
      [{squash: 1, surfer: {cosmic: 1, chrome: 1, board: 'up'}}, 240], // kicks it up into his hand
      [{arms: ['up', 'mid'], eyes: 'happy', surfer: {cosmic: .6, chrome: .6}}, 240],
      [{eyes: 'happy', surfer: {cosmic: .3, chrome: .3}}, 200],
      [{}, 200],
    ],
    /** Chrome all over, with a glint sweeping across him (never his eyes) once he's fully silver. */
    pixels({d: s, px, now}){
      if (!s.chrome) return px
      const band = Math.floor(now / 40) % 60, shine = s.chrome >= 1
      return px.map(([x, y, c]) => [x, y, shine && c !== EYE && ((x + y - band) % 60 + 60) % 60 < 3 ? '#FFFFFF' : CHROME[c] ? mix(c, CHROME[c], s.chrome) : c])
    },
    /** Behind him: afterimages and a streaming trail of power cosmic while he rides, and the board under his feet. */
    behind({ctx, d: s, px, now, pose}){
      const dir = pose.face || 1, by = 36 + (s.bob || 0)
      if (s.ride) {
        ctx.fillStyle = '#9FD3FF'
        for (const [k, a] of [[1, .2], [2, .08]]) { ctx.globalAlpha = a; for (const [x, y] of px) ctx.fillRect(x - dir * 4 * k, y, 1, 1) }
        for (let i = 0; i < 14; i++) {
          ctx.globalAlpha = .9 * (1 - i / 14); ctx.fillStyle = i % 3 ? '#BFE6FF' : '#FFFFFF'
          ctx.fillRect(dir > 0 ? 7 - i : 36 + i, by + (i * 7 + Math.floor(now / 60)) % 3, 1, 1)
        }
        ctx.globalAlpha = 1
      }
      if (s.board === 'up') { // kicked up into his hand, standing on its tail beside him
        const bx = dir > 0 ? 38 : 4
        ctx.fillStyle = '#7D8896'; ctx.fillRect(bx, 14, 2, 26)
        ctx.fillStyle = '#E8EEF5'; ctx.fillRect(bx, 14, 1, 26)
      } else if (s.board) { // long and slim, its nose turned up at the front, a glint running along it
        const x0 = 8, x1 = 36
        ctx.globalAlpha = s.board
        ctx.fillStyle = '#E8EEF5'; ctx.fillRect(x0, by, x1 - x0, 1)
        ctx.fillStyle = '#B8C2CE'; ctx.fillRect(x0 - 1, by + 1, x1 - x0 + 2, 1)
        ctx.fillStyle = '#7D8896'; ctx.fillRect(x0 + 1, by + 2, x1 - x0 - 2, 1)
        ctx.fillStyle = '#E8EEF5'
        for (const k of [1, 2]) ctx.fillRect(dir > 0 ? x1 - 1 + k : x0 - k, by - k + 1, 1, 1)
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x0 + Math.floor(now / 50) % (x1 - x0 - 2), by, 2, 1)
        ctx.globalAlpha = 1
      }
    },
    /** In front: power cosmic twinkling all around him. */
    front({ctx, d: s, now}){
      if (!s.cosmic) return
      for (let i = 0; i < 10; i++) {
        const seed = Math.floor(now / 130) + i * 17
        ctx.globalAlpha = s.cosmic * (.4 + .15 * (seed % 5)); ctx.fillStyle = i % 2 ? '#FFFFFF' : '#9FD3FF'
        ctx.fillRect((seed * 37) % GW, (seed * 23 + i * 11) % (GH - 4), 1, 1)
      }
      ctx.globalAlpha = 1
    },
    glow: s => s.ride ? ' drop-shadow(0 0 3px rgba(150,210,255,.7))' : '',
  })
}
