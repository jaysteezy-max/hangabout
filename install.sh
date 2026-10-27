#!/bin/zsh
# Installs hookpet: builds the app and its hook into ~/.claude/hookpet and starts it; then, if you say yes, adds its
# hooks to ~/.claude/settings.json (backing that file up first). Run it again to update. ./uninstall.sh undoes it.
set -euo pipefail
cd "${0:A:h}"
CONFIG=${CLAUDE_CONFIG_DIR:-$HOME/.claude} # Claude Code's own variable for where its settings live
DEST=$CONFIG/hookpet
SETTINGS=$CONFIG/settings.json
HOOK=$DEST/hookpet-hook

[[ $(uname) == Darwin ]] || { echo "hookpet runs on macOS only."; exit 1 }
dev=$(xcode-select -p 2>/dev/null || true)
if [[ -z $dev || ! ( -x $dev/usr/bin/swiftc || -x $dev/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc ) ]]; then
  echo "hookpet is built from source with Apple's command line tools (free, from Apple), which aren't installed yet."
  if read -q "?Install them now? [y/N] "; then
    echo; xcode-select --install || true
    echo "Finish the installer that just opened, then run ./install.sh again."
  else
    echo; echo "No problem. Install them with 'xcode-select --install', then run ./install.sh again."
  fi
  exit 1
fi

# Stop a running copy, so the new one replaces it.
if [[ -f $DEST/hookpet.pid ]]; then kill "$(<$DEST/hookpet.pid)" 2>/dev/null || true; fi

echo "Building hookpet into $DEST…"
./build.sh "$DEST" >/dev/null
echo "Built."

if python3 scripts/hooks.py check "$SETTINGS" "$HOOK"; then
  echo "Claude Code's hooks for hookpet are already in $SETTINGS."
else
  echo
  echo "hookpet shows what Claude Code is doing through Claude Code hooks. That means adding one command,"
  echo "  $HOOK"
  echo "to these events in $SETTINGS:"
  echo "  SessionStart UserPromptSubmit PreToolUse PostToolUse PostToolUseFailure PermissionRequest Notification Stop StopFailure SessionEnd"
  echo "It reads each event, notes what Claude is doing in $DEST/state.json, prints nothing and always exits 0,"
  echo "so it can't block or change anything Claude does. Your other settings and hooks stay as they are."
  if read -q "?Add the hooks now? A backup of settings.json is made first. [y/N] "; then
    echo
    if [[ -f $SETTINGS ]]; then
      backup=$SETTINGS.hookpet-backup-$(date +%Y%m%d-%H%M%S)
      cp -p "$SETTINGS" "$backup"
      echo "Backed up settings.json to $backup"
    fi
    python3 scripts/hooks.py add "$SETTINGS" "$HOOK"
    echo "Hooks added. They take effect in Claude Code sessions you start from now on."
  else
    echo
    echo "Skipped. Without hooks he still lives on your screen, but can't show what Claude is doing."
    echo "Add them later by running ./install.sh again, or install hookpet as a Claude Code plugin instead (see README)."
  fi
fi

open -g "$DEST/Hookpet.app"
echo
echo "hookpet is running: Clawd is on your screen. Right-click him for tricks, behavior (Calm/Normal/Erratic), size and more."
