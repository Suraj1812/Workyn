const normalizeRole = (req) => req.membership?.role || req.user?.role || 'member';

export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(normalizeRole(req))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    return next();
  };

export const requirePlan =
  (...plans) =>
  (req, res, next) => {
    const currentPlan = req.workspace?.plan || 'free';

    if (!plans.includes(currentPlan)) {
      return res.status(403).json({
        success: false,
        message: `This feature requires the ${plans.join(' or ')} plan.`,
      });
    }

    return next();
  };
