# Contributing

Thanks for wanting to make Clawd better. New tricks, fixes, and ideas are all welcome.

## Getting set up

You need a Mac with Apple's command line tools (`xcode-select --install`). No other dependencies.

```bash
git clone https://github.com/jaysteezy-max/hangabout.git && cd hangabout
python3 -m http.server -d web   # then open http://localhost:8000/pet.html
```

The mockup in your browser is the pet itself on a pretend desktop, with buttons for every Claude state, behavior
preset and trick. Most work happens there. To try the real app, `./install.sh` (rerun it after each change; it
rebuilds in a few seconds). `./build.sh` alone builds into `./build` without installing.

## Adding a trick

Read [TRICKS.md](TRICKS.md). In short: one file in `web/tricks/`, one `<script>` line in `web/pet.html`, a label so it
shows up in the menu. If you use Claude Code, the repo has a `new-trick` skill: ask Claude to "make a new trick" and it
scaffolds the file for you.

Original characters and ideas go in `web/tricks/core/`. Tricks that depict someone else's character go in
`web/tricks/fan/`, follow the [fan pack rules](TRICKS.md#fan-pack-rules), and are off unless people turn the fan pack
on.

## Before you open a pull request

- `python3 scripts/test_hooks.py` passes (it checks the settings.json helper).
- If you touched the hook, `python3 scripts/test_hook.py` passes (it plays turns through it, interrupts included).
- Every changed script parses: `for f in web/tricks/*/*.js; do node --check "$f"; done` if you have Node.
- The mockup's console is free of errors, your trick plays from its button, and it still looks right with Reduce
  motion on.
- Match the code around you: small, plain, with comments that say why rather than what.
- Keep Hangabout local: no network requests, no telemetry, and nothing that slows down or changes what Claude Code does.
  The hook must keep printing nothing and exiting 0.
- One topic per pull request, with a sentence or two on what it does and how you checked it. A GIF or screenshot of a
  new trick helps a lot.

## Reporting bugs

Open an issue with your macOS version, what you did, what you expected, and what happened. If it's about what the status
bubble says, the last few lines of `~/.hangabout/state.json` help (check them for anything private first).

## Be kind

Be patient and generous with each other; this is a project for fun.
