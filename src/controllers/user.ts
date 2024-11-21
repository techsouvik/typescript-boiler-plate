import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import config from '../config';
import { AppError } from '../middleware/error';
import { setCache, getCache } from '../utils/cache';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    const token = jwt.sign({ id: user._id }, config.jwtSecret);
    res.status(201).json({ user, token });
  } catch (err) {
    logger.error('Registration error:', err);
    throw new AppError('Registration failed', 400);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign({ id: user._id }, config.jwtSecret);
    res.json({ user, token });
  } catch (err) {
    logger.error('Login error:', err);
    throw new AppError('Login failed', 400);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const cachedUser = await getCache(`user:${req.user.id}`);
    if (cachedUser) {
      return res.json(JSON.parse(cachedUser));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await setCache(`user:${req.user.id}`, JSON.stringify(user));
    res.json(user);
  } catch (err) {
    logger.error('Get profile error:', err);
    throw new AppError('Failed to get profile', 400);
  }
};