import { vault } from './credentialVault.ts';
import type { ApiCredential } from './types.ts';

export class CooldownManager {
  /**
   * Evaluates all credentials and returns any key that has completed its cooldown period back to ACTIVE.
   */
  public refreshCooldowns(): void {
    const now = Date.now();
    const all = vault.getAllCredentials();

    for (const cred of all) {
      if (cred.status === 'COOLDOWN' && cred.cooldownUntil && cred.cooldownUntil <= now) {
        console.log(`[CooldownManager] Cooldown expired for ${cred.id} (${cred.name}). Restoring to ACTIVE.`);
        vault.setStatus(cred.id, 'ACTIVE', null);
      }
    }
  }

  /**
   * Handle an error encountered while making an API call
   */
  public handleApiError(cred: ApiCredential, error: unknown): { isRetryable: boolean; isRateLimit: boolean } {
    const errString = String(error);
    const now = Date.now();

    // Check for Authentication / Credential Errors (401, 403, API_KEY_INVALID, PERMISSION_DENIED)
    const isFatalAuth = 
      errString.includes('401') || 
      errString.includes('403') || 
      errString.includes('API_KEY_INVALID') ||
      errString.includes('PERMISSION_DENIED') ||
      errString.includes('denied access');

    // Check for Zero Quota / Billing Required (limit: 0 on free tier)
    const isZeroQuota = 
      errString.includes('limit: 0') || 
      (errString.includes('free_tier') && errString.includes('limit: 0'));

    // Check for standard Rate Limits (HTTP 429 / RESOURCE_EXHAUSTED / Quota exceeded with non-zero limit)
    const isRateLimit = 
      !isZeroQuota && (
        errString.includes('429') || 
        errString.includes('RESOURCE_EXHAUSTED') || 
        errString.includes('Quota exceeded') ||
        errString.includes('rate limit')
      );

    // Check for Service Overload / Server Error (500, 502, 503, 504, timeout)
    const isServerTransient = 
      errString.includes('503') || 
      errString.includes('500') || 
      errString.includes('502') || 
      errString.includes('504') || 
      errString.includes('ETIMEDOUT') ||
      errString.includes('ECONNRESET') ||
      errString.includes('fetch failed');

    if (isZeroQuota) {
      // Free tier has 0 quota for this image model (requires Pay-as-you-go billing)
      console.warn(`[CooldownManager] ${cred.id} has 0 free quota for image model (limit: 0). Marking FAILED.`);
      vault.setStatus(cred.id, 'FAILED', null, 'ফ্রি কোটা ০ (বিলিং/পেইড কী প্রয়োজন)');
      vault.recordUsage(cred.id, false, true, 'Zero Quota (limit: 0 - Needs Billing)');
      return { isRetryable: true, isRateLimit: false };
    }

    if (isFatalAuth) {
      // Disable key permanently until fixed (e.g. 403 project blocked, invalid key)
      console.error(`[CooldownManager] ${cred.id} has invalid credentials or permission denied (401/403). Setting FAILED.`);
      vault.setStatus(cred.id, 'FAILED', null, 'পারমিশন বা অথেন্টিকেশন ত্রুটি (401/403)');
      vault.recordUsage(cred.id, false, false, 'Auth Error (401/403)');
      return { isRetryable: true, isRateLimit: false };
    }

    if (isRateLimit) {
      // Standard rate limit: put in cooldown for 60 seconds
      const cooldownMs = 60 * 1000;
      console.warn(`[CooldownManager] ${cred.id} hit rate limit (429). Setting COOLDOWN for 60s.`);
      vault.setStatus(cred.id, 'COOLDOWN', now + cooldownMs, '429 কোটা/রেট লিমিট এক্সিডেড');
      vault.recordUsage(cred.id, false, true, '429 Rate Limit');
      return { isRetryable: true, isRateLimit: true };
    }

    if (isServerTransient) {
      // Put in short cooldown for 30 seconds
      const cooldownMs = 30 * 1000;
      console.warn(`[CooldownManager] ${cred.id} experienced transient error (${errString.slice(0, 80)}). Setting COOLDOWN for 30s.`);
      vault.setStatus(cred.id, 'COOLDOWN', now + cooldownMs, 'Transient Server Error');
      vault.recordUsage(cred.id, false, false, 'Transient Error');
      return { isRetryable: true, isRateLimit: false };
    }

    // Unrecognized error - log but mark usage
    vault.recordUsage(cred.id, false, false, errString.slice(0, 100));
    return { isRetryable: true, isRateLimit: false };
  }

  public handleApiSuccess(cred: ApiCredential): void {
    vault.recordUsage(cred.id, true);
  }
}

export const cooldownManager = new CooldownManager();
