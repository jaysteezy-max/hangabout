// Clay: a little grey clay guy with no face, after the "tiny guys" of Tiny Terraces (Mr.VuVuu). Original art: a round
// head on a soft pear body, and arms and legs that bend at the elbow and knee, ending in round mitts and flat feet. Drawn
// facing you; turned to walk he leans the way he's going, and turned right he's the mirror image.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). He's built from round shapes on the grid, not rows of art:
// his head and body are discs and capsules, each arm and leg two capsules from a joint, and every pixel is shaded by
// the shape in front of it: lit to the upper left, shaded to the lower right, with a dark outline round him and inside
// him wherever an arm or leg crosses in front. His own pose keys (in his walk, moods and trick frames) bend him directly:
// armL, armR, legL, legR: [upper, lower] directions in degrees (0 down, 90 to his left on screen, 180 up), for the arm
//   and leg on your left and right as he faces you;
// liftL, liftR: a foot raised toward you (its shin foreshortens); crouch: 0 to .5, his legs folding as he sinks;
// lean: degrees he leans to your left; headX, headY: his head nudged; air: off the ground, so bent legs don't plant.
{
  const COLORS = ['#9DA3B1', '#BAC0CC', '#767C8B', '#16181D'] // BODY, TOP, SIDE, EYE (never drawn: he has no eyes)
  const [B, T, S] = COLORS, L = '#2A2D36', LIGHT = [-.55, -.83], M = 43 // turned right, x is drawn at M - x
  const BUILD = {rh: 3.8, rb: 3.6, body: 2.5, leg: [6.8, 6.2], arm: [4.6, 4.2], rl: 1.5, ra: 1.5}
  const rad = d => d * Math.PI / 180, dirOf = a => [Math.sin(rad(a)), Math.cos(rad(a))]
  const snap = v => Math.floor(v) + .5 // a pixel's centre: joints sit on them, so limbs stay even tubes at any angle
  const mirrorArm = ([a, b]) => [-a, -b]

  /** His pixels for a pose in his own keys, drawn facing you or leaning to your left. */
  function figure(pose, grounded = true){
    const {rh, rb, leg, arm, rl, ra} = BUILD, body = BUILD.body + (pose.tall || 0), shapes = [], ends = {}
    let part = 'body', root = null
    const add = s => shapes.push({...s, part, root})
    const limb = (name, x, y, [l1, l2], [a1, a2], r, hand) => {
      part = name; root = [x, y]
      const k = name[0] === 'a' ? (Math.abs(a1) > 100 ? 1.3 : 1) * (pose.reachK || 1) : 1 - (pose.crouch || 0) // clay: a raised arm stretches; crouching, his legs fold toward you
      const [d1x, d1y] = dirOf(a1), ex = snap(x + d1x * l1 * k), ey = snap(y + d1y * l1 * k)
      const lift = name === 'legL' ? pose.liftL || 0 : name === 'legR' ? pose.liftR || 0 : 0
      const [d2x, d2y] = dirOf(a2), hx = snap(ex + d2x * (l2 * k - lift)), hy = snap(ey + d2y * (l2 * k - lift))
      ends[name] = [hx - .5, hy - .5] // the pixel at the end of the limb: a mitt's middle, an ankle
      add({ax: x, ay: y, bx: ex, by: ey, r}); add({ax: ex, ay: ey, bx: hx, by: hy, r})
      const out = name.endsWith('L') ? -1 : 1
      if (hand === 'foot') add({ax: hx, ay: hy + 1, bx: hx + out, by: hy + 1, r: 1.15, floor: Math.floor(hy + 1)}) // flat along the sole
      else add({x: hx + out * .5, y: hy + .5, r: 1.6, mitt: [hx + out * .5, hy + .5]}) // a round mitt
      part = 'body'; root = null
    }
    const cx = 22, [ux, uy] = dirOf(180 + (pose.lean || 0))
    const hipY = 38 - leg[0] - leg[1] - .5, chestX = cx + ux * body, chestY = hipY + uy * body
    const headX = Math.round(chestX + ux * (rb + rh - .5) + (pose.headX || 0)), headY = Math.floor(chestY + uy * (rb + rh - .5) + (pose.headY || 0)) + .5
    const armAt = side => [snap(chestX + side * (rb + ra - .3)), snap(chestY - 1)], legAt = side => snap(cx + side * 2.5)
    // back to front: legs, neck, shoulders, belly, body, head, then both arms in front of him
    limb('legR', legAt(1), snap(hipY), leg, pose.legR || [0, 0], rl, 'foot')
    limb('legL', legAt(-1), snap(hipY), leg, pose.legL || [0, 0], rl, 'foot')
    add({ax: chestX, ay: chestY, bx: headX, by: headY, r: 1.4})
    add({ax: chestX - rb + 1.6, ay: chestY - .3, bx: chestX + rb - 1.6, by: chestY - .3, r: 3.1})
    add({x: cx + (chestX - cx) * .3, y: hipY - .5, r: rb + 1.4, belly: 1})
    add({ax: cx, ay: hipY, bx: chestX, by: chestY, r: rb})
    add({x: headX, y: headY, r: rh, head: 1})
    limb('armR', ...armAt(1), arm, pose.armR || [28, 30], ra)
    limb('armL', ...armAt(-1), arm, pose.armL || [-28, -30], ra)

    // Rasterize: the frontmost shape under each pixel owns it and shades it.
    let x0 = 99, x1 = -99, y0 = 99, y1 = -99
    for (const s of shapes) for (const [x, y] of s.ax == null ? [[s.x, s.y]] : [[s.ax, s.ay], [s.bx, s.by]]) { x0 = Math.min(x0, x - s.r); x1 = Math.max(x1, x + s.r); y0 = Math.min(y0, y - s.r); y1 = Math.max(y1, y + s.r) }
    const m = new Map()
    for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) {
      const px = x + .5, py = y + .5
      for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i]
        let nx, ny
        if (s.ax == null) { nx = px - s.x; ny = py - s.y } else {
          const vx = s.bx - s.ax, vy = s.by - s.ay, t = Math.max(0, Math.min(1, ((px - s.ax) * vx + (py - s.ay) * vy) / (vx * vx + vy * vy || 1)))
          nx = px - (s.ax + vx * t); ny = py - (s.ay + vy * t)
        }
        const d = Math.hypot(nx, ny)
        if (d > s.r || y > s.floor) continue
        const lit = d ? (nx * LIGHT[0] + ny * LIGHT[1]) / d : 0, edge = s.r - d
        let c = s.r < 2 ? (edge < .9 && d && nx / d > .45 ? S : B) // a limb: shaded down its right-hand edge
          : edge < 1.25 && lit > .7 ? T : edge < (s.head ? 1.6 : 1) && lit < -.45 ? S : B
        if (s.belly && c === S && ny / d < .6) c = B // his belly is shaded underneath only
        m.set(x + ',' + y, [x, y, c, i]); break
      }
    }
    const shapeAt = (x, y) => { const v = m.get(x + ',' + y); return v && shapes[v[3]] }
    // An arm's shade goes on its outer edge only: lying against his body it would read as a strap.
    for (const v of m.values()) { const r = shapeAt(v[0] + 1, v[1]); if (v[2] === S && shapes[v[3]].part[0] === 'a' && r && r.part[0] !== 'a') v[2] = B }
    // An arm or leg crossing in front of another part gets a dark edge there, away from where it joins him.
    const inner = new Set()
    for (const v of m.values()) {
      const back = shapes[v[3]]
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !m.has((v[0] + a) + ',' + (v[1] + b)))) continue
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = m.get((v[0] + a) + ',' + (v[1] + b)), front = n && shapes[n[3]]
        if (front && front.root && front.part !== back.part && n[3] > v[3] && Math.hypot(v[0] + .5 - front.root[0], v[1] + .5 - front.root[1]) > 3) { v[2] = L; inner.add(v[0] + ',' + v[1]); break }
      }
    }
    for (const v of m.values()) { const up = shapeAt(v[0], v[1] - 1); if (up && up.head && !shapes[v[3]].head && shapes[v[3]].part === 'body') v[2] = S } // shade under his chin
    // Standing, his lowest foot is on row 38 (bent legs sink him); in the air, he's where he'd stand, then dy higher.
    const feet = [...m.values()].filter(v => shapes[v[3]].part[0] === 'l').map(v => v[1]), stand = 38 - Math.max(...feet)
    if (grounded === 'stand') return stand
    const dy = (grounded && !pose.air ? stand : STAND) + (pose.dy || 0)
    const sh = ([x, y]) => [x, y + dy]
    figure.at = {head: {x: headX, y: headY - .5 + dy, r: rh, top: Math.round(headY - rh + dy)}, hands: [sh(ends.armL), sh(ends.armR)], feet: [sh(ends.legL), sh(ends.legR)]}
    const px = [...m.values()].map(([x, y, c]) => [x, y + dy, c]), seen = new Set(px.map(([x, y]) => x + ',' + y)), out = px.slice()
    for (const [x, y] of px) for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + a) + ',' + (y + b); if (!seen.has(k)) { seen.add(k); out.push([x + a, y + b, L]) } }
    // A lone inner-edge pixel is a speck, not a line: it goes back to shade.
    const ink = new Map(out.map(([x, y, c]) => [x + ',' + y, c]))
    for (const p of out) if (inner.has(p[0] + ',' + (p[1] - dy)) && ![[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].some(([a, b]) => ink.get((p[0] + a) + ',' + (p[1] + b)) === L)) p[2] = S
    return out
  }
  const STAND = figure({}, 'stand') // how far his standing pose sits him down onto row 38

  // The shared pose keys, worked into his own. arms: [screen left, screen right] as he faces you.
  const ARM = {down: [-10, -6], mid: [-28, -30], up: [-105, -150], high: [-150, -156], cross: [-25, 85]}
  /** A shared pose (as tricks write them) as one in his own keys, drawn facing you or to your left. */
  function own(p){
    const q = {...p}, right = p.face > 0 && !p.half
    if (p.face && !p.half && q.lean == null) { q.lean = 3; q.headX ??= -1 } // turned, he leans the way he's going
    const arms = p.arms || [], [al, ar] = right ? [arms[1], arms[0]] : arms
    q.armL ??= ARM[al] || (p.eyes === 'sad' ? ARM.down : ARM.mid); q.armR ??= mirrorArm(ARM[ar] || (p.eyes === 'sad' ? ARM.down : ARM.mid))
    if (p.swing) { q.armL = [q.armL[0] - 14 * p.swing, q.armL[1] - 14 * p.swing]; q.armR = [q.armR[0] - 14 * p.swing, q.armR[1] - 14 * p.swing] }
    if (p.hand != null || p.reach) { // his front hand, held out the way he faces at a height (as Clawd's: 4 is about his shoulder)
      const [sx, sy] = [17.5, 21.5], tx = 9 - (p.reach || 0) - (p.swing || 0), ty = 20 + (p.hand ?? 4) + (p.dy || 0)
      const a = Math.atan2(tx - sx, ty - sy) * 180 / Math.PI, len = Math.hypot(tx - sx, ty - sy)
      q.armL = [a, a]; q.reachK = Math.max(.7, Math.min(1.4, len / 9))
    }
    const lift = p.lift || []
    if (lift.length) q[lift[0] % 2 ? 'liftR' : 'liftL'] ??= 3 // two legs, so a lift raises one: the first listed
    if (p.tapLeg != null) q[p.tapLeg % 2 ? 'liftR' : 'liftL'] ??= 1
    const sq = p.squash || 0
    if (sq) { q.crouch ??= sq > 1 ? .18 : .08; if (sq > 1) { q.legL ??= [-8, 4]; q.legR ??= [8, -4] } }
    if (p.stretch) q.tall = p.stretch
    if (p.tuck) { q.crouch = p.dy ? .4 : .45; q.legL ??= [-35, 15]; q.legR ??= [35, -15]; if (p.dy) q.air = 1 }
    if ((p.dy || 0) < 0) q.air = 1
    // No face: the eyes' moods show in his head and arms instead.
    const e = p.eyes
    if (e === 'side') q.headX ??= Math.sign(p.look ?? 1) * (right ? -1 : 1)
    else if (e === 'up') q.headY ??= -1
    else if (e === 'down' || e === 'sad') q.headY ??= 1
    else if (e === 'dizzy') q.headX = Math.sign(p.tilt || 1)
    else if (e === 'happy' && !p.arms && !p.hand) { q.armL = [-60, -75]; q.armR = [60, 75] }
    else if (e === 'strain') q.crouch ??= .12
    else if (p.lookX || p.dx) q.headX ??= Math.sign(p.lookX || p.dx) * (right ? -1 : 1)
    return q
  }

  // His walk: a cheerful waddle. One foot lifts and that side's arm flares out for balance, he rocks onto the other
  // foot, and dips a pixel as each foot lands; leaning the way he's going.
  const WALK = [
    [{lean: 3, armL: [-38, -52], armR: [24, 18], liftL: 3}, 4],
    [{lean: 3, crouch: .08}, 0],
    [{lean: 3, armL: [-24, -18], armR: [38, 52], legR: [6, 0], liftR: 3}, -4],
    [{lean: 3, crouch: .08}, 0],
  ]
  const STEP = i => [{...WALK[i % 4][0], tilt: WALK[i % 4][1], glide: 45}, 160]

  // Cheering: arms flung up in a V; a star jump; a squat.
  const CHEER = {armL: [-150, -156], armR: [150, 156]}
  const HOP = [
    [{crouch: .2, armL: [-40, -20], armR: [40, 20]}, 120],
    [{dy: -4, air: 1, ...CHEER, legL: [-28, -28], legR: [28, 28]}, 160],
    [{dy: -6, air: 1, ...CHEER, legL: [-30, -30], legR: [30, 30]}, 140],
    [{dy: -2, air: 1, ...CHEER}, 100],
    [{crouch: .2, ...CHEER}, 120], [CHEER, 500],
  ]
  const WAVE2 = [[{armL: [-150, -170], armR: [150, 140]}, 200], [{armL: [-150, -140], armR: [150, 170]}, 200]] // both arms waving overhead
  const CHIN = {armL: [-75, 150], headX: 1} // a mitt up at his head, thinking
  const MOVES = { // his frames for tricks, in place of the shared ones made for a small four-legged body
    hop: [...HOP, [{}, 200]],
    wave: [...WAVE2, ...WAVE2, ...WAVE2, [{}, 200]],
    stretch: [[{crouch: .1}, 160], [{tall: 2, ...CHEER, liftL: 0}, 750], [{tall: 1, armL: [-120, -150], armR: [120, 150]}, 180], [{crouch: .1}, 220], [{}, 300]], // up on his toes, arms high
    yawn: [[{crouch: .08}, 260], [{tall: 1, armL: [-130, -175], armR: [40, 50], headY: -1}, 950], [{crouch: .08}, 200], [{}, 250]],
    scratch: [...[...Array(4)].flatMap(() => [[{armL: [-120, 160], headX: 1}, 170], [{armL: [-110, 150], headX: 1}, 170]]), [{}, 200]], // a mitt scratching the top of his head
    lookAround: [[{headX: -1, lean: 2}, 650], [{headX: 1, lean: -2}, 650], [{headY: -1}, 450], [{}, 200]],
    sit: [[{crouch: .2}, 220], [{crouch: .45, armL: [-10, 30], armR: [10, -30]}, 1600], [{crouch: .45, armL: [-10, 30], armR: [10, -30], headY: 1}, 1100], [{crouch: .1}, 220]],
    dance: [
      ...[0, 1, 2, 3, 0, 1, 2, 3].map(i => [{...WALK[i][0], tilt: WALK[i][1] * 1.5, notes: 1}, 190]),
      [{crouch: .2, notes: 1}, 120], [{dy: -5, air: 1, ...CHEER, legL: [-30, -30], legR: [30, 30], notes: 1}, 200],
      [{crouch: .2, ...CHEER, notes: 1}, 140], [{...CHEER, notes: 1}, 450], [{}, 200],
    ],
  }

  // His own poses for Claude's states.
  const LOOK = [[{headX: -1}, 600], [{}, 200], [{headX: 1}, 600]]
  const IDLE = [[{}, 3200], ...LOOK, [{}, 2400], [{liftL: 1}, 160], [{}, 160], [{liftR: 1}, 160], [{}, 1800], [{crouch: .08}, 520]]
  const TAP = i => [{...CHIN, liftR: i % 2}, 160]
  const SLUMP = [[{crouch: .45, headY: 1, armL: [-6, 8], armR: [6, -8]}, 2600], [{crouch: .45, headY: 2, armL: [-6, 8], armR: [6, -8]}, 600]] // sat down in a heap, a sigh
  const NAP = [[{crouch: .45, headY: 1, headX: 1, armL: [-6, 8], armR: [6, -8]}, 2400], [{crouch: .45, headY: 2, headX: 1, armL: [-6, 8], armR: [6, -8]}, 2400]]
  const STATES = {
    idle: {intro: IDLE, loops: Infinity, rest: IDLE},
    thinking: {intro: [...[0, 1, 2, 3].map(TAP), [CHIN, 900]], loops: 3, rest: [[CHIN, 2400], ...[0, 1, 2, 3].map(TAP)]},
    needs: {intro: [...WAVE2, ...WAVE2], loops: 3, rest: [[{armL: [-150, -156]}, 1500], ...WAVE2, [{crouch: .1, armL: [-150, -156]}, 110], [{dy: -3, air: 1, armL: [-150, -156], liftL: 3}, 140], [{armL: [-150, -156]}, 100]]},
    done: {intro: HOP, loops: 1, rest: IDLE},
    blocked: {intro: SLUMP, loops: 1, rest: SLUMP},
    nap: {intro: NAP, loops: Infinity, rest: NAP},
  }

  SKINS.clay = {
    name: 'Clay', colors: COLORS, mirror: M,
    walk(now, dir, arms){
      const i = Math.floor(now / 160) % 4, [p, tilt] = WALK[i]
      return {face: dir, ...p, tilt, ...(arms && arms.some(a => a !== 'mid') ? {arms, armL: undefined, armR: undefined} : {})}
    },
    tricks: MOVES, moods: STATES,
    /** Where his parts are in a pose, as drawn facing you or to your left (facing() turns a costume with him): his head
     * (x: the line between its middle two columns, y: its middle row, r: its radius, top: its top row); his hands and ankles, screen left first. For costumes and props, since
     * with no eye he has no head(). */
    at(pose){ figure(own(pose)); return figure.at },
    wiggle: t => ({armL: [-60, -75], armR: [60, 75], tilt: Math.sin(t / 500 * Math.PI * 3) * 6}), // a happy wriggle, arms up
    /** Clay in a pose: his own keys bend him directly; the shared ones (arms, lift, squash, face...) are worked into them. */
    draw(pose){
      const q = own(pose), right = pose.face > 0 && !pose.half
      const out = figure(Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined)))
      return out.map(([x, y, c]) => [(right ? M - x : x) + (pose.ox || 0), y, c])
    },
  }
}
