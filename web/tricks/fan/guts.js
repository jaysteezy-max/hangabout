// Fan pack: Guts, after Berserk. Fan-made, unofficial, not affiliated with its rights holders.
// Cloak, the Brand, one scarred eye; he draws a sword taller than he is, slashes, and shoulders it.
{
  const {GW, OX, OY, GH, BODY, EYE, thickLine, head, facing} = hangabout
  // Side on (Cappy, Pusheen): one cloak flap, the scar on the eye he shows, the Brand on his neck. Laid out on Cappy, his
  // snout at x 10, and moved to this skin's snout; the flap and the mantle run to his rump.
  const PROFILE = hangabout.sideOn && head
  const rump = (px, pose) => Math.max(...px.map(([x]) => pose.face > 0 ? GW - 1 - x + (pose.ox || 0) : x - (pose.ox || 0))) - 1 // his last column, as drawn facing left
  const PUSHEEN = hangabout.skin === 'pusheen' // her face looks out at you: the Brand on the back of her neck, clear of her whiskers
  const HATTY = hangabout.skin === 'hatty' // his hat stays on: the cloak off his shoulders, the sword in his cane hand
  const CHICKEN = hangabout.skin === 'chicken' // the sword in his wing: up in front of him, planted in the ground, then over his head from his raised wing
  const CAPPY = hangabout.skin === 'cappy' // no arms: the sword in his paw raised before his face, stood up, then laid back over his head
  const SLIME = hangabout.skin === 'slime' // the sword in its goo arm, the chicken's way, then across its top from a nub raised at its front corner
  const IRON = '#4A4C56', EDGE = '#9496A2', DARK = '#2F3038', CLOAK = '#1C1A21', LEATHER = '#5A3A22', STEELGUARD = '#6E6F78'

  hangabout.trick({
    name: 'guts', label: 'Guts ⚔', rarity: 'rare', pack: 'fan', on: {failStreak: 1}, // three failures in a row
    frames: [
      [{eyes: 'angry', guts: {cape: 1, aura: 1}}, 260],
      [{squash: 1, eyes: 'angry', guts: {cape: 1, aura: 1, sword: .35}}, 110],
      [{squash: 1, eyes: 'angry', guts: {cape: 1, aura: 1, sword: .7}}, 110],
      [{squash: 1, eyes: 'angry', guts: {cape: 1, aura: 1, sword: 1}}, 180],
      [{squash: 2, eyes: 'angry', guts: {cape: 1, aura: 2, sword: 1, brand: 2}}, 420], // winds up
      [{dy: -1, eyes: 'angry', arms: ['mid', 'down'], shake: 1, guts: {cape: 1, slash: 1, low: 1, brand: 2}}, 110], // the slash
      [{squash: 2, eyes: 'angry', arms: ['mid', 'down'], shake: 1, guts: {cape: 1, slash: .5, low: 1, brand: 1, dust: 1}}, 150],
      [{squash: 1, eyes: 'angry', arms: ['mid', 'down'], guts: {cape: 1, low: 1, brand: 1}}, 300],
      [{eyes: 'angry', guts: {cape: 1, shoulder: 1, brand: 1, aura: 1}}, 1500], // rests it on his shoulder
      [{guts: {cape: .5, shoulder: .5}}, 160], [{guts: {cape: .25, shoulder: .25}}, 160], [{}, 200],
    ].map(([p, ms]) => [CAPPY && p.guts ? p.guts.shoulder || p.guts.sword ? {...p, arms: ['mid', 'high']} : p.guts.low ? {...p, hand: 6} : p : // Cappy's paw on its grip
      !(CHICKEN || SLIME) || !p.guts ? p : p.guts.shoulder ? {...p, arms: ['mid', 'high']} : p.guts.low ? {...p, hand: SLIME ? 3 : 4} : p.guts.sword ? {...p, hand: SLIME ? 7 : 10} : p, ms]), // the chicken's wing (the slime's goo) on its grip
    /** Behind him: the dark aura, the cloak's flaps, and the sword when it's upright or on his shoulder. */
    behind({ctx, d: g, px, now, pose}){
      if (g.aura) { // dark red aura flickering at his edges
        const filled = new Set(px.map(([x, y]) => x + ',' + y))
        ctx.globalAlpha = .8
        for (const [x, y] of px) for (const [a, b] of [[1, 0], [-1, 0], [0, -1], [0, 1]]) {
          const k = (x + a) + ',' + (y + b)
          if (!filled.has(k) && Math.random() < .5 * g.aura) { ctx.fillStyle = Math.random() < .5 ? '#8C1C26' : '#2A0A10'; ctx.fillRect(x + a, y + b, 1, 1) }
        }
        ctx.globalAlpha = 1
      }
      if (g.cape && CHICKEN) facing(ctx, pose, () => { // the chicken's cloak: off the back of his head, down his back a little proud of it, and on to just off the floor
        ctx.globalAlpha = g.cape
        const back = []
        for (const [x, y] of px) back[y] = Math.max(back[y] ?? 0, pose.face > 0 ? GW - 1 - x + (pose.ox || 0) : x - (pose.ox || 0))
        for (let y = head(pose).top + 4, edge = 0; y < GH - 1; y++) {
          edge = edge ? Math.max(edge, Math.min(edge + 1, (back[y] ?? 0) + 2)) : back[y] + 2 // it falls: out over his back and tail, never back in
          for (let x = 20; x <= edge; x++) if (y < GH - 3 + Math.round(1.5 * Math.sin(x * 1.7 + now / 110))) { ctx.fillStyle = x === edge ? '#2E2A36' : CLOAK; ctx.fillRect(x, y, 1, 1) }
        }
        ctx.globalAlpha = 1
      })
      else if (g.cape) facing(ctx, pose, () => { // the cloak's flaps behind his arms (side on: off his rump; Hatty: off his shoulders), fluttering at the hem
        ctx.globalAlpha = g.cape
        const top = PROFILE ? head(pose).top + 5 : HATTY ? head(pose).y + 5 : OY + 1
        for (const x0 of PROFILE ? [rump(px, pose) + 1] : HATTY ? [10, 29] : [OX + 2, OX + 30]) for (let x = x0; x < x0 + 4; x++) {
          ctx.fillStyle = x === x0 || x === x0 + 3 ? '#2E2A36' : CLOAK
          ctx.fillRect(x, top + (PROFILE ? x - x0 >> 1 : 0), 1, (PROFILE ? 10 : HATTY ? 8 : 15) + Math.round(1.5 + 1.5 * Math.sin(x * 1.7 + now / 110)))
        }
        ctx.globalAlpha = 1
      })
      facing(ctx, pose, () => { // the sword stays behind him whichever way he faces side on
        if (HATTY) ctx.translate(-6, head(pose).y - 22) // its grip in his cane hand
        if (CHICKEN) ctx.translate(-32, pose.dy || 0) // its grip in his wing, out in front of him (behind him, so his wing closes over it)
        if (SLIME) { const h = head(pose); ctx.translate(h.nose - 42, h.y - 27) } // the same in the slime's goo-arm tip, which squashes with it
        if (g.low && (CHICKEN || SLIME)) { ctx.translate(0, 54); ctx.scale(1, -1) } // the chicken's after the swing: the same sword upside down, planted point first in front of him
        if (CAPPY) ctx.translate(0, (pose.dy || 0) - (pose.stretch || 0)) // with his raised paw, which keeps to his chin (web/skins/cappy.js)
        if (g.sword && CAPPY) ctx.translate(-29, -1) // its grip in the toes of his raised paw, the guard on them, the blade before his face
        if (g.sword || (g.low && (CHICKEN || SLIME))) { // drawn up from behind his back: longer than he is tall
          const tip = CAPPY ? 1 : 0, cut = Math.round((1 - (g.sword || 1)) * 34), row = (y, x, w, c) => { if (y >= cut) { ctx.fillStyle = c; ctx.fillRect(x, y, w, 1) } } // Cappy's held higher: a shorter blade, its point on the grid
          row(tip, 38, 1, EDGE); row(tip + 1, 37, 3, IRON)
          for (let y = tip + 2; y <= 26; y++) { row(y, 36, 1, EDGE); row(y, 37, 3, IRON); row(y, 40, 1, DARK) }
          row(27, 33, 10, STEELGUARD)
          for (let y = 28; y <= 32; y++) row(y, 37, 3, LEATHER) // the grip, in his hand
          row(33, 37, 3, STEELGUARD)
        }
        if (g.shoulder && CHICKEN) { // its grip in his wing raised over his back, the blade behind his crest and on over his brow
          thickLine(ctx, 57, 12, 33, 0, 5, IRON, g.shoulder)
          thickLine(ctx, 57, 11, 33, -1, 1, EDGE, g.shoulder)
          thickLine(ctx, 55, 15, 59, 7, 2, STEELGUARD, g.shoulder)
          thickLine(ctx, 59, 13, 65, 16, 3, LEATHER, g.shoulder)
        } else if (g.shoulder && CAPPY) { // its grip still in his raised paw, the blade laid back over his head, behind his ears
          thickLine(ctx, 11, 26, 38, 3, 5, IRON, g.shoulder)
          thickLine(ctx, 12, 24, 39, 1, 1, EDGE, g.shoulder)
          thickLine(ctx, 8, 23, 14, 29, 2, STEELGUARD, g.shoulder)
          thickLine(ctx, 9, 28, 5, 31, 3, LEATHER, g.shoulder)
        } else if (g.shoulder && SLIME) { // its grip in its nub raised at its front corner (the canvas moved back for it), the blade back across its top
          thickLine(ctx, 42, 17, 74, 13, 5, IRON, g.shoulder)
          thickLine(ctx, 42, 15, 74, 11, 1, EDGE, g.shoulder)
          thickLine(ctx, 41, 13, 42, 21, 2, STEELGUARD, g.shoulder)
          thickLine(ctx, 40, 17, 36, 15, 3, LEATHER, g.shoulder)
        } else if (g.shoulder) { // resting on his shoulder, angled up behind his head
          thickLine(ctx, 37, 29, 7, 2, 5, IRON, g.shoulder)
          thickLine(ctx, 36, 27, 6, 0, 1, EDGE, g.shoulder)
          thickLine(ctx, 33, 26, 39, 32, 2, STEELGUARD, g.shoulder)
          thickLine(ctx, 38, 31, 41, 35, 3, LEATHER, g.shoulder)
        }
      })
    },
    /** In front: the mantle on his shoulders, the Brand, his scarred eye, the slash, and the sword after the swing. */
    front({ctx, d: g, px, now, pose}){
      const top = Math.min(...px.map(([, y]) => y)), eyeY = OY + 4 + (pose.dy || 0) + (pose.squash || 0), h = head && head(pose), n = PROFILE && h.nose - 10
      if (g.cape) {
        ctx.globalAlpha = g.cape
        if (PROFILE) { // the mantle over his back, behind his ears
          const ridge = new Map()
          for (const [x, y] of px) if (!ridge.has(x) || y < ridge.get(x)) ridge.set(x, y)
          for (let i = 25 + n, end = rump(px, pose) + 1; i <= end; i++) { const x = pose.face > 0 ? GW - 1 - i : i, y = ridge.get(x); ctx.fillStyle = CLOAK; ctx.fillRect(x, y, 1, 4); ctx.fillStyle = '#3A3442'; ctx.fillRect(x, y + 4, 1, 1) }
          if (CHICKEN) { ctx.globalAlpha = 1; for (const [x, y, c] of px) if (c === '#FFF050' || c === '#B8960F') { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1) } } // his wing raised over it (his beak's the same yellow: no change)
        } else if (HATTY) facing(ctx, pose, () => { // the mantle over his shoulders, open at his collar
          for (const [x0, x1] of [[12, 17], [24, 30]]) { ctx.fillStyle = CLOAK; ctx.fillRect(x0, h.y + 6, x1 - x0 + 1, 2); ctx.fillStyle = '#3A3442'; ctx.fillRect(x0, h.y + 8, x1 - x0 + 1, 1) }
        })
        else {
          ctx.fillStyle = CLOAK; ctx.fillRect(OX + 4, top, 28, 2)
          ctx.fillStyle = '#3A3442'; ctx.fillRect(OX + 4, top + 2, 28, 1)
        }
        ctx.globalAlpha = 1
      }
      facing(ctx, pose, () => {
        if (PROFILE) { ctx.fillStyle = '#8C3B2E'; for (const y of [-3, -2, -1, 1, 2]) ctx.fillRect(h.x + 1, h.y + y, 1, 1) } // a scar through the eye he shows
        else if (HATTY) { // his right eye scarred shut
          ctx.fillStyle = BODY; ctx.fillRect(h.x + 7, h.y - 1, 3, 3)
          ctx.fillStyle = EYE; ctx.fillRect(h.x + 7, h.y + 1, 2, 1)
          ctx.fillStyle = '#8C3B2E'; ctx.fillRect(h.x + 8, h.y - 2, 1, 5)
        }
        else {
          ctx.fillStyle = BODY; ctx.fillRect(OX + 24, eyeY, 2, 4) // his right eye, scarred shut
          ctx.fillStyle = EYE; ctx.fillRect(OX + 24, eyeY + 2, 2, 1)
          ctx.fillStyle = '#8C3B2E'; ctx.fillRect(OX + 25, eyeY - 1, 1, 6)
        }
        if (g.brand) { // the Brand of Sacrifice, bleeding red on his brow (side on: his neck; the chicken: his brow, before his eye)
          const bx = CHICKEN ? h.x - 3 : PUSHEEN ? 28 : PROFILE ? 25 + n : HATTY ? h.x + 3 : OX + 16, by = CHICKEN ? h.y - 3 : PROFILE ? h.y : HATTY ? h.y - 5 : eyeY - 1
          if (g.brand > 1 && !CHICKEN) { ctx.globalAlpha = .45; ctx.fillStyle = '#FF4D5E'; ctx.fillRect(bx - 1, by - 1, 5, 6) }
          ctx.globalAlpha = g.brand > 1 ? 1 : .6 + .4 * Math.sin(now / 160); ctx.fillStyle = CHICKEN && g.brand > 1 ? '#FF2E45' : '#D7263D' // the chicken's bleeds brighter instead of glowing
          ;['.#.', '.##', '##.', '.#.'].forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') ctx.fillRect(bx + i, by + j, 1, 1) }))
          ctx.globalAlpha = 1
        }
        if (g.low && !CHICKEN && !SLIME) { // after the swing: the blade along the ground in front of him (side on: its grip under his chin; Hatty: in his cane hand)
          const k = PROFILE ? n - 21 : HATTY ? -4 : 0, y = HATTY ? h.y - 6 : OY
          ctx.fillStyle = EDGE; ctx.fillRect(2 + k, y + 14, 29, 1)
          ctx.fillStyle = IRON; ctx.fillRect(1 + k, y + 15, 30, 3)
          ctx.fillStyle = DARK; ctx.fillRect(2 + k, y + 18, 29, 1)
          ctx.fillStyle = STEELGUARD; ctx.fillRect(31 + k, y + 12, 2, 8)
          ctx.fillStyle = LEATHER; ctx.fillRect(33 + k, y + 15, 5, 2)
        }
      })
      if (g.slash) facing(ctx, pose, () => { // a huge white arc tearing across (the chicken's and the slime's: down in front of them, the way their sword goes)
        for (let i = 0; i <= 80; i++) {
          const t = i / 80, s = Math.sin(Math.PI * t), w = Math.round(1 + 2.5 * s)
          const [x, y] = CHICKEN || SLIME ? [6 - 18 * Math.sin(t * Math.PI / 2), 31 - 28 * Math.cos(t * Math.PI / 2)] : [41 - 40 * t + 8 * s, OY - 18 + 37 * t + 4 * s]
          ctx.globalAlpha = g.slash * (.6 + .4 * s); ctx.fillStyle = s > .5 ? '#FFFFFF' : '#FFD6D6'
          ctx.fillRect(Math.round(x) - (w >> 1), Math.round(y) - (w >> 1), w, w)
        }
        ctx.globalAlpha = 1
      })
      if (g.dust) { ctx.fillStyle = '#CFC4BA'; for (const x of [0, 6, 26, 34]) ctx.fillRect(x, GH - 2, 2, 1) }
    },
    glow: g => g.aura ? ' drop-shadow(0 0 4px rgba(170,20,35,.85))' : '',
  })
}
