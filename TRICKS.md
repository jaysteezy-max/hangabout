# Writing a trick

A trick is one JavaScript file in `web/tricks/` that calls `hangabout.trick({...})`. Most tricks are a list of poses with
timings; some also draw extra things (a sword, juggling balls) or take him places (up the side of the screen). This guide
covers all of it. The core tricks are short and worth reading alongside it: `core/dance.js` is frames only,
`core/juggle.js` adds drawing, `core/climb.js` is a trip.

## Quick start

1. Make `web/tricks/mine/wobble.js`:

   ```js
   // Wobble: he rocks side to side and settles.
   hangabout.trick({
     name: 'wobble', label: 'Wobble ~', rarity: 'rare',
     frames: [
       [{squash: 1}, 120],
       ...[-8, 8, -6, 6, -3, 3].map(tilt => [{tilt, eyes: 'happy'}, 90]),
       [{}, 200],
     ],
   })
   ```

2. Load it: add `<script src="tricks/mine/wobble.js"></script>` with the other trick scripts at the bottom of
   `web/pet.html`.
3. Try it: open `web/pet.html` in a browser (or `python3 -m http.server -d web`, then
   <http://localhost:8000/pet.html>). Your trick has a button because it has a label, or type `hangabout.perform('wobble')`
   in the console.
4. Use it for real: run `./install.sh` again. It rebuilds, and the trick is in the right-click Tricks menu.

## The trick object

| Field | Required | What it does |
| --- | --- | --- |
| `name` | yes | Unique id: letters, digits, `-`, `_`. Also the pose key that turns on your draw hooks (see below). |
| `rarity` | yes | When he picks it on his own: `common` (an everyday fidget), `rare` (now and then), `edge` (a trip to the screen's edges), `manual` (never on his own; menu, `perform()` and `on` only). The old `perched` still works and means `common` with `where: 'ledge'`. |
| `where` | no | `'floor'` (the Dock or the bottom of the screen) or `'ledge'` (the top of a window). He only picks it, or answers with it, while he's there; asked for from the menu somewhere else, he leaps there first. Leave it out for anywhere. |
| `on` | no | Things that happen that it answers, each with the chance it does: `{back: 1}` always, `{cleanFinish: .25}` one time in four. A chance can also be a function returning one, asked each time the moment comes: `{today: () => isHalloween() ? 1 : 0}`. See [Moments](#moments). |
| `frames` | one of these | `[[pose, ms], ...]`, played once on the spot. |
| `trip` | one of these | `({now, here, x, y, dir}) => steps`, an outing that moves him around. See [Trips](#trips). |
| `label` | no | Text for the Tricks menu and the mockup's button. Without one the trick still plays on its own, but isn't listed. |
| `weight` | no | How likely it is next to others of the same rarity. Default 1. A function returning a number makes it likelier at some times than others, e.g. `() => new Date().getHours() >= 22 ? 3 : 1`. |
| `pack` | no | `'fan'` for fan art of other people's characters. Fan tricks only play while the Fan pack setting is on, and each is a secret until it's found. See [Secrets](#secrets). |
| `pixels`, `behind`, `front`, `glow` | no | Draw hooks. See [Drawing](#drawing). |
| `end` | no | Called when a trip is cut short (Claude needs him, or you grab him). Tidy up anything you added to the page. |

How often each rarity comes up is set by the behavior presets (`PRESETS` in `web/pet.html`): `chance.move` is how
often he does a trick at all, and `odds.rare` how many of those are rare. He never picks the same trick twice in a row
on his own.

### Moments

Picking at random gives him personality; answering what happens gives his moves meaning. A trick with `on` plays when
one of these moments comes and its chance comes up (if several tricks pass, one of them is picked):

| Moment | When |
| --- | --- |
| `back` | You're back at your Mac after five minutes or more without touching it. |
| `drowsy` | Claude has been idle 27 minutes: three minutes before he dozes off. |
| `longCommand` | A command Claude ran for more than 4 seconds just finished, and Claude doesn't need you. |
| `cleanFinish` | Claude finished a turn that edited files or ran commands, with nothing failing. In the mockup, the demo turn. |
| `doubleClick` | You double-clicked him. |
| `midWalk` | He's halfway through a walk of more than 120 points, while he's free to roam. |
| `longFinish` | Claude finished a turn that took 15 minutes or more, while you're here. |
| `finishedWhileAway` | Claude finished a turn while you were away from your Mac. `hangabout.away` says whether you still are. |
| `today` | Once a day: the first time he's free to roam while you're at your Mac, so soon after he starts. For tricks tied to a date: give it a function chance that's 1 on the day. |
| `comeback` | A command Claude ran with `test` in it succeeds, and the last test command before it in that session failed. |
| `failStreak` | Three of Claude's tool calls in a row failed in one session. Once per streak: a call that works ends it. |
| `forcePush` | Claude ran `git push` with `--force`, `--force-with-lease` or `-f`. |
| `windowSurf` | In the app: the window he's standing on is dragged fast (over 1,500 points a second). Once per drag. |
| `bigDrop` | He lands after you let go of him more than half the screen's height above where he lands. |
| `thrown` | You let go of him mid-fling, hard to the side (the pointer going over 2,000 points a second). He answers once he lands. |
| `highUp` | He's on a window ledge more than half the screen above the floor and decides to get down. A trick that answers takes him down instead of his usual jump. |
| `dizzyAgain` | You've shaken him dizzy for the third time today, and his head has just cleared. |
| `beat` | Four clicks on him in an even rhythm, slower than a double-click: each gap 500 to 1,000 ms, all within 20% of their average. |

`comeback`, `failStreak` and `forcePush` come from the session's log of Claude's last 8 tool calls, and each call is
looked at once, when it's logged. Calls already logged when the page loads don't count.

A trick that's a `trip` only answers a moment while he's free to roam (Claude doesn't need him and isn't at work):
any other time the trip would be cut short as it starts.

To try one in the mockup, type `hangabout.back()` (or another moment's name in `fire('…')`) in the console. `fire`
returns `true` if a trick answered. Run `hangabout.left()` first to have `hangabout.away` say you're away, and
`hangabout.back()` to end it. For the Claude moments, feed it a log, then the same log with a call added:
`hangabout.claude({sessions: {s: {mood: 'running', ts: Date.now() / 1000, log: [{ok: false, call: 'Bash(npm test)', out: ''}]}}})`.

`hangabout.trick()` throws a clear error for a missing name, an unknown rarity, or malformed frames, so check the console.

## Frames and poses

A frame is `[pose, ms]`: hold this pose for this many milliseconds. A pose is a plain object; anything you leave out is
his normal standing self, so `{}` is "back to neutral". End your frames with `[{}, 200]` so he settles before whatever
comes next. Keep tricks short, a few seconds at most; there's always next time.

| Pose key | Values | Effect |
| --- | --- | --- |
| `dy` | art pixels, negative is up | Hops: his whole body moves up or down. |
| `squash` | 0, 1, 2 | Crouches: shorter; 2 also makes him one pixel wider each side. |
| `stretch` | 0, 1, 2 | Reaches up: taller. |
| `tuck` | 1 | Pulls all four legs up (mid-jump). |
| `lift` | leg indexes, e.g. `[0, 3]` | Raises those legs. 0 and 1 are his left pair, 2 and 3 his right pair. |
| `tapLeg` | 0–3 | Raises one leg (tapping a foot). |
| `arms` | `[left, right]` | Each `'down'`, `'mid'` (default), `'up'` or `'high'` (with a hand above). `['cross', 'cross']` folds them. |
| `eyes` | see next row | `'open'` (default), `'blink'`, `'up'`, `'down'`, `'side'` (with `look: -1` or `1`), `'happy'`, `'sad'`, `'angry'`, `'strain'`, `'dizzy'`. |
| `look`, `lookX`, `lookY`, `dx` | -1, 0, 1 | Where his eyes point. With open eyes and none of these set, they follow your cursor. |
| `face` | -1, 1 | Turned three-quarters to his left or right. A half-turned frame is added for you when this changes. |
| `swing` | -1, 1 | When turned: arms swing back or forward. |
| `hand` | art pixels | When turned: how far down his body his front hand sits, measured like the `arms` levels (`'up'` is 4, `'mid'` 8). Overrides `arms` for that hand. |
| `reach` | art pixels | When turned: his front arm sticks out this much further (a jab). |
| `tilt` | degrees | Rotates him about his feet; past 20° he turns about his middle instead (for flips). |
| `ox` | art pixels | Slides him sideways within his own canvas (a quick dash). |
| `sink`, `clip` | screen points at normal size (3 per art pixel), 1 | Sinks him below the ledge he stands on; with `clip: 1` the sunk part is hidden. |
| `glide` | pixels per second | Carries him along the ledge while the frame plays (a ride, a cartwheel); he turns round at the end of it. While gliding, `face` and `tilt` follow his direction. |
| `aura` | 1 | A white outline around him. |
| `notes` | 1 | Music notes float up. |
| `shake` | 1 | The screen rumbles (in the app, his whole layer shakes). Use for a big moment only. |
| `phase` | 1 | Dithered and violet, as if halfway through a wall. |
| `<your trick's name>` | anything but `null` | Turns on your trick's draw hooks for this frame and hands them the value. |

**Skins.** Tricks play on whichever pet is on screen: Cappy, the default, the Clawd skin, or any other in
[Skins](#skins) (right-click → Skin, or the mockup's **Skin** picker). Cappy is a capybara drawn side on, facing the way
he last went. He has no arms:
`arms` `'up'` lifts his front paw in a wave, `'high'` lifts it higher, `hand` and `reach` push it forward, and `'cross'`
does nothing. `face` turns him left or right, and his one eye takes the same `eyes` and `look` values as Clawd's.
Everything else above works the same on both.

Clay, a clay soldier, is drawn three-quarters and also keeps facing the way he last went. His arms work like
Clawd's: `arms` for each (by screen side), `swing`, and `hand` and `reach` for the one in front. He has two legs, so
`lift` raises one, the first listed: an even index his far leg, an odd one his near leg (walking's `[0, 3]` and
`[1, 2]` still alternate). He has no face: `'happy'` stands him taller, `'sad'` slumps him, `'dizzy'` wobbles his head,
and nothing is ever drawn in `EYE`, so a trick that finds his eyes by their color finds none. With no eye he has no
`head()` either: costumes dress him the way they dress Clawd.

## The art grid

He's drawn on a 44 × 40 grid of art pixels, each shown as 3 × 3 screen points at normal size (more or less with the
Size slider). `(0, 0)` is the top-left. The helpers below are all on `window.hangabout`.

```text
x:  0    4   6  10  14       28  33 34  37   43
    ┌───────────────────────────────────────┐ y 0
    │  headroom: hair, hops, sparks, glyphs │
    │                                       │
    │      high arm hands (y 18)            │ y 20 = OY: top of his body
    │    ┌──┐ ┌──────────────────────┐ ┌──┐ │ y 24: eyes (x 14 and 28, 2 × 4), up arms
    │    │  │ │   ██            ██   │ │  │ │ y 28: mid arms
    │    └──┘ │                      │ └──┘ │ y 32: down arms
    │         └──────────────────────┘      │ y 36: legs, x 12, 16, 26, 30 (2 wide, 4 tall)
    └───────────────────────────────────────┘ y 39: his feet on the ground
```

| Name | Value | Meaning |
| --- | --- | --- |
| `GW`, `GH` | 44, 40 | The grid size. |
| `OX`, `OY` | 4, 20 | Clawd's offset in the grid: his front-facing body spans x `OX + 6` to `OX + 29`, y `OY` to `OY + 15`. Cappy fills about the same box side on, x 9 to 34, with his eye on y 24 and his feet on y 38. |
| `LIFT` | 12 | `OY - 8`. Add it to a y you worked out as if he had only 8 rows of headroom above him. |
| `BODY`, `TOP`, `SIDE`, `EYE` | hex colors | The skin's colors: its body, the lit top, the shaded side, the eyes. Cappy's brown or Clawd's terracotta, so read them from here; never hard-code them. |
| `skin` | `'cappy'`, `'clawd'`, … | The key of the skin that's on (see [Skins](#skins)), for a trick that needs to draw differently on each. The page reloads when it changes. |
| `C` | `{clay, peri, ok, err, dim}` | Claude Code's theme colors, light or dark to match the screen. |
| `PH` | 120 | His footprint's height in screen points at normal size (for trips). |

## Drawing

Draw hooks run each frame while the pose has a key named after your trick. Put your data under that key: frames like
`[{arms: ['up', 'up'], juggle: 0.25}, 80]` make `juggle`'s hooks run with `d = 0.25`. Each hook gets one object:

| Argument | What it is |
| --- | --- |
| `ctx` | His canvas's 2D context: the 44 × 40 grid, plus 12 spare columns each side (x −12 to 55) for things beside him. Draw in art pixels with `fillRect(x, y, w, h)`. |
| `d` | The value under your trick's name in this frame's pose. |
| `px` | His pixels this frame: `[[x, y, color], ...]`, after any `pixels` hooks. Handy for outlines, auras and afterimages. |
| `pose` | The whole pose, including what the pet added (eyes following the cursor, blinking). |
| `now` | Milliseconds, for flicker and motion inside a frame. |

| Hook | Returns | Use it to |
| --- | --- | --- |
| `pixels({d, px, pose, now})` | new `px` | Recolor or move his own pixels: chrome, armor, a tremble. |
| `behind({ctx, ...})` | nothing | Draw behind him: capes, swords on his back, auras, trails. |
| `front({ctx, ...})` | nothing | Draw over him: hair, masks, held things, sparks. |
| `glow(d, pose)` | CSS filter text | Add a glow round the whole canvas, e.g. `' drop-shadow(0 0 3px rgba(255,40,40,.8))'` (note the leading space). |

Things to know:

- Each frame starts from a faded copy of the last one (a soft phosphor trail), not a blank canvas, so fast movement
  leaves a brief ghost. You don't need to clear anything.
- Set `ctx.globalAlpha` back to 1 when you change it.
- Stay in whole art pixels and hex colors (`'#RRGGBB'`); `mix` and `recolor` need six-digit hex.
- Your hooks don't run with Reduce motion on. He holds a still pose instead.
- If a hook throws, the console says which trick and hook, and that trick is switched off until the page reloads. The
  pet keeps going.

Helpers:

| Helper | What it does |
| --- | --- |
| `paint(ctx, rows, x, y, ink)` | Pixel art from strings: `paint(ctx, ['.#.', '###'], 20, 5, {'#': '#FFD84D'})`. Characters not in `ink` stay clear. |
| `thickLine(ctx, x0, y0, x1, y1, w, color, alpha)` | A line `w` pixels thick, for blades, beams and slashes. |
| `recolor(px, {from: to}, t)` | His pixels with some colors moved toward others by `t` (0 to 1). |
| `mix(a, b, t)` | One color moved toward another by `t`. |
| `rand(a, b)`, `pick(list)` | A random number in a range; a random item. |
| `head(pose)` | Where a side-on skin's face is in this pose, as drawn facing left: `{x, y}` is his eye (Cappy's left pixel, at x 20), `top` the top of his head between his ears, `nose` the front of his snout (x 10 on Cappy and the hippo). They move with `dy`, `squash` and `stretch`. It's the skin's own `head` (see [Skins](#skins)), so it's `undefined` on Clawd. |
| `facing(ctx, pose, draw)` | Runs `draw()` with the canvas mirrored while a side-on skin faces right (and slid by `ox`), so a costume drawn once on him facing left turns with him. On Clawd it changes nothing. |

**Costumes on every skin.** Hair, masks and anything else that sits on his face need a spot on each kind of skin. Clawd
faces you, eyes at x 14 and 28. A side-on skin has a `head`, so check `hangabout.head` (not `hangabout.skin`) and draw
his version facing left inside `facing()`: lay it out on Cappy, then move what goes by his eye by `head(pose).x - 20`
and what goes by his snout by `head(pose).nose - 10`, so it fits the hippo and any skin after him. His rump is his
rightmost pixel as drawn facing left, less his outline; his feet are on the row above his lowest, which is all outline.
Guts, Vader, Thorfinn and the moonwalk in `web/tricks/fan/` show how.

## Trips

A trip takes him places: off the screen's edge, up its side, through a portal. Instead of `frames`, give a `trip`
function. It's called when the trick starts, with `{now, here, x, y, dir}`: the time, the surface he's standing on
(see `surfaces()` below), where his feet are (screen points, bottom center of him), and which way he faces (-1 or 1). It
returns steps, run in order:

| Step | What it does |
| --- | --- |
| `{go: 'walk', to: x, speed, phase}` | Walks his feet to `x` at `speed` points per second, legs stepping. `phase: 1` shimmers him while he's partly off screen. |
| `{go: 'climb', to: y, speed}` | Climbs to `y` on a wall (after a slide that set `rot` to -90 on the right side or 90 on the left). |
| `{go: 'slide', x, y, rot, T, pose}` | Eases to a spot and a rotation over `T` ms. Leave out what shouldn't change. |
| `{go: 'hold', T, pose}` | Holds a pose for `T` ms. `pose` can be a function of the ms since the step began. |
| `{go: 'do', fn}` | Runs `fn(now)` once: jump him somewhere, add something to the page. |
| `{go: 'move', fn, pose}` | Calls `fn(t, dt)` every frame (ms since the step began, ms since the last frame) to move him yourself with `putFeet`, for motion the other steps can't do: a swing on a web, a throw. Ends when `fn` returns true. `pose` as for `hold`. |
| `{go: 'drop', vy}` | Lets go: he falls from where he is (optionally already moving down at `vy`) and the trip is over. |

When the steps run out he falls to whatever is below him, so a trip can end anywhere. Distances are in screen points:
multiply your art-sized distances by `hangabout.size` so a bigger pet goes further. Trip helpers on `hangabout`:

| Helper | What it gives you |
| --- | --- |
| `feet()` | `{x, y}`: where his feet are now. |
| `putFeet(x, y, rot)` | Puts his feet there at once, rotated `rot` degrees about them if given. |
| `width`, `size`, `scr` | The screen's width; his size; `{top, bottom}`: the menu bar's and the Dock's heights. |
| `surfaces()` | Everywhere he can stand: the floor first, then each window's top edge, as `{x0, x1, y}` measured at the top-left of his footprint. His feet can go from `x0 + 66` to `x1 + 66`, at `y + PH`. `here` is one of these. |
| `edges()` | The top edges of the windows, as `{y, x0, x1, wx, w, h}`: the visible stretch of the top (`x0` to `x1`), and the window's left, width and height. For things that stick to windows (see `fan/spidey.js`). |
| `clip({x, dir})`, `clip({y})` | Hides the part of him past `x` on the side he's heading, or above `y`, until he lands (into and out of a portal). |
| `desk` | The element he lives in, for adding your own pieces of page (see `fan/portal.js`). |

A trip is cut short when Claude needs him or you grab him. If yours added anything to the page, remove it in `end`.

## Testing

- **The mockup** (`web/pet.html` in a browser) is the quickest loop: a pretend desktop with windows to jump onto, every
  Claude state as a button, Calm/Normal/Erratic, the fan pack toggle, and a button for each labeled trick. Reload after
  each change.
- **One frame at a time.** In a background tab browsers draw only a few frames a second. For a reliable look, render
  your frames side by side, big. Paste this in the console (change `wobble` to your trick):

  ```js
  const S = 6, frames = TRICKS.wobble.frames, sheet = document.createElement('canvas')
  sheet.width = frames.length * GW * S; sheet.height = GH * S
  Object.assign(sheet.style, {position: 'fixed', left: 0, top: 0, zIndex: 99, background: '#23253a', imageRendering: 'pixelated'})
  const g = sheet.getContext('2d'); g.imageSmoothingEnabled = false
  frames.forEach(([pose], i) => {
    const c = document.createElement('canvas'); c.width = GW; c.height = GH
    const k = c.getContext('2d'), px = figureOf(pose, EYE), t = TRICKS.wobble
    for (const [x, y, col] of px) { k.fillStyle = col; k.fillRect(x, y, 1, 1) }
    const arg = {ctx: k, d: pose.wobble, px, pose, now: 0}
    if (pose.wobble != null) { t.behind?.(arg); t.front?.(arg) }
    g.drawImage(c, i * GW * S, 0, GW * S, GH * S)
  })
  document.body.append(sheet) // sheet.remove() when done
  ```

  (Tilts are CSS rotations of the whole canvas, so they don't show on the sheet.)
- **Every skin:** check it on Cappy, on Clawd and on any other skin (the mockup's **Skin** picker, or `?skin=<name>`).
- **Reduce motion** on (mockup button or right-click menu): he should still look right standing still.
- **The real thing:** `./install.sh`, then right-click → Tricks.

## Skins

A skin is who the pet is. Each is one file in `web/skins/` that adds itself to `SKINS`, loaded with a
`<script src="skins/<name>.js">` line next to `skins/cappy.js` near the top of `web/pet.html` (before the page's own
script, so his colors are known before the tricks load). `web/skins/cappy.js` is the worked example; Clawd is drawn
inside `web/pet.html` and registered there.

```js
SKINS.hippo = {
  name: 'Hippo',               // what the page and the menu call him
  label: 'Hippo (fan art)',    // optional: the menu's text, when it should say more than the name
  colors: [body, top, side, eye], // become BODY, TOP, SIDE, EYE: tricks recolor exactly these, so use them in your art
  sideOn: true,                // optional: drawn side on, so he keeps facing the way he last went
  pack: 'fan',                 // optional: fan art of someone else's character; listed only while Fan pack is on
  head(pose){ return {x, y, top, nose} }, // side on: his eye, the top of his head and the front of his snout, facing left
  draw(pose, eye){ return [[x, y, color], ...] },
}
```

`draw` turns a [pose](#frames-and-poses) into pixels on the [art grid](#the-art-grid): every key in the pose table
should do something sensible (`dy`, `squash`, `stretch`, `tuck`, `lift`, `tapLeg`, `arms`, `hand`, `reach`, `eyes`,
`look`, `lookX`, `lookY`, `dx`, `face`, `half`, `swing`, `ox`), or nothing where the pet has no such part. Draw his eyes
in the `eye` color it's given (it flashes while Claude needs you). His lowest pixel must be on row 39, the ground; the
page checks this. Stay inside about x 6 to 37 and keep the head near y 18 to 24, where tricks put hats and props. The
pet is outlined with its own dark line, as in the pixel-art reference it was drawn from.

A side-on skin also gives `head(pose)` so costumes fit him (the page checks it finds his eye), stands his feet on row 38
with only his outline below them, and colors his toes a color used nowhere else on him: the moonwalk's glove and
Thorfinn's dagger find a front foot he's lifted by it.

Pick one with right-click → Skin in the app (saved, and the page reloads), or `?skin=<key>` in the mockup.
Before you ship one: play every trick on it in the mockup with no console errors, and look at a sheet of its poses.

## Fan pack rules

Tricks and skins that depict other people's characters are fan art: tricks go in `web/tricks/fan/` with `pack: 'fan'`,
skins in `web/skins/` with `pack: 'fan'`, and each starts with a comment naming the source and saying it's fan-made and
unofficial. Draw original pixel art: no traced or copied sprites, logos or sounds. If a rights holder asks for a trick or
skin to be removed, it will be.

### Secrets

Every `pack: 'fan'` trick is a secret. Until it's found, right-click → Tricks shows it as `???` and counts how many of
them you've found, and he picks it on his own at a twentieth of its weight, so every secret still turns up in the end.
It's found the first time it plays for any reason: a moment it answers, a random pick, or its button in the mockup.
From then on it's listed by name and he picks it at its normal weight. The app remembers what you've found.

Give each secret an `on` moment that fits it, so it's found by something you do rather than only by waiting.
`hangabout.code(text)` (right-click → **Enter a code…**, or the mockup's button) finds them all at once and turns the
Fan pack on.
