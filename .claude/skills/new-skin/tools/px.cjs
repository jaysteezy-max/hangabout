// node px.cjs <skin.js> <key> '<json list of poses>' -> {colors, out: each pose's pixels, heads}   (asserts print to stderr)
// node px.cjs <skin.js> <key> sweep -> every shared pose key, plus his own walk, trick frames and moods: pixels off the
//   44x40 grid (exits 1), and poses with no hop, tuck or lifted foot whose lowest pixel isn't on row 39 (look at each: fine
//   only if one of his own keys lifts a foot on purpose, like the chicken's kick).
const vm = require('vm'), fs = require('fs')
const [file, key, poses] = process.argv.slice(2)
global.SKINS = {}; global.GW = 44; global.GH = 40
vm.runInThisContext(fs.readFileSync(file, 'utf8'), {filename: file})
const s = SKINS[key], draw = p => s.draw(p, s.colors[3])
if (poses !== 'sweep') {
  const list = JSON.parse(poses)
  console.log(JSON.stringify({colors: s.colors, out: list.map(draw), heads: s.head ? list.map(p => s.head(p)) : null}))
} else {
  const lv = ['down', 'mid', 'up', 'high'], eyes = ['open', 'blink', 'up', 'down', 'side', 'happy', 'sad', 'angry', 'strain', 'dizzy']
  const shared = [{}, ...eyes.map(e => ({eyes: e})), ...[1, 2].flatMap(n => [{squash: n}, {stretch: n}]), {tuck: 1}, {dy: -8, tuck: 1},
    ...lv.flatMap(a => lv.map(b => ({arms: [a, b]}))), {arms: ['cross', 'cross']}, {lift: [0, 3]}, {lift: [1, 2]},
    ...[0, 1, 2, 3].map(tapLeg => ({tapLeg})), ...[-1, 1].map(swing => ({swing})), ...[0, 4, 8, 12].map(hand => ({hand})), {reach: 3}]
  const named = [...shared.flatMap(p => [-1, 0, 1].map(face => [JSON.stringify(p) + ' face ' + face, {...p, face}])),
    ...[-1, 1].flatMap(dir => [...Array(16)].map((_, i) => [`walk ${dir} at ${i * 40} ms`, s.walk?.(i * 40, dir)]).filter(([, p]) => p)),
    ...Object.entries(s.tricks || {}).flatMap(([n, fr]) => fr.map(([p], i) => [`tricks.${n}[${i}]`, p])),
    ...Object.entries(s.moods || {}).flatMap(([n, m]) => ['intro', 'rest'].flatMap(k => (m[k] || []).map(([p], i) => [`moods.${n}.${k}[${i}]`, p])))]
  const off = [], floats = []
  for (const [name, p] of named) {
    const px = draw(p), out = px.filter(([x, y]) => x < 0 || x >= 44 || y < 0 || y >= 40), low = Math.max(...px.map(q => q[1]))
    if (out.length) off.push(`off grid: ${name}: ${out.length} pixels, e.g. ${out[0].slice(0, 2)}`)
    if (!p.dy && !p.tuck && !p.sink && !p.lift?.length && p.tapLeg == null && low !== 39) floats.push(`floats: ${name}: lowest pixel on row ${low}`)
  }
  console.log([...off, ...floats, `${named.length} poses, ${off.length} off grid, ${floats.length} floating`].join('\n'))
  process.exitCode = off.length ? 1 : 0
}
