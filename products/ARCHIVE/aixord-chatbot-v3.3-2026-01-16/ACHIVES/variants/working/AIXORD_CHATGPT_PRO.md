# AIXORD for ChatGPT Pro — Quick Start Guide

**Version:** 3.2 | **Platform:** ChatGPT Pro ($200/month) | **PMERIT LLC**

---

## ✅ YOUR TIER FEATURES

As a ChatGPT Pro subscriber, you have MAXIMUM capabilities:

| Feature | Status | AIXORD Use |
|---------|--------|------------|
| ✅ Custom GPTs | Full Access | Create AIXORD GPT with full capabilities |
| ✅ Projects | Full Access | Alternative workflow |
| ✅ Agent Mode | **Advanced** | Autonomous task execution |
| ✅ Codex | **Full** | Code generation and deployment |
| ✅ Unlimited Messages | **Yes** | No message limits |
| ✅ Maximum Memory | **Yes** | Longest sessions possible |
| ✅ Web Search | **Full** | Complete reference discovery |
| ✅ Deep Research | **Yes** | Enhanced BRAINSTORM capabilities |
| ✅ Early Access | **Yes** | Latest features first |

---

## 🚀 RECOMMENDED SETUP: Custom GPT with Full Capabilities

### Step 1: Create AIXORD GPT

1. Click profile → "My GPTs" → "Create"
2. Configure:
   ```
   Name: AIXORD Pro Governance
   Description: Professional AI Execution Order framework with 
                full Agent Mode and Codex integration
   ```

### Step 2: Add Instructions

1. Copy contents of `AIXORD_GOVERNANCE_CHATGPT_GPT.md`
2. Paste into "Instructions" field
3. **Add Pro-specific enhancement at end:**

```markdown
## PRO TIER ENHANCEMENTS

### Agent Mode Integration
When Director approves a task, you may use Agent Mode to:
- Execute multi-step operations autonomously
- Interact with external services
- Create and manage files
- Deploy code

Always report actions taken and await confirmation before major operations.

### Codex Integration
For code-related tasks:
- Generate complete, production-ready code
- Execute code for verification
- Deploy when approved
- Handle complex refactoring

### Extended Session Handling
- Handoff threshold: 35 messages (vs 30 standard)
- Maximum context utilization
- Deep research for complex brainstorming
```

### Step 3: Upload Knowledge Files

Upload ALL of these for maximum capability:
- `AIXORD_GOVERNANCE_CHATGPT_V3.2.md` (full version)
- `AIXORD_PHASE_DETAILS.md`
- `AIXORD_STATE_V3.2.json`
- `DISCLAIMER.md`

### Step 4: Enable ALL Capabilities

In GPT settings, enable:
- ✅ Web Browsing
- ✅ Code Interpreter
- ✅ DALL-E (optional, for visual projects)

### Step 5: Test Pro Features

After setup, verify:
```
You: "PMERIT CONTINUE"
[Complete setup]
You: "Test agent mode capabilities"
You: "Test codex capabilities"
```

---

## ⚡ AGENT MODE DEEP INTEGRATION

### What Agent Mode Can Do

| Capability | AIXORD Application |
|------------|-------------------|
| Web Research | Enhanced reference discovery |
| File Operations | Create project files automatically |
| Code Execution | Run and test code in EXECUTE phase |
| External APIs | Connect to services (with approval) |
| Multi-step Tasks | Chain operations together |

### Using Agent Mode in EXECUTE Phase

```
You: "APPROVED - Use agent mode to complete this"

ChatGPT will:
1. Plan the execution steps
2. Execute autonomously
3. Report each action taken
4. Present results for approval
5. Continue or await direction
```

### Safety Controls

Agent Mode still respects AIXORD governance:
- Major operations require approval
- Destructive actions confirm first
- Reports all actions taken
- Director can HALT at any time

---

## 💻 CODEX DEEP INTEGRATION

### Codex Capabilities in AIXORD

| Feature | How to Use |
|---------|------------|
| Code Generation | "Generate production code for [feature]" |
| Code Execution | "Run this code and show output" |
| Debugging | "Debug this error: [error]" |
| Refactoring | "Refactor for better performance" |
| Deployment | "Deploy to [environment]" (with approval) |

### EXECUTE Phase with Codex

```
┌──────────────────────────────────┐
│ 📍 Phase: EXECUTE                │
│ 🎯 Task: Authentication system   │
│ 📊 Progress: Step 2/5            │
│ ⚡ Citation: STANDARD            │
│ 💬 Msg: 12/35                    │
│ 🤖 Codex: ACTIVE                 │
└──────────────────────────────────┘

📋 TASK CARD
┌──────────────────────────────────────────┐
│ ID: T-001                                │
│ Task: Create OAuth2 authentication       │
│ Step: 2 of 5 - Generate token service    │
│ Status: Codex executing...               │
│ Deliverable: auth-service.ts             │
└──────────────────────────────────────────┘

[Codex generates code]

✅ Code generated. Running tests...

Test Results:
- auth.test.ts: 12/12 passed ✅

Proceed to Step 3? (Integration)
```

---

## 🔬 DEEP RESEARCH INTEGRATION

Pro tier includes Deep Research. AIXORD leverages this in BRAINSTORM phase:

```
You: "I need to brainstorm architecture for a high-traffic API"

ChatGPT (BRAINSTORM Phase):
"Initiating deep research on high-traffic API architectures..."

[Deep Research activates]

Results include:
- Current best practices (2025-2026)
- Case studies from major companies
- Performance benchmarks
- Architecture patterns with trade-offs
- Video walkthroughs with timestamps
- GitHub repositories at scale

Confidence: 🟢 HIGH — Deep research with multiple authoritative sources
```

---

## 📊 SESSION LIMITS (Pro Tier)

| Metric | Threshold | Notes |
|--------|-----------|-------|
| Messages | **35** | Extended due to max memory |
| Active Tasks | **5** | More capacity |
| EXECUTE Tasks | 2 parallel | Pro can handle more |
| Complexity | High | Suitable for enterprise projects |

---

## 🏗️ PRO-LEVEL PROJECT STRUCTURE

For Pro users working on complex projects:

```
[PROJECT_NAME]/
├── 1_GOVERNANCE/
│   ├── AIXORD_GOVERNANCE_CHATGPT_GPT.md
│   ├── AIXORD_GOVERNANCE_CHATGPT_V3.2.md
│   └── PROJECT_SPECIFIC_RULES.md
├── 2_STATE/
│   ├── AIXORD_STATE.json
│   └── STATE_HISTORY/
│       ├── state_2026-01-01.json
│       └── state_2026-01-02.json
├── 3_PROJECT/
│   ├── PROJECT_DOCUMENT.md
│   ├── ARCHITECTURE.md
│   └── REQUIREMENTS.md
├── 4_HANDOFFS/
│   ├── HANDOFF_001.md
│   └── SESSION_SUMMARIES/
│       └── summary_week1.md
├── 5_OUTPUTS/
│   ├── code/
│   ├── docs/
│   └── deployments/
└── 6_RESEARCH/
    ├── videos/
    ├── repos/
    └── papers/
```

---

## 🔧 PRO TROUBLESHOOTING

### Agent Mode Not Executing
```
Try:
1. "Enable agent mode for this task"
2. Verify GPT capabilities include Code Interpreter
3. Check: "What agent capabilities are available?"
```

### Codex Output Issues
```
Try:
1. "Regenerate with more detailed requirements"
2. "Run tests and debug failures"
3. "Show execution environment details"
```

### Deep Research Taking Long
```
Normal for comprehensive research.
For faster results:
1. Narrow the scope
2. "Quick research on [topic]"
3. "Skip deep research, use general knowledge"
```

### Hitting Limits (Rare)
```
Even Pro has some limits during peak usage.
If encountered:
1. CHECKPOINT current work
2. Wait briefly
3. Resume with RECOVER
```

---

## 📋 PRO COMMAND REFERENCE

| Command | What It Does |
|---------|--------------|
| PMERIT CONTINUE | Activate AIXORD |
| CHECKPOINT | Save progress |
| AGENT: [task] | Explicitly invoke agent mode |
| CODEX: [request] | Explicitly invoke Codex |
| DEEP RESEARCH: [topic] | Trigger deep research |
| FIND VIDEOS: [topic] | Search YouTube |
| FIND CODE: [topic] | Search GitHub |
| PROTOCOL CHECK | Verify compliance |
| HALT | Stop and reset |

---

## ✅ PRO ACTIVATION CHECKLIST

- [ ] Created Custom GPT with full capabilities
- [ ] Added Pro-specific enhancements to Instructions
- [ ] Uploaded ALL knowledge files
- [ ] Enabled Web Browsing + Code Interpreter
- [ ] Created comprehensive local folder structure
- [ ] Said "PMERIT CONTINUE"
- [ ] Completed license validation
- [ ] Accepted terms (I ACCEPT: [identifier])
- [ ] Confirmed tier (Pro)
- [ ] Tested Agent Mode
- [ ] Tested Codex
- [ ] Ready for enterprise-level work!

---

## 💎 MAXIMIZING PRO VALUE

### For Complex Projects
- Use Deep Research in BRAINSTORM
- Let Agent Mode handle routine tasks
- Use Codex for all code generation
- Maintain comprehensive handoffs

### For Speed
- Agent Mode for multi-step execution
- Codex for rapid prototyping
- Higher task parallelism

### For Quality
- STRICT citation mode
- Deep Research for every major decision
- Comprehensive AUDIT phases
- Full reference discovery

---

© 2026 PMERIT LLC. All rights reserved.
AIXORD — Authority. Execution. Confirmation.
