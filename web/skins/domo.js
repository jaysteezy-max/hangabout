// Domo: fan art of Domo (Domo-kun), NHK's mascot, created by Tsuneo Gōda. Fan-made and unofficial, not affiliated with
// or endorsed by NHK. Drawn front on after NHK's own sticker art, with proportions measured from a 21x23 fan sprite
// (cqrissa on Dinopixel), redrawn at the pet's size.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). His body, arms and legs are filled in and outlined all round,
// then his face is painted on: two dot eyes and his wide-open mouth with its rows of teeth.
{
  const COLORS = ['#82482A', '#91532F', '#6A3920', '#120A06'] // BODY, TOP (his lit top), SIDE (his shaded side), EYE
  const LINE = '#2A160C', RED = '#D41421', TOOTH = '#FFFFFF'
  const M = 42 // a mirrored x is M - x: he's symmetric about x 21
  // His screen-left arm in each position, as [x, rows below the top of his head]; his other arm is its mirror image.
  const ARMS = {
    mid: [[14, 9], [13, 10], [14, 10], [12, 11], [13, 11], [14, 11], [12, 12], [13, 12], [12, 13]], // out and down, the mitt hanging: his rest
    down: [[14, 10], [13, 11], [14, 11], [13, 12], [13, 13], [13, 14]],
    up: [[14, 9], [13, 8], [14, 8], [12, 7], [13, 7], [12, 6], [13, 6]],
    high: [[14, 8], [13, 7], [14, 7], [13, 6], [12, 5], [13, 5], [12, 4], [13, 4], [12, 3]],
    cross: [[14, 10], [13, 11], [12, 12], [13, 12], [13, 13], [14, 13]], // hands on his hips: his arms are too short to fold
  }
  const TEETH = 'RWRWRWRWR' // the row of tooth points along each jaw, x 17 to 25
  // His eyes in each expression, as dots around the top-left of his screen-left eye (the other eye is its mirror image).
  const EYES = {
    blink: [[0, 1], [1, 1]], happy: [[-1, 1], [0, 0], [1, 0], [2, 1]],
    angry: [[0, 0], [1, 0], [1, 1], [2, 1]], sad: [[-1, 1], [0, 1], [0, 0], [1, 0]], // slanted down to the middle, or up to it
    strain: [[0, -1], [1, 0], [0, 1]], dizzy: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  }
  // His walk, a stiff waddle on his stumpy legs (the stickers' walk): one leg up, his whole block rocking onto the
  // other, his arms swinging out from his sides, his head bobbing up over each planted leg.
  const stride = i => ({lift: [[0], [], [2], []][i], stretch: i % 2, tilt: [-3, 0, 3, 0][i], swing: i < 2 ? -1 : 1})
  // His own poses for Claude's states: stoic while idle (a look round, his hands on his hips now and then), a fist up
  // while he thinks, a cheer when it's done, fists up and stomping in a rage when it's blocked, then a slump.
  const IDLE = [[{}, 3000], [{eyes: 'blink'}, 130], [{}, 1600], [{eyes: 'side', look: -1}, 500], [{eyes: 'side', look: 1}, 500], [{}, 1400],
    [{arms: ['cross', 'cross']}, 1800], [{arms: ['cross', 'cross'], eyes: 'blink'}, 130], [{arms: ['cross', 'cross']}, 900], [{}, 1500], [{squash: 1}, 450]]
  const THINK = [[{arms: ['cross', 'high'], eyes: 'up'}, 900], [{arms: ['cross', 'high'], eyes: 'side', look: -1}, 700], [{arms: ['cross', 'high'], eyes: 'up', squash: 1}, 260], [{arms: ['cross', 'high'], eyes: 'side', look: 1}, 700], [{arms: ['cross', 'high'], eyes: 'blink'}, 130]]
  const RAGE = [...[-2, 2, -2, 2, -2, 2].map((tilt, i) => [{arms: ['up', 'up'], eyes: 'angry', tilt, squash: i % 2}, 140]), [{arms: ['up', 'up'], eyes: 'angry', squash: 1}, 900], [{squash: 2, arms: ['down', 'down'], eyes: 'sad'}, 2400], [{squash: 2, arms: ['down', 'down'], eyes: 'blink'}, 300]]
  const STATES = {
    idle: {intro: IDLE, loops: Infinity, rest: IDLE},
    thinking: {intro: THINK, loops: 3, rest: THINK},
    done: {intro: [[{squash: 2, eyes: 'happy'}, 110], [{dy: -4, stretch: 1, tuck: 1, arms: ['high', 'high'], eyes: 'happy'}, 160], [{dy: -2, arms: ['high', 'high'], eyes: 'happy'}, 120], [{squash: 2, arms: ['high', 'high'], eyes: 'happy'}, 120], [{arms: ['cross', 'cross'], eyes: 'happy'}, 1200]], loops: 1, rest: IDLE},
    blocked: {intro: RAGE, loops: 1, rest: RAGE.slice(-2)},
  }
  const turn = pose => pose.face ? (pose.half ? -1 : -2) : 0 // turned, his face slides toward the side he faces
  const topOf = pose => 18 + (pose.dy || 0) + (pose.squash || 0) - (pose.stretch || 0) // his first row under the outline

  SKINS.domo = {
    name: 'Domo', label: 'Domo (fan art)', colors: COLORS, pack: 'fan',
    mirror: M, // turned right he's mirrored, x to M - x: facing() turns a costume drawn on him the same way
    /** Where costumes find his face, as drawn facing you or to his left: his screen-left eye (its top-left pixel) and the top of his head. */
    head(pose){ const t = topOf(pose); return {x: Math.max(16, 17 + turn(pose)), y: t + 1, top: t - 1} },
    walk(now, dir, arms){ return {face: dir, ...stride(Math.floor(now / 170) % 4), arms: arms || ['mid', 'mid']} },
    moods: STATES,
    /** Domo in a pose: his body squashes and stretches above his legs, his stubby arms take each position, then his face. */
    draw(pose, eyeColor){
      const dy = pose.dy || 0, t = topOf(pose), wide = (pose.squash || 0) >= 2 ? 1 : 0, s = turn(pose)
      const g = new Map(), put = (x, y, c) => g.set(x + ',' + y, c), has = (x, y) => g.has(x + ',' + y)
      // His body, from the top of his head (its corners rounded off) down to his legs, which stay on the ground.
      for (let y = t; y <= 33 + dy; y++) for (let x = 15 - wide + (y === t); x <= 27 + wide - (y === t); x++) put(x, y, COLORS[0])
      // His legs: two stumps with an arch between them, narrow at the top. A lifted leg is a row shorter; tucked, both are.
      const lift = pose.lift || [], up = [lift.includes(0) || [0, 1].includes(pose.tapLeg), lift.includes(2) || [2, 3].includes(pose.tapLeg)]
      const LEG = [20, 19, 18, 18, 18] // the inner edge of his left leg, row by row from the crotch
      for (const i of [0, 1]) for (let k = 0; k < (pose.tuck ? 3 : up[i] ? 4 : 5); k++) for (let x = 15; x <= LEG[k]; x++) put(i ? M - x : x, 34 + dy + k, COLORS[0])
      // His arms: each side's position, or the front one held out at a height (hand, as Clawd's arms measure it) and further (reach).
      const arms = pose.arms || ['mid', 'mid'], swing = pose.face ? pose.swing || 0 : 0
      for (const i of [0, 1]) {
        let pts = ARMS[arms[i]] || ARMS.mid
        if (!i && (pose.hand != null || pose.reach)) {
          const hy = Math.max(5, Math.min(14, 2 + (pose.hand ?? 8) - (pose.squash || 0) + (pose.stretch || 0))), tip = 12 - (pose.reach || 0)
          pts = []; for (let x = 14; x >= tip; x--) { const y = Math.round(9 + (hy - 9) * (14 - x) / Math.max(1, 14 - tip)); pts.push([x, y], [x, y + 1]) }
        }
        for (const [x, r] of pts) put(i ? M - x + swing + wide : x - swing - wide, t + r, COLORS[0]) // out past his body as it widens
      }
      // Outlined all round, flat brown like his art; turned, the side of his block shows, shaded.
      for (const k of [...g.keys()]) { const [x, y] = k.split(',').map(Number); for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!has(x + ax, y + ay)) put(x + ax, y + ay, LINE) }
      if (s) for (let y = t; y <= 33 + dy; y++) for (let x = 28 + wide + s; x <= 27 + wide - (y === t); x++) put(x, y, COLORS[2])
      // His mouth, always wide open: a band of teeth, their points, red, the bottom points and band. Turned, it slides
      // one pixel and his far eye two, so his near eye keeps clear of his outline.
      for (let j = 0; j < 8; j++) for (let i = 0; i < 9; i++) put(17 + Math.max(s, -1) + i, t + 4 + j, j === 0 || j === 7 ? TOOTH : (j === 1 || j === 6) && TEETH[i] === 'W' ? TOOTH : RED)
      // His eyes, in screen directions: look is a screen direction, while dx and lookX look ahead once he's turned.
      const kind = pose.eyes || 'open', ey = t + 1, xs = [Math.max(16, 17 + s), 24 + s]
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : (pose.dx ?? pose.lookX ?? 0) * (pose.face || 1))), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      const shape = EYES[kind] || [[0, ly], [1, ly], [0, ly + 1], [1, ly + 1]] // open: a 2x2 dot, moved whole so it never thins against his edge
      for (const [n, e] of xs.entries()) for (const [x, y] of shape) { const ex = EYES[kind] ? e : Math.max(16, Math.min(25, e + lx))
        put(Math.max(16, Math.min(26, ex + (n && EYES[kind] ? 1 - x : x))), Math.max(t, ey + y), eyeColor) }
      const out = [...g].map(([k, c]) => { const [x, y] = k.split(',').map(Number); return [pose.face > 0 ? M - x : x, y, c] })
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
}
