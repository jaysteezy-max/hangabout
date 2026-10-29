// Juggling three balls. The frames carry a `juggle` value (how far round the pattern the balls are, 0..1);
// the front hook draws the balls from it. His left hand tosses as his right passes one back, so the arms alternate.
{
  const {OX, OY} = hangabout
  const LEFT = OX + 4, RIGHT = OX + 31 // just above each raised hand
  const CHICKEN = hangabout.skin === 'chicken' // his head is in the way: the low pass back goes behind it, the high arc over his crest
  const KNIGHT = hangabout.skin === 'knight' // so is the knight's tall helmet: no room over it, so the high arc passes in front of it, and on his white and blue the balls want an outline
  /** The balls whose pass (high: the arc over, else the quick low one back) is drawn now. */
  function balls(ctx, d, pose, pass){
    const {C} = hangabout, dy = pose.dy || 0
    ;[C.peri, C.ok, '#FFD84D'].forEach((color, i) => {
      // A shower: each ball spends two thirds of the loop on a high arc from his left hand to his right, then a quick low pass back.
      const f = (d + i / 3) % 1, high = f < 2 / 3, u = high ? f * 1.5 : (f - 2 / 3) * 3
      if (!pass(high)) return
      const x0 = high ? LEFT : RIGHT, x1 = high ? RIGHT : LEFT, h = high ? (KNIGHT ? 12 : CHICKEN ? 15 : 13) : 2, n = KNIGHT ? 3 : 2
      const bx = Math.round(x0 + (x1 - x0) * u), by = Math.round(OY + 2 + dy - h * 4 * u * (1 - u))
      if (KNIGHT) { ctx.fillStyle = '#000000'; ctx.fillRect(bx - 1, by, n + 2, n); ctx.fillRect(bx, by - 1, n, n + 2) } // outlined, to read on his white and blue
      ctx.fillStyle = color
      ctx.fillRect(bx, by, n, n)
    })
  }
  const loop = [...Array(12)].map((_, i) => [{eyes: 'up', arms: i % 4 < 2 ? ['up', 'mid'] : ['mid', 'up'], juggle: i / 12}, 80])

  hangabout.trick({
    name: 'juggle', label: 'Juggle ●', rarity: 'rare',
    frames: [
      [{squash: 1, arms: ['up', 'up']}, 160],
      ...loop, ...loop, ...loop,
      [{arms: ['up', 'up'], eyes: 'happy'}, 450], // caught them all
      [{}, 200],
    ],
    front({ctx, d, pose}){ balls(ctx, d, pose, high => high || !(CHICKEN || KNIGHT)) },
    behind({ctx, d, pose}){ if (CHICKEN || KNIGHT) balls(ctx, d, pose, high => !high) },
  })
}
