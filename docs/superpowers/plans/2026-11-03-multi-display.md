# He Roams Every Display: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The pet lives on every display: he wanders between them, can be carried and thrown across, comes to the
display you're on when Claude needs you, and a Stay on one display switch keeps him put.

**Architecture:** One see-through layer that the apps move to whichever display he's on. The apps send the page the
display list in desktop coordinates. The page decides every crossing and asks the app to move the layer with
`{display: id}`. Crossings are trips. A new trip step, `{go: 'display'}`, switches the layer, and motion is integrated
from where he is each frame, so it carries on unbroken across a switch.

**Tech Stack:** `web/pet.html` (plain JS, no build); Swift/AppKit/WebKit (`app/Hangabout.swift`); Electron
(`app/win/main.js`). The page is tested in headless Chrome with puppeteer from the npx cache, as
`.claude/skills/new-skin/tools/check.cjs` does.

**Spec:** `docs/superpowers/specs/2026-11-03-multi-display-design.md`

## Global Constraints

- No new dependencies. The Mac app stays one Swift file; the Windows app stays Electron plus its helper.
- He never takes focus; clicks go straight through everywhere except on him and his bubble.
- The browser mockup (`web/pet.html` on its own) keeps working with its one pretend screen.
- One new menu switch, **Stay on one display**, off by default, saved like the existing switches (Mac `UserDefaults`
  key `stay`; Windows `prefs.json` key `stay`). Nothing else new in the menu.
- With one display, nothing changes from today.
- Edges that touch no other display stay walls; every edge trick there works as today.
- Coordinates between the apps and the page are points (Mac) or DIPs (Windows), with a top-left origin at the main
  display's top-left corner and y going down.

## Review Focus

1. **The page's size just after a switch.** WebKit or Electron may still report the old display's size when
   `hangabout.displays()` runs, which would place him against the wrong edges. Task 6 checks it on hardware; the
   switch is applied only once `desk.clientWidth/Height` match the new display.
2. **A display unplugged mid-crossing or mid-drag.** A pending switch to a display that's gone must not leave him
   frozen. Task 1 test `gone display ends the trip`.
3. **Displays that touch only at a corner, or overlap less than 40 points.** These count as not touching, so he never
   walks into an edge expecting a way through. Task 1 self-check.
4. **Dragging when the layer moves under the pointer.** The drag must survive the window jumping displays (AppKit
   and Chromium mouse capture). Task 3 tests the page side; Task 8 tests the real mouse.
5. **Mixed scaling on Windows** (a 2x laptop beside 1x monitors): window ledges and the layer's size on each display.
   Task 7 converts per display; it can't be run here, so the PR says so.

---

### Task 1: Displays in the page, and the test harness

**Files:**
- Modify: `web/pet.html` (state near `scr` ~line 486, `nextStep`/`runStep` ~617-650, the `hangabout` object ~1180-1230)
- Create: `scripts/test_displays.cjs`

**Interfaces:**
- Produces (page globals, used by every later task):
  - `const disp = {list: [], on: null, pointer: null, pending: null}`. `list` holds
    `{id: string, x, y, w, h, top, bottom}`: the display's desktop rect, plus its menu bar or top taskbar height
    (`top`) and its Dock or bottom taskbar height (`bottom`). `pointer` is `{id, x, y}` (x, y in that display's
    coordinates). `pending` is `{id, x?, y?, at}`.
  - `neighbors(list, d) -> [{side: 'left'|'right'|'up'|'down', to, lo, hi}]`: pure. `lo..hi` is the shared stretch of
    the edge in desktop coordinates (y for left and right, x for up and down).
  - `curDisplay() -> display|undefined`
  - `entry(n, gx, gy) -> {x, y}`: his feet on `n.to`, in its coordinates, when his middle (feet x, feet y − 33·size)
    crosses `n`'s edge at desktop point (gx, gy). The along-edge coordinate is clamped into
    `[lo + 54·size, hi − 54·size]`, or the middle of the span if it's narrower. The feet are never lower than
    `n.to`'s floor (`h − bottom − 2`).
  - `askDisplay(id, x, y) -> boolean`: posts `{display: id}` and sets `disp.pending`. Returns false when not `NATIVE`.
  - Trip step `{go: 'display', id, x, y}`: moves him to display `id`, feet at (x, y) in its coordinates. Without
    x and y, he crosses to the neighbor `id` at `entry()` from where he is when the step starts. The step waits for
    the app; if nothing comes back in 1000 ms, the trip ends where he is.
  - `hangabout.displays(list, on)` (from the apps; **replaces `hangabout.screen(top, bottom)`**). It sets `scr.top`
    and `scr.bottom` from the display he's on. When `on` changes:
    - If the old display still exists, his spot shifts by `old.x − new.x, old.y − new.y`: `pet.x`, `pet.y`, and
      during a drag `pet.drag.sx/sy/x/y` and the trail.
    - It clears `nativeTops`.
    - It applies `pending.x/y` with `putFeet` when the pending id matches.
    - If the old display is gone, he's put on the new floor at a clamped x and falls.
  - `hangabout.mouse(id, x, y)` (from the apps): stores `disp.pointer`. Task 4 hooks in here.
  - `hangabout.across(side) -> {id, x, y, width}|null`: for tricks. It names the display across that side of his
    and where his feet come in on it for where he is now.
  - `hangabout.otherDisplays() -> [{id, w, h, top, bottom}]`: for tricks.
  - `hangabout.settings(s)` also reads `s.stay` into `pet.stay`.
- Produces (harness): `scripts/test_displays.cjs` with `test(name, async h => …)` and `h`:
  - `h.start(on, {x})` loads the page on a fake clock with a fake app on the layout `JAY`, sets the viewport to that
    display, and puts him on its floor at feet x.
  - `h.tick(ms)` advances 33 ms at a time and answers each `{display}` request. It resizes the viewport to the
    display, then calls `hangabout.displays(JAY, id)`.
  - `h.run(js)` evaluates in the page; `h.where()` returns `{on, x, y, mode, standing}` (x and y are his feet);
    `h.sent` holds the `{display}` requests.
  - It prints `ok`/`FAIL` per test plus any page errors or failed `console.assert`, and exits 1 on any failure.

```js
// Jay's desk, as macOS reports it, in desktop coordinates (main display's top-left at 0,0; y down)
const JAY = [
  {id: 'mac',   x: 0,     y: 0,     w: 1710, h: 1112, top: 38, bottom: 66},
  {id: 'dellL', x: -1028, y: -1080, w: 1920, h: 1080, top: 0,  bottom: 0},
  {id: 'dellR', x: 892,   y: -1080, w: 1920, h: 1080, top: 0,  bottom: 0},
]
```

`neighbors()` algorithm (the one choice the signature doesn't settle): edges touch when the gap between them is at
most 2 points, and the shared stretch must be at least 40 points.

```js
const TOUCH = 2, OVERLAP = 40
for (const o of list) if (o.id !== d.id) {
  const ys = [Math.max(d.y, o.y), Math.min(d.y + d.h, o.y + o.h)], xs = [Math.max(d.x, o.x), Math.min(d.x + d.w, o.x + o.w)]
  if (Math.abs(o.x - (d.x + d.w)) <= TOUCH && ys[1] - ys[0] >= OVERLAP) out.push({side: 'right', to: o, lo: ys[0], hi: ys[1]})
  // …and the same for left (o.x + o.w ≈ d.x), up (o.y + o.h ≈ d.y, xs), down (o.y ≈ d.y + d.h, xs)
}
```

- [ ] **Step 1: Write the self-checks and the failing harness tests**

In `pet.html`, next to `neighbors()`, add `console.assert` self-checks on `JAY`, like the PRESETS check does:
- `mac`: `up→dellL` with span `[0, 892]` and `up→dellR` with span `[892, 1710]`.
- `dellL`: `right→dellR` with span `[-1080, 0]`, and `down→mac` with span `[0, 892]`.
- One display: `[]`.
- Two displays meeting only at a corner: `[]`.

In `scripts/test_displays.cjs`:
- `teleport step lands him on the other display`: on `mac`, run
  `trip(performance.now(), [{go: 'display', id: 'dellR', x: 500, y: 300}])`, tick 3000.
  Expect `on === 'dellR'`, `standing`, and `|x − 500| < 2`.
- `a switch keeps his spot on the desktop`: on `dellL` at x 1900, call `hangabout.displays(JAY, 'dellR')`
  directly. Expect `x === -20` (1900 − 1028 − 892) and `y` unchanged.
- `gone display ends the trip`: on `mac`, start a `{go: 'display', id: 'dellR'}` trip, then call
  `hangabout.displays(JAY.filter(d => d.id !== 'dellR'), 'mac')`. Tick 1500: `on === 'mac'`, mode isn't `'script'`,
  and `standing` within 3000 ms.
- `mockup has no displays`: open `pet.html` without the fake app. `neighbors([], undefined)` gives `[]`, and
  `askDisplay('x')` is false.

- [ ] **Step 2: Run the tests and see them fail**

Run: `node scripts/test_displays.cjs`
Expected: FAIL (`disp is not defined` / `hangabout.displays is not a function`).

- [ ] **Step 3: Build the display model** in `web/pet.html` to the interfaces above. Delete `screen(top, bottom)`.
  Apply a switch only once `desk.clientWidth === new.w && desk.clientHeight === new.h`; until then, retry on each
  frame. If he's mid-trip, the pending `{go: 'display'}` step just waits.

- [ ] **Step 4: Run the tests and see them pass**

Run: `node scripts/test_displays.cjs` → all `ok`, no page errors.
Run: `node .claude/skills/new-skin/tools/check.cjs pusheen "$TMPDIR/hb-check"` → no problems (one display, unchanged).

- [ ] **Step 5: Commit** `web/pet.html scripts/test_displays.cjs` with "Teach the page about displays and add the
  display trip step".

### Task 2: He wanders to other displays on his own

**Files:**
- Modify: `web/pet.html` (`PRESETS` ~557, the chooser in `behave` ~741)
- Test: `scripts/test_displays.cjs`

**Interfaces:**
- Consumes: `disp`, `neighbors`, `curDisplay`, `entry`, the `display` step, `pet.stay`.
- Produces:
  - `fly(vx, vy, until) -> (t, dt) => boolean`: a `move` step function. Each frame it integrates velocity in
    points per second, with gravity 2600 pt/s² (the same as falling), from his current feet. It returns
    `until({vx, vy, t})`. Because it's incremental, a switch mid-flight doesn't break it.
  - `crossSteps(n) -> steps`: a crossing from the floor into `n.to`.
    - **Sideways:** walk at 70 to the edge (feet x = 0 or W, so his middle is on the edge), `{go: 'display', id}`,
      then walk 120·size in.
    - **Up:** walk to a random x inside the span, then a `fly` leap. Its launch speed carries him up to about 100
      points above the new display's floor. When his middle reaches y 0, `{go: 'display', id}`, `fly` on until he
      starts to come down, then `drop`.
    - **Down:** walk into the span, a hop with `fly` at vy −400 that ignores the floor, and when his middle passes H,
      `{go: 'display', id}`, then `drop` at his current vy.
  - `canWander() = NATIVE && !pet.stay`

New `PRESETS.chance.cross`, taken out of `trip` (each set still adds up to 1):

| preset | trip | cross |
| --- | --- | --- |
| calm | .045 | .005 |
| normal | .115 | .015 |
| erratic | .13 | .04 |

In `behave`, put a branch after the jump branch (which already takes every ledge case). When `canWander()` and he
has neighbors: set `ai.trick = null` and run `trip(now, crossSteps(pick(neighbors(...))))`. Otherwise jump as
today.

- [ ] **Step 1: Write the failing tests**
  - `walks right from the left Dell onto the right Dell`: on `dellL` at x 1500, run the `right` crossing, tick
    30000. Expect `on === 'dellR'` and `standing`.
  - `leaps up from the laptop to the left Dell` (x 400 → `dellL`) and `…to the right Dell` (x 1300 → `dellR`):
    `standing`.
  - `drops from the right Dell to the laptop`: on `dellR` at x 300, run the `down` crossing → `on === 'mac'`,
    `standing`.
  - `wanders across on Erratic`: `usePreset('erratic')`, tick 20 fake minutes. Expect at least one `{display}` sent,
    and every arrival ends `standing` within 5000 ms.
  - `stays put with Stay on one display`: `hangabout.settings({…, stay: true})`, Erratic, 20 minutes → `h.sent` is
    empty.
  - `one display never crosses`: layout `[JAY[0]]`, Erratic, 20 minutes → `h.sent` is empty.
- [ ] **Step 2: Run and see them fail** (`crossSteps is not defined`).
- [ ] **Step 3: Implement** `fly`, `crossSteps`, `canWander`, the `cross` chances and the chooser branch.
- [ ] **Step 4: Run** `node scripts/test_displays.cjs` → all `ok`.
- [ ] **Step 5: Commit** "He wanders between displays on his own".

### Task 3: Carry and throw him across

**Files:**
- Modify: `web/pet.html` (`grab`/`pull`/`drop` ~1122-1152)
- Test: `scripts/test_displays.cjs`

**Interfaces:**
- Consumes: `askDisplay`, `neighbors`, `fly`, the `display` step.
- Produces:
  - Trail entries become `[t, x, y]`, and `throwSpeed(trail, now) -> {vx, vy}|null` gives points per ms. It uses the
    same window as today: at least 50 ms and under 150 ms old. A throw is when the dominant axis is faster than
    2 pt/ms.
  - `flingSteps(n, vx, vy) -> steps`: he spins as he flies, rotating by `t·0.7` degrees.
    - **Sideways:** a straight line at at least 1500 pt/s until his middle crosses the edge, then
      `{go: 'display', id}`, then `fly` with gravity for 300 ms, then `drop`.
    - **Up or down:** launch speed of at least what reaches the edge. Then `{go: 'display', id}`, `fly` on (up: until
      he comes down above the floor), then `drop`.
- Rules in `pull()`: when `NATIVE` and the pointer's desktop point leaves his display for another one,
  `askDisplay(that.id)`. The page handles carrying no matter the Stay switch.
- Rules in `drop()`:
  - **Thrown toward a side, up or down that has a neighbor** (the nearest one along the edge) and not `isStill()`:
    run `flingSteps` with `ai.trick = null`.
  - **Thrown sideways at a wall:** as today, `pet.droppedAt = fire('thrown') ? null : pet.y`.
  - **Thrown up or down at a wall, or a gentle let-go:** a plain drop, as today.

- [ ] **Step 1: Write the failing tests**
  - `carried from the left Dell to the right Dell`: grab him and pull in 20-point steps to a page x of
    `1920 + 300`. Expect a `{display: 'dellR'}` request; after `pointer('up')` and 3000 ms, `on === 'dellR'` and
    `standing`.
  - `thrown right from the left Dell`: `pointer('down')`, then moves of 60 points every 16 ms for 100 ms toward the
    right, then `up`. Tick 4000 → `on === 'dellR'` and `standing`.
  - `thrown up from the laptop` (at x 400 → `dellL`) and `thrown down from the left Dell` (at x 1300 → `mac`).
  - `thrown at a wall stays`: on `dellL`, throw left → `h.sent` is empty and `on === 'dellL'`.
  - `gentle drop stays`: drag 300 points at a slow speed and let go → no `{display}` sent.
- [ ] **Step 2: Run and see them fail.**
- [ ] **Step 3: Implement** to the rules above.
- [ ] **Step 4: Run** the harness → all `ok`. Run `check.cjs` again → no problems.
- [ ] **Step 5: Commit** "Carry or throw him to another display".

### Task 4: He comes to you when Claude needs you

**Files:**
- Modify: `web/pet.html` (`setState` ~812, `behave` ~676, `hangabout.mouse`)
- Test: `scripts/test_displays.cjs`

**Interfaces:**
- Consumes: `disp.pointer`, `askDisplay`, the `display` step, `pet.stay`.
- Produces:
  - `comeToYou(now)`. It runs only when `NATIVE`, `!pet.stay`, `!pet.drag`, `pet.id` is `'needs'` or
    `'blocked'`, the pointer is on another display, and `pet.calls < 2`.
  - It does `pet.calls++`. The target x is `pointer.x ± 160` toward the side with more room, clamped to
    `[PW, W − PW]`.
  - The trip: `ai.urgent = true`, `ai.trick = null`, then
    `[{go: 'hold', T: 300, pose: {phase: 1, eyes: 'up'}}, {go: 'display', id, x, y: 0}, {go: 'drop'}]`. He pops out
    in a shimmer and drops in from the top near you.
  - Under `isStill()` there is no trip. He goes straight to the floor below that x, with
    `askDisplay(id, x, floorFeetY)`.
  - `pet.calls` resets to 0 when the state changes into needs or blocked from anything else.
  - `setState` calls `comeToYou` on entering needs or blocked, and `hangabout.mouse` calls it when the pointer's
    display changes.
  - In `behave`, a trip goes on while `roam(now) === 'free' || ai.urgent`. `endTrip` clears `ai.urgent`.

- [ ] **Step 1: Write the failing tests**
  - `comes to the pointer's display`: he's on `mac`, `hangabout.mouse('dellR', 800, 500)`, then `setState('needs')`.
    Within 5000 ms: `on === 'dellR'`, `standing`, `|x − 800| > 60` (not under the pointer), and he stays still
    afterwards.
  - `follows once more, not twice`: then `mouse('dellL', 400, 500)` → he's on `dellL` within 5000 ms. Then
    `mouse('mac', 400, 500)` → after 5000 ms he's still on `dellL`.
  - `blocked counts too`: as the first test, with `'blocked'`.
  - `stays with Stay on one display`: with `stay: true`, needs on another display → `h.sent` is empty.
  - `reduced motion goes straight there`: with the `reduced` class on body, he's on `dellR` within 500 ms,
    `standing`.
- [ ] **Step 2: Run and see them fail.**
- [ ] **Step 3: Implement** `comeToYou`, the counter, `ai.urgent` and the hooks.
- [ ] **Step 4: Run** the harness → all `ok`.
- [ ] **Step 5: Commit** "He comes to your display when Claude needs you".

### Task 5: Sneak through and the Portal secret finish on another display

**Files:**
- Modify: `web/tricks/core/sneak.js`, `web/tricks/fan/portal.js`, `TRICKS.md` (Trips section ~236-262)
- Test: `scripts/test_displays.cjs`

**Interfaces:**
- Consumes: `hangabout.across(side)`, `hangabout.otherDisplays()`, the `display` step.
- **Sneak:** when `across(right ? 'right' : 'left')` gives a display, the reappearance moves onto it. Replace the
  `putFeet(away, y)` do-step with `{go: 'display', id, x: away', y: next.y}`. `away'` and `oneEye` are on that
  display's near side, using `next.width` (exiting right means coming in at its left). The side-peeks stay on the
  current display. With no neighbor, it plays as today.
- **Portal:** when `otherDisplays()` isn't empty, half the time (`Math.random() < .5`) the orange portal opens on a
  random other display:
  - `bx, by` are picked within that display's size, with the same room-below rule using its floor (no window
    ledges there yet).
  - The orange shot flies up off the top (`by = -40`).
  - After he walks into the blue portal: `closePortals()`, then `{go: 'display', id, x: bx, y: by}`, then a do-step
    that opens orange at `(bx, by)`, `clip({y: by})` and schedules `closePortals`, then `drop` at 320.
- **TRICKS.md:** add the `{go: 'display', id, x, y}` row to the steps table, `across(side)` and `otherDisplays()` to
  the helpers table, and one line saying edge trips that leave through an edge with a display beyond it can come
  out there, while edges with nothing beyond are walls as before.

- [ ] **Step 1: Write the failing tests**
  - `sneak comes out on the neighbor`: on `dellL` at x 1500, `perform('sneak')`, tick 20000 → `on === 'dellR'`,
    `standing`.
  - `sneak at a wall wraps as before`: on `dellL` at x 300 (the left side, nothing there) → `on === 'dellL'`, no
    `{display}` sent.
  - `portal can open on another display`: fan pack on and `found` holding `portal`. Across seeds 1-8, at least one
    run ends on another display and at least one stays. No `.portal` element is left in the page after 4000 ms.
- [ ] **Step 2: Run and see them fail.**
- [ ] **Step 3: Implement** in both trick files and update TRICKS.md.
- [ ] **Step 4: Run** the harness and `check.cjs` with `ONLY=sneak,portal` → all `ok`, no problems.
- [ ] **Step 5: Commit** "Sneak and the portal can come out on another display".

### Task 6: The Mac app moves the layer between displays

**Files:**
- Modify: `app/Hangabout.swift` (`fitScreen` ~122-130, `trackPointer` ~133, `sendWindows` ~157-181, `sendSettings`
  ~230, `menu()` ~296, `userContentController` ~361), `README.md` (the "How it works"/features text about the screen)

**Interfaces:**
- Consumes: the page's `displays(list, on)`, `mouse(id, x, y)` and `settings({… stay})`, and the `{display: id}`
  message.
- Produces:
  - `func displayID(_ s: NSScreen) -> String`: the display's UUID string, from `CGDisplayCreateUUIDFromDisplayID`
    on `deviceDescription["NSScreenNumber"]`.
  - `var on: String?`
  - `func fitScreen(_ id: String? = nil)`: the screen whose id is `id`, else `on`, else the saved
    `prefs.string(forKey: "display")`, else `NSScreen.screens[0]`. It sets the panel's frame to that screen's frame,
    saves `on` in `prefs["display"]`, evaluates `hangabout.displays(<json>, '<on>')`, then
    `sendWindows(force: true)`.
  - Desktop coordinates for each screen `s`, with `main = NSScreen.screens[0].frame`:
    - `x = s.frame.minX`, `y = main.maxY − s.frame.maxY`
    - `top = s.frame.maxY − s.visibleFrame.maxY`, `bottom = s.visibleFrame.minY − s.frame.minY`
  - The list goes out as JSON through `JSONSerialization`.
  - `sendWindows`: subtract the current display's desktop origin from every window rect (CG window bounds are already
    top-left desktop coordinates) before the existing clipping.
  - `trackPointer`: find the screen holding `NSEvent.mouseLocation` and send `hangabout.mouse('<id>', x, y)` in its
    coordinates. Send it when the display changes, and otherwise at most every 250 ms while the pointer moves.
  - `userContentController`: `if let id = body?["display"] as? String { fitScreen(id); return }`.
  - The screen-parameters observer calls `fitScreen()`, which falls back to the main display when `on` is gone.
  - Menu: add `("stay", "Stay on one display")` to the toggle list. `sendSettings` adds `stay: <bool>`.
- README: say he roams every display (crossing where they meet, as arranged in System Settings > Displays), that you
  can carry or throw him across, and that he comes to your display when Claude needs you. Describe the Stay on one
  display switch.

- [ ] **Step 1: Build:** `./build.sh` succeeds with no warnings beyond today's.
- [ ] **Step 2: Smoke-run on this Mac** (three displays): `./install.sh`, then confirm he appears on the display saved
  in `defaults read io.github.jaysteezy-max.hangabout display` (or the main one on first run) and wanders. Check
  that `desk.clientWidth` equals the display's width right after a switch. Use the Task 8 eval hook: `disp.list`
  and `desk.clientWidth`.
- [ ] **Step 3: Commit** "Mac app: one layer that moves to the display he's on".

### Task 7: The Windows app does the same

**Files:**
- Modify: `app/win/main.js` (`fitScreen` ~62-68, `trackPointer` ~71, `clickedElsewhere` ~102, `sendWindows` ~108,
  `sendSettings` ~163, `menu()` ~195, the `hangabout` IPC handler ~241, the display listeners ~52)

**Interfaces:**
- Same messages as Task 6. Display ids are `String(display.id)`. The list comes from `screen.getAllDisplays()`:
  - `x, y, w, h` from `bounds`
  - `top = workArea.y − bounds.y`, `bottom = bounds.y + bounds.height − workArea.y − workArea.height`
- `fitDisplay(id)` mirrors `fitScreen(id)`, saving to `prefs.display`. After `win.setBounds(d.bounds)`, if
  `win.getBounds()` differs (Electron's known resize when moving between scalings), set it once more.
- `sendWindows`: convert each helper rect with `screen.screenToDipRect(null, {x, y, width, height})` and subtract
  `win.getBounds()` x and y. This replaces dividing by the primary display's `scaleFactor`.
- `clickedElsewhere`: `screen.screenToDipPoint({x: px, y: py})`, minus the window's x and y.
- `mouse`: `screen.getDisplayNearestPoint(screen.getCursorScreenPoint())`, with the same send rule as the Mac.
- `display-added/removed/metrics-changed` → `fitDisplay(current or primary)`.
- IPC: `else if (typeof body?.display === 'string') fitDisplay(body.display)`.
- Menu: `toggle('stay', 'Stay on one display')` after the Fan pack toggle. `sendSettings` adds `stay: !!prefs.stay`.

- [ ] **Step 1:** `node --check app/win/main.js` passes.
- [ ] **Step 2:** Read it side by side with the Mac diff: the same messages, in the same order, for each event.
- [ ] **Step 3: Commit** "Windows app: one layer that moves to the display he's on (unrun here)".

### Task 8: Check it on Jay's three displays

**Files:** none committed. A temporary eval hook lives only in the installed build. Add a Swift timer that runs and
deletes `<scratchpad>/hb-eval.js` every 0.5 s, then rebuild without it before the PR.

- [ ] Force each crossing with the hook, and capture all three displays with `screencapture -x a.png b.png c.png`
  for each:
  - Dell L→R and R→L
  - laptop → each Dell
  - each Dell → laptop
  - Sneak to the neighbor
- [ ] Windows on each Dell are ledges: `nativeTops` isn't empty after a switch, and he can be sent onto one.
- [ ] Come to you: write a `waiting` session into `state.json` with the pointer on another display. He arrives within
  about 5 s.
- [ ] Carry and throw: try synthetic mouse events (a CGEvent script). If macOS refuses them, list carry and throw as
  unproven in the PR, with a short thing for Jay to try.
- [ ] Stay on one display: toggle it, watch Erratic for 3 minutes with no crossings, relaunch, and he's on the same
  display.
- [ ] Remove the eval hook, rebuild, run `node scripts/test_displays.cjs` and `python3 scripts/test_hooks.py` one
  last time, then open the PR.
