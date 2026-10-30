// Fan pack: an Exotic engram, after Destiny. Fan-made, unofficial, not affiliated with its rights holders.
// It drops in on a loot beam; he catches it overhead, it decrypts in rolling gold rings, bursts, and he's holding up
// a Gjallarhorn, glowing; then it goes to his inventory and he hops for joy.
{
  const {GW, GH, BODY, TOP, SIDE, recolor, facing, head} = hangabout
  const CAPPY = hangabout.skin === 'cappy' // no hands to lift it: it lands and sits on his head between his ears, capybara-style
  const LIT = {[BODY]: '#FFFFFF', [TOP]: '#FFFFFF', [SIDE]: '#FFFFFF'}
  const ENGRAM = ['..###..', '.#####.', '###*###', '#######', '###*###', '.#####.', '..###..']
  const HIGH = ['high', 'high']
  const CHICKEN = hangabout.skin === 'chicken' // the engram up in his raised wing, clear of his crest; the gun at his chest in his forward wing

  hangabout.trick({
    name: 'engram', label: 'Exotic engram ◆', rarity: 'rare', pack: 'fan',
    frames: [
      ...[-6, -2, 2, 6].map(y => [{eyes: 'up', engram: {y, beam: 1}}, 150]),
      [{eyes: 'up', arms: HIGH, engram: {y: 9, beam: 1}}, 160],
      [{squash: 1, eyes: 'up', arms: HIGH, engram: {y: 9}}, 160], // caught
      ...[1, 2, 3, 4].map(decrypt => [{arms: HIGH, eyes: 'up', engram: {y: 9, decrypt}}, 150]),
      [{stretch: 1, arms: HIGH, engram: {flash: 1}}, 100],
      [{stretch: 1, dy: -2, arms: HIGH, eyes: 'happy', aura: 1, engram: {gun: 1, sparkle: 1}}, 1400], // Exotic!
      [{arms: HIGH, eyes: 'happy', aura: 1, engram: {gun: 1, sparkle: 1}}, 500],
      [{arms: ['up', 'up'], eyes: 'happy', engram: {gun: .4, sparkle: 1}}, 160], // into his inventory
      [{squash: 2, eyes: 'happy'}, 110], [{dy: -4, tuck: 1, arms: ['up', 'up'], eyes: 'happy'}, 160], [{squash: 1, eyes: 'happy'}, 120], [{}, 200],
    ].map(([p, ms]) => [CHICKEN && p.engram?.gun ? {...p, hand: 10} : CAPPY && p.arms === HIGH ? {...p, arms: ['up', 'up']} : p, ms]), // the chicken's wing on its grip
    pixels: ({d: l, px}) => l.flash ? recolor(px, LIT, 1) : px,
    /** The engram dropping in on its loot beam and decrypting in his hands; then the Exotic, a Gjallarhorn hoisted overhead. */
    front({ctx, d: l, px, now, pose}){
      const dy = pose.dy || 0, top = CAPPY && head(pose).top, ex = CAPPY ? (pose.face > 0 ? 18 : 19) : !CHICKEN ? 19 : pose.face > 0 ? 9 : 28, ey = CAPPY && l.y != null ? Math.min(l.y + 6, top - 9) : CHICKEN && l.y > 8 ? 8 : l.y // the chicken's raised wing is over his back
      if (l.beam) { ctx.fillStyle = '#FFD84D'; ctx.globalAlpha = .22; ctx.fillRect(ex + 1, 0, 5, Math.max(0, ey + 4)); ctx.globalAlpha = .45; ctx.fillRect(ex + 3, 0, 1, Math.max(0, ey + 4)) }
      if (ey != null) {
        const spin = Math.floor(now / 120) % 2, white = l.decrypt % 2 === 1
        ctx.globalAlpha = .45; ctx.fillStyle = '#FFF3B0'
        ENGRAM.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (ENGRAM[j + b]?.[i + a] !== '#' && ENGRAM[j + b]?.[i + a] !== '*') ctx.fillRect(ex + i + a, ey + j + b, 1, 1) })) // its glow
        ctx.globalAlpha = 1
        ENGRAM.forEach((r, j) => [...r].forEach((ch, i) => {
          if (ch === '.') return
          ctx.fillStyle = white ? '#FFFFFF' : ch === '*' ? '#FFFFFF' : (i < 3) !== !!spin ? '#FFE27A' : j > 3 ? '#B87A10' : '#E8B33A' // facets catch the light as it turns
          ctx.fillRect(ex + i, ey + j, 1, 1)
        }))
        if (l.decrypt) { // rings rolling out as it decrypts
          const r = 3 + l.decrypt * 2
          ctx.globalAlpha = .7 - l.decrypt * .12; ctx.fillStyle = '#FFE27A'
          for (let k = -r; k <= r; k++) { const w = r - Math.abs(k); ctx.fillRect(ex + 3 + w, ey + 3 + k, 1, 1); ctx.fillRect(ex + 3 - w, ey + 3 + k, 1, 1) }
          ctx.globalAlpha = 1
        }
      }
      if (l.flash) { ctx.globalAlpha = .85; ctx.fillStyle = '#FFFFFF'; for (let k = -7; k <= 7; k++) { const w = 7 - Math.abs(k); ctx.fillRect(ex + 3 - w, (CAPPY ? top - 6 : CHICKEN ? 11 : 12) + k, w * 2 + 1, 1) } ctx.globalAlpha = 1 }
      if (l.gun) facing(ctx, CHICKEN ? pose : {...pose, face: -pose.face}, () => { // held up in both hands, after the real one: thin rear tube, gunmetal body with
        // bronze trim and a red mark, a fat ribbed barrel at the front, and the carved bronze wolf crouched on top of it.
        // It's drawn pointing right, so Cappy's turn is flipped for it: then it points the way he faces. The chicken holds it at
        // his chest, its grip in his forward wing and its long tube out ahead of him (with the fat end ahead it reads backward).
        const y = CAPPY ? top - 8 : (CHICKEN ? 26 : 13) + dy, r = (x, yy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, yy, w, h) }
        ctx.globalAlpha = l.gun
        const t = y - 8 // it's huge, even on a Guardian: nearly as wide as he is, its top well above his head
        r(0, t + 8, 14, 2, '#C9CDD3'); r(0, t + 9, 14, 1, '#7E838C') // rear rod
        r(10, t + 10, 2, 4, '#2E2F34'); r(21, t + 12, 2, 2, '#2E2F34') // grips
        r(14, t + 6, 24, 6, '#D9DCE0'); r(14, t + 6, 24, 1, '#F2F3F5'); r(14, t + 11, 24, 1, '#9A9EA6') // silver body
        r(17, t + 6, 1, 6, '#C9A24A'); r(25, t + 6, 1, 6, '#C9A24A') // gold bands
        r(28, t + 8, 10, 3, '#3A3B40'); for (let x = 28; x < 38; x += 2) r(x, t + 8, 1, 3, '#C9A24A') // gold-ribbed barrel
        r(38, t + 4, 6, 9, '#E6E8EB'); r(39, t + 5, 4, 7, '#1E1F23'); r(38, t + 4, 1, 9, '#C9A24A') // big round muzzle
        // the gold wolf crouched over the front half, head down at the muzzle, ears back
        r(19, t + 2, 19, 4, '#D4A94E'); r(19, t + 5, 19, 1, '#9C7430'); r(27, t + 1, 9, 1, '#D4A94E')
        for (let x = 20; x < 36; x += 2) r(x, t + 2, 1, 1, '#E8C56E') // fur
        r(38, t + 2, 4, 2, '#D4A94E'); r(41, t + 3, 1, 1, '#4A2E10') // snout, nose
        r(29, t, 1, 1, '#E8C56E'); r(32, t, 1, 1, '#E8C56E'); r(35, t + 3, 1, 1, '#4A2E10') // ears, eye
        ctx.globalAlpha = 1
      })
      if (l.gun && CHICKEN) for (const [x, y, c] of px) if (c === '#FFF050' || c === '#B8960F') { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1) } // his wing round the grip (his beak and foot are the same colors, clear of it)
      if (l.sparkle) for (let i = 0; i < 9; i++) { // Exotic gold twinkling round him
        const seed = Math.floor(now / 110) + i * 13
        ctx.globalAlpha = .5 + .1 * (seed % 5); ctx.fillStyle = i % 3 ? '#FFD84D' : '#FFFFFF'
        ctx.fillRect((seed * 29) % GW, (seed * 17 + i * 7) % (GH - 6), 1, 1)
      }
      ctx.globalAlpha = 1
    },
    glow: l => l.gun ? ' drop-shadow(0 0 4px rgba(255,200,60,.85))' : '',
  })
}
