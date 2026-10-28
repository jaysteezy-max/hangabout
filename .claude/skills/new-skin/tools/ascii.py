# python3 ascii.py <skin.js> <key> '<pose json>' -> the grid as letters, x across, y down
import os, sys, json, subprocess
r = json.loads(subprocess.check_output(['node', os.path.join(os.path.dirname(__file__), 'px.cjs'), sys.argv[1], sys.argv[2], '[' + sys.argv[3] + ']']))
px = r['out'][0]; cols = sorted({c for _, _, c in px}); key = {}
names = '#BLDweascktpPyqrsuvz'
for c in cols: key[c] = '#' if c == '#000000' else names[len(key) + (0 if '#000000' in key else 1)]
g = [['.'] * 44 for _ in range(40)]
for x, y, c in px:
    if 0 <= x < 44 and 0 <= y < 40: g[y][x] = key[c]
print('    ' + ''.join(str(x // 10) for x in range(44))); print('    ' + ''.join(str(x % 10) for x in range(44)))
for y, row in enumerate(g): print('%3d ' % y + ''.join(row))
print('legend:', ', '.join(f'{v}={k}' for k, v in key.items()))
