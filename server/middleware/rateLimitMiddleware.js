import rateLimit from 'express-rate-limit';

const buildLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

export const apiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests. Please try again shortly.',
});

export const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please wait before trying again.',
});

export const uploadLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: 40,
  message: 'Upload limit reached. Please slow down and try again soon.',
});
