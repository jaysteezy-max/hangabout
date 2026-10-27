"""Round trip for hooks.py: add twice, check, remove, and everything that isn't hookpet's comes back untouched.

    python3 scripts/test_hooks.py
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
run = lambda *a: subprocess.run([sys.executable, os.path.join(HERE, 'hooks.py'), *a]).returncode

with tempfile.TemporaryDirectory() as d:
    path, hook = os.path.join(d, 'settings.json'), '/Users/someone/My Stuff/.claude/hookpet/hookpet-hook'
    theirs = {'theme': 'dark', 'hooks': {'PreToolUse': [{'matcher': 'Bash', 'hooks': [{'type': 'command', 'command': 'lint.sh'}]}],
                                         'Stop': [{'hooks': [{'type': 'command', 'command': 'say done'}]}]}}
    json.dump(theirs, open(path, 'w'))
    assert run('check', path, hook) == 1
    assert run('add', path, hook) == 0 and run('add', path, hook) == 0  # twice: no duplicates
    s = json.load(open(path))
    assert run('check', path, hook) == 0
    assert len(s['hooks']) == 10 and len(s['hooks']['Stop']) == 2 and len(s['hooks']['SessionStart']) == 1, s
    assert s['hooks']['SessionStart'][0]['hooks'][0]['command'] == "'/Users/someone/My Stuff/.claude/hookpet/hookpet-hook'"  # quoted: the path has a space
    assert s['hooks']['PreToolUse'][0] == theirs['hooks']['PreToolUse'][0]
    assert run('remove', path, hook) == 0
    assert json.load(open(path)) == theirs, json.load(open(path))

    open(path, 'w').write('{"theme": "dark",')  # broken JSON: refused, left alone
    assert run('add', path, hook) != 0 and open(path).read() == '{"theme": "dark",'

    fresh = os.path.join(d, 'none.json')  # no settings file yet
    assert run('add', fresh, hook) == 0 and run('check', fresh, hook) == 0
    assert run('remove', fresh, hook) == 0 and json.load(open(fresh)) == {}
print('hooks.py: ok')
