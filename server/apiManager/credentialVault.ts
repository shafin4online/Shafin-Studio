import { ApiCredential, MaskedApiCredential, TaskType, ApiProvider } from './types';
import { loadPreconfiguredKeys } from './preconfiguredKeys';

const ALL_TASKS: TaskType[] = [
  'passport_photo',
  'background_remove',
  'background_replace',
  'face_retouch',
  'face_enhancement',
  'image_upscale',
  'image_restoration',
  'dual_photo',
  'image_edit',
  'color_correction',
  'suit_dress_change'
];

class CredentialVault {
  private credentials: Map<string, ApiCredential> = new Map();
  private counter: number = 1;

  constructor() {
    this.initializeFromEnv();
  }

  /**
   * Parse keys safely from environment variables (No hardcoded secrets in Git):
   * 1. Preconfigured keys loaded from GEMINI_ACCOUNTS_JSON or GEMINI_API_KEYS
   * 2. GEMINI_API_KEY (single default)
   * 3. GEMINI_KEY_1, GEMINI_KEY_2, etc. (up to 30)
   */
  private initializeFromEnv(): void {
    const existingKeys = new Set<string>();

    // 1. Add keys from safe env loader
    const loadedKeys = loadPreconfiguredKeys();
    loadedKeys.forEach(item => {
      const key = item.apiKey.trim();
      if (key && !existingKeys.has(key)) {
        existingKeys.add(key);
        this.addCredential({
          provider: 'google',
          name: item.name,
          apiKey: key,
          models: ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'],
          supportedTasks: ALL_TASKS,
          priority: 1
        });
      }
    });

    // 2. Primary env key
    const primary = process.env.GEMINI_API_KEY?.trim();
    if (primary && !existingKeys.has(primary)) {
      existingKeys.add(primary);
      this.addCredential({
        provider: 'google',
        name: 'Default Env Key',
        apiKey: primary,
        models: ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'],
        supportedTasks: ALL_TASKS,
        priority: 1
      });
    }

    // 3. Comma-separated list from env
    const multiple = process.env.GEMINI_API_KEYS;
    if (multiple) {
      multiple.split(',').forEach((k, idx) => {
        const clean = k.trim();
        if (clean && !existingKeys.has(clean)) {
          existingKeys.add(clean);
          this.addCredential({
            provider: 'google',
            name: `Env Pool Key ${idx + 1}`,
            apiKey: clean,
            models: ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'],
            supportedTasks: ALL_TASKS,
            priority: 2
          });
        }
      });
    }

    // 4. Numbered keys GEMINI_KEY_1 to 30
    for (let i = 1; i <= 30; i++) {
      const k = process.env[`GEMINI_KEY_${i}`]?.trim() || process.env[`GEMINI_API_KEY_${i}`]?.trim();
      if (k && !existingKeys.has(k)) {
        existingKeys.add(k);
        this.addCredential({
          provider: 'google',
          name: `Env Key ${i}`,
          apiKey: k,
          models: ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'],
          supportedTasks: ALL_TASKS,
          priority: 2
        });
      }
    }

    console.log(`[CredentialVault] Initialized with ${this.credentials.size} API key credentials in pool.`);
  }

  public addCredential(data: {
    provider: ApiProvider;
    name: string;
    apiKey: string;
    models?: string[];
    supportedTasks?: TaskType[];
    priority?: number;
  }): ApiCredential {
    const id = `API-${String(this.counter++).padStart(2, '0')}`;
    const cred: ApiCredential = {
      id,
      provider: data.provider,
      name: data.name,
      apiKey: data.apiKey,
      models: data.models || ['gemini-3.1-flash-lite-image'],
      supportedTasks: data.supportedTasks || ALL_TASKS,
      priority: data.priority || 5,
      status: 'ACTIVE',
      cooldownUntil: null,
      stats: {
        requests: 0,
        success: 0,
        failure: 0,
        rateLimits: 0,
        lastUsedAt: null,
        lastError: null
      }
    };
    this.credentials.set(id, cred);
    return cred;
  }

  public getCredentialById(id: string): ApiCredential | undefined {
    return this.credentials.get(id);
  }

  public getAllCredentials(): ApiCredential[] {
    return Array.from(this.credentials.values());
  }

  public getMaskedCredentials(): MaskedApiCredential[] {
    const now = Date.now();
    return Array.from(this.credentials.values()).map(c => {
      const key = c.apiKey;
      const masked = key.length > 8
        ? `${key.slice(0, 4)}...${key.slice(-4)}`
        : '••••••••';

      const cooldownRemainingSeconds = c.cooldownUntil && c.cooldownUntil > now
        ? Math.ceil((c.cooldownUntil - now) / 1000)
        : 0;

      return {
        id: c.id,
        provider: c.provider,
        name: c.name,
        maskedKey: masked,
        supportedTasks: c.supportedTasks,
        priority: c.priority,
        status: c.status,
        cooldownRemainingSeconds,
        stats: { ...c.stats }
      };
    });
  }

  public setStatus(id: string, status: ApiCredential['status'], cooldownUntil: number | null = null, error: string | null = null): void {
    const c = this.credentials.get(id);
    if (c) {
      c.status = status;
      c.cooldownUntil = cooldownUntil;
      if (error) {
        c.stats.lastError = error;
      }
    }
  }

  public recordUsage(id: string, success: boolean, isRateLimit: boolean = false, error: string | null = null): void {
    const c = this.credentials.get(id);
    if (!c) return;

    c.stats.requests++;
    c.stats.lastUsedAt = Date.now();

    if (success) {
      c.stats.success++;
      c.stats.lastError = null;
    } else {
      c.stats.failure++;
      if (isRateLimit) {
        c.stats.rateLimits++;
      }
      if (error) {
        c.stats.lastError = error;
      }
    }
  }

  public resetAllCooldowns(): void {
    for (const c of this.credentials.values()) {
      if (c.status === 'COOLDOWN') {
        c.status = 'ACTIVE';
        c.cooldownUntil = null;
      }
    }
  }

  public toggleEnable(id: string, enable: boolean): void {
    const c = this.credentials.get(id);
    if (c) {
      c.status = enable ? 'ACTIVE' : 'DISABLED';
      c.cooldownUntil = null;
    }
  }

  public deleteCredential(id: string): boolean {
    return this.credentials.delete(id);
  }
}

export const vault = new CredentialVault();
