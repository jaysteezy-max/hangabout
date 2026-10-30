# Installs Hangabout on Windows: builds it into ~\.hangabout and starts it; then, if you say yes, adds its hooks to
# ~\.claude\settings.json (backing that file up first). Run it again to update. uninstall.ps1 undoes it.
#   powershell -ExecutionPolicy Bypass -File install.ps1            asks before touching settings.json
#   powershell -ExecutionPolicy Bypass -File install.ps1 -AddHooks  you've already said yes: adds the hooks without asking
param([switch]$AddHooks)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$Config = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' } # Claude Code's own variable for where its settings live
$Dest = Join-Path $HOME '.hangabout'
$Settings = Join-Path $Config 'settings.json'
$Hook = Join-Path $Dest 'hangabout-hook.exe'

# A yes/no question; anything but y, or nowhere to ask it, is a no.
function Ask($question) { try { (Read-Host "$question [y/N]") -match '^[yY]' } catch { $false } }
# hooks.py edits settings.json: the first of these that's a working Python runs it (not the Microsoft Store's stand-in).
function Find-Python { foreach ($name in 'python3', 'python', 'py') { try { & $name -c 'import json' *> $null; if ($LASTEXITCODE -eq 0) { return $name } } catch {} } }
# Quits a running copy (the app, Electron's helper processes and the window watcher), so the new build can replace it.
function Stop-Hangabout {
  Get-Process Hangabout, hangabout-windows -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$Dest\*" } |
    Stop-Process -Force -PassThru | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
}

if ([Environment]::OSVersion.Platform -ne 'Win32NT') { Write-Host 'This is the Windows installer; on a Mac, run ./install.sh.'; exit 1 }

Write-Host "Building Hangabout into $Dest..."
Stop-Hangabout
& .\build.ps1 $Dest | Out-Null
Write-Host 'Built.'

$python = Find-Python
if ($python) { & $python scripts\hooks.py check $Settings $Hook }
if (-not $python) {
  Write-Host "Adding Claude Code's hooks needs Python 3 (from python.org or the Microsoft Store), which isn't installed."
  Write-Host 'Install it, then run this again. Without hooks he still lives on your screen, but can''t show what Claude is doing.'
} elseif ($LASTEXITCODE -eq 0) {
  Write-Host "Claude Code's hooks for Hangabout are already in $Settings."
} else {
  Write-Host ''
  Write-Host 'Hangabout shows what Claude Code is doing through Claude Code hooks. That means adding one command,'
  Write-Host "  $Hook"
  Write-Host "to these events in ${Settings}:"
  Write-Host '  SessionStart UserPromptSubmit PreToolUse PostToolUse PostToolUseFailure PermissionRequest Notification Stop StopFailure SessionEnd'
  Write-Host "It reads each event, notes what Claude is doing in $Dest\state.json, prints nothing and always exits 0,"
  Write-Host "so it can't block or change anything Claude does. Your other settings and hooks stay as they are."
  if ($AddHooks -or (Ask 'Add the hooks now? A backup of settings.json is made first.')) {
    if (Test-Path $Settings) {
      $backup = "$Settings.hangabout-backup-$(Get-Date -Format yyyyMMdd-HHmmss)"
      Copy-Item $Settings $backup
      Write-Host "Backed up settings.json to $backup"
    } else {
      New-Item -ItemType Directory -Force $Config | Out-Null
    }
    & $python scripts\hooks.py add $Settings $Hook
    if ($LASTEXITCODE) { exit 1 } # hooks.py has said why, and changed nothing
    Write-Host 'Hooks added. They take effect in Claude Code sessions you start from now on.'
  } else {
    Write-Host "Skipped. Without hooks he still lives on your screen, but can't show what Claude is doing."
    Write-Host 'Add them later by running install.ps1 again.'
  }
}

Start-Process (Join-Path $Dest 'Hangabout\Hangabout.exe')
Write-Host ''
Write-Host 'Hangabout is running: Cappy is on your screen. Right-click him for tricks, behavior (Calm/Normal/Erratic), skin, size and more.'
