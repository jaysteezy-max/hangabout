# python3 gif.py <skin.js> <key> <outdir> [scale] [name '<json [[pose, ms], ...]>' ...]: playback to judge motion by
# (weight, timing, loop seams, flicker), not strips. Its walk each way, a turn (with the page's half-turned frame) and each
# of its moods (intro, then rest) and its own trick frames, plus any sequences you name (blocked key poses, a trick's frames), as looping GIFs at
# a scale: 3 (the default) is its real size on screen at Size 1. <outdir>/<key>-<name>.gif. BG=#hex for the backdrop.
import json, os, subprocess, sys
from PIL import Image

JS = '''const vm = require("vm"), fs = require("fs"); global.SKINS = {}; global.GW = 44; global.GH = 40
vm.runInThisContext(fs.readFileSync(process.argv[1], "utf8")); const s = SKINS[process.argv[2]], out = {}
if (s.walk) for (const d of [-1, 1]) out["walk-" + (d < 0 ? "L" : "R")] = [...Array(48)].map((_, i) => [s.walk(i * 33, d), 33])
out.turn = [[{face: -1}, 700], [{face: 1, half: true}, 90], [{face: 1}, 700], [{face: -1, half: true}, 90]]
for (const [n, m] of Object.entries(s.moods || {})) out["mood-" + n] = [...m.intro, ...(m.rest !== m.intro ? m.rest : [])]
for (const [n, f] of Object.entries(s.tricks || {})) out["trick-" + n] = f
console.log(JSON.stringify(out))'''


def sequences(skin, key):
    """Its walk, a turn and its moods as {name: [[pose, ms], ...]}, poses held for as long as they don't change."""
    out = {}
    for name, seq in json.loads(subprocess.check_output(['node', '-e', JS, skin, key])).items():
        merged = []
        for p, ms in seq:
            if merged and merged[-1][0] == p: merged[-1][1] += ms
            else: merged.append([p, ms])
        out[name] = merged
    return out


def pixels(skin, key, poses):
    """Each pose's [[x, y, color], ...], from px.cjs."""
    px = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'px.cjs')
    return json.loads(subprocess.check_output(['node', px, skin, key, json.dumps(poses)]))['out']


def frames(skin, key, seq, S, bg):
    """The sequence as RGB images at scale S, all cropped to the box every frame fits in."""
    out = pixels(skin, key, [p for p, _ in seq])
    xs = [x for f in out for x, _, _ in f]; ys = [y for f in out for _, y, _ in f]
    x0, y0, x1, y1 = max(0, min(xs) - 2), max(0, min(ys) - 2), min(44, max(xs) + 3), min(40, max(ys) + 3)
    ims = []
    for f in out:
        im = Image.new('RGB', ((x1 - x0) * S, (y1 - y0) * S), bg)
        for x, y, c in f:
            if x0 <= x < x1 and y0 <= y < y1: im.paste(c, ((x - x0) * S, (y - y0) * S, (x - x0) * S + S, (y - y0) * S + S))
        ims.append(im)
    return ims


if __name__ == '__main__':
    skin, key, outdir = sys.argv[1:4]
    S = int(sys.argv[4]) if len(sys.argv) > 4 else 3
    seqs = sequences(skin, key)
    for i in range(5, len(sys.argv) - 1, 2): seqs[sys.argv[i]] = json.loads(sys.argv[i + 1])
    os.makedirs(outdir, exist_ok=True)
    for name, seq in seqs.items():
        ims, path = frames(skin, key, seq, S, os.environ.get('BG', '#2B2B2E')), os.path.join(outdir, f'{key}-{name}.gif')
        ims[0].save(path, save_all=True, append_images=ims[1:], duration=[max(20, ms) for _, ms in seq], loop=0, disposal=1)
        print(path, len(ims), 'frames', sum(ms for _, ms in seq), 'ms')
