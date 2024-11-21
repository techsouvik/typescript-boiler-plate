import { Container } from 'typedi';
import { UserService } from '../services/UserService';
import { CacheService } from '../services/CacheService';
import logger from '../utils/logger';

/**
 * Service Container for Dependency Injection
 * Manages service lifecycle and dependencies
 */
export class ServiceContainer {
  private static instance: ServiceContainer;

  private constructor() {
    this.initializeServices();
  }

  /**
   * Get singleton instance of ServiceContainer
   */
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Initialize all services with their dependencies
   */
  private initializeServices(): void {
    try {
      // Register services
      Container.set('logger', logger);
      Container.set('cacheService', new CacheService());
      Container.set('userService', new UserService());

      logger.info('Services initialized successfully');
    } catch (error) {
      logger.error('Error initializing services:', error);
      throw error;
    }
  }

  /**
   * Get service instance by type
   */
  public getService<T>(serviceType: any): T {
    return Container.get<T>(serviceType);
  }
}