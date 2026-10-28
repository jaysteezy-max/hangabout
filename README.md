<div align="center">

# Hangabout

**A desktop pet for macOS that shows what Claude Code is doing.**

![macOS](https://img.shields.io/badge/macOS-native-111111?style=flat-square&logo=apple)
![Claude Code](https://img.shields.io/badge/Claude%20Code-hooks%20%2B%20plugin-D77757?style=flat-square)
![Network](https://img.shields.io/badge/network-none-2C7A39?style=flat-square)
[![License: MIT](https://img.shields.io/badge/license-MIT-5769F7?style=flat-square)](LICENSE)

[Install](#install) · [Try it in your browser](https://jaysteezy-max.github.io/hangabout/) · [Tricks](#tricks) · [FAQ](#faq) · [Privacy](#privacy) · [Write a trick](TRICKS.md)

<img src="assets/hero.gif" width="820" alt="Cappy the capybara standing on a terminal window. His status bubble reads 'Noodling… Step 2/5' while he thinks, then 'Update(page.mts) +12 −3' while he writes on a page with a pencil, 'Bash(npm test) Running…' while he starts a little terminal and watches its output scroll, 'Do you want to proceed?' while he lifts a front paw and glows for attention, and 'Done · 3 files · 2 commands' with confetti. Then he juggles three balls.">

<sub>Cappy, the default pet, on a window ledge, following one Claude Code turn: thinking, editing, running a command,
waiting on you, done.</sub>

</div>

> **Unofficial fan project.** Not affiliated with, endorsed by or sponsored by Anthropic. Claude, Claude Code and Clawd
> are Anthropic's; the optional Clawd skin is fan art of their character. The optional fan pack is fan art of other
> people's characters (see [Fan pack](#fan-pack)).

- **Cappy, or Clawd.** The pet is Cappy, a capybara, unless you'd rather have Claude Code's own mascot: right-click →
  **Skin** → **Clawd**, a fan-art skin.
- **Knows what Claude is doing.** A status bubble beside him says it in Claude Code's own words: the plan step, the file
  being edited, the command running, the question waiting on you. It opens by itself only when it matters.
- **Lives on your real windows.** He walks along the Dock and the tops of your windows, rides a window you drag, climbs
  the sides of the screen and phases through its edges.
- **Read-only and local.** The hook can't approve, block or change anything Claude does, and nothing leaves your Mac.
- **Native and light.** A small Swift app that builds on your Mac in seconds. The hook takes about 5 ms per event.
- **Easy to teach new tricks.** Each trick is one JavaScript file, and you can try it in a browser before installing.

## Install

**You need:** a Mac (tested on macOS 27; it should run on macOS 12.3 or later), [Claude Code](https://code.claude.com),
and Apple's free command line tools, which the installer offers to install if they're missing.

```bash
git clone https://github.com/jaysteezy-max/hangabout.git && cd hangabout && ./install.sh
```

1. The installer builds Hangabout into `~/.hangabout` and starts it: Cappy appears at the bottom right of your screen.
2. It shows the hooks it wants to add to `~/.claude/settings.json` and **asks first**. If you say yes, it backs that
   file up as `settings.json.hangabout-backup-<time>` and leaves everything else in it as it was.
3. **Check it works:** start a new Claude Code session and send a prompt. Cappy looks about while a star spins above
   him, and his status bubble says what Claude is doing.

Run `./install.sh` again any time to update.

<details>
<summary>Exactly what changes in settings.json</summary>

One command is added to ten [hook events](https://code.claude.com/docs/en/hooks): `SessionStart`,
`UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `Notification`, `Stop`,
`StopFailure` and `SessionEnd`. Each looks like this:

```json
"SessionStart": [
  { "hooks": [{ "type": "command", "command": "/Users/you/.hangabout/hangabout-hook", "timeout": 10 }] }
]
```

Hooks you already have stay where they are. `./install.sh --add-hooks` adds them without asking (for when you've
already decided), and `./uninstall.sh` takes exactly these back out.

</details>

<details>
<summary>Or install it as a Claude Code plugin</summary>

```text
/plugin marketplace add jaysteezy-max/hangabout
/plugin install hangabout@hangabout
```

The plugin brings its own hooks, so Hangabout never edits your settings (Claude Code itself records that the plugin is
on). The first session you start afterwards builds Hangabout into the plugin's data folder (a few seconds; it also needs
the command line tools) and starts the pet. Use the plugin **or** `install.sh`, not both, or you'll get two pets.

</details>

<details>
<summary>Coming from hookpet?</summary>

Hangabout used to be called hookpet. In your old clone, `git pull` and run `./install.sh`: it quits the old pet, keeps
his size and behavior settings, swaps the old hooks in `settings.json` for the new ones (after a backup) and deletes
`~/.claude/hookpet`. With the plugin, right-click the old pet → **Quit hookpet**, take the old plugin out, then install
the new one as above:

```text
/plugin uninstall hookpet@hookpet
/plugin marketplace remove hookpet
```

</details>

## Using him

| Do this | He does this |
| --- | --- |
| Hover him | Does a happy wiggle and shows his status bubble |
| Click him | Pins the status bubble open with your recent tool calls; Esc or a click elsewhere closes it |
| Drag him | Dangles from your cursor; shake him and he gets dizzy |
| Double-click | Hops |
| Click a window | Notices, with a little "!" |
| Right-click | Tricks, Behavior, Skin, Size, Chirp when Claude needs you, Reduce motion, Fan pack, Enter a code…, Quit |

| Claude Code is… | Cappy | Status bubble |
| --- | --- | --- |
| Thinking | Looks about, a spinning star | Opens for each new plan step |
| Editing | Writing on a page: new lines in green, an old one scratched out in red | Lines added and removed |
| Running a command | Presses Enter on a little terminal, then watches the output scroll | The command and how long it's run |
| Waiting on you | A paw up, hopping, glowing | Stays open until you answer |
| Done | A happy hop and confetti | Opens briefly: files and commands this turn |
| Stopped on an error | Slumped, glitching | Stays open with the reason |
| Quiet for half an hour | Napping | Closed |

With several Claude Code sessions open he follows the one that needs you most: waiting on you, then stuck, then busy,
then the latest.

### Behavior presets

Right-click → **Behavior** sets how busy he is when Claude doesn't need him. Your choice is saved.

| Preset | What it's like |
| --- | --- |
| **Calm** | Mostly lingers and strolls. Long pauses, slow walks, rare tricks, hardly ever leaves the floor. |
| **Normal** | The default mix of wandering, fidgets, jumps to windows and trips to the screen's edges. |
| **Erratic** | Barely sits still. Fast trots, lots of jumping, edge trips and rare tricks far more often. |

### Skins

Right-click → **Skin** picks who lives on your screen. Your choice is saved.

| Skin | Who |
| --- | --- |
| **Cappy** | The default: a capybara, side on, who waves a front paw instead of a hand. |
| **Hippo** | A pygmy hippo on all fours, three-quarters on, who lifts a front foot instead of a hand. |
| **Clawd** | Fan art of Anthropic's Clawd, Claude Code's mascot. Not affiliated with or endorsed by Anthropic. |
| **Clay** | A faceless clay soldier in grey clay, after the Clay Soldiers Minecraft mod: a cube head, chunky arms and legs, drawn three-quarters. Original art. |
| **Hatty Hattington** | Fan art of Hatty from BattleBlock Theater, front on, with his top hat, tears and cane. Not affiliated with or endorsed by The Behemoth. In the menu while Fan pack is on. |

Every trick plays with any skin, and the fan-pack costumes fit Clawd front on and every side-on skin in profile. A skin
is one file in `web/skins/` ([how to make one](TRICKS.md#skins)); fan-art skins of other people's characters show in the
menu only while Fan pack is on.

## Tricks

<img src="assets/tricks.gif" width="600" alt="Cappy on the Dock doing his core tricks one after another: a dance with music notes, juggling three balls, two cartwheels and a wave of his front paw.">

Core tricks, all original: dance, juggle, cartwheel, a sneeze, a paper plane, sneaking through the screen's edge and
climbing its side, plus everyday fidgets (stretch, yawn, scratch, hop, sit, wave, look around, peeking over the Dock).
On a window ledge he peeks over it, sits with his legs swinging, or goes fishing. Some moves answer what's happening: he
waves when you come back to your Mac, yawns before he dozes off, trips now and then mid-walk, sometimes dances when
Claude finishes clean, settles in by the fire with a coffee after a long turn, and leaves you a sticky note if Claude
finishes while you're away. Pick any of them from right-click → **Tricks**.

**Make your own.** A trick is one file in `web/tricks/`: some poses with timings, and optionally something to draw. Try it
in the [browser mockup](https://jaysteezy-max.github.io/hangabout/) before you install it. [TRICKS.md](TRICKS.md) walks
through it, and in this repo you can ask Claude Code to "make a new trick" (there's a `new-trick` skill for it).

### Fan pack

Off by default. Turn it on with right-click → **Fan pack**. It adds ten fan-made tricks of other people's characters,
and they're secrets: you find them by what you do, and right-click → **Tricks** counts how many you've found. Fix your
failing tests, say, or drop him from way up, or keep a steady beat on him. Each one, once found, is in the Tricks menu
and turns up on its own now and then.

They're original pixel art made as homage, after Dragon Ball, Berserk, Vinland Saga, Marvel's Silver Surfer and
Spider-Man, Star Wars, Destiny, Portal 2 and Michael Jackson's moonwalk, not affiliated with or endorsed by any of those
rights holders, and they'll be removed on request.

## FAQ

<details>
<summary><b>He's on screen but his status bubble only says "waiting for Claude Code".</b></summary>

Hooks only reach Claude Code sessions started after they were added, so start a new session. If that doesn't help, run
`./install.sh` again: it says whether the hooks are in `~/.claude/settings.json`. While Claude works,
`~/.hangabout/state.json` should keep changing.

</details>

<details>
<summary><b>I installed the plugin and nothing happens.</b></summary>

The first session after installing builds Hangabout; if that failed, the reason is in `build.log` in the plugin's data
folder (`~/.claude/plugins/data/hangabout-*/`). Some setups skip plugin hooks altogether: an organization's
`allowManagedHooksOnly` policy, or a host app's own plugin security layer. In that case use `install.sh` instead.

</details>

<details>
<summary><b>There are two of him.</b></summary>

Two copies are each getting Claude Code's hooks, and every new session starts any that isn't running.

- **The plugin and `install.sh` are both installed.** Keep one: `./uninstall.sh`, or `/plugin uninstall hangabout@hangabout`.
- **An older copy left its hooks behind**, such as one from before a rename or installed in another folder. In the
  `"hooks"` section of `~/.claude/settings.json`, look for a command other than `~/.hangabout/hangabout-hook`.
  Back the file up, delete those entries (there's one per event), quit that copy and remove its folder.
  `./uninstall.sh` only removes hooks that run `hangabout-hook` (or `hookpet-hook`, its old name), so it won't catch
  the others.

</details>

<details>
<summary><b>Does it slow Claude Code down?</b></summary>

No. The hook is a small native program that takes about 5 ms per event, prints nothing and always exits 0, so it can't
block or change anything Claude does.

</details>

<details>
<summary><b>Don't want to hunt for the secrets?</b></summary>

Right-click → **Enter a code…** and type the code with your arrow keys and letters, then press Return. It turns the Fan
pack on and finds every secret at once.

<details><summary>Spoiler</summary>

↑ ↑ ↓ ↓ ← → ← → B A

</details>

</details>

<details>
<summary><b>Can he live on my other display?</b></summary>

Not yet: he lives on your main display (the one with the menu bar).

</details>

<details>
<summary><b>How is this different from Clawd on Desk?</b></summary>

[Clawd on Desk](https://github.com/rullerzhou-afk/clawd-on-desk) is a bigger, cross-platform app (Windows, macOS,
Linux) that follows many coding agents and can approve permission requests for you. Hangabout is deliberately small: a
native macOS app just for Claude Code that only watches (it never approves or blocks anything), uses no network, roams
across your actual windows, and is made to be extended one trick file at a time. Both are unofficial fan projects.

</details>

## Uninstall

```bash
./uninstall.sh
```

It asks once, then quits Hangabout, removes its hooks from `~/.claude/settings.json` (after a backup), and deletes
`~/.hangabout` and its saved preferences. Your other settings and hooks stay as they are.

With the plugin: right-click → **Quit Hangabout**, then `/plugin uninstall hangabout@hangabout`.

## Privacy

Everything stays on your Mac. Hangabout makes no network requests: no telemetry, no accounts, no update checks.

- **The hook** (`hangabout-hook`) reads each event Claude Code sends it and writes a small `state.json` next to itself:
  per session, the mood, the current tool call as Claude Code prints it (for example `Update(page.mts)` or the first
  40 characters of a command), the first line of your prompt (up to 80 characters), the titles of the plan's steps,
  line counts for edits, the last 8 tool calls, and where the session's transcript is. A session is dropped when it
  ends, or after 24 hours.
- **Interrupts:** Claude Code sends no hook when you stop it, only notes it at the end of the session's transcript. So
  while Claude is busy, the hook looks at the last entries there for that note, and keeps nothing it reads.
- **The app** reads that file, the positions of your windows (to walk on them: sizes and positions only, which needs no
  screen recording permission), and where your mouse is (so his eyes can follow it).

## Why build from source?

A ready-to-run download has to be signed and notarized by Apple, which needs a paid Apple Developer account. Without
that, macOS blocks a downloaded app. Apps you build yourself aren't blocked, so `install.sh` builds on your Mac in a few
seconds. A notarized download could come later if the project gets a developer account.

## How it works

```text
Claude Code ── hook events ──▶ hangabout-hook ──▶ state.json ──▶ Hangabout.app ──▶ web/pet.html (the pet)
                                                                 │
                                       your windows, mouse, menu ┘
```

| Path | What it is |
| --- | --- |
| `web/pet.html` | The whole pet: pixel engine, behavior, the status bubble. Opened in a browser it's a mockup desktop with buttons for every state and trick. |
| `web/tricks/` | One file per trick (`core/` ships on; `fan/` is the fan pack). |
| `app/Hangabout.swift` | The app: a transparent, click-through layer over your main screen hosting the page. |
| `app/HangaboutHook.swift` | The hook: turns Claude Code events into `state.json`. |
| `install.sh`, `uninstall.sh`, `build.sh` | Install, remove, build. `scripts/hooks.py` edits `settings.json`. |
| `.claude-plugin/`, `hooks/` | The Claude Code plugin. |

## Contributing

Tricks, fixes and ideas are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md). To try changes, open `web/pet.html` in
a browser (or run `python3 -m http.server -d web` and open <http://localhost:8000/pet.html>).

## License

[MIT](LICENSE) for the code. Clawd, Claude and Claude Code are Anthropic's (the Clawd skin is fan art); fan-pack
characters belong to their owners.
