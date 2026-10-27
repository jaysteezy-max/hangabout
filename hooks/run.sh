#!/bin/sh
# The plugin's hook for every event. The first SessionStart (and the first after a plugin update) builds hookpet into
# the plugin's data folder and starts it; after that each event goes straight to hookpet-hook. Like the hook itself,
# this prints nothing and always exits 0, so it can never block or change what Claude Code does.
ROOT=${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}
DATA=${CLAUDE_PLUGIN_DATA:-$HOME/.claude/hookpet-plugin}
if [ "$(cat "$DATA/built-from" 2>/dev/null)" = "$ROOT" ] && [ -x "$DATA/hookpet-hook" ]; then exec "$DATA/hookpet-hook"; fi

# Not built for this version yet: only a SessionStart (allowed three minutes) builds; other events wait for it.
input=$(cat)
case $input in *'"hook_event_name":"SessionStart"'* | *'"hook_event_name": "SessionStart"'*) ;; *) exit 0 ;; esac
mkdir -p "$DATA" || exit 0
dev=$(xcode-select -p 2>/dev/null)
if [ ! -x "$dev/usr/bin/swiftc" ] && [ ! -x "$dev/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc" ]; then
  echo "hookpet needs Apple's command line tools to build: run 'xcode-select --install', then start a new session." >"$DATA/build.log"
  exit 0
fi
find "$DATA" -maxdepth 1 -name .building -mmin +5 -exec rmdir {} \; 2>/dev/null # a build that was cut off
mkdir "$DATA/.building" 2>/dev/null || exit 0 # another session is building it right now
if "$ROOT/build.sh" "$DATA" >"$DATA/build.log" 2>&1; then
  printf '%s' "$ROOT" >"$DATA/built-from"
  printf '%s' "$input" | "$DATA/hookpet-hook" # this SessionStart starts the pet
fi
rmdir "$DATA/.building"
exit 0
