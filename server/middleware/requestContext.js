import { randomUUID } from 'node:crypto';

export const attachRequestContext = (req, res, next) => {
  req.id = randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
};
