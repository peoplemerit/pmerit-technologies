/**
 * Gumroad Integration (D8)
 *
 * Handles Gumroad license verification for MANUSCRIPT_BYOK tier.
 */

// =============================================================================
// GUMROAD TYPES
// =============================================================================

interface GumroadLicenseResponse {
  success: boolean;
  uses: number;
  purchase: {
    id: string;
    product_id: string;
    email: string;
    created_at: string;
    refunded: boolean;
    chargebacked: boolean;
  };
  message?: string;
}

// =============================================================================
// LICENSE VERIFICATION
// =============================================================================

/**
 * Verify a Gumroad license key
 */
export async function verifyGumroadLicense(
  licenseKey: string,
  productId: string
): Promise<{
  valid: boolean;
  email?: string;
  purchaseId?: string;
  error?: string;
}> {
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'product_id': productId,
        'license_key': licenseKey,
        'increment_uses_count': 'false' // Don't increment on verification
      })
    });

    const data = await response.json() as GumroadLicenseResponse;

    if (!data.success) {
      return {
        valid: false,
        error: 'Invalid license key'
      };
    }

    // Check for refund/chargeback
    if (data.purchase.refunded || data.purchase.chargebacked) {
      return {
        valid: false,
        error: 'License has been refunded or charged back'
      };
    }

    return {
      valid: true,
      email: data.purchase.email,
      purchaseId: data.purchase.id
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Verification failed'
    };
  }
}

/**
 * Activate a Gumroad license (increment use count)
 */
export async function activateGumroadLicense(
  licenseKey: string,
  productId: string,
  db: D1Database,
  userId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  // First verify the license
  const verification = await verifyGumroadLicense(licenseKey, productId);

  if (!verification.valid) {
    return {
      success: false,
      error: verification.error
    };
  }

  // Check if license is already used by another user
  const existingUse = await db.prepare(`
    SELECT user_id FROM subscriptions WHERE gumroad_sale_id = ?
  `).bind(verification.purchaseId).first<{ user_id: string }>();

  if (existingUse && existingUse.user_id !== userId) {
    return {
      success: false,
      error: 'This license is already in use by another account'
    };
  }

  // Activate the license (increment use count)
  const activateResponse = await fetch('https://api.gumroad.com/v2/licenses/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'product_id': productId,
      'license_key': licenseKey,
      'increment_uses_count': 'true'
    })
  });

  const activateData = await activateResponse.json() as GumroadLicenseResponse;

  if (!activateData.success) {
    return {
      success: false,
      error: 'Failed to activate license'
    };
  }

  // Create or update subscription
  const existingSub = await db.prepare(`
    SELECT id FROM subscriptions WHERE user_id = ?
  `).bind(userId).first();

  // Manuscript is lifetime access
  const periodStart = new Date().toISOString();
  const periodEnd = new Date('2099-12-31').toISOString();

  if (existingSub) {
    await db.prepare(`
      UPDATE subscriptions
      SET tier = 'MANUSCRIPT_BYOK', status = 'active', gumroad_sale_id = ?, period_start = ?, period_end = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).bind(verification.purchaseId, periodStart, periodEnd, userId).run();
  } else {
    const subId = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO subscriptions (id, user_id, tier, status, gumroad_sale_id, period_start, period_end)
      VALUES (?, ?, 'MANUSCRIPT_BYOK', 'active', ?, ?, ?)
    `).bind(subId, userId, verification.purchaseId, periodStart, periodEnd).run();
  }

  return { success: true };
}

// =============================================================================
// KDP CODE VERIFICATION
// =============================================================================

/**
 * Verify a KDP book purchase code
 * These are manually generated codes included in the physical/digital book
 */
export async function verifyKdpCode(
  code: string,
  secret: string,
  db: D1Database,
  userId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  // KDP codes are formatted as: AIXORD-XXXX-XXXX-XXXX
  // They're generated using HMAC of a sequential number with the secret
  const codeMatch = code.match(/^AIXORD-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/);

  if (!codeMatch) {
    return {
      success: false,
      error: 'Invalid code format'
    };
  }

  // Check if code has already been used
  const existingUse = await db.prepare(`
    SELECT user_id FROM subscriptions WHERE kdp_code = ?
  `).bind(code).first<{ user_id: string }>();

  if (existingUse) {
    if (existingUse.user_id === userId) {
      return { success: true }; // Already activated by this user
    }
    return {
      success: false,
      error: 'This code has already been redeemed'
    };
  }

  // Verify code is valid (check against pre-generated list or HMAC verification)
  const validCode = await db.prepare(`
    SELECT code FROM kdp_codes WHERE code = ? AND used = 0
  `).bind(code).first();

  if (!validCode) {
    return {
      success: false,
      error: 'Invalid or expired code'
    };
  }

  // Mark code as used
  await db.prepare(`
    UPDATE kdp_codes SET used = 1, used_by = ?, used_at = datetime('now') WHERE code = ?
  `).bind(userId, code).run();

  // Create or update subscription
  const existingSub = await db.prepare(`
    SELECT id FROM subscriptions WHERE user_id = ?
  `).bind(userId).first();

  const periodStart = new Date().toISOString();
  const periodEnd = new Date('2099-12-31').toISOString();

  if (existingSub) {
    await db.prepare(`
      UPDATE subscriptions
      SET tier = 'MANUSCRIPT_BYOK', status = 'active', kdp_code = ?, period_start = ?, period_end = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).bind(code, periodStart, periodEnd, userId).run();
  } else {
    const subId = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO subscriptions (id, user_id, tier, status, kdp_code, period_start, period_end)
      VALUES (?, ?, 'MANUSCRIPT_BYOK', 'active', ?, ?, ?)
    `).bind(subId, userId, code, periodStart, periodEnd).run();
  }

  return { success: true };
}
