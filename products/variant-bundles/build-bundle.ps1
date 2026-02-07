param(
    [Parameter(Mandatory=$true)]
    [string]$Variant
)

$ErrorActionPreference = "Stop"

# Paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ExtensionDist = Join-Path $ScriptDir "..\aixord-companion\dist"
$VariantConfig = Join-Path $ScriptDir "variants\$Variant\config.json"
$OutputDir = Join-Path $ScriptDir "output"
$TemplatesDir = Join-Path $ScriptDir "templates"
$BundleName = "AIXORD-for-$Variant-v4.2"

# Validate variant exists
if (-not (Test-Path $VariantConfig)) {
    Write-Error "Variant '$Variant' not found. Available variants:"
    Get-ChildItem (Join-Path $ScriptDir "variants") -Directory | ForEach-Object { Write-Host "  - $($_.Name)" }
    exit 1
}

# Validate extension dist exists
if (-not (Test-Path $ExtensionDist)) {
    Write-Error "Extension dist not found at: $ExtensionDist"
    Write-Host "Run 'npm run build' in aixord-companion first."
    exit 1
}

Write-Host "Building AIXORD bundle for: $Variant" -ForegroundColor Cyan
Write-Host ""

# Create temp folder
$TempDir = Join-Path $env:TEMP $BundleName
if (Test-Path $TempDir) {
    Remove-Item -Path $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

# Create extension subfolder
$ExtensionTarget = Join-Path $TempDir "extension"
New-Item -ItemType Directory -Force -Path $ExtensionTarget | Out-Null

# Copy extension files
Write-Host "  Copying extension files..." -ForegroundColor Gray
Copy-Item -Path "$ExtensionDist\*" -Destination $ExtensionTarget -Recurse

# Copy variant config as variant.json
Write-Host "  Adding variant configuration..." -ForegroundColor Gray
Copy-Item -Path $VariantConfig -Destination (Join-Path $ExtensionTarget "variant.json")

# Read variant config for template substitution
$Config = Get-Content $VariantConfig | ConvertFrom-Json
$VariantName = $Config.variant
$PlatformUrl = $Config.platformUrl

# Copy and process INSTALL.md template
Write-Host "  Generating INSTALL.md..." -ForegroundColor Gray
$InstallTemplate = Get-Content (Join-Path $TemplatesDir "INSTALL.md") -Raw
$InstallContent = $InstallTemplate -replace "{{VARIANT}}", $VariantName -replace "{{PLATFORM_URL}}", $PlatformUrl
$InstallContent | Set-Content (Join-Path $TempDir "INSTALL.md")

# Copy LICENSE.md
Write-Host "  Adding LICENSE.md..." -ForegroundColor Gray
Copy-Item -Path (Join-Path $TemplatesDir "LICENSE.md") -Destination $TempDir

# Check for manuscript (optional)
$ManuscriptDir = Join-Path $ScriptDir "..\..\manuscripts\$Variant"
if (Test-Path $ManuscriptDir) {
    Write-Host "  Including manuscript files..." -ForegroundColor Gray
    $ManuscriptTarget = Join-Path $TempDir "manuscript"
    New-Item -ItemType Directory -Force -Path $ManuscriptTarget | Out-Null
    Copy-Item -Path "$ManuscriptDir\*" -Destination $ManuscriptTarget -Recurse
} else {
    Write-Host "  No manuscript found for $Variant (optional)" -ForegroundColor DarkGray
}

# Ensure output directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

# Create ZIP
$ZipPath = Join-Path $OutputDir "$BundleName.zip"
if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Write-Host "  Creating ZIP archive..." -ForegroundColor Gray
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force

# Cleanup temp
Remove-Item -Path $TempDir -Recurse -Force

# Summary
Write-Host ""
Write-Host "Bundle created successfully!" -ForegroundColor Green
Write-Host "  Output: $ZipPath" -ForegroundColor White
Write-Host ""

# Show contents
Write-Host "Bundle contents:" -ForegroundColor Cyan
$ZipContents = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
$ZipContents.Entries | ForEach-Object {
    if ($_.Length -gt 0) {
        Write-Host "  $($_.FullName) ($([math]::Round($_.Length/1KB, 1)) KB)"
    } else {
        Write-Host "  $($_.FullName)/"
    }
}
$ZipContents.Dispose()
