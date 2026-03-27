import {
  createUserAction,
  listDistinctUserIdsFromActionsSince,
} from '../../repositories/aiRepository.js';
import { runActionPatternAnalysis, runScheduledAnalysis } from './patternDetector.js';
import { executeTriggerAutomations } from './ruleEngine.js';

export const processUserAction = async ({
  userId,
  module,
  actionType,
  metadata = {},
  timestamp = new Date(),
}) => {
  try {
    const action = await createUserAction({
      userId,
      module,
      actionType,
      metadata,
      timestamp,
    });

    await Promise.all([
      runActionPatternAnalysis({
        userId,
        module,
        actionType,
        metadata,
        timestamp: action.timestamp,
      }),
      executeTriggerAutomations({
        userId,
        actionType,
        metadata,
        timestamp: action.timestamp,
      }),
    ]);

    return action;
  } catch (error) {
    console.error('AI behavior tracking failed:', error.message);
    return null;
  }
};

export const runScheduledAnalysisSafe = async () => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUserIds = await listDistinctUserIdsFromActionsSince(since);
    await runScheduledAnalysis(activeUserIds);
  } catch (error) {
    console.error('AI scheduled analysis failed:', error.message);
  }
};
