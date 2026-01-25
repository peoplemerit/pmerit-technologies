# Transform Gemini governance to ChatGPT v3.3
$file = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\aixord-chatgpt-pack\AIXORD_GOVERNANCE_CHATGPT_V3.3.md"

$content = Get-Content $file -Raw -Encoding UTF8

# Header replacements
$content = $content -replace 'AIXORD GOVERNANCE — Gemini Edition', 'AIXORD GOVERNANCE — ChatGPT Edition'
$content = $content -replace '\*\*Platform:\*\* Google Gemini \(Free & Advanced\)', '**Platform:** OpenAI ChatGPT (Free, Plus, Pro, Team)'

# URL replacements
$content = $content -replace 'gemini\.google\.com', 'chat.openai.com'

# Platform name replacements (order matters - do specific first)
$content = $content -replace 'Gemini Advanced', 'ChatGPT Plus/Pro'
$content = $content -replace 'Gemini Free', 'ChatGPT Free'
$content = $content -replace 'Gemini Gem', 'Custom GPT'
$content = $content -replace 'Gemini Architect', 'ChatGPT Architect'
$content = $content -replace 'Gemini Commander', 'ChatGPT Commander'

# Feature name replacements
$content = $content -replace '\bGems\b', 'Custom GPTs'
$content = $content -replace '\bGem\b', 'GPT'
$content = $content -replace 'Gem Instructions', 'GPT Instructions'
$content = $content -replace 'Gem Knowledge', 'GPT Knowledge'

# Generic Gemini -> ChatGPT (case sensitive)
$content = $content -replace '\bGemini\b', 'ChatGPT'
$content = $content -replace '\bGEMINI\b', 'CHATGPT'
$content = $content -replace '\bgemini\b', 'chatgpt'

# Company replacements
$content = $content -replace '\bGoogle\b', 'OpenAI'

# File name references
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_V3\.3\.md', 'AIXORD_GOVERNANCE_CHATGPT_V3.3.md'
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_GEM_V3\.3\.md', 'AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md'
$content = $content -replace 'AIXORD_STATE_GEMINI_V3\.3\.json', 'AIXORD_STATE_CHATGPT_V3.3.json'
$content = $content -replace 'AIXORD_PHASE_DETAILS_V3\.3\.md', 'AIXORD_PHASE_DETAILS_V3.3.md'
$content = $content -replace 'AIXORD_GEMINI_ADVANCED\.md', 'AIXORD_CHATGPT_PLUS.md'
$content = $content -replace 'AIXORD_GEMINI_FREE\.md', 'AIXORD_CHATGPT_FREE.md'

# Section title updates
$content = $content -replace '## 19\) GEMINI GEM SETUP', '## 19) CUSTOM GPT SETUP'
$content = $content -replace '## 20\) GEMINI FREE TIER SETUP', '## 20) CHATGPT FREE TIER SETUP'
$content = $content -replace '## 27\) GETTING STARTED WITH GEMINI', '## 27) GETTING STARTED WITH CHATGPT'

# Tier detection section specific fixes
$content = $content -replace 'Tier A: ChatGPT Plus/Pro \(with GPT\)', 'Tier A: ChatGPT Plus/Pro (with Custom GPT)'
$content = $content -replace 'Tier B: ChatGPT Plus/Pro \(no GPT\)', 'Tier B: ChatGPT Plus/Pro (no Custom GPT)'
$content = $content -replace 'Do you have ChatGPT Plus/Pro with GPT, ChatGPT Plus/Pro without GPT, or ChatGPT Free', 'Do you have ChatGPT Plus/Pro with Custom GPT, ChatGPT Plus/Pro without Custom GPT, or ChatGPT Free'

Set-Content $file $content -NoNewline -Encoding UTF8

Write-Host "Transformation complete. Checking results..."

# Verify no Gemini references remain (except in platform comparison sections)
$remaining = Select-String -Path $file -Pattern '\bGemini\b' -AllMatches
Write-Host "Remaining 'Gemini' references: $($remaining.Matches.Count)"
