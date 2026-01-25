# HANDOFF — AIXORD Package Finalization (Use KDP Tool)

**Date:** January 1, 2025  
**From:** Claude Web (Architect)  
**To:** Claude Code (Commander)  
**Priority:** HIGH — Final pre-ship tasks

---

## CRITICAL: USE THE KDP MANUSCRIPT CONVERTER TOOL

**Before doing ANY manuscript work, read the tool documentation:**

```
Location: C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter\
Read First: README.md and TOOL_MANIFEST.json
```

This tool was created specifically for PMERIT KDP publishing. **Do not use generic pandoc commands** — use the tool's scripts and templates.

---

## TASK 1: Regenerate DOCX Manuscripts

### What Changed (Already Done)
The MD source files have been updated with:
- Fixed Gumroad URLs (6 manuscripts)
- Fixed prices (3 manuscripts)  
- Removed templates/ references (6 manuscripts)

### Source Files
```
C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\md-sources\
├── MANUSCRIPT_STARTER.md
├── MANUSCRIPT_CLAUDE.md
├── MANUSCRIPT_CHATGPT.md
├── MANUSCRIPT_GEMINI.md
├── MANUSCRIPT_COPILOT.md
├── MANUSCRIPT_GENESIS.md
├── MANUSCRIPT_BUILDER.md
└── MANUSCRIPT_COMPLETE.md
```

### Output Location
```
C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\docx-output\
```

### EXECUTION STEPS

**Step 1: Read the KDP Tool Documentation**
```powershell
cd C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter
cat README.md
cat TOOL_MANIFEST.json
```

**Step 2: Verify KDP Template Exists**
```powershell
ls templates\KDP_Template_6x9.docx
```

If template doesn't exist, run the template generator script first.

**Step 3: Convert All Manuscripts Using the Tool**

Use the tool's conversion script OR follow its documented process:

```powershell
# Set paths
$toolPath = "C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter"
$sourcePath = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\md-sources"
$outputPath = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\docx-output"
$templatePath = "$toolPath\templates\KDP_Template_6x9.docx"

# Manuscripts to convert
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

# Convert each manuscript using KDP template
foreach ($ms in $manuscripts) {
    Write-Host "Converting: $ms"
    pandoc "$sourcePath\$ms.md" `
        -o "$outputPath\$ms.docx" `
        --reference-doc="$templatePath" `
        --toc `
        --toc-depth=2
    Write-Host "  -> Done"
}

Write-Host "`nAll manuscripts converted using KDP tool template!"
```

**Step 4: Verify Outputs**
- Check all 8 DOCX files exist in output folder
- Verify file sizes are reasonable (should be ~50-100KB each)

---

## TASK 2: Update Governance File in All ZIPs

### Source File (Updated Version)
```
C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\INTERSESSION_CHAT_ACCESS\AIXORD_GOVERNANCE_V3.1.md
```

**This version contains:**
- Updated LICENSE VALIDATION with wildcard patterns (PMERIT-MASTER-*, PMERIT-TEST-*, PMERIT-GIFT-*)
- Explicit validation logic for each credential type
- Corrected purchase URLs (meritwise0.gumroad.com)

### Target ZIPs
```
C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\
├── aixord-starter.zip
├── aixord-claude-pack.zip
├── aixord-chatgpt-pack.zip
├── aixord-gemini-pack.zip
├── aixord-copilot-pack.zip
├── aixord-genesis.zip
├── aixord-builder-bundle.zip
└── aixord-complete.zip
```

### EXECUTION STEPS

**Step 1: Create Update Script**

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem

$distributionPath = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution"
$governancePath = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\INTERSESSION_CHAT_ACCESS\AIXORD_GOVERNANCE_V3.1.md"

# Verify source file exists
if (-not (Test-Path $governancePath)) {
    Write-Host "ERROR: Governance file not found at $governancePath" -ForegroundColor Red
    exit 1
}

$zipFiles = Get-ChildItem -Path $distributionPath -Filter "*.zip" | Where-Object { $_.Name -notlike "*backup*" }

foreach ($zipFile in $zipFiles) {
    Write-Host "Processing: $($zipFile.Name)" -ForegroundColor Yellow
    
    $tempFolder = Join-Path -Path $env:TEMP -ChildPath ("aixord_gov_" + [guid]::NewGuid().ToString().Substring(0,8))
    New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null
    
    try {
        # Extract ZIP
        [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile.FullName, $tempFolder)
        
        # Update governance file in root
        Copy-Item -Path $governancePath -Destination (Join-Path $tempFolder "AIXORD_GOVERNANCE_V3.1.md") -Force
        Write-Host "  -> Updated root governance file" -ForegroundColor Green
        
        # Check for governance subfolder (aixord-complete has one)
        $govSubfolder = Join-Path $tempFolder "governance"
        if (Test-Path $govSubfolder) {
            Copy-Item -Path $governancePath -Destination (Join-Path $govSubfolder "AIXORD_GOVERNANCE_V3.1.md") -Force
            Write-Host "  -> Updated governance/ subfolder" -ForegroundColor Green
        }
        
        # Delete original ZIP
        Remove-Item -Path $zipFile.FullName -Force
        
        # Recreate ZIP
        [System.IO.Compression.ZipFile]::CreateFromDirectory($tempFolder, $zipFile.FullName)
        
        Write-Host "  -> ZIP recreated successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "  -> ERROR: $_" -ForegroundColor Red
    }
    finally {
        if (Test-Path $tempFolder) {
            Remove-Item -Path $tempFolder -Recurse -Force
        }
    }
}

Write-Host "`nAll ZIPs updated with new governance file!" -ForegroundColor Cyan
```

**Step 2: Run the Script**

**Step 3: Verify Updates**
```powershell
# Verify governance file in each ZIP contains the new validation patterns
$zipFiles = Get-ChildItem -Path $distributionPath -Filter "*.zip"
foreach ($zip in $zipFiles) {
    $archive = [System.IO.Compression.ZipFile]::OpenRead($zip.FullName)
    $govEntry = $archive.Entries | Where-Object { $_.Name -eq "AIXORD_GOVERNANCE_V3.1.md" }
    if ($govEntry) {
        Write-Host "$($zip.Name): Governance file present" -ForegroundColor Green
    } else {
        Write-Host "$($zip.Name): MISSING governance file!" -ForegroundColor Red
    }
    $archive.Dispose()
}
```

---

## TASK 3: Verification Checklist

After completing Tasks 1 and 2, verify:

### Manuscripts
- [ ] All 8 DOCX files exist in docx-output folder
- [ ] Files are properly formatted (6"×9", correct margins)
- [ ] TOC is present and functional

### ZIPs  
- [ ] All 8 ZIPs contain updated AIXORD_GOVERNANCE_V3.1.md
- [ ] aixord-complete.zip has governance in BOTH root and governance/ folder
- [ ] All ZIPs still contain DISCLAIMER.md (from previous task)
- [ ] Governance file contains "PMERIT-MASTER-*" pattern (verify with grep)

### Verification Commands
```powershell
# Check governance has new patterns
Select-String -Path "$distributionPath\..\INTERSESSION_CHAT_ACCESS\AIXORD_GOVERNANCE_V3.1.md" -Pattern "PMERIT-MASTER-\*"

# Should return matches showing the wildcard patterns
```

---

## ACCEPTANCE CRITERIA

- [ ] KDP tool documentation read before starting
- [ ] All 8 DOCX manuscripts regenerated using KDP template
- [ ] All 8 ZIPs updated with new governance file
- [ ] Verification checklist complete
- [ ] Report completion to Director

---

## COMPLETION REPORT FORMAT

When complete, provide:

```
✅ HANDOFF COMPLETE — Package Finalization

MANUSCRIPTS REGENERATED: [8/8]
- List each file with size

ZIPS UPDATED: [8/8]  
- List each ZIP with governance verification

VERIFICATION:
- [ ] KDP template used
- [ ] TOC functional
- [ ] Governance patterns verified
- [ ] DISCLAIMER.md present

Ready for Gumroad/KDP upload.
```

---

*AIXORD Package Finalization — Use the KDP Tool!*
