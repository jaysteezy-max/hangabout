---
name: new-skin
description: Make a new Hangabout skin (a character the pet can be) from real references of that character, to the owner's bar, and check it. Use when someone in this repo asks to make, add or draw a new pet, skin or character for the pet, or to redo how one looks or moves.
---

# Make a new skin

Read `TRICKS.md` › Skins and › Making a skin first, then `web/skins/cappy.js` (the worked example) and the skin closest
to yours: an animal side on or three-quarters `chicken.js` or `pusheen.js`, front on `hatty.js`, a figure with arms
`clay.js`.

The owner (Jay) is not a pixel artist or an expert on the character, and this is a side project. You are the
researcher, art director and reviewer. Jay sees art only after fresh reviewer agents score it 8+/10, and is asked only
what is genuinely Jay's call, always with your recommended answer. Keep the character bible, references and each
version's renders in your notes: the shared notes folder if the session has one, else the scratchpad.

1. **Scope it with Jay first**, in one message, a recommendation on each:
   - The canonical look, with a named source: the game or show, the version, the art (`Castle Crashers Blue Knight, his
     idle on the wiki`). Ask for any references Jay already has (images, a sprite rig): those are the ones to follow.
   - Size: rows tall out of the 40 (today's pets are 22 to 33). Tricks hop up to 8 rows, so a full-height pet clips;
     keep the head near rows 18 to 24 where tricks put hats and props, or plan to fit them.
   - Fan pack or not: someone else's character is fan art (`pack: 'fan'`, see TRICKS.md › Fan pack rules).
   - A key: lowercase letters and digits (`shovelknight`). The app drops anything else and falls back to Cappy.
   - Say what done means (don't ask it): the art; its own walk (`walk`); hands, paws or wings for each action; every
     `eyes` expression; Claude's states (`moods`); every trick audited at 2x against Cappy and tailored; props held in
     its hands; every fan costume fitted; its own tricks if any; a pose sheet and trick sheets. Nothing merges until Jay
     approves all of it, whatever the usual habit of merging your own PRs.
2. **Research before pixels.** Find official art (wiki, renders), sprite sheets or rigs, gameplay GIFs or video for how it
   moves, and its personality. Search Google Images for `<name> 2d pixel art`, not Bing. To read a web image's pixels,
   open the image URL itself in the Browser pane, draw it onto a canvas in that tab (`imageSmoothingEnabled = false`)
   and read `getImageData`. The tools need references as local files: save the ones Jay sends; ask Jay before
   downloading one (name the file and source). Then write a character bible:
   - parts, and proportions as ratios (head to body to legs, width to height);
   - palette sampled from the art as hex; line style (outline color and thickness, inner lines);
   - the signature idle pose; walk, jump and attack physics (stride, bob, what the arms do);
   - hand shapes; expressions (which of its faces each `eyes` value becomes); gear, and what holds what in each pose;
   - personality, and the moves it's known for (the seeds of its own tricks).

   The art is the truth, but you draw it yourself. Measure proportions and sample colors from references, then draw the
   shapes on purpose at the pet's size: no copied sprites (Fan pack rules), and never a blurry or mid-animation frame
   shrunk down. Never trust a written brief (a parent session's or your own) over the art. If you can't read part of a
   reference, find out what it is from other art; never just delete it. Never fit the character onto Clawd's or
   Cappy's skeleton or the shared walk: the skin draws what its body has.
3. **Block out the silhouette** at the target size: the big shapes, outline and two or three colors. Render it beside the
   references at matching height (`sheet.py ... --ref`) and check the bible's proportions before any detail.
4. **Write `web/skins/<key>.js`** as TRICKS.md › Skins describes, with a header comment naming the source (and saying
   it's fan-made and unofficial, for fan art). Add its `<script>` line next to `skins/cappy.js` in `web/pet.html` and a
   row to the Skins table in `README.md`. Give it pose keys of its own for parts the shared keys can't say (the
   chicken's `peck` and `kick`, a sword, a cane), never named like a trick: that turns the trick's draw hooks on. A side-on
   skin gives `head()`, which the page checks lands on an `EYE` pixel; a face with no eye there (a visor, Clay's blank
   cube) has no `head()`, wears Clawd's costume spots, and is fitted with skin branches in step 7 instead.
5. **Review it before Jay sees anything.** Render the rest pose beside the references at 8x and at 3x, the pose sheet,
   and the ASCII grid. Spawn two or more fresh reviewer agents in parallel, new ones each round, and don't anchor them:
   no "I think it's close", no list of what you changed. Brief each one like this:

   > Review a pixel-art pet against its source character. References: <paths or URLs>. Renders: <8x>, <3x>, <pose
   > sheet>. The exact pixels: <ascii grid>. Score the likeness and the craft 1-10. List the fixes that would raise it
   > most, ranked, with grid coordinates. Check every pose on the sheet reads as this character. End with: show the owner
   > now, yes or no?

   Fix, re-render, and ask new reviewers. Repeat until every reviewer scores 8+ and says show the owner.
6. **Show Jay** the rest pose beside its references and the pose sheet together, with the scores. Ask only what is Jay's
   call (a color variant, which of two canonical looks), each with the canonical answer you recommend and why. Never
   offer an option that's off model: a non-expert can't tell. Changes go back through step 5 before Jay sees them again.
7. **Make it move its own way**, from the references, once the look is approved:
   - `walk(now, dir, arms)`: its stride, bob and arm swing (also used to climb).
   - `moods`: its own poses for each of Claude's states in `MOODS` (`web/pet.html`). `editing` and `running` are props
     it works at, posed by the prop: check its hands read there.
   - Hands for every `arms`, `hand` and `reach` value, and its own face for every `eyes` value.
   - Audit every trick at 2x beside Cappy (`DSF=2` runs of `check.cjs` on `cappy` and on `<key>`, then `framesheet.py`),
     noting each as fine or needs tailoring. A frames-only trick gets `tricks: {name: frames}` in the skin (keep the
     trick's pose key where its draw hooks need it). A trip (sneak, fishing, the paper plane...) or a trick that draws props or a
     costume gets a `hangabout.skin === '<key>'` branch in its file, as Hatty's and the chicken's do (`fan/vader.js`,
     `core/coffee.js`): props go where its hand is drawn, costumes per TRICKS.md › Costumes on every skin. Separate trick
     files can go to parallel agents.
   - Its own tricks, if the source has moves worth one: pitch a list first, Jay picks, then the new-trick skill.
8. **Check everything** before asking Jay to approve:
   - Pose sweep (`px.cjs ... sweep`): no pixels off the grid, and every pose it says floats has a foot up on purpose.
   - Headless run (`check.cjs <key>`): every trick (Fan pack on) and every Claude state; `problems` must be empty (it
     includes the page's asserts: lowest pixel on row 39, `head()` finds the eye). If you edited a trick file, run it
     with `ONLY=<tricks>` on `cappy` and `clawd` here and with `WEB=` pointing at a checkout of `main`, and compare.
   - Sheets like the other pets': the pose sheet, and the trick and state sheets from `framesheet.py`. Look at each.
9. **Open a PR** from your worktree against `main`, listing the sheets, then show Jay the sheets. Merge only when Jay has
   approved all of step 7. Report what the skin is, where its file is, and how it was checked. Don't run
   `./install.sh` unless asked: it touches the user's install.

## Tools

They are in `tools/` next to this file. Run them from the repo root.

| Command | What it gives you |
| --- | --- |
| `node .claude/skills/new-skin/tools/px.cjs web/skins/<key>.js <key> '[{}, {"face": 1}]'` | Each pose's pixels as JSON, from the skin file alone, no browser. The others build on it. |
| `node .claude/skills/new-skin/tools/px.cjs web/skins/<key>.js <key> sweep` | Every shared pose key, plus its own walk, trick frames and moods: pixels off the 44x40 grid (exits 1), poses not standing on row 39. |
| `python3 .claude/skills/new-skin/tools/sheet.py web/skins/<key>.js <key> out.png 8 '[{}]' rest --ref ref.png` | Poses at a scale (8 or 3), labelled, references first at matching height. `PER=8` a row. |
| `python3 .claude/skills/new-skin/tools/posesheet.py web/skins/<key>.js <key> out.png 5 [sections.json]` | The pose sheet: states, eyes, moving, hands. Pass sections.json (shape in the file) with its moods and own keys. |
| `python3 .claude/skills/new-skin/tools/ascii.py web/skins/<key>.js <key> '{}'` | The exact pixels as letters on a numbered grid, with a color legend, for reviewers. |
| `node .claude/skills/new-skin/tools/check.cjs <key> <dir>` | Every trick and state in headless Chrome on a fake clock (about 20 s); prints `{durations, problems}`, saves frames. `ONLY=dance,wave`, `DSF=2`, `WEB=<checkout>/web/pet.html`. |
| `python3 .claude/skills/new-skin/tools/framesheet.py <dir> out.png [name ...]` | Those frames as rows, one per trick or state (`PER=6` frames each), split into pages. |

Python needs Pillow. `check.cjs` uses puppeteer from the npx cache (`~/.npm/_npx/*/node_modules/puppeteer`), so the
repo needs no `package.json`; if there's none, run `npx -y puppeteer browsers install chrome-headless-shell` once.

Gotchas:
- A hidden Browser pane pauses `requestAnimationFrame`, so tricks don't play there. Use `check.cjs`, or in the page call
  `frame(performance.now())` every ~33 ms yourself.
- `python3 -m http.server` drops connections when `pet.html` loads its trick scripts at once; `check.cjs` opens the page
  from `file://` instead. Another session may hold the mockup ports in `.claude/launch.json`: add a private entry on a
  free port and don't commit it.
- If headless screenshots time out (seen while the display slept), read the pet's canvas back with
  `canvas.toDataURL()` instead; that misses page-only effects (portal rings, the web line, glows).
- `eyes: 'sad'` is also the paper plane's squint: draw tears from a key of its own, not from `sad`.
