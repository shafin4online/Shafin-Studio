// server/apiApp.ts
import express from "express";

// server/apiManager/preconfiguredKeys.ts
function parseAccountsJson(rawInput) {
  const result = [];
  if (!rawInput) return result;
  let str = rawInput.trim();
  if (!str) return result;
  if (str.startsWith('"') && str.endsWith('"') || str.startsWith("'") && str.endsWith("'")) {
    str = str.slice(1, -1).trim();
  }
  let parsed = null;
  try {
    parsed = JSON.parse(str);
  } catch {
    try {
      const relaxed = str.replace(/'/g, '"');
      parsed = JSON.parse(relaxed);
    } catch {
    }
  }
  if (parsed !== null && parsed !== void 0) {
    if (Array.isArray(parsed)) {
      parsed.forEach((item, idx) => {
        if (typeof item === "string" && item.trim()) {
          result.push({
            name: `Gemini Account ${idx + 1}`,
            apiKey: item.trim()
          });
        } else if (item && typeof item === "object") {
          const rec = item;
          const key = typeof rec.apiKey === "string" ? rec.apiKey : typeof rec.key === "string" ? rec.key : "";
          if (key && key.trim()) {
            result.push({
              name: typeof rec.name === "string" && rec.name.trim() ? rec.name.trim() : `Gemini Account ${idx + 1}`,
              apiKey: key.trim()
            });
          }
        }
      });
      if (result.length > 0) return result;
    } else if (typeof parsed === "object") {
      const rec = parsed;
      const directKey = typeof rec.apiKey === "string" ? rec.apiKey : typeof rec.key === "string" ? rec.key : "";
      if (directKey && directKey.trim()) {
        result.push({
          name: typeof rec.name === "string" && rec.name.trim() ? rec.name.trim() : "Gemini Account",
          apiKey: directKey.trim()
        });
        return result;
      }
      for (const [name, val] of Object.entries(rec)) {
        if (typeof val === "string" && val.trim()) {
          result.push({
            name: name.trim() || "Gemini Account",
            apiKey: val.trim()
          });
        }
      }
      if (result.length > 0) return result;
    }
  }
  const keyMatches = str.match(/AIza[0-9A-Za-z_-]{35,}/g);
  if (keyMatches && keyMatches.length > 0) {
    const uniqueKeys = Array.from(new Set(keyMatches));
    uniqueKeys.forEach((k, idx) => {
      result.push({
        name: uniqueKeys.length === 1 ? "Gemini Account" : `Gemini Account ${idx + 1}`,
        apiKey: k.trim()
      });
    });
    return result;
  }
  const lines = str.split(/[\r\n,]+/);
  lines.forEach((line, idx) => {
    const l = line.trim();
    if (!l) return;
    if (l.includes(":")) {
      const [name, key] = l.split(":");
      if (key && key.trim()) {
        result.push({
          name: name.trim() || `Account ${idx + 1}`,
          apiKey: key.trim()
        });
      }
    } else if (l.length >= 20) {
      result.push({
        name: `Account ${idx + 1}`,
        apiKey: l
      });
    }
  });
  return result;
}
function loadPreconfiguredKeys() {
  const result = [];
  const existingKeys = /* @__PURE__ */ new Set();
  const addKey = (key, name) => {
    const trimmedKey = key.trim();
    if (!trimmedKey || existingKeys.has(trimmedKey)) return;
    existingKeys.add(trimmedKey);
    result.push({
      name: name?.trim() || `Gemini Account ${result.length + 1}`,
      apiKey: trimmedKey
    });
  };
  const accountsJson = process.env.GEMINI_ACCOUNTS_JSON;
  if (accountsJson) {
    const parsedAccounts = parseAccountsJson(accountsJson);
    parsedAccounts.forEach((acc) => addKey(acc.apiKey, acc.name));
  }
  const apiKeysEnv = process.env.GEMINI_API_KEYS?.trim();
  if (apiKeysEnv) {
    const parts = apiKeysEnv.split(",");
    parts.forEach((part, idx) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      if (trimmed.includes(":")) {
        const [name, key] = trimmed.split(":");
        if (key && key.trim()) {
          addKey(key, name);
        }
      } else {
        addKey(trimmed, `Account ${idx + 1}`);
      }
    });
  }
  return result;
}

// server/apiManager/credentialVault.ts
var ALL_TASKS = [
  "passport_photo",
  "background_remove",
  "background_replace",
  "face_retouch",
  "face_enhancement",
  "image_upscale",
  "image_restoration",
  "dual_photo",
  "image_edit",
  "color_correction",
  "suit_dress_change"
];
var CredentialVault = class {
  credentials = /* @__PURE__ */ new Map();
  counter = 1;
  constructor() {
    this.initializeFromEnv();
  }
  /**
   * Parse keys safely from environment variables (No hardcoded secrets in Git):
   * 1. Preconfigured keys loaded from GEMINI_ACCOUNTS_JSON or GEMINI_API_KEYS
   * 2. GEMINI_API_KEY (single default)
   * 3. GEMINI_KEY_1, GEMINI_KEY_2, etc. (up to 30)
   */
  initializeFromEnv() {
    const existingKeys = /* @__PURE__ */ new Set();
    const loadedKeys = loadPreconfiguredKeys();
    loadedKeys.forEach((item) => {
      const key = item.apiKey.trim();
      if (key && !existingKeys.has(key)) {
        existingKeys.add(key);
        this.addCredential({
          provider: "google",
          name: item.name,
          apiKey: key,
          models: ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"],
          supportedTasks: ALL_TASKS,
          priority: 1
        });
      }
    });
    const primary = process.env.GEMINI_API_KEY?.trim();
    if (primary && !existingKeys.has(primary)) {
      existingKeys.add(primary);
      this.addCredential({
        provider: "google",
        name: "Default Env Key",
        apiKey: primary,
        models: ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"],
        supportedTasks: ALL_TASKS,
        priority: 1
      });
    }
    const multiple = process.env.GEMINI_API_KEYS;
    if (multiple) {
      multiple.split(",").forEach((k, idx) => {
        const clean = k.trim();
        if (clean && !existingKeys.has(clean)) {
          existingKeys.add(clean);
          this.addCredential({
            provider: "google",
            name: `Env Pool Key ${idx + 1}`,
            apiKey: clean,
            models: ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"],
            supportedTasks: ALL_TASKS,
            priority: 2
          });
        }
      });
    }
    for (let i = 1; i <= 30; i++) {
      const k = process.env[`GEMINI_KEY_${i}`]?.trim() || process.env[`GEMINI_API_KEY_${i}`]?.trim();
      if (k && !existingKeys.has(k)) {
        existingKeys.add(k);
        this.addCredential({
          provider: "google",
          name: `Env Key ${i}`,
          apiKey: k,
          models: ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"],
          supportedTasks: ALL_TASKS,
          priority: 2
        });
      }
    }
    console.log(`[CredentialVault] Initialized with ${this.credentials.size} API key credentials in pool.`);
  }
  addCredential(data) {
    const id = `API-${String(this.counter++).padStart(2, "0")}`;
    const cred = {
      id,
      provider: data.provider,
      name: data.name,
      apiKey: data.apiKey,
      models: data.models || ["gemini-3.1-flash-lite-image"],
      supportedTasks: data.supportedTasks || ALL_TASKS,
      priority: data.priority || 5,
      status: "ACTIVE",
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
  getCredentialById(id) {
    return this.credentials.get(id);
  }
  getAllCredentials() {
    return Array.from(this.credentials.values());
  }
  getMaskedCredentials() {
    const now = Date.now();
    return Array.from(this.credentials.values()).map((c) => {
      const key = c.apiKey;
      const masked = key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
      const cooldownRemainingSeconds = c.cooldownUntil && c.cooldownUntil > now ? Math.ceil((c.cooldownUntil - now) / 1e3) : 0;
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
  setStatus(id, status, cooldownUntil = null, error = null) {
    const c = this.credentials.get(id);
    if (c) {
      c.status = status;
      c.cooldownUntil = cooldownUntil;
      if (error) {
        c.stats.lastError = error;
      }
    }
  }
  recordUsage(id, success, isRateLimit = false, error = null) {
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
  resetAllCooldowns() {
    for (const c of this.credentials.values()) {
      if (c.status === "COOLDOWN") {
        c.status = "ACTIVE";
        c.cooldownUntil = null;
      }
    }
  }
  toggleEnable(id, enable) {
    const c = this.credentials.get(id);
    if (c) {
      c.status = enable ? "ACTIVE" : "DISABLED";
      c.cooldownUntil = null;
    }
  }
  deleteCredential(id) {
    return this.credentials.delete(id);
  }
};
var vault = new CredentialVault();

// server/apiManager/cooldownManager.ts
var CooldownManager = class {
  /**
   * Evaluates all credentials and returns any key that has completed its cooldown period back to ACTIVE.
   */
  refreshCooldowns() {
    const now = Date.now();
    const all = vault.getAllCredentials();
    for (const cred of all) {
      if (cred.status === "COOLDOWN" && cred.cooldownUntil && cred.cooldownUntil <= now) {
        console.log(`[CooldownManager] Cooldown expired for ${cred.id} (${cred.name}). Restoring to ACTIVE.`);
        vault.setStatus(cred.id, "ACTIVE", null);
      }
    }
  }
  /**
   * Handle an error encountered while making an API call
   */
  handleApiError(cred, error) {
    const errString = String(error);
    const now = Date.now();
    const isFatalAuth = errString.includes("401") || errString.includes("403") || errString.includes("API_KEY_INVALID") || errString.includes("PERMISSION_DENIED") || errString.includes("denied access");
    const isZeroQuota = errString.includes("limit: 0") || errString.includes("free_tier") && errString.includes("limit: 0");
    const isRateLimit = !isZeroQuota && (errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED") || errString.includes("Quota exceeded") || errString.includes("rate limit"));
    const isServerTransient = errString.includes("503") || errString.includes("500") || errString.includes("502") || errString.includes("504") || errString.includes("ETIMEDOUT") || errString.includes("ECONNRESET") || errString.includes("fetch failed");
    if (isZeroQuota) {
      console.warn(`[CooldownManager] ${cred.id} has 0 free quota for image model (limit: 0). Marking FAILED.`);
      vault.setStatus(cred.id, "FAILED", null, "\u09AB\u09CD\u09B0\u09BF \u0995\u09CB\u099F\u09BE \u09E6 (\u09AC\u09BF\u09B2\u09BF\u0982/\u09AA\u09C7\u0987\u09A1 \u0995\u09C0 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8)");
      vault.recordUsage(cred.id, false, true, "Zero Quota (limit: 0 - Needs Billing)");
      return { isRetryable: true, isRateLimit: false };
    }
    if (isFatalAuth) {
      console.error(`[CooldownManager] ${cred.id} has invalid credentials or permission denied (401/403). Setting FAILED.`);
      vault.setStatus(cred.id, "FAILED", null, "\u09AA\u09BE\u09B0\u09AE\u09BF\u09B6\u09A8 \u09AC\u09BE \u0985\u09A5\u09C7\u09A8\u09CD\u099F\u09BF\u0995\u09C7\u09B6\u09A8 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF (401/403)");
      vault.recordUsage(cred.id, false, false, "Auth Error (401/403)");
      return { isRetryable: true, isRateLimit: false };
    }
    if (isRateLimit) {
      const cooldownMs = 60 * 1e3;
      console.warn(`[CooldownManager] ${cred.id} hit rate limit (429). Setting COOLDOWN for 60s.`);
      vault.setStatus(cred.id, "COOLDOWN", now + cooldownMs, "429 \u0995\u09CB\u099F\u09BE/\u09B0\u09C7\u099F \u09B2\u09BF\u09AE\u09BF\u099F \u098F\u0995\u09CD\u09B8\u09BF\u09A1\u09C7\u09A1");
      vault.recordUsage(cred.id, false, true, "429 Rate Limit");
      return { isRetryable: true, isRateLimit: true };
    }
    if (isServerTransient) {
      const cooldownMs = 30 * 1e3;
      console.warn(`[CooldownManager] ${cred.id} experienced transient error (${errString.slice(0, 80)}). Setting COOLDOWN for 30s.`);
      vault.setStatus(cred.id, "COOLDOWN", now + cooldownMs, "Transient Server Error");
      vault.recordUsage(cred.id, false, false, "Transient Error");
      return { isRetryable: true, isRateLimit: false };
    }
    vault.recordUsage(cred.id, false, false, errString.slice(0, 100));
    return { isRetryable: true, isRateLimit: false };
  }
  handleApiSuccess(cred) {
    vault.recordUsage(cred.id, true);
  }
};
var cooldownManager = new CooldownManager();

// server/apiManager/apiSelector.ts
var ApiSelector = class {
  rotationIndex = 0;
  /**
   * Select the best eligible API credential for a specific task.
   * Excludes any key IDs already attempted during the current request.
   */
  selectEligibleApi(task, excludedIds = /* @__PURE__ */ new Set()) {
    cooldownManager.refreshCooldowns();
    const all = vault.getAllCredentials();
    const eligible = all.filter(
      (c) => c.status === "ACTIVE" && c.supportedTasks.includes(task) && !excludedIds.has(c.id)
    );
    if (eligible.length === 0) {
      console.warn(`[ApiSelector] No ACTIVE eligible API keys found for task '${task}'. Total keys: ${all.length}`);
      return null;
    }
    eligible.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      const timeA = a.stats.lastUsedAt || 0;
      const timeB = b.stats.lastUsedAt || 0;
      return timeA - timeB;
    });
    const topPriority = eligible[0].priority;
    const topCandidates = eligible.filter((c) => c.priority === topPriority);
    const selected = topCandidates[this.rotationIndex % topCandidates.length];
    this.rotationIndex = (this.rotationIndex + 1) % 1e4;
    console.log(`[ApiSelector] Selected ${selected.id} (${selected.name}) for task '${task}' [Pool candidates: ${topCandidates.length}]`);
    return selected;
  }
  /**
   * Diagnostic: returns summary of the pool state
   */
  getPoolSummary() {
    cooldownManager.refreshCooldowns();
    const all = vault.getAllCredentials();
    const active = all.filter((c) => c.status === "ACTIVE").length;
    const cooldown = all.filter((c) => c.status === "COOLDOWN").length;
    const failed = all.filter((c) => c.status === "FAILED").length;
    const disabled = all.filter((c) => c.status === "DISABLED").length;
    return {
      total: all.length,
      active,
      cooldown,
      failed,
      disabled
    };
  }
};
var apiSelector = new ApiSelector();

// server/apiManager/taskRouter.ts
function formatUserFriendlyError(errString) {
  if (errString.includes("limit: 0") || errString.includes("free_tier") && errString.includes("Quota exceeded")) {
    return "\u0987\u09AE\u09C7\u099C \u09AE\u09A1\u09C7\u09B2 \u0995\u09CB\u099F\u09BE \u09B8\u09C0\u09AE\u09BE \u09A4\u09CD\u09B0\u09C1\u099F\u09BF (Quota limit: 0): \u0997\u09C1\u0997\u09B2 \u098F\u0986\u0987 \u09B8\u09CD\u099F\u09C1\u09A1\u09BF\u0993\u09A4\u09C7 \u0987\u09AE\u09C7\u099C \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u09B6\u09A8 \u09AE\u09A1\u09C7\u09B2\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AB\u09CD\u09B0\u09BF \u0995\u09CB\u099F\u09BE \u09A8\u09C7\u0987 (limit: 0)\u0964 \u098F\u099F\u09BF \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u0997\u09C1\u0997\u09B2 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u09AA\u09CD\u09B0\u099C\u09C7\u0995\u09CD\u099F\u09C7 \u09AC\u09BF\u09B2\u09BF\u0982 (Pay-as-you-go) \u09B8\u0995\u09CD\u09B0\u09BF\u09DF \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7 \u0985\u09A5\u09AC\u09BE \u09AC\u09BF\u09B2\u09BF\u0982-\u09B8\u0995\u09CD\u09B7\u09AE \u09AA\u09C7\u0987\u09A1 API \u0995\u09C0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964";
  }
  if (errString.includes("PERMISSION_DENIED") || errString.includes("denied access") || errString.includes("403")) {
    return "\u09AA\u09CD\u09B0\u099C\u09C7\u0995\u09CD\u099F \u09AA\u09BE\u09B0\u09AE\u09BF\u09B6\u09A8 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF (403 Permission Denied): \u098F\u0987 \u0997\u09C1\u0997\u09B2 \u09AA\u09CD\u09B0\u099C\u09C7\u0995\u09CD\u099F\u099F\u09BF\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u09B8\u09C7\u09B8 \u0997\u09C1\u0997\u09B2 \u0995\u09B0\u09CD\u09A4\u09C3\u0995 \u09B8\u09CD\u09A5\u0997\u09BF\u09A4 \u09AC\u09BE \u09A8\u09BF\u09B7\u09BF\u09A6\u09CD\u09A7 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 API \u09AA\u09C1\u09B2 \u09A5\u09C7\u0995\u09C7 \u09B8\u0995\u09CD\u09B0\u09BF\u09DF \u0995\u09C0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964";
  }
  if (errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED")) {
    return "\u0995\u09CB\u099F\u09BE/\u09B0\u09C7\u099F \u09B2\u09BF\u09AE\u09BF\u099F \u098F\u0995\u09CD\u09B8\u09BF\u09A1\u09C7\u09A1 (429 Rate Limit): \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09B0\u09BF\u0995\u09CB\u09DF\u09C7\u09B8\u09CD\u099F\u09C7\u09B0 \u0995\u09BE\u09B0\u09A3\u09C7 \u0995\u09BF\u099B\u09C1\u0995\u09CD\u09B7\u09A3 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE \u0995\u09B0\u09C7 \u09AA\u09C1\u09A8\u09B0\u09BE\u09DF \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964";
  }
  if (errString.includes("API_KEY_INVALID") || errString.includes("401")) {
    return "\u0985\u09AC\u09C8\u09A7 API \u0995\u09C0 (401 Invalid Key): \u0995\u09C0-\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09A8\u09DF\u0964 Google AI Studio \u09A5\u09C7\u0995\u09C7 \u09A8\u09A4\u09C1\u09A8 \u0995\u09C0 \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09C1\u09A8\u0964";
  }
  return errString;
}
var TaskRouter = class {
  /**
   * Determine the internal TaskType based on frontend parameters
   */
  resolveTaskType(req) {
    if (req.task) {
      return req.task;
    }
    if (req.size === "dual") {
      return "dual_photo";
    }
    if (req.dressId && req.dressId !== "original") {
      return "suit_dress_change";
    }
    if (req.bgHex) {
      return "background_replace";
    }
    return "passport_photo";
  }
  /**
   * Execute task across the API pool with Automatic Failover
   */
  async executeWithFailover(payload) {
    const task = payload.task;
    const attemptedIds = /* @__PURE__ */ new Set();
    const totalPoolKeys = vault.getAllCredentials().length;
    const maxAttempts = Math.max(10, Math.min(totalPoolKeys, 30));
    let lastError = "No eligible API key found.";
    console.log(`[TaskRouter] Starting execution for task: '${task}' across pool (${totalPoolKeys} keys registered, max failover: ${maxAttempts}).`);
    while (attemptedIds.size < maxAttempts) {
      const cred = apiSelector.selectEligibleApi(task, attemptedIds);
      if (!cred) {
        console.warn(`[TaskRouter] Exhausted eligible API keys for task '${task}'. Total tried: ${attemptedIds.size}`);
        break;
      }
      attemptedIds.add(cred.id);
      console.log(`[TaskRouter] Attempt ${attemptedIds.size}/${maxAttempts} using ${cred.id} (${cred.name})...`);
      try {
        const resultImage = await this.callProvider(cred, payload);
        if (resultImage) {
          console.log(`[TaskRouter] Success with ${cred.id} on attempt ${attemptedIds.size}!`);
          cooldownManager.handleApiSuccess(cred);
          return {
            success: true,
            image: resultImage,
            usedApiId: cred.id,
            usedProvider: cred.provider,
            attempts: attemptedIds.size
          };
        } else {
          throw new Error("Provider did not return an image part.");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        lastError = errorMsg;
        console.error(`[TaskRouter] ${cred.id} failed on attempt ${attemptedIds.size}:`, errorMsg);
        cooldownManager.handleApiError(cred, err);
        console.log(`[TaskRouter] Auto-failing over to next available API key in pool...`);
      }
    }
    return {
      success: false,
      error: formatUserFriendlyError(lastError),
      attempts: attemptedIds.size
    };
  }
  /**
   * Dispatches the call to the specified provider SDK
   */
  async callProvider(cred, payload) {
    if (cred.provider === "google") {
      return this.callGoogleGenAi(cred, payload);
    }
    throw new Error(`Unsupported provider: ${cred.provider}`);
  }
  /**
   * Execute via Google GenAI (@google/genai)
   */
  async callGoogleGenAi(cred, payload) {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: cred.apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const parts = [];
    const addImagePart = (imgDataUrl) => {
      const [meta, b64] = imgDataUrl.split(",");
      const mimeType = meta.match(/data:([^;]+);/)?.[1] || "image/jpeg";
      parts.push({
        inlineData: {
          data: b64,
          mimeType
        }
      });
    };
    if (payload.leftImage && payload.rightImage) {
      addImagePart(payload.leftImage);
      addImagePart(payload.rightImage);
    } else if (payload.image) {
      addImagePart(payload.image);
    } else if (payload.leftImage) {
      addImagePart(payload.leftImage);
    } else if (payload.rightImage) {
      addImagePart(payload.rightImage);
    }
    if (payload.prompt) {
      parts.push({
        text: payload.prompt
      });
    }
    const candidateModels = cred.models && cred.models.length > 0 ? cred.models : ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"];
    let lastModelError = null;
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts
          }
        });
        const candidateParts = response.candidates?.[0]?.content?.parts || [];
        for (const part of candidateParts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || "image/png";
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      } catch (err) {
        lastModelError = err;
        const errStr = String(err);
        if (errStr.includes("404") || errStr.includes("not found") || errStr.includes("no longer supported")) {
          console.warn(`[TaskRouter] Model ${modelName} not available for ${cred.id}. Trying next candidate model...`);
          continue;
        }
        throw err;
      }
    }
    if (lastModelError) {
      throw lastModelError;
    }
    return null;
  }
};
var taskRouter = new TaskRouter();

// server/apiApp.ts
function createApiApp() {
  const app2 = express();
  app2.use(express.json({ limit: "50mb" }));
  app2.use(express.urlencoded({ limit: "50mb", extended: true }));
  app2.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
  app2.use((req, res, next) => {
    const matchedPath = req.headers["x-matched-path"] || req.headers["x-invoke-path"];
    if (matchedPath && matchedPath.startsWith("/api") && (req.url === "/" || req.url === "/api")) {
      req.url = matchedPath;
    }
    next();
  });
  const router = express.Router();
  router.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: Date.now() });
  });
  router.get("/", (req, res) => {
    res.json({ status: "ok", service: "shafinbd-studio-api" });
  });
  router.post("/enhance", async (req, res) => {
    try {
      const {
        image,
        scale = "4x",
        dpi = false,
        dpiValue = 300,
        resize = false,
        width = 512,
        height = 512
      } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const [meta, base64Data] = image.split(",");
      const mime = meta.match(/data:([^;]+);/)?.[1] || "image/png";
      const buffer = Buffer.from(base64Data, "base64");
      const blob = new Blob([buffer], { type: mime });
      const { Client } = await import("@gradio/client");
      const client = await Client.connect("rmayormartins/image-enhancer");
      const result = await client.predict("/predict", [
        blob,
        true,
        scale,
        dpi,
        dpiValue,
        resize,
        width,
        height
      ]);
      const outputData = result.data[0];
      const outputUrl = typeof outputData === "object" && outputData !== null && "url" in outputData ? outputData.url : typeof outputData === "string" ? outputData : null;
      if (!outputUrl) {
        throw new Error("Gradio Space did not return a valid result file.");
      }
      const hfResponse = await fetch(outputUrl);
      if (!hfResponse.ok) {
        throw new Error(`Failed to fetch processed output from HF CDN: ${hfResponse.statusText}`);
      }
      const resBuffer = Buffer.from(await hfResponse.arrayBuffer());
      const resMime = hfResponse.headers.get("content-type") || "image/png";
      const finalBase64 = `data:${resMime};base64,${resBuffer.toString("base64")}`;
      res.json({ success: true, image: finalBase64 });
    } catch (error) {
      console.error("[API] Gradio processing failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Gradio predictions failed";
      res.status(500).json({
        error: errorMessage,
        details: String(error)
      });
    }
  });
  router.get("/admin/api-pool", (req, res) => {
    try {
      const summary = apiSelector.getPoolSummary();
      const keys = vault.getMaskedCredentials();
      res.json({ success: true, summary, keys });
    } catch (err) {
      console.error("[API] Error fetching pool summary:", err);
      res.json({
        success: true,
        summary: { total: 0, active: 0, cooldown: 0, failed: 0, disabled: 0 },
        keys: [],
        warning: String(err)
      });
    }
  });
  router.post("/admin/api-pool/reset-cooldowns", (req, res) => {
    try {
      vault.resetAllCooldowns();
      const summary = apiSelector.getPoolSummary();
      const keys = vault.getMaskedCredentials();
      res.json({ success: true, message: "All cooldowns reset successfully", summary, keys });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
  router.post("/admin/api-pool/key", (req, res) => {
    try {
      const { apiKey, name, priority } = req.body;
      if (!apiKey || typeof apiKey !== "string") {
        return res.status(400).json({ error: "apiKey string is required" });
      }
      const count = vault.getAllCredentials().length + 1;
      const keyName = name?.trim() || `Google Account ${String(count).padStart(2, "0")}`;
      const newCred = vault.addCredential({
        provider: "google",
        name: keyName,
        apiKey: apiKey.trim(),
        priority: priority || 2
      });
      res.json({
        success: true,
        message: `Registered ${newCred.id} successfully`,
        id: newCred.id,
        summary: apiSelector.getPoolSummary(),
        keys: vault.getMaskedCredentials()
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
  router.post("/admin/api-pool/toggle", (req, res) => {
    try {
      const { id, enabled } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Key id is required" });
      }
      vault.toggleEnable(id, Boolean(enabled));
      res.json({ success: true, summary: apiSelector.getPoolSummary(), keys: vault.getMaskedCredentials() });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
  router.post("/admin/api-pool/bulk-keys", (req, res) => {
    try {
      const { rawText, keyList } = req.body;
      let addedCount = 0;
      const existingKeys = new Set(vault.getAllCredentials().map((c) => c.apiKey));
      const addSingleKey = (key, name) => {
        const trimmed = key.trim();
        if (!trimmed || existingKeys.has(trimmed)) return;
        existingKeys.add(trimmed);
        const count = vault.getAllCredentials().length + 1;
        vault.addCredential({
          provider: "google",
          name: name?.trim() || `Account ${String(count).padStart(2, "0")}`,
          apiKey: trimmed,
          priority: 2
        });
        addedCount++;
      };
      if (Array.isArray(keyList)) {
        for (const item of keyList) {
          if (typeof item === "string") {
            addSingleKey(item);
          } else if (item && item.apiKey) {
            addSingleKey(item.apiKey, item.name);
          }
        }
      } else if (typeof rawText === "string") {
        const lines = rawText.split(/[\r\n]+/);
        for (const line of lines) {
          const l = line.trim();
          if (!l) continue;
          if (l.includes(":")) {
            const [name, key] = l.split(":");
            addSingleKey(key, name);
          } else if (l.includes("	")) {
            const [name, key] = l.split("	");
            addSingleKey(key, name);
          } else {
            addSingleKey(l);
          }
        }
      }
      res.json({
        success: true,
        message: `${addedCount} \u099F\u09BF API \u0995\u09C0 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09C1\u09B2\u09C7 \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7`,
        addedCount,
        summary: apiSelector.getPoolSummary(),
        keys: vault.getMaskedCredentials()
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
  router.delete("/admin/api-pool/key/:id", (req, res) => {
    try {
      const { id } = req.params;
      const deleted = vault.deleteCredential(id);
      res.json({
        success: deleted,
        message: deleted ? `${id} \u09A1\u09BF\u09B2\u09BF\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7` : "\u0995\u09C0 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF",
        summary: apiSelector.getPoolSummary(),
        keys: vault.getMaskedCredentials()
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
  router.post("/admin/api-pool/clear-failed", (req, res) => {
    try {
      const all = vault.getAllCredentials();
      let cleared = 0;
      for (const cred of all) {
        if (cred.status === "FAILED") {
          vault.deleteCredential(cred.id);
          cleared++;
        }
      }
      res.json({
        success: true,
        message: `${cleared} \u099F\u09BF \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 (Failed) \u0995\u09C0 \u09B0\u09BF\u09AE\u09C1\u09AD \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7`,
        cleared,
        summary: apiSelector.getPoolSummary(),
        keys: vault.getMaskedCredentials()
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
  router.post("/ai-editor", async (req, res) => {
    try {
      const { image, leftImage, rightImage, prompt, size, task, dressId, bgHex, clientKeys } = req.body;
      if (!image && !leftImage && !rightImage) {
        return res.status(400).json({ error: "No image provided for AI processing" });
      }
      if (Array.isArray(clientKeys)) {
        const existingKeys = new Set(vault.getAllCredentials().map((c) => c.apiKey));
        for (const k of clientKeys) {
          if (typeof k === "object" && k && k.apiKey) {
            const trimmed = String(k.apiKey).trim();
            if (trimmed && !existingKeys.has(trimmed)) {
              existingKeys.add(trimmed);
              vault.addCredential({
                provider: "google",
                name: k.name || "Client Key",
                apiKey: trimmed,
                priority: 1
              });
            }
          }
        }
      }
      const totalPoolKeys = vault.getAllCredentials().length;
      if (totalPoolKeys === 0) {
        console.warn("[API] No API keys in pool. Returning demo status.");
        return res.json({
          success: false,
          configured: false,
          message: "No Gemini API keys are configured in the pool. Please add a key in .env or the API Manager.",
          prompt
        });
      }
      const taskType = taskRouter.resolveTaskType({ task, size, dressId, bgHex });
      const execution = await taskRouter.executeWithFailover({
        task: taskType,
        image,
        leftImage,
        rightImage,
        prompt,
        size
      });
      if (execution.success && execution.image) {
        return res.json({
          success: true,
          image: execution.image,
          usedApiId: execution.usedApiId,
          attempts: execution.attempts
        });
      }
      return res.status(200).json({
        success: false,
        error: execution.error || "Model completed without returning an image part.",
        message: execution.error || "Model completed without returning an image part.",
        attempts: execution.attempts
      });
    } catch (error) {
      console.error("[API] AI generation router error:", error);
      const errorMessage = error instanceof Error ? error.message : "AI generation failed";
      res.status(200).json({
        success: false,
        error: errorMessage,
        message: errorMessage
      });
    }
  });
  app2.use("/api", router);
  return app2;
}

// server/apiEntry.ts
var app = createApiApp();
function handler(req, res) {
  try {
    if (req.url && !req.url.startsWith("/api")) {
      req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    }
    return app(req, res);
  } catch (err) {
    console.error("[Vercel Function Error]:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Serverless execution exception",
        details: err instanceof Error ? err.message : String(err)
      });
    }
  }
}
export {
  app,
  handler as default
};
