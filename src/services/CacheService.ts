import { RedisClientType, createClient } from 'redis';
import config from '../config';
import logger from '../utils/logger';

/**
 * Cache Service implementing LRU (Least Recently Used) caching strategy
 */
export class CacheService {
  private client: RedisClientType;
  private readonly maxItems: number;
  private readonly defaultTTL: number;

  constructor() {
    this.maxItems = Number(config.cache.maxItems);
    this.defaultTTL = Number(config.cache.ttl);
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    this.client = createClient({ url: config.redisUrl });
    
    this.client.on('error', (err) => logger.error('Redis Client Error:', err));
    this.client.on('connect', () => logger.info('Connected to Redis'));
    
    await this.client.connect();
  }

  /**
   * Get value from cache
   * @param key Cache key
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with LRU implementation
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds
   */
  public async set(key: string, value: any, ttl = this.defaultTTL): Promise<void> {
    try {
      // Check current cache size
      const cacheSize = await this.client.dbSize();
      
      // If cache is full, remove least recently used items
      if (cacheSize >= this.maxItems) {
        await this.evictLRU();
      }

      // Set new value with TTL
      await this.client.setEx(key, ttl, JSON.stringify(value));
      
      // Update access time for LRU tracking
      await this.client.zAdd('cache:access', {
        score: Date.now(),
        value: key
      });
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Remove least recently used items when cache is full
   */
  private async evictLRU(): Promise<void> {
    try {
      // Get oldest accessed keys
      const oldestKeys = await this.client.zRange('cache:access', 0, 9);
      
      if (oldestKeys.length > 0) {
        await this.client.del(oldestKeys);
        await this.client.zRem('cache:access', oldestKeys);
      }
    } catch (error) {
      logger.error('Cache eviction error:', error);
    }
  }

  /**
   * Clear entire cache
   */
  public async clear(): Promise<void> {
    try {
      await this.client.flushDb();
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }
}