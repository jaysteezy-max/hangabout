// Tests the pet across several displays: web/pet.html in headless Chrome on a fake clock, with a fake app that owns the
// displays the way app/Hangabout.swift and app/win/main.js do (it moves his layer when the page asks, and tells the
// page). node scripts/test_displays.cjs [part of a test's name]
// Puppeteer comes from the npx cache, as in .claude/skills/new-skin/tools/check.cjs, so the repo needs no package.json.
const fs = require('fs'), path = require('path'), os = require('os'), assert = require('assert')
const npx = path.join(os.homedir(), '.npm/_npx')
const found = fs.existsSync(npx) && fs.readdirSync(npx).map(d => path.join(npx, d, 'node_modules/puppeteer')).find(d => fs.existsSync(d))
if (!found) { console.error('No puppeteer in ~/.npm/_npx: run `npx -y puppeteer browsers install chrome-headless-shell` once.'); process.exit(1) }
const puppeteer = require(found)
const WEB = path.resolve(__dirname, '../web/pet.html'), FRAME = 33

// Jay's desk, as macOS reports it, in desktop coordinates (the main display's top-left at 0,0; y down): the laptop under
// two monitors side by side, the line between them above the laptop's middle.
const JAY = [
  {id: 'mac', x: 0, y: 0, w: 1710, h: 1112, top: 38, bottom: 66},
  {id: 'dellL', x: -1028, y: -1080, w: 1920, h: 1080, top: 0, bottom: 0},
  {id: 'dellR', x: 892, y: -1080, w: 1920, h: 1080, top: 0, bottom: 0},
]
const STILL = {walk: 0, pause: 1, move: 0, jump: 0, trip: 0, cross: 0} // he waits where he's put until a test moves him

const fakeClock = seed => { // the same fake clock as check.cjs: time moves only when __tick(ms) is called, Math.random is seeded
  let now = 0, rafId = 0, tid = 0, s = seed >>> 0
  const raf = new Map(), timers = new Map(), D0 = Date.parse('2026-11-03T10:00:00')
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
// The app's end of window.webkit.messageHandlers.hangabout: it keeps the page's asks to move his layer.
const fakeApp = () => { window.__asks = []; window.webkit = {messageHandlers: {hangabout: {postMessage: m => { if (typeof m?.display === 'string') __asks.push(m.display) }}}} }

let browser
/** A page on the fake clock. With app (the default) it runs as in the app, on display `on` of `layout`. */
async function open({on = 'mac', layout = JAY, app = true, seed = 7, x} = {}){
  const page = await browser.newPage(), h = {page, layout, on, sent: [], problems: []}
  const size = d => page.setViewport({width: d.w, height: d.h})
  await size(layout.find(d => d.id === on) || {w: 1100, h: 900})
  await page.evaluateOnNewDocument(fakeClock, seed)
  if (app) await page.evaluateOnNewDocument(fakeApp)
  page.on('console', m => { if (['warn', 'error', 'assert'].includes(m.type())) h.problems.push(`${m.type()}: ${m.text()}`) })
  page.on('pageerror', e => h.problems.push(`pageerror: ${e.message}`))
  await page.goto('file://' + WEB)
  h.run = (fn, ...args) => page.evaluate(fn, ...args)
  /** The app moving his layer: the window takes the display's size, then the page hears about it. */
  h.show = async (id, list = h.layout) => {
    h.layout = list
    const d = list.find(d => d.id === id)
    if (d) { h.on = id; await size(d) }
    await h.run((list, on) => hangabout.displays(list, on), list, h.on)
  }
  /** Runs the clock in 33 ms frames, answering each ask to move his layer as the app would. */
  h.tick = async ms => {
    for (let left = Math.round(ms / FRAME); left > 0;) {
      const r = await h.run(n => { for (let i = 0; i < n; i++) { __tick(33); if (window.__asks?.length) return {done: i + 1, asks: __asks.splice(0)} } return {done: n, asks: []} }, Math.min(left, 30))
      left -= r.done
      for (const id of r.asks) { h.sent.push(id); await h.show(h.layout.some(d => d.id === id) ? id : h.on) } // a display that's gone: the app stays put
    }
  }
  /** The mouse on him, at (gx, gy) on the desktop: the app hands the page points on the display his layer covers. */
  h.pointer = (type, gx, gy) => { const d = h.layout.find(d => d.id === h.on); return h.run((t, x, y) => hangabout.pointer(t, x, y), type, gx - d.x, gy - d.y) }
  h.wait = ms => h.run(ms => __tick(ms), ms) // one step of the clock, without answering asks
  /** His middle on the desktop, where you'd grab him. */
  h.middle = () => h.run(() => middle())
  h.where = () => h.run(() => {
    const f = feet(), s = surfaceUnder(pet.x, pet.y)
    return {on: disp.on, x: f.x, y: f.y, mode: ai.mode, standing: !!s && Math.abs(s.y - pet.y) < 2 && !['jump', 'fall', 'script', 'dangle'].includes(ai.mode)}
  })
  /** Puts him on the floor of the display he's on, feet at x, waiting there. */
  h.put = x => h.run((x, still) => { place(x - 66, surfaces()[0].y); ai.mode = 'pause'; ai.until = 0; preset = {...PRESETS.normal, chance: still} }, x, STILL)
  if (app) {
    await h.show(on)
    await h.run(() => { demo.on = false; hangabout.settings({sound: false, reduced: false, scale: 1, preset: 'normal', fan: false, found: []}); setState('idle') })
    if (x != null) await h.put(x)
    await h.tick(200)
  }
  return h
}

const tests = []
const test = (name, fn) => tests.push({name, fn})
const near = (a, b, by = 2) => assert(Math.abs(a - b) <= by, `${a} isn't within ${by} of ${b}`)

// ---- Task 1: displays in the page ----
test('neighbors follow the arrangement', async () => {
  const h = await open({app: false})
  const got = await h.run(list => {
    const of = id => neighbors(list, list.find(d => d.id === id)).map(n => [n.side, n.to.id, n.lo, n.hi]).sort().join(' ')
    const one = [list[0]], corner = [{id: 'a', x: 0, y: 0, w: 100, h: 100}, {id: 'b', x: 100, y: 100, w: 100, h: 100}]
    const sliver = [{id: 'a', x: 0, y: 0, w: 100, h: 100}, {id: 'b', x: 100, y: 70, w: 100, h: 100}] // 30 points shared: too little
    return {mac: of('mac'), dellL: of('dellL'), dellR: of('dellR'), one: neighbors(one, one[0]).length,
      corner: neighbors(corner, corner[0]).length, sliver: neighbors(sliver, sliver[0]).length}
  }, JAY)
  assert.strictEqual(got.mac, 'up,dellL,0,892 up,dellR,892,1710')
  assert.strictEqual(got.dellL, 'down,mac,0,892 right,dellR,-1080,0')
  assert.strictEqual(got.dellR, 'down,mac,892,1710 left,dellL,-1080,0')
  assert.deepStrictEqual([got.one, got.corner, got.sliver], [0, 0, 0])
  return h
})

test('entry slides along the shared edge', async () => {
  const h = await open({on: 'dellL', x: 1500})
  const got = await h.run(() => {
    const ns = neighbors(disp.list, curDisplay()), right = ns.find(n => n.side === 'right'), down = ns.find(n => n.side === 'down')
    const up = neighbors(disp.list, disp.list[0]).find(n => n.to.id === 'dellL')
    return {right: entry(right, 892, -1080 + 1078 - 33), up: entry(up, 1000, 0), down: entry(down, -500, 0)}
  })
  assert.deepStrictEqual(got.right, {x: 0, y: 1078}) // standing on one Dell's floor: the other's floor, at its edge
  assert.deepStrictEqual(got.up, {x: 838 + 1028, y: 1113}) // past the end of the shared stretch: pulled back along it, still coming up from below
  assert.deepStrictEqual(got.down, {x: 54, y: 33}) // dropping in from the top of the laptop, at its left end
  return h
})

test('teleport step lands him on the other display', async () => {
  const h = await open({on: 'mac', x: 800})
  await h.run(() => trip(performance.now(), [{go: 'display', id: 'dellR', x: 500, y: 300}]))
  await h.tick(3000)
  const w = await h.where()
  assert.strictEqual(w.on, 'dellR'); assert(w.standing, 'not standing'); near(w.x, 500)
  return h
})

test('a switch keeps his spot on the desktop', async () => {
  const h = await open({on: 'dellL', x: 1900})
  await h.run(() => trip(performance.now(), [{go: 'hold', T: 5000}])) // mid-trip, where nothing keeps him on screen
  const before = await h.where()
  await h.show('dellR')
  const w = await h.where()
  assert.strictEqual(w.on, 'dellR'); near(w.x, before.x - 1028 - 892, .01); near(w.y, before.y, .01) // dellL's left minus dellR's
  return h
})

test('gone display ends the trip', async () => {
  const h = await open({on: 'mac', x: 400})
  await h.run(() => trip(performance.now(), [{go: 'display', id: 'dellL'}]))
  await h.show('mac', JAY.filter(d => d.id !== 'dellL'))
  await h.tick(1500)
  let w = await h.where()
  assert.strictEqual(w.on, 'mac'); assert.notStrictEqual(w.mode, 'script')
  await h.tick(1500)
  w = await h.where()
  assert(w.standing, 'not standing')
  return h
})

test('mockup has no displays', async () => {
  const h = await open({app: false})
  const got = await h.run(() => ({n: neighbors([], undefined).length, asked: askDisplay('x'), cur: curDisplay()}))
  assert.deepStrictEqual(got, {n: 0, asked: false})
  await h.run(() => { for (let i = 0; i < 150; i++) __tick(33) })
  return h
})

// ---- Task 2: he wanders to other displays on his own ----
const crossing = (h, to) => h.run(to => trip(performance.now(), crossSteps(neighbors(disp.list, curDisplay()).find(n => n.to.id === to))), to)
const crosses = (name, from, x, to) => test(name, async () => {
  const h = await open({on: from, x})
  await crossing(h, to)
  await h.tick(30000)
  const w = await h.where()
  assert.strictEqual(w.on, to); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  assert.deepStrictEqual(h.sent, [to])
  return h
})
crosses('walks right from the left Dell onto the right Dell', 'dellL', 1500, 'dellR')
crosses('walks left from the right Dell onto the left Dell', 'dellR', 400, 'dellL')
crosses('leaps up from the laptop to the left Dell', 'mac', 400, 'dellL')
crosses('leaps up from the laptop to the right Dell', 'mac', 1300, 'dellR')
crosses('drops from the right Dell to the laptop', 'dellR', 300, 'mac')
crosses('drops from the left Dell to the laptop', 'dellL', 1500, 'mac')

const TEN_MINUTES = 10 * 60 * 1000
test('wanders across on Erratic', async () => {
  const h = await open({on: 'mac'})
  await h.run(() => usePreset('erratic'))
  await h.tick(TEN_MINUTES)
  assert(h.sent.length >= 1, 'never crossed')
  await h.run(still => { preset = {...PRESETS.erratic, chance: still} }, STILL)
  await h.tick(45000) // long enough for a crossing he'd set off on to finish: a walk the width of a display at 70 a second
  const w = await h.where(), doing = await h.run(() => ({trick: ai.trick?.name, step: ai.steps?.[ai.step], pending: disp.pending, next: disp.next}))
  assert.strictEqual(w.on, h.on); assert(w.standing, `not standing: ${JSON.stringify({...w, ...doing})}`)
  return h
})
test('stays put with Stay on one display', async () => {
  const h = await open({on: 'mac'})
  await h.run(() => { hangabout.settings({sound: false, reduced: false, scale: 1, preset: 'erratic', fan: false, found: [], stay: true}) })
  await h.tick(TEN_MINUTES)
  assert.deepStrictEqual(h.sent, [])
  return h
})
test('one display never crosses', async () => {
  const h = await open({on: 'mac', layout: [JAY[0]]})
  await h.run(() => usePreset('erratic'))
  await h.tick(TEN_MINUTES)
  assert.deepStrictEqual(h.sent, [])
  return h
})

// ---- Task 3: carry and throw him across ----
/** Grabs him and moves the mouse by (dx, dy) in `steps` moves, `ms` apart, then lets go. */
async function drag(h, dx, dy, steps, ms){
  const m = await h.middle()
  await h.pointer('down', m.x, m.y)
  for (let i = 1; i <= steps; i++) { await h.wait(ms); await h.pointer('move', m.x + dx * i / steps, m.y + dy * i / steps) }
  await h.pointer('up', m.x + dx, m.y + dy)
}
const answer = async h => { for (const id of await h.run(() => __asks.splice(0))) { h.sent.push(id); await h.show(id) } } // asks made outside tick

test('carried from the left Dell to the right Dell', async () => {
  const h = await open({on: 'dellL', x: 1500})
  const m = await h.middle()
  await h.pointer('down', m.x, m.y)
  for (let gx = m.x; gx <= -1028 + 1920 + 300; gx += 20) { await h.wait(33); await h.pointer('move', gx, m.y - 200); await answer(h) }
  assert.deepStrictEqual(h.sent, ['dellR'])
  const held = await h.where()
  near(held.x, -1028 + 1920 + 300 - 892, 21) // still under the mouse, on the right Dell
  await h.pointer('up', -1028 + 1920 + 300, m.y - 200)
  await h.tick(3000)
  const w = await h.where()
  assert.strictEqual(w.on, 'dellR'); assert(w.standing, 'not standing')
  return h
})
const thrown = (name, from, x, dx, dy, to) => test(name, async () => {
  const h = await open({on: from, x})
  const m = await h.middle()
  await h.pointer('down', m.x, m.y)
  for (let i = 1; i <= 6; i++) { await h.wait(16); await h.pointer('move', m.x + dx * i, m.y + dy * i) }
  await h.pointer('up', m.x + dx * 6, m.y + dy * 6)
  await h.tick(4000)
  const w = await h.where()
  assert.strictEqual(w.on, to); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  assert.deepStrictEqual(h.sent, to === from ? [] : [to])
  return h
})
thrown('thrown right from the left Dell', 'dellL', 1500, 60, 0, 'dellR')
thrown('thrown left from the right Dell', 'dellR', 400, -60, 0, 'dellL')
thrown('thrown up from the laptop', 'mac', 400, 0, -60, 'dellL')
thrown('thrown at a wall stays', 'dellL', 600, -60, 0, 'dellL')
test('a moment doesn\'t cut a throw short', async () => {
  const h = await open({on: 'dellL', x: 1500})
  const m = await h.middle()
  await h.pointer('down', m.x, m.y)
  for (let i = 1; i <= 6; i++) { await h.wait(16); await h.pointer('move', m.x + 60 * i, m.y) }
  await h.pointer('up', m.x + 360, m.y)
  await h.run(() => fire('longCommand')) // Claude finished a long command mid-flight: he'd stretch (it always answers)
  await h.tick(4000)
  const w = await h.where()
  assert.strictEqual(w.on, 'dellR'); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  return h
})
test('thrown down from the left Dell', async () => {
  const h = await open({on: 'dellL', x: 1300})
  const m = await h.middle()
  await h.pointer('down', m.x, m.y)
  for (let i = 1; i <= 20; i++) { await h.wait(33); await h.pointer('move', m.x, m.y - 30 * i) } // lifted slowly...
  for (let i = 1; i <= 6; i++) { await h.wait(16); await h.pointer('move', m.x, m.y - 600 + 60 * i) } // ...and flung down
  await h.pointer('up', m.x, m.y - 240)
  await h.tick(4000)
  const w = await h.where()
  assert.strictEqual(w.on, 'mac'); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  assert.deepStrictEqual(h.sent, ['mac'])
  return h
})
test('gentle drop stays', async () => {
  const h = await open({on: 'dellL', x: 1500})
  await drag(h, 300, -100, 30, 33)
  await h.tick(3000)
  const w = await h.where()
  assert.strictEqual(w.on, 'dellL'); assert(w.standing, 'not standing'); assert.deepStrictEqual(h.sent, [])
  return h
})

// ---- Task 4: he comes to you when Claude needs you ----
const SETTINGS = {sound: false, reduced: false, scale: 1, preset: 'normal', fan: false, found: []}
/** Claude's state as the app sends it from state.json: one session, in this mood ('waiting' is what the hook writes for needs). */
const claude = (h, mood) => h.run(mood => hangabout.claude({sessions: {t: {mood, ts: Date.now() / 1000}}}), mood)
const comes = (name, mood) => test(name, async () => {
  const h = await open({on: 'mac', x: 800})
  await h.run(() => hangabout.mouse('dellR', 800, 500))
  await claude(h, mood)
  await h.tick(5000)
  const w = await h.where()
  assert.strictEqual(w.on, 'dellR'); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  assert(Math.abs(w.x - 800) > 60, `right under the pointer: ${w.x}`)
  await h.tick(3000)
  const later = await h.where()
  assert.strictEqual(later.on, 'dellR'); near(later.x, w.x, 1) // and waits there
  return h
})
comes('comes to the pointer\'s display', 'waiting')
comes('blocked counts too', 'blocked')
test('follows once more, not twice', async () => {
  const h = await open({on: 'mac', x: 800})
  await h.run(() => { hangabout.mouse('dellR', 800, 500) }); await claude(h, 'waiting')
  await h.tick(5000)
  await h.run(() => hangabout.mouse('dellL', 400, 500))
  await h.tick(5000)
  assert.strictEqual((await h.where()).on, 'dellL')
  await h.run(() => hangabout.mouse('mac', 400, 500))
  await h.tick(5000)
  assert.strictEqual((await h.where()).on, 'dellL')
  assert.deepStrictEqual(h.sent, ['dellR', 'dellL'])
  return h
})
test('waits where he is when you\'re on his display', async () => {
  const h = await open({on: 'mac', x: 800})
  await h.run(() => { hangabout.mouse('mac', 300, 500) }); await claude(h, 'waiting')
  await h.tick(5000)
  assert.deepStrictEqual(h.sent, [])
  return h
})
test('stays with Stay on one display', async () => {
  const h = await open({on: 'mac', x: 800})
  await h.run(s => { hangabout.settings({...s, stay: true}); hangabout.mouse('dellR', 800, 500) }, SETTINGS); await claude(h, 'waiting')
  await h.tick(5000)
  assert.deepStrictEqual(h.sent, []); assert.strictEqual((await h.where()).on, 'mac')
  return h
})
test('reduced motion goes straight there', async () => {
  const h = await open({on: 'mac', x: 800})
  await h.run(s => { hangabout.settings({...s, reduced: true}); hangabout.mouse('dellR', 800, 500) }, SETTINGS); await claude(h, 'waiting')
  await h.tick(500)
  const w = await h.where()
  assert.strictEqual(w.on, 'dellR'); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  return h
})

// ---- Task 5: Sneak through and the Portal secret come out on another display ----
const sneaks = (name, x, to) => test(name, async () => {
  const h = await open({on: 'dellL', x})
  await h.run(() => perform('sneak'))
  await h.tick(20000)
  const w = await h.where()
  assert.strictEqual(w.on, to); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  assert.deepStrictEqual(h.sent, to === 'dellL' ? [] : [to])
  return h
})
sneaks('sneak comes out on the neighbor', 1500, 'dellR')
sneaks('sneak at a wall wraps as before', 300, 'dellL')
test('portal can open on another display', async () => {
  const ends = []
  for (let seed = 1; seed <= 8; seed++) {
    const h = await open({on: 'dellL', x: 900, seed})
    await h.run((s, still) => { hangabout.settings({...s, fan: true, found: ['portal']}); preset = {...PRESETS.normal, chance: still}; perform('portal') }, SETTINGS, STILL)
    await h.tick(9000)
    const w = await h.where(), left = await h.run(() => document.querySelectorAll('.portal').length)
    assert(w.standing, `seed ${seed}: not standing: ${JSON.stringify(w)}`); assert.strictEqual(left, 0, `seed ${seed}: portals left`)
    if (h.problems.length) throw new Error(h.problems.join('\n  '))
    ends.push(w.on)
    await h.page.close()
  }
  assert(ends.includes('dellL') && ends.some(on => on !== 'dellL'), `ended on ${ends}`)
  return {problems: [], page: {close(){}}}
})

// ---- Final review fixes ----
test('needed mid-switch, he comes back to you', async () => {
  const h = await open({on: 'dellR', x: 300})
  await h.run(() => hangabout.mouse('dellR', 900, 500))
  await crossing(h, 'mac')
  for (let i = 0; i < 400 && !(await h.run(() => __asks.length)); i++) await h.wait(33) // until he asks for the laptop
  await claude(h, 'waiting') // Claude needs you before the app has moved his layer: his trip ends where he is
  await h.wait(33)
  await answer(h) // and then his layer lands on the laptop anyway
  await h.tick(5000)
  const w = await h.where()
  assert.strictEqual(w.on, 'dellR'); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  return h
})
test('a switch goes ahead when the window comes up a point off size', async () => {
  const h = await open({on: 'mac', x: 400})
  await h.page.setViewport({width: 1919, height: 1079})
  await h.run(list => hangabout.displays(list, 'dellL'), JAY)
  assert.strictEqual(await h.run(() => disp.on), 'dellL')
  return h
})
test('a switch goes ahead when the window never takes its new size', async () => {
  const h = await open({on: 'mac', x: 400})
  await h.run(list => hangabout.displays(list, 'dellL'), JAY) // the page stays the laptop's size
  for (let i = 0; i < 20; i++) await h.wait(33)
  assert.strictEqual(await h.run(() => disp.on), 'dellL')
  return h
})
test('windows sent before the window resizes stay', async () => {
  const h = await open({on: 'mac', x: 400})
  await h.run(list => { hangabout.displays(list, 'dellL'); hangabout.windows([{id: 1, y: 400, x0: 100, x1: 900, wx: 100, w: 800, h: 500}]) }, JAY)
  await h.page.setViewport({width: 1920, height: 1080})
  await h.wait(33)
  assert.deepStrictEqual(await h.run(() => [disp.on, nativeTops.length]), ['dellL', 1])
  return h
})
test('thrown down where nothing is below stays', async () => {
  const h = await open({on: 'dellL', x: 400}) // the left Dell's left part: the laptop is under its other part
  const m = await h.middle()
  await h.pointer('down', m.x, m.y)
  for (let i = 1; i <= 20; i++) { await h.wait(33); await h.pointer('move', m.x, m.y - 30 * i) }
  for (let i = 1; i <= 6; i++) { await h.wait(16); await h.pointer('move', m.x, m.y - 600 + 60 * i) }
  await h.pointer('up', m.x, m.y - 240)
  await h.tick(3000)
  const w = await h.where()
  assert.deepStrictEqual(h.sent, []); assert.strictEqual(w.on, 'dellL'); assert(w.standing, 'not standing')
  return h
})
test('a wild flick up stays in sight', async () => {
  const h = await open({on: 'mac', x: 400})
  const m = await h.middle()
  await h.pointer('down', m.x, m.y)
  for (let i = 1; i <= 4; i++) { await h.wait(16); await h.pointer('move', m.x, m.y - 190 * i) } // about 12 points a ms
  await h.pointer('up', m.x, m.y - 760)
  await h.tick(2500)
  const w = await h.where()
  assert.strictEqual(w.on, 'dellL'); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  return h
})
test('a lost mouse-up after a carry still lets him go', async () => {
  const h = await open({on: 'dellL', x: 1500})
  const m = await h.middle()
  await h.pointer('down', m.x, m.y)
  for (let gx = m.x; gx <= -1028 + 1920 + 300; gx += 20) { await h.wait(33); await h.pointer('move', gx, m.y - 200); await answer(h) }
  await h.run(() => hangabout.hover(false)) // the button's up and the pointer's off him, but the page never got the mouse-up
  await h.tick(3000)
  const w = await h.where()
  assert.strictEqual(w.on, 'dellR'); assert(w.standing, `not standing: ${JSON.stringify(w)}`)
  return h
})

;(async () => {
  browser = await puppeteer.launch({headless: 'shell'})
  const only = process.argv[2] || '', failed = []
  for (const t of tests.filter(t => t.name.includes(only))) {
    let h
    try {
      h = await t.fn()
      if (h.problems.length) throw new Error(h.problems.join('\n  '))
      console.log(`ok    ${t.name}`)
    } catch (e) { failed.push(t.name); console.log(`FAIL  ${t.name}: ${e.message}`) }
    await h?.page.close()
  }
  await browser.close()
  console.log(failed.length ? `${failed.length} failed` : 'all passed')
  process.exit(failed.length ? 1 : 0)
})()
