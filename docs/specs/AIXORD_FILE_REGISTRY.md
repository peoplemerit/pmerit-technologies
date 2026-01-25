# AIXORD FILE REGISTRY (v3.2.1)

**Document ID:** AIXORD_FILE_REGISTRY  
**Version:** 3.2.1  
**Date:** January 2026  
**Purpose:** Canonical list of all files per variant — if it's not here, it shouldn't exist

---

## 🔒 REGISTRY RULES

1. **Canonical Authority:** This document defines exactly which files exist in each package
2. **No Orphans:** Any file in a package NOT in this registry = DELETE
3. **No Missing:** Any file in this registry NOT in package = ERROR
4. **Version Lock:** All versioned files in a package MUST have matching versions
5. **Naming Enforcement:** All files MUST follow AIXORD_NAMING_CONVENTION.md

---

## 📦 PACKAGE: aixord-gemini-pack.zip

**Platform:** Google Gemini  
**Current Version:** 3.2.1  
**File Count:** 11

### Governance Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GOVERNANCE_GEMINI_V3.2.1.md` | Full governance (paste workflow) | 3.2.1 | ✅ YES |
| `AIXORD_GOVERNANCE_GEMINI_GEM.md` | Condensed for Gems | N/A | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound enforcement | 3.2.1 | ✅ YES |

### State Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_GEMINI_V3.2.1.json` | State tracking template | 3.2.1 | ✅ YES |

### Tier Guides (2)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GEMINI_ADVANCED.md` | Advanced tier guide | N/A | ✅ YES |
| `AIXORD_GEMINI_FREE.md` | Free tier guide | N/A | ✅ YES |

### Reference Files (2)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_PHASE_DETAILS.md` | Extended phase behaviors | N/A | ✅ YES |
| `DISCLAIMER.md` | Legal terms | N/A | ✅ YES |

### Package Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Quick start guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |

### ❌ FILES THAT SHOULD NOT EXIST

| Invalid Filename | Reason |
|------------------|--------|
| `AIXORD_GOVERNANCE_V3.2.1.md` | Missing platform identifier |
| `AIXORD_GOVERNANCE_GEMINI_V3.1.md` | Old version |
| `AIXORD_STATE_V3.1.json` | Old version, missing platform |
| `AIXORD_STATE_V3.2.1.json` | Missing platform identifier |

---

## 📦 PACKAGE: aixord-chatgpt-pack.zip

**Platform:** OpenAI ChatGPT  
**Current Version:** 3.2.1  
**File Count:** 12

### Governance Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GOVERNANCE_CHATGPT_V3.2.1.md` | Full governance | 3.2.1 | ✅ YES |
| `AIXORD_GOVERNANCE_CHATGPT_GPT.md` | Condensed for Custom GPTs | N/A | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound enforcement | 3.2.1 | ✅ YES |

### State Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_CHATGPT_V3.2.1.json` | State tracking template | 3.2.1 | ✅ YES |

### Tier Guides (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_CHATGPT_PRO.md` | Pro tier guide ($200/mo) | N/A | ✅ YES |
| `AIXORD_CHATGPT_PLUS.md` | Plus tier guide ($20/mo) | N/A | ✅ YES |
| `AIXORD_CHATGPT_FREE.md` | Free tier guide | N/A | ✅ YES |

### Reference Files (2)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_PHASE_DETAILS.md` | Extended phase behaviors | N/A | ✅ YES |
| `DISCLAIMER.md` | Legal terms | N/A | ✅ YES |

### Package Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Quick start guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |

### ❌ FILES THAT SHOULD NOT EXIST

| Invalid Filename | Reason |
|------------------|--------|
| `AIXORD_GOVERNANCE_V3.2.1.md` | Missing platform identifier |
| `AIXORD_GOVERNANCE_CHATGPT_V3.1.md` | Old version |
| `AIXORD_STATE_V3.1.json` | Old version, missing platform |

---

## 📦 PACKAGE: aixord-claude-pack.zip

**Platform:** Anthropic Claude  
**Current Version:** 3.2.1  
**File Count:** 12

### Governance Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GOVERNANCE_CLAUDE_V3.2.1.md` | Full governance | 3.2.1 | ✅ YES |
| `AIXORD_GOVERNANCE_CLAUDE_PROJECT.md` | Condensed for Projects | N/A | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound enforcement | 3.2.1 | ✅ YES |

### State Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_CLAUDE_V3.2.1.json` | State tracking template | 3.2.1 | ✅ YES |

### Tier Guides (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_CLAUDE_DUAL.md` | Pro + Code tier guide | N/A | ✅ YES |
| `AIXORD_CLAUDE_PRO.md` | Pro tier guide | N/A | ✅ YES |
| `AIXORD_CLAUDE_FREE.md` | Free tier guide | N/A | ✅ YES |

### Reference Files (2)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_PHASE_DETAILS.md` | Extended phase behaviors | N/A | ✅ YES |
| `DISCLAIMER.md` | Legal terms | N/A | ✅ YES |

### Package Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Quick start guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |

---

## 📦 PACKAGE: aixord-deepseek-pack.zip

**Platform:** DeepSeek  
**Current Version:** 3.2.1  
**File Count:** 11

### Governance Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GOVERNANCE_DEEPSEEK_V3.2.1.md` | Full governance | 3.2.1 | ✅ YES |
| `AIXORD_GOVERNANCE_DEEPSEEK_CONDENSED.md` | Condensed version | N/A | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound enforcement | 3.2.1 | ✅ YES |

### State Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_DEEPSEEK_V3.2.1.json` | State tracking template | 3.2.1 | ✅ YES |

### Tier Guides (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_DEEPSEEK_API.md` | API tier guide | N/A | ✅ YES |
| `AIXORD_DEEPSEEK_CHAT.md` | Chat tier guide | N/A | ✅ YES |
| `AIXORD_DEEPSEEK_FREE.md` | Free tier guide | N/A | ✅ YES |

### Reference Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_PHASE_DETAILS.md` | Extended phase behaviors | N/A | ✅ YES |

### Package Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Quick start guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |

---

## 📦 PACKAGE: aixord-copilot-pack.zip

**Platform:** GitHub/Microsoft Copilot  
**Current Version:** 3.2.1  
**File Count:** 8

### Governance Files (2)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GOVERNANCE_COPILOT_V3.2.1.md` | Full governance | 3.2.1 | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound enforcement | 3.2.1 | ✅ YES |

### State Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_COPILOT_V3.2.1.json` | State tracking template | 3.2.1 | ✅ YES |

### Tier Guides (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_COPILOT.md` | Copilot usage guide | N/A | ✅ YES |

### Package Files (4)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Quick start guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |
| `DISCLAIMER.md` | Legal terms | N/A | ✅ YES |

---

## 📦 PACKAGE: aixord-universal-pack.zip

**Platform:** Universal (Any AI)  
**Current Version:** 3.2.1  
**File Count:** 12

### Governance Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GOVERNANCE_UNIVERSAL_V3.2.1.md` | Full governance | 3.2.1 | ✅ YES |
| `AIXORD_GOVERNANCE_UNIVERSAL_CONDENSED.md` | Condensed version | N/A | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound enforcement | 3.2.1 | ✅ YES |

### State Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_UNIVERSAL_V3.2.1.json` | State tracking template | 3.2.1 | ✅ YES |

### Platform Guides (4)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_UNIVERSAL_QUICK_START.md` | Quick start guide | N/A | ✅ YES |
| `AIXORD_PLATFORM_GUIDE_CHATGPT.md` | ChatGPT tips | N/A | ✅ YES |
| `AIXORD_PLATFORM_GUIDE_CLAUDE.md` | Claude tips | N/A | ✅ YES |
| `AIXORD_PLATFORM_GUIDE_OTHER.md` | Other platforms | N/A | ✅ YES |

### Reference Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_PHASE_DETAILS.md` | Extended phase behaviors | N/A | ✅ YES |

### Package Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Quick start guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |

---

## 📦 PACKAGE: aixord-starter.zip

**Platform:** Multi-platform (Starter)  
**Current Version:** 3.2.1  
**File Count:** 10

### Governance Files (2)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GOVERNANCE_UNIVERSAL_V3.2.1.md` | Universal governance | 3.2.1 | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound enforcement | 3.2.1 | ✅ YES |

### State Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_UNIVERSAL_V3.2.1.json` | State template | 3.2.1 | ✅ YES |

### Free Tier Variants (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_CLAUDE_FREE.md` | Claude free tier | N/A | ✅ YES |
| `AIXORD_CHATGPT_FREE.md` | ChatGPT free tier | N/A | ✅ YES |
| `AIXORD_GEMINI_FREE.md` | Gemini free tier | N/A | ✅ YES |

### Package Files (4)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Quick start guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |
| `DISCLAIMER.md` | Legal terms | N/A | ✅ YES |

---

## 📦 PACKAGE: aixord-genesis.zip

**Platform:** Any (Idea-to-System)  
**Current Version:** 3.2.1  
**File Count:** 9

### Governance Files (2)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GENESIS.md` | Genesis workflow | N/A | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound enforcement | 3.2.1 | ✅ YES |

### State Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_GENESIS_V3.2.1.json` | Genesis state template | 3.2.1 | ✅ YES |

### Templates (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `MASTER_SCOPE_TEMPLATE.md` | Project vision template | N/A | ✅ YES |
| `SCOPE_TEMPLATE.md` | Feature scope template | N/A | ✅ YES |
| `HANDOFF_TEMPLATE.md` | Session handoff template | N/A | ✅ YES |

### Package Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Quick start guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |

---

## 📦 PACKAGE: aixord-builder-bundle.zip

**Platform:** Multi-platform (Builder)  
**Current Version:** 3.2.1  
**File Count:** 12

### Governance Files (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GENESIS.md` | Genesis workflow | N/A | ✅ YES |
| `AIXORD_GOVERNANCE_UNIVERSAL_V3.2.1.md` | Universal governance | 3.2.1 | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound enforcement | 3.2.1 | ✅ YES |

### State Files (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_UNIVERSAL_V3.2.1.json` | State template | 3.2.1 | ✅ YES |

### Templates (4)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `MASTER_SCOPE_TEMPLATE.md` | Project vision template | N/A | ✅ YES |
| `SCOPE_TEMPLATE.md` | Feature scope template | N/A | ✅ YES |
| `HANDOFF_TEMPLATE.md` | Session handoff template | N/A | ✅ YES |
| `AIXORD_UNIVERSAL_ENHANCED.md` | Enhanced universal | N/A | ✅ YES |

### Package Files (4)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Quick start guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |
| `DISCLAIMER.md` | Legal terms | N/A | ✅ YES |

---

## 📦 PACKAGE: aixord-complete.zip

**Platform:** All Platforms (Complete)  
**Current Version:** 3.2.1  
**File Count:** 30+

### Root Files (5)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `README.md` | Master guide | N/A | ✅ YES |
| `LICENSE.md` | Usage rights | N/A | ✅ YES |
| `LICENSE_KEY.txt` | License certificate | N/A | ✅ YES |
| `DISCLAIMER.md` | Legal terms | N/A | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound spec | 3.2.1 | ✅ YES |

### governance/ Folder (2)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GOVERNANCE_MASTER_V3.2.1.md` | Master governance | 3.2.1 | ✅ YES |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-bound spec | 3.2.1 | ✅ YES |

### state/ Folder (1)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_STATE_MASTER_V3.2.1.json` | Master state | 3.2.1 | ✅ YES |

### variants/chatgpt/ Folder (4)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_CHATGPT_PRO.md` | Pro tier | N/A | ✅ YES |
| `AIXORD_CHATGPT_PLUS.md` | Plus tier | N/A | ✅ YES |
| `AIXORD_CHATGPT_FREE.md` | Free tier | N/A | ✅ YES |
| `AIXORD_GOVERNANCE_CHATGPT_GPT.md` | GPT condensed | N/A | ✅ YES |

### variants/claude/ Folder (4)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_CLAUDE_DUAL.md` | Dual tier | N/A | ✅ YES |
| `AIXORD_CLAUDE_PRO.md` | Pro tier | N/A | ✅ YES |
| `AIXORD_CLAUDE_FREE.md` | Free tier | N/A | ✅ YES |
| `AIXORD_GOVERNANCE_CLAUDE_PROJECT.md` | Project condensed | N/A | ✅ YES |

### variants/gemini/ Folder (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GEMINI_ADVANCED.md` | Advanced tier | N/A | ✅ YES |
| `AIXORD_GEMINI_FREE.md` | Free tier | N/A | ✅ YES |
| `AIXORD_GOVERNANCE_GEMINI_GEM.md` | Gem condensed | N/A | ✅ YES |

### variants/other/ Folder (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_COPILOT.md` | Copilot variant | N/A | ✅ YES |
| `AIXORD_DEEPSEEK.md` | DeepSeek variant | N/A | ✅ YES |
| `AIXORD_UNIVERSAL.md` | Universal variant | N/A | ✅ YES |

### templates/ Folder (4)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `AIXORD_GENESIS.md` | Genesis workflow | N/A | ✅ YES |
| `MASTER_SCOPE_TEMPLATE.md` | Vision template | N/A | ✅ YES |
| `SCOPE_TEMPLATE.md` | Scope template | N/A | ✅ YES |
| `HANDOFF_TEMPLATE.md` | Handoff template | N/A | ✅ YES |

### examples/ Folder (3)

| Canonical Filename | Purpose | Version | Required |
|--------------------|---------|---------|----------|
| `EXAMPLE_STATE.json` | Filled state | N/A | ✅ YES |
| `EXAMPLE_SCOPE.md` | Filled scope | N/A | ✅ YES |
| `EXAMPLE_HANDOFF.md` | Filled handoff | N/A | ✅ YES |

---

## 🔍 VERIFICATION COMMANDS

### Check Package Against Registry

```bash
# List all files in package
unzip -l package.zip

# Compare with registry
# Each file must exist in registry
# No extra files allowed
```

### Version Lock Check

```bash
# All versioned files must show same version
grep -r "Version.*3\." *.md *.json | grep -v "3.2.1"
# Should return EMPTY (no mismatches)
```

### Naming Convention Check

```bash
# All AIXORD files must follow pattern
ls AIXORD_*.md | grep -v "_[A-Z]*_"
# Should return EMPTY (all have platform identifier)
```

---

*AIXORD FILE REGISTRY v3.2.1 — Canonical Authority*
*© 2026 PMERIT LLC. All Rights Reserved.*
