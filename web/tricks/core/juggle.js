// Juggling three balls. The frames carry a `juggle` value (how far round the pattern the balls are, 0..1);
// the front hook draws the balls from it. His left hand tosses as his right passes one back, so the arms alternate.
{
  const {OX, OY} = hookpet
  const LEFT = OX + 4, RIGHT = OX + 31 // just above each raised hand
  const loop = [...Array(12)].map((_, i) => [{eyes: 'up', arms: i % 4 < 2 ? ['up', 'mid'] : ['mid', 'up'], juggle: i / 12}, 80])

  hookpet.trick({
    name: 'juggle', label: 'Juggle ●', rarity: 'rare',
    frames: [
      [{squash: 1, arms: ['up', 'up']}, 160],
      ...loop, ...loop, ...loop,
      [{arms: ['up', 'up'], eyes: 'happy'}, 450], // caught them all
      [{}, 200],
    ],
    front({ctx, d, pose}){
      const {C} = hookpet, dy = pose.dy || 0
      ;[C.peri, C.ok, '#FFD84D'].forEach((color, i) => {
        // A shower: each ball spends two thirds of the loop on a high arc from his left hand to his right, then a quick low pass back.
        const f = (d + i / 3) % 1, high = f < 2 / 3, u = high ? f * 1.5 : (f - 2 / 3) * 3
        const x0 = high ? LEFT : RIGHT, x1 = high ? RIGHT : LEFT, h = high ? 13 : 2
        ctx.fillStyle = color
        ctx.fillRect(Math.round(x0 + (x1 - x0) * u), Math.round(OY + 2 + dy - h * 4 * u * (1 - u)), 2, 2)
      })
    },
  })
}
