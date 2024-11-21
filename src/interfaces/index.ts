// User interfaces
export interface IUser {
  _id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
}

// Service interfaces
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  clear(): Promise<void>;
}

export interface IEmailService {
  sendWelcomeEmail(to: string): Promise<void>;
  sendPasswordReset(to: string, token: string): Promise<void>;
}

// Configuration interfaces
export interface IConfig {
  port: number;
  mongoUri: string;
  redisUrl: string;
  jwtSecret: string;
  jwt: {
    expiresIn: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  cache: {
    ttl: number;
    maxItems: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}