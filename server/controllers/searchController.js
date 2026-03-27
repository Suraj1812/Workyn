import { searchWorkspace } from '../repositories/searchRepository.js';

export const globalSearch = async (req, res, next) => {
  try {
    const results = await searchWorkspace({
      workspaceId: req.workspace.id,
      searchTerm: req.query.q,
      limit: Number(req.query.limit || 8),
    });

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};
