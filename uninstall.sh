#!/bin/zsh
# Uninstalls hookpet: quits it, takes its hooks out of ~/.claude/settings.json (backing that file up first), and
# deletes ~/.claude/hookpet and its saved preferences. Your other settings and hooks stay as they are.
#   ./uninstall.sh --yes  you've already said yes: no question asked
set -euo pipefail
cd "${0:A:h}"
CONFIG=${CLAUDE_CONFIG_DIR:-$HOME/.claude}
DEST=$CONFIG/hookpet
SETTINGS=$CONFIG/settings.json

ask(){ [[ -t 0 ]] || return 1; read -q "?$1 [y/N] "; local yes=$?; echo; return $yes }

echo "This quits hookpet, removes its hooks from $SETTINGS (after a backup) and deletes $DEST."
[[ ${1:-} == --yes ]] || ask "Uninstall hookpet?" || { echo "Nothing changed."; exit 0 }

if [[ -f $DEST/hookpet.pid ]]; then kill "$(<$DEST/hookpet.pid)" 2>/dev/null || true; fi

if [[ -f $SETTINGS ]] && grep -q hookpet-hook "$SETTINGS"; then
  backup=$SETTINGS.hookpet-backup-$(date +%Y%m%d-%H%M%S)
  cp -p "$SETTINGS" "$backup"
  python3 scripts/hooks.py remove "$SETTINGS" "$DEST/hookpet-hook"
  echo "Removed hookpet's hooks (backup: $backup)."
fi

# Only delete the folder if it's really hookpet's.
if [[ -d $DEST && ( -e $DEST/hookpet-hook || -d $DEST/Hookpet.app ) ]]; then
  rm -rf "$DEST"
  echo "Deleted $DEST."
fi
defaults delete io.github.jaysteezy-max.hookpet 2>/dev/null || true
echo "hookpet is uninstalled."
