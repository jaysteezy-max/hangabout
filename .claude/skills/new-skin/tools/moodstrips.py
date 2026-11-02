# python3 moodstrips.py <skin.js> <key> <outdir> <prefix>: each of his moods' frames in order (intro, and rest when it differs),
# labelled with how long each holds, and four steps of his walk each way (STEP ms apart, default 160), as strips at 3x:
# <outdir>/<prefix>-mood-<name>.png. For the motion reviewer: check.cjs's state captures are too few frames to judge motion.
import json, os, subprocess, sys
skin, key, outdir, prefix = sys.argv[1:5]
js = '''const vm = require("vm"), fs = require("fs"); global.SKINS = {}; vm.runInThisContext(fs.readFileSync(process.argv[1], "utf8"))
const s = SKINS[process.argv[2]], out = {}, step = +process.env.STEP || 160
for (const [n, m] of Object.entries(s.moods || {})) for (const [k, seq] of [["", m.intro], ["-rest", m.rest !== m.intro && m.rest]]) if (seq) out[n + k] = seq.map(([p, ms]) => [p, n + " " + ms])
if (s.walk) out.walk = [-1, 1].flatMap(d => [0, 1, 2, 3].map(i => [s.walk(i * step, d), "walk " + (d < 0 ? "L" : "R") + i]))
console.log(JSON.stringify(out))'''
moods = json.loads(subprocess.check_output(['node', '-e', js, skin, key]))
sheet = os.path.join(os.path.dirname(__file__), 'sheet.py')
for name, fr in moods.items():
    subprocess.run(['python3', sheet, skin, key, os.path.join(outdir, f'{prefix}-mood-{name}.png'), '3', json.dumps([p for p, _ in fr])] + [l for _, l in fr],
                   check=True, env={**os.environ, 'PER': '11'})
