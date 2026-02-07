/**
 * Content Redaction Utility (SPG-01 — L-SPG3)
 *
 * Masks sensitive data patterns in user content before sending to AI providers.
 * Applied when data classification is CONFIDENTIAL.
 *
 * Per AIXORD v4.4.1:
 * - PII: SSN, email addresses, phone numbers, postal addresses
 * - PHI: Medical record numbers, health conditions, prescription references
 * - Minor Data: Age references for minors, school/grade references
 */

import type { RedactionConfig } from '../types';

const REDACTION_MARKER = '[REDACTED]';

/**
 * PII patterns — Social Security Numbers, emails, phone numbers, addresses
 */
const PII_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // SSN: xxx-xx-xxxx or xxxxxxxxx
  { pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, label: 'SSN' },
  // Email addresses
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: 'EMAIL' },
  // US phone numbers (various formats)
  { pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, label: 'PHONE' },
  // Credit card numbers (basic pattern — 13-19 digits with optional separators)
  { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}\b/g, label: 'CC' },
  // Date of birth patterns (MM/DD/YYYY, YYYY-MM-DD)
  { pattern: /\b(?:DOB|date of birth|born on|birthday)[:\s]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi, label: 'DOB' },
];

/**
 * PHI patterns — Medical record numbers, health conditions
 */
const PHI_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // Medical record numbers (MRN)
  { pattern: /\b(?:MRN|medical record|patient\s*(?:id|#|number))[:\s#]*[A-Z0-9-]{4,20}\b/gi, label: 'MRN' },
  // Health insurance ID
  { pattern: /\b(?:insurance\s*(?:id|#|number)|policy\s*(?:id|#|number))[:\s#]*[A-Z0-9-]{4,20}\b/gi, label: 'INSURANCE_ID' },
  // Prescription references
  { pattern: /\b(?:prescription|Rx)[:\s#]*[A-Z0-9-]{4,20}\b/gi, label: 'RX' },
  // ICD codes (diagnosis codes)
  { pattern: /\b[A-Z]\d{2}(?:\.\d{1,4})?\b/g, label: 'ICD_CODE' },
];

/**
 * Minor data patterns — Age references, school references
 */
const MINOR_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // Age references for potential minors (age 0-17)
  { pattern: /\b(?:age|aged|years?\s*old)[:\s]*(?:[0-9]|1[0-7])\b/gi, label: 'MINOR_AGE' },
  // Grade/school references
  { pattern: /\b(?:grade|class)\s*(?:[1-9]|1[0-2]|K|kindergarten)\b/gi, label: 'SCHOOL_GRADE' },
  // Student ID
  { pattern: /\b(?:student\s*(?:id|#|number))[:\s#]*[A-Z0-9-]{4,20}\b/gi, label: 'STUDENT_ID' },
];

/**
 * Apply content redaction based on redaction config.
 *
 * @param content - The raw user content to redact
 * @param config - Which categories to mask
 * @returns Object with redacted content and count of redactions made
 */
export function redactContent(
  content: string,
  config: RedactionConfig
): { redacted: string; redactionCount: number; redactedTypes: string[] } {
  if (!config.enabled) {
    return { redacted: content, redactionCount: 0, redactedTypes: [] };
  }

  let result = content;
  let redactionCount = 0;
  const redactedTypes: Set<string> = new Set();

  // Apply PII redaction
  if (config.mask_pii) {
    for (const { pattern, label } of PII_PATTERNS) {
      const matches = result.match(pattern);
      if (matches) {
        redactionCount += matches.length;
        redactedTypes.add(label);
      }
      result = result.replace(pattern, `${REDACTION_MARKER}`);
    }
  }

  // Apply PHI redaction
  if (config.mask_phi) {
    for (const { pattern, label } of PHI_PATTERNS) {
      const matches = result.match(pattern);
      if (matches) {
        redactionCount += matches.length;
        redactedTypes.add(label);
      }
      result = result.replace(pattern, `${REDACTION_MARKER}`);
    }
  }

  // Apply minor data redaction
  if (config.mask_minor_data) {
    for (const { pattern, label } of MINOR_PATTERNS) {
      const matches = result.match(pattern);
      if (matches) {
        redactionCount += matches.length;
        redactedTypes.add(label);
      }
      result = result.replace(pattern, `${REDACTION_MARKER}`);
    }
  }

  return {
    redacted: result,
    redactionCount,
    redactedTypes: Array.from(redactedTypes),
  };
}
