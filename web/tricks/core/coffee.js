// Coffee by the fire, after a long turn (15 minutes or more): the movie shot. A tall wingback and a crackling fireplace
// fade in round him and he hops up into the chair in a burgundy velvet robe, crosses his legs, gazes into the fire,
// takes two slow sips and lets out a satisfied sigh. Then the scene fades and he hops down, himself again.
// All drawn on his canvas: the chair behind him, the fireplace in the spare columns on the side away from his status
// bubble (it pops up as Claude finishes), and firelight warming the near side of everything and shading the far side.
{
  const {GW, OX, OY, BODY, SIDE, EYE, desk, mix} = hangabout
  const ROBE = '#8E2436', HEM = '#621827', SATIN = '#2A1216'
  const GREEN = '#3D6B4F', LIT = '#558A66', SHADE = '#27462F', TUFT = '#1A3122', WOOD = '#3A2314'
  const STONE = '#8B857C', MORTAR = '#6A645C', STONE_LIT = '#A9A398', SOOT = '#160D09', MANTEL = '#5A3822', MANTEL_LIT = '#7A5236'
  const FLAME = ['#FFF2B0', '#FFD04A', '#FF9A2A', '#E8501C'] // hottest at the base

  /** +1 puts the fireplace on his right, -1 on his left: away from his status bubble, unless that runs off the screen. */
  function side(){
    const away = desk.querySelector('.pet.flip') ? 1 : -1, {x} = hangabout.feet(), reach = 102 * hangabout.size // 34 art px
    return (away > 0 ? x + reach <= hangabout.width : x - reach >= 0) ? away : -away
  }
  /** fillRect for the scene, drawn as if the fire is on his right and mirrored when it's on his left. */
  const scene = ctx => { const s = side(); return (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(s > 0 ? x : GW - x - w, y, w, h) } }

  // The chicken has no lap or crossed legs: he settles in like a hen on eggs, turned to the fire, and holds the mug in his
  // wing, at his breast or tipped up to his beak. His robe is his own (see hen()).
  const CHICKEN = hangabout.skin === 'chicken', HOLD = CHICKEN ? {hand: 12} : {}
  const SIT = {dy: -4, ...CHICKEN ? {tuck: 1, ...HOLD} : {arms: ['mid', 'down']}} // up on the seat, the mug in his lap
  // Where the mug is: [x, y, tilted to his lips]; on the chicken, from the top-left of his wing (x 5) and with its handle in it.
  const [LAP, LOW, SIP] = CHICKEN ? [[2, -3], [2, -3], [6, -3, 1]] : [[29, 27], [29, 28], [30, 21, 1]]
  const FIRE = CHICKEN ? {dx: 0, lookY: 1} : {eyes: 'side', look: 1}, SIPPING = {...CHICKEN ? {hand: 9} : {arms: ['mid', 'up']}, eyes: 'blink'}
  const wing = pose => Math.max(18, Math.min(30, 17 + pose.hand)) + (pose.dy || 0) // the top of the chicken's wing held out (web/skins/chicken.js)
  const WING = ['#FFF050', '#B8960F'], WATTLE = ['#44AEF6', '#0060A0'], TOES = '#F2BE2E', LINE = '#16161A' // the chicken's own colors, which recolor leaves alone
  const toLeft = ([x, y, c]) => [GW - 1 - x, y, c]
  /** The chicken, turned to the fire, in a robe that fits an egg: velvet from under his beak down, its satin collar rising over his back and edging the opening round his wattle, a sash with its knot at his side. Laid out on him facing left. */
  function hen(d, px, pose){
    if (pose.face > 0) px = px.map(toLeft)
    const {chin} = hangabout.head(pose), sash = chin + 6, held = wing(pose)
    if (pose.tuck) { // the tucked foot that peeks out at the front goes under the robe, and the outline only it needed
      const low = (x, y) => y > sash && x < 13
      px = px.filter(([x, y, c]) => !low(x, y) || !(c === TOES || WING.includes(c) && !(y >= held && y < held + 7)))
      const solid = new Set(px.filter(p => p[2] !== LINE).map(([x, y]) => x + ',' + y))
      px = px.filter(([x, y, c]) => c !== LINE || !low(x, y) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([i, j]) => solid.has(x + i + ',' + (y + j))))
    }
    const at = new Map(px.map(([x, y, c]) => [x + ',' + y, c])), wattle = (x, y) => WATTLE.includes(at.get(x + ',' + y))
    const robe = (x, y, c) => {
      const top = chin + 1 - Math.max(0, x - 16 >> 2) // higher toward his back
      if (c !== BODY || y < top) return c
      return y === top || y === sash || y < sash && (wattle(x - 1, y) || wattle(x + 1, y)) ? SATIN : ROBE
    }
    const out = px.map(([x, y, c]) => [x, y, mix(c, robe(x, y, c), d.k)])
    if (d.k === 1) for (const [x, y, h] of [[21, sash + 1, 2], [22, sash + 1, 4], [24, sash + 1, 3]]) for (let j = 0; j < h; j++) out.push([x, y + j, SATIN]) // the sash's knot and ends
    return side() > 0 ? out.map(toLeft) : out
  }
  const sit = (pose, mug = LAP) => ({...SIT, ...pose, coffee: {k: 1, mug, cross: 1}})
  hangabout.trick({
    name: 'coffee', label: 'Coffee by the fire ♨', rarity: 'manual', on: {longFinish: 1},
    frames: [
      [{squash: 2, coffee: {k: .25}}, 150],
      [{dy: -8, tuck: 1, arms: ['up', 'up'], coffee: {k: .5}}, 170], // hops up into the chair as the room fades in
      [{dy: -4, squash: 1, ...HOLD, coffee: {k: .75, mug: LOW}}, 150],
      [{...SIT, coffee: {k: 1, mug: LAP}}, 600],
      [sit({}), 800], // crosses his legs
      [sit(FIRE), 1100], // gazes into the fire
      [sit(SIPPING, SIP), 1000], // a slow sip
      [sit({eyes: 'happy'}), 700],
      [sit(FIRE), 900], [sit({eyes: 'blink'}), 160], [sit(FIRE), 500], // a contented blink
      [sit(SIPPING, SIP), 1000],
      [sit({stretch: 1, eyes: 'happy'}), 600], // a satisfied sigh: in...
      [sit({squash: 1, eyes: 'blink'}, LOW), 900], // ...and out
      [sit({eyes: 'happy'}), 700],
      [{...SIT, coffee: {k: .75}}, 150],
      [{dy: -6, tuck: 1, coffee: {k: .5}}, 150], // hops down as it fades
      [{squash: 2, coffee: {k: .25}}, 150],
      [{}, 200],
    ],
    /** The robe: velvet sleeves with satin cuffs, a satin shawl collar opening in a V, a sash; his legs crossed under the hem. */
    pixels({d, px, pose}){
      if (CHICKEN) return hen(d, px, pose)
      const dy = pose.dy || 0, sq = pose.squash || 0, wide = sq >= 2 ? 1 : 0
      const x0 = OX + 6 - wide, x1 = OX + 29 + wide, bottom = OY + 16 + dy, collar = OY + 8 + dy + sq
      const look = pose.eyes === 'side' ? side() - pose.look : 0 // the frames say right; he looks whichever way the fire is
      const robe = (x, y, c) => {
        if (c === EYE || y >= bottom) return c
        if (x < x0 || x > x1) return x === x0 - 4 || x === x1 + 4 ? SATIN : ROBE
        const r = y - collar, off = Math.abs(x - 21.5), open = 6 - 1.5 * r
        if (r < 0) return off > 10 && r > -3 ? ROBE : c // over his shoulders
        if (r >= 4) return r === 4 ? SATIN : ROBE // the sash
        return off < open ? c : off < open + 2 ? SATIN : ROBE
      }
      let out = px.map(([x, y, c]) => [c === EYE ? x + look : x, y, mix(c, robe(x, y, c), d.k)])
      if (d.k < 1) return out
      const add = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) out.push([x + i, y + j, c]) }
      out = out.filter(([, y]) => y < bottom)
      add(x0 + 1, bottom, x1 - x0 - 1, 2, ROBE); add(x0 + 1, bottom + 2, x1 - x0 - 1, 1, HEM) // draped over the seat
      add(25, collar + 4, 2, 2, SATIN); add(25, collar + 6, 1, 3, SATIN); add(27, collar + 6, 1, 2, SATIN) // the sash's knot and ends
      if (!d.cross) for (const x of [12, 16, 26, 30]) add(x, bottom + 3, 2, 3, BODY)
      else { // one leg straight down, the other crossed over it
        add(23, bottom + 3, 2, 4, SIDE)
        for (const [x, y, w] of [[16, 3, 4], [20, 4, 6], [26, 5, 3]]) add(x, bottom + y, w, 2, BODY)
      }
      return out
    },
    /** Behind him: the wingback, and the fireplace beside it with a portrait over the mantel. */
    behind({ctx, d, now}){
      const r = scene(ctx), both = (x, y, w, h, c) => { r(x, y, w, h, c); r(GW - x - w, y, w, h, c) } // both sides of the chair
      ctx.globalAlpha = d.k
      r(14, 4, 16, 1, LIT); r(11, 5, 22, 1, LIT); r(9, 6, 26, 28, GREEN); both(9, 6, 2, 1, LIT) // its tall back, lit along the crest
      for (const [x, y] of [[17, 9], [13, 12], [17, 15]]) both(x, y, 1, 1, TUFT) // buttoned
      for (let y = 8; y < 24; y++) { const x = Math.max(4, 15 - y); both(x, y, 9 - x, 1, GREEN); both(x, y, 1, 1, LIT); both(8, y, 1, 1, SHADE) } // the wings
      both(4, 24, 5, 1, LIT); both(3, 25, 7, 9, GREEN); both(4, 25, 3, 3, SHADE); both(5, 26, 1, 1, LIT) // rolled arms
      r(10, 32, 24, 1, LIT); r(10, 33, 24, 2, GREEN); r(3, 35, 38, 3, SHADE); r(3, 35, 38, 1, GREEN); both(4, 38, 2, 2, WOOD) // seat, base, feet
      r(41, 38, 15, 2, MORTAR); r(41, 38, 15, 1, STONE_LIT); r(43, 17, 12, 21, STONE) // the hearth and the stone surround
      for (let y = 17; y < 38; y += 3) { r(43, y + 2, 12, 1, MORTAR); for (let x = 43 + (y % 2 ? 2 : 5); x < 55; x += 6) r(x, y, 1, 2, MORTAR) }
      r(41, 15, 15, 2, MANTEL); r(41, 15, 15, 1, MANTEL_LIT); r(43, 17, 1, 1, MANTEL); r(54, 17, 1, 1, MANTEL)
      r(44, 3, 10, 10, '#B8913A'); r(45, 4, 8, 8, '#2A2622'); r(46, 7, 6, 4, BODY); r(47, 8, 1, 1, EYE); r(50, 8, 1, 1, EYE) // an ancestor
      r(47, 26, 4, 1, SOOT); r(46, 27, 6, 1, SOOT); r(45, 28, 8, 10, SOOT) // the arched firebox
      for (let x = 45; x < 53; x++) { // flames licking up off the logs, tallest in the middle
        const h = Math.round((x > 46 && x < 51 ? 5 : 3) + 1.6 * Math.sin(now / 260 + x * 2.3) + Math.sin(now / 170 + x * .9))
        for (let i = 0; i < h; i++) r(x, 35 - i, 1, 1, FLAME[Math.floor(i / h * 4)])
      }
      r(46, 35, 6, 1, '#5C3A22'); r(45, 36, 7, 1, '#4A2E1A'); r(46, 35, 1, 1, '#8A6040'); r(51, 36, 1, 1, '#8A6040') // logs
      r(45, 37, 8, 1, '#3A1A10'); for (const x of [46, 48, 50]) r(x, 37, 1, 1, Math.sin(now / 300 + x) > 0 ? '#FF6A2A' : '#B8401C') // embers
      ctx.globalAlpha = 1
    },
    /** In front: the mug and its steam; then the firelight, warm on the fire's side and dim on the far side. */
    front({ctx, d, now, px, pose}){
      if (d.mug) {
        let [mx, my, tilt] = d.mug
        const f = side(), wy = CHICKEN && wing(pose), dot = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(mx + x, my + y - (tilt && x > 1 ? 1 : 0), 1, 1) }
        ctx.save()
        if (CHICKEN) { // in his wing, its handle away from his beak: mirrored while he faces left, so its steam drifts off ahead of him
          mx = GW - 9 - mx; my += wy
          if (f < 0) { ctx.translate(GW, 0); ctx.scale(-1, 1) }
        }
        ctx.globalAlpha = d.k
        for (let y = 0; y < 5; y++) for (let x = 0; x < 4; x++) dot(x, y, y === 4 ? '#C8BEA9' : y === 0 && !tilt && x % 3 ? '#5A3420' : '#F3EEE2')
        for (const [x, y] of [[4, 1], [5, 1], [5, 2], [4, 3], [5, 3]]) dot(x, y, '#E2DACA') // the handle
        ctx.fillStyle = '#FFFFFF'
        if (!tilt) for (let j = 0; j < 8; j++) for (const w of [0, 1]) { // two wisps of steam, curling up and drifting off his face
          ctx.globalAlpha = d.k * .75 * (1 - j / 8)
          ctx.fillRect(mx + 2 + w + Math.round(j / 3 + Math.sin(j * .9 - now / 280 + w * 2.5)), my - 1 - j - w, 1, 1)
        }
        ctx.restore()
        if (CHICKEN) for (const [x, y, c] of px) if (WING.includes(c) && y >= wy && y < wy + 7 && Math.abs(x - (f > 0 ? 33.5 : 9.5)) < 5) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1) } // his wing wrapped round it
      }
      // Firelight over what's drawn (source-atop leaves the empty canvas clear), flickering slowly.
      const r = scene(ctx), flick = .8 + .2 * Math.sin(now / 310) * Math.sin(now / 530)
      ctx.globalCompositeOperation = 'source-atop'
      for (let x = 2; x < 42; x++) {
        const u = (x - 21.5) / 20
        ctx.globalAlpha = d.k * .3 * (u > 0 ? u * flick : -u)
        r(x, 0, 1, 40, u > 0 ? '#FF9440' : '#140A06')
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1
    },
    glow: d => ` drop-shadow(0 0 4px rgba(255,140,50,${.4 * d.k}))`,
  })
}
