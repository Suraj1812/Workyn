import { countActivityLogs, listActivityLogs } from '../repositories/activityRepository.js';

export const getActivityTimeline = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 25);
    const module = req.query.module;
    const [items, total] = await Promise.all([
      listActivityLogs({
        workspaceId: req.workspace.id,
        module,
        limit,
        offset: (page - 1) * limit,
      }),
      countActivityLogs({
        workspaceId: req.workspace.id,
        module,
      }),
    ]);

    res.json({
      success: true,
      activity: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
