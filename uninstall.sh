#!/bin/zsh
# Uninstalls Hangabout: quits it, takes its hooks out of ~/.claude/settings.json (backing that file up first), and
# deletes ~/.hangabout and its saved preferences. Your other settings and hooks stay as they are.
#   ./uninstall.sh --yes  you've already said yes: no question asked
set -euo pipefail
cd "${0:A:h}"
CONFIG=${CLAUDE_CONFIG_DIR:-$HOME/.claude}
DEST=$HOME/.hangabout
SETTINGS=$CONFIG/settings.json

ask(){ [[ -t 0 ]] || return 1; read -q "?$1 [y/N] "; local yes=$?; echo; return $yes }

echo "This quits Hangabout, removes its hooks from $SETTINGS (after a backup) and deletes $DEST."
[[ ${1:-} == --yes ]] || ask "Uninstall Hangabout?" || { echo "Nothing changed."; exit 0 }

if [[ -f $DEST/hangabout.pid ]]; then kill "$(<$DEST/hangabout.pid)" 2>/dev/null || true; fi

if [[ -f $SETTINGS ]] && grep -q -e hangabout-hook -e hookpet-hook "$SETTINGS"; then # hookpet-hook: the old name's, if never swapped
  backup=$SETTINGS.hangabout-backup-$(date +%Y%m%d-%H%M%S)
  cp -p "$SETTINGS" "$backup"
  python3 scripts/hooks.py remove "$SETTINGS" "$DEST/hangabout-hook"
  echo "Removed Hangabout's hooks (backup: $backup)."
fi

# Only delete the folder if it's really Hangabout's.
if [[ -d $DEST && ( -e $DEST/hangabout-hook || -d $DEST/Hangabout.app ) ]]; then
  rm -rf "$DEST"
  echo "Deleted $DEST."
fi
defaults delete io.github.jaysteezy-max.hangabout 2>/dev/null || true
echo "Hangabout is uninstalled."
