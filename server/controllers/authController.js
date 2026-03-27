import bcrypt from 'bcryptjs';

import { createUser, findUserByEmail } from '../repositories/usersRepository.js';
import { clearAuthCookie, generateToken, setAuthCookie } from '../utils/token.js';

const serializeUser = (user) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required.');
    }

    const existingUser = await findUserByEmail(email.toLowerCase(), {
      includePassword: true,
    });
    if (existingUser) {
      res.status(409);
      throw new Error('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required.');
    }

    const user = await findUserByEmail(email.toLowerCase(), {
      includePassword: true,
    });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful.',
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
};

export const getCurrentUser = async (req, res) => {
  res.json({ success: true, user: serializeUser(req.user) });
};
