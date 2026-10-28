---
name: new-trick
description: Scaffold a new Hangabout trick (a move Clawd does) from an idea, wire it into web/pet.html, and check it in the browser mockup. Use when someone in this repo asks to make, add or prototype a trick, move, animation or fidget for the pet.
---

# Make a new trick

Read `TRICKS.md` first: it has the trick object, the pose vocabulary, the art grid, draw hooks and trip steps.

1. **Pin down the idea** in one sentence: what he does, start to finish, in a few seconds. Decide:
   - `name` (camelCase, unused: check `web/tricks/`), a short `label` with a symbol, and a `rarity`
     (`rare` unless it's an everyday fidget, a ledge-only move, or an edge trip).
   - Frames only, frames plus drawing, or a trip. Prefer frames only; add a draw hook only for things his body can't
     show (objects, effects); a trip only if he must travel.
   - Original idea → `web/tricks/core/`. Someone else's character → `web/tricks/fan/` with `pack: 'fan'` and the
     fan-made header comment (see the fan pack rules in TRICKS.md).
2. **Write the file**, matching the existing tricks: a header comment saying what he does, a `{ ... }` block if it
   needs constants (so names don't clash with other files), `hangabout.trick({...})`, frames ending with `[{}, 200]`.
   Put draw data under the trick's own name in each pose. Reset `ctx.globalAlpha` to 1 after changing it.
3. **Wire it in**: add `<script src="tricks/<folder>/<file>.js"></script>` with the other trick scripts at the bottom of
   `web/pet.html` (core before fan).
4. **Check it** in the mockup: serve `web/` (`python3 -m http.server -d web`), open `pet.html`, look for console errors,
   and run `hangabout.perform('<name>')`. Render the frames as a contact sheet (snippet in TRICKS.md › Testing) and look at
   it before calling the art done. Fix what reads poorly: silhouettes first, then color.
5. **Report** what the trick does, where the file is, and how it was checked. Don't run `./install.sh` unless asked: it
   touches the user's install.
