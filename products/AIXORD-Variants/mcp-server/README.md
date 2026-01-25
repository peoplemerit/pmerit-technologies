# PMERIT KDP Tools MCP Server

MCP (Model Context Protocol) server that provides Claude Code with native access to KDP manuscript conversion tools.

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Claude Code Configuration

Add to your Claude Code MCP settings (`~/.config/claude-code/settings.json` or project `.claude/settings.local.json`):

```json
{
  "mcpServers": {
    "pmerit-kdp-tools": {
      "command": "node",
      "args": ["C:/dev/pmerit/pmerit-technologies/products/AIXORD-Variants/mcp-server/dist/index.js"]
    }
  }
}
```

Or for development:

```json
{
  "mcpServers": {
    "pmerit-kdp-tools": {
      "command": "npx",
      "args": ["tsx", "C:/dev/pmerit/pmerit-technologies/products/AIXORD-Variants/mcp-server/src/index.ts"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `kdp_list_staging` | List files in staging directory ready for conversion |
| `kdp_expand_manuscript` | Expand a specific product manuscript to KDP format |
| `kdp_expand_all` | Generate all configured manuscripts |
| `kdp_check_requirements` | Verify Python and dependencies are installed |
| `kdp_get_output` | List generated DOCX files |

## Directory Structure

```
AIXORD-Variants/
├── staging/         <- Input files go here
├── output/          <- Generated DOCX files appear here
├── tools/           <- Python conversion scripts
│   ├── expand_all_manuscripts.py
│   └── expand_starter_guide.py
└── mcp-server/      <- This MCP server
    ├── src/
    ├── dist/
    └── package.json
```

## Requirements

- Node.js 20+
- Python 3.8+
- python-docx (`pip install python-docx`)

## Usage Example

Once configured, Claude Code can use commands like:

```
"Check if KDP tools are ready"
"List files in KDP staging"
"Generate all KDP manuscripts"
"Show me the generated output files"
```

---

*PMERIT TECHNOLOGIES LLC*
