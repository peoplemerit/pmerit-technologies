$stagingBase = 'C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging'

$packages = @('aixord-gemini-pack', 'aixord-copilot-pack', 'aixord-genesis', 'aixord-starter', 'aixord-builder-bundle', 'aixord-complete')

foreach ($pkg in $packages) {
    $readmePath = Join-Path $stagingBase "$pkg\README.md"
    if (Test-Path $readmePath) {
        $content = Get-Content $readmePath -Raw

        # Update version
        $content = $content -replace 'Version:\*\* 3\.1', 'Version:** 3.2.1'
        $content = $content -replace 'Version:\*\* 3\.1\.4', 'Version:** 3.2.1'
        $content = $content -replace 'Updated:\*\* December 2025', 'Updated:** January 2026'
        $content = $content -replace 'Updated:\*\* January 2026', 'Updated:** January 2026'

        # Update file references
        $content = $content -replace 'AIXORD_GOVERNANCE_V3\.1\.md', 'AIXORD_GOVERNANCE_V3.2.1.md'
        $content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_V3\.1\.md', 'AIXORD_GOVERNANCE_GEMINI_V3.2.1.md'
        $content = $content -replace 'AIXORD_STATE_V3\.1\.json', 'AIXORD_STATE_V3.2.1.json'

        # Update footer
        $content = $content -replace 'AIXORD v3\.1 — Authority\. Execution\. Confirmation\.', 'AIXORD v3.2.1 -- Purpose-Bound. Disciplined. Focused.'
        $content = $content -replace 'AIXORD v3\.1\.4 — Authority\. Execution\. Confirmation\.', 'AIXORD v3.2.1 -- Purpose-Bound. Disciplined. Focused.'
        $content = $content -replace '© 2025 PMERIT LLC', 'Copyright 2026 PMERIT LLC'

        Set-Content $readmePath $content -NoNewline
        Write-Output "Updated: $pkg\README.md"
    }
}

Write-Output "All READMEs updated to v3.2.1"
