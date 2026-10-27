// Everyday moves: the little things he does all day. They have no label, so they stay out of the Tricks menu.
// The pet plays two of them itself: stretch after a long command, hop on a double-click.
{
  const WAVE = [[{eyes: 'up', arms: ['mid', 'high']}, 200], [{eyes: 'up', arms: ['mid', 'up']}, 200]]
  const EVERYDAY = {
    stretch: [[{squash: 1}, 160], [{stretch: 2, arms: ['high', 'high'], eyes: 'blink'}, 750], [{stretch: 1, arms: ['up', 'up']}, 180], [{squash: 1}, 220], [{}, 300]],
    yawn: [[{squash: 1, eyes: 'blink'}, 260], [{stretch: 1, eyes: 'blink', arms: ['up', 'mid']}, 950], [{squash: 1, eyes: 'blink'}, 200], [{}, 250]],
    lookAround: [[{eyes: 'side', look: -1}, 650], [{eyes: 'side', look: 1}, 650], [{eyes: 'up'}, 450], [{}, 200]],
    scratch: [...Array(4)].flatMap(() => [[{arms: ['high', 'mid'], eyes: 'up', lookX: -1}, 170], [{arms: ['up', 'mid'], eyes: 'up'}, 170]]),
    hop: [[{squash: 2}, 110], [{dy: -4, stretch: 1, tuck: 1}, 150], [{dy: -6, tuck: 1, arms: ['up', 'up']}, 150], [{dy: -2}, 110], [{squash: 2}, 130], [{}, 220]],
    sit: [[{squash: 2, tuck: 1}, 220], [{squash: 2, tuck: 1, eyes: 'blink'}, 1600], [{squash: 2, tuck: 1}, 1100], [{squash: 1}, 220]],
    wave: [...WAVE, ...WAVE, ...WAVE, [{}, 200]],
  }
  for (const [name, frames] of Object.entries(EVERYDAY)) hookpet.trick({name, rarity: 'common', frames})

  // On a window: he sinks behind its top edge until only his eyes peek over, looks around, and comes back up.
  hookpet.trick({name: 'peek', rarity: 'perched', weight: 2, frames: [
    [{sink: 12, clip: 1}, 90], [{sink: 24, clip: 1}, 90], [{sink: 36, clip: 1}, 500],
    [{sink: 36, clip: 1, eyes: 'side', look: -1}, 650], [{sink: 36, clip: 1, eyes: 'side', look: 1}, 650],
    [{sink: 36, clip: 1, eyes: 'blink'}, 120], [{sink: 36, clip: 1}, 450],
    [{sink: 24, clip: 1}, 90], [{sink: 12, clip: 1}, 90], [{}, 250],
  ]})
  // On a window: he sits on its edge, legs dangling over the front and swinging.
  hookpet.trick({name: 'ledgeSit', rarity: 'perched', weight: 2, frames: [
    [{sink: 6}, 120], [{sink: 12, arms: ['down', 'down']}, 300],
    ...[...Array(8)].map((_, i) => [{sink: 12, arms: ['down', 'down'], lift: i % 2 ? [0, 2] : [1, 3], eyes: i === 5 ? 'blink' : 'open'}, 380]),
    [{sink: 6}, 120], [{}, 200],
  ]})
}
