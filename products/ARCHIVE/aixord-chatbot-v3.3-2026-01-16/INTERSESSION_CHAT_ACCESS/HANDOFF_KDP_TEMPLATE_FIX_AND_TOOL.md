# HANDOFF — KDP Template Fix + PMERIT Tool Creation

**Date:** December 31, 2025
**From:** Claude Web (Architect)
**To:** Claude Code (Commander)
**Priority:** HIGH — Blocking manuscript production

---

## EXECUTIVE SUMMARY

The Pandoc-generated manuscripts have two critical issues:
1. **TOC not working** — Heading styles not mapping to Word's built-in styles
2. **Page count insufficient** — 21 pages, need 24+ for KDP

This HANDOFF:
- Fixes the reference template
- Adds content to reach 24+ pages
- Creates a reusable PMERIT tool for future publications

---

## PROBLEM ANALYSIS

### Issue 1: Table of Contents Not Working

**Symptom:** "No table of contents entries found" in Word

**Root Cause:** Pandoc creates headings, but the reference template doesn't have properly defined Heading 1/2/3 styles that Word recognizes for TOC generation.

**Solution:** Create a reference template with explicitly defined heading styles.

### Issue 2: Page Count Insufficient

**Symptom:** 21 pages instead of 24+ required by KDP

**Root Cause:** Content is lean; no padding content

**Solution:** 
- Add substantive content (~2 pages)
- Adjust line spacing (1.15 → 1.3)
- Add standard book elements (half-title, section dividers)

---

## PHASE 1: CREATE PROPER REFERENCE TEMPLATE

### Option A: Python python-docx Approach (RECOMMENDED)

Use python-docx to create a template with properly defined styles.

```powershell
# Install python-docx if not present
pip install python-docx
```

### Create Template Script

Create file: `C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter\create-kdp-template.py`

```python
"""
PMERIT KDP Template Generator
Creates a properly formatted 6x9 reference template for Pandoc
"""

from docx import Document
from docx.shared import Inches, Pt, Twips
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def create_kdp_template(output_path):
    """Create a KDP-compliant 6x9 reference template with proper styles."""
    
    doc = Document()
    
    # =========================================
    # PAGE SETUP: 6" x 9" with KDP margins
    # =========================================
    
    for section in doc.sections:
        # Page size: 6" x 9"
        section.page_width = Inches(6)
        section.page_height = Inches(9)
        
        # Margins (KDP recommended for 6x9)
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.76)  # Inside/gutter margin
        section.right_margin = Inches(0.6)  # Outside margin
        
        # Header/Footer
        section.header_distance = Inches(0.35)
        section.footer_distance = Inches(0.35)
        
        # Mirror margins for book binding
        section.different_first_page_header_footer = True
    
    # Enable mirror margins via XML
    sectPr = doc.sections[0]._sectPr
    mirrorMargins = OxmlElement('w:mirrorMargins')
    sectPr.append(mirrorMargins)
    
    # =========================================
    # STYLES DEFINITION
    # =========================================
    
    styles = doc.styles
    
    # ----- Normal (Body Text) -----
    style_normal = styles['Normal']
    font = style_normal.font
    font.name = 'Georgia'
    font.size = Pt(11)
    pf = style_normal.paragraph_format
    pf.space_after = Pt(6)
    pf.line_spacing = 1.3
    pf.first_line_indent = Inches(0.3)
    
    # ----- Heading 1 (Chapter Titles) -----
    style_h1 = styles['Heading 1']
    font = style_h1.font
    font.name = 'Georgia'
    font.size = Pt(20)
    font.bold = True
    font.color.rgb = None  # Black
    pf = style_h1.paragraph_format
    pf.space_before = Pt(36)
    pf.space_after = Pt(18)
    pf.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf.page_break_before = True
    pf.first_line_indent = Inches(0)
    
    # ----- Heading 2 (Section Headers) -----
    style_h2 = styles['Heading 2']
    font = style_h2.font
    font.name = 'Georgia'
    font.size = Pt(14)
    font.bold = True
    font.color.rgb = None
    pf = style_h2.paragraph_format
    pf.space_before = Pt(18)
    pf.space_after = Pt(6)
    pf.first_line_indent = Inches(0)
    
    # ----- Heading 3 (Subsections) -----
    style_h3 = styles['Heading 3']
    font = style_h3.font
    font.name = 'Georgia'
    font.size = Pt(12)
    font.bold = True
    font.italic = True
    font.color.rgb = None
    pf = style_h3.paragraph_format
    pf.space_before = Pt(12)
    pf.space_after = Pt(6)
    pf.first_line_indent = Inches(0)
    
    # ----- Title Style -----
    style_title = styles['Title']
    font = style_title.font
    font.name = 'Georgia'
    font.size = Pt(24)
    font.bold = True
    pf = style_title.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf.space_after = Pt(12)
    
    # ----- Subtitle Style -----
    style_subtitle = styles['Subtitle']
    font = style_subtitle.font
    font.name = 'Georgia'
    font.size = Pt(14)
    font.italic = True
    pf = style_subtitle.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf.space_after = Pt(24)
    
    # ----- Block Quote -----
    try:
        style_quote = styles.add_style('Block Quote', WD_STYLE_TYPE.PARAGRAPH)
    except:
        style_quote = styles['Quote']
    font = style_quote.font
    font.name = 'Georgia'
    font.size = Pt(10)
    font.italic = True
    pf = style_quote.paragraph_format
    pf.left_indent = Inches(0.5)
    pf.right_indent = Inches(0.5)
    pf.space_before = Pt(12)
    pf.space_after = Pt(12)
    
    # ----- Code Block -----
    try:
        style_code = styles.add_style('Code Block', WD_STYLE_TYPE.PARAGRAPH)
        font = style_code.font
        font.name = 'Consolas'
        font.size = Pt(9)
        pf = style_code.paragraph_format
        pf.left_indent = Inches(0.25)
        pf.space_before = Pt(6)
        pf.space_after = Pt(6)
    except:
        pass  # Style may already exist
    
    # =========================================
    # ADD SAMPLE CONTENT (for style preview)
    # =========================================
    
    doc.add_heading('Sample Chapter Title', level=1)
    doc.add_paragraph('This is body text in Georgia 11pt with 1.3 line spacing. The first line has a 0.3" indent. This paragraph demonstrates the Normal style that will be used throughout the manuscript.')
    
    doc.add_heading('Section Header', level=2)
    doc.add_paragraph('This demonstrates Heading 2 style for major sections within a chapter.')
    
    doc.add_heading('Subsection Header', level=3)
    doc.add_paragraph('This demonstrates Heading 3 style for subsections.')
    
    # =========================================
    # SAVE TEMPLATE
    # =========================================
    
    doc.save(output_path)
    print(f"✅ KDP template created: {output_path}")
    print(f"   Page size: 6\" x 9\"")
    print(f"   Margins: Top/Bottom 0.6\", Inside 0.76\", Outside 0.6\"")
    print(f"   Mirror margins: Enabled")
    print(f"   Styles: Heading 1/2/3, Normal, Title, Subtitle defined")


if __name__ == "__main__":
    import sys
    output = sys.argv[1] if len(sys.argv) > 1 else "KDP_Template_6x9.docx"
    create_kdp_template(output)
```

### Execution

```powershell
# Navigate to tool directory
cd C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter

# Create the template
python create-kdp-template.py "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\KDP_Template_6x9_v2.docx"
```

---

## PHASE 2: ADD CONTENT FOR 24+ PAGES

### Additional Content to Add

Add these sections to the base manuscript markdown:

#### 2.1 New Chapter: "Common Use Cases"

Insert AFTER "Your First AIXORD Session" chapter:

```markdown
\newpage

# Chapter 8: Common Use Cases

AIXORD adapts to any project. Here are proven applications:

## Software Development

**The Problem:** AI writes code that doesn't match requirements, forgets architecture decisions, and creates inconsistent implementations.

**AIXORD Solution:**
- DECISION mode captures all architecture choices
- Specifications freeze before coding begins
- HALT prevents scope creep
- HANDOFF preserves technical context

**Example Flow:**
1. Director: "Build a REST API for user management"
2. BRAINSTORM: Define endpoints, auth method, database
3. OPTIONS: Compare Express vs FastAPI vs Go
4. DOCUMENT: Generate API specification
5. EXECUTE: Build endpoint by endpoint with verification

## Content Creation

**The Problem:** AI-generated content lacks consistency, drifts from brand voice, and forgets previous decisions about tone and style.

**AIXORD Solution:**
- Define voice and style in DECISION mode
- Freeze brand guidelines before writing
- Track all editorial decisions
- Maintain consistency across sessions

**Example Flow:**
1. Director: "Create a 10-part blog series on productivity"
2. BRAINSTORM: Define audience, tone, themes
3. DOCUMENT: Outline all 10 posts with key points
4. EXECUTE: Write each post following the specification
5. HANDOFF: Track which posts are complete

## Business Planning

**The Problem:** Strategic conversations produce ideas but no actionable plans. Context is lost between planning sessions.

**AIXORD Solution:**
- Structured requirements gathering
- Options with clear cost/benefit analysis
- Documented decisions with rationale
- Progress tracking through Status Ledger

**Example Flow:**
1. Director: "Plan our Q2 marketing strategy"
2. DISCOVERY: Surface goals and constraints
3. BRAINSTORM: Identify channels, budget, timeline
4. OPTIONS: Compare 3 strategic approaches
5. DOCUMENT: Create execution plan with milestones

## Research and Analysis

**The Problem:** Research sprawls without direction. Findings aren't synthesized. Analysis paralysis sets in.

**AIXORD Solution:**
- Define research questions upfront
- Structured information gathering
- Documented findings and sources
- Clear synthesis and recommendations

## Personal Projects

Even personal projects benefit from structure:
- Home renovation planning
- Learning new skills
- Organizing life admin
- Creative writing projects

The scale is smaller, but the chaos is the same. AIXORD works for projects of any size.

\newpage

# Chapter 9: AIXORD vs Traditional AI Chat

Understanding the difference helps you choose when to use each approach.

## Traditional AI Chat

**Best For:**
- Quick questions
- One-off tasks
- Brainstorming without commitment
- Learning and exploration

**Limitations:**
- No memory between sessions
- No decision tracking
- No progress persistence
- Easy to lose context

## AIXORD Governance

**Best For:**
- Multi-session projects
- Team collaboration
- Complex implementations
- Anything requiring accountability

**Advantages:**
- Structured decision-making
- Persistent context via HANDOFF
- Clear authority model
- Progress tracking
- Quality gates via HALT

## When to Use Each

| Situation | Approach |
|-----------|----------|
| "What's the capital of France?" | Traditional chat |
| "Build me a website" | AIXORD |
| "Explain quantum computing" | Traditional chat |
| "Plan my product launch" | AIXORD |
| "Quick code snippet" | Traditional chat |
| "Develop full application" | AIXORD |

## The Transition

You can start in traditional chat and transition to AIXORD when:
- The task grows beyond one session
- You need to track decisions
- Multiple people are involved
- Quality and consistency matter

Simply create a PROJECT DOCUMENT from your chat history and continue with governance.

```

#### 2.2 Expanded Quick Reference

Add more detail to the Quick Reference appendix for additional pages.

#### 2.3 Adjust Line Spacing

In the Python template, line spacing is set to 1.3. This adds ~10% more pages compared to 1.15.

---

## PHASE 3: CREATE PMERIT TOOL

### Tool Directory Structure

```
C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter\
├── README.md                          ← Tool documentation
├── TOOL_MANIFEST.json                 ← Version and metadata
├── scripts/
│   ├── create-kdp-template.py         ← Template generator
│   ├── convert-manuscript.ps1         ← Single conversion
│   ├── convert-all.ps1                ← Batch conversion
│   └── verify-output.ps1              ← Post-conversion check
├── templates/
│   ├── KDP_Template_6x9.docx          ← Generated reference template
│   └── MANUSCRIPT_BASE.md             ← Base manuscript template
├── content/
│   ├── FRONTMATTER.md                 ← Reusable front matter
│   ├── COMMON_USE_CASES.md            ← Chapter content
│   └── COMPARISON_CHAPTER.md          ← Chapter content
└── examples/
    └── EXAMPLE_OUTPUT.docx            ← Sample output for reference
```

### TOOL_MANIFEST.json

```json
{
  "tool_name": "kdp-manuscript-converter",
  "version": "1.0.0",
  "description": "Convert Markdown manuscripts to KDP-ready DOCX using Pandoc with proper heading styles",
  "author": "PMERIT LLC",
  "created": "2025-12-31",
  "updated": "2025-12-31",
  "dependencies": {
    "pandoc": ">=3.0.0",
    "python": ">=3.8",
    "python-docx": ">=0.8.11",
    "powershell": ">=7.0"
  },
  "default_template": "templates/KDP_Template_6x9.docx",
  "page_specs": {
    "size": "6in x 9in",
    "margins": {
      "top": "0.6in",
      "bottom": "0.6in",
      "inside": "0.76in",
      "outside": "0.6in"
    },
    "mirror_margins": true,
    "line_spacing": 1.3
  },
  "minimum_pages": 24,
  "supported_outputs": ["docx"],
  "styles": {
    "heading1": "Georgia 20pt Bold, Page break before",
    "heading2": "Georgia 14pt Bold",
    "heading3": "Georgia 12pt Bold Italic",
    "normal": "Georgia 11pt, 1.3 line spacing, 0.3in first indent"
  }
}
```

### README.md for Tool

```markdown
# PMERIT KDP Manuscript Converter

Convert Markdown manuscripts to KDP-ready DOCX files with proper formatting.

## Features

- ✅ 6" × 9" page size (KDP standard)
- ✅ Correct margins for book binding
- ✅ Mirror margins enabled
- ✅ Proper heading styles (TOC-compatible)
- ✅ Georgia font family
- ✅ 1.3 line spacing for readability
- ✅ Page breaks before chapters

## Prerequisites

```powershell
# Install dependencies
pip install python-docx
winget install --id JohnMacFarlane.Pandoc
```

## Quick Start

### 1. Generate Template (First Time Only)

```powershell
python scripts/create-kdp-template.py templates/KDP_Template_6x9.docx
```

### 2. Convert Single Manuscript

```powershell
.\scripts\convert-manuscript.ps1 -Input "my-book.md" -Output "my-book.docx"
```

### 3. Convert All Manuscripts in Directory

```powershell
.\scripts\convert-all.ps1 -SourceDir "./manuscripts" -OutputDir "./output"
```

## Manuscript Requirements

Your Markdown file should use:
- `# Heading` for chapters (becomes Heading 1)
- `## Heading` for sections (becomes Heading 2)
- `### Heading` for subsections (becomes Heading 3)
- `\newpage` for manual page breaks

## Post-Processing

After conversion, open in Word and:
1. Update Table of Contents (right-click TOC → Update Field)
2. Verify page count is 24+ pages
3. Review page breaks
4. Export to PDF for KDP upload

## Troubleshooting

### TOC Not Working
Ensure you're using the generated template, not a generic one.

### Wrong Page Size
Re-run `create-kdp-template.py` to regenerate the template.

### Page Count Too Low
- Add content to your manuscript
- Increase line spacing in template (edit create-kdp-template.py)
- Add section divider pages
```

---

## PHASE 4: UPDATE MANUSCRIPTS

### 4.1 Update Base Manuscript Template

Add the new chapters to `MANUSCRIPT_BASE.md` in the md-sources folder.

### 4.2 Regenerate All 8 Manuscripts

After template and content updates:

```powershell
# Generate new template
python "C:\dev\pmerit\AIXORD_ROOT\TOOLS\kdp-manuscript-converter\scripts\create-kdp-template.py" "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts\KDP_Template_6x9_v2.docx"

# Regenerate manuscripts using new template
cd C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\manuscripts

# Update convert-manuscripts.ps1 to use new template
# Then run:
.\convert-manuscripts.ps1 -TemplateDoc "KDP_Template_6x9_v2.docx"
```

---

## EXECUTION CHECKLIST

### Phase 1: Tool Setup
- [ ] Create tool directory structure at `AIXORD_ROOT/TOOLS/kdp-manuscript-converter/`
- [ ] Create `create-kdp-template.py`
- [ ] Create `TOOL_MANIFEST.json`
- [ ] Create `README.md`
- [ ] Install python-docx (`pip install python-docx`)

### Phase 2: Generate Template
- [ ] Run `create-kdp-template.py`
- [ ] Verify template has correct page size
- [ ] Verify template has heading styles

### Phase 3: Update Manuscript Content
- [ ] Add "Common Use Cases" chapter to all 8 manuscripts
- [ ] Add "AIXORD vs Traditional AI Chat" chapter to all 8 manuscripts
- [ ] Verify each MD file has new content

### Phase 4: Regenerate DOCXs
- [ ] Run conversion with new template
- [ ] Verify page count is 24+ for each
- [ ] Verify TOC works (shows entries)
- [ ] Verify page size is 6" × 9"

### Phase 5: Verify Tool
- [ ] Tool directory exists at `AIXORD_ROOT/TOOLS/`
- [ ] All scripts work
- [ ] README documents usage
- [ ] Can be reused for future publications

---

## ACCEPTANCE CRITERIA

| Requirement | Target |
|-------------|--------|
| Page count | ≥ 24 pages per manuscript |
| Page size | 6" × 9" |
| Margins | Inside 0.76", others 0.6" |
| TOC | Populated, shows chapter entries |
| Heading styles | Heading 1/2/3 properly mapped |
| Tool location | `AIXORD_ROOT/TOOLS/kdp-manuscript-converter/` |
| Tool reusable | Yes, for future PMERIT publications |

---

## ROLLBACK PLAN

If issues persist:
1. Keep original `Template 6 x 9 in.docx` as backup
2. Keep v1 manuscripts in `docx-output/v1/`
3. Can revert to manual Word editing if needed

---

*HANDOFF prepared by Claude Web (Architect)*
*Ready for Claude Code execution*
