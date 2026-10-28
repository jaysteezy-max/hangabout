// Paper airplane: he folds a sheet into a plane, squints down his arm, and throws it. It glides off in a gentle arc with
// a wobble, comes down level on a window's top edge ahead (or the floor), skids, sits a few seconds and fades. He watches
// it all the way and pumps a fist when it lands. A trip that stays put, so the throw happens on cue; the plane is a page
// element of its own, flown frame by frame.
{
  const {OY, PH, GW, paint, surfaces, desk, rand, pick} = hangabout
  const INK = {W: '#F4F4F1', L: '#C9CDD3', F: '#8F959E'} // paper, its shaded underside, the fold
  const SHEET = ['WWWWWWW', 'WWWWWWW', 'WWWWWWW', 'WWWWWWW', 'WWWWWWW', 'LLLLLLL']
  const POINTED = ['...W...', '..WFW..', '.WWFWW.', 'WWWFWWW', 'WWWFWWW', 'LLLFLLL'] // top corners folded in
  const DART = ['...W...', '..WFW..', '..WFW..', '..WFW..', '..LFL..', '...F...'] // and folded again, narrow
  const PLANE = ['W.........', 'WWW.......', 'WWWWWW....', 'FFFFFFFFWW', '.LLLLL....', '..LL......'] // side on, nose to the right
  document.head.insertAdjacentHTML('beforeend', `<style>
  .plane{position:absolute;pointer-events:none;z-index:11;image-rendering:pixelated;transform-origin:50% 100%;filter:drop-shadow(0 0 1px rgba(0,0,0,.5));transition:opacity .6s}
  </style>`)

  // The chicken is white too: he holds the paper out in his wing, off his belly, and aims the plane from it.
  const CHICKEN = hangabout.skin === 'chicken', SHEET_AT = CHICKEN ? {x: 37, y: 25} : {x: 18, y: OY + 9}
  let plane = null // the element while it's in the air; once down, it fades on its own
  const fade = (el, wait) => setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.remove(), 600) }, wait)

  /** Where it comes down, thrown from (x, y) toward dir: somewhere along a window's top edge in reach, or else the floor. */
  function landing(x, y, dir){
    const s = hangabout.size, W = hangabout.width, [floor, ...wins] = surfaces()
    const near = x + dir * 180 * s, far = Math.max(40, Math.min(W - 40, x + dir * .55 * W)), lo = Math.min(near, far), hi = Math.max(near, far)
    const spots = wins.map(o => [Math.max(lo, o.x0 + 66), Math.min(hi, o.x1 + 66), o.y + PH]).filter(([a, b, top]) => a < b && top > y - 150 * s) // not far above his hand: it can't climb much
    const [a, b, top] = spots.length ? pick(spots) : [lo, hi, floor.y + PH]
    return [rand(a, b), top]
  }

  /** Out of his hand at (x0, y0): makes the plane and works out its flight. f.y is how high it is now (its bottom). */
  function launch(x0, y0, dir){
    const s = hangabout.size, [x1, y1] = landing(x0, y0, dir), top = Math.min(y0, y1) - rand(30, 80) * s, wob = pick([-1, 1]) * rand(4, 9) * s
    // Up and over to a level touchdown, with a wobble that leaves the start and the touchdown alone.
    const yAt = u => { const v = 1 - u; return v * v * v * y0 + 3 * v * v * u * top + (3 * v + u) * u * u * y1 + wob * Math.sin(3 * Math.PI * u) * 4 * u * v }
    plane = document.createElement('canvas')
    plane.className = 'plane'; plane.width = PLANE[0].length; plane.height = PLANE.length
    paint(plane.getContext('2d'), PLANE, 0, 0, INK)
    Object.assign(plane.style, {width: plane.width * 3 * s + 'px', height: plane.height * 3 * s + 'px'})
    desk.append(plane)
    return {x0, x1, y: y0, yAt, dir, T: 500 + Math.hypot(x1 - x0, y1 - y0) * 3, w: plane.width * 3 * s, h: plane.height * 3 * s, skid: 12 * s}
  }
  /** Flies it t ms after the throw, nose along its path, then a short skid along the edge; true once it's settled. */
  function fly(f, t){
    const u = Math.min(1, t / f.T), q = Math.min(1, Math.max(0, t - f.T) / 280), dx = f.x1 - f.x0
    const x = f.x0 + dx * u + f.dir * f.skid * q * (2 - q), a = u < 1 ? Math.atan2(f.yAt(u + .01) - f.yAt(u), Math.abs(dx) * .01 || 1) * f.dir : 0
    f.y = f.yAt(u)
    Object.assign(plane.style, {left: x - f.w / 2 + 'px', top: f.y - f.h + 'px', transform: `rotate(${a}rad) scaleX(${f.dir})`})
    if (q < 1) return false
    fade(plane, 3000); plane = null
    return true
  }

  hangabout.trick({
    name: 'paperPlane', label: 'Paper plane ➤', rarity: 'rare',
    trip({x, y, dir}){
      const s = hangabout.size, W = hangabout.width
      if ((dir > 0 ? W - x : x) < W / 3) dir = -dir // too near the edge he faces: he throws toward the room
      const folding = (art, arms) => ({go: 'hold', T: 210, pose: {arms, eyes: 'down', ...CHICKEN && {hand: arms[0] === 'up' ? 7 : 8}, paperPlane: {art, ...SHEET_AT}}})
      const cheer = (T, pose) => ({go: 'hold', T, pose: {face: dir, eyes: 'happy', ...pose}})
      let f // the flight, once it's left his hand
      return [
        {go: 'hold', T: 160, pose: {squash: 1, eyes: 'down', ...CHICKEN && {hand: 8}, paperPlane: {art: SHEET, ...SHEET_AT}}},
        folding(SHEET, ['up', 'mid']), folding(POINTED, ['mid', 'up']), folding(POINTED, ['up', 'mid']), folding(DART, ['mid', 'up']),
        {go: 'hold', T: 520, pose: {face: dir, arms: ['mid', 'up'], eyes: 'sad', ...CHICKEN && {hand: 3}, paperPlane: {art: PLANE, x: 33, y: OY}}}, // squints down his arm
        {go: 'hold', T: 170, pose: {face: dir, arms: ['mid', 'up'], swing: -1, squash: 1, eyes: 'sad', ...CHICKEN && {hand: 4}, paperPlane: {art: PLANE, x: 31, y: OY + 1}}}, // draws back
        {go: 'do', fn: () => (f = launch(x + dir * 57 * s, y - 45 * s, dir))}, // from his outstretched hand (art 41, 25)
        {go: 'move', fn: t => fly(f, t), pose: t => t < 150 ? {face: dir, hand: 5, reach: 2, dy: -1, dx: 1} // lets go
          : {face: dir, dx: 1, eyes: f.y < y - 110 * s ? 'up' : f.y > y + 20 * s ? 'down' : 'open'}}, // and follows it with his eyes
        cheer(110, {squash: 1}), cheer(170, {dy: -4, tuck: 1, arms: ['mid', 'high']}), cheer(130, {dy: -2, arms: ['mid', 'high']}),
        cheer(110, {squash: 1, arms: ['mid', 'up']}), cheer(420, {arms: ['mid', 'high']}),
        {go: 'hold', T: 200, pose: {}},
      ]
    },
    end(){ if (plane) fade(plane, 0); plane = null }, // cut short mid-flight: it fades where it is
    /** The paper in his hands, mirrored when he faces left. */
    front({ctx, d, pose}){
      const left = pose.face < 0, w = d.art[0].length
      paint(ctx, left ? d.art.map(r => [...r].reverse().join('')) : d.art, left ? GW - d.x - w : d.x, d.y, INK)
    },
  })
}
