import { runScheduledAnalysisSafe } from './services/behaviorTracker.js';

export const startAiWorker = () => {
  const intervalMs = Number(process.env.AI_ANALYSIS_INTERVAL_MS || 15 * 60 * 1000);

  setTimeout(() => {
    runScheduledAnalysisSafe();
  }, 10_000);

  return setInterval(() => {
    runScheduledAnalysisSafe();
  }, intervalMs);
};
