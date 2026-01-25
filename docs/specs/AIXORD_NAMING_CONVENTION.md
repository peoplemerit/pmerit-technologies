# AIXORD NAMING CONVENTION (v3.2.1)

**Document ID:** AIXORD_NAMING_CONVENTION  
**Version:** 3.2.1  
**Date:** January 2026  
**Purpose:** Enforced naming rules for all AIXORD files — violations are errors

---

## 🔒 NAMING RULES (MANDATORY)

### Rule 1: All Versioned Files MUST Include Platform Identifier

```
PATTERN: AIXORD_[TYPE]_[PLATFORM]_V[VERSION].[ext]

COMPONENTS:
  TYPE:     GOVERNANCE | STATE
  PLATFORM: CHATGPT | CLAUDE | GEMINI | DEEPSEEK | COPILOT | UNIVERSAL | GENESIS | MASTER
  VERSION:  X.X.X (e.g., 3.2.1)
  ext:      md | json

EXAMPLES:
  ✅ AIXORD_GOVERNANCE_GEMINI_V3.2.1.md
  ✅ AIXORD_STATE_CHATGPT_V3.2.1.json
  ✅ AIXORD_GOVERNANCE_CLAUDE_V3.2.1.md
  ✅ AIXORD_STATE_UNIVERSAL_V3.2.1.json
  
  ❌ AIXORD_GOVERNANCE_V3.2.1.md        (missing platform)
  ❌ AIXORD_STATE_V3.2.1.json           (missing platform)
  ❌ GOVERNANCE_GEMINI_V3.2.1.md        (missing AIXORD prefix)
```

---

### Rule 2: Condensed Governance Files Use Descriptor Instead of Version

```
PATTERN: AIXORD_GOVERNANCE_[PLATFORM]_[DESCRIPTOR].md

DESCRIPTORS:
  GPT       - For ChatGPT Custom GPTs
  PROJECT   - For Claude Projects
  GEM       - For Gemini Gems
  CONDENSED - For paste-per-session (no persistent storage)

EXAMPLES:
  ✅ AIXORD_GOVERNANCE_CHATGPT_GPT.md
  ✅ AIXORD_GOVERNANCE_CLAUDE_PROJECT.md
  ✅ AIXORD_GOVERNANCE_GEMINI_GEM.md
  ✅ AIXORD_GOVERNANCE_DEEPSEEK_CONDENSED.md
  ✅ AIXORD_GOVERNANCE_UNIVERSAL_CONDENSED.md
  
  ❌ AIXORD_GOVERNANCE_CHATGPT.md       (missing descriptor)
  ❌ AIXORD_GPT_GOVERNANCE.md           (wrong order)
```

---

### Rule 3: Tier Guide Files Use Platform + Tier

```
PATTERN: AIXORD_[PLATFORM]_[TIER].md

TIERS:
  PRO       - Premium tier ($200/mo for ChatGPT, $20/mo for Claude)
  PLUS      - Mid tier ($20/mo for ChatGPT)
  ADVANCED  - Premium tier (Gemini)
  FREE      - Free tier (all platforms)
  DUAL      - Claude Pro + Code
  API       - API access (DeepSeek)
  CHAT      - Chat interface (DeepSeek)

EXAMPLES:
  ✅ AIXORD_CHATGPT_PRO.md
  ✅ AIXORD_CHATGPT_PLUS.md
  ✅ AIXORD_CHATGPT_FREE.md
  ✅ AIXORD_CLAUDE_DUAL.md
  ✅ AIXORD_CLAUDE_PRO.md
  ✅ AIXORD_GEMINI_ADVANCED.md
  ✅ AIXORD_DEEPSEEK_API.md
  
  ❌ AIXORD_PRO_CHATGPT.md              (wrong order)
  ❌ CHATGPT_PRO.md                     (missing AIXORD prefix)
```

---

### Rule 4: Reference Files Have Fixed Names

```
FIXED NAMES (No platform prefix, no version):
  AIXORD_PHASE_DETAILS.md        - Extended phase behaviors
  PURPOSE_BOUND_OPERATION_SPEC.md - Purpose-bound specification
  
FIXED NAMES (Standard package files):
  README.md                      - Quick start guide
  LICENSE.md                     - Usage rights
  LICENSE_KEY.txt                - License certificate
  DISCLAIMER.md                  - Legal terms
  CHANGELOG.md                   - Version history (optional)
```

---

### Rule 5: Template Files Have Fixed Names

```
FIXED NAMES (Templates):
  AIXORD_GENESIS.md              - Genesis workflow (idea-to-system)
  MASTER_SCOPE_TEMPLATE.md       - Project vision template
  SCOPE_TEMPLATE.md              - Feature scope template
  HANDOFF_TEMPLATE.md            - Session handoff template
  AIXORD_UNIVERSAL_ENHANCED.md   - Enhanced universal variant
```

---

### Rule 6: Example Files Have EXAMPLE Prefix

```
PATTERN: EXAMPLE_[TYPE].[ext]

EXAMPLES:
  ✅ EXAMPLE_STATE.json
  ✅ EXAMPLE_SCOPE.md
  ✅ EXAMPLE_HANDOFF.md
  
  ❌ STATE_EXAMPLE.json           (wrong order)
  ❌ example_state.json           (wrong case)
```

---

### Rule 7: Platform Guide Files Use PLATFORM_GUIDE Infix

```
PATTERN: AIXORD_PLATFORM_GUIDE_[PLATFORM].md

EXAMPLES:
  ✅ AIXORD_PLATFORM_GUIDE_CHATGPT.md
  ✅ AIXORD_PLATFORM_GUIDE_CLAUDE.md
  ✅ AIXORD_PLATFORM_GUIDE_OTHER.md
  
  ❌ AIXORD_CHATGPT_GUIDE.md      (missing PLATFORM_GUIDE)
  ❌ PLATFORM_GUIDE_CHATGPT.md    (missing AIXORD prefix)
```

---

## 📋 COMPLETE FILE NAME REFERENCE

### Governance Files (Versioned)

| Platform | Full Governance | Condensed |
|----------|-----------------|-----------|
| ChatGPT | `AIXORD_GOVERNANCE_CHATGPT_V3.2.1.md` | `AIXORD_GOVERNANCE_CHATGPT_GPT.md` |
| Claude | `AIXORD_GOVERNANCE_CLAUDE_V3.2.1.md` | `AIXORD_GOVERNANCE_CLAUDE_PROJECT.md` |
| Gemini | `AIXORD_GOVERNANCE_GEMINI_V3.2.1.md` | `AIXORD_GOVERNANCE_GEMINI_GEM.md` |
| DeepSeek | `AIXORD_GOVERNANCE_DEEPSEEK_V3.2.1.md` | `AIXORD_GOVERNANCE_DEEPSEEK_CONDENSED.md` |
| Copilot | `AIXORD_GOVERNANCE_COPILOT_V3.2.1.md` | N/A |
| Universal | `AIXORD_GOVERNANCE_UNIVERSAL_V3.2.1.md` | `AIXORD_GOVERNANCE_UNIVERSAL_CONDENSED.md` |
| Complete | `AIXORD_GOVERNANCE_MASTER_V3.2.1.md` | N/A |

### State Files (Versioned)

| Platform | State File |
|----------|------------|
| ChatGPT | `AIXORD_STATE_CHATGPT_V3.2.1.json` |
| Claude | `AIXORD_STATE_CLAUDE_V3.2.1.json` |
| Gemini | `AIXORD_STATE_GEMINI_V3.2.1.json` |
| DeepSeek | `AIXORD_STATE_DEEPSEEK_V3.2.1.json` |
| Copilot | `AIXORD_STATE_COPILOT_V3.2.1.json` |
| Universal | `AIXORD_STATE_UNIVERSAL_V3.2.1.json` |
| Genesis | `AIXORD_STATE_GENESIS_V3.2.1.json` |
| Complete | `AIXORD_STATE_MASTER_V3.2.1.json` |

### Tier Guides (Non-Versioned)

| Platform | Tier Files |
|----------|------------|
| ChatGPT | `AIXORD_CHATGPT_PRO.md`, `AIXORD_CHATGPT_PLUS.md`, `AIXORD_CHATGPT_FREE.md` |
| Claude | `AIXORD_CLAUDE_DUAL.md`, `AIXORD_CLAUDE_PRO.md`, `AIXORD_CLAUDE_FREE.md` |
| Gemini | `AIXORD_GEMINI_ADVANCED.md`, `AIXORD_GEMINI_FREE.md` |
| DeepSeek | `AIXORD_DEEPSEEK_API.md`, `AIXORD_DEEPSEEK_CHAT.md`, `AIXORD_DEEPSEEK_FREE.md` |
| Copilot | `AIXORD_COPILOT.md` |

---

## 🚫 FORBIDDEN PATTERNS

### Never Use These Patterns

| Pattern | Why Forbidden | Correct Form |
|---------|---------------|--------------|
| `AIXORD_GOVERNANCE_V3.2.1.md` | Missing platform | `AIXORD_GOVERNANCE_[PLATFORM]_V3.2.1.md` |
| `AIXORD_STATE_V3.2.1.json` | Missing platform | `AIXORD_STATE_[PLATFORM]_V3.2.1.json` |
| `GOVERNANCE_GEMINI.md` | Missing AIXORD prefix | `AIXORD_GOVERNANCE_GEMINI_V3.2.1.md` |
| `aixord_governance.md` | Wrong case | `AIXORD_GOVERNANCE_[PLATFORM]_V[X.X.X].md` |
| `AIXORD-GOVERNANCE-GEMINI.md` | Wrong separator | Use underscores `_` not hyphens `-` |
| `AIXORD_V3.2.1_GOVERNANCE.md` | Wrong order | Version comes LAST |

---

## 🔍 VALIDATION SCRIPT

```bash
#!/bin/bash
# validate_naming.sh - Check AIXORD file naming compliance

echo "=== AIXORD Naming Convention Validator ==="

# Check for forbidden patterns
echo -e "\n❌ Checking for forbidden patterns..."

# Pattern 1: AIXORD_GOVERNANCE_V without platform
if ls AIXORD_GOVERNANCE_V*.md 2>/dev/null | grep -v "_[A-Z]*_V"; then
    echo "ERROR: Found governance file without platform identifier"
    exit 1
fi

# Pattern 2: AIXORD_STATE_V without platform
if ls AIXORD_STATE_V*.json 2>/dev/null | grep -v "_[A-Z]*_V"; then
    echo "ERROR: Found state file without platform identifier"
    exit 1
fi

# Pattern 3: Version mismatch
echo -e "\n🔍 Checking version consistency..."
versions=$(grep -h "Version.*3\." *.md *.json 2>/dev/null | grep -o "3\.[0-9.]*" | sort -u)
if [ $(echo "$versions" | wc -l) -gt 1 ]; then
    echo "ERROR: Multiple versions found: $versions"
    exit 1
fi

echo -e "\n✅ All naming conventions validated"
```

---

## 📝 VERSION UPDATE PROCEDURE

When updating to a new version (e.g., 3.2.1 → 3.3.0):

### Step 1: Identify Files to Rename

```bash
# Find all versioned files
find . -name "AIXORD_*_V*.md" -o -name "AIXORD_*_V*.json"
```

### Step 2: Rename Pattern

```bash
# OLD: AIXORD_GOVERNANCE_GEMINI_V3.2.1.md
# NEW: AIXORD_GOVERNANCE_GEMINI_V3.3.0.md

# Rename command
mv AIXORD_GOVERNANCE_GEMINI_V3.2.1.md AIXORD_GOVERNANCE_GEMINI_V3.3.0.md
```

### Step 3: Update Internal Version References

```bash
# Update version string inside file
sed -i 's/Version: 3.2.1/Version: 3.3.0/g' AIXORD_GOVERNANCE_GEMINI_V3.3.0.md
```

### Step 4: Delete Old Version Files

```bash
# ONLY after new version verified
rm AIXORD_GOVERNANCE_GEMINI_V3.2.1.md
rm AIXORD_STATE_GEMINI_V3.2.1.json
```

### Step 5: Update FILE_REGISTRY.md

Update all references in AIXORD_FILE_REGISTRY.md to new version.

---

## 🎯 ENFORCEMENT

### Pre-Commit Check

Before any commit, verify:

1. ☐ All versioned files include platform identifier
2. ☐ All files follow correct naming pattern
3. ☐ No forbidden patterns exist
4. ☐ All versions match within package
5. ☐ FILE_REGISTRY.md is updated

### CI/CD Integration

```yaml
# .github/workflows/naming-check.yml
name: AIXORD Naming Check
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate naming
        run: ./scripts/validate_naming.sh
```

---

*AIXORD NAMING CONVENTION v3.2.1 — Consistency Through Discipline*
*© 2026 PMERIT LLC. All Rights Reserved.*
