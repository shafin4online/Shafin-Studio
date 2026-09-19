export type ApiProvider = 'google' | 'huggingface';

export type KeyStatus = 'ACTIVE' | 'COOLDOWN' | 'FAILED' | 'DISABLED';

export type TaskType = 
  | 'passport_photo'
  | 'background_remove'
  | 'background_replace'
  | 'face_retouch'
  | 'face_enhancement'
  | 'image_upscale'
  | 'image_restoration'
  | 'dual_photo'
  | 'image_edit'
  | 'color_correction'
  | 'suit_dress_change';

export interface KeyStats {
  requests: number;
  success: number;
  failure: number;
  rateLimits: number;
  lastUsedAt: number | null;
  lastError: string | null;
}

export interface ApiCredential {
  id: string; // e.g. 'API-01'
  provider: ApiProvider;
  name: string; // e.g. 'Google Account 01'
  apiKey: string; // secret key
  models: string[];
  supportedTasks: TaskType[];
  priority: number; // 1 (highest) to 10
  status: KeyStatus;
  cooldownUntil: number | null; // timestamp ms
  stats: KeyStats;
}

export interface MaskedApiCredential {
  id: string;
  provider: ApiProvider;
  name: string;
  maskedKey: string;
  supportedTasks: TaskType[];
  priority: number;
  status: KeyStatus;
  cooldownRemainingSeconds: number;
  stats: KeyStats;
}

export interface TaskRequest {
  task: TaskType;
  image?: string;
  leftImage?: string;
  rightImage?: string;
  prompt?: string;
  size?: string;
  options?: Record<string, unknown>;
}

export interface ExecutionResult {
  success: boolean;
  image?: string;
  error?: string;
  usedApiId?: string;
  usedProvider?: ApiProvider;
  attempts: number;
  fallbackUsed?: boolean;
}
