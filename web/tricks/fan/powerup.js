// Fan pack: a Super Saiyan power-up, after Dragon Ball. Fan-made, unofficial, not affiliated with its rights holders.
// Charge (trembling, pebbles rising, the screen rumbling), a white flash, then golden spiky hair, golden flames,
// teal eyes and crackling lightning, then a happy power-down.
{
  const {OX, LIFT, GW, GH, EYE, recolor, head} = hangabout
  const PROFILE = hangabout.sideOn && head // side on: the mane in profile
  const PUSHEEN = hangabout.skin === 'pusheen' // her face looks out at you: the mane square on her head, bangs either side of her brow
  const GOLD = ['#FFF3B0', '#FFD84D', '#FFB938', '#FF8F2A'] // white-hot core → orange tips

  /** The mane: a cap over his head, seven spikes fanning up and out, two bangs over his brow. */
  function mane(d, px, pose){
    const hair = new Map()
    if (d !== 'on' && d !== 'release') return hair
    if (hangabout.skin === 'chicken') return chickenMane(hair, d, pose)
    if (PROFILE) return profileMane(hair, d, pose)
    if (hangabout.skin === 'hatty') return hattyMane(hair, d, px, pose)
    const headTop = Math.min(...px.map(([, y]) => y)), bx = OX + 6, scale = d === 'release' ? .4 : 1
    const put = (x, y, c) => hair.set(x + ',' + y, c)
    for (let x = bx - 1; x <= bx + 24; x++) for (let y = headTop; y < headTop + 2; y++) put(x, y, '#F7CF3A') // the cap
    // [base center along his head, base width, height, lean per row]: tall in the middle, sweeping out at the sides
    const SPIKES = [[0, 5, 7, -.95], [4, 6, 10, -.55], [9, 6, 13, -.22], [13, 6, 14, .08], [17, 6, 12, .3], [21, 6, 10, .6], [25, 5, 7, .95]]
    for (const [off, bw, h0, lean] of SPIKES) {
      const h = Math.max(2, Math.round(h0 * scale))
      for (let r = 0; r < h; r++) {
        const w = Math.max(1, Math.round(bw * (1 - r / h))), x0 = Math.round(bx + off + lean * r - w / 2)
        for (let i = 0; i < w; i++) put(x0 + i, headTop - 1 - r, r >= h - 2 ? '#FFFBD6' : i < w / 2 ? '#FFF39A' : '#F7CF3A') // lit left, shaded right, white-hot tips
      }
    }
    for (const [x0, len] of [[bx + 6, 3], [bx + 15, 4]]) // bangs falling over his brow
      for (let r = 0; r < len; r++) for (let i = 0; i < Math.max(1, 3 - r); i++) put(x0 + i + Math.floor(r / 2), headTop + 2 + r, '#F7CF3A')
    return hair
  }
  /** A side-on skin's, drawn facing left: a cap over his head and ears, six spikes swept up and back, two bangs over his brow. */
  function profileMane(hair, d, pose){
    const {x: ex, top: t} = head(pose), scale = d === 'release' ? .4 : 1
    const put = (x, y, c) => { x += PUSHEEN ? -3 : ex - 20; hair.set((pose.face > 0 ? GW - 1 - x : x) + ',' + y, c) } // laid out on Cappy, whose eye is at x 20
    for (let x = 14; x <= 27; x++) for (let y = t - (x > 14 ? 2 : 0); y <= t + 1; y++) put(x, y, '#F7CF3A') // the cap
    for (const [off, bw, h0, lean] of [[0, 4, 7, -.25], [3, 5, 11, .05], [6, 5, 13, .35], [9, 5, 11, .7], [12, 4, 8, 1.1]]) {
      const h = Math.max(2, Math.round(h0 * scale))
      for (let r = 0; r < h; r++) {
        const w = Math.max(1, Math.round(bw * (1 - r / h))), x0 = Math.round(14 + off + lean * r - w / 2)
        for (let i = 0; i < w; i++) put(x0 + i, t - 3 - r, r >= h - 2 ? '#FFFBD6' : i < w / 2 ? '#FFF39A' : '#F7CF3A')
      }
    }
    for (const [x0, len] of PUSHEEN ? [[16, 2], [22, 2]] : [[12, 3], [15, 4]]) for (let r = 0; r < len; r++) for (let i = 0; i < Math.max(1, 3 - r); i++) put(x0 + i + Math.floor(r / 2), t + 1 + r, '#F7CF3A') // bangs
    return hair
  }
  /** The chicken's, drawn facing left: a cap hugging his head over his crest, ragged at his brow, and five solid gold spikes rising off it about as wide as his crown. */
  function chickenMane(hair, d, pose){
    const t = head(pose).top, scale = d === 'release' ? .4 : 1, put = (x, y, c) => hair.set((pose.face > 0 ? GW - 1 - x : x) + ',' + y, c)
    const CAP = [[15, 1, 2], [16, 0, 3], [17, 0, 2], [18, -1, 1], [19, -1, 2], [20, -3, 2], [21, -3, 2], [22, -3, 1], [23, -4, 2], [24, -4, 2], [25, -3, 3], [26, -2, 3], [27, 0, 2], [28, 1, 2]] // [x, top, bottom] from the top of his head
    for (const [x, a, b] of CAP) for (let y = t + a; y <= t + b; y++) put(x, y, '#F2BE22')
    for (const [x0, bw, h0, lean] of [[16, 4, 5, -.7], [19, 5, 8, -.25], [22, 5, 9, .1], [25, 5, 8, .45], [28, 3, 5, .9]]) { // [base x, base width, height, lean per row]
      const h = Math.max(2, Math.round(h0 * scale)), base = t + CAP.find(([x]) => x === x0)[1]
      for (let r = 0; r < h; r++) {
        const w = Math.max(1, Math.round(bw * (1 - r / h))), x1 = Math.round(x0 + lean * r - w / 2)
        for (let i = 0; i < w; i++) put(x1 + i, base - r, i < w / 2 ? '#FFE04A' : '#F2BE22') // solid gold, lit down one side: paler reads as flame
      }
    }
    return hair
  }
  /** Hatty's, drawn facing you: his hat stays on, so the spikes flare out from behind it, with gold at its sides and two bangs over his brow. */
  function hattyMane(hair, d, px, pose){
    const {top: t} = head(pose), scale = d === 'release' ? .4 : 1, L = x => pose.face > 0 ? 42 - x : x
    const put = (x, y, c) => hair.set(L(x) + ',' + y, c)
    for (const [x0, x1, y] of [[12, 14, t - 3], [11, 14, t - 2], [11, 14, t - 1], [27, 29, t - 3], [27, 30, t - 2], [27, 30, t - 1]]) for (let x = x0; x <= x1; x++) put(x, y, '#F7CF3A') // at his hat's sides
    // [base center, base width, height, lean per row]: from behind his hat, tall in the middle, sweeping out at the sides
    for (const [x0b, bw, h0, lean] of [[12, 5, 8, -1.1], [15, 6, 11, -.6], [19, 6, 14, -.18], [23, 6, 13, .22], [27, 6, 11, .62], [30, 5, 8, 1.1]]) {
      const h = Math.max(2, Math.round(h0 * scale))
      for (let r = 0; r < h; r++) {
        const w = Math.max(1, Math.round(bw * (1 - r / h))), x0 = Math.round(x0b + lean * r - w / 2)
        for (let i = 0; i < w; i++) put(x0 + i, t - 2 - r, r >= h - 2 ? '#FFFBD6' : i < w / 2 ? '#FFF39A' : '#F7CF3A')
      }
    }
    for (const [x0, len] of [[16, 3], [21, 4]]) for (let r = 0; r < len; r++) for (let i = 0; i < Math.max(1, 3 - r); i++) put(x0 + i + Math.floor(r / 2), t + r, '#F7CF3A') // bangs
    for (const [x, y] of px) if (y < t) hair.delete(x + ',' + y) // behind his hat
    return hair
  }
  let lastPx = null, lastHair = null
  const hairFor = (d, px, pose) => px === lastPx ? lastHair : (lastPx = px, lastHair = mane(d, px, pose)) // behind and front share one mane per frame

  const DOWN = ['down', 'down']
  hangabout.trick({
    name: 'powerUp', label: 'Power up ⚡', rarity: 'rare', pack: 'fan', on: {comeback: 1}, // tests pass after failing
    frames: [
      [{squash: 1, arms: DOWN, eyes: 'strain', powerUp: 'charge'}, 250],
      [{squash: 2, arms: DOWN, eyes: 'strain', powerUp: 'charge'}, 400],
      [{squash: 2, arms: DOWN, eyes: 'strain', powerUp: 'charge', shake: 1}, 550], // the screen starts to rumble
      [{stretch: 1, arms: DOWN, eyes: 'strain', powerUp: 'flash', shake: 1}, 180],
      ...[...Array(11)].map((_, i) => [{dy: -1 - i % 2, arms: DOWN, powerUp: 'on'}, 182]), // powered up, he floats and bobs
      [{dy: -1, arms: DOWN, powerUp: 'release'}, 260],
      [{eyes: 'happy', arms: ['up', 'up']}, 550], [{}, 200],
    ],
    pixels({d, px, now}){
      if (d === 'charge') { const jx = Math.floor(now / 45) % 2 ? 1 : -1; return px.map(([x, y, c]) => [x + jx, y, c]) } // trembling with effort
      return d === 'on' || d === 'release' ? recolor(px, {[EYE]: '#2EE6C8'}, 1) : px // teal eyes
    },
    /** Behind him: a flickering white aura while he charges; golden flames once he's powered up, rising off his hair. */
    behind({ctx, d, px, now, pose}){
      const hair = hairFor(d, px, pose)
      const shape = [...px.map(([x, y]) => [x, y]), ...[...hair.keys()].map(k => k.split(',').map(Number))]
      const filled = new Set(shape.map(([x, y]) => x + ',' + y)), ring = []
      for (const [x, y] of shape) for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const k = (x + a) + ',' + (y + b)
        if (!filled.has(k)) { filled.add(k); ring.push([x + a, y + b]) }
      }
      if (d === 'charge') {
        ctx.fillStyle = '#FFFFFF'
        for (const [x, y] of ring) if (Math.random() < .55) { ctx.globalAlpha = .35 + Math.random() * .55; ctx.fillRect(x, y, 1, 1) }
        ctx.globalAlpha = 1
        return
      }
      if (d === 'flash') return
      const grow = d === 'release' ? .35 : 1
      ctx.fillStyle = GOLD[1]; ctx.globalAlpha = .85
      for (const [x, y] of ring) ctx.fillRect(x, y, 1, 1)
      // Flame tongues licking up from every column of him.
      const top = new Map()
      for (const [x, y] of shape) if (!top.has(x) || y < top.get(x)) top.set(x, y)
      for (const [x, yTop] of top) {
        const h = Math.max(1, Math.round((2 + 4 * Math.abs(Math.sin(x * 1.3 + now / 75))) * grow))
        for (let i = 1; i <= h; i++) { ctx.fillStyle = GOLD[Math.min(3, Math.floor(i / h * 3.99))]; ctx.globalAlpha = 1 - i / (h + 1) * .6; ctx.fillRect(x, yTop - 1 - i, 1, 1) }
      }
      // And flickering at his sides.
      const rows = new Map()
      for (const [x, y] of shape) { const r = rows.get(y) || [x, x]; rows.set(y, [Math.min(r[0], x), Math.max(r[1], x)]) }
      ctx.fillStyle = GOLD[2]; ctx.globalAlpha = .7
      for (const [y, [x0, x1]] of rows) if (Math.sin(y * 2.1 + now / 60) > .2 * grow) { ctx.fillRect(x0 - 2, y, 1, 1); ctx.fillRect(x1 + 2, y, 1, 1) }
      ctx.globalAlpha = 1
    },
    /** In front: the white flash, the golden mane, crackling lightning, rising pebbles or sparks. */
    front({ctx, d, px, now, pose}){
      if (d === 'flash') { ctx.fillStyle = '#FFFFFF'; for (const [x, y] of px) ctx.fillRect(x, y, 1, 1); return }
      const hair = hairFor(d, px, pose)
      if (hair.size) {
        // A dark gold outline so every spike reads clearly against the flames behind it.
        const body = new Set(px.map(([x, y]) => x + ',' + y))
        ctx.fillStyle = '#8A5410'
        for (const k of hair.keys()) {
          const [x, y] = k.split(',').map(Number)
          for (const [a, b] of [[1, 0], [-1, 0], [0, -1], [1, -1], [-1, -1]]) { const n = (x + a) + ',' + (y + b); if (!hair.has(n) && !body.has(n)) ctx.fillRect(x + a, y + b, 1, 1) }
        }
        for (const [k, c] of hair) { const [x, y] = k.split(',').map(Number); ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1) }
        if (d === 'on' && now % 520 < 90) { // lightning crackles down one side, then the other
          const base = Math.floor(now / 520) % 2 ? 39 : 4
          ctx.fillStyle = '#CFEFFF'
          for (let y = 6 + LIFT; y < 24 + LIFT; y++) ctx.fillRect(base + (Math.floor(y / 3) % 2 ? 1 : -1), y, 1, 1)
        }
      }
      const charging = d === 'charge'
      for (let i = 0; i < 9; i++) { // pebbles lift off the ground while he charges; golden sparks rise once he's powered
        const y = GH - 1 - ((now * (charging ? .008 : .022) + i * 4.3) % (GH - 2))
        ctx.fillStyle = charging ? (i % 2 ? '#8C7B6B' : '#B4A491') : (i % 3 ? '#FFD84D' : '#FFF3B0')
        ctx.globalAlpha = charging ? .9 : .8
        ctx.fillRect((i * 7 + 3) % GW, Math.floor(y), 1, 1)
      }
      ctx.globalAlpha = 1
    },
    glow: d => d === 'charge' ? ' drop-shadow(0 0 3px rgba(255,255,255,.6))'
      : ' drop-shadow(0 0 4px rgba(255,205,70,.95)) drop-shadow(0 0 12px rgba(255,170,40,.6))', // flash, on and release
  })
}
