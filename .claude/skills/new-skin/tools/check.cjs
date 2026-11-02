// Plays every trick (Fan pack on) and every Claude state on a skin in headless Chrome, on a fake clock, and prints
// {durations, problems}: node check.cjs <skin key> <outdir>   (ONLY=dance,wave picks tricks; DSF=2 shoots at 2x; EVERY=80 shoots every 80 ms, not 400;
// WEB=<another checkout>/web/pet.html runs that copy of the page, e.g. main's, to compare; TURN=1 plays the turn
// scenarios instead and checks them, for a skin that draws views). It exits 1 on any problem or unfinished trick.
// Frames around the pet land in outdir; python3 framesheet.py <outdir> <out.png> makes contact sheets of them.
const fs = require('fs'), path = require('path'), os = require('os')
const npx = path.join(os.homedir(), '.npm/_npx') // puppeteer from the npx cache, so the repo needs no package.json
const found = fs.existsSync(npx) && fs.readdirSync(npx).map(d => path.join(npx, d, 'node_modules/puppeteer')).find(d => fs.existsSync(d))
if (!found) { console.error('No puppeteer in ~/.npm/_npx: run `npx -y puppeteer browsers install chrome-headless-shell` once.'); process.exit(1) }
const puppeteer = require(found)
const EVERY = +(process.env.EVERY || 400)
const WEB = process.env.WEB || path.resolve(__dirname, '../../../../web/pet.html'), [skin, out] = process.argv.slice(2)
const FRAME = 40

const fakeClock = seed => { // time moves only when __tick(ms) is called, and Math.random is seeded
  let now = 0, rafId = 0, tid = 0, s = seed >>> 0
  const raf = new Map(), timers = new Map(), D0 = Date.parse('2026-10-26T15:41:00')
  performance.now = () => now
  Date.now = () => D0 + now
  requestAnimationFrame = cb => (raf.set(++rafId, cb), rafId)
  cancelAnimationFrame = id => raf.delete(id)
  setTimeout = (cb, ms = 0, ...a) => (timers.set(++tid, {at: now + ms, cb, a}), tid)
  setInterval = (cb, ms = 0, ...a) => (timers.set(++tid, {at: now + ms, every: ms, cb, a}), tid)
  clearTimeout = clearInterval = id => timers.delete(id)
  Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  window.__tick = ms => {
    now += ms
    for (const [id, t] of [...timers].sort((a, b) => a[1].at - b[1].at)) if (t.at <= now) { t.every ? (t.at += t.every) : timers.delete(id); t.cb(...t.a) }
    const cbs = [...raf.values()]; raf.clear(); for (const cb of cbs) cb(now)
    for (const a of document.getAnimations()) { if (!a.__fake) { a.__fake = true; a.pause() } else a.currentTime += ms }
  }
}

;(async () => {
  fs.mkdirSync(out, {recursive: true})
  const problems = []
  const browser = await puppeteer.launch({args: ['--hide-scrollbars'], headless: 'shell'}) // the new headless mode's screenshots can time out
  const page = await browser.newPage()
  await page.setViewport({width: 1100, height: 1100, deviceScaleFactor: +(process.env.DSF || 1)})
  await page.evaluateOnNewDocument(fakeClock, 7)
  let doing = 'load'
  // (willReadFrequently: Chrome's hint about the turn scenarios' own readback of his canvas, not a problem with the page)
  page.on('console', m => { if (['warn', 'error', 'assert'].includes(m.type()) && !m.text().includes('willReadFrequently')) problems.push(`[${doing}] ${m.type()}: ${m.text()}`) })
  page.on('pageerror', e => problems.push(`[${doing}] pageerror: ${e.message}`))
  await page.goto('file://' + WEB + '?skin=' + skin)
  await page.evaluate(() => {
    demo.on = false
    preset = {...PRESETS.calm, chance: {walk: 0, pause: 1, move: 0, jump: 0, trip: 0}}
    const zsh = [...desk.querySelectorAll('.win')].pop(), s = surfaces().find(s => Math.abs(s.y - (zsh.offsetTop - PH + 1)) < 1)
    place(124, s.y); ai.mode = 'pause'; ai.until = 0
    useFanPack(true); setState('idle')
  })
  const tick = ms => page.evaluate((ms, f) => { for (let i = 0; i < ms / f; i++) __tick(f) }, ms, FRAME)
  await tick(1500)
  const run = js => page.evaluate(js)
  const shot = async file => {
    const r = await page.evaluate(() => { const b = canvas.getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height / 2 + scrollY} })
    const clip = {x: Math.max(0, r.x - 150), y: Math.max(0, r.y - 110), width: 300, height: 200}
    await page.screenshot({path: file, clip, captureBeyondViewport: true})
  }
  if (process.env.TURN) { const failed = await turns(page, run, out, problems); await browser.close(); process.exit(failed || problems.length ? 1 : 0) }
  const report = {}
  const frames = async (name, ms, keep = 5) => { // keep frames spread over ms
    for (let k = 0; k < keep; k++) { await tick(ms / keep); await shot(path.join(out, `${name}-${k}.png`)) }
  }
  const tricks = process.env.ONLY ? process.env.ONLY.split(',') : await run('Object.keys(TRICKS)')
  for (const name of tricks) {
    doing = name
    await run(`setState('idle'); ai.mode = 'pause'; ai.until = 0`); await tick(400)
    await run(`perform(${JSON.stringify(name)})`)
    let T = 0
    const shots = []
    while (T < 20000 && await run(`ai.mode === 'fidget' || ai.mode === 'script' || ai.mode === 'jump' || ai.mode === 'fall' || ai.next`)) {
      if (T % EVERY === 0) { const f = path.join(out, `${name}-t${String(T).padStart(5, '0')}.png`); await shot(f); shots.push(f) }
      await tick(FRAME); T += FRAME
    }
    report[name] = T
    if (T >= 20000) problems.push(`[${name}] never finished`)
    await tick(600)
  }
  for (const id of process.env.ONLY ? [] : await run('Object.keys(MOODS)')) { doing = 'state ' + id; await run(`setState(${JSON.stringify(id)})`); await frames('state-' + id, 4000, 3) }
  doing = 'end'
  await run(`setState('idle')`); await tick(1000)
  console.log(JSON.stringify({durations: report, problems}, null, 1))
  await browser.close(); process.exit(problems.length ? 1 : 0)
  await browser.close()
})()

/**
 * The turn scenarios (TURN=1): stationary turns both ways, a reversal halfway, repeated changes, walk-stop-face you-walk,
 * a turn holding the pencil, a turn interrupted by a drag and a state change, a dropped frame, and Reduce Motion. Every
 * frame's view, lowest pixel and paw are sampled; each scenario's canvas frames are saved as <name>-NNN.png in out.
 */
async function turns(page, run, out, problems){
  const STEP = await run("typeof TURN_STEP === 'number' ? TURN_STEP : 80"), results = {} // a page without views (main, for a baseline) still plays
  const sample = () => run(`(() => { const {pose, px} = pet.shown || {pose: {}, px: [[0, 0]]}, h = SKINS[SKIN].hand?.(pose), lifted = pose.hand != null || pose.reach || (pose.arms || []).some(a => a === 'up' || a === 'high')
    const toe = h && lifted ? Math.min(...px.filter(p => p[2] === '#7A3A3E').map(([x, y]) => Math.max(Math.abs(x - h.x), Math.abs(y - h.y)))) : null
    const low = Math.max(...px.map(p => p[1])), row = px.filter(p => p[1] === low - 1).map(p => p[0]) // his feet's row, as placed on screen in art pixels
    return {t: performance.now(), view: pose.view, low, feet: (Math.min(...row) + Math.max(...row)) / 2 + pet.x / (PW / GW * size), toe, png: canvas.toDataURL(), drawn: ctx.getImageData(0, 0, canvas.width, canvas.height).data.some((v, i) => i % 4 === 3 && v)} })()`)
  const play = async (name, setup, steps) => { // steps: [[ms, frame, action?], ...]; each frame is sampled
    await run(`document.body.classList.remove('reduced'); pet.drag = null; setState('idle'); ai.mode = 'pause'; ai.until = 1e12; pet.heading = -1; pet.turn = {from: -2, to: -2, at: -1e9, base: -2}`)
    await page.evaluate(() => __tick(400))
    if (setup) await run(setup)
    await page.evaluate(() => __tick(200))
    const got = [], marks = []
    for (const [ms, frame, act] of steps) {
      if (act) { await run(act); marks.push({at: (await run('performance.now()')), act}) }
      for (let t = 0; t < ms; t += frame) { await page.evaluate(f => __tick(f), frame); got.push(await sample()) }
    }
    if (process.env.DEBUG) console.error(name, got.map(g => g.view + '@' + g.feet).join(' '), await run('JSON.stringify(pet.turn)'))
    got.forEach((g, i) => { fs.writeFileSync(path.join(out, `${name}-${String(i).padStart(3, '0')}.png`), Buffer.from(g.png.split(',')[1], 'base64')); delete g.png })
    return {got, marks}
  }
  const blank = got => got.some(g => !g.drawn) // headless Chrome sometimes fails to draw the canvas at all: a run to repeat, not a pass
  const fail = (name, msg) => { (results[name] ||= {pass: true, notes: []}).pass = false; results[name].notes.push(msg) }
  const views = got => got.map(g => g.view).filter((v, i, a) => i === 0 || v !== a[i - 1])
  const range = (a, b) => Array.from({length: Math.abs(b - a) + 1}, (_, i) => a + Math.sign(b - a) * i)
  const check = (name, got, mark, from, to, frame, {stationary = true, skips = false, until = Infinity, planted = stationary} = {}) => {
    results[name] ||= {pass: true, notes: []}
    if (blank(got)) fail(name, 'the canvas came out blank (a headless Chrome flake): run it again')
    const after = got.filter(g => g.t > mark.at && g.t <= until), seq = views([{view: from}, ...after])
    const want = range(from, to)
    if (!skips && JSON.stringify(seq) !== JSON.stringify(want)) fail(name, `views ${seq} not ${want}`)
    if (skips && (seq.some((v, i) => i && Math.sign(v - seq[i - 1]) !== Math.sign(to - from)) || seq.at(-1) !== to)) fail(name, `views ${seq} not monotonic to ${to}`)
    const done = after.find(g => g.view === to), limit = Math.abs(to - from) * STEP + frame
    if (!done) fail(name, `never reached ${to}`)
    else if (done.t - mark.at > limit) fail(name, `reached ${to} after ${done.t - mark.at} ms, over ${limit}`)
    if (stationary) { const lows = after.map(g => g.low); if (Math.max(...lows) - Math.min(...lows) > 1) fail(name, `feet moved: lowest row ${Math.min(...lows)} to ${Math.max(...lows)}`) }
    if (planted) { const xs = after.map(g => g.feet); if (Math.max(...xs) - Math.min(...xs) > 1) fail(name, `feet slid ${(Math.max(...xs) - Math.min(...xs)).toFixed(1)} px`) }
    const toes = after.filter(g => g.toe != null); if (toes.some(g => g.toe > 1)) fail(name, `paw off its hand point by ${Math.max(...toes.map(g => g.toe))} px`)
    results[name].ms = done ? done.t - mark.at : null
  }
  for (const frame of [16, 40]) { // stationary turns both ways, at two frame steps
    let {got, marks} = await play(`turnLR-${frame}`, null, [[500, frame, 'pet.heading = 1']]); check(`turnLR-${frame}`, got, marks[0], -2, 2, frame)
    ;({got, marks} = await play(`turnRL-${frame}`, 'pet.heading = 1; pet.turn = {from: 2, to: 2, at: -1e9, base: 2}', [[500, frame, 'pet.heading = -1']])); check(`turnRL-${frame}`, got, marks[0], 2, -2, frame)
  }
  { // a dropped frame: one 200 ms gap halfway through
    const {got, marks} = await play('dropped', null, [[80, 40, 'pet.heading = 1'], [200, 200], [300, 40]]); check('dropped', got, marks[0], -2, 2, 200, {skips: true})
  }
  { // a reversal halfway: it turns straight back from where it is, never reaching the far side
    const {got, marks} = await play('reversal', null, [[STEP * 2, 40, 'pet.heading = 1'], [500, 40, 'pet.heading = -1']])
    const at = got.filter(g => g.t <= marks[1].at).at(-1).view
    if (got.some(g => g.view === 2)) fail('reversal', 'reached the far side')
    check('reversal', got, marks[1], at, -2, 40)
  }
  { // repeated changes: never jumps more than a view a frame, and settles
    const steps = [...Array(6)].map((_, i) => [120, 40, `pet.heading = ${i % 2 ? -1 : 1}`]).concat([[500, 40]])
    const {got} = await play('repeated', null, steps)
    results.repeated = {pass: true, notes: []}
    got.forEach((g, i) => { if (i && Math.abs(g.view - got[i - 1].view) > 1) fail('repeated', `jumped ${got[i - 1].view} to ${g.view} at ${g.t}`) })
    if (got.at(-1).view !== -2) fail('repeated', `settled on ${got.at(-1).view}`)
  }
  { // walk, stop, turn to face you, walk on
    const {got, marks} = await play('walkFace', null, [[600, 40, 'walkTo(pet.x + 60, 1)'], [600, 40, "ai.mode = 'pause'; ai.until = 1e12; setState('needs')"], [700, 40, "setState('idle'); walkTo(pet.x - 60, 1)"]])
    check('walkFace', got, marks[1], 2, 0, 40, {until: marks[2].at, planted: false}); check('walkFace', got, marks[2], 0, -2, 40, {stationary: false})
  }
  { // turning while holding the pencil (Claude editing, the page swapped to his other side)
    const {got, marks} = await play('pencil', "setState('editing'); pet.propSide = -1", [[400, 40], [600, 40, 'pet.propSide = 1']]); check('pencil', got, marks[0], -2, 2, 40, {planted: false}) // his lifted paw takes a foot off the row
  }
  { // interrupted: picked up halfway and Claude starts thinking; the turn still finishes and nothing jumps
    const {got, marks} = await play('interrupt', null, [[STEP * 2, 40, 'pet.heading = 1'], [600, 40, "pet.drag = {sx: 0, sy: 0, x: pet.x, y: pet.y, moved: true, trail: []}; setState('thinking')"]])
    check('interrupt', got, marks[0], -2, 2, 40, {stationary: false})
  }
  { // Reduce Motion: no in-between views, straight to the new facing, and to face you when needed
    const {got, marks} = await play('reduced', "document.body.classList.add('reduced')", [[200, 40, 'pet.heading = 1'], [200, 40, "setState('needs')"], [200, 40, "setState('idle')"]])
    results.reduced = {pass: true, notes: []}
    const seq = views(got)
    if (JSON.stringify(seq) !== JSON.stringify([2, 0, 2])) fail('reduced', `views ${seq}, not straight to 2, 0, 2`) // its first frame is already after the turn
  }
  const failed = Object.values(results).some(r => !r.pass)
  console.log(JSON.stringify({turnStep: STEP, results, problems}, null, 1))
  return failed
}
