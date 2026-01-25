# Transform Gemini governance to Universal v3.3
$file = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\aixord-starter\AIXORD_GOVERNANCE_UNIVERSAL_V3.3.md"

$content = Get-Content $file -Raw -Encoding UTF8

# Header replacements
$content = $content -replace 'AIXORD GOVERNANCE — Gemini Edition', 'AIXORD GOVERNANCE — Universal Edition'
$content = $content -replace '\*\*Platform:\*\* Google Gemini \(Free & Advanced\)', '**Platform:** Any AI Assistant (ChatGPT, Claude, Gemini, Copilot, etc.)'

# URL replacements - make generic
$content = $content -replace 'gemini\.google\.com', '[your AI platform URL]'

# Platform name replacements - make generic
$content = $content -replace 'Gemini Advanced', '[AI Premium Tier]'
$content = $content -replace 'Gemini Free', '[AI Free Tier]'
$content = $content -replace 'Gemini Gem', '[AI Project/Workspace]'
$content = $content -replace 'Gemini Architect', 'AI Architect'
$content = $content -replace 'Gemini Commander', 'AI Commander'

# Feature name replacements
$content = $content -replace '\bGems\b', 'Projects/Workspaces'
$content = $content -replace '\bGem\b', 'Project'
$content = $content -replace 'Gem Instructions', 'System Instructions'
$content = $content -replace 'Gem Knowledge', 'Knowledge Base'

# Generic Gemini -> AI
$content = $content -replace '\bGemini\b', 'AI'
$content = $content -replace '\bGEMINI\b', 'AI'
$content = $content -replace '\bgemini\b', 'ai'

# Company replacements - make generic
$content = $content -replace '\bGoogle\b', '[AI Provider]'

# File name references
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_V3\.3\.md', 'AIXORD_GOVERNANCE_UNIVERSAL_V3.3.md'
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_GEM_V3\.3\.md', 'AIXORD_GOVERNANCE_UNIVERSAL_V3.3.md'
$content = $content -replace 'AIXORD_STATE_GEMINI_V3\.3\.json', 'AIXORD_STATE_UNIVERSAL_V3.3.json'
$content = $content -replace 'AIXORD_GEMINI_ADVANCED\.md', '[PLATFORM]_PREMIUM.md'
$content = $content -replace 'AIXORD_GEMINI_FREE\.md', '[PLATFORM]_FREE.md'

# Section title updates
$content = $content -replace '## 19\) AI Project SETUP', '## 19) AI PROJECT/WORKSPACE SETUP'
$content = $content -replace '## 20\) AI Free TIER SETUP', '## 20) FREE TIER SETUP'
$content = $content -replace '## 27\) GETTING STARTED WITH AI', '## 27) GETTING STARTED'

Set-Content $file $content -NoNewline -Encoding UTF8

Write-Host "Universal transformation complete."
