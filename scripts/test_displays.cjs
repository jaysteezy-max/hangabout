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
