# HANDOFF — Gemini Variant Fixes (v3.1.1)

**Date:** January 1, 2026
**From:** Claude Web (Architect)
**To:** Claude Code (Commander)
**Priority:** HIGH

---

## OBJECTIVE

Update the `aixord-gemini-pack.zip` and `MANUSCRIPT_GEMINI.docx` with Gemini-specific files that properly support both Free and Advanced tiers, including the Gems feature for Advanced users.

---

## CONTEXT

Testing revealed that the universal governance file asks about Claude tiers instead of Gemini tiers. Additionally, Gemini Advanced users have the **Gems** feature which allows persistent instructions and knowledge uploads — equivalent to Claude Projects (Tier A capability).

### Tier Mapping Update

| Gemini Plan | Old Mapping | New Mapping | Why |
|-------------|-------------|-------------|-----|
| Advanced + Gem | Tier B | **Tier A** | Gems = persistent instructions + knowledge |
| Advanced (no Gem) | Tier B | Tier B | Same as before |
| Free | Tier C | Tier C | Same as before |

---

## FILES TO USE

The following files have been created by Claude Web and are ready for use:

**Source Location:** `/mnt/user-data/uploads/` or present in this handoff

| File | Purpose |
|------|---------|
| `AIXORD_GOVERNANCE_GEMINI_V3.1.md` | Gemini-specific governance (replaces universal) |
| `AIXORD_GEMINI_ADVANCED.md` | Quick-start for Advanced users (Gems setup) |
| `AIXORD_GEMINI_FREE.md` | Quick-start for Free users (paste workflow) |
| `README.md` | Updated package README |

---

## TASK 1: Update ZIP Package

### Location
```
C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\aixord-gemini-pack.zip
```

### Actions

1. **Extract** current ZIP to staging folder

2. **Replace/Add** these files:
   | Action | File | Notes |
   |--------|------|-------|
   | REPLACE | `AIXORD_GOVERNANCE_V3.1.md` | Replace with `AIXORD_GOVERNANCE_GEMINI_V3.1.md` |
   | REPLACE | `README.md` | Replace with new Gemini-specific README |
   | ADD | `AIXORD_GEMINI_ADVANCED.md` | New file |
   | ADD | `AIXORD_GEMINI_FREE.md` | New file |
   | KEEP | `AIXORD_STATE_V3.1.json` | No change |
   | KEEP | `LICENSE.md` | No change |
   | KEEP | `LICENSE_KEY.txt` | No change |
   | KEEP | `DISCLAIMER.md` | No change |

3. **Rename governance file in ZIP:**
   - The file should be named `AIXORD_GOVERNANCE_GEMINI_V3.1.md` (not generic V3.1)

4. **Repackage** as `aixord-gemini-pack.zip`

5. **Verify** ZIP contains:
   ```
   aixord-gemini-pack.zip/
   ├── AIXORD_GOVERNANCE_GEMINI_V3.1.md   ← Gemini-specific
   ├── AIXORD_GEMINI_ADVANCED.md          ← NEW
   ├── AIXORD_GEMINI_FREE.md              ← NEW
   ├── AIXORD_STATE_V3.1.json
   ├── README.md                          ← Updated
   ├── LICENSE.md
   ├── LICENSE_KEY.txt
   └── DISCLAIMER.md
   ```

---

## TASK 2: Update Manuscript

### Location
```
C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\MANUSCRIPT_GEMINI.md
```

### Content Updates Required

#### Update Chapter: "Setting Up for Gemini"

Replace the current setup chapter with TWO paths:

**Path A: Gemini Advanced (Gems Setup)**
- Explain what Gems are
- Step-by-step Gem creation
- How to add governance to Instructions
- How to add project files to Knowledge
- Benefits of Gems vs paste method

**Path B: Gemini Free (Paste Setup)**
- Explain the activation message requirement
- Copy-paste template
- Session start workflow
- Session end (HANDOFF) workflow
- Folder structure for local files

#### Update Chapter: "Quick Start"

Ensure it covers:
1. How to identify your tier (Advanced vs Free)
2. Quick reference for both workflows
3. First command: `PMERIT CONTINUE`

#### Update Chapter: "Prerequisites"

Add:
- Gemini Advanced benefits (Gems, larger context)
- Gemini Free limitations (paste each time, smaller context)
- Recommendation to use Gems if available

#### Add to FAQ:

```markdown
**Q: What are Gems and do I need them?**
A: Gems are custom AI personas available to Gemini Advanced subscribers. 
They let you set persistent instructions so you don't have to paste the 
governance file every session. Highly recommended if you have Advanced.

**Q: Why do I have to paste the governance every time?**
A: Gemini Free doesn't have the Gems feature, so there's no way to save 
persistent instructions. The paste method ensures AIXORD rules are active 
each session.

**Q: Can I switch between Gemini Free and Advanced?**
A: Yes. If you upgrade to Advanced, create an AIXORD Gem for a better 
experience. Your HANDOFF files will still work.
```

---

## TASK 3: Regenerate DOCX

After updating MANUSCRIPT_GEMINI.md:

1. **Use KDP Tool:**
   ```
   cd C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter
   ```

2. **Run conversion:**
   Follow README.md in the tool folder

3. **Output:** `MANUSCRIPT_GEMINI.docx` (KDP-ready)

---

## ACCEPTANCE CRITERIA

### ZIP Package
- [ ] Contains `AIXORD_GOVERNANCE_GEMINI_V3.1.md` (not generic)
- [ ] Contains `AIXORD_GEMINI_ADVANCED.md` (new)
- [ ] Contains `AIXORD_GEMINI_FREE.md` (new)
- [ ] README.md mentions both Advanced and Free workflows
- [ ] DISCLAIMER.md present
- [ ] All 8 files present

### Manuscript
- [ ] Setup chapter covers BOTH Advanced (Gems) and Free (Paste)
- [ ] Gems feature explained for Advanced users
- [ ] Activation message template included for Free users
- [ ] FAQ updated with Gemini-specific questions
- [ ] Tier detection now asks about Gemini, not Claude
- [ ] DOCX regenerated and formatted for KDP

### Governance File
- [ ] Section 2 asks: "Gem, Advanced, or Free?" (not Claude)
- [ ] Section 7 explains Gem setup (not Claude Code)
- [ ] Section 8 explains Free tier paste workflow
- [ ] Gumroad URL is correct: `https://meritwise0.gumroad.com/l/qndnd`

---

## FILES ATTACHED

The following files are provided with this handoff (created by Claude Web):

1. `AIXORD_GOVERNANCE_GEMINI_V3.1.md` — Complete Gemini-specific governance
2. `AIXORD_GEMINI_ADVANCED.md` — Advanced user quick-start
3. `AIXORD_GEMINI_FREE.md` — Free user quick-start
4. `README.md` — Updated package README

---

## NOTES

- This is a **variant-specific fix** — do not apply to other packages
- Other platform packages (Claude, ChatGPT, Copilot) will get similar treatment in separate sessions
- The `aixord-complete.zip` will eventually need a universal governance file with platform detection
- Discount code for Gemini remains: `AX-GEM-6R4T`
- Gumroad URL slug is `/qndnd`

---

*HANDOFF prepared by Claude Web (Architect)*
*Awaiting Director approval, then execute*
