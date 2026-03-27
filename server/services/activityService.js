import { invalidateCachePrefix } from '../cache/memoryCache.js';
import { createActivityLog } from '../repositories/activityRepository.js';

export const recordActivity = async ({
  workspaceId,
  userId,
  module,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
}) => {
  const activity = await createActivityLog({
    workspaceId,
    userId,
    module,
    action,
    entityType,
    entityId,
    description,
    metadata,
  });

  if (workspaceId) {
    invalidateCachePrefix(`dashboard:${workspaceId}`);
    invalidateCachePrefix(`analytics:${workspaceId}`);
    invalidateCachePrefix(`activity:${workspaceId}`);
  }

  return activity;
};
