# python3 posesheet.py <skin.js> <key> <out.png> [scale] [sections.json]: his poses in sections, like the other pets' pose sheets.
import os, sys, json, subprocess
from PIL import Image, ImageDraw
skin, key, out = sys.argv[1:4]; S = int(sys.argv[4]) if len(sys.argv) > 4 else 5
R = 1  # facing right; -1 if his reference faces left
# The shared pose keys. For a new pet, write sections.json in this shape ([[title, [[label, pose], ...]], ...]) with his own
# moods in the first section and a section for his own keys (a sword, wings, a cane), so the sheet shows him, not Clawd.
SECTIONS = [
  ('What Claude is doing', [('Idle', {}), ('Thinking', {'arms': ['mid', 'up'], 'eyes': 'up'}), ('Editing', {'eyes': 'side', 'look': R, 'hand': 5}),
    ('Running', {'eyes': 'side', 'look': R, 'hand': 6, 'reach': 2}), ('Needs you', {'eyes': 'up', 'arms': ['mid', 'high']}),
    ('Done', {'arms': ['up', 'up'], 'eyes': 'happy'}), ('Blocked', {'squash': 2, 'arms': ['cross', 'cross'], 'eyes': 'sad'}), ('Napping', {'eyes': 'blink', 'squash': 1})]),
  ('Eyes', [(e, {'eyes': e}) for e in ['blink', 'happy', 'sad', 'angry', 'strain', 'dizzy', 'up']] + [('side', {'eyes': 'side', 'look': -1})]),
  ('Moving', [('crouch', {'squash': 2}), ('hop', {'dy': -6, 'tuck': 1, 'arms': ['up', 'up']}), ('stretch', {'stretch': 2, 'arms': ['high', 'high'], 'eyes': 'blink'}),
    ('walk left', {'face': -1, 'lift': [0, 3], 'swing': 1}), ('walk left 2', {'face': -1, 'dy': -1, 'swing': -1}),
    ('walk right', {'lift': [0, 3], 'swing': 1}), ('tap foot', {'tapLeg': 1, 'eyes': 'down'}), ('jab', {'dy': -2, 'hand': 6, 'reach': 2})]),
  ('Hands', [('wave', {'arms': ['mid', 'high'], 'eyes': 'up'}), ('cheer', {'arms': ['high', 'high'], 'eyes': 'happy'}), ('arms crossed', {'arms': ['cross', 'cross']}),
    ('fist up', {'arms': ['up', 'mid']}), ('arms down', {'arms': ['down', 'down']}), ('hand at chin', {'hand': 3}), ('hand low', {'hand': 10})]),
]
if len(sys.argv) > 5: SECTIONS = json.load(open(sys.argv[5]))
poses = [dict({'face': R}, **p) for _, ps in SECTIONS for _, p in ps]
r = json.loads(subprocess.check_output(['node', os.path.join(os.path.dirname(__file__), 'px.cjs'), skin, key, json.dumps(poses)]))
W, H, pad, top = 44 * S, 40 * S, 10, 28
per = max(len(ps) for _, ps in SECTIONS)
sheet = Image.new('RGB', (pad + per * (W + pad), sum(top + H + 22 for _ in SECTIONS) + pad), '#FFFFFF'); d = ImageDraw.Draw(sheet)
i, y = 0, 0
for title, ps in SECTIONS:
    d.text((pad + 2, y + 10), title, fill='#222'); y += top
    for c, (label, _) in enumerate(ps):
        x = pad + c * (W + pad); d.rectangle([x, y, x + W - 1, y + H - 1], fill='#ECECF1')
        for px, py, col in r['out'][i]:
            if 0 <= px < 44 and 0 <= py < 40: d.rectangle([x + px * S, y + py * S, x + px * S + S - 1, y + py * S + S - 1], fill=col)
        d.line([x, y + H, x + W, y + H], fill='#999'); d.text((x + 4, y + H + 5), label, fill='#333'); i += 1
    y += H + 22
sheet.save(out); print(out, sheet.size)
