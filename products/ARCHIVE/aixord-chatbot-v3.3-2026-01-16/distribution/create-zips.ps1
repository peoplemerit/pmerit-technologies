$stagingBase = 'C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging'
$distBase = 'C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution'
$archiveBase = Join-Path $distBase 'archives'

# Create archive folder if not exists
if (!(Test-Path $archiveBase)) {
    New-Item -ItemType Directory -Path $archiveBase -Force | Out-Null
}

# Get current date for archive naming
$dateStamp = Get-Date -Format 'yyyyMMdd'

$packages = @(
    'aixord-chatgpt-pack',
    'aixord-claude-pack',
    'aixord-gemini-pack',
    'aixord-copilot-pack',
    'aixord-deepseek-pack',
    'aixord-genesis',
    'aixord-starter',
    'aixord-builder-bundle',
    'aixord-complete'
)

foreach ($pkg in $packages) {
    $pkgPath = Join-Path $stagingBase $pkg
    $zipName = "$pkg.zip"
    $zipPath = Join-Path $distBase $zipName

    if (Test-Path $pkgPath) {
        # Archive old zip if exists
        if (Test-Path $zipPath) {
            $archiveName = "${pkg}_v3.2.1_${dateStamp}.zip"
            $archivePath = Join-Path $archiveBase $archiveName
            # Just delete old, don't archive again to avoid duplicates
            Remove-Item $zipPath -Force
            Write-Output "Removed old: $zipName"
        }

        # Create new zip
        Compress-Archive -Path "$pkgPath\*" -DestinationPath $zipPath -Force

        # Get file count
        $fileCount = (Get-ChildItem $pkgPath -Recurse -File).Count
        Write-Output "Created: $zipName ($fileCount files)"
    }
}

Write-Output ""
Write-Output "All zip packages created for v3.3"
