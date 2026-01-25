# Making the KDP Tool Default for Claude Code

**Purpose:** Ensure Claude Code automatically uses the KDP Manuscript Converter tool for all publishing work without needing reminders.

---

## THE SOLUTION: Add to CLAUDE.md

Claude Code reads its instructions from the `CLAUDE.md` file in the repository root (or `.claude/CLAUDE.md`). By adding a **PMERIT TOOLS** section, Claude Code will automatically know about and use the KDP tool.

---

## SECTION TO ADD TO CLAUDE.md

Add this section to Claude Code's project instructions:

```markdown
---

## PMERIT TOOLS (Standard Assets)

PMERIT has standard tools for common tasks. **Always check for and use these tools before implementing custom solutions.**

### Tool Registry Location
```
C:\dev\pmerit\AIXORD_ROOT\TOOLS\TOOL_REGISTRY.json
```

### Available Tools

#### KDP Manuscript Converter
| Field | Value |
|-------|-------|
| **Location** | `AIXORD_ROOT\TOOLS\kdp-manuscript-converter\` |
| **Purpose** | Convert Markdown manuscripts to KDP-ready DOCX |
| **When to Use** | ANY book/manuscript creation for Amazon KDP |
| **Read First** | `README.md` in the tool folder |

**Usage:**
1. Read the tool's README.md before starting
2. Use the KDP_Template_6x9.docx as reference document
3. Follow the tool's documented conversion process
4. Do NOT use generic pandoc commands — use the tool's scripts

**Trigger Phrases:**
- "create manuscript"
- "convert to DOCX"
- "KDP book"
- "publish to Amazon"
- "generate book"

#### Future Tools
Additional tools will be registered in TOOL_REGISTRY.json. Check the registry when working on:
- Publishing tasks
- Document conversion
- Template generation

---

## TOOL USAGE PROTOCOL

1. **Before any publishing/document task:** Check if a PMERIT tool exists
2. **If tool exists:** Read its README.md, then use it
3. **If no tool exists:** Implement solution, consider proposing it as a new tool
4. **After using tool:** Verify output meets requirements

---
```

---

## WHERE TO ADD THIS

### Option A: Add to Existing CLAUDE.md (Recommended)

Location: `C:\dev\pmerit\Pmerit_Product_Development\.claude\CLAUDE.md`

Add the PMERIT TOOLS section after the existing content.

### Option B: Create Tool-Specific Instructions File

Create: `C:\dev\pmerit\Pmerit_Product_Development\.claude\TOOLS.md`

Then reference it from CLAUDE.md:
```markdown
## Additional Instructions
- See TOOLS.md for PMERIT standard tools
```

---

## HANDOFF FOR CLAUDE CODE

To make this permanent, send this to Claude Code:

```
Add the PMERIT TOOLS section to the project's CLAUDE.md file. 

Location: C:\dev\pmerit\Pmerit_Product_Development\.claude\CLAUDE.md

This section should instruct future Claude Code sessions to:
1. Check AIXORD_ROOT\TOOLS\ for available tools before any publishing task
2. Always read tool README.md before using
3. Use the KDP Manuscript Converter for all KDP/Amazon book work
4. Never use generic pandoc commands when the KDP tool is available

After adding, verify the section is present and properly formatted.
```

---

## VERIFICATION

After Claude Code adds the section, test by starting a new session and asking:

> "I need to create a manuscript for KDP"

Claude Code should:
1. ✅ Mention the KDP Manuscript Converter tool
2. ✅ Reference AIXORD_ROOT\TOOLS\kdp-manuscript-converter\
3. ✅ Offer to read the README.md first
4. ❌ NOT jump straight to generic pandoc commands

---

## WHY THIS WORKS

Claude Code reads CLAUDE.md at session start. By including:
- **Tool locations** — It knows where to look
- **Trigger phrases** — It recognizes when to use the tool
- **Protocol** — It knows to read documentation first
- **Explicit instruction** — "Do NOT use generic pandoc commands"

This creates **automatic tool awareness** without per-session reminders.

---

## FUTURE TOOLS

When you create new standard tools:

1. Add to `AIXORD_ROOT\TOOLS\`
2. Include README.md in the tool folder
3. Register in `TOOL_REGISTRY.json`
4. Add entry to CLAUDE.md's PMERIT TOOLS section

This creates a scalable system where all PMERIT tools are discoverable and automatically used.
