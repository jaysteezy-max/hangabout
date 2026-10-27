// Up the side of the screen like a gecko: hops onto the wall, climbs, looks about and waves, then climbs down or lets go.
hookpet.trick({
  name: 'climb', label: 'Climb the side ↕', rarity: 'edge',
  trip({x, y}){
    const {rand, scr} = hookpet, W = hookpet.width, s = hookpet.size
    const right = x > W / 2, wall = right ? W : 0, rot = right ? -90 : 90
    const low = y - 54 * s - 4, high = rand(scr.top + 90 * s, Math.max(scr.top + 90 * s, y - 260 * s)), off = right ? W - 62 * s : 62 * s
    const steps = [
      {go: 'walk', to: right ? W - 54 * s : 54 * s, speed: 60},
      {go: 'slide', x: wall, y: low, rot, T: 260, pose: {squash: 1, arms: ['up', 'up']}}, // onto the wall
      {go: 'climb', to: high, speed: 50},
      {go: 'hold', T: 600, pose: {eyes: 'side', look: -1}},
      {go: 'hold', T: 600, pose: {eyes: 'side', look: 1}},
      ...[0, 1, 0, 1].map(i => ({go: 'hold', T: 200, pose: {eyes: 'up', arms: ['mid', i ? 'up' : 'high']}})),
    ]
    if (Math.random() < .5) steps.push({go: 'climb', to: low, speed: 70}, {go: 'slide', x: off, y, rot: 0, T: 260, pose: {squash: 1}})
    else steps.push({go: 'slide', x: off, rot: 0, T: 180, pose: {arms: ['high', 'high'], eyes: 'up'}}, {go: 'drop'}) // lets go
    return steps
  },
})
