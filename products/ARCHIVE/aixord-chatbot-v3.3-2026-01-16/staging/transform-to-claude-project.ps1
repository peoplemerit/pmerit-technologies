# Transform Gemini GEM governance to Claude Project v3.3
$file = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\aixord-claude-pack\AIXORD_GOVERNANCE_CLAUDE_PROJECT_V3.3.md"

$content = Get-Content $file -Raw -Encoding UTF8

# Header
$content = $content -replace 'AIXORD GOVERNANCE — Gemini Gem Edition', 'AIXORD GOVERNANCE — Claude Project Edition'
$content = $content -replace '\*\*Platform:\*\* Gemini Advanced \(Gems\)', '**Platform:** Claude Pro (Projects)'

# URLs
$content = $content -replace 'gemini\.google\.com', 'claude.ai'

# Platform names
$content = $content -replace 'Gemini Advanced', 'Claude Pro'
$content = $content -replace 'Gemini Free', 'Claude Free'
$content = $content -replace 'Gemini Gem', 'Claude Project'
$content = $content -replace 'Gemini Architect', 'Claude Architect'
$content = $content -replace 'Gemini Commander', 'Claude Commander'

# Features
$content = $content -replace '\bGems\b', 'Projects'
$content = $content -replace '\bGem\b', 'Project'
$content = $content -replace 'Gem Instructions', 'Project Instructions'
$content = $content -replace 'Gem Knowledge', 'Project Knowledge'

# Generic
$content = $content -replace '\bGemini\b', 'Claude'
$content = $content -replace '\bGEMINI\b', 'CLAUDE'
$content = $content -replace '\bgemini\b', 'claude'
$content = $content -replace '\bGoogle\b', 'Anthropic'

# Files
$content = $content -replace 'AIXORD_STATE_GEMINI_V3\.3\.json', 'AIXORD_STATE_CLAUDE_V3.3.json'

Set-Content $file $content -NoNewline -Encoding UTF8
Write-Host "Claude Project transformation complete."
