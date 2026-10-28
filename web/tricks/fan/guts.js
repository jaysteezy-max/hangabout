// Fan pack: Guts, after Berserk. Fan-made, unofficial, not affiliated with its rights holders.
// Cloak, the Brand, one scarred eye; he draws a sword taller than he is, slashes, and shoulders it.
{
  const {GW, OX, OY, GH, BODY, EYE, thickLine, head, facing} = hangabout
  const CAPPY = hangabout.skin === 'cappy' // side on: one cloak flap, the scar on the eye he shows, the Brand on his neck
  const HATTY = hangabout.skin === 'hatty' // his hat stays on: the cloak off his shoulders, the sword in his cane hand
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
    ],
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
      if (g.cape) facing(ctx, pose, () => { // the cloak's flaps behind his arms (Cappy: off his rump; Hatty: off his shoulders), fluttering at the hem
        ctx.globalAlpha = g.cape
        const top = CAPPY ? head(pose).top + 5 : HATTY ? head(pose).y + 5 : OY + 1
        for (const x0 of CAPPY ? [33] : HATTY ? [10, 29] : [OX + 2, OX + 30]) for (let x = x0; x < x0 + 4; x++) {
          ctx.fillStyle = x === x0 || x === x0 + 3 ? '#2E2A36' : CLOAK
          ctx.fillRect(x, top + (CAPPY ? x - x0 >> 1 : 0), 1, (CAPPY ? 10 : HATTY ? 8 : 15) + Math.round(1.5 + 1.5 * Math.sin(x * 1.7 + now / 110)))
        }
        ctx.globalAlpha = 1
      })
      facing(ctx, pose, () => { // the sword stays behind him whichever way Cappy faces
        if (HATTY) ctx.translate(-6, head(pose).y - 22) // its grip in his cane hand
        if (g.sword) { // drawn up from behind his back: longer than he is tall
          const cut = Math.round((1 - g.sword) * 34), row = (y, x, w, c) => { if (y >= cut) { ctx.fillStyle = c; ctx.fillRect(x, y, w, 1) } }
          row(0, 38, 1, EDGE); row(1, 37, 3, IRON)
          for (let y = 2; y <= 26; y++) { row(y, 36, 1, EDGE); row(y, 37, 3, IRON); row(y, 40, 1, DARK) }
          row(27, 33, 10, STEELGUARD)
          for (let y = 28; y <= 32; y++) row(y, 37, 3, LEATHER) // the grip, in his hand
          row(33, 37, 3, STEELGUARD)
        }
        if (g.shoulder) { // resting on his shoulder, angled up behind his head
          thickLine(ctx, 37, 29, 7, 2, 5, IRON, g.shoulder)
          thickLine(ctx, 36, 27, 6, 0, 1, EDGE, g.shoulder)
          thickLine(ctx, 33, 26, 39, 32, 2, STEELGUARD, g.shoulder)
          thickLine(ctx, 38, 31, 41, 35, 3, LEATHER, g.shoulder)
        }
      })
    },
    /** In front: the mantle on his shoulders, the Brand, his scarred eye, the slash, and the sword after the swing. */
    front({ctx, d: g, px, now, pose}){
      const top = Math.min(...px.map(([, y]) => y)), eyeY = OY + 4 + (pose.dy || 0) + (pose.squash || 0), h = (CAPPY || HATTY) && head(pose)
      if (g.cape) {
        ctx.globalAlpha = g.cape
        if (CAPPY) { // the mantle over his back, behind his ears
          const ridge = new Map()
          for (const [x, y] of px) if (!ridge.has(x) || y < ridge.get(x)) ridge.set(x, y)
          for (let i = 25; i <= 33; i++) { const x = pose.face > 0 ? GW - 1 - i : i, y = ridge.get(x); ctx.fillStyle = CLOAK; ctx.fillRect(x, y, 1, 4); ctx.fillStyle = '#3A3442'; ctx.fillRect(x, y + 4, 1, 1) }
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
        if (CAPPY) { ctx.fillStyle = '#8C3B2E'; for (const y of [-3, -2, -1, 1, 2]) ctx.fillRect(h.x + 1, h.y + y, 1, 1) } // a scar through the eye he shows
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
        if (g.brand) { // the Brand of Sacrifice, bleeding red on his brow (Cappy: his neck)
          const bx = CAPPY ? 25 : HATTY ? h.x + 3 : OX + 16, by = CAPPY ? h.y : HATTY ? h.y - 5 : eyeY - 1
          if (g.brand > 1) { ctx.globalAlpha = .45; ctx.fillStyle = '#FF4D5E'; ctx.fillRect(bx - 1, by - 1, 5, 6) }
          ctx.globalAlpha = g.brand > 1 ? 1 : .6 + .4 * Math.sin(now / 160); ctx.fillStyle = '#D7263D'
          ;['.#.', '.##', '##.', '.#.'].forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') ctx.fillRect(bx + i, by + j, 1, 1) }))
          ctx.globalAlpha = 1
        }
        if (g.low) { // after the swing: the blade along the ground in front of him (Cappy: its grip under his chin; Hatty: in his cane hand)
          const k = CAPPY ? -21 : HATTY ? -4 : 0, y = HATTY ? h.y - 6 : OY
          ctx.fillStyle = EDGE; ctx.fillRect(2 + k, y + 14, 29, 1)
          ctx.fillStyle = IRON; ctx.fillRect(1 + k, y + 15, 30, 3)
          ctx.fillStyle = DARK; ctx.fillRect(2 + k, y + 18, 29, 1)
          ctx.fillStyle = STEELGUARD; ctx.fillRect(31 + k, y + 12, 2, 8)
          ctx.fillStyle = LEATHER; ctx.fillRect(33 + k, y + 15, 5, 2)
        }
      })
      if (g.slash) facing(ctx, pose, () => { // a huge white arc tearing across
        for (let i = 0; i <= 80; i++) {
          const t = i / 80, s = Math.sin(Math.PI * t), w = Math.round(1 + 2.5 * s)
          ctx.globalAlpha = g.slash * (.6 + .4 * s); ctx.fillStyle = s > .5 ? '#FFFFFF' : '#FFD6D6'
          ctx.fillRect(Math.round(41 - 40 * t + 8 * s) - (w >> 1), Math.round(OY - 18 + 37 * t + 4 * s) - (w >> 1), w, w)
        }
        ctx.globalAlpha = 1
      })
      if (g.dust) { ctx.fillStyle = '#CFC4BA'; for (const x of [0, 6, 26, 34]) ctx.fillRect(x, GH - 2, 2, 1) }
    },
    glow: g => g.aura ? ' drop-shadow(0 0 4px rgba(170,20,35,.85))' : '',
  })
}
