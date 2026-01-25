# HANDOFF — AIXORD Package Finalization

**Date:** January 1, 2025  
**From:** Claude Web (Architect)  
**To:** Claude Code (Commander)  
**Priority:** HIGH — Final pre-ship tasks

---

## CONTEXT

Reconciliation fixes (URLs, prices, templates/ references, DISCLAIMER.md) have been completed. Governance file has been updated with new LICENSE VALIDATION section. Gumroad credentials are now live.

**Remaining Tasks:**
1. Regenerate DOCX manuscripts from updated MD source files
2. Update AIXORD_GOVERNANCE_V3.1.md in all 8 ZIP packages

---

## PHASE 1: Regenerate DOCX Manuscripts

### Source Files (Updated)
Location: `C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\md-sources\`

| File | Changes Applied |
|------|-----------------|
| MANUSCRIPT_STARTER.md | Removed templates/ reference |
| MANUSCRIPT_CLAUDE.md | Removed templates/ reference |
| MANUSCRIPT_CHATGPT.md | Fixed URL to /jfnzh, removed templates/ |
| MANUSCRIPT_GEMINI.md | Fixed URL to /qndnd, removed templates/ |
| MANUSCRIPT_COPILOT.md | Fixed URL to /jctnyh, fixed price to $4.99, removed templates/ |
| MANUSCRIPT_GENESIS.md | Fixed URL to /nlrwyn, fixed price to $12.99, removed templates/ |
| MANUSCRIPT_BUILDER.md | Fixed URL to /ennzm, fixed price to $17.99 |
| MANUSCRIPT_COMPLETE.md | Fixed URL to /xtwqj |

### Output Location
`C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\docx-output\`

### Command (Using KDP Tool)
```powershell
cd C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter

# For each manuscript:
pandoc "..\..\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\md-sources\MANUSCRIPT_STARTER.md" `
    -o "..\..\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\docx-output\MANUSCRIPT_STARTER.docx" `
    --reference-doc="templates\KDP_Template_6x9.docx" `
    --toc --toc-depth=2

# Repeat for all 8 manuscripts
```

### Alternative (Batch Script)
```powershell
$sourcePath = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\md-sources"
$outputPath = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\docx-output"
$templatePath = "C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter\templates\KDP_Template_6x9.docx"

$manuscripts = @(
    "MANUSCRIPT_STARTER",
    "MANUSCRIPT_CLAUDE",
    "MANUSCRIPT_CHATGPT",
    "MANUSCRIPT_GEMINI",
    "MANUSCRIPT_COPILOT",
    "MANUSCRIPT_GENESIS",
    "MANUSCRIPT_BUILDER",
    "MANUSCRIPT_COMPLETE"
)

foreach ($ms in $manuscripts) {
    Write-Host "Converting: $ms"
    pandoc "$sourcePath\$ms.md" -o "$outputPath\$ms.docx" --reference-doc="$templatePath" --toc --toc-depth=2
}

Write-Host "All manuscripts converted!"
```

---

## PHASE 2: Update Governance File in All ZIPs

### Source File (Updated)
`C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\INTERSESSION_CHAT_ACCESS\AIXORD_GOVERNANCE_V3.1.md`

**Changes in this version:**
- LICENSE VALIDATION section updated with wildcard patterns (PMERIT-MASTER-*, PMERIT-TEST-*, PMERIT-GIFT-*)
- Explicit validation logic added
- Purchase URLs corrected to meritwise0.gumroad.com

### Target ZIPs
Location: `C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\`

| ZIP File | Update Required |
|----------|-----------------|
| aixord-starter.zip | ✅ Replace AIXORD_GOVERNANCE_V3.1.md |
| aixord-claude-pack.zip | ✅ Replace AIXORD_GOVERNANCE_V3.1.md |
| aixord-chatgpt-pack.zip | ✅ Replace AIXORD_GOVERNANCE_V3.1.md |
| aixord-gemini-pack.zip | ✅ Replace AIXORD_GOVERNANCE_V3.1.md |
| aixord-copilot-pack.zip | ✅ Replace AIXORD_GOVERNANCE_V3.1.md |
| aixord-genesis.zip | ✅ Replace AIXORD_GOVERNANCE_V3.1.md |
| aixord-builder-bundle.zip | ✅ Replace AIXORD_GOVERNANCE_V3.1.md |
| aixord-complete.zip | ✅ Replace AIXORD_GOVERNANCE_V3.1.md (in root AND governance/ folder) |

### Update Script
```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem

$distributionPath = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution"
$governancePath = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\INTERSESSION_CHAT_ACCESS\AIXORD_GOVERNANCE_V3.1.md"

$zipFiles = Get-ChildItem -Path $distributionPath -Filter "*.zip"

foreach ($zipFile in $zipFiles) {
    Write-Host "Processing: $($zipFile.Name)"
    
    $tempFolder = Join-Path -Path $env:TEMP -ChildPath ("aixord_gov_" + [guid]::NewGuid().ToString().Substring(0,8))
    New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null
    
    try {
        # Extract
        [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile.FullName, $tempFolder)
        
        # Update governance file in root
        Copy-Item -Path $governancePath -Destination (Join-Path $tempFolder "AIXORD_GOVERNANCE_V3.1.md") -Force
        
        # Check for governance subfolder (aixord-complete has one)
        $govSubfolder = Join-Path $tempFolder "governance"
        if (Test-Path $govSubfolder) {
            Copy-Item -Path $governancePath -Destination (Join-Path $govSubfolder "AIXORD_GOVERNANCE_V3.1.md") -Force
            Write-Host "  -> Also updated governance/ subfolder"
        }
        
        # Delete original ZIP
        Remove-Item -Path $zipFile.FullName -Force
        
        # Recreate ZIP
        [System.IO.Compression.ZipFile]::CreateFromDirectory($tempFolder, $zipFile.FullName)
        
        Write-Host "  -> Governance file updated"
    }
    catch {
        Write-Host "  -> ERROR: $_"
    }
    finally {
        if (Test-Path $tempFolder) {
            Remove-Item -Path $tempFolder -Recurse -Force
        }
    }
}

Write-Host "All ZIPs updated with new governance file!"
```

---

## PHASE 3: Verification

### Verify Manuscripts
```powershell
# Check URLs are correct
Select-String -Path "C:\dev\pmerit\...\md-sources\*.md" -Pattern "gumroad.com/l/"

# Check prices are correct  
Select-String -Path "C:\dev\pmerit\...\md-sources\*.md" -Pattern "Regular Price"

# Check templates/ removed (should only appear in Builder/Complete)
Select-String -Path "C:\dev\pmerit\...\md-sources\*.md" -Pattern "templates/ —"
```

### Verify ZIPs
```powershell
# Check governance file exists in each ZIP
# Check DISCLAIMER.md exists in each ZIP
# Verify governance file contains "PMERIT-MASTER-*" pattern
```

---

## ACCEPTANCE CRITERIA

- [ ] All 8 DOCX manuscripts regenerated from updated MD sources
- [ ] All 8 ZIPs contain updated AIXORD_GOVERNANCE_V3.1.md
- [ ] aixord-complete.zip has governance file in BOTH root and governance/ folder
- [ ] Verification passes for URLs, prices, templates/ references
- [ ] ZIPs verified to contain DISCLAIMER.md (from previous task)

---

## POST-COMPLETION

After this HANDOFF is complete:
1. Director can upload updated ZIPs to Gumroad
2. Director can upload updated DOCX manuscripts to KDP
3. Gemini test can resume with finalized packages
4. Testers can be notified with their access codes

---

*AIXORD Package Finalization — Authority. Execution. Confirmation.*
