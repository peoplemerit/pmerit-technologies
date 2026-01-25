# MANUSCRIPT CONTENT UPDATES — Gemini Edition

**For:** MANUSCRIPT_GEMINI.md / MANUSCRIPT_GEMINI.docx
**Purpose:** Replace/update specific sections with Gemini-specific content

---

## SECTION: Chapter 5 — Prerequisites (REPLACE)

```markdown
# Chapter 5: What You Need to Know (Prerequisites)

Before using AIXORD with Gemini, ensure you have:

## Basic Requirements (All Users)

| Requirement | Why |
|-------------|-----|
| Google account | Required to access Gemini |
| Web browser | Chrome, Firefox, Safari, or Edge |
| Basic AI chatbot experience | You should have used an AI chatbot at least once |
| File management skills | Download, extract ZIP, navigate folders |
| Copy/paste ability | Transfer text between applications |

## Understanding Your Gemini Tier

### Gemini Advanced ($19.99/month)

If you subscribe to Gemini Advanced (part of Google One AI Premium), you have access to:

- **Gems** — Custom AI personas with persistent instructions
- **Larger context window** — Longer conversations without losing track
- **File uploads** — Upload documents for reference
- **Priority access** — During high-traffic periods

**AIXORD Experience:** Create an AIXORD Gem once, use it forever. No pasting governance every session.

### Gemini Free

If you use Gemini without a paid subscription:

- No Gems feature
- Smaller context window
- No file uploads
- May have usage limits during peak times

**AIXORD Experience:** Paste the governance file at the start of each session. Save HANDOFF documents to maintain continuity.

## NOT Required

You do NOT need:
- Programming experience
- Google Cloud account
- Previous governance framework knowledge
- Technical writing skills

## Recommended Before Starting

1. Read Chapter 6 (Setup) for your specific tier
2. Have a project idea in mind (or use DISCOVER mode to find one)
3. Set aside 10-15 minutes for initial setup
```

---

## SECTION: Chapter 6 — Setting Up for Gemini (REPLACE ENTIRELY)

```markdown
# Chapter 6: Setting Up for Gemini

This chapter covers setup for both Gemini Advanced and Gemini Free users. Find your tier and follow those instructions.

---

## Part A: Gemini Advanced Setup (Recommended)

If you have Gemini Advanced, you can create an **AIXORD Gem** — a custom AI persona with your governance rules built in. This is a one-time setup that makes every future session instant.

### What Are Gems?

Gems are custom AI personas in Gemini Advanced. Each Gem has:
- **Instructions** — Rules the AI follows (where your AIXORD governance goes)
- **Knowledge** — Files the AI can reference (your project documents)
- **Name & Icon** — For easy identification

Think of a Gem as your personal AIXORD assistant that remembers its training.

### Creating Your AIXORD Gem

**Step 1: Access Gems**
1. Go to gemini.google.com
2. Sign in with your Google account
3. Look for "Gems" in the left sidebar
4. Click "+ New Gem" (or "Create Gem")

**Step 2: Configure the Gem**
1. **Name:** Enter `AIXORD` (or a project-specific name like "AIXORD - My Website")
2. **Instructions:** This is the important part
   - Open `AIXORD_GOVERNANCE_GEMINI_V3.1.md` from your download
   - Copy the ENTIRE contents
   - Paste into the Instructions field

**Step 3: Add Knowledge (Optional but Recommended)**
1. Click "Add files" in the Knowledge section
2. Upload any project documents you have:
   - Previous HANDOFF files
   - Project requirements
   - Reference materials
3. The Gem will reference these during conversations

**Step 4: Save**
1. Click "Save"
2. Your AIXORD Gem appears in the Gems sidebar
3. Done! One-time setup complete.

### Using Your AIXORD Gem

**Every Session:**
1. Click your AIXORD Gem in the sidebar
2. Type: `PMERIT CONTINUE`
3. First time: Enter your license email or code
4. When asked about tier, say: `Gem`
5. Start working!

**That's it.** No pasting, no setup, just open and go.

---

## Part B: Gemini Free Setup

Without the Gems feature, you'll paste the governance document at the start of each session. It takes about 2 minutes.

### Preparing Your Files

**Step 1: Create a Local Folder**
On your computer, create this structure:
```
AIXORD_Projects/
├── MyProject/
│   ├── docs/
│   │   ├── PROJECT_DOCUMENT.md
│   │   └── handoffs/
│   │       └── HANDOFF_2025-01-01.md
│   └── src/
└── governance/
    └── AIXORD_GOVERNANCE_GEMINI_V3.1.md
```

**Step 2: Save the Activation Template**
Create a file called `ACTIVATION_TEMPLATE.txt` with:

```
You are now operating under the AIXORD governance framework. 
Read and follow ALL instructions below as your operating rules.
When I say "PMERIT CONTINUE", activate this framework.

[PASTE GOVERNANCE HERE]

Confirm you understand by saying "AIXORD ACTIVATED" and then wait for my command.
```

### Starting Each Session

**Step 1: Open Gemini**
1. Go to gemini.google.com
2. Click "New chat"

**Step 2: Activate AIXORD**
1. Open your `ACTIVATION_TEMPLATE.txt`
2. Open `AIXORD_GOVERNANCE_GEMINI_V3.1.md`
3. In the template, replace `[PASTE GOVERNANCE HERE]` with the entire governance content
4. Paste the combined text into Gemini
5. Send the message

**Step 3: Wait for Confirmation**
- Gemini should respond: "AIXORD ACTIVATED"
- If it doesn't, start a new chat and try again

**Step 4: Continue Your Project**
1. Type: `PMERIT CONTINUE`
2. First time: Enter your license email or code
3. When asked about tier, say: `Free`
4. If continuing a project, paste your most recent HANDOFF
5. Start working!

### Ending Each Session

Before closing:
1. Type: `PMERIT HANDOFF`
2. Copy the entire handoff document Gemini generates
3. Save it as `HANDOFF_[DATE].md` in your handoffs folder
4. This is your "save game" for next session

### Tips for Free Tier Users

1. **Request HANDOFFs frequently** — Free tier has smaller context limits
2. **Keep sessions focused** — One major task per session
3. **Save everything locally** — Your computer is your project database
4. **Consider upgrading** — If you use AIXORD regularly, Gems are worth it
```

---

## SECTION: FAQ Updates (ADD)

```markdown
## Gemini-Specific FAQs

**Q: What are Gems and do I need them?**
A: Gems are custom AI personas available to Gemini Advanced subscribers ($19.99/month). They let you set persistent instructions so you don't have to paste the governance file every session. If you have Advanced, use Gems — it's a much better experience.

**Q: Why do I have to paste the governance every time on Free?**
A: Gemini Free doesn't support persistent instructions (Gems). The only way to give Gemini rules is by including them in your message. The paste method ensures AIXORD governance is active each session.

**Q: Can I switch between Gemini Free and Advanced?**
A: Yes! If you upgrade to Advanced, create an AIXORD Gem and you're set. Your existing HANDOFF files will still work — just paste them when Gemini asks for context.

**Q: Gemini said "I don't understand PMERIT" — what happened?**
A: This means the governance wasn't properly loaded. For Free users: start a new chat and paste the full activation template + governance. For Advanced users: make sure you're in your AIXORD Gem, not regular chat.

**Q: Can I have multiple AIXORD projects?**
A: Yes! 
- **Advanced:** Create one Gem per project (e.g., "AIXORD - Website", "AIXORD - App")
- **Free:** Use separate HANDOFF files for each project

**Q: How do I add files to my Gem?**
A: In Gemini Advanced:
1. Open your AIXORD Gem settings
2. Go to the Knowledge section
3. Click "Add files"
4. Upload your documents (PDF, DOCX, MD, TXT)
5. Save the Gem

**Q: What's the difference between Gem Instructions and Knowledge?**
A: 
- **Instructions** = Rules the AI follows (your governance file)
- **Knowledge** = Reference materials the AI can search (your project docs)

Put AIXORD governance in Instructions. Put project documents in Knowledge.
```

---

## SECTION: Quick Reference Card (UPDATE)

```markdown
## Quick Reference: Gemini Edition

### Session Start

**Gemini Advanced (Gem):**
1. Open AIXORD Gem
2. `PMERIT CONTINUE`
3. Start working

**Gemini Free:**
1. New chat
2. Paste: Activation + Governance
3. Wait for "AIXORD ACTIVATED"
4. `PMERIT CONTINUE`
5. Paste HANDOFF if continuing
6. Start working

### Commands
| Command | Action |
|---------|--------|
| `PMERIT CONTINUE` | Resume/start |
| `PMERIT DISCOVER` | Find project idea |
| `PMERIT BRAINSTORM` | Shape idea |
| `PMERIT OPTIONS` | Get alternatives |
| `PMERIT EXECUTE` | Build it |
| `PMERIT STATUS` | Check progress |
| `PMERIT HANDOFF` | Save state |
| `PMERIT HALT` | Stop and reassess |

### Session End

**Always:** Request `PMERIT HANDOFF` and save locally
**Advanced:** Also upload important docs to Gem Knowledge
```

---

*End of manuscript content updates*
