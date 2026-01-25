# convert-manuscripts.ps1
# AIXORD Manuscript Pandoc Conversion Script
# Converts MD sources to KDP-ready DOCX using reference template

param(
    [string]$TemplateDoc = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\Template 6 x 9 in.docx",
    [string]$SourceDir = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\md-sources",
    [string]$OutputDir = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\docx-output"
)

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force
}

# Verify template exists
if (-not (Test-Path $TemplateDoc)) {
    Write-Error "Template not found: $TemplateDoc"
    Write-Host "Please provide the path to 'Template 6 x 9 in.docx'"
    exit 1
}

# Verify Pandoc is installed
try {
    $pandocVersion = pandoc --version | Select-Object -First 1
    Write-Host "Using $pandocVersion"
} catch {
    Write-Error "Pandoc not found. Please install Pandoc first."
    Write-Host "Install with: winget install --id JohnMacFarlane.Pandoc"
    exit 1
}

# Get all MD files
$mdFiles = Get-ChildItem -Path $SourceDir -Filter "MANUSCRIPT_*.md"

if ($mdFiles.Count -eq 0) {
    Write-Warning "No MANUSCRIPT_*.md files found in $SourceDir"
    exit 0
}

Write-Host "`n=========================================="
Write-Host "AIXORD Manuscript Conversion"
Write-Host "=========================================="
Write-Host "Template: $TemplateDoc"
Write-Host "Source:   $SourceDir"
Write-Host "Output:   $OutputDir"
Write-Host "Files:    $($mdFiles.Count)"
Write-Host "==========================================`n"

# Convert each file
$success = 0
$failed = 0

foreach ($mdFile in $mdFiles) {
    $baseName = $mdFile.BaseName
    $outputFile = Join-Path $OutputDir "$baseName.docx"

    Write-Host "Converting: $($mdFile.Name) -> $baseName.docx ... " -NoNewline

    try {
        pandoc $mdFile.FullName `
            -o $outputFile `
            --reference-doc=$TemplateDoc `
            --toc `
            --toc-depth=2 `
            --standalone

        if (Test-Path $outputFile) {
            $fileSize = (Get-Item $outputFile).Length / 1KB
            Write-Host "OK ($([math]::Round($fileSize, 1)) KB)" -ForegroundColor Green
            $success++
        } else {
            Write-Host "FAILED (no output)" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n=========================================="
Write-Host "CONVERSION COMPLETE"
Write-Host "=========================================="
Write-Host "Success: $success"
Write-Host "Failed:  $failed"
Write-Host "Output:  $OutputDir"
Write-Host "==========================================`n"

if ($success -gt 0) {
    Write-Host "Next steps:"
    Write-Host "1. Open each DOCX in Microsoft Word"
    Write-Host "2. Verify formatting (page size, margins, TOC)"
    Write-Host "3. Update TOC: Right-click TOC -> Update Field -> Update entire table"
    Write-Host "4. Review page breaks between chapters"
    Write-Host "5. Export to PDF or upload to KDP"
}
