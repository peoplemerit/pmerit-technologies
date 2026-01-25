"""
Expand short manuscripts to meet KDP 24-page minimum.

Uses content from AIXORD_v4.2_COMPACT_CORE.md and AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_2.md
to add appropriate sections to manuscripts under 24 pages (~6,600 words).

Usage:
    python expand_short_manuscripts.py              # Expand all short manuscripts
    python expand_short_manuscripts.py AIXORD_for_Phi   # Expand specific manuscript
"""

import os
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
STAGING_DIR = SCRIPT_DIR.parent / "staging"
BASE_DIR = SCRIPT_DIR.parent

# Target: ~6,600 words for 24 pages at 6x9 format (275 words/page)
# DOCX conversion strips some content, so we need extra buffer
TARGET_WORDS = 7200  # Buffer for conversion loss

# Content sections to add for expansion (from AIXORD v4.2 baseline)
EXPANSION_SECTIONS = {
    "quality_framework": '''

### The Seven Quality Dimensions

AIXORD includes a comprehensive quality assessment framework that evaluates every deliverable across seven dimensions. This framework ensures professional-grade output regardless of which AI assistant you use.

**Dimension 1: Best Practices**

Every deliverable must follow industry-standard approaches. This means using established patterns, following security guidelines, and applying proven methodologies. AI assistants are instructed to aggregate their knowledge and proactively apply best practices rather than waiting for you to specify them.

**Dimension 2: Completeness**

All requirements must be addressed. A deliverable cannot be marked complete if it only partially fulfills the specification. AIXORD forces explicit tracking of requirements against implementation.

**Dimension 3: Accuracy**

Information must be factually correct and verified. When certainty varies, AIXORD requires the AI to communicate confidence levels:
- HIGH confidence: Multiple authoritative sources confirm
- MEDIUM confidence: Single source or inference
- LOW confidence: AI reasoning only
- UNVERIFIED: Recommend external verification

**Dimension 4: Sustainability**

Deliverables must be maintainable long-term. This dimension evaluates whether the work can be understood, modified, and extended by others. Code without documentation, clever but obscure solutions, and tightly coupled components fail sustainability assessment.

**Dimension 5: Reliability**

Work must handle errors and edge cases gracefully. Systems that crash under unusual conditions, ignore error states, or assume perfect inputs fail reliability assessment.

**Dimension 6: User-Friendliness**

Output must be intuitive and well-documented. Technical excellence means nothing if users cannot understand or use the result effectively.

**Dimension 7: Accessibility**

Deliverables must follow inclusive design principles. This applies to documentation, interfaces, and any user-facing components.

**Quality Enforcement**

Any dimension marked FAIL blocks progression unless the Director explicitly accepts the trade-off. Each assessment requires evidence or justification — unsupported "PASS" ratings are invalid.

''',

    "task_classification": '''

### Task Classification System

Not every task requires full AIXORD ceremony. The framework recognizes that a simple typo fix shouldn't require the same governance as a platform migration.

**TRIVIAL Tasks**

Criteria: Less than 5 minutes, fully reversible, no dependencies.
Required governance: Director approval only.
Example: "Fix typo in README"

**SIMPLE Tasks**

Criteria: Less than 1 hour, single deliverable.
Required governance: Deliverable definition plus steps.
Example: "Add logout button"

**STANDARD Tasks**

Criteria: Multiple deliverables with dependencies.
Required governance: Full AIXORD formula.
Example: "Build authentication system"

**COMPLEX Tasks**

Criteria: Multi-session, high risk, significant dependencies.
Required governance: Full formula plus risk assessment.
Example: "Platform migration"

The classification flow works as follows:
1. AI proposes task class based on scope analysis
2. Director confirms or overrides the classification
3. Classification is recorded in STATE
4. Governance scales accordingly

This prevents the framework from becoming bureaucratic overhead while ensuring complex work receives appropriate structure.

''',

    "command_reference": '''

### Command Reference

AIXORD uses explicit commands to control session behavior. These commands are case-insensitive and typo-tolerant.

**Activation Commands**

- `PMERIT CONTINUE` — Start or resume an AIXORD session
- `CHECKPOINT` — Save current progress and continue working
- `HANDOFF` — Full save with session end
- `RECOVER` — Rebuild state from HANDOFF document

**Approval Commands**

- `APPROVED` — Authorize the proposed action
- `APPROVED: [scope]` — Authorize only the specified scope
- `EXECUTE` or `DO IT` — Authorize execution
- `YES, PROCEED` — Explicit confirmation

**Control Commands**

- `HALT` — Stop execution and return to decision mode
- `RESET: [PHASE]` — Return to a specific phase
- `EXPAND SCOPE: [topic]` — Request scope expansion
- `SHOW SCOPE` — Display current scope boundaries

**Quality Commands**

- `QUALITY CHECK` — Trigger seven-dimension evaluation
- `SOURCE CHECK` — Request sources for claims

**Navigation Commands**

- `SHOW DAG` — Display the dependency graph
- `DAG STATUS` — Show current DAG state
- `SHOW STATE` — Display current session state

Understanding these commands allows you to maintain precise control over your AI collaboration sessions.

''',

    "artifact_binding": '''

### Artifact Binding and Persistence

One of the most critical concepts in AIXORD is artifact binding. This addresses a fundamental limitation of AI chat systems: they do not reliably persist files or remember generated content across sessions.

**The Core Problem**

When you ask an AI to create a document, that document exists only in the chat window. If you start a new session, the AI has no memory of what it created. If the platform loses the conversation, the document is gone.

Worse, many AI systems will confidently act as if they remember files they generated previously. They will reference non-existent documents, claim to see folder structures that were never created, and proceed with work based on artifacts that no longer exist.

**The Artifact Binding Solution**

AIXORD requires explicit artifact binding. This means:

1. When the AI generates any artifact intended for future use, it must instruct you to save it externally
2. You must confirm the save before the AI considers the artifact "bound"
3. On resume, all artifacts must be re-bound by providing confirmation they still exist
4. The AI cannot act on unbound artifacts

**Binding Methods**

AIXORD accepts several confirmation methods:
- VISUAL: Screenshot or file explorer image showing the saved file
- TEXTUAL: Pasting the file contents or directory listing
- HASH: Providing a cryptographic hash of the file
- PLATFORM: Sharing a link (Google Drive, GitHub, Dropbox)
- ATTESTATION: Simple statement that the file was saved (low assurance)

**Why This Matters**

Without artifact binding, AI conversations eventually collapse. The AI makes assumptions about what exists, acts on those assumptions, and produces work that conflicts with reality. Artifact binding prevents this failure mode by requiring explicit verification.

''',

    "conservation_law": '''

### The Conservation Law

AIXORD v4.2 introduces the Conservation Law, an accounting-grade principle that prevents AI systems from producing more than was documented and approved.

**The Equation**

```
EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION
```

This means that everything that exists or will exist must equal what was already verified plus what the AIXORD formula authorizes.

**Why This Matters**

Without conservation, AI systems tend toward scope creep. They add features you didn't request, modify systems that were working fine, and produce parallel implementations instead of extensions.

The Conservation Law makes this structurally impossible. If something isn't in the verified reality or the approved formula, it cannot be executed.

**Brownfield vs Greenfield**

The Conservation Law distinguishes between two types of projects:

GREENFIELD: No verified execution exists. The formula governs the entire system. You're building from scratch.

BROWNFIELD-EXTEND: Verified execution exists and must be preserved. The formula governs only the delta — the new work being added.

BROWNFIELD-REPLACE: Verified execution exists but replacement is authorized. Specific scopes are unlocked for modification.

**Practical Application**

When you start an AIXORD session, you declare your reality classification. If you're extending an existing system, you list the scopes that must be conserved. Any attempt to rebuild a conserved scope triggers a HALT — the AI cannot proceed without explicit unlock authorization.

This prevents the common failure mode where an AI, lacking context about what already works, cheerfully rebuilds your entire system from scratch.

''',

    "phases_kingdoms": '''

### Phases and Kingdoms

AIXORD organizes work into three kingdoms, each containing specific phases. This structure ensures you always know where you are in the project lifecycle.

**The Three Kingdoms**

**IDEATION Kingdom**
Purpose: Explore, discover, decide
Phases: DISCOVER, BRAINSTORM
Activities: Research, idea generation, requirements gathering

**BLUEPRINT Kingdom**
Purpose: Convert intent to buildable form
Phases: PLAN, BLUEPRINT, SCOPE
Activities: Architecture, specification, dependency mapping

**REALIZATION Kingdom**
Purpose: Execute, verify, lock
Phases: EXECUTE, AUDIT, VERIFY, LOCK
Activities: Implementation, testing, quality assessment, completion

**Phase Flow**

The canonical phase order is:
```
SETUP → DISCOVER → BRAINSTORM → PLAN → BLUEPRINT → SCOPE → EXECUTE → AUDIT → VERIFY → LOCK
```

**Transition Rules**

Moving to EXECUTE requires explicit Director approval. You cannot accidentally start building — the AI must wait for your go-ahead.

Kingdom transitions require gate completion. You cannot enter BLUEPRINT kingdom without completing IDEATION gates. You cannot enter REALIZATION without completing BLUEPRINT gates.

Regression — moving backward in phases — requires Director acknowledgment. This ensures intentional navigation rather than drift.

''',

    "execution_modes": '''

### Execution Modes

AIXORD supports three execution modes that balance control with efficiency.

**STRICT Mode**

Every action requires explicit approval. The AI proposes, you approve, the AI executes. Nothing happens without your explicit authorization.

Use STRICT mode for:
- Production systems
- Critical infrastructure
- High-risk changes
- Learning the framework

**SUPERVISED Mode**

Batch approval is allowed. You can approve a set of related actions at once rather than one-by-one.

Use SUPERVISED mode for:
- Testing and iteration
- Low-risk changes
- Established patterns

**SANDBOX Mode**

Pre-authorized exploration within defined boundaries. You declare a sandbox scope (for example: "experiment with CSS, no backend changes"), and the AI operates freely within those bounds.

Use SANDBOX mode for:
- Creative exploration
- Prototyping
- Learning new technologies

**Sandbox Rules**

When in SANDBOX mode:
- All actions are logged
- AI cannot modify outside sandbox scope
- Auto-expires after time or action limit
- Director reviews summary at session end

The default mode is STRICT. This ensures maximum control until you explicitly relax governance for specific contexts.

''',

    "practical_tips": '''

### Practical Tips for Success

After working with AIXORD across hundreds of projects, certain patterns consistently lead to success.

**Start with Clear Objectives**

Vague objectives produce vague results. "Make my app better" gives the AI no boundaries. "Add user authentication with email/password login" gives it a target. Spend time crafting a precise objective before starting work.

**Trust the Process**

The phases and gates exist for reasons. Skipping BLUEPRINT to jump into EXECUTE feels faster but leads to rework. The few minutes spent in proper planning save hours of fixing mistakes.

**Use Checkpoints Liberally**

Don't wait for perfect stopping points. CHECKPOINT every time you complete something meaningful. Context degradation is real — the AI's responses become less accurate as conversations grow longer.

**Verify Artifacts Exist**

When the AI says it created a file, verify the file actually exists before moving forward. Screenshot, paste contents, or use the verification scripts. Assumptions about artifact persistence cause project failures.

**Classify Reality Honestly**

If you have existing code that works, declare BROWNFIELD-EXTEND. Don't let the AI rebuild what already functions. The Conservation Law only works if you're honest about what exists.

**Match Mode to Task**

Use STRICT mode for important work, SANDBOX mode for exploration. Fighting the framework's ceremony on trivial tasks creates friction; applying insufficient governance to critical tasks creates risk.

**Read the Handoffs**

Before starting a new session, actually read the previous HANDOFF document. Don't just say "PMERIT CONTINUE" and expect the AI to magically remember everything. You are the continuity guarantee.

'''
}


def count_words(text):
    """Count words in text"""
    return len(text.split())


def get_manuscript_word_count(filepath):
    """Get word count of a manuscript file"""
    content = filepath.read_text(encoding='utf-8')
    return count_words(content)


def determine_needed_expansion(current_words):
    """Determine how many words needed and which sections to add"""
    words_needed = TARGET_WORDS - current_words
    if words_needed <= 0:
        return [], 0

    # Select sections to add based on words needed
    sections_to_add = []
    words_added = 0

    # Priority order for adding sections
    section_priority = [
        "quality_framework",      # ~600 words
        "task_classification",    # ~350 words
        "artifact_binding",       # ~400 words
        "conservation_law",       # ~400 words
        "phases_kingdoms",        # ~350 words
        "execution_modes",        # ~350 words
        "command_reference",      # ~350 words
        "practical_tips",         # ~450 words
    ]

    for section_key in section_priority:
        if words_added >= words_needed:
            break
        section_content = EXPANSION_SECTIONS[section_key]
        section_words = count_words(section_content)
        sections_to_add.append((section_key, section_content))
        words_added += section_words

    return sections_to_add, words_added


def find_insertion_point(content):
    """Find the best place to insert expansion content"""
    # Look for "Part II" or "Part III" or similar section breaks
    patterns = [
        r'\n## Part II',
        r'\n## Part III',
        r'\n## Part 2',
        r'\n## Part 3',
        r'\n## Advanced',
        r'\n## Appendix',
        r'\n## Quick Reference',
        r'\n## Command Reference',
        r'\n---\n\n## ',  # Generic section break before a major section
    ]

    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return match.start()

    # If no good break point, insert before the last major section
    # Look for the last ## heading
    last_heading = None
    for match in re.finditer(r'\n## [^\n]+\n', content):
        last_heading = match

    if last_heading:
        return last_heading.start()

    # Fallback: append at end
    return len(content)


def expand_manuscript(filepath):
    """Expand a single manuscript to meet word target"""
    content = filepath.read_text(encoding='utf-8')
    current_words = count_words(content)

    if current_words >= TARGET_WORDS:
        return False, current_words, 0

    sections_to_add, words_added = determine_needed_expansion(current_words)

    if not sections_to_add:
        return False, current_words, 0

    # Build expansion content
    expansion_text = "\n\n---\n\n## Additional AIXORD Concepts\n\nThe following sections provide deeper coverage of key AIXORD concepts that apply across all AI platforms.\n"

    for section_key, section_content in sections_to_add:
        expansion_text += section_content

    # Find insertion point
    insertion_point = find_insertion_point(content)

    # Insert expansion
    new_content = content[:insertion_point] + expansion_text + content[insertion_point:]

    # Write back
    filepath.write_text(new_content, encoding='utf-8')

    new_word_count = count_words(new_content)
    return True, new_word_count, len(sections_to_add)


def main():
    # Manuscripts that need expansion (from previous conversion results)
    short_manuscripts = [
        "AIXORD_for_Command_R_Plus",      # ~23.8 pages
        "AIXORD_for_Copilot",             # ~19.7 pages
        "AIXORD_for_DeepSeek",            # ~21.7 pages
        "AIXORD_for_Gemma",               # ~23.7 pages (new)
        "AIXORD_for_LLaMA",               # ~21.9 pages
        "AIXORD_for_Phi",                 # ~16.4 pages
        "AIXORD_Mistral",                 # ~21.4 pages
        "AIXORD_Perplexity",              # ~23.4 pages
    ]

    # Filter if specific file requested
    if len(sys.argv) > 1:
        search_term = sys.argv[1].lower()
        short_manuscripts = [m for m in short_manuscripts if search_term in m.lower()]

    if not short_manuscripts:
        print("No matching manuscripts found")
        return

    print(f"Expanding {len(short_manuscripts)} manuscript(s)...")
    print("=" * 60)

    results = []
    for manuscript_name in short_manuscripts:
        # Find the staging file
        staging_files = list(STAGING_DIR.glob(f"{manuscript_name}*.md"))
        if not staging_files:
            print(f"  {manuscript_name}: NOT FOUND in staging")
            continue

        filepath = staging_files[0]
        try:
            expanded, new_words, sections_added = expand_manuscript(filepath)
            pages = new_words / 275

            if expanded:
                status = "EXPANDED" if pages >= 24 else "STILL SHORT"
                print(f"  {filepath.name}: {new_words:,} words, ~{pages:.1f} pages ({sections_added} sections added) - {status}")
            else:
                print(f"  {filepath.name}: {new_words:,} words, ~{pages:.1f} pages - ALREADY OK")

            results.append((filepath.name, new_words, pages, expanded))
        except Exception as e:
            print(f"  {filepath.name}: ERROR - {e}")

    print("=" * 60)

    # Summary
    expanded_count = sum(1 for r in results if r[3])
    meets_target = sum(1 for r in results if r[2] >= 24)
    print(f"\nExpanded: {expanded_count} files")
    print(f"Meeting 24-page target: {meets_target}/{len(results)}")
    print("\nRun convert_md_to_kdp.py to regenerate DOCX files.")


if __name__ == '__main__':
    main()
