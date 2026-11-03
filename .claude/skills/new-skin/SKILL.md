---
name: new-skin
description: Make a new Hangabout skin (a character the pet can be) from real references of that character, to the owner's bar, and check it. Use when someone in this repo asks to make, add or draw a new pet, skin or character for the pet, or to redo how one looks or moves.
---

# Make a new skin

Read `TRICKS.md` › Skins and › Making a skin first, then `web/skins/cappy.js` (the worked example) and the skin closest
to yours: an animal side on or three-quarters `chicken.js` or `pusheen.js`, front on `hatty.js`, a figure with arms
`clay.js`.

The owner (Jay) is not a pixel artist or an expert on the character, and this is a side project. You are the
researcher, art director and reviewer. Jay sees each stage only after it passes the review loop in step 5, and is asked
only what is genuinely Jay's call, always with your recommended answer. Keep the character bible, references and each
version's renders in your notes: the shared notes folder if the session has one, else the scratchpad.

1. **Scope it with Jay first**, in one message, a recommendation on each:
   - The canonical look, with a named source: the game or show, the version, the art (`Castle Crashers Blue Knight, his
     idle on the wiki`). Ask for any references Jay already has (images, a sprite rig): those are the ones to follow.
   - Size: rows tall out of the 40 (today's pets are 22 to 33). Tricks hop up to 8 rows, so a full-height pet clips;
     keep the head near rows 18 to 24 where tricks put hats and props, or plan to fit them.
   - Fan pack or not: someone else's character is fan art (`pack: 'fan'`, see TRICKS.md › Fan pack rules).
   - A key: lowercase letters and digits (`shovelknight`). The app drops anything else and falls back to Cappy.
   - Say what done means (don't ask it): the art; a model sheet and turnaround; its motion designed as key poses and
     timing before it's built; its own walk (`walk`); hands, paws or wings for each action; every `eyes` expression;
     Claude's states (`moods`); every trick audited at 2x against Cappy and tailored; props held in its hands; every fan
     costume fitted; its own tricks if any; a pose sheet, GIFs of its moves and trick sheets. Nothing merges until Jay
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
   cube) has no `head()`, wears Clawd's costume spots, and is fitted with skin branches in step 9 instead.
5. **Review each stage before Jay sees it**, in at most 3 rounds, with reviewer agents who each have a role and return
   findings, not scores. Scores drifted: an uncapped loop of fresh reviewers scoring 1-10 until all said 8+ ran Gengar
   24 rounds, his moods bouncing between 5 and 7.5. The capped loop took Domo through every stage in 2.
   - **Stages.** A, the look: the rest pose beside the references at 8x and 3x, and the ASCII grid. B1, the motion
     design (step 7): the model sheet, the turnaround, each action's key poses and timing chart, the blocked keys as
     GIFs and onion skins. B2, the body (step 8): the walk, every `eyes`, the hands, the moods, finished, as the pose
     sheet, GIFs at real size (`gif.py`), onion skins (`onion.py`) and each mood's frames with their ms
     (`moodstrips.py`). C, the tricks (step 9): every trick at 2x beside Cappy, then the ones you tailored.
   - **Roles**, one agent each:
     - likeness: would a fan know it at a glance, against the references and the bible;
     - craft: silhouette, outline, stray pixels and contrast at 3x;
     - motion: does each animation read as what it's called and move like this body, judged in playback (the GIFs) and
       onion skins, never from strips alone, against the principles in step 7: key poses that read in silhouette,
       anticipation, follow-through and overlap, arcs, timing and spacing, squash and stretch that keeps volume, loop
       seams, and flicker at real size;
     - breakage: what is wrong on it that is right on Cappy, such as a costume off its face or a prop not in its hand.

     Stage A gets likeness and craft, plus a blind ID check in round 1: only the 3x render, no name, "Which character is
     this?". Stage B1 gets motion and likeness on the keys and model sheet; B2 gets motion and craft (the cleanup pass).
     Stage C gets one breakage scan of every trick, then motion and craft on what you tailored.
   - **Round 1 is fresh**: the references, renders, ASCII grid and the bible's checklist, and none of your reasoning
     ("it's close"). Tell reviewers to measure the references themselves: Domo's bible had his width wrong, and one
     reviewer passed it on that.
   - **Rounds 2 and 3 resume the same reviewers** (`SendMessage` to each agent's id) with the new renders and, for each
     of their findings, what you did: fixed (how) or declined (why). They check their own findings, say better, same or
     worse, and raise a new blocker only if the change broke something. A resumed reviewer takes seconds and a few
     thousand tokens; a fresh one takes minutes and 100-200k.
   - **Brief** each one like this:

     > Review <what> for a small desktop pet: <character> (<source>), <rows> pixels tall on a 44x40 grid. Files:
     > <references>, <renders>, <ascii grid>, <the bible's checklist>. Your role: <ROLE>: <its question>. Not a
     > redesign: it stays this size. Return exactly this, no 1-10 scores. verdict: pass | fix | escalate. checklist:
     > each item yes/no and a note. blockers (max 3): what the owner would reject or what stops it reading as
     > <character>, each with what, where (grid x, y), why, and the pixel fix. should_fix (max 3): clearly off and
     > cheap, the same fields. nits: one line each. keep: what works. cant_at_this_size: what the grid can't show. Pass
     > means no blockers, not perfect; don't invent blockers. Under 400 words.
   - **Stop rules.**
     - Stop when no reviewer has a blocker. Fix the cheap should-fixes without another round.
     - Stop when the same blocker survives two rounds: take it to Jay with the options.
     - Stop after round 3: Jay sees it with the open list.
     - What the grid can't show goes to Jay, never into another round.
     - Reviewers split on a blocker: measure it yourself, decide, and say why. Two roles finding the same blocker on
       their own is the surest sign it's real; two reviewers with the same brief can disagree.
   - **Keep a log** in your notes: each round's verdicts, what you fixed or declined, and the agents' tokens.
   - **Your own look at a sheet is not a review.** On Domo the session skimmed every trick and called them fine; a fresh
     breakage scan found four costumes broken.
6. **Show Jay each stage once it passes**:
   - A: the rest pose beside its references, before you design moves on it;
   - B1: the model sheet, turnaround and key poses (GIFs of the blocked keys), before any in-betweens;
   - B2: the GIFs of its moves and the pose sheet;
   - C: the costume and trick sheets.

   Ask only what is Jay's call (a color variant, which of two canonical looks), each with the canonical answer you
   recommend and why. Never offer an option that's off model: a non-expert can't tell. Changes go back through that
   stage's loop before Jay sees them again.
7. **Design the motion before building it**, once the look is approved, from the references and the bible. Drawing
   finished frames straight away and letting review find the problems is how Iggy's walk slid, his raised foot read
   as a pitchfork and he dropped flat in one frame: none of it was designed. In order:
   1. **Model sheet**: the rest pose with its construction: proportions, each limb's length and where it joins (how far
      a paw can reach, and what it can't reach), where its face and hands are, the few identifying features every pose
      keeps, and its "never" rules (a raised limb stays a pixel off a face with no outline; the face never squashes).
      Its expressions are on it too. Every later frame is checked against it.
   2. **Turnaround**: the views it needs. A side-on skin facing left and right, and the in-between frame of a turn: the
      page draws one 90 ms `half: true` frame on every turn (`web/pet.html`, "Turning"), so give `half` a frame of its
      own (three-quarters, or face on) rather than a bare flip.
   3. **Thumbnails**: for each action (walk, hop, sit or lie down, wave, a raised hand, each mood's beats), a few small
      sketches of the key poses at 3x, exploring options; keep the one that reads in silhouette, and push it
      (exaggeration reads at this size; a subtle pose doesn't).
   4. **Block the keys**: the extremes and contacts of each action, as poses in the skin, played as a GIF on the keys
      alone (`gif.py ... <name> '<json>'`). Check the action and its intent read before anything is added.
   5. **Breakdowns and timing**: a timing chart per action in the bible: each key and breakdown with its ms, what leads
      and what follows by how many frames (overlap: a tail, ears or gear lag the body and settle after it stops),
      anticipation before every big move (a squash before a hop, a crouch before lying down), follow-through after it, the
      arc each part travels (a limb moves through at least one breakdown between positions, never snaps), holds, and
      the spacing: frames bunched near the keys ease in and out. Squash and stretch keep its volume.
   6. **In-betweens** only where the spacing needs them, each checked against the model sheet in onion skins
      (`onion.py`). More frames don't make it fluid; better keys and timing do.

   This is stage B1: reviewed (step 5) and shown to Jay before step 8.
8. **Build it and clean it up**: the keys, breakdowns and in-betweens in the skin, as charted.
   - `walk(now, dir, arms)`: its stride, bob, sway and arm swing (also used to climb), keyed on contact, down, passing
     and up poses, its planted feet pushing back so it doesn't slide.
   - `moods`: its own poses for each of Claude's states in `MOODS` (`web/pet.html`). `editing` and `running` are props
     it works at, posed by the prop: check its hands read there.
   - Hands for every `arms`, `hand` and `reach` value, and its own face for every `eyes` value.
   - The cleanup pass, at real size (`gif.py` at scale 3): pixel clusters kept clean, no accidental flicker (a pixel or
     edge that toggles frame to frame with no motion behind it), loops that join without a hitch, and every frame
     checked against the model sheet.

   This is stage B2.
9. **Fit the tricks** once the body is approved:
   - Audit every trick at 2x beside Cappy (`DSF=2` runs of `check.cjs` on `cappy` and on `<key>`, then `framesheet.py`)
     through step 5's stage C: a fresh breakage scan of every trick, then motion and craft on what you tailor. A frames-only trick gets `tricks: {name: frames}` in the skin (keep the
     trick's pose key where its draw hooks need it). A trip (sneak, fishing, the paper plane...) or a trick that draws props or a
     costume gets a `hangabout.skin === '<key>'` branch in its file, as Hatty's and the chicken's do (`fan/vader.js`,
     `core/coffee.js`): props go where its hand is drawn, costumes per TRICKS.md › Costumes on every skin. A front-on skin
     with `head()` gets no costume for free: they branch for side on, Hatty and Domo, so it needs its own branch in
     `vader`, `thorfinn`, `guts`, `spidey`, `powerUp` and `ghost` (Domo's are the closest). Separate trick files can go
     to parallel agents, one file each, each comparing the other skins' frames before and after with `cmp`.
   - Its own tricks, if the source has moves worth one: pitch a list first, Jay picks, then the new-trick skill.
10. **Check everything** before asking Jay to approve:
    - Pose sweep (`px.cjs ... sweep`): no pixels off the grid, and every pose it says floats has a foot up on purpose.
    - Headless run (`check.cjs <key>`): every trick (Fan pack on) and every Claude state; `problems` must be empty (it
      includes the page's asserts: lowest pixel on row 39, `head()` finds the eye). If you edited a trick file, run it
      with `ONLY=<tricks>` on `cappy` and `clawd` here and with `WEB=` pointing at a checkout of `main`, and compare.
    - Sheets like the other pets': the pose sheet, the GIFs of its moves, and the trick and state sheets from
      `framesheet.py`. Look at each.
11. **Open a PR** from your worktree against `main`, listing the sheets, then show Jay the sheets. Merge only when Jay
    has approved steps 7 to 9. Report what the skin is, where its file is, and how it was checked. Don't run
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
| `python3 .claude/skills/new-skin/tools/moodstrips.py web/skins/<key>.js <key> <dir> <prefix>` | Each of its moods' frames in order with their ms, and its walk, as strips at 3x: what the motion reviewer judges (`check.cjs` keeps too few state frames). |
| `python3 .claude/skills/new-skin/tools/gif.py web/skins/<key>.js <key> <dir> [3] [name '<json [[pose, ms], ...]>']` | Playback: its walk each way, a turn (with the half-turn frame) and each mood as looping GIFs, at scale 3 (its real size) unless given; plus any sequence you name, such as blocked keys. What motion is judged in. |
| `python3 .claude/skills/new-skin/tools/onion.py web/skins/<key>.js <key> out.png <walk-L \| turn \| mood-<name> \| '<json>'> [6]` | Onion skins: each frame over a ghost of the one before, then all frames stacked, poses marked `"key": true` solid. Shows arcs and spacing. |
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
