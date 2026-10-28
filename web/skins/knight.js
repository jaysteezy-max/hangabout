// Blue Knight: fan art of the Blue Knight from Castle Crashers, a game by The Behemoth. Fan-made and unofficial, not
// affiliated with or endorsed by The Behemoth. Drawn three-quarters from the game's art: his tall helmet with its white
// faceplate, crouched in his idle with the Sheathed Sword level across his waist in both gauntlets, his shield at his side.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). He's laid out facing right from x 0 and stands X further in;
// facing left is the mirror image. Turned right, his right side is toward you: his near arm is on your left.
{
  const COLORS = ['#669AF7', '#9AC0F9', '#3F6FD6', '#101010'] // BODY (his helmet), TOP (its lit edge), SIDE (its shade), EYE
  const [B, L, D] = COLORS, LINE = '#000000', TEAR = '#D2F0FF'
  const INK = {B, L, D, w: '#FFFFFF', s: '#D9DEEA', c: '#A9B4C8',
    a: '#4A4A4A', A: '#7A7A7A', k: '#383838', t: '#5E5E5E', // armor, its highlight, boots, toes
    p: '#3D3549', P: '#63566E', y: '#8E7FA0'} // his scabbard, its hilt and lit edge, the pommel and the band round the scabbard
  // His helmet, rows 7 to 28 from x 8: w its white faceplate (a band down the middle with a V cut into its top, a bar
  // right across his eyes, pointed at his chin), c the ridge across the band, carried on in D across the blue to its edges.
  const HELMET = [
    '.LBBBBBwBBBBBwB',
    'LBBBBBBwwBBBwwBD',
    'LBBBBBBwwwBwwwBD',
    'LBBBBBBwwwwwwwBD',
    'LBBBBBBwwwwwwwBD',
    'LBBBBBBwwwwwwwBD',
    'LBBBBBBwwwcwwwBD',
    'LBBBBBBwwcwcwwBD',
    'LBBBBBBwcwwwcwBD',
    'LBBBBBBcwwwwwcDD',
    'LBBBBDDwwwwwwwBD',
    'LBBDDBBwwwwwwwBD',
    'LDDBBBBwwwwwwwBD',
    'DBBBBBBwwwwwwwBD',
    'LBwwwwwwwwwwwwww',
    'BBwwwwwwwwwwwwww',
    'BDwwwwwwwwwwwwww',
    'Bwwwwwwwwwwwwwww',
    'BBBBBwwwwwwwwwwB',
    '..BBBBBwwwwwwBB',
    '......BBBwwwBB',
    '.........DwB',
  ]
  const KNOB = ['BB', 'BB', 'BB'] // the round knob on the side of his helmet, x 7 to 8 (1 px proud of it), rows 21 to 23, outlined both sides
  // His body from x 9, row 28: round and white, a blue collar round his chin, a blue cross, a blue belt, its hem.
  const TORSO = ['DBBBBBBBBBBBD', 'wwwwwwBwwwwww', 'wwwwwBBBwwwww', 'wwwwwwBwwwwww', 'wwwwwwBwwwwww', 'BBBBBBBBBBBBB', '.wwwwwwwwwww.']
  // His near arm (in front of him) has the big pauldron, banded, and the bigger gauntlet; the far one is behind him.
  const PAULDRON = [['..aAAAa.', '.aAaaaaa', 'aAAAAAAa', 'aaaaaaaa', '.aaaaaa.'], ['.aAa.', 'aAaaa', 'aaaaa', '.aaa.']]
  const FIST = [['.AAAaa.', 'Aakakaa', 'aakakaA', 'aaaaaaa', '.aaaaa.'], ['.AAa.', 'Akaka', 'akaka', '.aaa.']] // k: the breaks between his fingers
  const GRIP = ['.AAAaa.', 'AakAkAa', 'aaaaaaa', 'aaaaaaa', 'aaaaaaa', 'akakaka', '.aaaaa.'] // his near fist round the grip: knuckles above the sword, fingers below
  const SHIELD = n => ['DDD', ...Array(n).fill('LBD'), 'DDD'] // at his far side, narrow, eye level (row 23, from x 27) to the ground
  // His eyes, as dots from the top-left of each (the near one at x 12, the far one at x 20, row 22). Bored is his normal
  // face: half shut and grumpy, the lid sloping down toward his nose over a half moon.
  const EYES = {
    open: [[[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2]], [[2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2]]],
    blink: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[0, 1], [1, 1], [2, 1]]],
    happy: [[[0, 2], [1, 1], [2, 1], [3, 2]], [[0, 2], [1, 1], [2, 2]]],
    sad: [[[0, 1], [1, 1], [2, 0], [3, 0]], [[0, 0], [1, 1], [2, 1]]],
    angry: [[[0, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2], [3, 2], [3, 3]], [[2, 0], [1, 1], [2, 1], [0, 2], [1, 2], [0, 3]]], // steeper: the inner ends a step lower again
    dizzy: [[[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]]],
  }
  const SHOCKED = ['.##.', '#ww#', '#ww#', '.##.'] // strain: big round eyes, wide open
  // Idle, he's the bored knight: a sigh now and then, and a foot tapped while he waits.
  const BORED = [[{}, 3200], [{eyes: 'blink'}, 130], [{}, 2600], [{eyes: 'blink', squash: 1}, 900], [{}, 2200], [{eyes: 'blink'}, 120], [{}, 180],
    [{eyes: 'blink'}, 120], [{}, 1800], ...[1, 2, 3].flatMap(() => [[{tapLeg: 1, eyes: 'down'}, 220], [{eyes: 'down'}, 220]]), [{}, 600]]
  const DANCE = [...[1, -1, 1, -1].flatMap(face => [[{face, squash: 1, tilt: face * 4, notes: 1}, 190], [{face, dy: -2, sword: 'raise', tilt: -face * 4, notes: 1}, 190]]),
    [{squash: 2, notes: 1}, 120], [{dy: -5, tuck: 1, arms: ['high', 'high'], eyes: 'happy', notes: 1}, 200], [{squash: 2, eyes: 'happy', notes: 1}, 140],
    [{sword: 'raise', eyes: 'happy', notes: 1}, 450], [{}, 200]]
  // Instead of a cartwheel he rolls: crouches, tucks up behind his shield, sword hugged in, somersaults twice and comes up.
  const ROLL = [[{squash: 2, sword: 'hug'}, 140], [{squash: 2, tuck: 1, sword: 'hug', eyes: 'blink'}, 90],
    ...[...Array(16)].map((_, i) => [{squash: 2, tuck: 1, sword: 'hug', eyes: 'blink', tilt: (i + 1) * 45, glide: 160}, 70]),
    [{squash: 2, sword: 'hug'}, 160], [{squash: 1, eyes: 'happy'}, 300], [{}, 200]]
  // His trip: a toe catches, his sword and shield fly out of his hands, he faceplants and they clatter down on his back;
  // he pops up, they slide off onto the ground, he checks nobody saw, and they're back in his hands.
  const STEP = i => [{lift: [[0], [], [1], []][i % 4], dy: i % 2 ? -1 : 0, tilt: 2, glide: 45}, 130]
  const TRIP = [STEP(0), STEP(1),
    [{lift: [1], arms: ['high', 'high'], eyes: 'up', sword: 'flung', tilt: 10, glide: 70}, 110],
    [{tuck: 1, arms: ['high', 'high'], eyes: 'strain', sword: 'flung', tilt: 20, glide: 80}, 90],
    [{prone: 1, eyes: 'strain', sword: 'flung', glide: 40}, 100], // splat
    [{prone: 1, eyes: 'blink', sword: 'onBack', glide: 20}, 160], // clang
    [{prone: 1, eyes: 'blink', sword: 'onBack', glide: 1}, 800],
    [{dy: -4, stretch: 1, tuck: 1, arms: ['up', 'up'], eyes: 'up', sword: 'dropped'}, 130], [{squash: 2, sword: 'dropped'}, 110],
    [{eyes: 'side', look: -1, sword: 'dropped'}, 420], [{eyes: 'side', look: 1, sword: 'dropped'}, 420], [{sword: 'poof', eyes: 'happy'}, 220],
    ...[0, 1, 2, 3].map(STEP), [{}, 200]]
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]], X = 6
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const lift = pose => { // how far his upper body moves: hops, crouches and stretches, his helmet never above row 1
    const sq = pose.squash || 0, st = pose.stretch || 0
    return Math.max(pose.dy || 0, st - sq - 6) + sq - st
  }
  console.assert(HELMET.length === 22, 'Blue Knight: his helmet is rows 7 to 28')

  SKINS.knight = {
    name: 'Blue Knight', label: 'Blue Knight (fan art)', colors: COLORS, sideOn: true, pack: 'fan',
    /** Where costumes find his face, as drawn facing left: his near eye, the top of his helmet, the front of his faceplate. */
    head(pose){
      const y0 = lift(pose)
      return {x: GW - 1 - X - 13, y: 23 + y0, top: 7 + y0, nose: GW - 1 - X - 23}
    },
    // His own poses for Claude's states: the bored knight sighs and taps a foot; thinks with a fist to his chin; raises
    // his sword when he needs you; jumps and holds it up when he's done; leans on it, glum, when he's blocked.
    moods: {
      idle: {intro: BORED, loops: Infinity, rest: BORED},
      thinking: {
        intro: [[{chin: 1, eyes: 'side', look: -1}, 500], [{chin: 1, eyes: 'up'}, 600], [{chin: 1, eyes: 'side', look: 1}, 500], [{chin: 1, eyes: 'blink'}, 120], [{chin: 1}, 400]],
        loops: 3, rest: [[{chin: 1}, 2400], [{chin: 1, eyes: 'up'}, 900], [{chin: 1, eyes: 'side', look: 1}, 700], [{chin: 1, eyes: 'blink'}, 120]],
      },
      needs: (ask => ({intro: [[{eyes: 'up', sword: 'raise'}, 200], [{eyes: 'up'}, 200]], loops: 3, rest: ask}))([[{eyes: 'up', sword: 'raise'}, 1500], [{eyes: 'up', sword: 'raise', squash: 1}, 110],
        [{eyes: 'up', sword: 'raise', dy: -3, tuck: 1}, 140], [{eyes: 'up', sword: 'raise', dy: -1}, 100], [{eyes: 'up', sword: 'raise', squash: 1}, 120]]),
      done: (cheer => ({intro: cheer, loops: 1, rest: BORED}))([[{squash: 2, eyes: 'happy'}, 110],
        [{dy: -3, stretch: 2, arms: ['high', 'high'], tuck: 1, eyes: 'happy'}, 130], [{dy: -5, arms: ['high', 'high'], tuck: 1, eyes: 'happy'}, 170],
        [{dy: -2, stretch: 1, arms: ['high', 'high'], eyes: 'happy'}, 120], [{squash: 2, eyes: 'happy'}, 120], [{sword: 'raise', eyes: 'happy'}, 900]]),
      blocked: (lean => ({intro: lean, loops: 1, rest: lean}))([[{squash: 1, sword: 'lean', eyes: 'sad', cry: 1}, 2800], [{squash: 1, sword: 'lean', eyes: 'blink'}, 450]]),
    },
    // His own frames for some tricks: a knight's dance, sword in hand, raising it on the beat; a roll for the cartwheel;
    // his own trip. For tricks that need both hands (juggling, coffee by the fire) he drops his sword and shield on the
    // ground first, and they come back to his hands with a sparkle at the end.
    get tricks(){
      const shared = typeof TRICKS === 'undefined' ? {} : TRICKS // the page's; absent when the skin is read on its own
      const dropping = name => { const f = shared[name]?.frames; return f && [...f.slice(0, -1).map(([p, ms]) => [{...p, sword: 'dropped'}, ms]), [{sword: 'poof'}, 220], f.at(-1)] }
      return Object.fromEntries(Object.entries({dance: DANCE, cartwheel: ROLL, trip: TRIP, juggle: dropping('juggle'), coffee: dropping('coffee')}).filter(([, f]) => f))
    },
    /** His march, sword in hand: wide strides, near leg then far, bobbing up between them and leaning into it. */
    walk(now, dir, arms){
      const i = Math.floor(now / 130) % 4
      return {face: dir, lift: i === 0 ? [0] : i === 2 ? [1] : [], dy: i % 2 ? -1 : 0, tilt: 2 * dir, ...(arms ? {chin: 1, eyes: 'down'} : {lookX: dir})} // pacing while he thinks: fist to his chin
    },
    /** The Blue Knight in a pose: whichever hands are free hold his sword; legs stride, tuck or bend; then his face. */
    draw(pose, eyeColor){
      const m = new Map(), put = (x, y, c) => m.set(x + ',' + y, [x, y, c])
      const cells = (rows, x0, y0) => rows.flatMap((r, j) => [...r].flatMap((ch, i) => ch === '#' ? [[x0 + i, y0 + j, LINE]] : ch === 'e' ? [[x0 + i, y0 + j, eyeColor]] : INK[ch] ? [[x0 + i, y0 + j, INK[ch]]] : []))
      const under = pts => { // a part tucked under what's drawn: it takes their outline's place, outlined only where nothing is
        for (const p of pts) put(...p)
        for (const [x, y] of pts) for (const [ax, ay] of N4) if (!m.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
      }
      const over = pts => { // a part in front of what's drawn, with its own outline
        const mine = new Set(pts.map(([x, y]) => x + ',' + y))
        for (const [x, y] of pts) for (const [ax, ay] of N4) if (!mine.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE)
        for (const p of pts) put(...p)
      }
      const right = pose.face > 0, y0 = lift(pose), dy = y0 - (pose.squash || 0) + (pose.stretch || 0) // dy as clamped
      const arms = pose.arms || [], [near, far] = right ? arms : [arms[1], arms[0]] // arms are [screen left, screen right]
      const up = a => a === 'up' || a === 'high', reaching = pose.hand != null || pose.reach, crossed = near === 'cross' || far === 'cross'
      const hip = 35 + y0, ground = 38 + dy, lifted = pose.lift || []
      // His sword lives in his near hand (his far hand rests on the scabbard), and his shield stands propped at his far side.
      // Raising his near arm raises the sword; his far hand waves, points or holds things on its own. Crossed arms, or a
      // trick that needs both hands, put them both down on the ground. A trick can say (sword: 'ready', 'raise', 'forward',
      // 'down', 'lean' on it, 'planted', 'dropped', 'hug' held tight, 'flung', 'onBack', 'poof' back in his hands, 'none').
      const hold = pose.sword ?? (crossed ? 'dropped' : up(near) ? 'raise' : 'ready')
      const holding = hold === 'ready' || hold === 'poof', farFree = holding && !up(far) && !reaching && !pose.chin
      const shieldUp = holding || ['raise', 'forward', 'down', 'lean', 'planted'].includes(hold)

      // His sheathed sword from the grip at (x, y) along (dx, dy): the pommel behind the grip, a small crossguard, then
      // the scabbard, a row fatter than the grip (a diagonal one three wide, to look as thick), with a band near its throat.
      const sword = (x, y, dx, dy, grip, len) => {
        const pts = [], [px, py] = dx && dy ? [1, 0] : [-dy, dx], band = i => len > 10 && (i === 6 || i === 7)
        for (let i = -grip - 2; i <= len; i++) {
          const sx = x + dx * i, sy = y + dy * i, wide = dx && dy ? [[sx + 1, sy, INK.p]] : []
          if (i < -grip) pts.push([sx - px, sy - py, INK.P], [sx, sy, INK.P], ...wide)
          else if (i < 1) pts.push([sx - px, sy - py, INK.p], [sx, sy, INK.p], ...wide)
          else if (i === 1) for (let k = -2; k <= 1; k++) pts.push([sx + px * k, sy + py * k, INK.P])
          else pts.push([sx - px, sy - py, band(i) ? INK.y : INK.p], [sx, sy, band(i) ? INK.y : INK.p], ...(dx && dy ? wide : [[sx + px, sy + py, band(i) ? INK.y : INK.p]])) // the scabbard fatter than the grip
        }
        return pts
      }
      // A gauntlet (n 0 his near arm, 1 his far one): its arm from the pauldron to a fist whose top-left is (fx, fy), short
      // and chunky; the pauldron over it, so a raised arm keeps its shoulder.
      const SHOULDER = [[1, 25], [20, 26]]
      const limb = (n, fx, fy) => {
        const [sx, sy] = SHOULDER[n], pts = [], from = [sx + 2, sy + 3 + y0], to = [fx + 1, fy + 1]
        for (let i = 0, k = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])); i <= k; i++) {
          const x = Math.round(from[0] + (to[0] - from[0]) * i / (k || 1)), y = Math.round(from[1] + (to[1] - from[1]) * i / (k || 1))
          for (let w = 0; w < 4 - n; w++) pts.push([x + w, y, INK.a])
        }
        return [...pts, ...cells(PAULDRON[n], sx, sy + y0)]
      }
      const fist = (n, fx, fy) => over(cells(FIST[n], fx, clamp(fy, 1, ground - FIST[n].length)))
      const arm = (n, fx, fy) => { over(limb(n, fx, clamp(fy, 1, ground - FIST[n].length))); fist(n, fx, fy) }
      const shoulder = n => over(cells(PAULDRON[n], SHOULDER[n][0], SHOULDER[n][1] + y0))
      // Where each fist goes when it isn't on the sword: stubby arms, so up is beside his helmet's lower half and high
      // beside its upper half; out in front for props (hand, reach).
      const farFist = reaching ? [26 + (pose.reach || 0), clamp(19 + (pose.hand ?? 8), 18, 33) + y0] : far === 'high' ? [27, 15 + y0] : far === 'up' ? [25, 21 + y0] : [20, 30 + y0]
      const nearFist = near === 'high' ? [-3, 14 + y0] : near === 'up' ? [-3, 19 + y0] : [1, 30 + y0]
      // Where his sword is, where his near fist is on it, and his far fist if it's on it too.
      const HELD = {
        ready: [() => sword(8, 33 + y0, 1, 0, 9, 24), [1, 29 + y0], [21, 29 + y0]],
        forward: [() => sword(14, 30 + y0, 1, 0, 9, 22), [4, 28 + y0], [11, 27 + y0]], // both hands, thrust ahead
        raise: [() => sword(-1, 18 + y0, 0, -1, 3, 17 + y0), [-3, 16 + y0]], // straight up through his near fist, the pommel below it
        down: [() => sword(22, 30 + y0, 1, 1, 2, Math.min(7, ground - 30 - y0)), [19, 27 + y0]], // swung down in front of him
        lean: [() => sword(4, 33 + y0, 0, 1, 3, ground - 35 - y0), [1, 29 + y0]], // point down close at his side, his fist on the grip
      }
      HELD.poof = HELD.ready
      const [blade, nearGrip, farGrip] = HELD[hold] || []
      const sk = Math.round((pose.sink || 0) / 3) // on the ground means the ledge, even while he sinks below it
      const gear = { // his sword and shield when they're not in his hands
        dropped: () => { over(cells(['LLLLLLLLL', 'BBBBBBBBB'], -4, 37 - sk)); over(sword(26, 37 - sk, 1, 0, 3, 10)) }, // lying on the ground beside him
        flung: () => { over(sword(24, 12, 1, -1, 2, 6)); over(cells(['.DD.', 'DLBD', 'DBBD', '.DD.'], 31, 14)) }, // in the air
        onBack: () => { over(sword(10, 12, 1, 0, 3, 18)); over(cells(['LLLLLLLL', 'BBBBBBBB'], 14, 9)) }, // clattered down on his back
        planted: () => over(sword(-2, 22, 0, 1, 2, ground - 23)), // stuck in the ground beside him
      }

      if (pose.prone) { // face down on the ground: his empty-handed standing self given a quarter turn forward, feet behind him
        for (const [x, y, c] of this.draw({eyes: pose.eyes, face: 1, sword: 'none'}, eyeColor)) put(42 - y, x - X + 14, c)
        gear[hold]?.()
      } else {
      if (hold === 'planted' || hold === 'dropped') gear[hold]()
      if (shieldUp) over(cells(SHIELD(Math.max(4, ground - 25 - y0)), 27, 23 + y0))
      const farHolds = farGrip && farFree
      if (farHolds || pose.chin) shoulder(1) // his far arm comes round in front of him, later
      else arm(1, ...farFist)
      over(cells(TORSO, 9, 28 + y0))
      // Two short legs, set wide, under his hem down to his boots. Striding, the lifted boot comes up and well forward and
      // the other pushes back; tucked, both come up under him. Of a stride's pairs the first index lifts: even his near leg.
      const step = lifted.length ? lifted[0] % 2 : pose.tapLeg != null ? pose.tapLeg % 2 : -1
      for (const n of [0, 1]) {
        const raised = pose.tuck ? ground - hip - 1 : step === n ? (lifted.length ? 2 : 1) : 0
        const x = (n ? 17 : 8) + (step === n && lifted.length ? 2 : step === 1 - n && lifted.length ? -1 : 0), leg = []
        for (let y = hip; y < ground - 1 - raised; y++) leg.push([x, y, INK.a], [x + 1, y, y === hip + 1 ? INK.A : INK.a], [x + 2, y, INK.a])
        under([...leg, ...cells(['AAkk.', 'kkkkt'], x - 1, ground - 1 - raised)])
      }
      over(cells(HELMET, 8, 7 + y0)); for (const [x, y, c] of cells(KNOB, 7, 21 + y0)) put(x, y, c); for (const y of [21, 22, 23]) { put(6, y + y0, LINE); put(9, y + y0, LINE) }
      if (pose.eyes !== 'strain') for (const y of [21, 22, 23]) put(18, y + y0, LINE) // the slit between his eyes (his shocked eyes cover it)

      // His near hand on the sword: level, the sword runs in front of it (wrapped in its fingers); raised or swung, the
      // fist is over the sword. His far hand rests on the scabbard behind it.
      const farArm = () => over([...limb(1, ...farGrip).slice(0, -cells(PAULDRON[1], 0, 0).length), ...cells(FIST[1], ...farGrip)]) // one piece, arm to fist; its pauldron is already drawn, behind his helmet
      if (holding) over([...limb(0, ...nearGrip), ...cells(GRIP, ...nearGrip)]) // one bulky limb, shoulder to fist
      else if (hold === 'forward' || hold === 'lean') arm(0, ...nearGrip)
      else if (nearGrip) over(limb(0, ...nearGrip))
      if (farHolds) farArm()
      if (blade) over(blade())
      if (nearGrip && !holding && hold !== 'forward' && hold !== 'lean') fist(0, ...nearGrip)
      if (hold === 'hug') { // tucked up behind his shield, held in front of him, his sword hugged in behind it
        over(cells(['.LLLLLLL.', 'LBBBBBBBL', 'LBBBBBBBL', 'LBBBDBBBL', 'LBBBBBBBL', 'LBBBBBBBL', '.LLLLLLL.'], 10, 28 + y0))
        fist(0, 6, 29 + y0)
      } else if (!nearGrip) arm(0, ...nearFist)
      if (crossed) over(cells(['.AAAAAAAAAAAAA.', 'aaaaaaaaaaaaaaa', '.aaaaaaaaaaaaa.'], 7, 29 + y0)) // forearms folded across his chest
      if (pose.chin) over([...[29, 28, 27].flatMap(y => [[20, y + y0, INK.a], [21, y + y0, INK.a], [22, y + y0, INK.a]]), ...cells(FIST[1], 18, 25 + y0)]) // fist to his chin, thinking
      if (hold === 'flung') gear.flung()
      if (hold === 'poof') for (const [x, y] of [[0, 27], [13, 30], [33, 30], [26, 36]]) for (const [ax, ay] of [[0, 0], ...N4]) put(x + ax, y + ay + y0, ax || ay ? L : '#FFFFFF') // back in his hands, with a sparkle

      // His face, in screen directions: his eyes look about with the same keys as Clawd's and keep his expressions.
      const kind = pose.eyes || 'open', ey = 22 + y0
      const lx = clamp(kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0, -1, 1) * (right ? 1 : -1)
      const ly = kind === 'up' ? -1 : kind === 'down' ? 1 : clamp(pose.lookY || 0, -1, 1)
      if (kind === 'strain') for (const x of [11, 19]) for (const p of cells(SHOCKED, x, ey - 1)) put(...p)
      else {
        const [a, b] = EYES[kind] || EYES.open, [ox, oy] = EYES[kind] && kind !== 'open' ? [0, 0] : [lx, ly]
        for (const [x, y] of a) put(12 + ox + x, ey + oy + y, eyeColor)
        for (const [x, y] of b) put(20 + Math.max(0, ox) + x, ey + oy + y, eyeColor) // never back into the slit
      }
      if (pose.cry) { for (const [x, y] of [[16, 25], [17, 25]]) put(x, y + y0, LINE); put(13, 25 + y0, TEAR); put(13, 26 + y0, TEAR) } // crying: mouth open, a tear
      }

      const out = [...m.values()].map(([x, y, c]) => [right ? x + X : GW - 1 - x - X, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
  console.assert(SKINS.knight.draw({face: 1, dy: -8, stretch: 2, arms: ['high', 'high']}, COLORS[3]).every(([, y]) => y >= 0), 'Blue Knight: he stays in the grid on his highest hop')
}
