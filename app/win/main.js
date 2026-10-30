// Hangabout on Windows: a transparent layer over your whole main screen that the pet lives on. A port of app/Hangabout.swift.
// Clicks pass straight through it everywhere except the pet himself and his open bubble.
// He shows what Claude Code is doing from state.json in the install folder, which hangabout-hook.exe keeps from Claude Code's hooks.
const {app, BrowserWindow, Menu, ipcMain, screen, powerMonitor, shell} = require('electron')
const {spawn} = require('child_process')
const readline = require('readline')
const fs = require('fs')
const path = require('path')

const dir = path.dirname(path.dirname(process.execPath)) // the install folder: Hangabout\Hangabout.exe, the hook and their state live together
const statePath = path.join(dir, 'state.json'), pidPath = path.join(dir, 'hangabout.pid'), prefsPath = path.join(dir, 'prefs.json')
const presets = [['calm', 'Calm'], ['normal', 'Normal'], ['erratic', 'Erratic']]
app.setPath('userData', path.join(dir, 'electron')) // Electron's own caches stay in the install folder too
if (!app.requestSingleInstanceLock()) app.exit(0)

let prefs = {}
try { prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf8')) } catch {}
const savePrefs = () => fs.writeFileSync(prefsPath, JSON.stringify(prefs))
const scale = () => prefs.scale ?? 1
const preset = () => presets.some(([key]) => key === prefs.preset) ? prefs.preset : 'normal'
/** A skin's name: letters, digits and dashes only, since it goes into the page's JavaScript. The page falls back to Cappy for one it doesn't have. */
const skin = () => String(prefs.skin ?? 'cappy').replace(/[^\p{L}\p{N}-]/gu, '')

let win
/** Where the pet and his open bubble are, in page coordinates (top-left origin). */
let hitRects = []
let holding = false, pressed = false, lastCursor = null, cursorWasNear = false, lastTops = '', windowList = [], lastState = 0
/** Each busy session's transcript as of the last time hangabout-hook looked at it. */
const checked = {}
/** Whether you've left your PC alone for five minutes or more (no mouse or keys). */
let away = false
/** The tricks and skins the page has, for the menu: [name, label, fan pack]. The page sends them once it loads. */
let tricks = [], skins = [['cappy', 'Cappy', false]]

const run = js => win.webContents.executeJavaScript(js).catch(() => {}) // before the page has loaded there's no hangabout to call yet

app.whenReady().then(() => {
  fs.writeFileSync(pidPath, String(process.pid)) // tells hangabout-hook he's already running
  win = new BrowserWindow({
    transparent: true, frame: false, thickFrame: false, resizable: false, movable: false, hasShadow: false,
    skipTaskbar: true, focusable: false, show: false, // never takes focus from the app you're in, like the Mac's non-activating panel
    webPreferences: {preload: path.join(__dirname, 'preload.js'), autoplayPolicy: 'no-user-gesture-required', backgroundThrottling: false},
  })
  win.setAlwaysOnTop(true, 'screen-saver') // above every app window
  win.setIgnoreMouseEvents(true)
  fitScreen()
  win.loadFile(path.join(__dirname, 'web', 'pet.html'))
  win.showInactive()

  win.webContents.on('did-finish-load', () => { fitScreen(); sendSettings(); sendWindows(true); sendState(true) })
  win.webContents.on('render-process-gone', () => win.webContents.reload())
  for (const change of ['display-metrics-changed', 'display-added', 'display-removed']) screen.on(change, fitScreen)
  watchWindows()
  setInterval(trackPointer, 1000 / 30)
  setInterval(sendState, 250)
  setInterval(() => { checkTranscripts(); checkAway() }, 1000)
})

app.on('will-quit', () => { try { fs.unlinkSync(pidPath) } catch {} })

/** He lives on the main display, over everything on it. */
// shortcut: one display only; spanning several needs a window per screen.
function fitScreen(){
  const {bounds: b, workArea: w} = screen.getPrimaryDisplay()
  win.setBounds(b)
  // shortcut: knows a taskbar at the top or bottom; one on the left or right he walks behind.
  run(`hangabout.screen(${w.y - b.y},${b.y + b.height - w.y - w.height})`)
}

/** Takes the mouse only while it's over the pet or his open bubble; everywhere else clicks go straight through. */
function trackPointer(){
  const mouse = screen.getCursorScreenPoint(), frame = win.getBounds(), x = mouse.x - frame.x, y = mouse.y - frame.y
  // His eyes only follow a cursor that's near him, so a far one isn't worth a message (one last one lets him look away).
  const [hx, hy, hw, hh] = hitRects[0] ?? [], near = hitRects.length ? Math.hypot(x - hx - hw / 2, y - hy - hh / 2) < 500 : true
  if ((x !== lastCursor?.x || y !== lastCursor?.y) && (near || cursorWasNear)) {
    lastCursor = {x, y}
    run(`hangabout.cursor(${x},${y})`)
  }
  cursorWasNear = near
  const over = hitRects.some(([rx, ry, rw, rh]) => x >= rx && x < rx + rw && y >= ry && y < ry + rh)
  const take = over || (holding && pressed) // keeps him while you drag him around
  if (take === holding) return
  holding = take
  win.setIgnoreMouseEvents(!take)
  run(`hangabout.hover(${take})`)
}

/** hangabout-windows.exe watches your windows and the mouse button, which Electron can't see outside its own window. */
function watchWindows(){
  const helper = spawn(path.join(dir, 'hangabout-windows.exe'), [String(process.pid)], {stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true})
  helper.on('error', () => {}) // no helper: he still lives on the taskbar, just not on your windows
  app.on('will-quit', () => helper.kill())
  readline.createInterface({input: helper.stdout}).on('line', line => {
    let said
    try { said = JSON.parse(line) } catch { return }
    if (said.windows) { windowList = said.windows; sendWindows() }
    else if (said.down) { pressed = true; if (!holding) clickedElsewhere(said.down) } // a press on him isn't a click elsewhere
    else if (said.up) pressed = false
  })
}

function clickedElsewhere([px, py]){
  const s = screen.getPrimaryDisplay().scaleFactor, frame = win.getBounds()
  run(`hangabout.click(${Math.round(px / s - frame.x)},${Math.round(py / s - frame.y)})`)
}

/** The top edges of your windows that aren't hidden behind a window in front, for him to walk on, with each window's size (for webs to stick to). */
function sendWindows(force = false){
  const {width, height} = win.getBounds(), s = screen.getPrimaryDisplay().scaleFactor
  const inFront = [], tops = []
  for (const [id, ...pixels] of windowList) { // front to back
    // shortcut: pixels to points by the main display's scale; windows on other displays are off his screen anyway.
    const [x, y, w, h] = pixels.map(v => v / s)
    if (w >= 160 && h >= 60 && y > 0 && y < height) {
      let spans = [[Math.max(0, x), Math.min(width, x + w)]]
      for (const c of inFront) if (c.y <= y && c.y + c.h > y) {
        spans = spans.flatMap(([a, b]) => [[a, Math.min(b, c.x)], [Math.max(a, c.x + c.w), b]].filter(([p, q]) => q > p))
      }
      for (const [a, b] of spans) if (b - a >= 100) tops.push({id, y: Math.round(y), x0: Math.round(a), x1: Math.round(b), wx: Math.round(x), w: Math.round(w), h: Math.round(h)})
    }
    inFront.push({x, y, w, h})
  }
  const json = JSON.stringify(tops)
  if (!force && json === lastTops) return
  lastTops = json
  run(`hangabout.windows(${json})`)
}

function sendState(force = false){
  let stamp, state
  try { stamp = fs.statSync(statePath).mtimeMs } catch { return }
  if (!force && stamp === lastState) return
  try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')) } catch { return } // caught mid-write: the next look gets it
  lastState = stamp
  run(`hangabout.claude(${JSON.stringify(state)})`) // parsed and written back, so only data reaches the page
}

/** Back at your PC after five minutes or more away: he says hello. The page only hears about the mouse near him, so the app watches. */
function checkAway(){
  const idle = powerMonitor.getSystemIdleTime()
  if (idle >= 300 && !away) { away = true; run('hangabout.left()') }
  else if (away && idle < 2) { away = false; run('hangabout.back()') }
}

/** Claude Code sends no hook when you interrupt it, only writes it into the transcript. So when a busy session's
 *  transcript changes after its last hook, hangabout-hook gets a look (it stops him if that change was an interrupt). */
function checkTranscripts(){
  let sessions
  try { sessions = JSON.parse(fs.readFileSync(statePath, 'utf8')).sessions ?? {} } catch { return }
  for (const [id, s] of Object.entries(sessions)) {
    if (!['thinking', 'editing', 'running', 'waiting'].includes(s.mood) || !s.transcript) continue
    let changed
    try { changed = fs.statSync(s.transcript).mtimeMs } catch { continue }
    if (changed / 1000 <= (s.ts ?? 0) || changed === checked[id]) continue
    checked[id] = changed
    const hook = spawn(path.join(dir, 'hangabout-hook.exe'), [], {stdio: ['pipe', 'ignore', 'ignore'], windowsHide: true})
    hook.on('error', () => {})
    hook.stdin.on('error', () => {})
    hook.stdin.end(JSON.stringify({hook_event_name: 'TranscriptChanged', session_id: id}))
  }
}

function sendSettings(){
  run(`hangabout.settings(${JSON.stringify({sound: !!prefs.sound, reduced: !!prefs.reduced, scale: scale(), preset: preset(), fan: !!prefs.fan, found: prefs.found ?? []})})`)
}

function setPref(key, value){
  prefs[key] = value
  savePrefs()
  sendSettings()
}

function menu(){
  const fan = !!prefs.fan, found = prefs.found ?? [], secrets = tricks.filter(t => t[2])
  const trickItems = []
  for (const [name, label, fanMade] of tricks) {
    if (fanMade && !fan) continue
    if (fanMade && !trickItems.some(i => i.type === 'separator')) { // fan pack below the core ones
      trickItems.push({type: 'separator'}, {label: `Secrets: ${secrets.filter(t => found.includes(t[0])).length} of ${secrets.length} found`, enabled: false})
    }
    if (fanMade && !found.includes(name)) { trickItems.push({label: '???', enabled: false}); continue } // still a mystery: don't give the name away
    trickItems.push({label, click: () => run(`hangabout.perform(${JSON.stringify(name)})`)})
  }
  const toggle = (key, label) => ({label, type: 'checkbox', checked: !!prefs[key], click: () => setPref(key, !prefs[key])})
  // Where the Mac has a Size slider. Its stops are sixths: at those, each of his art pixels covers whole screen pixels, so he stays crisp.
  const sizes = Array.from({length: 13}, (_, i) => 0.5 + i / 6)
  return Menu.buildFromTemplate([
    {label: 'Tricks', submenu: trickItems},
    {label: 'Behavior', submenu: presets.map(([key, label]) => ({label, type: 'radio', checked: key === preset(), click: () => setPref('preset', key)}))},
    {label: 'Skin', submenu: skins.filter(([key, , fanMade]) => !fanMade || fan || key === skin())
      .map(([key, label]) => ({label, type: 'radio', checked: key === skin(), click: () => chooseSkin(key)}))},
    {type: 'separator'},
    {label: `Size  ${Math.round(scale() * 100)}%`, submenu: sizes.map(v => ({label: `${Math.round(v * 100)}%`, type: 'radio', checked: Math.abs(v - scale()) < .01, click: () => setPref('scale', v)}))},
    {type: 'separator'},
    toggle('sound', 'Chirp when Claude needs you'), toggle('reduced', 'Reduce motion'), toggle('fan', 'Fan pack (fan-made tricks)'),
    {label: 'Enter a code…', click: enterCode},
    {type: 'separator'},
    {label: 'Hangabout: unofficial, not affiliated with Anthropic', enabled: false},
    {label: 'Quit Hangabout', click: () => app.quit()},
  ])
}

function chooseSkin(key){
  if (key === skin()) return
  prefs.skin = key
  savePrefs()
  win.webContents.reload() // the preload asks for the skin again; did-finish-load sends the screen, settings, windows and Claude's state again
}

/** Records a code from the keys you press and hands it to the page, which knows if it's the one. Arrows show as ↑ ↓ ← →, letters as A-Z. */
function enterCode(){
  const page = `<title>Enter a code</title><body style="font:14px system-ui;text-align:center;margin:18px">
    <p>Press arrow keys and letters. Backspace steps back.<br>Enter to try it, Esc to cancel.</p><p id=t style="font-size:20px">Press the keys</p>
    <script>
    const typed = [], arrows = {ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→'}
    onkeydown = e => {
      if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return // chords and held keys aren't part of a code
      if (arrows[e.key]) typed.push(arrows[e.key])
      else if (e.key === 'Backspace') typed.pop()
      else if (e.key === 'Enter') return document.title = 'code:' + typed.join('') // the app is watching the title
      else if (e.key === 'Escape') return close()
      else if (/^[a-z]$/i.test(e.key)) typed.push(e.key.toUpperCase())
      else return
      t.textContent = typed.length ? typed.join(' ') : 'Press the keys'
      e.preventDefault()
    }
    </script>`
  const dialog = new BrowserWindow({width: 380, height: 190, resizable: false, minimizable: false, maximizable: false, alwaysOnTop: true, autoHideMenuBar: true})
  dialog.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page))
  dialog.on('page-title-updated', (event, title) => {
    if (!title.startsWith('code:')) return
    dialog.close()
    win.webContents.executeJavaScript(`hangabout.code(${JSON.stringify(title.slice(5))})`)
      .then(right => { if (right === false) shell.beep() }) // the page does the celebrating; a wrong code just gets a beep
  })
}

ipcMain.on('skin', event => { event.returnValue = skin() })
ipcMain.on('press', (_, down) => { pressed = down })
ipcMain.on('menu', () => menu().popup({window: win}))
ipcMain.on('hangabout', (_, body) => {
  const list = items => (Array.isArray(items) ? items : []).filter(t => typeof t?.name === 'string').map(t => [t.name, t.label ?? t.name, !!t.fan])
  if (Array.isArray(body?.tricks)) {
    tricks = list(body.tricks)
    const sent = list(body.skins)
    if (sent.length) skins = sent
  } else if (Array.isArray(body?.found)) { // a secret turned up, or the cheat code unlocked them all
    prefs.found = [...new Set([...(prefs.found ?? []), ...body.found.filter(name => typeof name === 'string')])]
    if (body.fan === true) prefs.fan = true
    savePrefs()
    if (body.fan === true) sendSettings()
  } else if (Array.isArray(body)) {
    hitRects = body.filter(r => Array.isArray(r) && r.length === 4)
  }
})
