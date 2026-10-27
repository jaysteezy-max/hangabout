#!/bin/zsh
# Rebuilds Clawd.app and clawd-hook in ~/.claude/clawd. Needs the Xcode command line tools.
# clawd.html is the whole pet; open it in a browser to see the mockup desktop version.
set -euo pipefail
cd "${0:A:h}"
OUT=${0:A:h:h}
APP=$OUT/Clawd.app/Contents

mkdir -p $APP/MacOS $APP/Resources
cp clawd.html $APP/Resources/clawd.html
swiftc -O -o $APP/MacOS/Clawd Clawd.swift
swiftc -O -o $OUT/clawd-hook ClawdHook.swift
cat > $APP/Info.plist <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleIdentifier</key><string>com.jaybaldwin.clawd</string>
  <key>CFBundleName</key><string>Clawd</string>
  <key>CFBundleExecutable</key><string>Clawd</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>0.1.0</string>
  <key>LSUIElement</key><true/>
  <key>NSHighResolutionCapable</key><true/>
</dict></plist>
EOF
codesign --force --sign - $OUT/Clawd.app
echo "built $OUT/Clawd.app and $OUT/clawd-hook"
