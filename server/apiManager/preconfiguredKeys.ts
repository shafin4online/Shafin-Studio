export interface PreconfiguredKey {
  name: string;
  apiKey: string;
}

/**
 * Parses any flexible account representation from GEMINI_ACCOUNTS_JSON:
 * - Direct raw API key: "AIzaSy..."
 * - JSON array of objects: '[{"name":"account1","apiKey":"AIza..."}, ...]'
 * - JSON array of strings: '["AIza...", "AIza..."]'
 * - JSON single object: '{"apiKey":"AIza..."}' or '{"account1":"AIza..."}'
 * - Single-quoted JSON or wrapped in outer quotes
 * - Comma / newline separated or text containing AIza keys
 */
function parseAccountsJson(rawInput?: string): PreconfiguredKey[] {
  const result: PreconfiguredKey[] = [];
  if (!rawInput) return result;

  let str = rawInput.trim();
  if (!str) return result;

  // Strip outer quotes if wrapped like "'[...]'" or '"[...]"'
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }

  // 1. Try standard JSON parse
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(str);
  } catch {
    // Try relaxing single quotes
    try {
      const relaxed = str.replace(/'/g, '"');
      parsed = JSON.parse(relaxed);
    } catch {
      // Not standard JSON - will fallback to token / regex extraction
    }
  }

  if (parsed !== null && parsed !== undefined) {
    if (Array.isArray(parsed)) {
      parsed.forEach((item, idx) => {
        if (typeof item === 'string' && item.trim()) {
          result.push({
            name: `Gemini Account ${idx + 1}`,
            apiKey: item.trim()
          });
        } else if (item && typeof item === 'object') {
          const rec = item as Record<string, unknown>;
          const key = typeof rec.apiKey === 'string' ? rec.apiKey : typeof rec.key === 'string' ? rec.key : '';
          if (key && key.trim()) {
            result.push({
              name: typeof rec.name === 'string' && rec.name.trim() ? rec.name.trim() : `Gemini Account ${idx + 1}`,
              apiKey: key.trim()
            });
          }
        }
      });
      if (result.length > 0) return result;
    } else if (typeof parsed === 'object') {
      const rec = parsed as Record<string, unknown>;
      const directKey = typeof rec.apiKey === 'string' ? rec.apiKey : typeof rec.key === 'string' ? rec.key : '';
      if (directKey && directKey.trim()) {
        result.push({
          name: typeof rec.name === 'string' && rec.name.trim() ? rec.name.trim() : 'Gemini Account',
          apiKey: directKey.trim()
        });
        return result;
      }
      // Check if it's a map of { accountName: "AIza..." }
      for (const [name, val] of Object.entries(rec)) {
        if (typeof val === 'string' && val.trim()) {
          result.push({
            name: name.trim() || 'Gemini Account',
            apiKey: val.trim()
          });
        }
      }
      if (result.length > 0) return result;
    }
  }

  // 2. Direct check or regex extraction for Google API keys (starting with AIza)
  const keyMatches = str.match(/AIza[0-9A-Za-z_-]{35,}/g);
  if (keyMatches && keyMatches.length > 0) {
    const uniqueKeys = Array.from(new Set(keyMatches));
    uniqueKeys.forEach((k, idx) => {
      result.push({
        name: uniqueKeys.length === 1 ? 'Gemini Account' : `Gemini Account ${idx + 1}`,
        apiKey: k.trim()
      });
    });
    return result;
  }

  // 3. Fallback: split by line breaks or commas
  const lines = str.split(/[\r\n,]+/);
  lines.forEach((line, idx) => {
    const l = line.trim();
    if (!l) return;
    if (l.includes(':')) {
      const [name, key] = l.split(':');
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

/**
 * Loads preconfigured keys from environment variables safely.
 * Never commit plain-text API keys in Git repository to prevent Vercel / GitHub Secret Scanning blocks.
 *
 * Supported environment variables:
 * - GEMINI_ACCOUNTS_JSON: JSON array, JSON object, or direct API key
 * - GEMINI_API_KEYS: Comma-separated list of keys or "name:key" pairs
 */
export function loadPreconfiguredKeys(): PreconfiguredKey[] {
  const result: PreconfiguredKey[] = [];
  const existingKeys = new Set<string>();

  const addKey = (key: string, name?: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey || existingKeys.has(trimmedKey)) return;
    existingKeys.add(trimmedKey);
    result.push({
      name: name?.trim() || `Gemini Account ${result.length + 1}`,
      apiKey: trimmedKey
    });
  };

  // 1. Check GEMINI_ACCOUNTS_JSON with resilient multi-format parser
  const accountsJson = process.env.GEMINI_ACCOUNTS_JSON;
  if (accountsJson) {
    const parsedAccounts = parseAccountsJson(accountsJson);
    parsedAccounts.forEach(acc => addKey(acc.apiKey, acc.name));
  }

  // 2. Check GEMINI_API_KEYS (supports "name:key" or just "key")
  const apiKeysEnv = process.env.GEMINI_API_KEYS?.trim();
  if (apiKeysEnv) {
    const parts = apiKeysEnv.split(',');
    parts.forEach((part, idx) => {
      const trimmed = part.trim();
      if (!trimmed) return;

      if (trimmed.includes(':')) {
        const [name, key] = trimmed.split(':');
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

