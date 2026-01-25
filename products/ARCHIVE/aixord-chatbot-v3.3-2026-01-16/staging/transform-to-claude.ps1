# Transform Gemini governance to Claude v3.3
$file = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\aixord-claude-pack\AIXORD_GOVERNANCE_CLAUDE_V3.3.md"

$content = Get-Content $file -Raw -Encoding UTF8

# Header replacements
$content = $content -replace 'AIXORD GOVERNANCE — Gemini Edition', 'AIXORD GOVERNANCE — Claude Edition'
$content = $content -replace '\*\*Platform:\*\* Google Gemini \(Free & Advanced\)', '**Platform:** Anthropic Claude (Free & Pro)'

# URL replacements
$content = $content -replace 'gemini\.google\.com', 'claude.ai'

# Platform name replacements (order matters)
$content = $content -replace 'Gemini Advanced', 'Claude Pro'
$content = $content -replace 'Gemini Free', 'Claude Free'
$content = $content -replace 'Gemini Gem', 'Claude Project'
$content = $content -replace 'Gemini Architect', 'Claude Architect'
$content = $content -replace 'Gemini Commander', 'Claude Commander'

# Feature name replacements
$content = $content -replace '\bGems\b', 'Projects'
$content = $content -replace '\bGem\b', 'Project'
$content = $content -replace 'Gem Instructions', 'Project Instructions'
$content = $content -replace 'Gem Knowledge', 'Project Knowledge'

# Generic Gemini -> Claude
$content = $content -replace '\bGemini\b', 'Claude'
$content = $content -replace '\bGEMINI\b', 'CLAUDE'
$content = $content -replace '\bgemini\b', 'claude'

# Company replacements
$content = $content -replace '\bGoogle\b', 'Anthropic'

# File name references
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_V3\.3\.md', 'AIXORD_GOVERNANCE_CLAUDE_V3.3.md'
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_GEM_V3\.3\.md', 'AIXORD_GOVERNANCE_CLAUDE_PROJECT_V3.3.md'
$content = $content -replace 'AIXORD_STATE_GEMINI_V3\.3\.json', 'AIXORD_STATE_CLAUDE_V3.3.json'
$content = $content -replace 'AIXORD_PHASE_DETAILS_V3\.3\.md', 'AIXORD_PHASE_DETAILS_V3.3.md'
$content = $content -replace 'AIXORD_GEMINI_ADVANCED\.md', 'AIXORD_CLAUDE_PRO.md'
$content = $content -replace 'AIXORD_GEMINI_FREE\.md', 'AIXORD_CLAUDE_FREE.md'

# Section title updates
$content = $content -replace '## 19\) GEMINI GEM SETUP', '## 19) CLAUDE PROJECT SETUP'
$content = $content -replace '## 19\) Claude Project SETUP', '## 19) CLAUDE PROJECT SETUP'
$content = $content -replace '## 20\) GEMINI FREE TIER SETUP', '## 20) CLAUDE FREE TIER SETUP'
$content = $content -replace '## 20\) Claude Free TIER SETUP', '## 20) CLAUDE FREE TIER SETUP'
$content = $content -replace '## 27\) GETTING STARTED WITH GEMINI', '## 27) GETTING STARTED WITH CLAUDE'
$content = $content -replace '## 27\) GETTING STARTED WITH Claude', '## 27) GETTING STARTED WITH CLAUDE'

Set-Content $file $content -NoNewline -Encoding UTF8

Write-Host "Claude transformation complete."
$remaining = (Select-String -Path $file -Pattern '\bGemini\b' -AllMatches).Matches.Count
Write-Host "Remaining 'Gemini' references: $remaining"
