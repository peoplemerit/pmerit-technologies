# Transform Gemini governance to DeepSeek v3.3
$file = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\aixord-deepseek-pack\AIXORD_GOVERNANCE_DEEPSEEK_V3.3.md"

$content = Get-Content $file -Raw -Encoding UTF8

# Header replacements
$content = $content -replace 'AIXORD GOVERNANCE — Gemini Edition', 'AIXORD GOVERNANCE — DeepSeek Edition'
$content = $content -replace '\*\*Platform:\*\* Google Gemini \(Free & Advanced\)', '**Platform:** DeepSeek (Free & Pro)'

# URL replacements
$content = $content -replace 'gemini\.google\.com', 'chat.deepseek.com'

# Platform name replacements (order matters - more specific first)
$content = $content -replace 'Gemini Advanced with Gem', 'DeepSeek Pro with Projects'
$content = $content -replace 'Gemini Advanced without Gem', 'DeepSeek Pro without Projects'
$content = $content -replace 'Gemini Advanced', 'DeepSeek Pro'
$content = $content -replace 'Gemini Free', 'DeepSeek Free'
$content = $content -replace 'Gemini Gem', 'DeepSeek Project'
$content = $content -replace 'Gemini Architect', 'DeepSeek Architect'
$content = $content -replace 'Gemini Commander', 'DeepSeek Commander'
$content = $content -replace 'Gemini Project', 'DeepSeek Project'

# Feature name replacements
$content = $content -replace '\bGems\b', 'Projects'
$content = $content -replace '\bGem\b', 'Project'
$content = $content -replace 'Gem Instructions', 'Project Instructions'
$content = $content -replace 'Gem Knowledge', 'Project Knowledge'

# Generic Gemini -> DeepSeek
$content = $content -replace '\bGemini\b', 'DeepSeek'
$content = $content -replace '\bGEMINI\b', 'DEEPSEEK'
$content = $content -replace '\bgemini\b', 'deepseek'

# Company replacements
$content = $content -replace '\bGoogle\b', 'DeepSeek'

# File name references
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_V3\.3\.md', 'AIXORD_GOVERNANCE_DEEPSEEK_V3.3.md'
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_GEM_V3\.3\.md', 'AIXORD_GOVERNANCE_DEEPSEEK_PROJECT_V3.3.md'
$content = $content -replace 'AIXORD_STATE_GEMINI_V3\.3\.json', 'AIXORD_STATE_DEEPSEEK_V3.3.json'
$content = $content -replace 'AIXORD_GEMINI_ADVANCED\.md', 'AIXORD_DEEPSEEK_PRO.md'
$content = $content -replace 'AIXORD_GEMINI_FREE\.md', 'AIXORD_DEEPSEEK_FREE.md'

# Section title updates
$content = $content -replace '## 19\) GEMINI GEM SETUP', '## 19) DEEPSEEK PROJECT SETUP'
$content = $content -replace '## 19\) DeepSeek Project SETUP', '## 19) DEEPSEEK PROJECT SETUP'
$content = $content -replace '## 20\) GEMINI FREE TIER SETUP', '## 20) DEEPSEEK FREE TIER SETUP'
$content = $content -replace '## 20\) DeepSeek Free TIER SETUP', '## 20) DEEPSEEK FREE TIER SETUP'
$content = $content -replace '## 27\) GETTING STARTED WITH GEMINI', '## 27) GETTING STARTED WITH DEEPSEEK'
$content = $content -replace '## 27\) GETTING STARTED WITH DeepSeek', '## 27) GETTING STARTED WITH DEEPSEEK'

# Google Drive -> Local Drive
$content = $content -replace 'Google Drive', 'Local Drive'
$content = $content -replace 'My Drive/', 'Documents/'
$content = $content -replace 'DeepSeek Workspace', 'Local Workspace'
$content = $content -replace 'DeepSeek Drive', 'Local Storage'

Set-Content $file $content -NoNewline -Encoding UTF8

Write-Host "DeepSeek transformation complete."
$remaining = (Select-String -Path $file -Pattern '\bGemini\b' -AllMatches).Matches.Count
Write-Host "Remaining 'Gemini' references: $remaining"
