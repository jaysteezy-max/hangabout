// Fan pack: Darth Vader, after Star Wars. Fan-made, unofficial, not affiliated with its rights holders.
// His armor goes black, the cape falls, the helmet comes down; two slow breaths with the chest panel blinking;
// the red saber snaps on, a big slash across; then it switches off and it all comes away again.
{
  const {GW, OX, OY, GH, BODY, TOP, SIDE, EYE, recolor, thickLine, head, facing} = hangabout
  const CAPPY = hangabout.skin === 'cappy' // side on: the helmet in profile, one lens, the saber at his chin
  const HATTY = hangabout.skin === 'hatty' // the helmet in place of his top hat, his suit gone black, the saber in his cane hand
  const ARMOR = {[BODY]: '#1E1E24', [TOP]: '#3C3D47', [SIDE]: '#111115', [EYE]: '#1E1E24'}
  if (HATTY) Object.assign(ARMOR, {'#915544': '#1E1E24', '#4E4E4E': '#111115', '#9B225D': '#2C2D35', '#4BA2CE': '#1E1E24'}) // and his jacket, trousers, tie and tears (web/skins/hatty.js)
  const SUIT = {dark: 1, cape: 1, helmet: 0, mask: 1}, MID = ['mid', 'mid']
  const maythe4th = () => { const d = new Date(); return d.getMonth() === 4 && d.getDate() === 4 ? 1 : 0 } // your local date

  /** The red saber, its hilt at (hx, hy). */
  function saber(ctx, v, now, hx, hy){
    if (v.blade == null) return
    const a = (v.angle ?? 80) * Math.PI / 180, L = 22 * v.blade
    thickLine(ctx, hx - Math.cos(a) * 4, hy + Math.sin(a) * 4, hx, hy, 2, '#B9BDC6') // the hilt
    if (v.trail) for (const deg of [30, 20, 10]) { const b = a - deg * Math.PI / 180; thickLine(ctx, hx, hy, hx + Math.cos(b) * 22, hy - Math.sin(b) * 22, 2, '#FF2B2B', .4 - deg / 100) }
    if (L > 0) {
      thickLine(ctx, hx, hy, hx + Math.cos(a) * L, hy - Math.sin(a) * L, 3, '#FF2B2B', .8 * (.85 + .15 * Math.sin(now / 23))) // humming
      thickLine(ctx, hx, hy, hx + Math.cos(a) * L, hy - Math.sin(a) * L, 1, '#FFF2F2')
    }
  }
  /** Cappy in profile, drawn facing left: the dome over his ears, his head gone black under the mask, one angled lens, the grille on his snout, the chest panel, and the saber at his chin. */
  function cappyFront(ctx, v, px, now, pose){
    const h = head(pose), row = (y, x0, x1, c) => { ctx.fillStyle = c; ctx.fillRect(x0, y, x1 - x0 + 1, 1) }
    if (v.mask) { ctx.fillStyle = '#111114'; for (const [x, y] of px) if ((pose.face > 0 ? GW - 1 - x : x) <= 25 && y <= h.y + 11) ctx.fillRect(x, y, 1, 1) }
    facing(ctx, pose, () => {
      if (v.helmet != null) { // the dome, and its flare down the back of his neck
        const t = h.top + v.helmet
        for (const [dy, x0, x1] of [[-3, 16, 23], [-2, 14, 25], [-1, 13, 27], [0, 12, 28], [1, 12, 28], [2, 23, 28], [3, 24, 28], [4, 24, 29], [5, 25, 29], [6, 25, 30], [7, 26, 30]]) row(t + dy, x0, x1, '#111114')
        row(t - 3, 17, 21, '#3C3D47'); row(t + 1, 12, 24, '#2C2D35') // light on the crown, and the brow over the mask
        for (const [dy, x] of [[2, 28], [3, 28], [4, 29], [5, 29], [6, 30], [7, 30]]) row(t + dy, x, x, '#3C3D47') // and on the flare's edge
        ctx.fillStyle = '#4B4E5C'; for (const [x, y] of [[16, t - 2], [15, t - 1], [14, t], [14, t + 1]]) ctx.fillRect(x, y, 1, 1) // shine
      }
      if (v.mask) {
        row(h.y - 1, 18, 21, '#2B0E10'); row(h.y, 18, 21, '#2B0E10'); row(h.y + 1, 19, 21, '#2B0E10') // the lens, cut away at the bottom front
        ctx.fillStyle = '#7A3232'; ctx.fillRect(19, h.y - 1, 1, 1)
        ctx.fillStyle = '#5D606B'; for (let i = 0; i < 5; i++) ctx.fillRect(17 - i, h.y + 1 + i, 1, 1) // the cheek, down to the grille
        for (const [y, x0, x1] of [[h.y + 6, 10, 12], [h.y + 7, 10, 13], [h.y + 8, 10, 14], [h.y + 9, 11, 14]]) for (let x = x0; x <= x1; x++) { ctx.fillStyle = x % 2 ? '#8D929C' : '#2C2D33'; ctx.fillRect(x, y, 1, 1) } // mouth grille
        row(h.y + 11, 17, 26, '#4F525C'); row(h.y + 12, 17, 26, '#4F525C') // chest panel, its lights blinking
        const on = Math.floor(now / 350)
        ;['#FF3B3B', '#3BDB6B', '#4D8BFF', '#FFFFFF'].forEach((c, i) => { if ((on + i) % 3) { ctx.fillStyle = c; ctx.fillRect(18 + i * 2, h.y + 11 + (i % 2), 1, 1) } })
      }
      saber(ctx, v, now, 8, h.y + 8)
    })
  }

  /** Hatty, drawn facing you: the dome over his head where his hat was, flaring out at his neck, the mask on his face, the chest panel on his jacket, and the saber in his cane hand. */
  function hattyFront(ctx, v, now, pose){
    const h = head(pose), row = (y, x0, x1, c) => { ctx.fillStyle = c; ctx.fillRect(x0, y, x1 - x0 + 1, 1) }
    facing(ctx, pose, () => {
      if (v.helmet != null) {
        const t = h.top + v.helmet
        for (const [dy, x0, x1] of [[-5, 17, 25], [-4, 15, 27], [-3, 14, 28], [-2, 13, 29], [-1, 12, 30], [0, 12, 30], [1, 12, 30], [2, 12, 30], [3, 12, 30], [4, 12, 30], [5, 12, 30]]) row(t + dy, x0, x1, '#111114')
        for (const [dy, l, r] of [[6, 12, 30], [7, 12, 30], [8, 11, 31], [9, 11, 31], [10, 10, 32], [11, 10, 32], [12, 10, 32]]) { row(t + dy, l, 13, '#111114'); row(t + dy, 29, r, '#111114') } // the flare down to his neck
        row(t - 5, 19, 23, '#3C3D47'); row(t + 5, 13, 29, '#2C2D35') // light on the crown, and the brow over the mask
        for (const [dy, l, r] of [[8, 11, 31], [10, 10, 32], [11, 10, 32], [12, 10, 32]]) { row(t + dy, l, l, '#3C3D47'); row(t + dy, r, r, '#3C3D47') } // and on the flare's edges
        ctx.fillStyle = '#4B4E5C'; for (const [x, y] of [[17, t - 4], [16, t - 3], [15, t - 2], [14, t - 1]]) ctx.fillRect(x, y, 1, 1) // shine
      }
      if (v.mask) {
        for (const [x0, outer] of [[h.x - 1, -1], [h.x + 6, 1]]) { // angled lenses over his eyes, cut away at the outer bottom corner
          row(h.y - 1, x0, x0 + 3, '#2B0E10'); row(h.y, x0, x0 + 3, '#2B0E10'); row(h.y + 1, x0 + (outer < 0), x0 + 3 - (outer > 0), '#2B0E10')
          ctx.fillStyle = '#7A3232'; ctx.fillRect(x0 + 1, h.y - 1, 1, 1)
        }
        ctx.fillStyle = '#5D606B'; ctx.fillRect(h.x + 4, h.y - 1, 1, 4) // the ridge between them
        for (let i = 0; i < 3; i++) { ctx.fillRect(h.x - 1 + i, h.y + 2 + i, 1, 1); ctx.fillRect(h.x + 9 - i, h.y + 2 + i, 1, 1) } // the cheeks, down to the grille
        for (const [y, w] of [[h.y + 3, 1], [h.y + 4, 2], [h.y + 5, 3]]) for (let x = h.x + 4 - w; x <= h.x + 4 + w; x++) { ctx.fillStyle = x % 2 ? '#8D929C' : '#2C2D33'; ctx.fillRect(x, y, 1, 1) } // mouth grille
        row(h.y + 8, h.x, h.x + 8, '#4F525C'); row(h.y + 9, h.x, h.x + 8, '#4F525C') // chest panel, its lights blinking
        const on = Math.floor(now / 350)
        ;['#FF3B3B', '#3BDB6B', '#4D8BFF', '#FFFFFF'].forEach((c, i) => { if ((on + i) % 3) { ctx.fillStyle = c; ctx.fillRect(h.x + 1 + i * 2, h.y + 8 + (i % 2), 1, 1) } })
      }
      saber(ctx, v, now, 31, h.y + 7)
    })
  }

  hangabout.trick({
    name: 'vader', label: 'Darth Vader 🔴', rarity: 'rare', pack: 'fan', on: {forcePush: 1, today: maythe4th}, // a force push, and May the 4th
    frames: [
      [{vader: {dark: .4}}, 160],
      [{vader: {dark: .8, cape: .5, helmet: -6}}, 160],
      [{vader: {dark: 1, cape: 1, helmet: -3}}, 160],
      [{squash: 1, vader: SUIT}, 140], // clunk
      ...[0, 1, 0, 1].map(squash => [{squash, vader: SUIT}, 700]), // in... and out
      [{arms: MID, vader: {...SUIT, blade: 0}}, 220], // draws the hilt
      ...[.35, .7, 1].map(blade => [{arms: MID, shake: 1, vader: {...SUIT, blade}}, 60]), // snap-hiss
      [{arms: MID, vader: {...SUIT, blade: 1}}, 900],
      ...[105, 135, 160, 180].map(angle => [{arms: MID, squash: angle === 180 ? 1 : 0, vader: {...SUIT, blade: 1, angle, trail: 1}}, 70]), // the slash
      [{arms: MID, squash: 1, vader: {...SUIT, blade: 1, angle: 180}}, 500],
      [{arms: MID, vader: {...SUIT, blade: 1, angle: 130}}, 120],
      [{arms: MID, vader: {...SUIT, blade: 1}}, 400],
      ...[.5, 0].map(blade => [{arms: MID, vader: {...SUIT, blade}}, 80]), // switches off
      [{vader: SUIT}, 400],
      [{vader: {dark: .6, cape: .5, helmet: -4}}, 160],
      [{vader: {dark: .2, helmet: -8}}, 160],
      [{eyes: 'blink'}, 140], [{}, 200],
    ],
    pixels({d: v, px, pose}){
      if (HATTY && v.helmet != null) { const t = head(pose).top; px = px.filter(([x, y]) => y >= t || x < 13 || x > 29) } // his top hat comes off under the helmet
      return v.dark ? recolor(px, ARMOR, v.dark) : px
    },
    /** Behind him: the cape, sweeping to the floor behind his arms. */
    behind({ctx, d: v, now, pose}){
      if (!v.cape) return
      facing(ctx, pose, () => { // Cappy: one, off his back; Hatty: from behind his helmet's flare
        ctx.globalAlpha = v.cape
        const top = CAPPY ? head(pose).top + 3 : HATTY ? head(pose).top + 10 : OY + 2
        for (const x0 of CAPPY ? [32] : HATTY ? [10, 29] : [OX + 1, OX + 31]) for (let x = x0; x < x0 + 4; x++) {
          ctx.fillStyle = x === x0 || x === x0 + 3 ? '#2A2A31' : '#0D0D10'
          ctx.fillRect(x, top, 1, GH - top - Math.round(1 + Math.sin(x * 1.3 + now / 260)))
        }
        ctx.globalAlpha = 1
      })
    },
    /** In front: the helmet coming down, the mask and chest panel, and the red saber (hilt in his right hand). */
    front({ctx, d: v, px, now, pose}){
      if (CAPPY) return cappyFront(ctx, v, px, now, pose)
      if (HATTY) return hattyFront(ctx, v, now, pose)
      const dy = pose.dy || 0, sq = pose.squash || 0, eyeY = OY + 4 + dy + sq, top = Math.min(...px.map(([, y]) => y)) + (v.helmet || 0)
      const row = (y, x0, x1, c) => { ctx.fillStyle = c; ctx.fillRect(x0, y, x1 - x0, 1) }
      if (v.helmet != null) { // a black dome, flaring out at the sides
        row(top - 5, OX + 11, OX + 25, '#111114'); row(top - 4, OX + 8, OX + 28, '#111114'); row(top - 3, OX + 6, OX + 30, '#111114')
        for (let y = top - 2; y < top + 4; y++) row(y, OX + 5, OX + 31, '#111114')
        for (let y = top + 4; y < top + 9; y++) { const f = (y - top - 4) >> 1; row(y, OX + 3 + f, OX + 7, '#111114'); row(y, OX + 29, OX + 33 - f, '#111114') }
        ctx.fillStyle = '#4B4E5C'; for (const [x, y] of [[OX + 12, top - 4], [OX + 11, top - 3], [OX + 10, top - 2], [OX + 10, top - 1]]) ctx.fillRect(x, y, 1, 1) // shine
      }
      if (v.mask) {
        for (const [x0, x1, outer] of [[OX + 9, OX + 13, -1], [OX + 23, OX + 27, 1]]) { // angled lenses, cut away at the outer bottom corner
          row(eyeY + 1, x0, x1, '#2B0E10'); row(eyeY + 2, x0, x1, '#2B0E10'); row(eyeY + 3, x0 + (outer < 0), x1 - (outer > 0), '#2B0E10')
          ctx.fillStyle = '#7A3232'; ctx.fillRect(x0 + 1, eyeY + 1, 1, 1)
        }
        ctx.fillStyle = '#5D606B'; ctx.fillRect(OX + 17, eyeY, 2, 5) // the ridge between them
        for (const [y, w] of [[eyeY + 5, 2], [eyeY + 6, 3], [eyeY + 7, 4]]) for (let x = OX + 18 - w; x < OX + 18 + w; x++) { ctx.fillStyle = x % 2 ? '#8D929C' : '#2C2D33'; ctx.fillRect(x, y, 1, 1) } // mouth grille
        row(eyeY + 9, OX + 13, OX + 23, '#4F525C'); row(eyeY + 10, OX + 13, OX + 23, '#4F525C') // chest panel, its lights blinking
        const on = Math.floor(now / 350)
        ;['#FF3B3B', '#3BDB6B', '#4D8BFF', '#FFFFFF'].forEach((c, i) => { if ((on + i) % 3) { ctx.fillStyle = c; ctx.fillRect(OX + 14 + i * 2, eyeY + 9 + (i % 2), 1, 1) } })
      }
      saber(ctx, v, now, OX + 32, OY + 7 + dy + Math.ceil(sq / 2))
    },
    glow: v => v.blade > 0 ? ' drop-shadow(0 0 3px rgba(255,40,40,.8))' : '',
  })
}
