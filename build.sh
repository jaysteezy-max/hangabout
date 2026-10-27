#!/bin/zsh
# Builds Hookpet.app and hookpet-hook into a folder (./build unless you name one). Needs Apple's command line tools.
# install.sh calls this; you only need it directly when hacking. web/pet.html also opens in a browser as a mockup.
set -euo pipefail
cd "${0:A:h}"
mkdir -p "${1:-build}"
OUT=${${1:-build}:A}
APP=$OUT/Hookpet.app/Contents

rm -rf "$APP/Resources/web"
mkdir -p "$APP/MacOS" "$APP/Resources"
cp -R web "$APP/Resources/web"
swiftc -O -o "$APP/MacOS/Hookpet" app/Hookpet.swift
swiftc -O -o "$OUT/hookpet-hook" app/HookpetHook.swift
cat > "$APP/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleIdentifier</key><string>io.github.jaysteezy-max.hookpet</string>
  <key>CFBundleName</key><string>hookpet</string>
  <key>CFBundleExecutable</key><string>Hookpet</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>$(<VERSION)</string>
  <key>LSUIElement</key><true/>
  <key>NSHighResolutionCapable</key><true/>
</dict></plist>
EOF
codesign --force --sign - "$OUT/Hookpet.app" # ad hoc: enough to run on the Mac that built it
echo "built $OUT/Hookpet.app and $OUT/hookpet-hook"
