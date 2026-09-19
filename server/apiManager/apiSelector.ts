import { vault } from './credentialVault';
import { cooldownManager } from './cooldownManager';
import { ApiCredential, TaskType } from './types';

export class ApiSelector {
  private rotationIndex: number = 0;

  /**
   * Select the best eligible API credential for a specific task.
   * Excludes any key IDs already attempted during the current request.
   */
  public selectEligibleApi(task: TaskType, excludedIds: Set<string> = new Set()): ApiCredential | null {
    // 1. Refresh any expired cooldowns
    cooldownManager.refreshCooldowns();

    // 2. Fetch all credentials
    const all = vault.getAllCredentials();

    // 3. Filter candidates: must be ACTIVE, must support the requested task, and must not be excluded
    const eligible = all.filter(c => 
      c.status === 'ACTIVE' && 
      c.supportedTasks.includes(task) &&
      !excludedIds.has(c.id)
    );

    if (eligible.length === 0) {
      console.warn(`[ApiSelector] No ACTIVE eligible API keys found for task '${task}'. Total keys: ${all.length}`);
      return null;
    }

    // 4. Sort by priority (ascending, 1 is highest priority), then by least recently used
    eligible.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      const timeA = a.stats.lastUsedAt || 0;
      const timeB = b.stats.lastUsedAt || 0;
      return timeA - timeB;
    });

    // 5. Select using round-robin distribution among top-tier candidates
    const topPriority = eligible[0].priority;
    const topCandidates = eligible.filter(c => c.priority === topPriority);

    const selected = topCandidates[this.rotationIndex % topCandidates.length];
    this.rotationIndex = (this.rotationIndex + 1) % 10000;

    console.log(`[ApiSelector] Selected ${selected.id} (${selected.name}) for task '${task}' [Pool candidates: ${topCandidates.length}]`);
    return selected;
  }

  /**
   * Diagnostic: returns summary of the pool state
   */
  public getPoolSummary() {
    cooldownManager.refreshCooldowns();
    const all = vault.getAllCredentials();
    const active = all.filter(c => c.status === 'ACTIVE').length;
    const cooldown = all.filter(c => c.status === 'COOLDOWN').length;
    const failed = all.filter(c => c.status === 'FAILED').length;
    const disabled = all.filter(c => c.status === 'DISABLED').length;

    return {
      total: all.length,
      active,
      cooldown,
      failed,
      disabled
    };
  }
}

export const apiSelector = new ApiSelector();
