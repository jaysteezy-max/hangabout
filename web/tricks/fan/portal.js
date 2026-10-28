// Fan pack: the portal gun, after Portal 2. Fan-made, unofficial, not affiliated with its rights holders.
// Blue portal on the floor ahead, orange one up high; in one, and out of the other. A trip, with its own page elements
// (the two portals and the shots that open them) and a front hook for the gun in his hand.
{
  const {GW, OY, PH, feet, putFeet, surfaces, rand, scr, desk, clip} = hangabout
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
    Object.assign(shot.style, {left: left + (dir > 0 ? 43 : 0) * 3 * s + 'px', top: top + 28 * 3 * s + 'px'})
    desk.append(shot)
    void shot.offsetWidth; Object.assign(shot.style, {left: x + 'px', top: y + 'px'}) // laid out at the gun first, so it flies
    setTimeout(() => { shot.remove(); if (live) openPortal(color, x, y) }, 200)
  }

  hangabout.trick({
    name: 'portal', label: 'Portal gun ◐', rarity: 'rare', pack: 'fan',
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
      return [
        {go: 'hold', T: 380, pose: {arms: ['mid', 'mid'], portal: {tip: 'blue', dir}}},
        {go: 'do', fn: () => shoot('blue', dir, ax, y - 39 * s)},
        {go: 'hold', T: 420, pose: {arms: ['mid', 'mid'], squash: 1, portal: {tip: 'blue', dir, fire: 1}}},
        {go: 'hold', T: 260, pose: {arms: ['mid', 'up'], eyes: 'up', portal: {tip: 'orange', dir}}},
        {go: 'do', fn: () => shoot('orange', dir, bx, by)},
        {go: 'hold', T: 520, pose: {arms: ['mid', 'up'], eyes: 'up', squash: 1, portal: {tip: 'orange', dir, fire: 1}}},
        {go: 'hold', T: 300, pose: {eyes: 'happy'}},
        {go: 'do', fn: () => clip({x: ax, dir})}, // he disappears into it as he walks through
        {go: 'walk', to: ax + dir * 70 * s, speed: 55},
        {go: 'do', fn: () => { putFeet(bx, by); clip({y: by}); closer = setTimeout(closePortals, 1600) }}, // and comes out the other one, feet first
        {go: 'drop', vy: 320}, // speedy thing goes in, speedy thing comes out
      ]
    },
    end: closePortals, // the trip was cut short: no portals left hanging about
    /** The portal gun in his hand: white body, black prongs, its core glowing the color it's about to fire. */
    front({ctx, d: g, pose}){
      const d = g.dir || 1, y = OY + 7 + (pose.dy || 0) + Math.ceil((pose.squash || 0) / 2), core = g.tip === 'orange' ? '#FF9A1F' : '#3FA9FF'
      const at = (x, yy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(d > 0 ? x : GW - x - w, yy, w, h) } // drawn for his right hand, mirrored for his left
      at(34, y, 7, 3, '#E9EDF0'); at(34, y + 2, 7, 1, '#B9C0C8'); at(36, y, 1, 3, '#2E3238')
      at(41, y - 1, 2, 1, '#1C1F24'); at(41, y + 3, 2, 1, '#1C1F24') // the prongs
      at(41, y, 2, 3, core)
      if (g.fire) { ctx.globalAlpha = .8; at(43, y - 1, 1, 5, '#FFFFFF'); ctx.globalAlpha = 1 }
    },
  })
}
