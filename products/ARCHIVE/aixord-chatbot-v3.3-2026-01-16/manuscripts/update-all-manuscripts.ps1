$manuscriptBase = 'C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts'
$docxOutput = Join-Path $manuscriptBase 'docx-output'

# Ensure output directory exists
if (!(Test-Path $docxOutput)) {
    New-Item -ItemType Directory -Path $docxOutput -Force | Out-Null
}

$manuscripts = @('MANUSCRIPT_CLAUDE.md', 'MANUSCRIPT_GEMINI.md', 'MANUSCRIPT_COPILOT.md', 'MANUSCRIPT_GENESIS.md', 'MANUSCRIPT_STARTER.md', 'MANUSCRIPT_BUILDER.md', 'MANUSCRIPT_COMPLETE.md')

foreach ($ms in $manuscripts) {
    $mdPath = Join-Path $manuscriptBase $ms
    if (Test-Path $mdPath) {
        $content = Get-Content $mdPath -Raw

        # Update version and year
        $content = $content -replace '2025', '2026'
        $content = $content -replace 'Version 3\.1', 'Version 3.2.1'
        $content = $content -replace 'v3\.1', 'v3.2.1'
        $content = $content -replace 'AIXORD_GOVERNANCE_V3\.1\.md', 'AIXORD_GOVERNANCE_V3.2.1.md'
        $content = $content -replace 'AIXORD_STATE_V3\.1\.json', 'AIXORD_STATE_V3.2.1.json'
        $content = $content -replace 'AIXORD — Authority\. Execution\. Confirmation\.', 'AIXORD v3.2.1 -- Purpose-Bound. Disciplined. Focused.'

        Set-Content $mdPath $content -NoNewline
        Write-Output "Updated: $ms"

        # Convert to DOCX
        $docxPath = Join-Path $docxOutput ($ms -replace '\.md$', '.docx')
        pandoc $mdPath -o $docxPath --standalone
        Write-Output "Converted: $($ms -replace '\.md$', '.docx')"
    }
}

# Also convert the already-updated ChatGPT manuscript
$chatgptMd = Join-Path $manuscriptBase 'MANUSCRIPT_CHATGPT.md'
$chatgptDocx = Join-Path $docxOutput 'MANUSCRIPT_CHATGPT.docx'
pandoc $chatgptMd -o $chatgptDocx --standalone
Write-Output "Converted: MANUSCRIPT_CHATGPT.docx"

Write-Output ""
Write-Output "All manuscripts updated to v3.2.1 and converted to DOCX"
