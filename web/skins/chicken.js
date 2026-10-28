// Behemoth chicken: fan art of the chicken mascot of The Behemoth, the studio behind Castle Crashers and BattleBlock
// Theater. Fan-made and unofficial, not affiliated with or endorsed by The Behemoth. Drawn three-quarters on, facing left
// (facing right is the mirror image), after The Behemoth's own pixel-art chicken, at about half its size.
// A skin adds itself to SKINS (see "Skins" in TRICKS.md). Rows of him from the tip of his crest; his eye, wing and foot
// are added per pose. B and D are his blue crest, wattle and tail, Y and G his yellow beak and its gold edge, K his inner lines.
{
  const ROWS = [
    '..............BB.............',
    '...........BBKBBB............',
    '...........BBKBBB............',
    '.........WWKKKBBB............',
    '.......WWWWWWWWKB............',
    '......WWWWWWWWWWKD...........',
    '.....WWWWWWWWWWWWW...........',
    '....WWGGWWWWWWWWWW...........',
    '....WGYYGWWWWWWWWWW..........',
    '...WGGGGGWWWWWWWWWWW.........',
    '...WGYYYGWWWWWWWWWWW.........',
    '...WGYYYGWWWWWWWWWWWW........',
    '..WWGYYYGWWWWWWWWWWWW........',
    '..WWGYYGWWWWWWWWWWWWWW.......',
    '..WWGYGWWWWWWWWWWWWWWW.......',
    '.WWWWGWWWWWWWWWWWWWWWWW......',
    '.WWWDBBDWWWWWWWWWWWWWWW......',
    '.WWDBBDDWWWWWWWWWWWWWWW......',
    '.WWDBBBDWWWWWWWWWWWWWWWW.BBB.',
    'WWWDBBDWWWWWWWWWWWWWWWWW.BBBB',
    'WWWDBBDWWWWWWWWWWWWWWWWW.BBB.',
    'WWWDBBDWWWWWWWWWWWWWWWWW.KKK.',
    'WWWDBBDWWWWWWWWWWWWWWWW..BB..',
    '.WWDBDWWWWWWWWWWWWWWWWW.DB...',
    '.WWDBDWWWWWWWWWWWWWWWW.......',
    '..WWDDWWWWWWWWWWWWWWW........',
    '...WWDWWWWWWWWWWWWWW.........',
    '.......WWWWWWWWW.............',
  ]
  const COLORS = ['#FFFFFF', '#F4F4F8', '#C9CFD8', '#0B0B0D'] // BODY, TOP (not drawn: he's all one white), SIDE (his eyelid), EYE
  const LINE = '#16161A'
  const INK = {W: COLORS[0], B: '#44AEF6', D: '#0060A0', Y: '#FFF050', G: '#B8960F', K: LINE, T: '#F2BE2E', M: '#6B2020'} // T: his toes, M: inside his beak
  // His beak open (a squawk, a yawn): the lower half drops a row under a dark mouth. [left x, rows down from his top, art]; W wipes the closed beak.
  const BEAK_OPEN = [13, 7, ['..GG.', '.GYYG', 'GYYYG', 'GMMMG', 'GMMGW', 'GYYYG', 'GYYYG', 'GYYGW', 'GYGWW', '.G...']]
  // His wing, a mitten of three feathers as in the reference: [left x, top y, art]. Folded at his side; flapped (up) with
  // its feathers out past his back; raised high over his back; held to his chin (chin); swung forward past his breast
  // instead of a hand, at the height the pose's hand asks for.
  const WING = {
    rest: [20, 31, ['..GGG..', '.GGYGG.', 'GYGYGYG', 'GYYYYYG', '.GYYYG.', '..GGG..']],
    up: [27, 23, ['..GGG...', '.GYYYGG.', 'GYYYGGGG', 'GYYYYYYG', 'GYYYGGGG', '.GYYYGG.', '..GGG...']],
    high: [27, 15, ['.G.G.G.', 'GYGYGYG', 'GYGYGYG', 'GYYYYYG', 'GYYYYYG', '.GYYYG.', '..GGG..']],
    chin: [12, 26, ['.G.G.G.', 'GYGYGYG', 'GYYYYYG', 'GYYYYYG', '.GYYYG.', '..GGG..']],
    hand: [5, 0, ['..GGGGG...', '.GYYYYYGG.', 'GGGGYYYYYG', 'GYYYYYYYYG', 'GGGGYYYYYG', '.GYYYYYYG.', '..GGGGGG..']],
  }
  // His front foot, tucked under the front of his belly with its toes on the ground, and kicked up behind him to scratch
  // at the dirt: [left x, top y, art].
  const FOOT = [7, 35, ['.GY', 'GYYY', '.GYYY', '.TTTT']], KICK = [28, 33, ['YG...', 'YYG..', '.YYYG', '..YYG', '..TTT']]
  // Pecking at the ground: all of him tipped forward over his foot, wing folded (his eye is added at PECK_EYE). From his crest down, from x 5.
  const PECK = [
    '........B...................',
    '.......BBB..................',
    '....BBKBBBB.................',
    '....BBKBBBB.................',
    '...KKKKKKKKKD...............',
    '....WWWWWWWWK...............',
    '...WWWWWWWWWWW..............',
    '..WWWWWWWWWWWWWW............',
    '..WWWWWWWWWWWWWWW...........',
    '.WWWWWWWWWWWWWWWWW..........',
    '.WGGGWWWWWWWWWWWWWW.........',
    '.WGYYGWWWWWWWWWWWWWW........',
    '.WGGGGWWWWWWWWWWWWWWW.......',
    'WGGYYGWWWWWWWWWWWWWWWW..BBB.',
    'WGYYYGWWWWWWWWWWWWWWWWW.BBBB',
    'WGYYYGWWWWWWWWWWWWWWWWWWKBBB',
    'WGYYGWWWWWWWWWWWWWWWWWWWKKK.',
    'WWGYGWWWWWWWWWWWWWWWWWWWKBB.',
    'WWWGWDDWWWWWWWWWWWWWWWWWKDB.',
    'WWWDBBDWWWWWWWWWWWWWWWWW....',
    'WWWDBBBDWWWWWGGGGWWWWWW.....',
    'WWDBBBDWWWWWGYGYGGWWWWW.....',
    'WWDBBBDWWWWWGYYGYGWWWW......',
    '.WWDBBDWWWWGYYYYYGWWWW......',
    '.WWDBBDWWWWGYYYYGWWW........',
    '.WWWDBDWWWWWGGGGWW..........',
    '..WWDBDWWWWWWWWWW...........',
    '..WWWDDWWWWWWWW.............',
    '...WWWWWWWWW................',
  ], PECK_EYE = [12, 16]
  console.assert(ROWS.every(r => r.length === 29) && PECK.every(r => r.length === 28), 'Chicken: every row is as wide as the rest')

  // How he moves: a chicken's own walk, everyday tricks and poses for Claude's states (see "Skins" in TRICKS.md).
  const FLAP = ['mid', 'up'], HIGH = ['mid', 'high'], CHIN = ['mid', 'chin']
  const fluff = [...Array(3)].flatMap(() => [[{stretch: 1, ox: -1}, 60], [{stretch: 1, ox: 1}, 60]]) // a shake that settles his feathers
  const flapHop = [[{squash: 2}, 110], [{dy: -4, stretch: 1, tuck: 1, arms: FLAP}, 110], [{dy: -6, tuck: 1, arms: HIGH}, 110], [{dy: -6, tuck: 1, arms: FLAP}, 90], [{dy: -3, arms: HIGH}, 100], [{squash: 2}, 130]]
  const peckPeck = [[{peck: 1}, 150], [{}, 120], [{peck: 1}, 150], [{}, 160]]
  const IDLE = [[{}, 3000], [{eyes: 'blink'}, 130], [{}, 2200], ...peckPeck, [{}, 1500], [{eyes: 'blink'}, 120], [{eyes: 'side', look: 1}, 600], [{}, 500], [{squash: 1}, 400]]
  const sweep = [[-1, 180], [0, 240], [1, 160], [2, 300]].map(([dx, ms]) => [{arms: CHIN, dx}, ms]), snap = [{arms: CHIN, dx: -1}, 90]
  const tap = [[{arms: CHIN, eyes: 'up', tapLeg: 0}, 150], [{arms: CHIN, eyes: 'up'}, 150]] // a foot tapping while he mulls it over
  const ASK = {eyes: 'up', arms: HIGH}
  const MOVES = {
    walk(now, dir, arms){ // a strut: he pitches forward as each foot lands, his wing folded
      const i = Math.floor(now / 120) % 4
      return {face: dir, lift: i === 0 ? [0, 3] : i === 2 ? [1, 2] : [], dy: i % 2 ? -1 : 0, arms: arms || ['mid', 'mid'], lookX: 1, tilt: dir * [5, 1, 4, 0][i]}
    },
    tricks: {
      stretch: [[{squash: 1}, 160], [{stretch: 1, arms: HIGH, kick: 1, eyes: 'blink'}, 650], [{stretch: 2, arms: HIGH, eyes: 'blink', beak: 'open'}, 350], [{squash: 1}, 140], ...fluff, [{}, 300]], // wing and leg stretched out behind, then a shake
      yawn: [[{squash: 1, eyes: 'blink'}, 260], [{stretch: 1, eyes: 'blink', beak: 'open', arms: FLAP}, 950], [{squash: 1, eyes: 'blink'}, 200], [{}, 250]],
      lookAround: [ // the jerky head of a bird: one eye, then the other, then a peck
        [{eyes: 'side', look: -1}, 450], [{eyes: 'side', look: -1, dy: -1}, 90], [{eyes: 'side', look: -1}, 300],
        [{eyes: 'side', look: 1}, 450], [{eyes: 'side', look: 1, dy: -1}, 90], [{eyes: 'side', look: 1}, 300],
        [{eyes: 'up'}, 350], [{peck: 1}, 150], [{}, 250],
      ],
      scratch: [...Array(2)].flatMap(() => [[{kick: 1, dy: -1}, 140], [{}, 110], [{kick: 1, dy: -1}, 140], [{}, 130], ...peckPeck]).concat([[{eyes: 'side', look: 1}, 380], [{}, 150]]), // scratches at the dirt, pecks at what turned up
      hop: [...flapHop, [{}, 220]],
      sit: [[{squash: 1}, 140], [{squash: 2, tuck: 1}, 160], [{squash: 1, tuck: 1, ox: -1}, 70], [{squash: 1, tuck: 1, ox: 1}, 70], [{squash: 2, tuck: 1}, 200], [{squash: 2, tuck: 1, eyes: 'blink'}, 1500], [{squash: 2, tuck: 1}, 1000], [{squash: 1}, 220]], // settles onto his foot like a hen on eggs
      wave: [...Array(3)].flatMap(() => [[{eyes: 'happy', arms: HIGH, beak: 'open'}, 180], [{eyes: 'happy', arms: FLAP}, 180]]).concat([[{}, 200]]),
      dance: [...Array(2)].flatMap(() => [ // the chicken dance: beak, wings, tail feathers, clap
        ...[...Array(2)].flatMap(() => [[{beak: 'open', hand: 6, notes: 1}, 130], [{hand: 6, notes: 1}, 130]]),
        ...[...Array(2)].flatMap(() => [[{arms: FLAP, notes: 1}, 130], [{arms: HIGH, notes: 1}, 130]]),
        ...[...Array(2)].flatMap(() => [[{squash: 1, ox: -1, notes: 1}, 130], [{squash: 1, ox: 1, notes: 1}, 130]]),
        ...[...Array(2)].flatMap(() => [[{hand: 8, notes: 1}, 130], [{hand: 3, notes: 1}, 130]]),
      ]).concat([[{squash: 2, notes: 1}, 120], [{dy: -5, tuck: 1, arms: HIGH, eyes: 'happy', beak: 'open', notes: 1}, 200], [{squash: 2, eyes: 'happy', notes: 1}, 140], [{arms: FLAP, eyes: 'happy', notes: 1}, 450], [{}, 200]]),
    },
    moods: {
      idle: {intro: IDLE, rest: IDLE},
      thinking: {intro: [...sweep, snap, ...sweep, snap, [{arms: CHIN, eyes: 'blink'}, 120], [{arms: CHIN}, 400]], rest: [[{arms: CHIN}, 1600], ...tap, ...tap, [{arms: CHIN, eyes: 'side', look: 1}, 800], ...sweep, snap, [{arms: CHIN, eyes: 'blink'}, 120]]}, // his wing to his chin
      needs: {intro: [[{...ASK, beak: 'open'}, 200], [{eyes: 'up', arms: FLAP}, 200]], rest: [[ASK, 1500], [{...ASK, squash: 1}, 110], [{...ASK, dy: -3, tuck: 1, beak: 'open'}, 140], [{...ASK, dy: -1}, 100], [{...ASK, squash: 1}, 120]]},
      done: {intro: [...flapHop.map(([p, ms]) => [{...p, eyes: 'happy', beak: p.dy ? 'open' : undefined}, ms]), [{arms: FLAP, eyes: 'happy'}, 300], [{arms: HIGH, eyes: 'happy'}, 300], [{eyes: 'happy'}, 300]], rest: IDLE},
      blocked: {intro: [[{squash: 2, tuck: 1, eyes: 'sad'}, 2800], [{squash: 1, tuck: 1, eyes: 'sad'}, 300], [{squash: 2, tuck: 1, eyes: 'blink'}, 450]], rest: [[{squash: 2, tuck: 1, eyes: 'sad'}, 2800], [{squash: 1, tuck: 1, eyes: 'sad'}, 300], [{squash: 2, tuck: 1, eyes: 'blink'}, 450]]}, // sat down, glum, a sigh now and then
      nap: {intro: [[{squash: 2, tuck: 1, eyes: 'sleep'}, 2400], [{squash: 1, tuck: 1, eyes: 'sleep'}, 2400]], rest: [[{squash: 2, tuck: 1, eyes: 'sleep'}, 2400], [{squash: 1, tuck: 1, eyes: 'sleep'}, 2400]]}, // dozing in a heap
    },
  }

  SKINS.chicken = {
    ...MOVES,
    name: 'Chicken', label: 'Behemoth chicken (fan art)', colors: COLORS, sideOn: true, pack: 'fan',
    /** Where costumes find his face, as drawn facing left: his eye (x, y: its left pixel), the top of his head in front of his crest, the front of his face by his beak, and the row under his beak where his face ends. */
    head(pose){
      const top = 38 - ROWS.length + (pose.squash || 0) - (pose.stretch || 0) + (pose.dy || 0) // as draw() works it out
      return {x: 19, y: top + 7, top: top + 3, nose: 12, chin: top + 15}
    },
    /** The chicken in a pose: squashed or stretched under his beak (or tipped over to peck), his beak open or shut, his wing instead of arms, his eye, outlined, then his foot stepping, tucked or kicked back. */
    draw(pose, eyeColor){
      const rows = ROWS.slice(), sq = pose.squash || 0, st = pose.stretch || 0
      rows.splice(16, sq); for (let i = 0; i < st; i++) rows.splice(16, 0, rows[16]) // shorter or taller under his beak, where his sides run straight
      const dy = pose.dy || 0, top = 38 - rows.length + dy, right = pose.face > 0
      const px = new Map() // drawn as he faces left (mirrored after); a later pixel covers an earlier one
      const put = (x, y, c) => px.set(x + ',' + y, [x, y, c])
      const art = (x0, y0, a, behind) => a.flatMap((r, j) => [...r].flatMap((ch, i) => { // the cells it drew; behind leaves what's there
        const x = x0 + i, y = y0 + j
        return INK[ch] && !(behind && px.has(x + ',' + y)) ? (put(x, y, INK[ch]), [[x, y]]) : []
      }))
      const outline = cells => { for (const [x, y] of cells) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!px.has(x + ax + ',' + (y + ay))) put(x + ax, y + ay, LINE) }
      if (pose.peck) art(5, 8 + dy, PECK)
      else art(9, top, rows)
      const arms = pose.arms || [], toChin = arms.includes('chin') || (arms[0] === 'up' && !['up', 'high'].includes(arms[1])) // Clawd's first hand alone up is a hand to his chin
      const flap = pose.hand != null || pose.reach ? 'hand' : toChin ? 'chin' : arms.includes('high') ? 'high' : arms.includes('up') ? 'up' : 'rest'
      const [wx, wy, wing] = WING[flap]
      if ((pose.beak === 'open' || pose.sneeze === 0) && !pose.peck) art(BEAK_OPEN[0], top + BEAK_OPEN[1], BEAK_OPEN[2]) // a squawk, a yawn, the CHOO of a sneeze
      const beak = new Set([INK.Y, INK.G]), under = new Map(px) // what the wing covers: his beak shares its yellow
      const feathers = pose.peck ? [] : art(wx + (flap === 'rest' ? pose.swing || 0 : 0), (flap === 'hand' ? Math.max(18, Math.min(30, 17 + (pose.hand ?? 10))) : wy) + dy, wing) // folded, it sways as he waddles; a hand goes where it's held
      if (flap === 'hand' || flap === 'chin') { // a dark line where it meets his beak, so the two don't run together
        const mine = new Set(feathers.map(([x, y]) => x + ',' + y))
        for (const [x, y] of feathers) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = x + ax + ',' + (y + ay); if (!mine.has(k) && beak.has(under.get(k)?.[2])) put(x + ax, y + ay, LINE) }
      }
      // His eye, a dash: it looks about with the same keys as Clawd's (screen directions), and keeps his expressions.
      const kind = pose.eyes || 'open', ex = pose.peck ? (right ? GW - 2 - PECK_EYE[0] : PECK_EYE[0]) : right ? 23 : 19, ey = pose.peck ? PECK_EYE[1] + dy : top + 7
      const lx = Math.max(-1, Math.min(1, kind === 'side' ? pose.look ?? 1 : pose.dx ?? pose.lookX ?? 0)), ly = kind === 'up' ? -1 : kind === 'down' ? 1 : pose.lookY || 0
      const eye = (pts, c = eyeColor, flip) => { const w = Math.max(...pts.map(p => p[0])); for (const [x, y] of pts) { const sx = flip && right ? w - x : x; put(right ? GW - 1 - ex - sx : ex + sx, ey + y, c) } }
      if (kind === 'blink') eye([[0, 0], [1, 0]], COLORS[2])
      else if (kind === 'sleep') { eye([[0, 0], [1, 0]], COLORS[2]); eye([[0, 1], [1, 1]]) } // his lid down over a closed eye
      else if (kind === 'happy') eye([[0, 0], [1, -1], [2, 0]])
      else if (kind === 'sad') eye([[0, 0], [1, 0], [2, 1]], eyeColor, true) // drooping toward his back
      else if (kind === 'dizzy') eye([[0, -1], [2, -1], [1, 0], [0, 1], [2, 1]])
      else if (kind === 'strain') eye([[1, -1], [0, 0], [1, 1]], eyeColor, true) // squeezed shut toward his beak
      else if (kind === 'angry') { eye([[0, 0], [1, 0]]); eye([[0, -1], [1, -2], [2, -3]], eyeColor, true) } // a brow slanting down to his beak
      else eye([[lx, ly], [lx + 1, ly]])
      outline([...px.values()])
      // One foot: an even lift or tap is his (Clawd's feet 0 and 2 are in front), stepping up and forward. Pecking, it shows in front of him.
      const step = pose.lift?.length ? pose.lift[0] % 2 === 0 : pose.tapLeg != null && pose.tapLeg % 2 === 0
      const [fx, fy] = step ? [-1, -2] : [0, 0], [x0, y0, foot] = pose.kick ? KICK : FOOT
      if (!pose.tuck) outline(art(x0 + fx - (pose.peck ? 2 : 0), y0 + fy + dy, foot, true)) // behind his outline, as in the reference; tucked, he sits on it
      const out = [...px.values()].map(([x, y, c]) => [right ? GW - 1 - x : x, y, c])
      return pose.ox ? out.map(([x, y, c]) => [x + pose.ox, y, c]) : out
    },
  }
}
