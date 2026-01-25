# AIXORD-Variants — KDP Manuscript Conversion Tools

**Purpose:** Convert source files into KDP-ready manuscript format (6x9 book, 24+ pages)

---

## Directory Structure

```
AIXORD-Variants/
├── staging/          <- Place input files here
├── tools/            <- Python conversion scripts
│   ├── expand_all_manuscripts.py
│   └── expand_starter_guide.py
└── README.md
```

---

## Tools

### expand_all_manuscripts.py

Main KDP manuscript expansion tool. Generates complete DOCX manuscripts for multiple AIXORD product variants.

**Features:**
- Converts source content to 6x9 book format
- Expands content to meet KDP 24-page minimum (~6,600 words)
- Adds front matter, preface, introduction, and supplementary sections
- Generates platform-specific variants (ChatGPT, Claude, Gemini, etc.)

**Requirements:**
```bash
pip install python-docx
```

**Usage:**
```bash
python tools/expand_all_manuscripts.py
```

### expand_starter_guide.py

Specialized tool for expanding the AIXORD Starter Guide manuscript.

**Usage:**
```bash
python tools/expand_starter_guide.py
```

---

## Workflow

1. Place source files in `staging/` folder
2. Run the appropriate tool from `tools/`
3. Output DOCX files will be generated in the specified output location

---

## Output Specifications

| Attribute | Value |
|-----------|-------|
| Format | DOCX |
| Page Size | 6" x 9" (KDP standard) |
| Target Length | 24+ pages (~6,600 words) |
| Words per Page | ~275 |

---

*PMERIT Asset — KDP Manuscript Conversion*
