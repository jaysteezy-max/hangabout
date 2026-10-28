// Fan pack: the moonwalk, after Michael Jackson's Billie Jean performance (Motown 25, 1983). Fan-made, unofficial, not
// affiliated with its rights holders.
// One sparkly sequined glove, white socks and black loafers; the fedora comes down and he tilts it low; a pose; then the
// moonwalk: facing one way, gliding the other, one foot flat and sliding back while the other is up on its toe, and
// swap. A spin, up on his toes, a tip of the hat, and it all comes off again. A trip, because frames' `glide` always
// faces the way he goes.
{
  const {OX, OY, GW, BODY, SIDE, EYE, mix, putFeet, head} = hangabout
  const HAT = ['.......KK..KK.......', '.....LKKKKKKKKK.....', '....LKKKKKKKKKKK....', '....BBBBBBBBBBBB....', 'KKKKKKKKKKKKKKKKKKKK']
  const INK = {K: '#17171C', L: '#45464F', B: '#6A6C78'}
  const GLOVE = ['#f6f7fa', '#bfc6d4'] // lowercase, as mix() returns them: front() finds the glove by its color
  const SOCK = {[BODY]: '#ECEEF3', [SIDE]: '#C3C7D1'}, SHOE = {[BODY]: '#1C1C22', [SIDE]: '#0D0D10'}
  const HALF = 420, STEPS = 6, D = 6, SLIDE = HALF * STEPS, SPIN = 480 // each step's ms, how many, how far (art px) one foot slides past the other; the spin's ms
  const ON = {fit: 1, hat: 0, tilt: 1}
  const at = (T, pose, d) => ({go: 'hold', T, pose: {...pose, moonwalk: {...ON, ...d}}})
  // A side-on skin (Cappy, the hippo) has no hands: the glove goes on his front foot, socks and loafers on his own four,
  // a smaller fedora over his ears, and in the slide his legs are redrawn sliding. The hat is laid out on Cappy (his eye at
  // x 20) and moved to this skin's eye; his feet are found in his pixels.
  const PROFILE = hangabout.sideOn && head
  const SMALL_HAT = ['.....KK..KK.....', '....LKKKKKKK....', '...LKKKKKKKKK...', '...BBBBBBBBBB...', 'KKKKKKKKKKKKKKKK']
  // Hatty (web/skins/hatty.js) keeps his own top hat for the fedora: he lifts it and sets it back on, pulls it low, tips
  // it. The glove goes on his free hand, socks and loafers on his two legs, and in the slide his legs are redrawn.
  const HATTY = hangabout.skin === 'hatty', TROUSERS = '#4E4E4E', HATTY_LEGS = [16, 21] // each leg's left x

  /**
   * The outfit on a side-on skin, worked as he's drawn, facing left (facing right is the mirror image). His feet are on
   * the row above his lowest (which is all outline), each run of pixels along it that isn't outline, front first; a leg
   * is as many rows as stand clear of his body above it. His toes are a color of their own, which finds a front foot
   * he's lifted.
   */
  function inProfile(d, px, pose, now){
    const L = x => pose.face > 0 ? GW - 1 - x : x, f = d.fit
    let out = px.map(([x, y, c]) => [L(x), y, c])
    const g = Math.max(...out.map(([, y]) => y)) - 1, line = out.find(([, y]) => y === g + 1)[2], legs = []
    for (const [x] of out.filter(([, y, c]) => y === g && c !== line).sort((a, b) => a[0] - b[0])) { const l = legs.at(-1); if (l && x === l.x1 + 1) l.x1 = x; else legs.push({x0: x, x1: x}) }
    const at = new Map(out.map(([x, y, c]) => [x + ',' + y, c])), clear = (x, y) => [undefined, line].includes(at.get(x + ',' + y))
    for (const l of legs) for (l.h = 1; clear(l.x0 - 1, g - l.h) && clear(l.x1 + 1, g - l.h); l.h++);
    const sole = legs[0] && at.get(legs[0].x0 + ',' + g), paw = out.some(([, y, c]) => y < g && c === sole) // front foot up, off the floor
    if (d.slide) { // the flat pair slides back (+x, as he faces left), the other is up on its toes
      const [flat, off] = d.slide, top = g + 1 - Math.max(1, ...legs.map(l => l.h)), moved = []
      legs.forEach((l, i) => { // numbered as his feet are, so the pairs stay put when his front one is up
        const n = i + (paw ? 1 : 0), dx = n % 2 === flat ? off : -off
        for (const [x, y, c] of out) if (x >= l.x0 && x <= l.x1 && y > g - l.h && y <= g && (n % 2 === flat || y < g || x === l.x0)) moved.push([x + dx, y, c])
      })
      const under = out.filter(([, y, c]) => y === top - 1 && c !== line), mine = new Set(moved.map(([x, y]) => x + ',' + y))
      out = out.filter(([, y]) => y < top)
      for (const [x] of under) out.push([x, top, line])
      for (const [x, y] of moved) for (const [a, b] of [[-1, 0], [1, 0], [0, 1], [0, -1]]) if (y + b >= top && !mine.has(x + a + ',' + (y + b))) out.push([x + a, y + b, line])
      out.push(...moved)
    }
    const front = !paw && !d.slide && legs[0], shod = new Set(out.filter(([, y, c]) => y === g && c !== line).map(([x]) => x))
    out = out.map(([x, y, c]) => c === line ? [x, y, c]
      : (c === sole && y < g) || (front && y === g && x >= front.x0 && x <= front.x1) ? [x, y, mix(c, GLOVE[(x * 3 + y * 5 + Math.floor(now / 140)) % 4 ? 0 : 1], f)] // the gloved front foot
      : y === g ? [x, y, mix(c, SHOE[BODY], f)] // loafers
      : y === g - 1 && shod.has(x) ? [x, y, mix(c, SOCK[BODY], f)] // white socks above them
      : [x, y, c])
    if (d.hat != null) {
      const h = head(pose) // over his ears: the brim on the top of his head
      SMALL_HAT.forEach((row, j) => [...row].forEach((ch, i) => {
        if (INK[ch]) out.push([h.x - 6 + i, h.top - SMALL_HAT.length + j + d.hat + (j === SMALL_HAT.length - 1 && i <= 2 ? d.tilt : 0), INK[ch]]) // brim down at the front, over his snout
      }))
    }
    return out.map(([x, y, c]) => [L(x), y, c])
  }
  /** The outfit on Hatty, worked as he's drawn facing you or to his left (facing right is the mirror image). */
  function onHatty(d, px, pose, now){
    const h = head(pose), L = x => pose.face > 0 ? 42 - x : x, f = d.fit, seat = h.y + 12 // his trousers' seat, row 37 standing
    let out = px.map(([x, y, c]) => [L(x), y, c])
    if (d.slide) { // seen from the front: one leg flat on its sole, the other with its heel up on the point of its toe, and swap
      const g = Math.max(...out.map(([, y]) => y)), flat = d.slide[0]
      out = out.filter(([x, y]) => y <= seat || x < 15 || x > 25)
      HATTY_LEGS.forEach((x, n) => {
        const up = n === flat ? 0 : 1 // its loafer lifted a row, all but the toe
        for (let y = seat + 1; y < g - up; y++) out.push([x, y, '#000000'], [x + 1, y, SOCK[BODY]], [x + 2, y, SOCK[BODY]], [x + 3, y, '#000000'])
        for (let i = -1; i <= 3; i++) out.push([x + i, g - up, SHOE[BODY]])
        if (up) out.push([x - 1, g, SHOE[BODY]], [x, g, SHOE[BODY]])
      })
    }
    const low = {}
    for (const [x, y, c] of out) if (c === TROUSERS && y >= seat) low[x] = Math.max(low[x] ?? y, y)
    const shoe = x => HATTY_LEGS.some(x0 => x === x0 + 1 || x === x0 + 2) // where his shoes show his trousers' color
    const hat = (f < 1 ? 0 : Math.max(-4, d.hat ?? 0)) + (d.tilt > 0 ? 1 : 0) // lifted off his head, or pulled down low
    out = out.map(([x, y, c]) => c === BODY && x < 13 ? [x, y, mix(c, GLOVE[(x + y + Math.floor(now / 140)) % 2], f)] // the gloved free hand, half its sequins catching the light (his hands are white already)
      : y < h.top && x >= 13 && x <= 29 ? [x, y + hat, c] // his hat
      : c === TROUSERS && shoe(x) && y === low[x] ? [x, y, mix(c, SHOE[BODY], f)] // loafers
      : c === TROUSERS && shoe(x) && y === low[x] - 1 && y > seat ? [x, y, mix(c, SOCK[BODY], f)] // white socks above them
      : [x, y, c])
    if (d.toes) for (const x in low) if (shoe(+x)) out.push([+x, low[x] + 1, SHOE[BODY]]) // on the points of his loafers
    return out.map(([x, y, c]) => [L(x), y, c])
  }
  /** The spin squeezes him sideways; his back has no eyes. */
  const spun = (d, px) => { if (d.spin == null) return px; const c = Math.cos(d.spin); return px.filter(p => c > 0 || p[2] !== EYE).map(([x, y, col]) => [Math.round(21.5 + (x - 21.5) * c), y, col]) }

  /** His legs mid-moonwalk, as if he faces right: the `flat` pair slides back with its sole on the floor, the other is up on its toe. */
  function slideLegs(top, flat, off){
    const px = []
    for (const [x0, c, pair] of [[OX + 9, SIDE, 0], [OX + 20, SIDE, 0], [OX + 13, BODY, 1], [OX + 24, BODY, 1]]) { // far pair first, so the near one covers it
      const x = x0 + (pair === flat ? -off : off), sock = SOCK[c], shoe = SHOE[c]
      px.push([x, top, c], [x + 1, top, c])
      if (pair === flat) px.push([x, top + 1, sock], [x + 1, top + 1, sock], [x, top + 2, sock], [x + 1, top + 2, sock], [x, top + 3, shoe], [x + 1, top + 3, shoe], [x + 2, top + 3, shoe])
      else px.push([x + 1, top + 1, sock], [x + 2, top + 1, sock], [x + 1, top + 2, shoe], [x + 2, top + 2, sock], [x + 2, top + 3, shoe], [x + 3, top + 3, shoe]) // knee bent, heel up, toe down
    }
    return px
  }

  hangabout.trick({
    name: 'moonwalk', label: 'Moonwalk ☾', rarity: 'rare', pack: 'fan',
    on: {beat: 1, today: () => { const d = new Date(); return d.getMonth() === 9 && d.getDate() === 31 ? 1 : 0 }},
    trip({x, y, here}){
      const lo = here.x0 + 66, hi = here.x1 + 66, back = hi - x > x - lo ? 1 : -1, face = -back // slides toward the side with more room
      const v = D * 3 * hangabout.size / HALF // the planted toe stays put on the floor while he glides past it
      const HAND = ['high', 'mid']
      return [
        at(160, {}, {fit: .5, hat: null, burst: 1}),
        at(160, {arms: HAND}, {hat: -10, tilt: 0, burst: 1}),
        at(110, {arms: HAND}, {hat: -4, tilt: 0}),
        at(160, {squash: 1, arms: HAND}, {tilt: 0}), // on
        at(360, {arms: HAND}), // and tilted low
        at(120, {squash: 1}),
        at(600, {arms: ['high', 'down'], tapLeg: 2, tilt: -5, eyes: 'side', look: 1}), // the pose
        at(200, {face, lookX: 1}),
        {go: 'move', fn: t => { putFeet(Math.max(lo, Math.min(hi, x + back * v * Math.min(t, SLIDE))), y); return t >= SLIDE },
          pose: t => { const u = t + HALF / 2, k = Math.floor(u / HALF); return {face, lookX: 1, swing: k % 2 ? 1 : -1, ...(PROFILE && {arms: ['up', 'mid']}), moonwalk: {...ON, slide: [k % 2, Math.round(D * (u % HALF / HALF - .5))]}} }}, // side on, he slides with his gloved paw up
        {go: 'hold', T: SPIN, pose: t => { const p = Math.min(1, t / SPIN); return {stretch: 1, arms: ['down', 'down'], moonwalk: {...ON, spin: 4 * Math.PI * (1 - (1 - p) * (1 - p))}} }},
        at(450, {dy: -1, stretch: 1, arms: ['down', 'down']}, {toes: 1}), // up on his toes
        at(120, {squash: 1}),
        at(500, {arms: HAND, eyes: 'happy'}, {hat: -2, tilt: 0}), // a tip of the hat
        at(160, {eyes: 'happy'}, {fit: .5, hat: -7, tilt: 0, burst: 1}),
        at(140, {}, {fit: .2, hat: -13, tilt: 0, burst: 1}),
        {go: 'hold', T: 200, pose: {}},
      ]
    },
    /** The outfit: the glove (his left hand facing you, the near one turned), socks and loafers, the fedora; the spin squeezes it all. */
    pixels({d, px, pose, now}){
      if (PROFILE) return spun(d, inProfile(d, px, pose, now))
      if (HATTY) return spun(d, onHatty(d, px, pose, now))
      const face = pose.face || 0, m = x => face < 0 ? GW - 1 - x : x // px come mirrored when he faces left: work as if he faces right
      const wide = (pose.squash || 0) >= 2 ? 1 : 0, legTop = OY + 16 + (pose.dy || 0), f = d.fit
      const gloved = x => !face ? x < OX + 6 - wide : m(x) >= (pose.half ? OX + 31 : OX + 29) + wide
      const isLeg = (x, y) => y >= legTop && x >= OX + 7 && x <= OX + 28
      const low = {}
      for (const [x, y] of px) if (isLeg(x, y)) low[x] = Math.max(low[x] ?? y, y)
      let out = px.filter(([x, y]) => !(d.slide && isLeg(x, y))).map(([x, y, c]) => {
        if (c === BODY && y < legTop && gloved(x)) return [x, y, mix(c, GLOVE[(x * 3 + y * 5 + Math.floor(now / 140)) % 4 ? 0 : 1], f)] // sequins catching the light
        if (!isLeg(x, y) || !SOCK[c]) return [x, y, c]
        return [x, y, low[x] === y ? mix(c, SHOE[c], f) : low[x] - y <= 2 ? mix(c, SOCK[c], f) : c]
      })
      if (d.toes) for (const k in low) if (low[+k + (k < 22 ? -1 : 1)] != null) out.push([+k, low[k] + 1, SHOE[BODY]]) // on the points of his loafers
      if (d.slide) out.push(...slideLegs(legTop, ...d.slide).map(([x, y, c]) => [m(x), y, c]))
      if (d.hat != null) {
        const top = OY + (pose.squash || 0) + (pose.dy || 0) - (pose.stretch || 0), x0 = face && !pose.half ? OX + 7 : OX + 8
        HAT.forEach((row, j) => [...row].forEach((ch, i) => {
          if (INK[ch]) out.push([m(x0 + i), top - HAT.length + j + d.hat + (j === HAT.length - 1 && i >= 13 ? d.tilt : 0), INK[ch]]) // tilted: the brim snapped down at the front
        }))
      }
      return spun(d, out)
    },
    /** In front: the glove twinkles; sparkles as the outfit comes and goes. */
    front({ctx, d, px, now}){
      const star = (x, y, r) => {
        ctx.fillStyle = '#DCEBFF'; for (let i = 1; i <= r; i++) for (const [a, b] of [[i, 0], [-i, 0], [0, i], [0, -i]]) ctx.fillRect(x + a, y + b, 1, 1)
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, 1, 1)
      }
      if (d.burst) [[6, 16], [37, 21], [22, 9], [31, 37], [11, 33]].forEach(([x, y], i) => star(x, y, (Math.floor(now / 70) + i) % 3))
      const g = px.filter(p => GLOVE.includes(p[2])), r = [0, 1, 2, 1, 0, 0, 0, 0][Math.floor(now / 90) % 8]
      if (g.length && r) star(Math.min(...g.map(p => p[0])) + 1, Math.min(...g.map(p => p[1])), r)
    },
  })
}
