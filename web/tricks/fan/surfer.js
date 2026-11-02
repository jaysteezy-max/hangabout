// Fan pack: the Silver Surfer, after Marvel's comics. Fan-made, unofficial, not affiliated with its rights holders.
// Power cosmic twinkles up and he turns to chrome; his board appears, he hops on and takes off across your screen. The
// board flies like a glider: its lift grows with his speed, so a dive carries him up the next rise and a climb slows him
// into the next dive. He rides two to four of those waves, now and then looping the loop, out through the screen's edge
// and in at the other, leaving a trail of power cosmic hanging on the page. Then he glides in, skids to a stop on
// whatever is below, kicks the board up into his hand and the shine fades. A trip, with the trail as page elements.
{
  const {GW, GH, PH, BODY, TOP, SIDE, EYE, feet, putFeet, surfaces, scr, desk, rand, pick, mix} = hangabout
  const G = 2600, K_LOOP = 1.8, PULL = 3 // the pull he falls with everywhere else; lift, in his weights at trim speed, for a loop and a hard turn
  const CHROME = {[BODY]: '#C3CCD6', [TOP]: '#EEF3F8', [SIDE]: '#8793A1', [EYE]: '#3B4654'}
  const CHICKEN = hangabout.skin === 'chicken' // his crest, wattle and tail, beak and wing, toes and mouth chromed too (web/skins/chicken.js); the glint only on his body, inside his outline
  if (CHICKEN) Object.assign(CHROME, {'#44AEF6': '#A4AFBC', '#0060A0': '#626E7D', '#FFF050': '#E2E8EF', '#B8960F': '#7D8896', '#F2BE2E': '#B8C2CE', '#6B2020': '#3B4654'})
  const CAPPY = hangabout.skin === 'cappy' // his snout, its highlight and his toes chromed too (web/skins/cappy.js); the glint only on his body; the board caught in his raised paw
  if (CAPPY) Object.assign(CHROME, {'#86655F': '#A4AFBC', '#8F6F69': '#B8C2CE', '#7A3A3E': '#626E7D'})
  // The slime's outline, glints and cheeks chromed too (web/skins/slime.js), so it's silver all over, not green-rimmed.
  if (hangabout.skin === 'slime') Object.assign(CHROME, {'#6A9D23': '#4F5A67', '#DCF9B6': '#E2E8EF', '#EC9291': '#AEB8C4'})
  const ON = {cosmic: 1, chrome: 1, board: 1}
  document.head.insertAdjacentHTML('beforeend', `<style>
  .cosmic{position:absolute;pointer-events:none;z-index:9;box-shadow:0 0 4px #9FD3FF;animation:cosmic .8s ease-in forwards}
  @keyframes cosmic{to{opacity:0;transform:scale(.3)}}
  </style>`)

  /** A mote of power cosmic left on the page at (x, y), an art pixel or two across, fading where it hangs. */
  function mote(x, y){
    const el = document.createElement('div'), w = Math.round(3 * hangabout.size * (Math.random() < .3 ? 2 : 1))
    el.className = 'cosmic'
    Object.assign(el.style, {left: x - w / 2 + 'px', top: y - w / 2 + 'px', width: w + 'px', height: w + 'px', background: pick(['#FFFFFF', '#BFE6FF', '#9FD3FF'])})
    el.onanimationend = () => el.remove()
    desk.append(el)
  }

  /**
   * The flight, from a standing start toward ride.dir. Lift turns his velocity toward his head without changing his speed,
   * so only gravity (and drag, gliding in) changes how fast he goes, and he never climbs higher than his take-off speed
   * can carry him. Modes: surf (riding the waves), loop, glide (in to land, flaring if he's coming in steep), skid (down,
   * sliding to a stop).
   */
  function surf(ride){
    let m
    return {
      go: 'move',
      fn(t, dt){
        const s = hangabout.size, W = hangabout.width, VT = 540 * Math.sqrt(s), S = surfaces(), floor = S[0].y + PH
        if (!m) {
          const f = feet(), a = rand(.1, .4), V = Math.min(VT * rand(1.4, 1.9), Math.sqrt(2 * G * Math.max(0, f.y - scr.top - 90 * s))) // no faster than keeps him under the menu bar
          m = {x: f.x, y: f.y, vx: ride.dir * V * Math.cos(a), vy: -V * Math.sin(a), dir: ride.dir, waves: 2 + Math.floor(rand(0, 3)), mode: 'surf', rot: 0}
        }
        if (t > 6000 && (m.mode === 'surf' || m.mode === 'loop')) m.mode = 'glide' // enough: in to land
        if (m.mode === 'skid') { // friction slows him to a stop, at the end of the ledge if it comes first
          const o = m.on, v = Math.sign(m.vx) * Math.max(0, Math.abs(m.vx) - .7 * G * dt / 1000), to = m.x + v * dt / 1000, x = Math.max(o.x0 + 66, Math.min(o.x1 + 66, to))
          m.vx = x === to ? v : 0; m.x = x
          if (!m.vx && t - m.at > 200) { ride.dir = m.dir; return true }
        } else for (let k = dt; k > 0; k -= 4) {
          const h = Math.min(4, k) / 1000, V = Math.hypot(m.vx, m.vy), was = m.vy, lx = Math.max(66, Math.min(W - 66, m.x)) // just through an edge, he lands where the ledges end
          let lift = 1, drag = 0
          if (m.mode === 'loop') {
            lift = K_LOOP
            const a = Math.atan2(m.vy, m.vx)
            if (m.was != null) m.turned += Math.abs((a - m.was + 3 * Math.PI) % (2 * Math.PI) - Math.PI)
            m.was = a
            if (m.turned >= 1.9 * Math.PI) m.mode = 'surf'
          } else if (m.mode === 'surf' && m.vy > 0 && floor - m.y < 30 * s + m.vy * .3) lift = PULL // a bottom turn, clear of the floor
          else if (m.mode === 'glide') {
            const below = S.filter(o => lx >= o.x0 + 66 && lx <= o.x1 + 66 && o.y + PH >= m.y).sort((a, b) => a.y - b.y)[0] || S[0]
            drag = 2.5 / VT; lift = below.y + PH - m.y < 30 * s + m.vy * .5 && m.vy > .4 * V ? 2.5 : .9 // flares if he's coming in steep
          }
          const turn = m.dir * lift * G / VT * h, c = Math.cos(turn), sn = Math.sin(turn), slow = Math.exp(-drag * V * h)
          ;[m.vx, m.vy] = [(m.vx * c + m.vy * sn) * slow, (-m.vx * sn + m.vy * c) * slow + G * h]
          let x = m.x + m.vx * h
          const y = m.y + m.vy * h
          if (x < 0 || x > W) x += x < 0 ? W : -W // out through the screen's edge and in at the other
          const on = m.vy > 0 && (m.mode === 'glide' ? S.filter(o => lx >= o.x0 + 66 && lx <= o.x1 + 66 && o.y + PH >= m.y && o.y + PH <= y).sort((a, b) => a.y - b.y)[0] : y >= floor && S[0]) // gliding in he lands on anything; riding, only the floor stops him
          if (on) { m.x = lx; m.y = on.y + PH; m.on = on; m.mode = 'skid'; m.at = t; break }
          m.x = x; m.y = y
          if (m.mode === 'surf' && was > 0 && m.vy <= 0) { // the bottom of a wave: the last one, or now and then a loop if there's room above
            if (--m.waves <= 0) m.mode = 'glide'
            else if (Math.random() < .4 && m.y - scr.top > 330 * s) { m.mode = 'loop'; m.turned = 0; m.was = null }
          }
        }
        // He leans along his path: nose up climbing, upside down at the top of a loop, near level gliding in and skidding.
        const path = m.mode === 'skid' ? 0 : Math.atan2(m.dir * m.vy, m.dir * m.vx) * 180 / Math.PI
        const aim = m.mode === 'glide' ? Math.max(-35, Math.min(35, path)) : path
        m.rot += ((aim - m.rot + 540) % 360 - 180) * (1 - Math.exp(-dt / 40))
        m.rot = (m.rot + 540) % 360 - 180 // kept within a half turn either way: past that the page would take him for being on a wall
        putFeet(m.x, m.y, m.rot)
        if (m.mode !== 'skid' || m.vx) { // the trail, from the board's tail (14 art pixels behind his feet, 3 up), turned with him
          const r = m.rot * Math.PI / 180, bx = -m.dir * 42 * s, by = -9 * s
          mote(m.x + bx * Math.cos(r) - by * Math.sin(r) + rand(-3, 3) * s, m.y + bx * Math.sin(r) + by * Math.cos(r) + rand(-3, 3) * s)
        }
      },
      pose(t){
        const i = Math.floor(t / 220) % 2, on = {face: m?.dir ?? ride.dir, dy: i ? -5 : -4, arms: ['mid', 'mid'], swing: 1, surfer: {...ON, ride: 1, bob: i ? -1 : 0}}
        if (!m) return on
        if (m.mode === 'skid') return {...on, dy: -3, squash: 1} // crouched, skidding
        if (m.mode === 'loop') return {...on, arms: ['up', 'up'], eyes: 'happy'}
        return on
      },
    }
  }

  hangabout.trick({
    name: 'surfer', label: 'Silver Surfer 🏄', rarity: 'rare', pack: 'fan', on: {windowSurf: 1}, // you drag his window fast
    trip({x}){
      const ride = {dir: Math.sign(hangabout.width / 2 - x) || 1} // off toward the more room; the way he ends up facing, once he's down
      return [
        {go: 'hold', T: 260, pose: {eyes: 'up', surfer: {cosmic: .5, chrome: .3}}},
        {go: 'hold', T: 200, pose: {eyes: 'up', surfer: {cosmic: 1, chrome: .7}}},
        {go: 'hold', T: 180, pose: {surfer: {cosmic: 1, chrome: 1, board: .5}}},
        {go: 'hold', T: 220, pose: {surfer: ON}},
        {go: 'hold', T: 140, pose: {squash: 2, surfer: ON}},
        {go: 'hold', T: 120, pose: {face: ride.dir, dy: -6, tuck: 1, arms: ['up', 'up'], surfer: ON}}, // hops on
        surf(ride),
        {go: 'hold', T: 240, pose: () => ({face: ride.dir, squash: 1, ...CAPPY && {arms: ['high', 'high']}, surfer: {cosmic: 1, chrome: 1, board: 'up'}})}, // kicks it up into his hand
        {go: 'hold', T: 240, pose: () => ({face: ride.dir, arms: ['up', 'mid'], eyes: 'happy', surfer: {cosmic: .6, chrome: .6}})},
        {go: 'hold', T: 200, pose: {eyes: 'happy', surfer: {cosmic: .3, chrome: .3}}},
        {go: 'hold', T: 200, pose: {}},
      ]
    },
    end: () => desk.querySelectorAll('.cosmic').forEach(el => el.remove()), // cut short mid-flight: no trail left hanging
    /** Chrome all over, with a glint sweeping across him (never his eyes) once he's fully silver. */
    pixels({d: s, px, now}){
      if (!s.chrome) return px
      const band = Math.floor(now / 40) % 60, shine = s.chrome >= 1
      return px.map(([x, y, c]) => [x, y, shine && (CHICKEN || CAPPY ? c === BODY : c !== EYE) && ((x + y - band) % 60 + 60) % 60 < 3 ? '#FFFFFF' : CHROME[c] ? mix(c, CHROME[c], s.chrome) : c])
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
        const x = CAPPY ? 5 : 4, bx = dir > 0 ? 42 - x : x // Cappy's against his paw, held up in front of his face
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
