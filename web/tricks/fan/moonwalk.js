// Fan pack: the moonwalk, after Michael Jackson's Billie Jean performance (Motown 25, 1983). Fan-made, unofficial, not
// affiliated with its rights holders.
// One sparkly sequined glove, white socks and black loafers; the fedora comes down and he tilts it low; a pose; then the
// moonwalk: facing one way, gliding the other, one foot flat and sliding back while the other is up on its toe, and
// swap. A spin, up on his toes, a tip of the hat, and it all comes off again. A trip, because frames' `glide` always
// faces the way he goes.
{
  const {OX, OY, GW, BODY, SIDE, EYE, mix, putFeet} = hangabout
  const HAT = ['.......KK..KK.......', '.....LKKKKKKKKK.....', '....LKKKKKKKKKKK....', '....BBBBBBBBBBBB....', 'KKKKKKKKKKKKKKKKKKKK']
  const INK = {K: '#17171C', L: '#45464F', B: '#6A6C78'}
  const GLOVE = ['#f6f7fa', '#bfc6d4'] // lowercase, as mix() returns them: front() finds the glove by its color
  const SOCK = {[BODY]: '#ECEEF3', [SIDE]: '#C3C7D1'}, SHOE = {[BODY]: '#1C1C22', [SIDE]: '#0D0D10'}
  const HALF = 420, STEPS = 6, D = 6, SLIDE = HALF * STEPS, SPIN = 480 // each step's ms, how many, how far (art px) one foot slides past the other; the spin's ms
  const ON = {fit: 1, hat: 0, tilt: 1}
  const at = (T, pose, d) => ({go: 'hold', T, pose: {...pose, moonwalk: {...ON, ...d}}})

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
          pose: t => { const u = t + HALF / 2, k = Math.floor(u / HALF); return {face, lookX: 1, swing: k % 2 ? 1 : -1, moonwalk: {...ON, slide: [k % 2, Math.round(D * (u % HALF / HALF - .5))]}} }},
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
      if (d.spin != null) { const c = Math.cos(d.spin); out = out.filter(p => c > 0 || p[2] !== EYE).map(([x, y, col]) => [Math.round(21.5 + (x - 21.5) * c), y, col]) } // his back has no eyes
      return out
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
