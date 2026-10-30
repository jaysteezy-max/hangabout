// Sneak through the screen's edge: out the near side, shimmering as he goes; maybe his head pops in up the sides;
// one eye round the far side, a duck back, a grin, then in he comes. A trip: steps, not frames.
{
  const {feet, putFeet, rand, scr} = hangabout
  const IN = hangabout.skin === 'slime' ? 24 : 36 // just his head and eyes show; the slime's eyes sit lower on it, down to row 31

  /** His head pokes in sideways from the side of the screen at height y: looks up and down the edge, grins, ducks back out. */
  function sidePeek(side, y){
    const W = hangabout.width, s = hangabout.size, rot = side === 'right' ? -90 : 90
    const out = side === 'right' ? W + 70 * s : -70 * s, peek = side === 'right' ? W + IN * s : -IN * s
    return [
      {go: 'do', fn: () => putFeet(out, y, rot)},
      {go: 'slide', x: peek, T: 350, pose: {eyes: 'up'}},
      {go: 'hold', T: 650, pose: {eyes: 'side', look: -1}},
      {go: 'hold', T: 650, pose: {eyes: 'side', look: 1}},
      {go: 'hold', T: 140, pose: {eyes: 'blink'}},
      {go: 'hold', T: 420, pose: {eyes: 'happy'}},
      {go: 'slide', x: out, T: 300, pose: {}},
      {go: 'do', fn: () => putFeet(feet().x, feet().y, 0)},
    ]
  }

  hangabout.trick({
    name: 'sneak', label: 'Sneak through ↔', rarity: 'edge', weight: 1.2,
    trip({x, y}){
      const W = hangabout.width, s = hangabout.size, right = x > W / 2, inward = right ? 1 : -1
      const away = right ? -80 * s : W + 80 * s, k = hangabout.skin === 'cappy' ? 3 : -6, oneEye = right ? k * s : W - k * s // the edge cuts him just past his near eye (Cappy's is further back from his snout)
      const steps = [{go: 'walk', to: right ? W + 80 * s : -80 * s, speed: 70, phase: 1}]
      if (Math.random() < .5) { // first his head pops in up the sides, once or twice
        const sideY = () => rand(scr.top + 90 * s, y - 140 * s)
        steps.push(...sidePeek(Math.random() < .5 ? 'left' : 'right', sideY()))
        if (Math.random() < .5) steps.push(...sidePeek(Math.random() < .5 ? 'left' : 'right', sideY()))
      }
      steps.push(
        {go: 'do', fn: () => putFeet(away, y)},
        {go: 'slide', x: oneEye, T: 450, pose: t => ({eyes: 'side', look: inward, phase: t < 260 ? 1 : 0})},
        {go: 'hold', T: 700, pose: {eyes: 'side', look: inward}},
        {go: 'hold', T: 140, pose: {eyes: 'blink'}},
        {go: 'slide', x: away, T: 260, pose: {}}, // ducks back out...
        {go: 'hold', T: 420, pose: {}},
        {go: 'slide', x: oneEye, T: 300, pose: {eyes: 'happy'}}, // ...and pops in again, grinning
        {go: 'hold', T: 500, pose: {eyes: 'happy'}},
        {go: 'walk', to: right ? 160 * s : W - 160 * s, speed: 50, phase: 1},
      )
      return steps
    },
  })
}
