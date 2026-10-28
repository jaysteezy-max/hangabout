# python3 sheet.py <skin.js> <key> <out.png> <scale> '<json poses>' [labels...] [--ref ref.png ...]: his poses at a scale, references first (PER=8 a row)
import os, sys, json, subprocess
from PIL import Image, ImageDraw
skin, key, out, S, poses = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), sys.argv[5]
rest = sys.argv[6:]
REFS = []
while '--ref' in rest: i = rest.index('--ref'); REFS.append(rest[i + 1]); del rest[i:i + 2]
labels = rest
r = json.loads(subprocess.check_output(['node', os.path.join(os.path.dirname(__file__), 'px.cjs'), skin, key, poses]))
W, H = 44 * S, 40 * S
cells = []
for px in r['out']:
    im = Image.new('RGB', (W, H), '#F4F2EC'); d = ImageDraw.Draw(im)
    for x in range(0, W, S):
        for y in range(0, H, S):
            if (x // S + y // S) % 2: d.rectangle([x, y, x + S - 1, y + S - 1], fill='#ECE9E1')
    for x, y, c in px:
        if 0 <= x < 44 and 0 <= y < 40: d.rectangle([x * S, y * S, x * S + S - 1, y * S + S - 1], fill=c)
        else: print('off grid', x, y, file=sys.stderr)
    cells.append(im)
for n, rp in enumerate(REFS):
    ref = Image.open(rp).convert('RGB')
    k = H / ref.height
    cells.insert(n, ref.resize((round(ref.width * k), H), Image.LANCZOS)); labels.insert(n, 'reference')
pad = 22; per = int(os.environ.get('PER', '8'))
rows = [cells[i:i + per] for i in range(0, len(cells), per)]
cw = max(c.width for c in cells); ch = max(c.height for c in cells) + 18
sheet = Image.new('RGB', (min(per, len(cells)) * (cw + pad) + pad, len(rows) * (ch + pad) + pad), '#FFFFFF')
d = ImageDraw.Draw(sheet)
for r, row in enumerate(rows):
    for c, im in enumerate(row):
        n = r * per + c; x, y = pad + c * (cw + pad), pad + r * (ch + pad)
        sheet.paste(im, (x, y)); d.text((x, y + im.height + 4), labels[n] if n < len(labels) else '', fill='#222')
sheet.save(out); print(out, sheet.size)
