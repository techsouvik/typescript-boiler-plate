import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import config from './config';
import { specs } from './swagger';
import userRoutes from './routes/user';
import { errorHandler } from './middleware/error';
import logger from './utils/logger';
import { connectCache } from './utils/cache';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(rateLimit(config.rateLimit));

// Routes
app.use('/api/users', userRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Documentation',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Database connection
mongoose.connect(config.mongoUri)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => logger.error('MongoDB connection error:', err));

// Redis connection
connectCache()
  .then(() => logger.info('Connected to Redis'))
  .catch((err) => logger.error('Redis connection error:', err));

// Start server
app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
  logger.info(`API Documentation available at http://localhost:${config.port}/api-docs`);
});