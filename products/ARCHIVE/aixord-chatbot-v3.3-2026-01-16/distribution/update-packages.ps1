$stagingBase = 'C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging'

$packages = Get-ChildItem -Path $stagingBase -Directory

foreach ($pkg in $packages) {
    $pkgPath = $pkg.FullName

    # Copy new governance file
    Copy-Item -Path (Join-Path $stagingBase 'AIXORD_GOVERNANCE_V3.2.1.md') -Destination $pkgPath -Force

    # Copy new state file
    Copy-Item -Path (Join-Path $stagingBase 'AIXORD_STATE_V3.2.1.json') -Destination $pkgPath -Force

    # Copy PURPOSE_BOUND spec
    Copy-Item -Path (Join-Path $stagingBase 'PURPOSE_BOUND_OPERATION_SPEC.md') -Destination $pkgPath -Force

    Write-Output "Updated: $($pkg.Name)"
}

# Handle aixord-complete special case - also copy to governance folder
$completeGov = Join-Path $stagingBase 'aixord-complete\governance'
if (Test-Path $completeGov) {
    Copy-Item -Path (Join-Path $stagingBase 'AIXORD_GOVERNANCE_V3.2.1.md') -Destination $completeGov -Force
    Copy-Item -Path (Join-Path $stagingBase 'PURPOSE_BOUND_OPERATION_SPEC.md') -Destination $completeGov -Force
    Write-Output "Updated: aixord-complete/governance"
}

$completeState = Join-Path $stagingBase 'aixord-complete\state'
if (Test-Path $completeState) {
    Copy-Item -Path (Join-Path $stagingBase 'AIXORD_STATE_V3.2.1.json') -Destination $completeState -Force
    Write-Output "Updated: aixord-complete/state"
}

Write-Output "All packages updated with v3.2.1 files"
