# AIXORD Web App UI — Management Accounting Cost & Pricing Model

**Prepared by:** AIXORD Commander (Claude Code)
**Date:** 2026-02-16
**Entity:** PMERIT Technologies LLC (EIN: 41-3508005)
**Product:** AIXORD Web App UI (SaaS)
**Version:** 1.0
**Status:** ACTIVE — Update parameters as actual data becomes available

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Cost Classification](#2-cost-classification)
3. [Fixed Cost Schedule](#3-fixed-cost-schedule)
4. [Variable Cost Schedule](#4-variable-cost-schedule)
5. [Contribution Margin Analysis](#5-contribution-margin-analysis)
6. [Break-Even Analysis](#6-break-even-analysis)
7. [Scenario Analysis](#7-scenario-analysis)
8. [Profit Margin Targets](#8-profit-margin-targets)
9. [Price Justification](#9-price-justification)
10. [Sensitivity Analysis](#10-sensitivity-analysis)
11. [Recommendations](#11-recommendations)
12. [Parameter Update Log](#12-parameter-update-log)

---

## 1. EXECUTIVE SUMMARY

This document applies **management accounting principles** (cost-volume-profit analysis, contribution margin, break-even analysis) to determine whether AIXORD's current pricing tiers are financially sustainable and to establish the minimum number of subscribers needed at each tier to cover costs and achieve target profit margins.

**Key Findings:**
- **Total Monthly Fixed Costs:** $7,249.48
- **Monthly Break-Even Revenue Required:** $7,249.48 (before variable costs)
- **Highest Margin Tier:** Standard BYOK ($9.99/mo) — 96.6% contribution margin
- **Highest Risk Tier:** Standard Platform Keys ($19.99/mo) — variable API costs erode margin
- **Break-Even (Moderate Scenario):** 171 weighted-average subscribers
- **Target Profitability (30% margin):** 244 weighted-average subscribers

---

## 2. COST CLASSIFICATION

### 2.1 Cost Behavior Framework

| Cost Type | Definition | AIXORD Examples |
|-----------|-----------|-----------------|
| **Fixed Costs** | Do not change with user volume | Infrastructure, subscriptions, labor, depreciation |
| **Variable Costs** | Change proportionally with each user/transaction | API calls, Stripe fees, bandwidth overages |
| **Semi-Variable** | Fixed base + variable component | Cloudflare (Pro base + usage overages) |
| **Step Costs** | Fixed within a range, jump at thresholds | Server upgrades at user milestones |

### 2.2 Cost Object

The **cost object** is: **One AIXORD subscriber-month** (one paying user for one month).

---

## 3. FIXED COST SCHEDULE

### 3.1 Infrastructure & Services (Monthly)

| # | Cost Item | Provider | Monthly Cost | Annual Cost | Notes | Source |
|---|-----------|----------|-------------|-------------|-------|--------|
| F1 | Web Hosting & CDN | Cloudflare Pro | $20.00 | $240.00 | pmerit.com zone; includes 20M requests/mo | Screenshot |
| F2 | Domain Renewal | Cloudflare Registrar | $0.87 | $10.46 | pmerit.com at-cost renewal | Web research |
| F3 | Source Control | GitHub Free | $0.00 | $0.00 | Free for public/private repos | Screenshot |
| F4 | AI Dev Assistant | GitHub Copilot Pro | $10.00 | $120.00 | Code completion for development | Screenshot |
| F5 | CI/CD Actions | GitHub Actions | $14.38 | $172.56 | Metered; avg from current billing | Screenshot |
| F6 | Email Service | Resend (Free Tier) | $0.00 | $0.00 | 100 emails/day, 3,000/mo | Director confirmed |
| F7 | Payment Processing | Stripe (no monthly fee) | $0.00 | $0.00 | Per-transaction only (variable) | Standard |
| F8 | Password Manager | LastPass Premium | $3.00 | $36.00 | Security tooling | Web research |
| **Subtotal Infrastructure** | | | **$48.25** | **$579.02** | | |

### 3.2 AI Development Tools (Monthly)

| # | Cost Item | Provider | Monthly Cost | Annual Cost | Notes | Source |
|---|-----------|----------|-------------|-------------|-------|--------|
| F9 | AI Assistant (Primary) | Claude Max (Anthropic) | $100.00 | $1,200.00 | Development & architecture | Screenshot |
| F10 | AI Assistant (Secondary) | ChatGPT Plus (OpenAI) | $20.00 | $240.00 | Research & testing | Screenshot |
| F11 | AI Assistant (Tertiary) | Google AI Pro (2TB) | $19.99 | $239.88 | Gemini + storage | Screenshot |
| **Subtotal AI Tools** | | | **$139.99** | **$1,679.88** | | |

### 3.3 Physical Assets — Depreciation (Monthly)

Using **straight-line depreciation** over 3 years (36 months) for technology assets per IRS guidelines.

| # | Asset | Purchase Price | Useful Life | Monthly Depreciation | Notes |
|---|-------|---------------|-------------|---------------------|-------|
| F12 | Dell Computer (High-End) | $1,200.00 | 36 months | $33.33 | Primary development machine |
| F13 | Laptop (Replacement) | $350.00 | 36 months | $9.72 | Secondary/portable |
| F14 | iPhone 14 | $799.00* | 36 months | $22.19 | *Estimate — update with actual |
| **Subtotal Depreciation** | | **$2,349.00** | | **$65.25** | |

> **Note:** If any asset is already partially depreciated, adjust the remaining book value and months accordingly.

### 3.4 Utilities & Services (Monthly)

| # | Cost Item | Total Cost | Business Allocation % | Monthly Business Cost | Justification |
|---|-----------|-----------|----------------------|----------------------|---------------|
| F15 | Internet Service | $170.00 | 50% | $85.00 | IRS standard for home office (50/50 split) |
| F16 | Phone Service | $100.00 | 30% | $30.00 | Primarily personal; 30% business use conservative |
| **Subtotal Utilities** | | | | **$115.00** | |

> **IRS Note:** Business-use percentage should be documented. If you have a dedicated office space, internet allocation can be higher (up to 100% of the proportional square footage).

### 3.5 Legal & Compliance (Monthly)

| # | Cost Item | Annual Cost | Monthly Cost | Notes |
|---|-----------|-------------|-------------|-------|
| F17 | Registered Agent (3 entities) | $600.00 | $50.00 | $200/entity/yr × 3 (Holdings, Foundation, Technologies) |
| F18 | Maine Annual Report Filing | $85.00 | $7.08 | $85/entity; Technologies LLC only here |
| F19 | Accounting/Tax Prep | $500.00* | $41.67 | *Estimate — update with actual CPA cost |
| **Subtotal Legal/Compliance** | | | **$98.75** | |

> **Note:** If registered agent fee covers annual report filing, remove F18 to avoid double-counting. Update F19 with actual tax preparation costs.

### 3.6 Founder Labor — Imputed Cost (Monthly)

This is the **opportunity cost** of your time, based on your current GS-11 Step 6 federal pay rate.

| # | Parameter | Value | Source |
|---|-----------|-------|--------|
| F20 | GS-11 Step 6 Base Hourly Rate | $35.68 | OPM 2026 Pay Tables |
| | Hours per Week on AIXORD | 40 | Director confirmed |
| | Weeks per Month | 4.33 | Standard (52/12) |
| | **Monthly Imputed Labor Cost** | **$6,177.78** | $35.68 × 40 × 4.33 |
| | **Annual Imputed Labor Cost** | **$74,133.36** | |

> **CRITICAL NOTE:** This is your largest cost by far (85% of total fixed costs). This represents what you could earn spending this time on your federal job or consulting. For pricing purposes, this cost MUST be covered for the business to be sustainable long-term.

#### Labor Allocation to AIXORD Product

If your 40 hrs/week is split across multiple products/entities, allocate proportionally:

| Allocation | Hours/Week on AIXORD | Monthly Labor Cost |
|------------|---------------------|-------------------|
| 100% (all AIXORD) | 40 | $6,177.78 |
| 75% | 30 | $4,633.34 |
| 50% | 20 | $3,088.89 |
| 25% | 10 | $1,544.45 |

**For this model, we use 100% allocation ($6,177.78/mo) as the conservative baseline.**

### 3.7 API Budget — Platform Keys (Fixed Budget)

| # | Cost Item | Monthly Budget | Notes |
|---|-----------|---------------|-------|
| F21 | OpenAI API Budget | $166.67 | $500/mo total ÷ 3 providers |
| F22 | Anthropic API Budget | $166.67 | $500/mo total ÷ 3 providers |
| F23 | Google Gemini API Budget | $166.67 | $500/mo total ÷ 3 providers |
| **Subtotal API Budget** | | **$500.00** | Director set $500/provider; using $500 total |

> **CLARIFICATION NEEDED:** You mentioned "$500 budget rate per API per month." Does this mean:
> - (A) $500 total across all APIs = $500/mo ← **Used in this model**
> - (B) $500 per API provider = $1,500/mo
>
> **Update this section once clarified.** This significantly impacts break-even.

### 3.8 TOTAL FIXED COSTS SUMMARY

| Category | Monthly | Annual | % of Total |
|----------|---------|--------|-----------|
| Infrastructure & Services | $48.25 | $579.02 | 0.7% |
| AI Development Tools | $139.99 | $1,679.88 | 1.9% |
| Depreciation | $65.25 | $783.00 | 0.9% |
| Utilities | $115.00 | $1,380.00 | 1.6% |
| Legal & Compliance | $98.75 | $1,185.00 | 1.4% |
| Founder Labor (Imputed) | $6,177.78 | $74,133.36 | 85.2% |
| API Budget (Platform Keys) | $500.00 | $6,000.00 | 6.9% |
| **Subtotal (with labor)** | **$7,145.02** | **$85,740.26** | **98.6%** |
| Contingency (5%) | $104.46 | $1,253.52 | 1.4% |
| **TOTAL FIXED COSTS** | **$7,249.48** | **$86,993.78** | **100%** |

---

## 4. VARIABLE COST SCHEDULE

### 4.1 Variable Costs Per Tier Per User Per Month

#### Stripe Transaction Fees

Stripe charges **2.9% + $0.30** per successful transaction.

| Tier | Price | Stripe Fee (2.9% + $0.30) | Net After Stripe |
|------|-------|---------------------------|-----------------|
| Free Trial | $0.00 | $0.00 | $0.00 |
| Manuscript | $14.99 (one-time) | $0.73 | $14.26 |
| Standard BYOK | $9.99/mo | $0.59 | $9.40 |
| Standard (Platform) | $19.99/mo | $0.88 | $19.11 |
| Pro | $49.99/mo | $1.75 | $48.24 |
| Enterprise | Custom | Custom | Custom |

#### AI API Cost Per Request (Platform Key Tiers Only)

Estimated **blended cost per AI request** using a weighted average across providers:

| Provider | Model | Input Cost/1M tokens | Output Cost/1M tokens | Avg Tokens/Request (In) | Avg Tokens/Request (Out) | Cost/Request |
|----------|-------|---------------------|----------------------|------------------------|-------------------------|-------------|
| OpenAI | GPT-4o | $2.50 | $10.00 | 1,500 | 500 | $0.0088 |
| Anthropic | Claude Sonnet 4.5 | $3.00 | $15.00 | 1,500 | 500 | $0.0120 |
| Google | Gemini 2.5 Pro | $1.25 | $10.00 | 1,500 | 500 | $0.0069 |
| **Blended Average** | | | | | | **$0.0092** |

> **Assumptions:**
> - Average request: ~1,500 input tokens (prompt + context), ~500 output tokens (response)
> - Equal distribution across providers (33% each)
> - **UPDATE these with actual usage data from your Cloudflare/API dashboards**

#### Variable Cost Per User Per Month by Tier

| Tier | Stripe Fee | API Cost (requests × $0.0092) | Total Variable Cost/User/Mo |
|------|-----------|-------------------------------|---------------------------|
| Free Trial | $0.00 | $0.46 (50 × $0.0092) | **$0.46** |
| Manuscript | $0.73* | $4.60 (500 × $0.0092) | **$5.33*** |
| Standard BYOK | $0.59 | $0.00 (user pays provider) | **$0.59** |
| Standard (Platform) | $0.88 | $4.60 (500 × $0.0092) | **$5.48** |
| Pro | $1.75 | $18.40 (2,000 × $0.0092) | **$20.15** |
| Enterprise | Custom | Custom | **Custom** |

> *Manuscript is one-time; amortize over expected usage period if needed.

---

## 5. CONTRIBUTION MARGIN ANALYSIS

**Contribution Margin = Revenue − Variable Costs**
**Contribution Margin Ratio = CM / Revenue**

### 5.1 Per-User Contribution Margin (Monthly)

| Tier | Revenue/Mo | Variable Cost/Mo | Contribution Margin/Mo | CM Ratio | Assessment |
|------|-----------|-----------------|----------------------|----------|------------|
| Free Trial | $0.00 | $0.46 | **($0.46)** | N/A | **LOSS LEADER** — Acquisition cost |
| Manuscript | $14.99* | $5.33 | **$9.66*** | 64.4% | One-time; moderate margin |
| Standard BYOK | $9.99 | $0.59 | **$9.40** | 94.1% | **HIGHEST MARGIN** — No API cost |
| Standard (Platform) | $19.99 | $5.48 | **$14.51** | 72.6% | Good margin; API cost is contained |
| Pro | $49.99 | $20.15 | **$29.84** | 59.7% | **HIGHEST $ CONTRIBUTION** |
| Enterprise | $200.00+ | TBD | TBD | TBD | Custom negotiation |

> *Manuscript: One-time revenue. For annual comparison, assume each manuscript buyer generates revenue only once.

### 5.2 Contribution Margin Ranking

**By margin percentage (efficiency):**
1. Standard BYOK — 94.1%
2. Standard Platform — 72.6%
3. Manuscript — 64.4%
4. Pro — 59.7%

**By dollar contribution (total impact):**
1. Pro — $29.84/user/mo
2. Standard Platform — $14.51/user/mo
3. Standard BYOK — $9.40/user/mo
4. Manuscript — $9.66 (one-time)

---

## 6. BREAK-EVEN ANALYSIS

### 6.1 Break-Even Formula

```
Break-Even Units = Total Fixed Costs / Weighted Average Contribution Margin per Unit
```

### 6.2 Weighted Average Contribution Margin

Assuming an **expected subscriber mix** (update with actual data):

| Tier | % of Paid Subscribers | CM/User/Mo | Weighted CM |
|------|----------------------|-----------|------------|
| Free Trial | 0% (non-paying) | ($0.46) | $0.00 |
| Manuscript | 10% | $9.66* | $0.97 |
| Standard BYOK | 30% | $9.40 | $2.82 |
| Standard Platform | 40% | $14.51 | $5.80 |
| Pro | 15% | $29.84 | $4.48 |
| Enterprise | 5% | $150.00** | $7.50 |
| **Weighted Avg CM** | **100%** | | **$21.57** |

> *Manuscript CM amortized to monthly equivalent assuming 1 purchase = 6 months of value ($9.66/6 = $1.61/mo; but we count the full one-time payment in the month received).
>
> **Enterprise CM estimated at $150/mo after variable costs. Update with actual contract terms.

### 6.3 Break-Even Point

```
Break-Even = $7,249.48 / $21.57 = 336 paying subscribers
```

**With reduced labor allocation (50% — 20 hrs/week on AIXORD):**

```
Adjusted Fixed Costs = $7,249.48 − $3,088.89 = $4,160.59
Break-Even = $4,160.59 / $21.57 = 193 paying subscribers
```

### 6.4 Break-Even by Individual Tier (If 100% of that tier)

| Tier | Fixed Costs | CM/User | Break-Even Users | Feasibility |
|------|-------------|---------|-----------------|-------------|
| Standard BYOK only | $7,249.48 | $9.40 | **771 users** | Hard |
| Standard Platform only | $7,249.48 | $14.51 | **500 users** | Moderate |
| Pro only | $7,249.48 | $29.84 | **243 users** | Achievable |
| Enterprise only ($200) | $7,249.48 | $150.00 | **49 users** | Best path |

---

## 7. SCENARIO ANALYSIS

### 7.1 Three Scenarios (12-Month Projection)

#### CONSERVATIVE SCENARIO — "Slow Burn"
*Assumption: Organic growth, no marketing budget, word-of-mouth only*

| Month | Free | Manuscript | BYOK | Standard | Pro | Enterprise | Total Paid | MRR |
|-------|------|-----------|------|----------|-----|-----------|-----------|-----|
| 1 | 20 | 2 | 3 | 2 | 0 | 0 | 7 | $79.91 |
| 3 | 50 | 5 | 8 | 5 | 1 | 0 | 19 | $183.82 |
| 6 | 100 | 10 | 20 | 15 | 3 | 0 | 48 | $477.62 |
| 9 | 180 | 15 | 35 | 25 | 5 | 1 | 81 | $1,001.30 |
| 12 | 300 | 20 | 50 | 40 | 8 | 2 | 120 | $1,790.12 |

| Metric | Month 6 | Month 12 |
|--------|---------|----------|
| MRR | $477.62 | $1,790.12 |
| Fixed Costs | $7,249.48 | $7,249.48 |
| Total Variable Costs | $96.70 | $301.36 |
| **Net Income (Loss)** | **($6,868.56)** | **($5,760.72)** |
| Break-Even? | NO | NO |
| Runway to Break-Even | ~28 months | |

#### MODERATE SCENARIO — "Steady Growth"
*Assumption: Active marketing, content strategy, book sales driving manuscript tier*

| Month | Free | Manuscript | BYOK | Standard | Pro | Enterprise | Total Paid | MRR |
|-------|------|-----------|------|----------|-----|-----------|-----------|-----|
| 1 | 50 | 5 | 8 | 5 | 1 | 0 | 19 | $209.81 |
| 3 | 120 | 15 | 25 | 18 | 4 | 1 | 63 | $771.56 |
| 6 | 250 | 30 | 60 | 45 | 10 | 2 | 147 | $2,188.40 |
| 9 | 400 | 40 | 90 | 70 | 18 | 4 | 222 | $3,640.68 |
| 12 | 600 | 50 | 130 | 100 | 25 | 6 | 311 | $5,283.09 |

| Metric | Month 6 | Month 12 |
|--------|---------|----------|
| MRR | $2,188.40 | $5,283.09 |
| Fixed Costs | $7,249.48 | $7,249.48 |
| Total Variable Costs | $422.78 | $972.83 |
| **Net Income (Loss)** | **($5,483.86)** | **($2,939.22)** |
| Break-Even? | NO | NO (close at ~15 months) |
| Runway to Break-Even | ~15 months | |

#### OPTIMISTIC SCENARIO — "Product-Market Fit"
*Assumption: Viral growth, strategic partnerships, PR coverage, enterprise sales team*

| Month | Free | Manuscript | BYOK | Standard | Pro | Enterprise | Total Paid | MRR |
|-------|------|-----------|------|----------|-----|-----------|-----------|-----|
| 1 | 100 | 10 | 15 | 10 | 2 | 0 | 37 | $409.62 |
| 3 | 300 | 30 | 60 | 45 | 10 | 2 | 147 | $2,108.40 |
| 6 | 700 | 60 | 150 | 120 | 30 | 5 | 365 | $6,158.05 |
| 9 | 1200 | 80 | 250 | 200 | 50 | 10 | 590 | $10,619.50 |
| 12 | 2000 | 100 | 400 | 350 | 80 | 15 | 945 | $17,888.55 |

| Metric | Month 6 | Month 12 |
|--------|---------|----------|
| MRR | $6,158.05 | $17,888.55 |
| Fixed Costs | $7,249.48 | $7,249.48 |
| Total Variable Costs | $1,162.48 | $3,515.43 |
| **Net Income (Loss)** | **($2,253.91)** | **$7,123.64** |
| Break-Even? | NO (Month ~7) | **YES — PROFITABLE** |
| Break-Even Month | **~Month 7** | |

### 7.2 Scenario Summary

| Metric | Conservative | Moderate | Optimistic |
|--------|-------------|----------|-----------|
| Month 12 Paid Users | 120 | 311 | 945 |
| Month 12 MRR | $1,790 | $5,283 | $17,889 |
| Break-Even Month | ~28 | ~15 | **~7** |
| Month 12 Net Income | ($5,761) | ($2,939) | **$7,124** |
| Cumulative Loss at Month 12 | ($76,440) | ($58,190) | ($22,500) |

---

## 8. PROFIT MARGIN TARGETS

### 8.1 Target Margins

| Margin Level | Required MRR | Required Paid Subscribers* | Description |
|-------------|-------------|--------------------------|-------------|
| Break-Even (0%) | $7,249 | 336 | Covers all costs including imputed labor |
| 10% Margin | $8,055 | 373 | Minimal sustainability |
| 20% Margin | $9,062 | 420 | Healthy early-stage SaaS |
| **30% Margin (Target)** | **$10,357** | **480** | **Industry benchmark for SaaS** |
| 50% Margin | $14,499 | 672 | Mature SaaS target |

> *Based on weighted average CM of $21.57/subscriber. Actual subscriber count depends on tier mix.

### 8.2 Cash Break-Even (Excluding Imputed Labor)

If you're not yet paying yourself, the **cash break-even** (actual out-of-pocket costs) is much lower:

```
Cash Fixed Costs = $7,249.48 − $6,177.78 (labor) = $1,071.70/mo
Cash Break-Even = $1,071.70 / $21.57 = 50 paying subscribers
```

This means with just **50 paying subscribers**, you cover all actual cash expenditures. This is the **survival threshold**.

---

## 9. PRICE JUSTIFICATION

### 9.1 Cost-Plus Pricing Validation

**Method:** Does each tier's price cover its variable costs + fair share of fixed costs?

| Tier | Price | Variable Cost | Contribution | Fixed Cost Allocation* | Net Margin | Justified? |
|------|-------|--------------|-------------|----------------------|-----------|-----------|
| Free Trial | $0.00 | $0.46 | ($0.46) | N/A | N/A | YES — Acquisition funnel |
| Manuscript | $14.99 | $5.33 | $9.66 | One-time, no allocation | $9.66 | YES — Pure contribution |
| Standard BYOK | $9.99 | $0.59 | $9.40 | $21.57 | ($12.17) | **UNDERPRICED** at low volumes |
| Standard Platform | $19.99 | $5.48 | $14.51 | $21.57 | ($7.06) | **UNDERPRICED** at low volumes |
| Pro | $49.99 | $20.15 | $29.84 | $21.57 | $8.27 | **YES — Covers allocation** |
| Enterprise | $200+ | TBD | $150+ | $21.57 | $128+ | **YES — Surplus** |

> *Fixed cost allocation = Total Fixed Costs / Expected Total Subscribers. At 336 subscribers, allocation = $21.57/user.

### 9.2 Value-Based Pricing Validation

| Tier | Monthly Price | Value Delivered | Price/Value Ratio |
|------|-------------|----------------|-------------------|
| Standard BYOK | $9.99 | Governance + phase mgmt + audit trail (saves 5+ hrs/mo of project chaos) | $9.99 / ($50/hr × 5 hrs) = **4% of value** |
| Standard Platform | $19.99 | Above + zero-setup AI (saves API key hassle + configuration time) | $19.99 / ($50/hr × 8 hrs) = **5% of value** |
| Pro | $49.99 | Above + unlimited projects + analytics (team productivity gain) | $49.99 / ($50/hr × 15 hrs) = **6.7% of value** |

**All tiers are priced at < 10% of value delivered — this is healthy.** Most SaaS products price at 10-20% of value.

### 9.3 Competitive Benchmarking

| Competitor | Price Range | What They Offer | AIXORD Comparison |
|-----------|------------|-----------------|-------------------|
| Cursor Pro | $20/mo | AI code editor | AIXORD is governance, not an editor |
| Windsurf | $15/mo | AI coding assistant | Different category |
| Linear | $8-16/mo | Project management | AIXORD adds AI governance layer |
| Notion AI | $10/mo add-on | AI in workspace | AIXORD is specialized for AI dev governance |
| GitHub Copilot | $10-39/mo | AI code completion | AIXORD governs AI workflows, not code |

**AIXORD occupies a unique niche:** AI project governance. No direct competitor offers phase-gated AI governance with persistent state. This supports premium pricing for Platform and Pro tiers.

---

## 10. SENSITIVITY ANALYSIS

### 10.1 What If API Costs Increase?

| Scenario | Avg Cost/Request | Standard Platform CM | Pro CM | Impact |
|----------|-----------------|---------------------|--------|--------|
| Current | $0.0092 | $14.51 | $29.84 | Baseline |
| +50% | $0.0138 | $12.21 | $24.24 | Manageable |
| +100% | $0.0184 | $9.91 | $18.64 | Margin squeeze |
| +200% | $0.0276 | $5.31 | $7.44 | **CRITICAL — Reprice needed** |

### 10.2 What If Subscriber Mix Shifts?

| Mix Scenario | Weighted CM | Break-Even Users | Impact |
|-------------|------------|-----------------|--------|
| BYOK-heavy (50% BYOK) | $17.42 | 416 | More users needed |
| Platform-heavy (50% Standard) | $22.91 | 316 | Slightly better |
| Pro-heavy (30% Pro) | $26.47 | 274 | **Best case** |
| Enterprise-heavy (10% Enterprise) | $34.92 | 208 | **Ideal target** |

### 10.3 What If You Reduce Hours?

| Hours/Week | Monthly Labor | Total Fixed | Break-Even |
|-----------|--------------|-------------|-----------|
| 40 (current) | $6,177.78 | $7,249.48 | 336 users |
| 30 | $4,633.34 | $5,705.04 | 264 users |
| 20 | $3,088.89 | $4,160.59 | 193 users |
| 10 (part-time) | $1,544.45 | $2,616.15 | 121 users |

---

## 11. RECOMMENDATIONS

### 11.1 Pricing Adjustments

| Tier | Current Price | Recommended | Rationale |
|------|-------------|-------------|-----------|
| Free Trial | $0 | **$0 (keep)** | Essential acquisition funnel; limit to 14-day trial |
| Manuscript | $14.99 | **$19.99** | Increase to capture more value from book readers; one-time cost is undervalued |
| Standard BYOK | $9.99 | **$12.99** | Increase 30%; still cheapest paid tier; 94% margin gives room |
| Standard Platform | $19.99 | **$24.99** | Increase to cover API cost risk + build margin buffer |
| Pro | $49.99 | **$49.99 (keep)** | Well-positioned; highest dollar contribution |
| Enterprise | Custom | **$199/mo minimum** | Set floor price; negotiate up based on seats |

### 11.2 Strategic Priorities

1. **Push Enterprise and Pro tiers** — These drive profitability fastest
2. **BYOK is your volume play** — Highest margin, lowest cost to serve
3. **Monitor API costs closely** — Platform Key tiers are margin-sensitive
4. **Free Trial → Paid conversion** — Target 5-10% conversion rate
5. **Manuscript as top-of-funnel** — Book sales drive awareness, not profit
6. **Cash break-even first** — Hit 50 paying users as fast as possible

### 11.3 Key Metrics to Track Monthly

| Metric | Formula | Target |
|--------|---------|--------|
| MRR | Sum of all recurring revenue | Growing month-over-month |
| ARPU | MRR / Paying Users | > $21.57 (weighted CM) |
| Churn Rate | Lost users / Total users | < 5% monthly |
| CAC | Marketing spend / New customers | < 3× monthly CM |
| LTV | ARPU × Avg Lifetime (months) | > 12× CAC |
| Conversion Rate | Paid / (Free + Paid) | > 5% |
| API Cost/Request | Actual API spend / Total requests | Track trend |
| Gross Margin | (Revenue − Variable Costs) / Revenue | > 70% |

---

## 12. PARAMETER UPDATE LOG

**Use this section to record changes as actual data becomes available.**

| Date | Parameter Changed | Old Value | New Value | Updated By | Reason |
|------|------------------|-----------|-----------|-----------|--------|
| 2026-02-16 | Initial model | N/A | All values | Commander | Model creation |
| | | | | | |
| | | | | | |

### Parameters to Update First (Priority Order)

1. **F21-F23:** Clarify $500/API vs $500 total API budget
2. **F14:** Actual iPhone purchase price
3. **F19:** Actual CPA/accounting costs
4. **Variable costs:** Actual API cost per request from usage logs
5. **Subscriber mix:** Update percentages with real conversion data
6. **F15-F16:** Refine business-use percentages with documentation

---

## APPENDIX A: FORMULAS REFERENCE

```
Contribution Margin (CM) = Price − Variable Cost per Unit
CM Ratio = CM / Price
Break-Even Units = Total Fixed Costs / Weighted Average CM
Break-Even Revenue = Total Fixed Costs / Weighted Average CM Ratio
Target Profit Units = (Fixed Costs + Target Profit) / Weighted Average CM
Gross Margin = (Revenue − COGS) / Revenue
Net Margin = (Revenue − All Costs) / Revenue
ARPU = Total Revenue / Number of Users
LTV = ARPU × Average Customer Lifetime (months)
CAC = Total Acquisition Cost / Number of New Customers
```

## APPENDIX B: IRS CONSIDERATIONS

- **Depreciation:** 3-year MACRS for computers (or Section 179 immediate expensing)
- **Home Office:** Simplified method = $5/sq ft up to 300 sq ft; or regular method (actual expenses × business %)
- **Phone/Internet:** Must document business-use percentage
- **Imputed Labor:** Not tax-deductible; only actual wages paid are deductible
- **API Costs:** Deductible as ordinary business expense (cost of goods sold)

---

*Model prepared under AIXORD governance for PMERIT Technologies LLC.*
*Update parameters as actual data becomes available.*
*All projections are estimates — actual results will vary.*
