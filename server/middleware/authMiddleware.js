import jwt from 'jsonwebtoken';

import { findUserById } from '../repositories/usersRepository.js';

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  return req.cookies?.[process.env.COOKIE_NAME || 'workyn_token'] || bearerToken;
};

export const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
