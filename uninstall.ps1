# Uninstalls Hangabout from Windows: quits it, takes its hooks out of ~\.claude\settings.json (backing that file up
# first), and deletes ~\.hangabout, saved preferences included. Your other settings and hooks stay as they are.
#   powershell -ExecutionPolicy Bypass -File uninstall.ps1 -Yes  you've already said yes: no question asked
param([switch]$Yes)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$Config = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
$Dest = Join-Path $HOME '.hangabout'
$Settings = Join-Path $Config 'settings.json'

function Ask($question) { try { (Read-Host "$question [y/N]") -match '^[yY]' } catch { $false } }
function Find-Python { foreach ($name in 'python3', 'python', 'py') { try { & $name -c 'import json' *> $null; if ($LASTEXITCODE -eq 0) { return $name } } catch {} } }

Write-Host "This quits Hangabout, removes its hooks from $Settings (after a backup) and deletes $Dest."
if (-not ($Yes -or (Ask 'Uninstall Hangabout?'))) { Write-Host 'Nothing changed.'; exit }

$ours = (Test-Path $Settings) -and (Select-String -Path $Settings -Pattern 'hangabout-hook' -SimpleMatch -Quiet)
$python = Find-Python
if ($ours -and -not $python) { Write-Host "Taking the hooks out of settings.json needs Python 3, which isn't installed. Nothing changed."; exit 1 }

Get-Process Hangabout, hangabout-windows -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$Dest\*" } |
  Stop-Process -Force -PassThru | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue

if ($ours) {
  $backup = "$Settings.hangabout-backup-$(Get-Date -Format yyyyMMdd-HHmmss)"
  Copy-Item $Settings $backup
  & $python scripts\hooks.py remove $Settings (Join-Path $Dest 'hangabout-hook.exe')
  if ($LASTEXITCODE) { exit 1 }
  Write-Host "Removed Hangabout's hooks (backup: $backup)."
}

# Only delete the folder if it's really Hangabout's.
if (Test-Path (Join-Path $Dest 'hangabout-hook.exe')) {
  Remove-Item -Recurse -Force $Dest
  Write-Host "Deleted $Dest."
}
Write-Host 'Hangabout is uninstalled. Restart any Claude Code sessions that were open, so they stop calling its hook.'
