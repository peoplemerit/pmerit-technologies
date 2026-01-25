# Transform Gemini governance to Copilot v3.3
$file = "C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot\distribution\staging\aixord-copilot-pack\AIXORD_GOVERNANCE_COPILOT_V3.3.md"

$content = Get-Content $file -Raw -Encoding UTF8

# Header replacements
$content = $content -replace 'AIXORD GOVERNANCE — Gemini Edition', 'AIXORD GOVERNANCE — Copilot Edition'
$content = $content -replace '\*\*Platform:\*\* Google Gemini \(Free & Advanced\)', '**Platform:** Microsoft Copilot (Free & Pro)'

# URL replacements
$content = $content -replace 'gemini\.google\.com', 'copilot.microsoft.com'

# Platform name replacements (order matters - more specific first)
$content = $content -replace 'Gemini Advanced with Gem', 'Copilot Pro with Workspace'
$content = $content -replace 'Gemini Advanced without Gem', 'Copilot Pro without Workspace'
$content = $content -replace 'Gemini Advanced', 'Copilot Pro'
$content = $content -replace 'Gemini Free', 'Copilot Free'
$content = $content -replace 'Gemini Gem', 'Copilot Workspace'
$content = $content -replace 'Gemini Architect', 'Copilot Architect'
$content = $content -replace 'Gemini Commander', 'Copilot Commander'
$content = $content -replace 'Gemini Project', 'Copilot Workspace'

# Feature name replacements
$content = $content -replace '\bGems\b', 'Workspaces'
$content = $content -replace '\bGem\b', 'Workspace'
$content = $content -replace 'Gem Instructions', 'Workspace Instructions'
$content = $content -replace 'Gem Knowledge', 'Workspace Knowledge'

# Generic Gemini -> Copilot
$content = $content -replace '\bGemini\b', 'Copilot'
$content = $content -replace '\bGEMINI\b', 'COPILOT'
$content = $content -replace '\bgemini\b', 'copilot'

# Company replacements
$content = $content -replace '\bGoogle\b', 'Microsoft'

# File name references
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_V3\.3\.md', 'AIXORD_GOVERNANCE_COPILOT_V3.3.md'
$content = $content -replace 'AIXORD_GOVERNANCE_GEMINI_GEM_V3\.3\.md', 'AIXORD_GOVERNANCE_COPILOT_WORKSPACE_V3.3.md'
$content = $content -replace 'AIXORD_STATE_GEMINI_V3\.3\.json', 'AIXORD_STATE_COPILOT_V3.3.json'
$content = $content -replace 'AIXORD_GEMINI_ADVANCED\.md', 'AIXORD_COPILOT_PRO.md'
$content = $content -replace 'AIXORD_GEMINI_FREE\.md', 'AIXORD_COPILOT_FREE.md'

# Section title updates
$content = $content -replace '## 19\) GEMINI GEM SETUP', '## 19) COPILOT WORKSPACE SETUP'
$content = $content -replace '## 19\) Copilot Workspace SETUP', '## 19) COPILOT WORKSPACE SETUP'
$content = $content -replace '## 20\) GEMINI FREE TIER SETUP', '## 20) COPILOT FREE TIER SETUP'
$content = $content -replace '## 20\) Copilot Free TIER SETUP', '## 20) COPILOT FREE TIER SETUP'
$content = $content -replace '## 27\) GETTING STARTED WITH GEMINI', '## 27) GETTING STARTED WITH COPILOT'
$content = $content -replace '## 27\) GETTING STARTED WITH Copilot', '## 27) GETTING STARTED WITH COPILOT'

# Google Drive -> OneDrive
$content = $content -replace 'Google Drive', 'OneDrive'
$content = $content -replace 'My Drive/', 'OneDrive/'
$content = $content -replace 'Microsoft Workspace', 'Microsoft 365'

Set-Content $file $content -NoNewline -Encoding UTF8

Write-Host "Copilot transformation complete."
$remaining = (Select-String -Path $file -Pattern '\bGemini\b' -AllMatches).Matches.Count
Write-Host "Remaining 'Gemini' references: $remaining"
