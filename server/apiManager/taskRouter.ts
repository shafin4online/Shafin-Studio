import { apiSelector } from './apiSelector.ts';
import { cooldownManager } from './cooldownManager.ts';
import { vault } from './credentialVault.ts';
import type { TaskRequest, TaskType, ExecutionResult, ApiCredential } from './types.ts';

function formatUserFriendlyError(errString: string): string {
  if (errString.includes('limit: 0') || (errString.includes('free_tier') && errString.includes('Quota exceeded'))) {
    return 'ইমেজ মডেল কোটা সীমা ত্রুটি (Quota limit: 0): গুগল এআই স্টুডিওতে ইমেজ জেনারেশন মডেলের জন্য ফ্রি কোটা নেই (limit: 0)। এটি ব্যবহার করতে গুগল ক্লাউড প্রজেক্টে বিলিং (Pay-as-you-go) সক্রিয় করতে হবে অথবা বিলিং-সক্ষম পেইড API কী ব্যবহার করতে হবে।';
  }
  if (errString.includes('PERMISSION_DENIED') || errString.includes('denied access') || errString.includes('403')) {
    return 'প্রজেক্ট পারমিশন ত্রুটি (403 Permission Denied): এই গুগল প্রজেক্টটির অ্যাক্সেস গুগল কর্তৃক স্থগিত বা নিষিদ্ধ করা হয়েছে। API পুল থেকে সক্রিয় কী ব্যবহার করুন।';
  }
  if (errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED')) {
    return 'কোটা/রেট লিমিট এক্সিডেড (429 Rate Limit): অতিরিক্ত রিকোয়েস্টের কারণে কিছুক্ষণ অপেক্ষা করে পুনরায় চেষ্টা করুন।';
  }
  if (errString.includes('API_KEY_INVALID') || errString.includes('401')) {
    return 'অবৈধ API কী (401 Invalid Key): কী-টি সঠিক নয়। Google AI Studio থেকে নতুন কী যুক্ত করুন।';
  }
  return errString;
}

export class TaskRouter {
  /**
   * Determine the internal TaskType based on frontend parameters
   */
  public resolveTaskType(req: {
    task?: string;
    size?: string;
    dressId?: string;
    bgHex?: string;
  }): TaskType {
    if (req.task) {
      return req.task as TaskType;
    }
    if (req.size === 'dual') {
      return 'dual_photo';
    }
    if (req.dressId && req.dressId !== 'original') {
      return 'suit_dress_change';
    }
    if (req.bgHex) {
      return 'background_replace';
    }
    return 'passport_photo';
  }

  /**
   * Execute task across the API pool with Automatic Failover
   */
  public async executeWithFailover(payload: TaskRequest): Promise<ExecutionResult> {
    const task = payload.task;
    const attemptedIds = new Set<string>();
    const totalPoolKeys = vault.getAllCredentials().length;
    const maxAttempts = Math.max(10, Math.min(totalPoolKeys, 30));
    let lastError: string = 'No eligible API key found.';

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
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        lastError = errorMsg;
        console.error(`[TaskRouter] ${cred.id} failed on attempt ${attemptedIds.size}:`, errorMsg);

        // Update cooldown or failed state for this key
        cooldownManager.handleApiError(cred, err);

        // Automatically failover to the next available key in the pool
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
  private async callProvider(cred: ApiCredential, payload: TaskRequest): Promise<string | null> {
    if (cred.provider === 'google') {
      return this.callGoogleGenAi(cred, payload);
    }
    throw new Error(`Unsupported provider: ${cred.provider}`);
  }

  /**
   * Execute via Google GenAI (@google/genai)
   */
  private async callGoogleGenAi(cred: ApiCredential, payload: TaskRequest): Promise<string | null> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey: cred.apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Construct multimodal parts
    const parts: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> = [];

    const addImagePart = (imgDataUrl: string) => {
      const [meta, b64] = imgDataUrl.split(',');
      const mimeType = meta.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
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

    // Candidate models to try for image tasks
    const candidateModels = cred.models && cred.models.length > 0 
      ? cred.models 
      : ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'];

    let lastModelError: unknown = null;
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
            const mime = part.inlineData.mimeType || 'image/png';
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      } catch (err: unknown) {
        lastModelError = err;
        const errStr = String(err);
        if (errStr.includes('404') || errStr.includes('not found') || errStr.includes('no longer supported')) {
          console.warn(`[TaskRouter] Model ${modelName} not available for ${cred.id}. Trying next candidate model...`);
          continue;
        }
        // Quota, auth, rate limit, or other API error - propagate so failover moves to next key
        throw err;
      }
    }

    if (lastModelError) {
      throw lastModelError;
    }

    return null;
  }
}

export const taskRouter = new TaskRouter();
