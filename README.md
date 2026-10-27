# hookpet

A desktop pet for macOS that shows what Claude Code is doing.

Clawd, Claude Code's pixel mascot, lives on top of your windows. He walks along the Dock and the top edges of your
windows, rides a window when you drag it, hangs from a maximized one, climbs the sides of the screen and phases through
its edges. A small text box beside him says what Claude is up to (thinking, editing a file, running a command, waiting
on you, done), fed by [Claude Code hooks](https://code.claude.com/docs/en/hooks). When nobody needs him he fidgets,
naps and now and then does a trick.

> **Unofficial fan project.** Not affiliated with, endorsed by or sponsored by Anthropic. Claude, Claude Code and Clawd
> are Anthropic's. The optional fan pack is fan art of other people's characters (see [Fan pack](#fan-pack)).

## Install

You need a Mac and [Claude Code](https://code.claude.com). hookpet is built from source on your Mac with Apple's free
command line tools; the installer offers to install them if they're missing.

```bash
git clone https://github.com/jaysteezy-max/hookpet.git && cd hookpet && ./install.sh
```

The installer:

1. builds the app and its hook into `~/.claude/hookpet` and starts the pet;
2. shows you the hooks it wants to add to `~/.claude/settings.json` and **asks first**. If you say yes, it backs that
   file up (`settings.json.hookpet-backup-<time>`) and adds one command to ten events, leaving everything else as it was.

Run `./install.sh` again any time to update. `./install.sh --add-hooks` adds the hooks without asking, for when you've
already decided. The hooks work in Claude Code sessions started after they're added.

### Or as a Claude Code plugin

```text
/plugin marketplace add jaysteezy-max/hookpet
/plugin install hookpet@hookpet
```

The plugin brings its own hooks, so hookpet never edits your settings (Claude Code itself records that the plugin is
on). The first session you start afterwards builds hookpet into the plugin's data folder (a few seconds; it also needs
the command line tools) and starts the pet.

Use the plugin **or** `install.sh`, not both: with both you get two pets. If the pet never shows up with the plugin, your
Claude Code may be set to skip plugin hooks (an organization's `allowManagedHooksOnly` policy, or a host app's own plugin
security layer). Use `install.sh` instead.

## Using him

| Do this | He does this |
| --- | --- |
| Hover him | Wiggles and opens his box for a peek |
| Click him | Pins his box open with your recent tool calls; Esc or a click elsewhere closes it |
| Drag him | Dangles from your cursor; shake him and he gets dizzy |
| Double-click | Hops |
| Click a window | Notices, with a little "!" |
| Right-click | Tricks, Behavior, Size, Chirp when Claude needs you, Reduce motion, Fan pack, Quit |

What the box shows:

| Claude Code is… | Clawd | The box |
| --- | --- | --- |
| Thinking | Hand on chin, a spinning star | Opens for each new plan step |
| Editing | Typing, + and − floating up | Lines added and removed |
| Running a command | Tapping a foot | The command and how long it's run |
| Waiting on you | Hand up, hopping, glowing | Stays open until you answer |
| Done | A happy hop and confetti | Opens briefly: files and commands this turn |
| Stopped on an error | Arms crossed, glitching | Stays open with the reason |
| Quiet for half an hour | Napping | Closed |

With several Claude Code sessions open he follows the one that needs you most: waiting on you, then stuck, then busy,
then the latest.

## Behavior presets

Right-click → **Behavior** sets how busy he is when Claude doesn't need him. Your choice is saved.

| Preset | What it's like |
| --- | --- |
| **Calm** | Mostly lingers and strolls. Long pauses, slow walks, rare tricks, hardly ever leaves the floor. |
| **Normal** | The default mix of wandering, fidgets, jumps to windows and trips to the screen's edges. |
| **Erratic** | Barely sits still. Fast trots, lots of jumping and hanging, edge trips and rare tricks far more often. |

Each preset is a few numbers in `web/pet.html` (`PRESETS`): the chances of walking, pausing, doing a trick, jumping or
going on an edge trip; finer odds within those; how long he pauses; and how fast he walks.

## Tricks

Core tricks, all original: dance, juggle, cartwheel, sneaking through the screen's edge, climbing its side, plus
everyday fidgets (stretch, yawn, scratch, hop, sit, wave, look around) and two he only does on a window ledge (peek over
it, sit on it with his legs swinging). Pick any trick from right-click → **Tricks**.

Every trick is one file in `web/tricks/`. To write your own, see **[TRICKS.md](TRICKS.md)**.

### Fan pack

Off by default. Turn it on with right-click → **Fan pack**. It adds eight fan-made tricks of other people's characters:
a Super Saiyan power-up (Dragon Ball), Guts (Berserk), Thorfinn (Vinland Saga), the Silver Surfer (Marvel), Darth Vader
(Star Wars), a Ghost revive and an Exotic engram (Destiny) and a portal gun (Portal 2). They're original pixel art made as
homage, not affiliated with or endorsed by any of those rights holders, and they'll be removed on request.

## Uninstall

```bash
./uninstall.sh
```

It asks once, then quits hookpet, removes its hooks from `~/.claude/settings.json` (after a backup), and deletes
`~/.claude/hookpet` and its saved preferences. Your other settings and hooks stay as they are.

With the plugin: right-click → **Quit hookpet**, then `/plugin uninstall hookpet@hookpet`.

## Privacy

Everything stays on your Mac. hookpet makes no network requests: no telemetry, no accounts, no update checks.

- **The hook** (`hookpet-hook`) reads each event Claude Code sends it and writes a small `state.json` next to itself:
  per session, the mood, the current tool call as Claude Code prints it (for example `Update(page.mts)` or the first
  40 characters of a command), the first line of your prompt (up to 80 characters), the titles of the plan's steps,
  line counts for edits, and the last 8 tool calls. A session is dropped when it ends, or after 24 hours. The hook prints nothing and
  always exits 0, so it can't block or change anything Claude does.
- **The app** reads that file, the positions of your windows (to walk on them: sizes and positions only, which needs no
  screen recording permission), and where your mouse is (so his eyes can follow it).

## Why build from source?

A ready-to-run download has to be signed and notarized by Apple, which needs a paid Apple Developer account. Without
that, macOS blocks a downloaded app. Apps you build yourself aren't blocked, so `install.sh` builds on your Mac in a few
seconds. A notarized download could come later if the project gets a developer account.

## How it works

```text
Claude Code ── hook events ──▶ hookpet-hook ──▶ state.json ──▶ Hookpet.app ──▶ web/pet.html (Clawd)
                                                                 │
                                       your windows, mouse, menu ┘
```

| Path | What it is |
| --- | --- |
| `web/pet.html` | The whole pet: pixel engine, behavior, the box. Opened in a browser it's a mockup desktop with buttons for every state and trick. |
| `web/tricks/` | One file per trick (`core/` ships on; `fan/` is the fan pack). |
| `app/Hookpet.swift` | The app: a transparent, click-through layer over your main screen hosting the page. |
| `app/HookpetHook.swift` | The hook: turns Claude Code events into `state.json`. |
| `install.sh`, `uninstall.sh`, `build.sh` | Install, remove, build. `scripts/hooks.py` edits `settings.json`. |
| `.claude-plugin/`, `hooks/` | The Claude Code plugin. |

Limits: macOS only, and he lives on your main display (the one with the menu bar).

## Contributing

Tricks, fixes and new ideas are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md). To try changes, open `web/pet.html` in
a browser (or run `python3 -m http.server -d web` and open <http://localhost:8000/pet.html>).

## License

[MIT](LICENSE) for the code. Clawd, Claude and Claude Code are Anthropic's; fan-pack characters belong to their owners.
