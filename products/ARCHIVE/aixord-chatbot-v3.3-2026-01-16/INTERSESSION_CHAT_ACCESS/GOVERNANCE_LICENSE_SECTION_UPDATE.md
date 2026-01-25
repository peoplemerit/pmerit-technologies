# LICENSE VALIDATION SECTION (For AIXORD_GOVERNANCE_V3.1.md)

**Copy this section into the governance file to enable credential validation.**

---

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

### How to Register a Second Email:
Contact support@pmerit.com with:
- Your Gumroad purchase receipt
- The email you wish to add

### Valid Authorization Codes:

| Code Pattern | Access Level | Purpose |
|--------------|--------------|---------|
| Registered email | Full | Purchaser or authorized user |
| `PMERIT-MASTER-*` | Unlimited | Seller/Admin override |
| `PMERIT-TEST-*` | Full (time-limited) | Authorized testers |
| `PMERIT-GIFT-*` | Full | Charity/promotional gifts |

### Validation Logic:

When user provides input, I check in this order:

1. **Is it a registered email?**
   - Check if input matches SLOT 1 or SLOT 2
   - If yes → ✅ Proceed with "Welcome back, [email]"

2. **Does it start with `PMERIT-MASTER-`?**
   - If yes → ✅ Proceed with "Master access confirmed"
   - Do NOT display or log the full code

3. **Does it start with `PMERIT-TEST-`?**
   - If yes → ✅ Proceed with "Tester access confirmed"
   - Note: "Testing mode — please report issues to support@pmerit.com"

4. **Does it start with `PMERIT-GIFT-`?**
   - If yes → ✅ Proceed with "Gift access confirmed — thank you for being part of the AIXORD community"

5. **None of the above?**
   - ❌ Reject with message below

### If Unauthorized:

> "This email or code is not authorized for this license.
> 
> **To get AIXORD:**
> - Purchase at: https://meritwise0.gumroad.com
> - Or contact support@pmerit.com if you believe this is an error
> 
> **Already purchased?** Enter the email you used at checkout."

### License Terms:
- This license is **NON-TRANSFERABLE**
- Redistribution, resale, or unauthorized sharing is **PROHIBITED**
- Registered users receive updates and support
- Piracy reports: legal@pmerit.com

### After Validation:
Once authorized, I proceed to:
1. Detect your environment tier (A/B/C)
2. Check for existing project state
3. Begin session startup protocol
```

---

## NOTES FOR CLAUDE CODE

When updating AIXORD_GOVERNANCE_V3.1.md:

1. **Replace** the existing LICENSE VALIDATION section with the above
2. **Ensure** the code patterns match exactly:
   - `PMERIT-MASTER-*` (asterisk is wildcard)
   - `PMERIT-TEST-*`
   - `PMERIT-GIFT-*`
3. **Keep** the `{{buyer_email}}` placeholder — Gumroad replaces this on download
4. **Test** by saying a test code to confirm AI recognizes it

---

## TEST SCENARIOS

After updating, test these inputs:

| Input | Expected Response |
|-------|-------------------|
| `test@example.com` (not registered) | "This email is not authorized..." |
| `PMERIT-MASTER-2025X` | "Master access confirmed" |
| `PMERIT-TEST-OLU-0101` | "Tester access confirmed" |
| `PMERIT-GIFT-PILOT-2025` | "Gift access confirmed" |
| `random-text` | "This email or code is not authorized..." |
