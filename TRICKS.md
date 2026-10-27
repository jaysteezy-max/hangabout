# Writing a trick

A trick is one JavaScript file in `web/tricks/` that calls `hookpet.trick({...})`. Most tricks are a list of poses with
timings; some also draw extra things (a sword, juggling balls) or take him places (up the side of the screen). This guide
covers all of it. The core tricks are short and worth reading alongside it: `core/dance.js` is frames only,
`core/juggle.js` adds drawing, `core/climb.js` is a trip.

## Quick start

1. Make `web/tricks/mine/wobble.js`:

   ```js
   // Wobble: he rocks side to side and settles.
   hookpet.trick({
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
   <http://localhost:8000/pet.html>). Your trick has a button because it has a label, or type `hookpet.perform('wobble')`
   in the console.
4. Use it for real: run `./install.sh` again. It rebuilds, and the trick is in the right-click Tricks menu.

## The trick object

| Field | Required | What it does |
| --- | --- | --- |
| `name` | yes | Unique id: letters, digits, `-`, `_`. Also the pose key that turns on your draw hooks (see below). |
| `rarity` | yes | When he picks it on his own: `common` (an everyday fidget), `rare` (now and then), `perched` (only on a window ledge), `edge` (a trip to the screen's edges), `manual` (never on his own; menu and `perform()` only). |
| `frames` | one of these | `[[pose, ms], ...]`, played once on the spot. |
| `trip` | one of these | `({now, here, x, y, dir}) => steps`, an outing that moves him around. See [Trips](#trips). |
| `label` | no | Text for the Tricks menu and the mockup's button. Without one the trick still plays on its own, but isn't listed. |
| `weight` | no | How likely it is next to others of the same rarity. Default 1. |
| `pack` | no | `'fan'` for fan art of other people's characters. Fan tricks only play while the Fan pack setting is on. |
| `pixels`, `behind`, `front`, `glow` | no | Draw hooks. See [Drawing](#drawing). |
| `end` | no | Called when a trip is cut short (Claude needs him, or you grab him). Tidy up anything you added to the page. |

How often each rarity comes up is set by the behavior presets (`PRESETS` in `web/pet.html`): `chance.move` is how
often he does a trick at all, and `odds.rare` how many of those are rare.

`hookpet.trick()` throws a clear error for a missing name, an unknown rarity, or malformed frames, so check the console.

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
| `tilt` | degrees | Rotates him about his feet; past 20° he turns about his middle instead (for flips). |
| `ox` | art pixels | Slides him sideways within his own canvas (a quick dash). |
| `sink`, `clip` | art pixels, 1 | Sinks him below the ledge he stands on; with `clip: 1` the sunk part is hidden. |
| `glide` | pixels per second | Carries him along the ledge while the frame plays (a ride, a cartwheel); he turns round at the end of it. While gliding, `face` and `tilt` follow his direction. |
| `aura` | 1 | A white outline around him. |
| `notes` | 1 | Music notes float up. |
| `shake` | 1 | The screen rumbles (in the app, his whole layer shakes). Use for a big moment only. |
| `phase` | 1 | Dithered and violet, as if halfway through a wall. |
| `<your trick's name>` | anything but `null` | Turns on your trick's draw hooks for this frame and hands them the value. |

## The art grid

He's drawn on a 44 × 40 grid of art pixels, each shown as 3 × 3 screen points at normal size (more or less with the
Size slider). `(0, 0)` is the top-left. The helpers below are all on `window.hookpet`.

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
| `OX`, `OY` | 4, 20 | His offset in the grid: the front-facing body spans x `OX + 6` to `OX + 29`, y `OY` to `OY + 15`. |
| `LIFT` | 12 | `OY - 8`. Add it to a y you worked out as if he had only 8 rows of headroom above him. |
| `BODY`, `TOP`, `SIDE`, `EYE` | hex colors | His terracotta, its lit top, its shaded side, his eyes. |
| `C` | `{clay, peri, ok, err, dim}` | Claude Code's theme colors, light or dark to match the screen. |
| `PH` | 120 | His footprint's height in screen points at normal size (for trips). |

## Drawing

Draw hooks run each frame while the pose has a key named after your trick. Put your data under that key: frames like
`[{arms: ['up', 'up'], juggle: 0.25}, 80]` make `juggle`'s hooks run with `d = 0.25`. Each hook gets one object:

| Argument | What it is |
| --- | --- |
| `ctx` | The 44 × 40 canvas's 2D context. Draw in art pixels with `fillRect(x, y, w, h)`. |
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
| `{go: 'drop', vy}` | Lets go: he falls from where he is (optionally already moving down at `vy`) and the trip is over. |

When the steps run out he falls to whatever is below him, so a trip can end anywhere. Distances are in screen points:
multiply your art-sized distances by `hookpet.size` so a bigger Clawd goes further. Trip helpers on `hookpet`:

| Helper | What it gives you |
| --- | --- |
| `feet()` | `{x, y}`: where his feet are now. |
| `putFeet(x, y, rot)` | Puts his feet there at once, rotated `rot` degrees about them if given. |
| `width`, `size`, `scr` | The screen's width; his size; `{top, bottom}`: the menu bar's and the Dock's heights. |
| `surfaces()` | Everywhere he can stand: the floor first, then each window's top edge, as `{x0, x1, y}` measured at the top-left of his footprint. His feet can go from `x0 + 66` to `x1 + 66`, at `y + PH`. `here` is one of these. |
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
    const k = c.getContext('2d'), px = figure(pose, EYE), t = TRICKS.wobble
    for (const [x, y, col] of px) { k.fillStyle = col; k.fillRect(x, y, 1, 1) }
    const arg = {ctx: k, d: pose.wobble, px, pose, now: 0}
    if (pose.wobble != null) { t.behind?.(arg); t.front?.(arg) }
    g.drawImage(c, i * GW * S, 0, GW * S, GH * S)
  })
  document.body.append(sheet) // sheet.remove() when done
  ```

  (Tilts are CSS rotations of the whole canvas, so they don't show on the sheet.)
- **Reduce motion** on (mockup button or right-click menu): he should still look right standing still.
- **The real thing:** `./install.sh`, then right-click → Tricks.

## Fan pack rules

Tricks that depict other people's characters go in `web/tricks/fan/` with `pack: 'fan'`, and start with a comment
naming the source and saying it's fan-made and unofficial. Draw original pixel art: no traced or copied sprites, logos
or sounds. If a rights holder asks for a trick to be removed, it will be.
