# Transform Gemini GEM governance to ChatGPT GPT v3.3
$file = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\aixord-chatgpt-pack\AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md"

$content = Get-Content $file -Raw -Encoding UTF8

# Header replacements
$content = $content -replace 'AIXORD GOVERNANCE — Gemini Gem Edition', 'AIXORD GOVERNANCE — ChatGPT GPT Edition'
$content = $content -replace '\*\*Platform:\*\* Gemini Advanced \(Gems\)', '**Platform:** ChatGPT Plus/Pro (Custom GPTs)'

# URL replacements
$content = $content -replace 'gemini\.google\.com', 'chat.openai.com'

# Platform name replacements
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

# Generic Gemini -> ChatGPT
$content = $content -replace '\bGemini\b', 'ChatGPT'
$content = $content -replace '\bGEMINI\b', 'CHATGPT'
$content = $content -replace '\bgemini\b', 'chatgpt'

# Company replacements
$content = $content -replace '\bGoogle\b', 'OpenAI'

# File name references
$content = $content -replace 'AIXORD_STATE_GEMINI_V3\.3\.json', 'AIXORD_STATE_CHATGPT_V3.3.json'
$content = $content -replace 'AIXORD_PHASE_DETAILS_V3\.3\.md', 'AIXORD_PHASE_DETAILS_V3.3.md'

Set-Content $file $content -NoNewline -Encoding UTF8

Write-Host "GPT transformation complete."
