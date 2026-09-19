import { apiSelector } from './apiSelector';
import { cooldownManager } from './cooldownManager';
import { TaskRequest, TaskType, ExecutionResult, ApiCredential } from './types';

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
    const maxAttempts = 4;
    let lastError: string = 'No eligible API key found.';

    console.log(`[TaskRouter] Starting execution for task: '${task}' with up to ${maxAttempts} failover attempts.`);

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

        const { isRetryable } = cooldownManager.handleApiError(cred, err);

        if (!isRetryable) {
          console.warn(`[TaskRouter] Non-retryable error encountered on ${cred.id}. Stopping failover.`);
          break;
        }

        console.log(`[TaskRouter] Auto-failing over to next available API key in pool...`);
      }
    }

    return {
      success: false,
      error: `AI processing error: ${lastError}`,
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
    const ai = new GoogleGenAI({ apiKey: cred.apiKey });

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

    // Use recommended model from gemini-api skill: 'gemini-3.1-flash-lite-image' or 'gemini-3.1-flash-image'
    const modelName = cred.models[0] || 'gemini-3.1-flash-lite-image';

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

    return null;
  }
}

export const taskRouter = new TaskRouter();
