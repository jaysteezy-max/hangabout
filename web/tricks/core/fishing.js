// Fishing: on a window's top edge he sits with his legs over the front and casts a little rod. The line hangs down the
// front of the window and the bobber jiggles, then a bite! He reels in a tiny fish (or a ladybug), grins at it, and lets
// it go. A trip: his canvas ends just below the ledge, so the line, bobber and catch are page elements; a front hook draws
// the rod in his hand.
{
  const {GW, OY, desk, paint, thickLine, pick} = hangabout
  const PUSHEEN = hangabout.skin === 'pusheen' // side on, she turns to the water and holds the rod's butt in her paw
  document.head.insertAdjacentHTML('beforeend', `<style>
  .fishline{position:absolute;z-index:9;width:var(--a);height:0;pointer-events:none;transition:height .45s ease-in;background:linear-gradient(90deg,transparent 33%,var(--line) 33% 67%,transparent 67%)}
  .fishline canvas{position:absolute;image-rendering:pixelated}
  .fishline .bobber{bottom:calc(var(--a) * 4);animation:bob 1.2s steps(1) infinite}
  .fishline.bite .bobber{animation:bob .2s steps(1) infinite;--dip:3}
  .fishline.reel{transition:height 1.3s linear}
  .fishline.reel .bobber{animation:none}
  .fishline .catch{top:100%;transform-origin:50% 0;animation:wriggle .26s steps(1) infinite;transition:translate .7s ease-in,opacity .7s ease-in}
  .fishline .catch.free{translate:0 calc(var(--a) * 24);opacity:0}
  @keyframes bob{50%{translate:0 calc(var(--a) * var(--dip,1))}}
  @keyframes wriggle{0%{rotate:-14deg}50%{rotate:14deg}}
  </style>`)

  const ROD = {up: [36, 29, 26, 4], out: [35, 32, 50, 13]} // butt to tip, for his right hand; mirrored for his left
  // The chicken turns to the water and holds the rod in his wing (held out, it wraps round the grip at x 29 to 38): the
  // wing at the butt's height, and the reel just above it. It can't wave, so he clucks goodbye.
  const CHICKEN = hangabout.skin === 'chicken', GRIP = {up: 9, out: 12}, WING = ['#FFF050', '#B8960F']
  const BOBBER = [['.r.', 'rrr', 'www', '.w.'], {r: '#E5484D', w: '#F4F1EA'}]
  const CATCH = [
    [['..f..', '.fff.', '.fef.', 'dfff.', '.fff.', '..f..', '.ddd.', 'dd.dd'], {f: '#6EC1E4', d: '#3E8FB8', e: '#1F1410'}], // a fish, hooked by the lip
    [['k...k', '.kkk.', 'rrkrr', 'krkrk', 'rrkrr', '.rkr.'], {r: '#E5484D', k: '#1F1410'}], // a ladybug
  ]
  let line = null
  const reelIn = () => { line?.remove(); line = null }
  /** Pixel art as a little canvas of its own, a pixels each, centered on the line. */
  function sprite([rows, ink], cls, a){
    const c = document.createElement('canvas'), w = rows[0].length
    c.width = w; c.height = rows.length; c.className = cls
    c.style.cssText = `width:${w * a}px;height:${rows.length * a}px;left:${-(w - 1) / 2 * a}px`
    paint(c.getContext('2d'), rows, 0, 0, ink)
    return c
  }

  hangabout.trick({
    name: 'fishing', label: 'Go fishing ≈', rarity: 'rare', where: 'ledge',
    trip({here, x, y}){
      const s = hangabout.size, a = 3 * s
      const side = x - 66 < (here.x0 + here.x1) / 2 ? 1 : -1 // casts toward the middle of the window
      const hands = (rod, free) => side > 0 ? [free, rod] : [rod, free]
      const sit = (o, f) => ({sink: 12, arms: hands('mid', 'down'), ...PUSHEEN && {face: side, ...!o?.arms && {hand: 6}}, ...o, ...CHICKEN && {face: side, hand: GRIP[f?.rod || 'out']}, fishing: {rod: 'out', side, ...f}})
      const cast = () => {
        const [, , tx, ty] = ROD.out
        line = document.createElement('div'); line.className = 'fishline'
        line.style.cssText = `--a:${a}px;--line:${hangabout.C.dim};left:${x - 66 * s + (side > 0 ? tx : GW - 1 - tx) * a}px;top:${y - 120 * s + (ty + 1) * a + 12 * s}px`
        line.append(sprite(BOBBER, 'bobber', a))
        desk.append(line)
        void line.offsetWidth; line.style.height = 46 * a + 'px' // laid out empty first, so the line drops
      }
      const reel = () => { line.className = 'fishline reel'; line.append(sprite(pick(CATCH), 'catch', a)); line.style.height = 10 * a + 'px' }
      return [
        {go: 'hold', T: 140, pose: {sink: 6}},
        {go: 'hold', T: 380, pose: sit({arms: hands('up', 'down'), eyes: 'up'}, {rod: 'up'})}, // winds up
        {go: 'do', fn: cast},
        {go: 'hold', T: 2000, pose: t => sit({lift: Math.floor(t / 380) % 2 ? [0, 2] : [1, 3], dx: side, lookY: 1, ...(t > 1200 && t < 1320 && {eyes: 'blink'})})},
        {go: 'do', fn: () => line.classList.add('bite')},
        {go: 'hold', T: 800, pose: sit({dx: side, lookY: 1}, {bite: 1})},
        {go: 'do', fn: reel},
        {go: 'hold', T: 1400, pose: sit({eyes: 'strain', tuck: 1}, {reel: 1})},
        {go: 'hold', T: 1200, pose: t => sit({eyes: 'happy', arms: hands('mid', 'up'), lift: Math.floor(t / 200) % 2 ? [0, 2] : [1, 3]})}, // what a beauty
        {go: 'do', fn: () => line.lastChild.classList.add('free')},
        {go: 'hold', T: 900, pose: t => { const k = Math.floor(t / 200) % 2; return sit({dx: side, lookY: 1, arms: hands('mid', k ? 'up' : 'high'), ...CHICKEN && k && {beak: 'open'}}) }}, // bye, little one
        {go: 'hold', T: 400, pose: sit()},
        {go: 'do', fn: reelIn},
        {go: 'hold', T: 140, pose: {sink: 6}},
        {go: 'hold', T: 200, pose: {}},
      ]
    },
    end: reelIn, // cut short: no line left hanging
    front({ctx, d, now, px, pose}){
      const m = x => d.side > 0 ? x : GW - 1 - x, at = (x, yy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(d.side > 0 ? x : GW - x - w, yy, w, h) }
      const [x0, y0, x1, y1] = ROD[d.rod], [rx, ry] = CHICKEN ? [38, 27] : [36, 32]
      thickLine(ctx, m(x0), y0, m(x1), y1, 1, '#8A5A33')
      if (d.rod === 'out') { at(rx, ry, 2, 2, '#B9BDC6'); at(rx + 2, d.reel && Math.floor(now / 110) % 2 ? ry + 2 : ry, 1, 1, '#6B7078') } // the reel, its handle spinning as he winds
      if (CHICKEN) { // his wing over the grip
        const top = 17 + pose.hand
        for (const [x, y, c] of px) if (WING.includes(c) && y >= top && y < top + 7 && Math.abs(x - m(33.5)) < 5) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1) }
      }
      if (d.bite) paint(ctx, ['#', '#', '#', '.', '#'], m(40), OY - 10, {'#': hangabout.C.clay})
    },
  })
}
