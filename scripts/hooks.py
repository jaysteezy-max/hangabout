"""Adds, removes or checks Hangabout's hooks in a Claude Code settings.json, leaving everything else as it was.

    python3 scripts/hooks.py add|remove|check <settings.json> <path to hangabout-hook>

check exits 0 when every event already runs the hook, 1 when not. A settings file that isn't valid JSON is never written.
"""
import json, os, shlex, sys, tempfile

EVENTS = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'PostToolUseFailure',
          'PermissionRequest', 'Notification', 'Stop', 'StopFailure', 'SessionEnd']


NAMES = ('hangabout-hook', 'hookpet-hook')  # hookpet-hook: its name before the rename; add swaps those out, remove takes them too


def is_ours(hook, names=NAMES[:1]):
    try:
        return os.path.basename(shlex.split(hook.get('command', ''))[0]) in names
    except (ValueError, IndexError):
        return False


def has(settings, event):
    return any(is_ours(h) for group in settings.get('hooks', {}).get(event, []) for h in group.get('hooks', []))


def add(settings, command):
    remove(settings, NAMES[1:])
    hooks = settings.setdefault('hooks', {})
    for event in EVENTS:
        if not has(settings, event):
            hooks.setdefault(event, []).append({'hooks': [{'type': 'command', 'command': command, 'timeout': 10}]})


def remove(settings, names=NAMES):
    hooks = settings.get('hooks', {})
    for event in list(hooks):
        groups = [{**g, 'hooks': [h for h in g.get('hooks', []) if not is_ours(h, names)]} for g in hooks[event]]
        hooks[event] = [g for g in groups if g['hooks']]
        if not hooks[event]:
            del hooks[event]
    if 'hooks' in settings and not hooks:
        del settings['hooks']


def main():
    action, path, hook = sys.argv[1:4]
    try:
        with open(path) as f:
            settings = json.load(f)
    except FileNotFoundError:
        settings = {}
    except json.JSONDecodeError as e:
        sys.exit(f'{path} is not valid JSON ({e}); fix it first, nothing was changed.')
    if action == 'check':
        sys.exit(0 if all(has(settings, e) for e in EVENTS) else 1)
    add(settings, shlex.quote(hook)) if action == 'add' else remove(settings)
    # Written to a temporary file and swapped in, so a crash can't leave half a settings file.
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(path)))
    with os.fdopen(fd, 'w') as f:
        json.dump(settings, f, indent=2, ensure_ascii=False)
        f.write('\n')
    if os.path.exists(path):
        os.chmod(tmp, os.stat(path).st_mode & 0o777)
    os.replace(tmp, path)


if __name__ == '__main__':
    main()
