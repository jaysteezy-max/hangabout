# Builds Hangabout for Windows into a folder (.\build unless you name one): hangabout-hook.exe and hangabout-windows.exe,
# compiled with the C# compiler that comes with Windows, and Hangabout\Hangabout.exe, which is Electron with the pet page.
# install.ps1 calls this; you only need it directly when hacking. web\pet.html also opens in a browser as a mockup.
param([string]$Out = 'build')
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$Out = [IO.Path]::GetFullPath([IO.Path]::Combine($PSScriptRoot, $Out))
$Electron = '44.7.2' # pinned, with the SHA-256 from its release's SHASUMS256.txt
$ElectronSha256 = '10a89447ef64ac5cb9f782af48ffd83734a40ae91681259d1048ca3c9e6c5da4'
$csc = "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
New-Item -ItemType Directory -Force $Out | Out-Null

# winexe: no console window flashes up each time Claude Code runs the hook.
& $csc /nologo /optimize /target:winexe /r:System.Web.Extensions.dll "/out:$Out\hangabout-hook.exe" app\win\HangaboutHook.cs
if ($LASTEXITCODE) { throw 'hangabout-hook.exe did not build.' }
& $csc /nologo /optimize /target:winexe "/out:$Out\hangabout-windows.exe" app\win\WindowList.cs
if ($LASTEXITCODE) { throw 'hangabout-windows.exe did not build.' }

# shortcut: x64 only; Windows on Arm runs it emulated, and its own Electron zip would need a second pinned checksum.
$name = "electron-v$Electron-win32-x64.zip"
$zip = Join-Path $Out $name
Write-Host "Downloading Electron $Electron (150 MB)..."
$ProgressPreference = 'SilentlyContinue' # Windows PowerShell's progress bar slows downloads to a crawl
Invoke-WebRequest "https://github.com/electron/electron/releases/download/v$Electron/$name" -OutFile $zip -UseBasicParsing
$app = Join-Path $Out 'Hangabout'
try {
  if ((Get-FileHash $zip -Algorithm SHA256).Hash -ne $ElectronSha256) { throw "The Electron download didn't match its checksum, so it wasn't used." }
  if (Test-Path $app) { Remove-Item -Recurse -Force $app }
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [IO.Compression.ZipFile]::ExtractToDirectory($zip, $app)
} finally {
  Remove-Item $zip # only needed to unpack, so 150 MB isn't left behind
}
Rename-Item (Join-Path $app 'electron.exe') 'Hangabout.exe'
$res = Join-Path $app 'resources\app'
New-Item -ItemType Directory -Force $res | Out-Null
Copy-Item app\win\main.js, app\win\preload.js $res
Copy-Item -Recurse web (Join-Path $res 'web')
$version = (Get-Content VERSION -Raw).Trim()
# WriteAllText: UTF-8 without the byte-order mark Windows PowerShell would add, which Electron can't read.
[IO.File]::WriteAllText((Join-Path $res 'package.json'), "{`"name`": `"hangabout`", `"productName`": `"Hangabout`", `"version`": `"$version`", `"main`": `"main.js`"}")
Write-Output "built $app\Hangabout.exe, $Out\hangabout-hook.exe and $Out\hangabout-windows.exe"
