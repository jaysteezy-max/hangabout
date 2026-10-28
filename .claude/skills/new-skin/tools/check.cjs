// Plays every trick (Fan pack on) and every Claude state on a skin in headless Chrome, on a fake clock, and prints
// {durations, problems}: node check.cjs <skin key> <outdir>   (ONLY=dance,wave picks tricks; DSF=2 shoots at 2x;
// WEB=<another checkout>/web/pet.html runs that copy of the page, e.g. main's, to compare)
// Frames around the pet land in outdir; python3 framesheet.py <outdir> <out.png> makes contact sheets of them.
const fs = require('fs'), path = require('path'), os = require('os')
const npx = path.join(os.homedir(), '.npm/_npx') // puppeteer from the npx cache, so the repo needs no package.json
const found = fs.existsSync(npx) && fs.readdirSync(npx).map(d => path.join(npx, d, 'node_modules/puppeteer')).find(d => fs.existsSync(d))
if (!found) { console.error('No puppeteer in ~/.npm/_npx: run `npx -y puppeteer browsers install chrome-headless-shell` once.'); process.exit(1) }
const puppeteer = require(found)
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
  const browser = await puppeteer.launch({args: ['--hide-scrollbars']})
  const page = await browser.newPage()
  await page.setViewport({width: 1100, height: 1100, deviceScaleFactor: +(process.env.DSF || 1)})
  await page.evaluateOnNewDocument(fakeClock, 7)
  let doing = 'load'
  page.on('console', m => { if (['warn', 'error', 'assert'].includes(m.type())) problems.push(`[${doing}] ${m.type()}: ${m.text()}`) })
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
      if (T % 400 === 0) { const f = path.join(out, `${name}-t${String(T).padStart(5, '0')}.png`); await shot(f); shots.push(f) }
      await tick(FRAME); T += FRAME
    }
    report[name] = T
    await tick(600)
  }
  for (const id of process.env.ONLY ? [] : await run('Object.keys(MOODS)')) { doing = 'state ' + id; await run(`setState(${JSON.stringify(id)})`); await frames('state-' + id, 4000, 3) }
  doing = 'end'
  await run(`setState('idle')`); await tick(1000)
  console.log(JSON.stringify({durations: report, problems}, null, 1))
  await browser.close()
})()
