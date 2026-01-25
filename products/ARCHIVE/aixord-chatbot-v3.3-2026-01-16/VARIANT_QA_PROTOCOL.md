# VARIANT QA PROTOCOL — Platform Adaptation Quality Assurance

**Document ID:** VARIANT_QA_PROTOCOL
**Version:** 1.0
**Created:** January 2, 2026
**Location:** `products/aixord-chatbot/VARIANT_QA_PROTOCOL.md`
**Applies To:** All AIXORD platform variants (ChatGPT, Gemini, Copilot, DeepSeek, etc.)

---

## PURPOSE

This protocol ensures **complete platform adaptation** when creating AIXORD variants. It prevents the systematic error of copying a source template and missing embedded platform references.

**Root Cause Addressed:** LLMs performing shallow adaptation (filename + header changes) while missing 17+ internal platform references buried in large documents.

---

## MANDATORY PROTOCOL

### When This Protocol Applies

This protocol is **MANDATORY** whenever:
- Creating a new platform variant from a template
- Updating an existing variant with content from another platform
- Merging features from Claude version into other platforms
- Any task involving "create [Platform] variant" or "adapt for [Platform]"

---

## PHASE 1: PRE-CREATION CHECKLIST

Before creating ANY variant, confirm:

```
[ ] Source template identified (usually Claude master)
[ ] Target platform clearly defined
[ ] Platform-specific terminology mapped (see REPLACEMENT MAPS below)
[ ] Platform-specific features identified (Gems, Custom GPTs, etc.)
```

---

## PHASE 2: REPLACEMENT MAPS

### Map A: Claude → ChatGPT

| Find (Exact) | Replace With |
|--------------|--------------|
| `Claude Pro + Claude Code` | `ChatGPT Pro (with Custom GPT)` |
| `Claude Code` | `ChatGPT` |
| `Claude Web` | `ChatGPT` |
| `Claude Pro Only` | `ChatGPT Plus` |
| `Claude Pro` | `ChatGPT Pro` |
| `Claude Free` | `ChatGPT Free` |
| `free Claude` | `free ChatGPT` |
| `Claude (claude.ai)` | `ChatGPT (chat.openai.com)` |
| `claude.ai` | `chat.openai.com` |
| `Open Claude` | `Open ChatGPT` |
| `.claude/` | `.aixord/` |
| `Project Knowledge` | `Custom GPT Knowledge` |
| `claude_pro` | `chatgpt_pro` |
| `claude_code` | `custom_gpt` |

**State File Fields:**
```json
"environment": {
  "tier": "[A|B|C]",
  "chatgpt_pro": false,
  "custom_gpt": false,
  "code_interpreter": false
}
```

### Map B: Claude → Gemini

| Find (Exact) | Replace With |
|--------------|--------------|
| `Claude Pro + Claude Code` | `Gemini Advanced (with Gem)` |
| `Claude Code` | `Gemini` |
| `Claude Web` | `Gemini` |
| `Claude Pro Only` | `Gemini Advanced` |
| `Claude Pro` | `Gemini Advanced` |
| `Claude Free` | `Gemini Free` |
| `free Claude` | `free Gemini` |
| `Claude (claude.ai)` | `Gemini (gemini.google.com)` |
| `claude.ai` | `gemini.google.com` |
| `Open Claude` | `Open Gemini` |
| `.claude/` | `.aixord/` |
| `Project Knowledge` | `Gem Knowledge` |
| `claude_pro` | `gemini_advanced` |
| `claude_code` | `gem_enabled` |

**State File Fields:**
```json
"environment": {
  "tier": "[A|B|C]",
  "gemini_advanced": false,
  "gem_enabled": false,
  "google_workspace": false
}
```

### Map C: Claude → Copilot

| Find (Exact) | Replace With |
|--------------|--------------|
| `Claude Pro + Claude Code` | `GitHub Copilot (with Workspace)` |
| `Claude Code` | `Copilot` |
| `Claude Web` | `Copilot Chat` |
| `Claude Pro Only` | `Copilot Individual` |
| `Claude Pro` | `Copilot Pro` |
| `Claude Free` | `Copilot Free` |
| `free Claude` | `free Copilot` |
| `Claude (claude.ai)` | `Copilot (github.com/copilot)` |
| `claude.ai` | `github.com/copilot` |
| `Open Claude` | `Open Copilot` |
| `.claude/` | `.aixord/` |
| `Project Knowledge` | `Workspace Context` |
| `claude_pro` | `copilot_pro` |
| `claude_code` | `workspace_enabled` |

**State File Fields:**
```json
"environment": {
  "tier": "[A|B|C]",
  "copilot_pro": false,
  "workspace_enabled": false,
  "github_integration": false
}
```

### Map D: Claude → DeepSeek

| Find (Exact) | Replace With |
|--------------|--------------|
| `Claude Pro + Claude Code` | `DeepSeek Pro` |
| `Claude Code` | `DeepSeek` |
| `Claude Web` | `DeepSeek` |
| `Claude Pro Only` | `DeepSeek Pro` |
| `Claude Pro` | `DeepSeek Pro` |
| `Claude Free` | `DeepSeek Free` |
| `free Claude` | `free DeepSeek` |
| `Claude (claude.ai)` | `DeepSeek (chat.deepseek.com)` |
| `claude.ai` | `chat.deepseek.com` |
| `Open Claude` | `Open DeepSeek` |
| `.claude/` | `.aixord/` |
| `Project Knowledge` | `Context Window` |
| `claude_pro` | `deepseek_pro` |
| `claude_code` | `api_enabled` |

**State File Fields:**
```json
"environment": {
  "tier": "[A|B|C]",
  "deepseek_pro": false,
  "api_enabled": false
}
```

---

## PHASE 3: SECTION-SPECIFIC REWRITES

These sections require **COMPLETE REWRITE**, not just find/replace:

| Section | Content Type | Why Rewrite Needed |
|---------|--------------|-------------------|
| Section 2 | Environment Detection | Platform-specific tiers differ |
| Section 12 | Setup Instructions | Completely different UX per platform |
| Section 13 | Free Tier Setup | Platform-specific steps |

### Section Templates

**Section 2 Template Structure:**
```markdown
### Tier A: [Platform Premium with Feature]
- [Capability 1]
- [Capability 2]
- [Platform-specific feature]

### Tier B: [Platform Standard]
- [Capability description]
- [Limitation description]

### Tier C: [Platform Free]
- [Free tier capabilities]
- [Free tier limitations]

**I will ask:** "Do you have [Tier A name], [Tier B name], or are you using [Tier C name]?"
```

**Section 12 Template Structure:**
```markdown
## 12) [PLATFORM FEATURE] SETUP (For Tier A Users)

If you have [Platform Premium], I will guide you through setup:

### Initial Setup:
1. Go to [platform URL]
2. [Platform-specific step 1]
3. [Platform-specific step 2]
...

### Project Folder Structure:
[Platform-appropriate folder structure]

### Division of Labor:
| [Platform] (Architect) | You (Commander) |
|------------------------|-----------------|
| [Role 1] | [Role 1] |
...
```

---

## PHASE 4: VERIFICATION COMMANDS

### After EVERY Variant Creation, Run:

**PowerShell (Windows):**
```powershell
# 1. Check for source platform references (should return Count: 0)
Select-String -Path "staging\aixord-[platform]-pack\*.md" -Pattern "Claude" | Measure-Object
Select-String -Path "staging\aixord-[platform]-pack\*.json" -Pattern "Claude" | Measure-Object

# 2. Verify target platform appears frequently
Select-String -Path "staging\aixord-[platform]-pack\AIXORD_GOVERNANCE_*.md" -Pattern "[TargetPlatform]" | Measure-Object
# Expected: 50+ matches
```

**Bash/Unix:**
```bash
# 1. Check for source platform references (should return 0)
grep -c "Claude" AIXORD_GOVERNANCE_[PLATFORM]_*.md
grep -c "claude" AIXORD_STATE_[PLATFORM]_*.json

# 2. Full recursive check (should be empty)
grep -rn "Claude\|claude" *.md *.json

# 3. Verify platform name appears
grep -c "[TargetPlatform]" AIXORD_GOVERNANCE_[PLATFORM]_*.md
# Expected: 50+ occurrences
```

### Verification Acceptance Criteria

| Check | Pass Criteria |
|-------|---------------|
| Source platform references in .md | 0 matches |
| Source platform references in .json | 0 matches |
| Target platform in governance | 50+ matches |
| Sections 12-13 rewritten | Visual confirmation |

---

## PHASE 5: HANDOFF REQUIREMENTS

Every variant-creation HANDOFF **MUST** include:

```markdown
## VARIANT QA CHECKLIST (MANDATORY)

Before marking complete:

[ ] PHASE 2: All replacements from Map [X] applied
[ ] PHASE 3: Sections 2, 12, 13 completely rewritten
[ ] PHASE 4: Verification commands run
   - Select-String "Claude" governance = [result]
   - Select-String "claude" state = [result]
[ ] State file environment fields updated
[ ] README reflects correct platform
[ ] Tier names match platform conventions

## VERIFICATION RESULTS

```powershell
# Paste actual command output here
Select-String -Path "AIXORD_GOVERNANCE_[PLATFORM]_V3.2.1.md" -Pattern "Claude" | Measure-Object
# Result: Count: [number]
```
```

---

## INTEGRATION POINTS

### For Claude Web (Project Instructions)

Add to project instructions:
```
When creating or reviewing platform variants, ALWAYS reference:
products/aixord-chatbot/VARIANT_QA_PROTOCOL.md

Include VARIANT QA CHECKLIST in every variant-related HANDOFF.
```

### For Claude Code (CLAUDE.md)

Add to CLAUDE.md:
```
## VARIANT CREATION PROTOCOL

Before completing ANY variant creation task:
1. Read products/aixord-chatbot/VARIANT_QA_PROTOCOL.md
2. Apply appropriate Replacement Map
3. Rewrite sections 2, 12, 13
4. Run verification commands
5. Include results in completion report
```

### For HANDOFF Template

Add mandatory section:
```markdown
## VARIANT QA (If Applicable)

[ ] N/A - Not a variant task
[ ] Completed - See verification results below

[Verification output]
```

---

## ERROR RECOVERY

If platform reference errors are discovered post-creation:

### Quick Fix Script (PowerShell)
```powershell
# Set platform
$platform = "GEMINI"  # or CHATGPT, COPILOT, etc.
$file = "AIXORD_GOVERNANCE_${platform}_V3.2.1.md"

# Read
$content = Get-Content $file -Raw

# Apply map (example for Gemini)
$content = $content -replace 'Claude Pro \+ Claude Code', 'Gemini Advanced (with Gem)'
$content = $content -replace 'Claude Code', 'Gemini'
$content = $content -replace 'Claude Web', 'Gemini'
$content = $content -replace 'Claude Pro Only', 'Gemini Advanced'
$content = $content -replace 'Claude Pro', 'Gemini Advanced'
$content = $content -replace 'Claude Free', 'Gemini Free'
$content = $content -replace 'free Claude', 'free Gemini'
$content = $content -replace 'claude\.ai', 'gemini.google.com'
$content = $content -replace '\.claude/', '.aixord/'
$content = $content -replace 'Open Claude', 'Open Gemini'

# Write
Set-Content $file -Value $content

# Verify
$count = (Select-String -Path $file -Pattern "Claude" -AllMatches).Matches.Count
Write-Host "Remaining Claude references: $count (should be 0)"
```

---

## REVISION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-02 | Initial protocol after discovering systematic variant errors |

---

*VARIANT QA PROTOCOL — Preventing platform reference errors through systematic verification.*
*AIXORD v3.2.1 — Purpose-Bound. Disciplined. Focused.*
