# HANDOFF — [Task Title]

**Date:** [YYYY-MM-DD]
**Author:** [Human/AI]
**Priority:** [CRITICAL | HIGH | NORMAL]
**Status:** PENDING EXECUTION

---

## CONTEXT

[Brief background on why this task is needed. 2-3 sentences maximum.]

---

## OBJECTIVE

[Single clear statement of what this HANDOFF accomplishes.]

---

## SCOPE

### In Scope
- [Item 1]
- [Item 2]
- [Item 3]

### Out of Scope
- [Item 1]
- [Item 2]

---

## FILES AFFECTED

| File | Action | Location |
|------|--------|----------|
| [filename] | [CREATE/UPDATE/DELETE] | [path] |
| [filename] | [CREATE/UPDATE/DELETE] | [path] |

---

## EXECUTION STEPS

### Step 1: [Title]
```
[Commands or specific instructions]
```

### Step 2: [Title]
```
[Commands or specific instructions]
```

### Step 3: [Title]
```
[Commands or specific instructions]
```

---

## VERIFICATION

After execution, verify:

- [ ] [Verification check 1]
- [ ] [Verification check 2]
- [ ] [Verification check 3]

---

## VARIANT QA (If Applicable)

**Check one:**
- [ ] N/A — Not a variant task
- [ ] Completed — See verification results below

### Pre-Build Check
- [ ] `Select-String -Pattern "Claude" *.md | Measure-Object` = Count: 0
- [ ] `Select-String -Pattern "Claude" *.json | Measure-Object` = Count: 0

### Post-Build Verification
- [ ] ZIP created successfully
- [ ] File count matches expected

### Verification Output
```powershell
# Paste actual command output here
```

---

## ROLLBACK PLAN

If issues occur:

1. [Rollback step 1]
2. [Rollback step 2]
3. [Rollback step 3]

---

## NOTES

[Any additional context, warnings, or considerations.]

---

## APPROVAL

**Requires:** [Human approval before execution / Execute immediately]

---

*HANDOFF Template v1.0 — AIXORD v3.2.1*
