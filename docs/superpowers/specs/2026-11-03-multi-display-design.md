# He roams every display

## Intent

Hangabout's pet should feel like a pet that lives in your whole workspace, not one shut in a single room. Today he
lives only on the main display (the one with the menu bar on a Mac, the primary display on Windows). Everything he
does there (wandering, sitting on windows, fidgeting, tricks on his own and in answer to Claude, noticing your clicks,
showing what Claude is doing in his bubble) should come with him to every display you have.

Jay's words: roaming across all of the displays, meandering about, acting alive, doing its own thing like roaming
and exploring, and wanting your attention without being a Tamagotchi.

## What it looks like

**He settles, then wanders.** Most of the time he hangs out on one display, like a cat that has picked a room. Now
and then, on his own, he wanders over to another display. How often follows his busy-ness setting (Calm, Normal,
Erratic). On Normal he should stay put for a few minutes at a time, not hop back and forth.

**He crosses where displays meet, the way the displays are arranged in System Settings > Displays** (Windows:
Settings > Display). An edge leads somewhere only if another display touches it there. Edges that touch nothing stay
walls, and everything that happens at the screen's edges today (sneaking through, climbing the sides, Spider-Man's
swing) keeps working there.

- **Sideways** (a display to the left or right): he walks off the edge and walks in on the other display at the
  matching spot. If that spot is in mid-air on the new display, he drops to whatever is below him (a window or the
  floor).
- **Up** (a display above): a big leap up through the top edge. He comes up through the bottom of the display above
  and lands on its floor.
- **Down** (a display below): he drops through the floor and falls in from the top of the display below, landing on
  a window or the floor.
- If the matching spot doesn't exist on the other display (the edges only partly overlap), he comes in at the
  nearest spot that does.

Jay's own setup is the main test: the laptop (main display, 1710 × 1112 points) sits below two 1920 × 1080 Dells
that sit side by side. The line between the Dells falls above the middle of the laptop. So from the laptop he can go
up to either Dell, the Dells lead to each other sideways, and each Dell leads down to the laptop.

**You can carry him.** Pick him up and drag him onto another display; he goes with your pointer and drops where you
let go.

**You can throw him.** Fling him hard toward an edge that leads to another display and he sails through it, flying on
across the next display in the same direction, then falls and lands on a window or the floor there. That works
sideways and also up or down, toward a display above or below. A fling toward an edge that touches nothing works as
it does today: he drops where you let go, and the Portal secret can still answer a throw at the screen's side. Today
a throw only counts sideways; up and down flings are new. A gentle let-go is just a drop, as now.

**Windows on every display are ledges.** He can sit on any window on the display he's on. A window that straddles
two displays is a ledge on both.

**He comes to you when Claude needs you.** When Claude needs your OK or stops on an error ("Needs you" and
"Blocked"), and your pointer is on a different display from his, he hurries over to your display. He should arrive
within about five seconds, settle on the floor or a window near your pointer (not under it), and wait there with his
bubble open as he does today. If you move to yet another display while Claude still needs you, he follows once more.
He doesn't follow your pointer around at any other time.

**Some edge tricks can come out somewhere else.** Tricks that already take him off a side of the screen can finish on
the display next door when there is one: Sneak through comes out on the neighbor instead of the far side of the same
screen, and the Portal secret sometimes opens its exit portal on another display. Other existing tricks stay as they
are unless one fits naturally.

**A switch to keep him on one display.** His menu gets one new switch, **Stay on one display**, off by default. While
it's on, he stays on whichever display he's on: no wandering across, and no coming to you when Claude needs you. You
can still carry or throw him to another display, and he settles there instead. He remembers that display between
launches, and if it's gone he turns up on the main display. How often he wanders between displays when the switch is
off follows the busy-ness setting he already has (Calm, Normal, Erratic).

**Plugging in and unplugging.** If the display he's on goes away, he turns up on the main display. Adding a display or
rearranging them takes effect right away. With one display, nothing changes from today.

## Goals

- Every display is his territory, on both the Mac app and the Windows app.
- He gets anywhere on his own, including displays above and below, not only by being carried.
- He finds you when Claude needs you.
- You can carry or throw him to any display, and keep him on one if you'd rather.

## Non-goals

- New tricks. Any new crossing trick (a glide, a teleport of his own) gets pitched to Jay first, as with every trick.
- Being seen on two displays at once. He is one pet in one place.
- Choosing which displays he may visit, one by one. The one switch covers keeping him in one place.
- Mirrored displays count as one display.

## Anti-goals (it fails if...)

- He switches displays so often it's distracting.
- He nags you for attention, or gets needs and meters like a Tamagotchi.
- He gets lost: stuck off-screen, on a display that's gone, or somewhere you can't see when Claude needs you.
- Anything that works on one display today gets worse.

## How it gets made (Claude's calls)

- **One see-through layer that moves with him.** The layer he lives on stays one window, and it moves to whichever
  display he's on. On a Mac with "Displays have separate Spaces" turned on (the default, and Jay's setting), one
  window can't show on two displays at once. A layer on every display would need two copies of him kept in step,
  which is a much bigger build. The cost: at a crossing he goes through the edge like a doorway. The part of him past
  the edge doesn't show on the next display until he's through. With the frame between two monitors, that reads as
  natural. He must never vanish for more than a moment, and never show twice.
- **The apps own the displays; the page owns him.** The Mac app (`app/Hangabout.swift`) and the Windows app
  (`app/win/main.js`, with its helper in `app/win/WindowList.cs`) tell the page (`web/pet.html`) which display he's
  on, where its neighbors are, which display your pointer is on, and the windows on his display in that display's
  own coordinates. The page decides when he crosses and asks the app to move the layer.
- **Windows' mixed scaling.** On Windows, window positions come in physical pixels. They should be converted per
  display (Electron's `screen.screenToDipRect`), not with the main display's scale as today.
- Docs: README's description and TRICKS.md (what a trip can do at an edge with a neighbor) say how it works now.

## Constraints

- No new dependencies. The Mac app stays one Swift file; the Windows app stays Electron plus its helper.
- He never takes focus, and clicks still go straight through everywhere except on him and his bubble.
- The browser mockup (`web/pet.html` opened on its own) keeps working with its one pretend screen.
- One new menu switch, Stay on one display, saved like the existing switches on both apps (Mac preferences;
  Windows settings file). Nothing else new in the menu.

## Left to the builder

- Exact crossing rates per busy-ness setting, crossing speeds and animations, within the feel above.
- The messages between the apps and the page.
- How he hurries to you (a run, a leap, popping through) as long as he arrives in about five seconds.
- Whether the mockup gets a pretend multi-display mode for checking.
- Which other existing edge tricks, if any, can finish on a neighbor.

## How it gets checked

- On Jay's three displays: he walks between the Dells both ways, leaps from the laptop up to each Dell, drops from
  each Dell down to the laptop, sits on windows on every display, is carried across, is thrown across sideways, up
  and down, and comes to the pointer's display when Claude needs you (a faked Claude state is fine).
- With Stay on one display on: he never crosses on his own or comes to you, carrying or throwing him moves him and
  he stays there, and after a relaunch he's back on that display.
- With one display, he behaves exactly as before.
- The Windows app can't be run here: its changes are checked by reading, and anything unproven is said so in the PR.
- Claude's call: Claude runs these checks itself and doesn't wait on Jay, per his standing rule to merge without
  waiting. Crossings are random and minutes apart, so a temporary way to force each one (never shipped) and
  screenshots of all three displays stand in for watching. Carrying and throwing need the real mouse. Claude tries
  them with synthetic mouse events. If macOS won't allow that, the PR lists them as unproven and Jay gets a short
  thing to try.
