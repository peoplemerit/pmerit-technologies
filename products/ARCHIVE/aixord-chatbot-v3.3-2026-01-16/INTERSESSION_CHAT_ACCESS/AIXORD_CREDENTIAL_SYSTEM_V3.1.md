# AIXORD CREDENTIAL SYSTEM v3.1

**Version:** 3.1 | **Date:** January 2025 | **Owner:** PMERIT LLC

---

## OVERVIEW

The AIXORD credential system operates on **two layers**:

| Layer | Purpose | Location |
|-------|---------|----------|
| **Gumroad Discounts** | Enable free/discounted downloads | Gumroad → Checkout → Discounts |
| **Governance Validation** | AI checks authorization on first use | AIXORD_GOVERNANCE_V3.1.md |

Both layers must be configured for the system to work.

---

## CREDENTIAL TYPES

### 1. MASTER CREDENTIALS (Seller/Admin)

**Pattern:** `PMERIT-MASTER-{{key}}`

**Purpose:** Unlimited seller override for testing, demos, and administrative access.

| Field | Value |
|-------|-------|
| Example Code | `PMERIT-MASTER-2025X` |
| Access Level | ALL products, unlimited |
| Uses | Unlimited |
| Expiration | None (rotate quarterly) |
| Who Gets It | PMERIT staff only |

**Security Protocol:**
- Never share in writing (verbal only)
- Rotate quarterly: `PMERIT-MASTER-2025Q1` → `PMERIT-MASTER-2025Q2`
- If compromised, delete immediately and create new code
- Do NOT include in any documentation or files

---

### 2. TESTER CREDENTIALS (Time-Limited)

**Pattern:** `PMERIT-TEST-{{NAME}}-{{MMDD}}`

**Purpose:** Full access for authorized testers with tracking and expiration.

| Field | Value |
|-------|-------|
| Example Code | `PMERIT-TEST-OLU-0101` |
| Access Level | ALL products |
| Uses | 8 (one per product) |
| Expiration | 30 days from issue |
| Who Gets It | NDA-signed testers |

**Naming Convention:**
```
PMERIT-TEST-[3-LETTER-NAME]-[MMDD]
         │         │           │
         │         │           └── Issue date (Jan 1 = 0101)
         │         └────────────── First 3 letters of name (OLU, BLS)
         └──────────────────────── Credential type
```

**Current Testers:**

| Tester | Email | Code | Issued | Expires |
|--------|-------|------|--------|---------|
| Olufikayo Sofolahan | [tester email] | `PMERIT-TEST-OLU-0101` | Jan 1, 2025 | Jan 31, 2025 |
| Blessing Aluge | blessing@pmerit.com | `PMERIT-TEST-BLS-0101` | Jan 1, 2025 | Jan 31, 2025 |

---

### 3. GIFT CREDENTIALS (Charity/Promotional)

**Pattern:** `PMERIT-GIFT-{{TYPE}}-{{CODE}}`

**Purpose:** Full access for charity donations, promotional giveaways, and partner programs.

**Sub-Types:**

#### 3A. Partner Organization Gifts
**Pattern:** `PMERIT-GIFT-{{ORG}}-{{YEAR}}`

| Field | Value |
|-------|-------|
| Example Code | `PMERIT-GIFT-CODEPATH-2025` |
| Access Level | ALL products |
| Uses | 50-100 (per partnership agreement) |
| Expiration | End of year or per agreement |
| Who Gets It | Verified nonprofit partners |

#### 3B. Individual Gifts
**Pattern:** `PMERIT-GIFT-{{NAME}}-{{CODE}}`

| Field | Value |
|-------|-------|
| Example Code | `PMERIT-GIFT-JOHN-7X9K` |
| Access Level | ALL products |
| Uses | 8 (one per product) |
| Expiration | None |
| Who Gets It | Individual gift recipients |

#### 3C. Community Giveaways
**Pattern:** `PMERIT-GIFT-COMMUNITY-{{MMYY}}`

| Field | Value |
|-------|-------|
| Example Code | `PMERIT-GIFT-COMMUNITY-0125` |
| Access Level | ALL products |
| Uses | 10-25 per month |
| Expiration | End of month |
| Who Gets It | Contest winners, social media giveaways |

---

## GUMROAD SETUP INSTRUCTIONS

### Step-by-Step: Creating a Discount Code

1. Log in to Gumroad → **Checkout** (left sidebar)
2. Click **Discounts** tab
3. Click **New discount** (pink button, top right)
4. Fill in fields:

| Field | What to Enter |
|-------|---------------|
| Code | The credential code (e.g., `PMERIT-TEST-OLU-0101`) |
| Amount off | `100%` (or specific amount for partial discounts) |
| Products | Select all 8 AIXORD products (or specific ones) |
| Max uses | Set limit (8 for testers, unlimited for master) |
| Minimum price | Leave blank |
| Start date | Today |
| End date | Set expiration (or leave blank for no expiration) |

5. Click **Create discount**

---

### Master Code Setup

```
Code:       PMERIT-MASTER-2025X
Amount:     100%
Products:   ☑ All AIXORD products (all 8)
Max uses:   [Leave blank - unlimited]
End date:   [Leave blank - no expiration]
```

### Tester Code Setup (Olufikayo)

```
Code:       PMERIT-TEST-OLU-0101
Amount:     100%
Products:   ☑ All AIXORD products (all 8)
Max uses:   8
End date:   January 31, 2025
```

### Tester Code Setup (Blessing)

```
Code:       PMERIT-TEST-BLS-0101
Amount:     100%
Products:   ☑ All AIXORD products (all 8)
Max uses:   8
End date:   January 31, 2025
```

### Gift Code Setup (Pilot Program)

```
Code:       PMERIT-GIFT-PILOT-2025
Amount:     100%
Products:   ☑ All AIXORD products (all 8)
Max uses:   10
End date:   March 31, 2025
```

---

## GOVERNANCE FILE INTEGRATION

The AIXORD_GOVERNANCE_V3.1.md file contains the **AI-side validation logic**. Here's what needs to be in the License Validation section:

```markdown
## ⚖️ LICENSE VALIDATION (Required First-Time Setup)

This AIXORD product is licensed for up to **2 authorized email addresses**.

### On First Use:
I will ask: **"Please enter your license email or authorization code."**

### Authorized Emails for This License:
```
SLOT 1 (Primary):   {{buyer_email}}
SLOT 2 (Secondary): [Not yet registered]
```

### Valid Authorization Codes:

| Code Pattern | Access Level | Purpose |
|--------------|--------------|---------|
| Registered email | Full | Purchaser or authorized user |
| `PMERIT-MASTER-*` | Unlimited | Seller/Admin override |
| `PMERIT-TEST-*` | Full (time-limited) | Authorized testers |
| `PMERIT-GIFT-*` | Full | Charity/promotional gifts |

### Validation Rules:

1. **Registered Email:** Accept if matches SLOT 1 or SLOT 2
2. **PMERIT-MASTER-*:** Always accept (seller override)
3. **PMERIT-TEST-*:** Accept and note "Tester Access"
4. **PMERIT-GIFT-*:** Accept and note "Gift Access"
5. **Any other input:** Reject with purchase link

### If Authorized:
Proceed to environment detection and session start.

### If Unauthorized:
> "This email/code is not authorized for this license.
> Please purchase your own copy at: https://meritwise0.gumroad.com
> Or contact support@pmerit.com if you believe this is an error."
```

---

## CREDENTIAL LIFECYCLE MANAGEMENT

### Creating New Credentials

| When | Action |
|------|--------|
| New tester joins | Create `PMERIT-TEST-[NAME]-[MMDD]` in Gumroad |
| New partner signs | Create `PMERIT-GIFT-[ORG]-[YEAR]` in Gumroad |
| Monthly giveaway | Create `PMERIT-GIFT-COMMUNITY-[MMYY]` in Gumroad |
| Quarterly rotation | Create new `PMERIT-MASTER-[YEAR]Q[N]` |

### Revoking Credentials

| When | Action |
|------|--------|
| Testing complete | Delete tester code from Gumroad |
| Code compromised | Delete immediately, notify affected users |
| Partnership ends | Delete partner code, notify organization |
| Quarterly rotation | Delete old master code after confirming new works |

### Tracking Usage

Gumroad shows:
- **Uses:** How many times code was redeemed
- **Revenue:** $0 (for 100% discounts)

Check monthly:
1. Gumroad → Checkout → Discounts
2. Review "Uses" column
3. Identify any unusual patterns

---

## CHARITY GIFT PROGRAM

### Program Structure

**Name:** AIXORD Gift Program
**URL:** pmerit.com/gift-program (future)
**Tagline:** "AI governance tools for those who need them most"

### Eligibility Criteria

| Category | Examples |
|----------|----------|
| Students | Coding bootcamp students, university students |
| Nonprofits | 501(c)(3) organizations, community groups |
| Educators | Teachers, trainers, workshop facilitators |
| Underserved communities | Low-income individuals, developing regions |

### Application Process (Future)

1. Applicant visits pmerit.com/gift-program
2. Fills out form: name, email, organization, intended use
3. PMERIT reviews application (24-48 hours)
4. Approved: Send unique gift code via email
5. Track in spreadsheet for tax/PR purposes

### Partner Outreach Template

```
Subject: Partnership Opportunity — Free AI Governance Tools for Your Community

Dear [Organization Name],

PMERIT LLC is offering complimentary AIXORD licenses to organizations 
serving underserved communities. AIXORD helps people work effectively 
with AI tools like ChatGPT, Claude, and Gemini.

We'd like to provide [X] free licenses for your [students/members/clients].

Benefits:
• Full access to AIXORD methodology ($29.99 value per license)
• All platform variants (Claude, ChatGPT, Gemini, Copilot)
• Email support from PMERIT

Requirements:
• Verify 501(c)(3) status (if applicable)
• Share impact metrics (optional, for our reporting)
• Allow us to mention partnership in marketing (optional)

Interested? Reply to this email or contact support@pmerit.com.

Best,
Idowu J Gabriel, Sr.
Director, PMERIT LLC
```

---

## TRACKING SPREADSHEET TEMPLATE

Create a Google Sheet or Excel file:

| Date | Code | Type | Recipient | Email | Products | Uses | Expires | Status | Notes |
|------|------|------|-----------|-------|----------|------|---------|--------|-------|
| 2025-01-01 | PMERIT-MASTER-2025X | Master | PMERIT Admin | - | All | ∞ | - | Active | Q1 2025 |
| 2025-01-01 | PMERIT-TEST-OLU-0101 | Tester | Olufikayo S. | [email] | All | 8 | Jan 31 | Active | NDA signed |
| 2025-01-01 | PMERIT-TEST-BLS-0101 | Tester | Blessing A. | blessing@pmerit.com | All | 8 | Jan 31 | Active | Internal |
| 2025-01-01 | PMERIT-GIFT-PILOT-2025 | Gift | Pilot Program | Various | All | 10 | Mar 31 | Active | Testing gift flow |

---

## SECURITY CHECKLIST

- [ ] Master code stored securely (password manager, not in files)
- [ ] Master code rotated quarterly
- [ ] Tester codes have expiration dates
- [ ] Tester NDAs signed before code issued
- [ ] Gift codes tracked in spreadsheet
- [ ] Compromised codes deleted immediately
- [ ] Usage reviewed monthly

---

## QUICK REFERENCE

### Code Patterns

| Type | Pattern | Example |
|------|---------|---------|
| Master | `PMERIT-MASTER-{{key}}` | `PMERIT-MASTER-2025X` |
| Tester | `PMERIT-TEST-{{NAME}}-{{MMDD}}` | `PMERIT-TEST-OLU-0101` |
| Gift (Org) | `PMERIT-GIFT-{{ORG}}-{{YEAR}}` | `PMERIT-GIFT-CODEPATH-2025` |
| Gift (Individual) | `PMERIT-GIFT-{{NAME}}-{{CODE}}` | `PMERIT-GIFT-JOHN-7X9K` |
| Gift (Community) | `PMERIT-GIFT-COMMUNITY-{{MMYY}}` | `PMERIT-GIFT-COMMUNITY-0125` |

### Gumroad Path

`Gumroad → Checkout → Discounts → New discount`

### Support Email

`support@pmerit.com`

---

*AIXORD Credential System — Authority. Access. Accountability.*
*© 2025 PMERIT LLC*
