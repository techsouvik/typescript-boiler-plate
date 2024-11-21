import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/microservice',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  logs: {
    dir: path.join(process.cwd(), 'logs'),
    level: process.env.LOG_LEVEL || 'info',
    maxSize: '5m',
    maxFiles: 5
  }
};