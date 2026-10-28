# python3 framesheet.py <rundir> <out.png> [name ...]: check.cjs's frames, one row per trick or state (all of them, or the
# names given), up to PER (6) frames spread over each. Works on 1x and DSF=2 runs; long runs split into out-1.png, out-2.png...
import os, sys, re, collections
from PIL import Image, ImageDraw
run, out, names = sys.argv[1], sys.argv[2], sys.argv[3:]
groups = collections.OrderedDict()
for f in sorted(os.listdir(run), key=lambda f: os.path.getmtime(os.path.join(run, f))):
    groups.setdefault(re.sub(r'-(t\d+|\d)\.png$', '', f), []).append(f)
rows = [n for n in (names or groups) if n in groups]
k = Image.open(os.path.join(run, groups[rows[0]][0])).width // 300  # check.cjs shoots 300x200 points around him
W, H, per, page = 220 * k, 150 * k, int(os.environ.get('PER', '6')), 8
for p in range(0, len(rows), page):
    part = rows[p:p + page]
    img = Image.new('RGB', (110 + per * W, len(part) * H), '#141413'); d = ImageDraw.Draw(img)
    for r, n in enumerate(part):
        fs = groups[n]; pick = [fs[round(i * (len(fs) - 1) / (per - 1))] for i in range(per)] if len(fs) > per else fs
        d.text((4, r * H + H // 3), n, fill='#ecebe6')
        for c, f in enumerate(pick): img.paste(Image.open(os.path.join(run, f)).crop((40 * k, 25 * k, 260 * k, 175 * k)), (110 + c * W, r * H))
    name = out if len(rows) <= page else out.replace('.png', f'-{p // page + 1}.png')
    img.save(name); print(name, img.size)
