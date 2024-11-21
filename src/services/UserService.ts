import { Service } from 'typedi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { CacheService } from './CacheService';
import { EmailService } from './EmailService';
import config from '../config';
import logger from '../utils/logger';
import { AppError } from '../middleware/error';

@Service()
export class UserService {
  constructor(
    private cacheService: CacheService,
    private emailService: EmailService
  ) {}

  /**
   * Register new user
   */
  public async register(userData: any) {
    try {
      const user = new User(userData);
      await user.save();

      const token = this.generateToken(user._id);
      
      // Send welcome email
      await this.emailService.sendWelcomeEmail(user.email);
      
      return { user, token };
    } catch (error) {
      logger.error('User registration error:', error);
      throw new AppError('Registration failed', 400);
    }
  }

  /**
   * User login
   */
  public async login(email: string, password: string) {
    try {
      const user = await User.findOne({ email });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError('Invalid credentials', 401);
      }

      const token = this.generateToken(user._id);
      
      return { user, token };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get user profile with caching
   */
  public async getProfile(userId: string) {
    try {
      // Try to get from cache first
      const cacheKey = `user:${userId}`;
      const cachedUser = await this.cacheService.get(cacheKey);
      
      if (cachedUser) {
        return cachedUser;
      }

      // If not in cache, get from database
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Cache the result
      await this.cacheService.set(cacheKey, user);
      
      return user;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      config.jwtSecret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}