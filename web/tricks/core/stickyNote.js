// Sticky note: Claude finished while you were away, so he leaves you a note. He pulls out a little yellow sticky note,
// scribbles on it and ticks it, slaps it onto the window he's standing on (from the floor: the nearest window he can
// reach, or else the screen beside him), steps back and nods. Frames, not a trip: it plays as Done starts, when a trip
// would be cut short. The note itself is a page element with its own timer: it rides its window, goes if the window
// does, and stays while you're away, fading out 20 seconds after you're back.
{
  const {GW, GH, OY, desk, edges, feet, paint, thickLine} = hangabout
  const STAY = 20000 // ms it stays once you're here
  const REACH = 30 // art pixels: how far from his hand he'll go to put it on a window, from the floor
  const NX = 38, NY = 22, N = 12, LOW = 26 // the note in his hand (drawn as if he faces right), its size, and the top of it once stuck beside him
  const YELLOW = '#FFD84D', LEAD = '#6B5E3C', TICK = '#2C7A39'
  const NOTE = [ // a, b: two scribbled lines; c, k: the tick, written last; f: a corner folded up
    'yyyyyyyyyyyy',
    'yaaaabbbyyyy',
    'yyyyyyyyyyyy',
    'ybbbbbyyyyky',
    'yyyyyyyyykky',
    'yyyyyyyykkyy',
    'yycyyyykkyyy',
    'yyccyykkyyyy',
    'yyycckkyyyyy',
    'yyyykkyyyyyf',
    'yyyyyyyyyyf.',
    'yyyyyyyyyf..',
  ]
  const TIP = [[4, 1], [5, 3], [4, 8], [10, 3]] // the pen's point as he finishes each mark
  const ink = n => ({y: YELLOW, f: '#D9A520', a: n > 0 ? LEAD : YELLOW, b: n > 1 ? LEAD : YELLOW, c: n > 2 ? TICK : YELLOW, k: n > 3 ? TICK : YELLOW})
  document.head.insertAdjacentHTML('beforeend', `<style>
  .stickynote{position:absolute;pointer-events:none;z-index:9;image-rendering:pixelated;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35));transform:scale(1.25);transition:transform .12s ease-out,opacity .8s}
  .stickynote.on{transform:none}
  </style>`)

  let side = 1, plan = null, note = null // side: where the note goes, right or left of him; plan: where on screen, until it's stuck
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
  const keyOf = (w, i) => w.id ?? i // the mockup's windows have no id: their place in the list
  /** Where the note goes, as its center from its window's top-left (key) or, with no key, the screen's. */
  function aim(){
    const px = 3 * hangabout.size, inset = (N / 2 + 1) * px, f = feet(), wins = edges() // inset: from its center to an art pixel past its edge
    const i = wins.findIndex(w => Math.abs(f.y - w.y - 1) < 2 && f.x >= w.x0 && f.x <= w.x1), on = wins[i] // the window he's standing on
    const side = f.x < (on ? (on.x0 + on.x1) / 2 : hangabout.width / 2) ? 1 : -1 // toward the middle of whatever he's on
    const x = f.x + side * (NX + N / 2 - GW / 2) * px
    if (on) return {side, key: keyOf(on, i), x: clamp(x, on.x0 + inset, on.x1 - inset) - on.wx, y: inset} // just under its top edge
    const y = f.y - (GH - LOW - N / 2) * px
    let best = {side, x, y}, near = REACH * px
    wins.forEach((w, i) => {
      const cx = clamp(x, w.wx + inset, w.wx + w.w - inset), cy = clamp(y, w.y + inset, w.y + w.h - inset), d = Math.hypot(cx - x, cy - y)
      if (d < near) { near = d; best = {side, key: keyOf(w, i), x: cx - w.wx, y: cy - w.y} }
    })
    return best
  }
  function stick({key, x, y}){
    unstick() // one note at a time
    const el = document.createElement('canvas'), w = N * 3 * hangabout.size
    el.width = el.height = N; el.className = 'stickynote'
    el.style.width = el.style.height = w + 'px'
    paint(el.getContext('2d'), NOTE, 0, 0, ink(4))
    desk.append(el)
    note = {el, key, x: x - w / 2, y: y - w / 2, fadeAt: performance.now() + STAY, timer: setInterval(follow, 100)}
    follow()
    void el.offsetWidth; el.classList.add('on') // laid out big first, so it slaps down
  }
  /** Ten times a second (as often as the app reports windows): keeps it on its window, until it's time to go. */
  function follow(){
    const now = performance.now(), on = note.key == null ? {wx: 0, y: 0} : edges().find((w, i) => keyOf(w, i) === note.key)
    if (hangabout.away) note.fadeAt = now + STAY // the 20 s start once you're back
    if (!on || now > note.fadeAt) return unstick() // or its window went away
    note.el.style.left = on.wx + note.x + 'px'; note.el.style.top = on.y + note.y + 'px'
  }
  function unstick(){
    if (!note) return
    const {el, timer} = note
    clearInterval(timer); note = null
    el.style.opacity = 0; setTimeout(() => el.remove(), 800)
  }

  const CHICKEN = hangabout.skin === 'chicken', RAISE = CHICKEN ? 4 : 0 // the chicken's wing held out higher, by his beak, clear of his wattle
  const BACK = hangabout.skin === 'slime' ? {stretch: 1, dy: -2} : {lift: [1, 2]} // he steps back; the slime, legless, hops
  const at = (pose, ms, d = {stuck: 1}) => [{face: 1, eyes: 'side', look: 1, ...pose, ...pose.hand != null && {hand: pose.hand - RAISE}, stickyNote: d}, ms] // turned to the note
  hangabout.trick({
    name: 'stickyNote', label: 'Sticky note ✓', rarity: 'manual', on: {finishedWhileAway: 1},
    frames: [
      [{arms: ['mid', 'down'], eyes: 'down', stickyNote: {aim: 1}}, 240], // digs one out
      at({hand: 6}, 260, {marks: 0}),
      ...[1, 2, 3, 4].flatMap(marks => [7, 9].map(hand => at({hand}, 130, {marks, pen: 1}))), // scribbles, then ticks it
      at({stretch: 1, hand: 1}, 200, {marks: 4, up: 1}), // winds up
      at({squash: 2, hand: 10, reach: 2}, 180), // slap!
      at({squash: 1, hand: 10, reach: 1}, 160),
      at({ox: -2, ...BACK}, 130), // steps back
      at({ox: -4}, 400), // looks it over
      ...[0, 1].flatMap(() => [at({ox: -4, squash: 1, eyes: 'down'}, 130), at({ox: -4, eyes: 'happy'}, 200)]), // a satisfied nod
      at({face: 0, ox: -4, eyes: 'happy'}, 400),
      at({face: 0, ox: -2, eyes: 'happy'}, 120),
      [{}, 200],
    ],
    pixels({d, px}){
      if (d.aim) { plan = aim(); side = plan.side }
      if (d.stuck && plan) { stick(plan); plan = null } // frames have no cue of their own: the first one drawn from the slap on puts it up
      return side > 0 ? px : px.map(([x, y, c]) => [GW - 1 - x, y, c]) // the frames face right; mirrored when the note goes left
    },
    /** The note in his hand, and the pen from his hand to where he's writing. */
    front({ctx, d, pose}){
      if (d.marks == null) return
      const x = side > 0 ? NX : GW - NX - N, y = NY - (d.up ? 4 : 0)
      if (CHICKEN) { ctx.fillStyle = '#16161A'; ctx.fillRect(x - 1, y - 1, N + 2, N + 2) } // outlined like him, so it doesn't run into his yellow wing
      paint(ctx, NOTE, x, y, ink(d.marks))
      if (!d.pen) return
      const [tx, ty] = TIP[d.marks - 1], hy = OY + pose.hand + 1
      thickLine(ctx, side > 0 ? 36 : GW - 37, hy, x + tx - side, y + ty, 1, '#3F51B5') // a blue pen: a pencil wouldn't show on yellow
      ctx.fillStyle = '#2B2B2B'; ctx.fillRect(x + tx, y + ty, 1, 1)
    },
  })
}
