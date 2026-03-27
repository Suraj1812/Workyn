import { validationResult } from 'express-validator';

import { sanitizeDeep } from '../services/sanitizer.js';

export const sanitizeRequestPayload = (req, _res, next) => {
  req.body = sanitizeDeep(req.body || {});
  req.query = sanitizeDeep(req.query || {});
  req.params = sanitizeDeep(req.params || {});
  next();
};

export const validateRequest = (req, res, next) => {
  sanitizeRequestPayload(req, res, () => {});
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    success: false,
    message: 'Validation failed.',
    errors: result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
};
