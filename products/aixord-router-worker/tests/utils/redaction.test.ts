/**
 * Content Redaction Utility Tests (SPG-01 — L-SPG3)
 *
 * Validates PII, PHI, and Minor Data detection and masking in user content.
 * This is a security-critical module — comprehensive coverage is required.
 */

import { describe, it, expect } from 'vitest';
import { redactContent } from '../../src/utils/redaction';
import type { RedactionConfig } from '../../src/types';

// ---------------------------------------------------------------------------
// Helper configs
// ---------------------------------------------------------------------------

const ALL_ENABLED: RedactionConfig = {
  enabled: true,
  mask_pii: true,
  mask_phi: true,
  mask_minor_data: true,
};

const PII_ONLY: RedactionConfig = {
  enabled: true,
  mask_pii: true,
  mask_phi: false,
  mask_minor_data: false,
};

const PHI_ONLY: RedactionConfig = {
  enabled: true,
  mask_pii: false,
  mask_phi: true,
  mask_minor_data: false,
};

const MINOR_ONLY: RedactionConfig = {
  enabled: true,
  mask_pii: false,
  mask_phi: false,
  mask_minor_data: true,
};

const DISABLED: RedactionConfig = {
  enabled: false,
  mask_pii: true,
  mask_phi: true,
  mask_minor_data: true,
};

const R = '[REDACTED]';

// ===========================================================================
// 1. Disabled / passthrough behavior
// ===========================================================================

describe('redactContent — disabled config', () => {
  it('returns content unchanged when enabled=false', () => {
    const input = 'My SSN is 123-45-6789 and email is test@example.com';
    const result = redactContent(input, DISABLED);
    expect(result.redacted).toBe(input);
    expect(result.redactionCount).toBe(0);
    expect(result.redactedTypes).toEqual([]);
  });
});

// ===========================================================================
// 2. Edge cases — empty / benign content
// ===========================================================================

describe('redactContent — edge cases', () => {
  it('handles empty string', () => {
    const result = redactContent('', ALL_ENABLED);
    expect(result.redacted).toBe('');
    expect(result.redactionCount).toBe(0);
    expect(result.redactedTypes).toEqual([]);
  });

  it('returns content unchanged when no PII/PHI is present', () => {
    const input = 'The quick brown fox jumps over the lazy dog.';
    const result = redactContent(input, ALL_ENABLED);
    expect(result.redacted).toBe(input);
    expect(result.redactionCount).toBe(0);
  });

  it('handles text that already contains the [REDACTED] marker', () => {
    const input = 'Previously redacted: [REDACTED] and some more text.';
    const result = redactContent(input, ALL_ENABLED);
    // The existing marker should pass through untouched
    expect(result.redacted).toContain('[REDACTED]');
  });
});

// ===========================================================================
// 3. PII — Email detection and redaction
// ===========================================================================

describe('redactContent — email addresses', () => {
  it('redacts a simple email address', () => {
    const result = redactContent('Contact me at jane@example.com please.', PII_ONLY);
    expect(result.redacted).toBe(`Contact me at ${R} please.`);
    expect(result.redactionCount).toBe(1);
    expect(result.redactedTypes).toContain('EMAIL');
  });

  it('redacts emails with subdomains and plus addressing', () => {
    const result = redactContent('Send to user+tag@mail.sub.example.co.uk', PII_ONLY);
    expect(result.redacted).toContain(R);
    expect(result.redactedTypes).toContain('EMAIL');
  });

  it('redacts multiple email addresses in the same text', () => {
    const input = 'From alice@test.com to bob@corp.org cc: carol@school.edu';
    const result = redactContent(input, PII_ONLY);
    expect(result.redacted).not.toContain('alice@');
    expect(result.redacted).not.toContain('bob@');
    expect(result.redacted).not.toContain('carol@');
    expect(result.redactionCount).toBeGreaterThanOrEqual(3);
  });
});

// ===========================================================================
// 4. PII — Phone number detection and redaction
// ===========================================================================

describe('redactContent — phone numbers', () => {
  it('redacts a basic 10-digit US phone number (XXX-XXX-XXXX)', () => {
    const result = redactContent('Call me at 555-123-4567.', PII_ONLY);
    expect(result.redacted).not.toContain('555-123-4567');
    expect(result.redactedTypes).toContain('PHONE');
  });

  it('redacts phone number with parentheses (XXX) XXX-XXXX', () => {
    const result = redactContent('Phone: (555) 123-4567', PII_ONLY);
    expect(result.redacted).not.toContain('(555) 123-4567');
    expect(result.redactedTypes).toContain('PHONE');
  });

  it('redacts phone number with +1 prefix', () => {
    const result = redactContent('International: +1-555-123-4567', PII_ONLY);
    expect(result.redacted).not.toContain('555-123-4567');
    expect(result.redactedTypes).toContain('PHONE');
  });

  it('redacts phone number with dot separators', () => {
    const result = redactContent('Fax: 555.123.4567', PII_ONLY);
    expect(result.redacted).not.toContain('555.123.4567');
    expect(result.redactedTypes).toContain('PHONE');
  });
});

// ===========================================================================
// 5. PII — SSN detection and redaction
// ===========================================================================

describe('redactContent — Social Security Numbers', () => {
  it('redacts standard SSN format XXX-XX-XXXX', () => {
    const result = redactContent('SSN: 123-45-6789', PII_ONLY);
    expect(result.redacted).not.toContain('123-45-6789');
    expect(result.redactedTypes).toContain('SSN');
  });

  it('redacts SSN without dashes (9 consecutive digits)', () => {
    const result = redactContent('Number is 123456789 on file.', PII_ONLY);
    expect(result.redacted).not.toContain('123456789');
    expect(result.redactedTypes).toContain('SSN');
  });

  it('redacts SSN with spaces as separators', () => {
    const result = redactContent('SSN: 123 45 6789', PII_ONLY);
    expect(result.redacted).not.toContain('123 45 6789');
    expect(result.redactedTypes).toContain('SSN');
  });
});

// ===========================================================================
// 6. PII — Credit card number detection and redaction
// ===========================================================================

describe('redactContent — credit card numbers', () => {
  it('redacts a 16-digit card number with dashes', () => {
    const result = redactContent('Card: 4111-1111-1111-1111', PII_ONLY);
    expect(result.redacted).not.toContain('4111-1111-1111-1111');
    expect(result.redactedTypes).toContain('CC');
  });

  it('redacts a 16-digit card number with spaces', () => {
    const result = redactContent('Visa: 4111 1111 1111 1111', PII_ONLY);
    expect(result.redacted).not.toContain('4111 1111 1111 1111');
    expect(result.redactedTypes).toContain('CC');
  });

  it('redacts a 16-digit card number without separators', () => {
    const result = redactContent('CC# 4111111111111111', PII_ONLY);
    expect(result.redacted).not.toContain('4111111111111111');
    expect(result.redactedTypes).toContain('CC');
  });
});

// ===========================================================================
// 7. PII — Date of Birth detection and redaction
// ===========================================================================

describe('redactContent — date of birth', () => {
  it('redacts DOB: MM/DD/YYYY format', () => {
    const result = redactContent('DOB: 01/15/1990', PII_ONLY);
    expect(result.redacted).not.toContain('01/15/1990');
    expect(result.redactedTypes).toContain('DOB');
  });

  it('redacts "date of birth" keyword followed by a date', () => {
    const result = redactContent('date of birth: 3/5/1985', PII_ONLY);
    expect(result.redacted).not.toContain('3/5/1985');
    expect(result.redactedTypes).toContain('DOB');
  });

  it('redacts "born on" keyword followed by a date', () => {
    const result = redactContent('She was born on 12-25-2000', PII_ONLY);
    expect(result.redacted).not.toContain('12-25-2000');
    expect(result.redactedTypes).toContain('DOB');
  });

  it('redacts "birthday" keyword followed by a date', () => {
    const result = redactContent('birthday: 7/4/99', PII_ONLY);
    expect(result.redacted).not.toContain('7/4/99');
    expect(result.redactedTypes).toContain('DOB');
  });
});

// ===========================================================================
// 8. PHI — Medical record numbers
// ===========================================================================

describe('redactContent — PHI: medical record numbers', () => {
  it('redacts MRN with colon separator', () => {
    const result = redactContent('MRN: ABC-12345', PHI_ONLY);
    expect(result.redacted).not.toContain('ABC-12345');
    expect(result.redactedTypes).toContain('MRN');
  });

  it('redacts "patient id" references', () => {
    const result = redactContent('patient id: PAT-98765', PHI_ONLY);
    expect(result.redacted).not.toContain('PAT-98765');
    expect(result.redactedTypes).toContain('MRN');
  });

  it('redacts "medical record" references', () => {
    const result = redactContent('medical record MR20240101', PHI_ONLY);
    expect(result.redacted).not.toContain('MR20240101');
    expect(result.redactedTypes).toContain('MRN');
  });

  it('redacts "patient number" references', () => {
    const result = redactContent('Patient number: 7890-XYZ', PHI_ONLY);
    expect(result.redacted).not.toContain('7890-XYZ');
    expect(result.redactedTypes).toContain('MRN');
  });
});

// ===========================================================================
// 9. PHI — Insurance ID
// ===========================================================================

describe('redactContent — PHI: insurance ID', () => {
  it('redacts insurance id references', () => {
    const result = redactContent('insurance id: INS-44556', PHI_ONLY);
    expect(result.redacted).not.toContain('INS-44556');
    expect(result.redactedTypes).toContain('INSURANCE_ID');
  });

  it('redacts policy number references', () => {
    const result = redactContent('policy number POL987654', PHI_ONLY);
    expect(result.redacted).not.toContain('POL987654');
    expect(result.redactedTypes).toContain('INSURANCE_ID');
  });
});

// ===========================================================================
// 10. PHI — Prescription references
// ===========================================================================

describe('redactContent — PHI: prescription references', () => {
  it('redacts Rx references', () => {
    const result = redactContent('Rx# RX-2024-001', PHI_ONLY);
    expect(result.redacted).not.toContain('RX-2024-001');
    expect(result.redactedTypes).toContain('RX');
  });

  it('redacts "prescription" keyword references', () => {
    const result = redactContent('prescription: PRSC12345', PHI_ONLY);
    expect(result.redacted).not.toContain('PRSC12345');
    expect(result.redactedTypes).toContain('RX');
  });
});

// ===========================================================================
// 11. PHI — ICD diagnosis codes
// ===========================================================================

describe('redactContent — PHI: ICD codes', () => {
  it('redacts a basic ICD-10 code like E11.9', () => {
    const result = redactContent('Diagnosis: E11.9 (Type 2 diabetes)', PHI_ONLY);
    expect(result.redacted).not.toContain('E11.9');
    expect(result.redactedTypes).toContain('ICD_CODE');
  });

  it('redacts an ICD code without decimal (e.g. J45)', () => {
    const result = redactContent('Code J45 was noted.', PHI_ONLY);
    expect(result.redacted).not.toContain('J45');
    expect(result.redactedTypes).toContain('ICD_CODE');
  });

  it('redacts ICD codes with extended decimals like M54.5', () => {
    const result = redactContent('ICD: M54.5 low back pain', PHI_ONLY);
    expect(result.redacted).not.toContain('M54.5');
    expect(result.redactedTypes).toContain('ICD_CODE');
  });
});

// ===========================================================================
// 12. Minor data — Age references
// ===========================================================================

describe('redactContent — minor data: age references', () => {
  it('redacts "age 5" as a minor reference', () => {
    const result = redactContent('The child is age 5', MINOR_ONLY);
    expect(result.redacted).not.toContain('age 5');
    expect(result.redactedTypes).toContain('MINOR_AGE');
  });

  it('redacts "aged 12"', () => {
    const result = redactContent('Student aged 12 enrolled.', MINOR_ONLY);
    expect(result.redacted).not.toContain('aged 12');
    expect(result.redactedTypes).toContain('MINOR_AGE');
  });

  it('redacts "7 years old"', () => {
    const result = redactContent('Patient is 7 years old.', MINOR_ONLY);
    expect(result.redacted).not.toContain('years old');
    expect(result.redactedTypes).toContain('MINOR_AGE');
  });

  it('redacts upper-bound minor age (age 17)', () => {
    const result = redactContent('Applicant age 17', MINOR_ONLY);
    expect(result.redacted).not.toContain('age 17');
    expect(result.redactedTypes).toContain('MINOR_AGE');
  });

  it('does NOT redact adult age references (age 18+)', () => {
    const result = redactContent('She is age 18 and eligible.', MINOR_ONLY);
    // The pattern matches 0-17 only — 18 should NOT be caught
    expect(result.redacted).toContain('age 18');
    expect(result.redactedTypes).not.toContain('MINOR_AGE');
  });
});

// ===========================================================================
// 13. Minor data — Grade/school references
// ===========================================================================

describe('redactContent — minor data: school grade references', () => {
  it('redacts "grade 5"', () => {
    const result = redactContent('Enrolled in grade 5 this year.', MINOR_ONLY);
    expect(result.redacted).not.toContain('grade 5');
    expect(result.redactedTypes).toContain('SCHOOL_GRADE');
  });

  it('redacts "class K" (kindergarten)', () => {
    const result = redactContent('Assigned to class K.', MINOR_ONLY);
    expect(result.redacted).not.toContain('class K');
    expect(result.redactedTypes).toContain('SCHOOL_GRADE');
  });

  it('redacts "grade 12"', () => {
    const result = redactContent('Senior in grade 12.', MINOR_ONLY);
    expect(result.redacted).not.toContain('grade 12');
    expect(result.redactedTypes).toContain('SCHOOL_GRADE');
  });

  it('redacts "grade kindergarten"', () => {
    const result = redactContent('Starts grade kindergarten in fall.', MINOR_ONLY);
    expect(result.redacted).not.toContain('grade kindergarten');
    expect(result.redactedTypes).toContain('SCHOOL_GRADE');
  });
});

// ===========================================================================
// 14. Minor data — Student ID
// ===========================================================================

describe('redactContent — minor data: student ID', () => {
  it('redacts "student id" references', () => {
    const result = redactContent('student id: STU-20240001', MINOR_ONLY);
    expect(result.redacted).not.toContain('STU-20240001');
    expect(result.redactedTypes).toContain('STUDENT_ID');
  });

  it('redacts "student number" references', () => {
    const result = redactContent('Student number 44892AB', MINOR_ONLY);
    expect(result.redacted).not.toContain('44892AB');
    expect(result.redactedTypes).toContain('STUDENT_ID');
  });
});

// ===========================================================================
// 15. Category isolation — only configured categories are redacted
// ===========================================================================

describe('redactContent — category isolation', () => {
  it('redacts PII but not PHI when only mask_pii is true', () => {
    const input = 'Email: test@example.com, MRN: ABC-1234';
    const result = redactContent(input, PII_ONLY);
    // Email should be redacted
    expect(result.redacted).not.toContain('test@example.com');
    // MRN should remain (PHI not enabled)
    expect(result.redacted).toContain('MRN: ABC-1234');
  });

  it('redacts PHI but not PII when only mask_phi is true', () => {
    const input = 'SSN: 123-45-6789, Rx# PRSC-5678';
    const result = redactContent(input, PHI_ONLY);
    // SSN should remain (PII not enabled)
    expect(result.redacted).toContain('123-45-6789');
    // Rx should be redacted
    expect(result.redacted).not.toContain('PRSC-5678');
  });

  it('redacts minor data but not PII/PHI when only mask_minor_data is true', () => {
    const input = 'Email jane@test.com, student id: STU-001, MRN: MR999';
    const result = redactContent(input, MINOR_ONLY);
    // Email should remain
    expect(result.redacted).toContain('jane@test.com');
    // MRN should remain
    expect(result.redacted).toContain('MRN: MR999');
    // Student ID should be redacted
    expect(result.redacted).not.toContain('STU-001');
  });
});

// ===========================================================================
// 16. Mixed content — multiple PII types in one string
// ===========================================================================

describe('redactContent — mixed content with multiple PII types', () => {
  it('redacts SSN, email, and phone in the same message', () => {
    const input =
      'My SSN is 111-22-3333, email is john@test.com, phone is 555-867-5309.';
    const result = redactContent(input, PII_ONLY);
    expect(result.redacted).not.toContain('111-22-3333');
    expect(result.redacted).not.toContain('john@test.com');
    expect(result.redacted).not.toContain('555-867-5309');
    expect(result.redactionCount).toBeGreaterThanOrEqual(3);
    expect(result.redactedTypes).toContain('SSN');
    expect(result.redactedTypes).toContain('EMAIL');
    expect(result.redactedTypes).toContain('PHONE');
  });

  it('redacts PII + PHI + minor data when all categories are enabled', () => {
    const input = [
      'Contact alice@corp.com or 555-111-2222.',
      'MRN: PAT-9999, Rx# RX-0001.',
      'Student id: STU-ABC, age 10.',
    ].join(' ');
    const result = redactContent(input, ALL_ENABLED);
    expect(result.redacted).not.toContain('alice@corp.com');
    expect(result.redacted).not.toContain('555-111-2222');
    expect(result.redacted).not.toContain('PAT-9999');
    expect(result.redacted).not.toContain('RX-0001');
    expect(result.redacted).not.toContain('STU-ABC');
    expect(result.redacted).not.toContain('age 10');
    expect(result.redactedTypes).toContain('EMAIL');
    expect(result.redactedTypes).toContain('PHONE');
    expect(result.redactedTypes).toContain('MRN');
    expect(result.redactedTypes).toContain('RX');
    expect(result.redactedTypes).toContain('STUDENT_ID');
    expect(result.redactedTypes).toContain('MINOR_AGE');
  });
});

// ===========================================================================
// 17. Return structure correctness
// ===========================================================================

describe('redactContent — return structure', () => {
  it('returns redactedTypes as an array (not a Set)', () => {
    const result = redactContent('test@a.com', PII_ONLY);
    expect(Array.isArray(result.redactedTypes)).toBe(true);
  });

  it('returns unique type labels even with multiple matches of the same type', () => {
    const input = 'a@b.com and c@d.com and e@f.com';
    const result = redactContent(input, PII_ONLY);
    const emailOccurrences = result.redactedTypes.filter((t) => t === 'EMAIL');
    // Should appear exactly once in the types array even though 3 matches
    expect(emailOccurrences).toHaveLength(1);
    expect(result.redactionCount).toBeGreaterThanOrEqual(3);
  });

  it('redactionCount reflects total number of individual matches', () => {
    const input = 'SSN 111-22-3333 and SSN 444-55-6666';
    const result = redactContent(input, PII_ONLY);
    // At minimum 2 SSN matches (may also match phone patterns)
    expect(result.redactionCount).toBeGreaterThanOrEqual(2);
  });
});

// ===========================================================================
// 18. Boundary / non-match cases
// ===========================================================================

describe('redactContent — boundary and non-match cases', () => {
  it('does not redact partial SSN-like patterns (fewer than 9 digits)', () => {
    const input = 'Code: 12-34-567';
    const result = redactContent(input, PII_ONLY);
    // 12-34-567 is only 8 digits with dashes in wrong grouping — should not match SSN
    expect(result.redacted).toContain('12-34-567');
  });

  it('does not redact plain words that happen to contain @ symbol incorrectly', () => {
    const input = 'This is @not an email and neither is user@';
    const result = redactContent(input, PII_ONLY);
    // These are not valid email patterns
    expect(result.redacted).toContain('@not');
  });

  it('does not redact random 3-digit numbers as SSN components', () => {
    const input = 'There are 100 items in the warehouse.';
    const result = redactContent(input, PII_ONLY);
    expect(result.redacted).toBe(input);
  });

  it('preserves surrounding text when redacting', () => {
    const input = 'Hello, my email is secret@test.com and thanks.';
    const result = redactContent(input, PII_ONLY);
    expect(result.redacted).toMatch(/^Hello, my email is .+ and thanks\.$/);
  });

  it('handles multiline content', () => {
    const input = 'Line 1: no PII\nLine 2: email bob@test.com\nLine 3: all clear';
    const result = redactContent(input, PII_ONLY);
    expect(result.redacted).toContain('Line 1: no PII');
    expect(result.redacted).not.toContain('bob@test.com');
    expect(result.redacted).toContain('Line 3: all clear');
  });
});

// ===========================================================================
// 19. PHI — ICD code edge cases
// ===========================================================================

describe('redactContent — ICD code edge cases', () => {
  it('does NOT redact lowercase letter-digit combos that resemble ICD codes', () => {
    // ICD pattern uses uppercase [A-Z] — lowercase should not match
    const input = 'variable e11 is used in the formula.';
    const result = redactContent(input, PHI_ONLY);
    expect(result.redacted).toContain('e11');
  });

  it('redacts ICD codes with multi-digit decimal like Z87.891', () => {
    const result = redactContent('History code Z87.891', PHI_ONLY);
    expect(result.redacted).not.toContain('Z87.891');
    expect(result.redactedTypes).toContain('ICD_CODE');
  });
});

// ===========================================================================
// 20. Stress / realistic scenario
// ===========================================================================

describe('redactContent — realistic clinical note scenario', () => {
  it('redacts a multi-category clinical note comprehensively', () => {
    const clinicalNote = [
      'Patient: Jane Doe, patient id PAT-2024-0042.',
      'DOB: 03/15/2010. Age 14, grade 9.',
      'Contact: parent@family.org, phone (207) 555-1234.',
      'Insurance id: BCBS-445566.',
      'Diagnosis: E11.65 (Type 2 DM with hyperglycemia).',
      'Prescription: RX-20240215-A.',
      'Student id: STU-JD-2024.',
    ].join('\n');

    const result = redactContent(clinicalNote, ALL_ENABLED);

    // PII checks
    expect(result.redacted).not.toContain('parent@family.org');
    expect(result.redacted).not.toContain('(207) 555-1234');
    expect(result.redacted).not.toContain('03/15/2010');

    // PHI checks
    expect(result.redacted).not.toContain('PAT-2024-0042');
    expect(result.redacted).not.toContain('BCBS-445566');
    expect(result.redacted).not.toContain('E11.65');
    expect(result.redacted).not.toContain('RX-20240215-A');

    // Minor data checks
    expect(result.redacted).not.toContain('STU-JD-2024');

    // Redaction count should be substantial
    expect(result.redactionCount).toBeGreaterThanOrEqual(7);

    // Multiple type categories should be reported
    expect(result.redactedTypes.length).toBeGreaterThanOrEqual(5);
  });
});
