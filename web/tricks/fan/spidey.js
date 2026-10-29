// Fan pack: Spider-Man, after Marvel's comics. Fan-made, unofficial, not affiliated with its rights holders.
// He suits up and swings one to three times without touching down: a web shot to the top, bottom or side of a window
// above him, a swing on it (a real pendulum: gravity pulls him through the arc, so he always hangs below the web, never
// over the top of it), a let-go on the upswing, and in mid-air the next web to swing on. After the last swing he flies on
// and lands on whatever is below. A trip, with the web as a page element.
{
  const {GW, OY, PH, BODY, TOP, SIDE, EYE, feet, putFeet, surfaces, edges, scr, desk, rand, pick, mix, head} = hangabout
  const G = 2600 // points per second², the pull he falls with everywhere else
  const PROFILE = hangabout.sideOn && head // side on: the suit laid out in profile
  const PUSHEEN = hangabout.skin === 'pusheen' // side on, but her face looks out at you: a lens on each eye, the web from between them
  // The slime's face is on its side too: a lens on each eye (the near one a row lower), the web from between them, its
  // outline dark, its glints lit, and blue along its bottom edges, clear of its nubs (web/skins/slime.js).
  const SLIME = hangabout.skin === 'slime', SLIME_LINE = '#6A9D23', GLINT = {'#FFFFFF': TOP, '#DCF9B6': TOP}
  const HATTY = hangabout.skin === 'hatty', UP = arm => HATTY ? [arm, 'mid'] : ['mid', arm] // Hatty reaches up with his free hand, the one in front when he turns
  const CHICKEN = hangabout.skin === 'chicken', GRIP = CHICKEN ? {hand: 1} : {} // raised high, his wing is over his back, so he holds the web out front in it
  // The chicken's yellow beak, wing and foot stay red (a bulge in the mask, lit; a glove; a boot), their gold edge a darker
  // red; his blue crest, wattle and tail keep their dark blue as the suit's shade. His lens is a teardrop, pointed at his beak.
  const SHADE = CHICKEN && {'#FFF050': BODY, '#B8960F': SIDE, '#44AEF6': BODY, '#0060A0': SIDE}, GOLD = ['#FFF050', '#B8960F']
  const LENS = SLIME ? [[19, 0], [20, 0], [21, 0], [19, 1], [20, 1], [21, 1], [20, 2], [21, 2], [21, 3]] : CHICKEN ? [[21, -3], [22, -3], [20, -2], [21, -2], [22, -2], [23, -2], [20, -1], [21, -1], [22, -1], [23, -1], [19, 0], [20, 0], [21, 0], [22, 0], [19, 1]]
    : [[20, -2], [21, -2], [19, -1], [20, -1], [21, -1], [22, -1], [19, 0], [20, 0], [21, 0], [22, 0], [20, 1], [21, 1]]
  const RED = {[BODY]: '#D3252E', [TOP]: '#F2615E', [SIDE]: '#951A22'}, BLUE = {[BODY]: '#2659C9', [TOP]: '#5585E8', [SIDE]: '#183B8E'}
  document.head.insertAdjacentHTML('beforeend', `<style>
  .web{position:absolute;height:2px;margin-top:-1px;background:#F2F2F2;box-shadow:0 0 1px rgba(0,0,0,.6);transform-origin:0 50%;pointer-events:none;z-index:9;transition:opacity .3s}
  .splat{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;pointer-events:none;z-index:9;transition:opacity .3s}
  </style>`)

  let web = null // the strand from his hand to where it stuck, and the splat it made there
  function shoot(ax, ay){
    web = {line: document.createElement('div'), splat: document.createElement('div')}
    web.line.className = 'web'; web.splat.className = 'splat'
    web.splat.innerHTML = '<svg viewBox="-7 -7 14 14" width="14" height="14" fill="none" stroke="#F2F2F2" stroke-width="1.3"><path d="M-6 0H6M0-6V6M-4-4L4 4M-4 4L4-4"/><circle r="3"/></svg>'
    Object.assign(web.splat.style, {left: ax + 'px', top: ay + 'px', opacity: 0})
    desk.append(web.line, web.splat)
  }
  /** The strand from (x, y) toward (ax, ay), k of the way there; the splat shows once it gets there. */
  function strand(x, y, ax, ay, k){
    Object.assign(web.line.style, {left: x + 'px', top: y + 'px', width: Math.hypot(ax - x, ay - y) * k + 'px', transform: `rotate(${Math.atan2(ay - y, ax - x)}rad)`})
    if (k >= 1) web.splat.style.opacity = 1
  }
  function cut(){ // he lets go: the web fades where it hangs
    if (!web) return
    const {line, splat} = web
    web = null
    line.style.opacity = splat.style.opacity = 0
    setTimeout(() => { line.remove(); splat.remove() }, 300)
  }
  /** His front hand reaching up (art pixel 36, 17 facing right; Hatty's 33, 20; the chicken's wingtip 38, 19), with his feet at (x, y) and him turned rot degrees about them. */
  function hand(x, y, dir, rot){
    const s = hangabout.size, a = rot * Math.PI / 180, hx = dir * (HATTY ? 11 : CHICKEN ? 16 : 14) * 3 * s, hy = (HATTY ? -20 : CHICKEN ? -21 : -23) * 3 * s
    return [x + hx * Math.cos(a) - hy * Math.sin(a), y + hx * Math.sin(a) + hy * Math.cos(a)]
  }
  /** Longest web he'll swing on from (x, y): his feet clear the floor at the bottom of the arc, and a few swings fit across the screen. */
  const reach = (f, x, y) => Math.min(Math.hypot(x - f.x, f.y - y), surfaces()[0].y + PH - 24 * hangabout.size - y, .3 * hangabout.width)
  const room = swings => swings * 150 * hangabout.size // screen to leave ahead for swings still to come

  /**
   * Somewhere to stick a web from feet at f: the top, bottom or side of a window well above him, at an angle that makes a
   * good swing, on his dir side if given, letting go with room on screen beyond for more swings. On a ledge, a web too long
   * to clear the floor lifts him straight up; in mid-air one too long reels him in along it, keeping his angle under it.
   */
  function anchor(f, dir, air, ahead = 0){
    const s = hangabout.size, W = hangabout.width, wins = edges()
    const covered = (x, y) => wins.some(r => x > r.wx + 2 && x < r.wx + r.w - 2 && y > r.y + 2 && y < r.y + r.h - 2) // over another window, maybe behind it
    const spots = wins.flatMap(r => [...Array(8)].flatMap(() => [
      [rand(r.x0, r.x1), r.y], // the top's visible stretch
      ...[[rand(r.wx, r.wx + r.w), r.y + r.h], [r.wx, rand(r.y, r.y + r.h)], [r.wx + r.w, rand(r.y, r.y + r.h)]].filter(([x, y]) => !covered(x, y)),
    ]))
    const fits = ([x, y]) => {
      const dx = Math.abs(x - f.x), len = Math.hypot(x - f.x, f.y - y), R = reach(f, x, y), at = air ? len : R
      const out = x + (x - f.x) * .85 + Math.sign(x - f.x) * ahead // about as far as he gets before he lets go, and the room beyond
      return y >= scr.top - 2 && f.y - y > 140 * s && R > 130 * s && dx > .35 * at && dx < .85 * at && out > 66 && out < W - 66 // swings out 20–58°, and lets go on screen
        && (!dir || Math.sign(x - f.x) === dir) && (!air || R > .5 * len) // reeled in no more than that: it speeds him up
    }
    let ok = spots.filter(fits)
    if (!ok.length) ok = [...Array(24)].map(() => [rand(80, W - 80), scr.top]).filter(fits) // no window will do: the top of the screen
    return ok.length ? pick(ok) : null
  }

  /**
   * Web-slinging, swings times over: aim and shoot from the ledge, up onto the web, swing, let go. While he has swings
   * left, a new web shot from the top of each flight on catches him in mid-air and carries him on into the next swing; then
   * he flies on and lands.
   */
  function sling(swings){
    let m // the plan, and how far through it he is
    return {
      go: 'move',
      fn(t, dt){
        if (!m) {
          const f = feet(), a = anchor(f, Math.sign(hangabout.width / 2 - f.x), false, room(swings - 1)) || anchor(f) // off toward the room for the rest, if he can
          if (!a) return true // nothing above him to swing from
          const [ax, ay] = a, dx = f.x - ax, R = reach(f, ax, ay)
          // th: his angle out from straight under the web (positive: his feet to its right). y1: where the web takes his
          // weight, zipping him up off the ledge if it's longer than he'll swing on. let: how far up the far side he lets go.
          m = {ax, ay, R, r: R, dir: Math.sign(-dx), x0: f.x, y0: f.y, y1: ay + Math.sqrt(R * R - dx * dx), th: Math.asin(dx / R), rot: 0, phase: 'aim', left: swings - 1}
          m.upT = 200 + (m.y0 - m.y1) * .4 // a longer zip takes longer
          m.w = m.dir * .8; m.let = Math.abs(m.th) * rand(.5, .8) // w: a push off as he goes, in radians per second
          shoot(ax, ay)
        }
        if (m.phase === 'aim' && t >= 320) m.phase = 'up'
        if (m.phase === 'up') { // leaning in under the web as it takes his weight
          const p = Math.min(1, (t - 320) / m.upT), e = 1 - (1 - p) * (1 - p)
          m.rot = -m.th * 180 / Math.PI * e
          putFeet(m.x0, m.y0 + (m.y1 - m.y0) * e, m.rot)
          if (p >= 1) m.phase = 'swing'
        } else if (m.phase === 'swing') { // gravity swings him through the bottom and up the far side
          for (let k = dt; k > 0; k -= 4) {
            const h = Math.min(4, k) / 1000
            if (m.r > m.R) { const r = Math.max(m.R, m.r - 1500 * h); m.w *= (m.r / r) ** 2; m.r = r } // reeled in: like a skater pulling their arms in, he swings faster
            m.w -= G / m.r * Math.sin(m.th) * h; m.th += m.w * h
          }
          m.rot += (-m.th * 180 / Math.PI - m.rot) * (1 - Math.exp(-dt / 60)) // leans in line with the web (catching up after a mid-air catch)
          putFeet(m.ax + m.r * Math.sin(m.th), m.ay + m.r * Math.cos(m.th), m.rot)
          if (m.dir * m.th >= m.let || m.dir * m.w <= 0) { // lets go on the way up (or at the top, if he never got that far) and flies on
            m.vx = m.r * m.w * Math.cos(m.th); m.vy = -m.r * m.w * Math.sin(m.th); m.phase = 'fly'; cut()
          }
        } else if (m.phase === 'fly' || m.phase === 'catch') {
          const f = feet(), W = hangabout.width
          m.vy += G * dt / 1000
          let x = f.x + m.vx * dt / 1000, y = f.y + m.vy * dt / 1000
          if (x < 66 || x > W - 66) { x = Math.max(66, Math.min(W - 66, x)); m.vx = 0; m.left = 0 } // the screen's edge: straight down from there
          m.rot *= Math.exp(-dt / 90) // rights himself
          if (m.phase === 'fly' && m.left && m.vy > -60 && Math.abs(m.vx) > 60) { // from the top of his flight on: the next web, aimed where he'll be when it sticks
            const dir = Math.sign(m.vx), at = {x: x + m.vx * .12, y: y + m.vy * .12 + G * .0072}, a = anchor(at, dir, true, room(m.left - 1)) || anchor(at, dir, true)
            if (a) { [m.ax, m.ay] = a; m.dir = dir; m.phase = 'catch'; m.at = t; m.left--; shoot(...a) }
          }
          if (m.phase === 'catch' && t - m.at >= 120) { // the web goes taut: his speed along the arc carries him on; the rest the web takes
            m.r = Math.hypot(x - m.ax, y - m.ay); m.R = Math.min(m.r, reach({x, y}, m.ax, m.ay)); m.th = Math.atan2(x - m.ax, y - m.ay)
            m.w = (m.vx * Math.cos(m.th) - m.vy * Math.sin(m.th)) / m.r; m.let = Math.abs(m.th) * rand(.5, .8); m.phase = 'swing'
          }
          const on = m.vy > 0 && m.phase !== 'swing' && surfaces().filter(o => x >= o.x0 + 66 && x <= o.x1 + 66 && o.y + PH >= f.y && o.y + PH <= y).sort((a, b) => a.y - b.y)[0]
          if (on) { y = on.y + PH; m.rot = 0; m.phase = 'land'; m.landAt = t; cut() }
          putFeet(x, y, m.rot)
        } else if (m.phase === 'land' && t - m.landAt > 220) return true
        if (web && m.phase !== 'fly' && m.phase !== 'land') {
          const f = feet(), shot = m.phase === 'aim' ? (t - 120) / 140 : m.phase === 'catch' ? (t - m.at) / 120 : 1
          strand(...hand(f.x, f.y, m.dir, m.rot), m.ax, m.ay, Math.max(0, Math.min(1, shot)))
        }
      },
      pose(){
        if (!m) return {spidey: 1}
        const on = {face: m.dir, lookX: 1, spidey: 1}
        if (m.phase === 'aim') return {...on, ...GRIP, squash: 1, arms: UP('high'), eyes: 'up'}
        if (m.phase === 'up' || m.phase === 'catch') return {...on, ...GRIP, stretch: 1, arms: UP('high')}
        if (m.phase === 'swing') return {...on, ...GRIP, arms: UP('high'), tuck: Math.abs(m.th) < .35 ? 1 : 0} // legs up through the bottom of the arc
        if (m.phase === 'fly') return {...on, stretch: 1, arms: UP('up')}
        return {...on, squash: 2}
      },
    }
  }

  /**
   * A side-on skin's suit, laid out as if he faces left, like a dog's Spider-Man costume: red over his head and back
   * with the web spreading from his eye, a blue belly, red boots, and his eye a big white lens rimmed in black. His
   * outline and mouth stay dark. Laid out on Cappy (his eye at x 20, his snout at x 10) and moved to this skin's.
   */
  function profileSuit(d, px, pose){
    const h = head(pose), dy = pose.dy || 0, flip = x => pose.face > 0 ? GW - 1 - x : x // between his art facing left and the screen, either way
    const dark = c => parseInt(c.slice(1, 3), 16) + parseInt(c.slice(3, 5), 16) + parseInt(c.slice(5, 7), 16) < 150
    const cx = PUSHEEN ? h.x + 4 : SLIME ? h.x + 2 : h.x, web = (x, y) => { const dx = x - cx - .5, dv = y - h.y - .5, r = Math.hypot(dx / 1.3, dv); return y <= h.y + 9 && (Math.abs(Math.abs(dx) - 2 * Math.abs(dv)) < .7 || Math.abs(Math.abs(dv) - 2 * Math.abs(dx)) < .7 || Math.abs(r - 6) < .5) }
    const low = new Map(); if (SLIME) for (const [x, y] of px) low.set(x, Math.max(low.get(x) ?? 0, y)) // its lowest pixel in each column
    const out = px.map(([x, y, c]) => {
      const blue = SLIME && low.get(x) >= 33 + dy && y > low.get(x) - 4 // its bottom four rows, following its edges down to its corner (a nub never reaches that low)
      if (c === EYE) return [x, y, mix(EYE, SLIME && d === 1 ? (blue ? BLUE : RED)[BODY] : '#FFFFFF', d)] // the slime's mouth goes under the mask, its eyes under the lenses
      if (c === SLIME_LINE) return [x, y, mix(c, '#2A0A0E', d)] // its outline stays dark round the suit
      if (dark(c)) return [x, y, c]
      const mask = SLIME ? !blue : (flip(x) <= h.nose + 8 && !(y >= h.chin)) || y < h.y + 8, pal = SLIME ? (blue ? BLUE : RED) : mask || y >= 38 + dy || CHICKEN && GOLD.includes(c) ? RED : BLUE // red boots; below a chin, blue all the way across
      const beak = CHICKEN && GOLD.includes(c) && flip(x) > 12 && flip(x) < 18 && y >= h.y && y <= h.chin // x 13 to 17 down the front of his face
      const shade = SLIME ? GLINT[c] : CHICKEN && (beak && c === GOLD[0] ? TOP : SHADE[c]), edge = shade === SIDE // his edges stay a darker shade, unwebbed
      if (beak) return [x, y, mix(c, edge ? '#5E0C13' : web(flip(x), y) ? RED[BODY] : RED[TOP], d)] // lit, a fainter web on it, its edge darker than the web's
      return [x, y, mix(c, mask && !edge && web(flip(x), y) ? '#7E1219' : pal[shade || c] || pal[BODY], d)]
    })
    if (d < 1) return out
    const lens = new Set(LENS.flatMap(([x, v]) => [x + h.x - 20 + ',' + (h.y + v), ...PUSHEEN ? [h.x + 30 - x + ',' + (h.y + v)] : SLIME ? [h.x + 25 - x + ',' + (h.y + v + 1)] : []])) // her far eye's is the mirror image (the slime's near eye's, a row lower)
    for (const k of lens) {
      const [x, y] = k.split(',').map(Number)
      out.push([flip(x), y, '#FFFFFF'])
      for (const [i, j] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) if (!lens.has(x + i + ',' + (y + j))) out.push([flip(x + i), y + j, '#141414'])
    }
    return out
  }

  /**
   * Hatty's suit, worked as he's drawn facing you (mirrored when he faces right): his head red with the web spreading from
   * between his eyes and two big white lenses rimmed in black, red gloves and jacket, a black spider for his tie, blue
   * trousers and red boots. His top hat stays on, Spider-Man Noir style, and his outline stays dark.
   */
  function hattySuit(d, px, pose){
    const h = head(pose), L = x => pose.face > 0 ? 42 - x : x, cx = h.x + 4 // the web spreads from between his eyes
    const web = (x, y) => { const dx = x - cx, dv = y - h.y - .5, r = Math.hypot(dx / 1.2, dv); return Math.abs(dx) < .6 || Math.abs(Math.abs(dx) - 2 * Math.abs(dv)) < .7 || Math.abs(r - 5) < .5 }
    const SUIT = {[BODY]: RED[BODY], [TOP]: RED[TOP], [SIDE]: RED[SIDE], '#915544': RED[BODY], '#9B225D': '#141414', '#4E4E4E': BLUE[BODY]} // his gloves, collar, jacket, tie and trousers (web/skins/hatty.js)
    const boots = Math.max(...px.filter(([, y, c]) => c === '#4E4E4E' && y > h.top).map(([, y]) => y))
    const out = px.map(([x, y, c]) => {
      const ax = L(x)
      if (y < h.top) return [x, y, c] // his hat
      if (c === EYE) return [x, y, mix(EYE, '#FFFFFF', d)]
      if (y < h.top + 12 && ax >= 14 && ax <= 24 && (c !== '#000000' || y === h.y + 3)) return [x, y, mix(c, web(ax, y) ? '#7E1219' : RED[BODY], d)] // his face, tears and mouth under the mask
      const to = y === boots && c === '#4E4E4E' ? RED[BODY] : SUIT[c]
      return to ? [x, y, mix(c, to, d)] : [x, y, c]
    })
    if (d < 1) return out
    const lens = new Set()
    for (const [i, j] of [[-1, -2], [0, -2], [-1, -1], [0, -1], [1, -1], [2, -1], [-1, 0], [0, 0], [1, 0], [2, 0], [1, 1], [2, 1]]) { lens.add(h.x + i + ',' + (h.y + j)); lens.add(h.x + 7 - i + ',' + (h.y + j)) } // slanting down to his nose
    for (const k of lens) {
      const [x, y] = k.split(',').map(Number)
      out.push([L(x), y, '#FFFFFF'])
      for (const [i, j] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) if (!lens.has(x + i + ',' + (y + j))) out.push([L(x + i), y + j, '#141414'])
    }
    return out
  }

  hangabout.trick({
    name: 'spidey', label: 'Spider-Man 🕸', rarity: 'rare', pack: 'fan', on: {highUp: .15}, // high up a window, sometimes he swings down
    trip: () => [
      {go: 'hold', T: 200, pose: {eyes: 'up', spidey: .5}}, // suits up
      {go: 'hold', T: 260, pose: {eyes: 'happy', spidey: 1}},
      sling(1 + Math.floor(rand(0, 3))),
      {go: 'hold', T: 380, pose: {arms: ['mid', 'high'], eyes: 'happy', spidey: 1}},
      {go: 'hold', T: 200, pose: {spidey: .5}},
      {go: 'hold', T: 200, pose: {}},
    ],
    end: cut, // cut short mid-swing: no web left hanging
    /** The suit: red up top with a web over it, blue below the waist, red boots, and big white eyes rimmed in black. */
    pixels({d, px, pose}){
      if (PROFILE) return profileSuit(d, px, pose)
      if (HATTY) return hattySuit(d, px, pose)
      const waist = OY + 12 + (pose.dy || 0), boots = OY + 18 + (pose.dy || 0), eyes = new Set(), eye = px.filter(p => p[2] === EYE)
      const cx = eye.reduce((s, p) => s + p[0], 0) / eye.length + .5, cy = OY + 6 + (pose.dy || 0) // the web spreads from between his eyes
      const web = (x, y) => { const dx = x + .5 - cx, dy = y - cy, r = Math.hypot(dx / 1.6, dy); return Math.abs(dx) < .6 || Math.abs(Math.abs(dx) - 2 * Math.abs(dy)) < .6 || Math.abs(r - 7.5) < .45 }
      const out = px.map(([x, y, c]) => {
        if (c === EYE) { eyes.add(x + ',' + y); return [x, y, mix(EYE, '#FFFFFF', d)] }
        const pal = y < waist || y >= boots ? RED : BLUE
        if (!pal[c]) return [x, y, c]
        return [x, y, mix(c, pal === RED && c === BODY && y < waist && web(x, y) ? '#7E1219' : pal[c], d)]
      })
      if (d < 1) return out
      for (const k of eyes) {
        const [x, y] = k.split(',').map(Number)
        for (const [i, j] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) if (!eyes.has(x + i + ',' + (y + j))) out.push([x + i, y + j, '#141414'])
      }
      return out
    },
  })
}
