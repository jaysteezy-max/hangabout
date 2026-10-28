// Clay: a faceless clay soldier, after the Clay Soldiers Minecraft mod. Original art, drawn three-quarters facing left
// (facing right is the mirror image), built like the mod's soldiers: a cube head as wide as his torso, chunky arms and
// legs set flush against it, every block lit on top, plain in front and shaded on the side turned away.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). He has no face: `eyes` and `look` show in his body, or not at all.
{
  const COLORS = ['#9DA3B1', '#BAC0CC', '#767C8B', '#16181D'] // BODY, TOP, SIDE, EYE (never drawn: he has no eyes)
  const [B, T, S] = COLORS, LINE = '#2A2D36'
  // Where each arm's tip goes from its shoulder, for the left arm (the right one is the mirror): [dx, dy].
  const ARM = {down: [0, 8], mid: [0, 8], up: [-6, -6], high: [-3, -8]}

  SKINS.clay = {
    name: 'Clay', colors: COLORS, sideOn: true,
    /** Clay in a pose: head, torso, then arms and legs as stiff blocks swung from his shoulders and hips, outlined. */
    draw(pose){
      const right = pose.face > 0, half = !!pose.half, m = new Map()
      const put = (x, y, c) => m.set(x + ',' + y, [x, y, c])
      const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c) }
      // A stiff limb from its root (top-left pixel) to its tip, one color per column across it, stepping when angled.
      // Held out level, it's lit on top and shaded underneath instead.
      const limb = (x0, y0, dx, dy, cols) => {
        const n = Math.max(Math.abs(dx), Math.abs(dy), 1), steep = Math.abs(dy) >= Math.abs(dx), ink = steep ? cols : [T, B, S]
        for (let i = 0; i <= n; i++) {
          const x = Math.round(x0 + dx * i / n), y = Math.round(y0 + dy * i / n)
          ink.forEach((c, k) => steep ? put(x + k, y, c) : put(x, y + k, c))
        }
      }
      const sq = pose.squash || 0, st = pose.stretch || 0, dy = pose.dy || 0, wide = sq >= 2 ? 1 : 0, eyes = pose.eyes
      const perk = eyes === 'happy' ? 1 : eyes === 'sad' ? -1 : 0 // no face, so he's proud or slumped instead
      const legLen = 10 - Math.max(0, sq - 1) + (st >= 2 ? 1 : 0), torso = 7 - Math.min(sq, 1) + Math.min(st, 1) + perk
      const hip = 39 + dy - legLen, top = hip - torso, head = top - 8 // his feet are on row 38
      const side = half ? B : S, arms = pose.arms || [], [la, ra] = right ? [arms[1], arms[0]] : arms // arms are [screen left, screen right]
      // Two legs, so a lift raises one: the first listed, even for his far leg and odd for his near one (walking alternates).
      const swing = pose.swing || 0, lift = pose.lift || [], step = lift.length ? lift[0] % 2 : pose.tapLeg != null ? pose.tapLeg % 2 : -1

      // Legs: the far one plain, the near one showing its shaded side. Tucked, his knees come up in front of him.
      if (pose.tuck) {
        rect(13 - wide, hip, 12 + wide, 3, B); rect(23, hip, 2, 3, side); rect(13 - wide, hip + 2, 10, 1, S)
        limb(13 - wide, hip + 3, 0, 3, [B, B, S]); limb(17, hip + 3, 0, 2, [B, B, S])
      } else for (const n of [0, 1]) {
        const up = step === n ? (lift.length ? 2 : 1) : 0, ahead = step === n && lift.length // a lifted leg steps forward
        limb(n ? 20 : 17, hip, (ahead ? -2 : 0) + (n ? wide : -wide), legLen - 1 - up, n ? [ahead ? S : B, B, B, side, side] : [B, B, S]) // stepping past the far leg, the near one's edge is shaded
      }
      // Arms: the far one passes behind his torso, the near one in front of it (drawn after his head); both shaded where they meet his body.
      const arm = (n, a) => {
        const x0 = n ? 23 + wide : 14 - wide, flip = n ? -1 : 1
        if (a === 'cross') { rect(x0, top, 3 + n, 3, B); return }
        let [ax, ay] = ARM[a] || ARM.mid
        ax *= flip
        if (n === 0 && (pose.hand != null || pose.reach)) { // his front hand, out ahead of him at a height
          ax = -6 - (pose.reach || 0); ay = Math.max(-8, Math.min(8, 20 + (pose.hand ?? 4) + dy - top))
        } else if (swing && (a == null || a === 'mid' || a === 'down')) ax += n ? swing : -swing // walking: one forward, one back
        limb(x0, top, ax, ay, n ? [ay < 0 ? LINE : S, B, B, side] : [B, B, S]) // raised, the near arm is outlined against his head
        if (ay > 0) rect(x0 + n, top, 2, 1, T) // a hanging arm's shoulder catches the light
      }
      arm(0, la)
      rect(17, top, 6, torso, B); rect(17, top, 6, 1, S) // his torso, in the shadow of his head at the top
      // His head, a cube as wide as his torso: lit on top, its front toward you, its side in shade, the far corners cut.
      const hx = 17 + (eyes === 'dizzy' ? Math.sign(pose.tilt || 1) : 0) // a dizzy head wobbles on his shoulders
      rect(hx + 1, head, 8, 1, T); rect(hx, head + 1, 8, 1, T); rect(hx + 8, head + 1, 1, 1, side)
      rect(hx, head + 2, 6, 6, B); rect(hx + 6, head + 2, 3, 5, side); rect(hx + 6, head + 7, 2, 1, side)
      if (half) rect(hx, head, 9, 2, T)
      arm(1, ra) // in front of his head when raised
      if (la === 'cross' || ra === 'cross') { rect(14 - wide, top + 3, 13 + 2 * wide, 1, T); rect(14 - wide, top + 4, 13 + 2 * wide, 1, B); rect(14 - wide, top + 5, 13 + 2 * wide, 1, S) } // forearms folded across his chest

      const px = [...m.values()]
      for (const [x, y] of [...m.values()]) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!m.has(x + ax + ',' + (y + ay))) { m.set(x + ax + ',' + (y + ay), 0); px.push([x + ax, y + ay, LINE]) }
      const out = right ? px.map(([x, y, c]) => [GW - 1 - x, y, c]) : px
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
}
