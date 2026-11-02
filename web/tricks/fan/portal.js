// Fan pack: the portal gun, after Portal 2. Fan-made, unofficial, not affiliated with its rights holders.
// Blue portal on the floor ahead, orange one up high; in one, and out of the other. A trip, with its own page elements
// (the two portals and the shots that open them) and a front hook for the gun in his hand.
{
  const {GW, OY, PH, feet, putFeet, surfaces, rand, scr, desk, clip, head} = hangabout
  const PROFILE = hangabout.sideOn && head // side on: he turns to aim, the gun at his chin
  const HATTY = hangabout.skin === 'hatty' // the gun in the hand on that side, his cane hand or his hanging free hand
  const CHICKEN = hangabout.skin === 'chicken' // no hands: his wing swung forward holds it, the gun poking out of its tip
  const CAPPY = hangabout.skin === 'cappy' // no hands: the gun on the paw at his chin, for both shots
  const WING = {blue: 6, orange: 2} // his wing's hand: n for each shot, held up for the orange one; the gun's top row is 19 + n (web/skins/chicken.js)
  const SLIME = hangabout.skin === 'slime' // no hands: a goo arm pushed out ahead holds it in its tip, higher for the orange shot
  const GOO = {blue: 7, orange: 3} // its goo arm's hand for each shot: the arm's middle row is 22 + n standing, the gun's top row a row above (web/skins/slime.js)
  document.head.insertAdjacentHTML('beforeend', `<style>
  .portal{position:absolute;border-radius:50%;pointer-events:none;z-index:9;transform:scale(0);transition:transform .22s cubic-bezier(.2,1.4,.4,1)}
  .portal.open{transform:scale(1)}
  .portal.blue{background:radial-gradient(closest-side,#082036 55%,#1d6fd0 78%,#8fd0ff 92%,transparent);box-shadow:0 0 14px 4px rgba(70,160,255,.75)}
  .portal.orange{background:radial-gradient(closest-side,#3a1700 55%,#e8780f 78%,#ffc27a 92%,transparent);box-shadow:0 0 14px 4px rgba(255,150,40,.75)}
  .shot{position:absolute;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;pointer-events:none;z-index:11;transition:left .17s linear,top .17s linear}
  .shot.blue{background:#bfe4ff;box-shadow:0 0 8px 3px #3fa9ff}
  .shot.orange{background:#ffe0b8;box-shadow:0 0 8px 3px #ff9a1f}
  </style>`)

  const portals = []
  let live = false, closer = 0 // live: this trip is still running, so a shot in flight may still open its portal
  function openPortal(color, x, y){
    const p = document.createElement('div'), s = hangabout.size, upright = color === 'blue', w = (upright ? 34 : 84) * s, h = (upright ? 78 : 26) * s
    p.className = 'portal ' + color
    Object.assign(p.style, {left: x - w / 2 + 'px', top: y - h / 2 + 'px', width: w + 'px', height: h + 'px'})
    desk.append(p); portals.push(p)
    void p.offsetWidth; p.classList.add('open') // laid out shut first, so it swirls open
  }
  function closePortals(){
    live = false
    for (const p of portals.splice(0)) { p.classList.remove('open'); setTimeout(() => p.remove(), 300) }
  }
  /** A shot from the gun's tip to (x, y), where its portal opens. */
  function shoot(color, dir, x, y){
    const s = hangabout.size, f = feet(), left = f.x - 66 * s, top = f.y - 120 * s, shot = document.createElement('div')
    shot.className = 'shot ' + color
    Object.assign(shot.style, {left: left + (dir > 0 ? (HATTY ? 40 : 43) : HATTY ? 3 : 0) * 3 * s + 'px', top: top + (CHICKEN ? 20 + WING[color] : SLIME ? 22 + GOO[color] : PROFILE ? 32 : HATTY ? (dir > 0 ? 34 : 37) : 28) * 3 * s + 'px'})
    desk.append(shot)
    void shot.offsetWidth; Object.assign(shot.style, {left: x + 'px', top: y + 'px'}) // laid out at the gun first, so it flies
    setTimeout(() => { shot.remove(); if (live) openPortal(color, x, y) }, 200)
  }

  hangabout.trick({
    name: 'portal', label: 'Portal gun ◐', rarity: 'rare', pack: 'fan', on: {thrown: 1}, // flung toward the screen's edge
    trip({here, x, y, dir}){
      const W = hangabout.width, s = hangabout.size, floorY = surfaces()[0].y + PH
      const lo = here.x0 + 66 + 40, hi = here.x1 + 66 - 40
      if (x + dir * 160 * s < lo || x + dir * 160 * s > hi) dir = -dir // room on the other side
      const ax = Math.max(lo, Math.min(hi, x + dir * 160 * s))
      let bx, by
      for (let i = 0; i < 12; i++) { // the orange one somewhere high, with room below to drop all the way out before he lands
        bx = rand(140, W - 140); by = rand(scr.top + 120, Math.max(scr.top + 120, floorY - 300))
        const below = surfaces().filter(o => o.y + PH > by && bx - 66 >= o.x0 && bx - 66 <= o.x1).sort((a, b) => a.y - b.y)[0]
        if (!below || below.y + PH - by >= 140 * s) break
      }
      clearTimeout(closer); live = true
      const turn = PROFILE ? {face: dir} : {} // Clawd aims with the hand on that side; a side-on skin turns to it
      const UP = HATTY ? ['mid', 'mid'] : ['mid', 'up'] // Hatty's other hand stays on his cane
      const held = tip => CHICKEN ? {...turn, hand: WING[tip]} : SLIME ? {...turn, hand: GOO[tip]} : CAPPY ? {...turn, hand: 2} : turn
      return [
        {go: 'hold', T: 380, pose: {...held('blue'), arms: ['mid', 'mid'], portal: {tip: 'blue', dir}}},
        {go: 'do', fn: () => shoot('blue', dir, ax, y - 39 * s)},
        {go: 'hold', T: 420, pose: {...held('blue'), arms: ['mid', 'mid'], squash: 1, portal: {tip: 'blue', dir, fire: 1}}},
        {go: 'hold', T: 260, pose: {...held('orange'), arms: UP, eyes: 'up', portal: {tip: 'orange', dir}}},
        {go: 'do', fn: () => shoot('orange', dir, bx, by)},
        {go: 'hold', T: 520, pose: {...held('orange'), arms: UP, eyes: 'up', squash: 1, portal: {tip: 'orange', dir, fire: 1}}},
        {go: 'hold', T: 300, pose: {...turn, eyes: 'happy'}},
        {go: 'do', fn: () => clip({x: ax, dir})}, // he disappears into it as he walks through
        {go: 'walk', to: ax + dir * 70 * s, speed: 55},
        {go: 'do', fn: () => { putFeet(bx, by); clip({y: by}); closer = setTimeout(closePortals, 1600) }}, // and comes out the other one, feet first
        {go: 'drop', vy: 320}, // speedy thing goes in, speedy thing comes out
      ]
    },
    end: closePortals, // the trip was cut short: no portals left hanging about
    /** The portal gun in his hand: white body, black prongs, its core glowing the color it's about to fire. */
    front({ctx, d: g, pose}){
      const d = g.dir || 1, y = CHICKEN ? 19 + pose.hand + (pose.dy || 0) : SLIME ? head(pose).y + pose.hand - 6 : PROFILE ? head(pose).y + 7 : HATTY ? head(pose).y + (d > 0 ? 8 : 11) : OY + 7 + (pose.dy || 0) + Math.ceil((pose.squash || 0) / 2), core = g.tip === 'orange' ? '#FF9A1F' : '#3FA9FF'
      const k = CHICKEN ? 1 : SLIME ? 2 : PROFILE ? 10 - head(pose).nose : HATTY ? -3 : 0 // side on, the gun is at his chin, just past his snout: laid out on Cappy's, at x 10
      const at = (x, yy, w, h, c) => { x += k; ctx.fillStyle = c; ctx.fillRect(d > 0 ? x : GW - x - w, yy, w, h) } // drawn for his right hand (side on: at his chin, facing right; Hatty: his cane hand), mirrored for the left
      at(34, y, 7, 3, '#E9EDF0'); at(34, y + 2, 7, 1, '#B9C0C8'); at(36, y, 1, 3, '#2E3238')
      at(41, y - 1, 2, 1, '#1C1F24'); at(41, y + 3, 2, 1, '#1C1F24') // the prongs
      at(41, y, 2, 3, core)
      if (g.fire) { ctx.globalAlpha = .8; at(43, y - 1, 1, 5, '#FFFFFF'); ctx.globalAlpha = 1 }
    },
  })
}
