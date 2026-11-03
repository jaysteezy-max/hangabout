# python3 onion.py <skin.js> <key> <out.png> <walk-L | turn | mood-<name> | '<json [[pose, ms], ...]>'> [scale]: onion skins
# for spacing and arcs. Each frame over a faint ghost of the one before it, labelled with its ms, then every frame stacked
# in one last cell: the path each part travels, and whether the spacing eases in and out of the keys. Poses with
# "key": true (the skin ignores it) are drawn solid in that last cell, the rest faint.
import json, os, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gif import sequences, frames

skin, key, out, which = sys.argv[1:5]
S = int(sys.argv[5]) if len(sys.argv) > 5 else 6
seq = json.loads(which) if which.startswith('[') else sequences(skin, key)[which]
BG = (244, 242, 236)
ims = [im.convert('RGBA') for im in frames(skin, key, seq, S, '#F4F2EC')]
w, h = ims[0].size


def faint(im, a):
    """Its pet pixels at alpha a, the backdrop clear."""
    px = [(r, g, b, int(255 * a) if (r, g, b) != BG else 0) for r, g, b, _ in im.getdata()]
    f = Image.new('RGBA', im.size); f.putdata(px); return f


cells = []
for i, im in enumerate(ims):
    c = Image.new('RGBA', (w, h), BG + (255,))
    if i: c.alpha_composite(faint(ims[i - 1], .3))
    c.alpha_composite(faint(im, 1)); cells.append((c, f'{i} · {seq[i][1]} ms'))
stack = Image.new('RGBA', (w, h), BG + (255,))
for (p, _), im in sorted(zip(seq, ims), key=lambda t: bool(t[0][0].get('key'))):
    stack.alpha_composite(faint(im, 1 if p.get('key') else .22))
cells.append((stack, 'all frames'))
per = int(os.environ.get('PER', '8')); rows = [cells[i:i + per] for i in range(0, len(cells), per)]
sheet = Image.new('RGB', (min(per, len(cells)) * (w + 10) + 10, len(rows) * (h + 26) + 10), 'white'); d = ImageDraw.Draw(sheet)
for r, row in enumerate(rows):
    for c, (im, label) in enumerate(row):
        x, y = 10 + c * (w + 10), 10 + r * (h + 26)
        sheet.paste(im.convert('RGB'), (x, y)); d.text((x, y + h + 4), label, fill='black')
sheet.save(out); print(out, sheet.size)
