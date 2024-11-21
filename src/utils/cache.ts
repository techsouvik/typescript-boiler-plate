import { createClient } from 'redis';
import config from '../config';
import logger from './logger';

const redisClient = createClient({ url: config.redisUrl });

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

export const connectCache = async () => {
  await redisClient.connect();
};

export const getCache = async (key: string) => {
  return await redisClient.get(key);
};

export const setCache = async (key: string, value: string, expireIn = 3600) => {
  await redisClient.set(key, value, { EX: expireIn });
};