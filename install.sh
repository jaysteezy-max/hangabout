#!/bin/zsh
# Installs Hangabout: builds the app and its hook into ~/.hangabout and starts it; then, if you say yes, adds its
# hooks to ~/.claude/settings.json (backing that file up first). Run it again to update. ./uninstall.sh undoes it.
#   ./install.sh              asks before touching settings.json
#   ./install.sh --add-hooks  you've already said yes: adds the hooks without asking
set -euo pipefail
cd "${0:A:h}"
CONFIG=${CLAUDE_CONFIG_DIR:-$HOME/.claude} # Claude Code's own variable for where its settings live
DEST=$HOME/.hangabout
OLD=$CONFIG/hookpet # where it lived before the rename from hookpet
SETTINGS=$CONFIG/settings.json
HOOK=$DEST/hangabout-hook
# A yes/no question; anything but y, or no terminal to ask on, is a no.
ask(){ [[ -t 0 ]] || return 1; read -q "?$1 [y/N] "; local yes=$?; echo; return $yes }

[[ $(uname) == Darwin ]] || { echo "Hangabout runs on macOS only."; exit 1 }
dev=$(xcode-select -p 2>/dev/null || true)
if [[ -z $dev || ! ( -x $dev/usr/bin/swiftc || -x $dev/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc ) ]]; then
  echo "Hangabout is built from source with Apple's command line tools (free, from Apple), which aren't installed yet."
  if ask "Install them now?"; then
    xcode-select --install || true
    echo "Finish the installer that just opened, then run ./install.sh again."
  else
    echo "No problem. Install them with 'xcode-select --install', then run ./install.sh again."
  fi
  exit 1
fi

# Stop a running copy, so the new one replaces it.
if [[ -f $DEST/hangabout.pid ]]; then kill "$(<$DEST/hangabout.pid)" 2>/dev/null || true; fi

# Moving over from hookpet: quit the old pet, keep its preferences and delete its folder. Its hooks get swapped below.
if [[ -e $OLD/hookpet-hook || -d $OLD/Hookpet.app ]]; then
  if [[ -f $OLD/hookpet.pid ]]; then kill "$(<$OLD/hookpet.pid)" 2>/dev/null || true; fi
  if defaults read io.github.jaysteezy-max.hookpet >/dev/null 2>&1; then
    defaults export io.github.jaysteezy-max.hookpet - | defaults import io.github.jaysteezy-max.hangabout -
    defaults delete io.github.jaysteezy-max.hookpet
  fi
  rm -rf "$OLD"
  echo "Moved over from hookpet: quit it, kept its settings and deleted $OLD."
fi

echo "Building Hangabout into $DEST…"
./build.sh "$DEST" >/dev/null
echo "Built."

if python3 scripts/hooks.py check "$SETTINGS" "$HOOK"; then
  echo "Claude Code's hooks for Hangabout are already in $SETTINGS."
else
  echo
  echo "Hangabout shows what Claude Code is doing through Claude Code hooks. That means adding one command,"
  echo "  $HOOK"
  echo "to these events in $SETTINGS:"
  echo "  SessionStart UserPromptSubmit PreToolUse PostToolUse PostToolUseFailure PermissionRequest Notification Stop StopFailure SessionEnd"
  echo "It reads each event, notes what Claude is doing in $DEST/state.json, prints nothing and always exits 0,"
  echo "so it can't block or change anything Claude does. Your other settings and hooks stay as they are."
  # hookpet-hook in there: you said yes under the old name, so add swaps those for these without asking again.
  if [[ ${1:-} == --add-hooks ]] || grep -qs hookpet-hook "$SETTINGS" || ask "Add the hooks now? A backup of settings.json is made first."; then
    if [[ -f $SETTINGS ]]; then
      backup=$SETTINGS.hangabout-backup-$(date +%Y%m%d-%H%M%S)
      cp -p "$SETTINGS" "$backup"
      echo "Backed up settings.json to $backup"
    fi
    python3 scripts/hooks.py add "$SETTINGS" "$HOOK"
    echo "Hooks added. They take effect in Claude Code sessions you start from now on."
  else
    echo "Skipped. Without hooks he still lives on your screen, but can't show what Claude is doing."
    echo "Add them later by running ./install.sh again, or install Hangabout as a Claude Code plugin instead (see README)."
  fi
fi

open -g "$DEST/Hangabout.app"
echo
echo "Hangabout is running: Clawd is on your screen. Right-click him for tricks, behavior (Calm/Normal/Erratic), size and more."
