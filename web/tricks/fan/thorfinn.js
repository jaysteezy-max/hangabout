// Fan pack: Thorfinn, after Vinland Saga. Fan-made, unofficial, not affiliated with its rights holders.
// Shaggy blond hair and a scar; twin daggers in reverse grip, dashes with afterimages, an aerial flip into an X-slash.
// Then the farmer: the blades go away and a little sprout grows at his feet.
{
  const {OX, OY, GW, GH, BODY, head, facing} = hangabout
  const PROFILE = hangabout.sideOn && head // side on: the mop on his head, a dagger on each leg
  const PUSHEEN = hangabout.skin === 'pusheen' // her face looks out at you: the mop square on her head, locks either side of her face, short bangs
  const HATTY = hangabout.skin === 'hatty' // the hair under his top hat, a dagger in each hand along his forearm
  const CHICKEN = hangabout.skin === 'chicken' // the scar by his eye, a dagger in his wing and one tucked in a belt at his side
  const BLADE = '#DCE1E8', STEEL = '#8E96A3', ARM = {down: 12, mid: 8, up: 4, high: -2}
  const DOWN = ['down', 'down']

  const LIGHT = '#F7DD8E', MID = '#E8C25A', SHADE = '#B8892E'
  /**
   * A side-on skin, drawn facing left: the scar across his snout, the mop over his head and ears, and a dagger on each
   * leg (the front one up in his paw when he lifts it). Laid out on Cappy (his eye at x 20, his snout at x 10) and moved
   * to this skin's eye and snout; the back dagger goes by his rump, and his raised paw is found by his toes' color.
   */
  function profileFront(ctx, th, pose, px){
    const h = head(pose), t = h.top, k = PUSHEEN ? -2 : h.x - 20, dy = pose.dy || 0, strand = (x, y0, len, c) => { ctx.fillStyle = c; ctx.fillRect(x + k, y0, 1, len) }
    const L = x => pose.face > 0 ? GW - 1 - x + (pose.ox || 0) : x - (pose.ox || 0), rump = Math.max(...px.map(([x]) => L(x))) - 1 // as drawn facing left
    facing(ctx, pose, () => {
      if (th.hair || th.daggers) { ctx.fillStyle = '#A44A35'; for (let i = 0; i < (PUSHEEN ? 5 : 6); i++) ctx.fillRect(CHICKEN ? h.x + 5 - i : PUSHEEN ? h.x - 1 + i : h.nose + 2 + i, CHICKEN ? h.y - 2 + i : h.y + (PUSHEEN ? 3 : 5) - (i >> 1), 1, 1) } // scar across his snout (her cheek; the chicken: down his cheek past his eye; on his beak it reads as a mouth)
      if (th.hair) {
        ;[1, 2, 3, 4, 3, 5, 4, 3, 5, 4, 3, 4, 5, 3, 2, 1].forEach((n, i) => strand(13 + i, (i === 0 ? t + 2 : i === 1 ? t + 1 : t) - n, n + 2, i % 4 === 0 ? SHADE : i % 3 === 0 ? LIGHT : MID)) // the mop
        for (const [x, len, c] of PUSHEEN ? [[11, 5, SHADE], [12, 6, MID], [27, 6, MID], [28, 5, SHADE]] : [[25, 7, MID], [26, 8, MID], [27, 9, SHADE], [28, 6, SHADE]]) strand(x, t, len, c) // locks down the back of his head (her face's sides)
        for (const [x, len, c] of PUSHEEN ? [[15, 2, SHADE], [16, 1, MID], [19, 2, MID], [20, 1, MID]] : [[13, 4, SHADE], [14, 5, MID], ...CHICKEN ? [[15, 4, LIGHT]] : [], [16, 3, MID], [17, 2, MID]]) strand(x, t + 1, len, c) // bangs over his brow (the chicken's unparted: his brow shows through the part)
        for (const x of [17, 22, 26]) strand(x, t - 2, 1, LIGHT) // shine
      }
      if (th.daggers && CHICKEN) { // reverse grip in his wing, down from his fist (up when he raises it); the other tucked at his side, darker so it shows on his white
        const fy = Math.max(18, Math.min(30, 17 + pose.hand)) + dy, up = pose.hand < 6, y0 = up ? fy - 4 : fy + 6 // his fist's top row, as the skin works it out
        ctx.fillStyle = BLADE; ctx.fillRect(5, y0, 2, 5)
        ctx.fillStyle = STEEL; ctx.fillRect(6, y0, 1, 5)
        if (th.glint) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5, up ? y0 - 1 : y0 + 5, 1, 1) }
        for (const [x, y, w, len, c] of [[23, 29, 2, 2, '#4A3020'], [22, 31, 4, 1, STEEL], [23, 32, 1, 5, STEEL], [24, 32, 1, 4, '#5E6672']]) { ctx.fillStyle = c; ctx.fillRect(x, y + dy, w, len) } // hilt, guard, blade
      } else if (th.daggers) { // reverse grip: down along his legs, or up from his front paw when he lifts it
        const g = Math.max(...px.map(([, y]) => y)) - 1, line = px.find(([, y]) => y === g + 1)[2] // the row his feet are on; his outline is all that's below it
        const sole = px.filter(([, y, c]) => y === g && c !== line).sort((a, b) => L(a[0]) - L(b[0]))[0]?.[2], toes = px.filter(([, y, c]) => y < g && c === sole)
        const paw = (pose.arms || []).some(a => a === 'up' || a === 'high') && toes.length ? [Math.min(...toes.map(([x]) => L(x))), Math.min(...toes.map(([, y]) => y))] : null
        for (const [bx, y0, up] of [paw ? [paw[0], paw[1] - 5, 1] : [h.nose + 6, 33 + dy, 0], [rump - 1, 33 + dy, 0]]) {
          ctx.fillStyle = BLADE; ctx.fillRect(bx, y0, 2, 5)
          ctx.fillStyle = STEEL; ctx.fillRect(bx + 1, y0, 1, 5)
          if (th.glint) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx, up ? y0 - 1 : y0 + 5, 1, 1) }
        }
      }
      if (th.sheathe) { ctx.fillStyle = '#FFFFFF'; for (const [x, y] of CHICKEN ? [[6, 35], [24, 34]] : [[h.nose + 7, 34], [rump, 34]]) ctx.fillRect(x, y + dy, 1, 1) }
    })
    if (CHICKEN && (th.hair || th.daggers)) for (const [x, y, c] of px) if (c === BODY && (y === 32 + dy || y === 33 + dy)) { ctx.fillStyle = y === 32 + dy ? '#6B4A2B' : '#4A3020'; ctx.fillRect(x, y, 1, 1) } // the chicken's belt round his white, over the tucked blade (his wattle and wing hang in front of it)
  }

  /** Hatty, drawn facing you: the scar across his face, the hair coming out from under his hat (tufts at its sides, locks down his head, bangs over his brow), and a dagger in each hand. */
  function hattyFront(ctx, th, pose){
    const h = head(pose), t = h.top, strand = (x, y0, len, c) => { ctx.fillStyle = c; ctx.fillRect(x, y0, 1, len) }
    facing(ctx, pose, () => {
      if (th.hair || th.daggers) { ctx.fillStyle = '#A44A35'; for (let i = 0; i < 5; i++) ctx.fillRect(h.x + 2 + i, h.y + 2 - (i >> 1), 1, 1) } // scar across his face
      if (th.hair) {
        for (const [x, y0, len, c] of [[12, t - 1, 1, MID], [13, t - 2, 2, SHADE], [14, t - 3, 3, MID], [27, t - 3, 3, MID], [28, t - 2, 2, LIGHT], [29, t - 1, 1, MID]]) strand(x, y0, len, c) // poking out from under his hat
        for (const [x, len, c] of [[11, 5, SHADE], [12, 9, MID], [13, 10, LIGHT], [14, 7, MID], [28, 8, MID], [29, 10, LIGHT], [30, 9, MID], [31, 3, SHADE]]) strand(x, t, len, c) // locks down the sides of his head
        ;[4, 3, 5, 2, 3, 1, 4, 2, 5, 3, 3, 2, 3].forEach((len, i) => strand(15 + i, t, len, i % 4 === 0 ? SHADE : i % 3 === 0 ? LIGHT : MID)) // bangs, parted
        ctx.fillStyle = LIGHT; for (const [x, y] of [[13, t + 2], [17, t + 1], [23, t + 1], [29, t + 3]]) ctx.fillRect(x, y, 1, 1) // shine
      }
      if (th.daggers) { // reverse grip, along his forearms: up from his hands as they hang; raised, up from his free hand and down from the one with the cane
        const arms = pose.arms || []
        for (const [bx, y0] of [arms[0] === 'up' ? [10, h.y - 4] : [10, h.y + 7], arms[1] === 'up' ? [32, h.y + 3] : [31, h.y + 3]]) {
          ctx.fillStyle = BLADE; ctx.fillRect(bx, y0, 2, 5)
          ctx.fillStyle = STEEL; ctx.fillRect(bx + 1, y0, 1, 5)
          if (th.glint) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx, y0 - 1, 1, 1) } // at the tip
        }
      }
      if (th.sheathe) { ctx.fillStyle = '#FFFFFF'; for (const [x, y] of [[10, h.y + 11], [31, h.y + 7]]) ctx.fillRect(x, y, 1, 1) }
    })
  }

  hangabout.trick({
    name: 'thorfinn', label: 'Thorfinn 🗡', rarity: 'rare', pack: 'fan', on: {dizzyAgain: 1}, // shaken dizzy a third time today
    frames: [
      [{eyes: 'angry', thorfinn: {hair: 1, daggers: 1, glint: 1}}, 320],
      [{squash: 2, eyes: 'angry', arms: DOWN, thorfinn: {hair: 1, daggers: 1}}, 220],
      [{ox: -7, eyes: 'angry', arms: DOWN, thorfinn: {hair: 1, daggers: 1, ghost: 1}}, 110],
      [{ox: -7, squash: 1, eyes: 'angry', arms: DOWN, thorfinn: {hair: 1, daggers: 1}}, 140],
      [{ox: 7, eyes: 'angry', arms: DOWN, thorfinn: {hair: 1, daggers: 1, ghost: -1}}, 110],
      [{ox: 7, squash: 1, eyes: 'angry', arms: DOWN, thorfinn: {hair: 1, daggers: 1}}, 140],
      [{squash: 2, eyes: 'angry', thorfinn: {hair: 1, daggers: 1}}, 120],
      ...[60, 120, 180, 240, 300, 360].map((spin, i) => [{dy: -7 + (Math.abs(i - 2.5) * 1.5 | 0), tuck: 1, eyes: 'angry', tilt: spin, thorfinn: {hair: 1, daggers: 1}}, 55]), // aerial flip
      [{squash: 2, eyes: 'angry', arms: ['up', 'up'], shake: 1, thorfinn: {hair: 1, daggers: 1, x: 1}}, 140], // lands in an X-slash
      [{eyes: 'angry', arms: ['up', 'up'], thorfinn: {hair: 1, daggers: 1, x: .5}}, 160],
      [{eyes: 'angry', arms: DOWN, thorfinn: {hair: 1, daggers: 1}}, 500],
      [{eyes: 'blink', thorfinn: {hair: 1, sheathe: 1}}, 160], // "I have no enemies": the blades go away
      [{eyes: 'happy', squash: 1, thorfinn: {hair: 1, sprout: 1}}, 350],
      [{eyes: 'happy', squash: 1, thorfinn: {hair: 1, sprout: 2}}, 350],
      [{eyes: 'happy', thorfinn: {hair: 1, sprout: 3}}, 1300],
      [{thorfinn: {sprout: 3}}, 200], [{}, 150],
    ].map(([p, ms]) => [CHICKEN && p.thorfinn?.daggers ? {...p, hand: p.arms?.[0] === 'up' ? 3 : 9} : p, ms]), // the chicken's wing round a dagger
    /** Behind him: afterimages trailing a dash. */
    behind({ctx, d: th, px}){
      if (!th.ghost) return
      ctx.fillStyle = '#9FD3FF'
      for (const [k, a] of [[1, .32], [2, .16]]) { ctx.globalAlpha = a; for (const [x, y] of px) ctx.fillRect(x + th.ghost * 5 * k, y, 1, 1) }
      ctx.globalAlpha = 1
    },
    /** In front: his scar, shaggy blond hair, the daggers (reverse grip), the X-slash, and the sprout. */
    front({ctx, d: th, px, pose}){
      const dy = pose.dy || 0, sq = pose.squash || 0, ox = pose.ox || 0, top = Math.min(...px.map(([, y]) => y)), eyeY = OY + 4 + dy + sq
      if (PROFILE) profileFront(ctx, th, pose, px)
      else if (HATTY) hattyFront(ctx, th, pose)
      else if (th.hair || th.daggers) { ctx.fillStyle = '#A44A35'; for (let i = 0; i < 6; i++) ctx.fillRect(OX + 14 + i + ox, eyeY + 5 - (i >> 1), 1, 1) } // scar across his nose
      if (th.hair && !head) { // long, messy blond hair: uneven strands on top, locks hanging past his eyes, parted bangs
        const bx = OX + 4 + ox
        const strand = (x, y0, len, c) => { ctx.fillStyle = c; ctx.fillRect(x, y0, 1, len) }
        const TOP_H = [2, 3, 4, 3, 2, 4, 5, 3, 4, 2, 3, 5, 4, 3, 2, 4, 3, 5, 3, 2, 4, 3, 2, 3, 2, 2, 1, 1]
        TOP_H.forEach((h, i) => strand(bx + i, top - h, h + 2, i % 4 === 0 ? SHADE : i % 3 === 0 ? LIGHT : MID)) // the mop on top
        for (const [x, len, c] of [[bx, 9, SHADE], [bx + 1, 8, MID], [bx + 2, 6, MID], [bx + 25, 6, MID], [bx + 26, 8, MID], [bx + 27, 9, SHADE]]) strand(x, top, len, c) // side locks
        for (const [x, len] of [[bx + 6, 4], [bx + 7, 3], [bx + 10, 2], [bx + 16, 3], [bx + 19, 4], [bx + 20, 3]]) strand(x, top + 2, len, MID) // bangs, parted
        ctx.fillStyle = LIGHT; for (const x of [bx + 8, bx + 13, bx + 18]) ctx.fillRect(x, top - 1, 1, 1) // shine
      }
      if (th.daggers && !head) { // one in each hand, reverse grip: the blade points away from the way his arm is raised
        const arms = pose.arms || ['mid', 'mid']
        for (const [i, side] of [[0, -1], [1, 1]]) {
          const a = arms[i], ax = (side < 0 ? OX + 2 : OX + 30) + ox, ay = OY + ARM[a] + dy + (a === 'mid' || a === 'down' ? Math.ceil(sq / 2) : 0)
          const up = a === 'up' || a === 'high', bx = ax + 1, y0 = up ? ay - 5 : ay + 4
          ctx.fillStyle = BLADE; ctx.fillRect(bx, y0, 2, 5)
          ctx.fillStyle = STEEL; ctx.fillRect(bx + 1, y0, 1, 5)
          if (th.glint) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx, up ? y0 - 1 : y0 + 5, 1, 1) }
        }
      }
      if (th.x) { // the X-slash
        ctx.globalAlpha = th.x; ctx.fillStyle = '#FFFFFF'
        for (let i = 0; i <= 30; i++) { ctx.fillRect(OX + 2 + i, OY - 2 + Math.round(i * .6), 1, 1); ctx.fillRect(OX + 32 - i, OY - 2 + Math.round(i * .6), 1, 1) }
        ctx.globalAlpha = 1
      }
      if (th.sheathe && !head) { ctx.fillStyle = '#FFFFFF'; for (const x of [OX + 3, OX + 31]) ctx.fillRect(x, OY + 13, 1, 1) }
      if (th.sprout) { // a little sprout comes up beside him
        const sx = OX + 35, base = GH - 1, stem = [1, 3, 5][th.sprout - 1]
        ctx.fillStyle = '#6B4A2B'; ctx.fillRect(sx - 1, base, 4, 1)
        ctx.fillStyle = '#3E8E47'; ctx.fillRect(sx + 1, base - stem, 1, stem)
        ctx.fillStyle = '#5DBB63'
        if (th.sprout >= 2) { ctx.fillRect(sx - 1, base - stem + 1, 2, 1); ctx.fillRect(sx + 2, base - stem, 2, 1) }
        if (th.sprout >= 3) { ctx.fillRect(sx, base - stem - 1, 2, 1); ctx.fillRect(sx - 2, base - 2, 3, 1) }
      }
    },
  })
}
