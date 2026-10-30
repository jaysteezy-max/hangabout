// Juggling three balls. The frames carry a `juggle` value (how far round the pattern the balls are, 0..1);
// the front hook draws the balls from it. His left hand tosses as his right passes one back, so the arms alternate.
{
  const {OX, OY, head, facing} = hangabout
  const LEFT = OX + 4, RIGHT = OX + 31 // just above each raised hand
  const CHICKEN = hangabout.skin === 'chicken' // his head is in the way: the low pass back goes behind it, the high arc over his crest
  const CAPPY = hangabout.skin === 'cappy' // no arms: a one-paw shower in front of his face, tossed up from his raised paw to a little above his ears
  /** The balls whose pass (high: the arc over, else the quick low one back) is drawn now. */
  function balls(ctx, d, pose, pass){
    const {C} = hangabout, dy = pose.dy || 0, h = CAPPY && head(pose)
    ;[C.peri, C.ok, '#FFD84D'].forEach((color, i) => {
      // A shower: each ball spends two thirds of the loop on a high arc from his left hand to his right, then a quick low pass back.
      // Cappy's, as drawn facing left: from just over his paw's toes up and out in front of his snout, then low back to his paw.
      const f = (d + i / 3) % 1, high = f < 2 / 3, u = high ? f * 1.5 : (f - 2 / 3) * 3
      if (!pass(high)) return
      const [a, b] = CAPPY ? [h.nose - 3, h.nose - 13] : [LEFT, RIGHT]
      const x0 = high ? a : b, x1 = high ? b : a, base = CAPPY ? h.top + 1 : OY + 2 + dy, rise = high ? (CHICKEN ? 15 : CAPPY ? 8 : 13) : 2
      ctx.fillStyle = color
      ctx.fillRect(Math.round(x0 + (x1 - x0) * u), Math.round(base - rise * 4 * u * (1 - u)), 2, 2)
    })
  }
  // Cappy's paw flicks up in front of his face as each ball leaves it, and drops to his chin between.
  const loop = [...Array(12)].map((_, i) => [{eyes: 'up', arms: CAPPY ? (i % 4 < 2 ? ['high', 'high'] : ['up', 'up']) : i % 4 < 2 ? ['up', 'mid'] : ['mid', 'up'], juggle: i / 12}, 80])

  hangabout.trick({
    name: 'juggle', label: 'Juggle ●', rarity: 'rare',
    frames: [
      [{squash: 1, arms: ['up', 'up']}, 160],
      ...loop, ...loop, ...loop,
      [{arms: ['up', 'up'], eyes: 'happy'}, 450], // caught them all
      [{}, 200],
    ],
    front({ctx, d, pose}){ CAPPY ? facing(ctx, pose, () => balls(ctx, d, pose, () => true)) : balls(ctx, d, pose, high => high || !CHICKEN) },
    behind({ctx, d, pose}){ if (CHICKEN) balls(ctx, d, pose, high => !high) },
  })
}
