"""Plays Claude Code turns through the real hangabout-hook and checks what Clawd would show, interrupts included.

    python3 scripts/test_hook.py

Builds the hook into a temporary folder first (a few seconds; needs Apple's command line tools).
"""
import json, os, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
MARK, TOOL_MARK = '[Request interrupted by user]', '[Request interrupted by user for tool use]'

with tempfile.TemporaryDirectory() as d:
    hook = os.path.join(d, 'hangabout-hook')
    subprocess.run(['swiftc', '-o', hook, os.path.join(HERE, '..', 'app', 'HangaboutHook.swift')], check=True)
    transcript = os.path.join(d, 'transcript.jsonl')

    def send(name, **extra):
        event = {'hook_event_name': name, 'session_id': 's', 'cwd': '/code/app', 'transcript_path': transcript, **extra}
        r = subprocess.run([hook], input=json.dumps(event).encode(), capture_output=True)
        assert r.returncode == 0 and not r.stdout and not r.stderr, r  # never blocks or talks to Claude Code

    def write(*entries):  # appends transcript lines the way Claude Code does
        with open(transcript, 'a') as f:
            for e in entries:
                f.write(json.dumps({'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime()) + '.%03dZ' % (time.time() % 1 * 1000), **e}) + '\n')

    def said(text, kind='text'):
        item = {'type': 'text', 'text': text} if kind == 'text' else {'type': 'tool_result', 'tool_use_id': 't', 'content': text}
        return {'type': 'user', 'message': {'role': 'user', 'content': [item]}}

    def state():
        return json.load(open(os.path.join(d, 'state.json')))['sessions'].get('s', {})

    def turn(prompt='fix it'):
        open(transcript, 'w').close()
        send('UserPromptSubmit', prompt=prompt)
        write({'type': 'user', 'message': {'role': 'user', 'content': prompt}})
        time.sleep(.01)  # the interrupt comes after the last hook

    def poke():  # what the app sends when a busy session's transcript changes with no hook
        send('TranscriptChanged', cwd=None, transcript_path=None)

    # A normal turn ends in done.
    turn(); send('PreToolUse', tool_name='Bash', tool_input={'command': 'npm test'})
    assert state()['mood'] == 'running'
    send('PostToolUse', tool_name='Bash', tool_input={'command': 'npm test'}, duration_ms=1200); send('Stop')
    assert state()['mood'] == 'done', state()
    assert not state()['turn'].get('fails') and state()['turn']['cmds'] == 1, state()['turn']

    # A failed command is counted for the turn (no celebration); an interrupt isn't a failure.
    turn(); send('PreToolUse', tool_name='Bash', tool_input={'command': 'npm test'})
    send('PostToolUseFailure', tool_name='Bash', tool_input={'command': 'npm test'}, duration_ms=900)
    send('PreToolUse', tool_name='Bash', tool_input={'command': 'npm test'})
    send('PostToolUseFailure', tool_name='Bash', tool_input={'command': 'npm test'}, is_interrupt=True)
    assert state()['turn']['fails'] == 1, state()['turn']
    turn(); assert not state()['turn'].get('fails'), 'a new turn starts clean'

    # Interrupted mid-thought: no hook at all, only the transcript says so.
    turn(); write({'type': 'queue-operation'}); poke()
    assert state()['mood'] == 'thinking', 'a transcript change alone must not stop him'
    write(said(MARK), {'type': 'last-prompt'}); poke()
    s = state()
    assert s['mood'] == 'idle' and s['detail'] == 'interrupted' and s['call'] == '', s
    assert s['project'] == 'app', 'the app\'s poke has no cwd; the project must stay'

    # Interrupted while editing, running a command, or waiting on a permission or a question.
    for start in [lambda: send('PreToolUse', tool_name='Edit', tool_input={'file_path': '/a/page.mts', 'old_string': 'a', 'new_string': 'b'}),
                  lambda: send('PreToolUse', tool_name='Bash', tool_input={'command': 'sleep 99'}),
                  lambda: send('PermissionRequest', tool_name='Bash', tool_input={'command': 'rm -r build'}),
                  lambda: send('PreToolUse', tool_name='AskUserQuestion', tool_input={'questions': [{'question': 'Which?'}]})]:
        turn(); start(); busy = state()['mood']
        assert busy in ('editing', 'running', 'waiting'), busy
        time.sleep(.01); write(said(TOOL_MARK, 'tool_result'), said(MARK)); poke()
        assert state()['mood'] == 'idle', (busy, state())

    # Interrupted, then a new prompt before the app looked: the old interrupt mustn't stop the new turn.
    turn(); write(said(MARK)); time.sleep(.01)
    send('UserPromptSubmit', prompt='try again'); poke()
    assert state()['mood'] == 'thinking', state()

    # An interrupt quoted inside a tool's output (another session's transcript, say) is not this session's.
    turn(); send('PreToolUse', tool_name='Read', tool_input={'file_path': '/a/log.txt'})
    write(said('Session "x" (idle)\n[user] ' + MARK, 'tool_result')); poke()
    assert state()['mood'] == 'thinking', state()

    # A subagent stopped on its own leaves the main turn running.
    turn(); write({**said(MARK), 'isSidechain': True}); poke()
    assert state()['mood'] == 'thinking', state()

    # A finished turn stays finished, and a missing transcript is shrugged off.
    turn(); send('Stop'); write(said(MARK)); poke()
    assert state()['mood'] == 'done', state()
    turn(); os.remove(transcript); poke()
    assert state()['mood'] == 'thinking', state()

    # Interrupts the hooks do report still work: an interrupted tool call.
    turn(); send('PreToolUse', tool_name='Bash', tool_input={'command': 'sleep 99'})
    send('PostToolUseFailure', tool_name='Bash', tool_input={'command': 'sleep 99'}, is_interrupt=True)
    assert state()['mood'] == 'idle' and state()['detail'] == 'interrupted', state()
print('hangabout-hook: ok')
