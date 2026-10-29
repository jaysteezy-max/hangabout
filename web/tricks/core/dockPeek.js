// On the floor: he ducks down behind the Dock (or the screen's bottom edge) until only his eyes peek over it, looks
// around and up at the screen, blinks, and pops back up. The floor's mirror of `peek` in everyday.js.
{
  const LOW = hangabout.skin === 'slime' ? 24 : 36 // only his eyes show: the slime's sit lower on it, down to row 31, so it sinks less
  hangabout.trick({
    name: 'dockPeek', label: 'Peek over the Dock ◠', rarity: 'common', where: 'floor', weight: .5,
    frames: [
      [{squash: 1}, 100], [{sink: 12, clip: 1}, 80], [{sink: 24, clip: 1}, 80], [{sink: LOW, clip: 1}, 550],
      [{sink: LOW, clip: 1, eyes: 'side', look: -1}, 600], [{sink: LOW, clip: 1, eyes: 'side', look: 1}, 600],
      [{sink: LOW, clip: 1, eyes: 'up'}, 500], [{sink: LOW, clip: 1, eyes: 'blink'}, 120], [{sink: LOW, clip: 1}, 400],
      [{sink: 18, clip: 1}, 70], [{dy: -3, stretch: 1, arms: ['up', 'up']}, 150], [{squash: 1}, 110], [{}, 200], // pop!
    ],
  })
}
