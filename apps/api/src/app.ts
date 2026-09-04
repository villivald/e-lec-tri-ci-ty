import Fastify, { type FastifyInstance } from 'fastify';

import { createDatabase } from './database.js';
import {
  createDailyStatisticsRepository,
  type DailyStatisticsRepository,
} from './modules/daily-statistics/daily-statistics.repository.js';
import { registerDailyStatisticsRoutes } from './modules/daily-statistics/daily-statistics.routes.js';

interface AppDependencies {
  closeDatabaseConnection: () => Promise<void>;
  dailyStatisticsRepository: DailyStatisticsRepository;
}

interface BuildAppOptions {
  dependencies?: AppDependencies;
  logger?: boolean;
}

const createAppDependencies = (): AppDependencies => {
  const database = createDatabase();

  return {
    closeDatabaseConnection: () => database.end(),
    dailyStatisticsRepository: createDailyStatisticsRepository(database),
  };
};

export const buildApp = (options: BuildAppOptions = {}): FastifyInstance => {
  const app = Fastify({ logger: options.logger ?? true });
  const dependencies = options.dependencies ?? createAppDependencies();

  app.addHook('onClose', dependencies.closeDatabaseConnection);

  app.get('/health', async () => ({ status: 'ok' as const }));

  registerDailyStatisticsRoutes(app, dependencies.dailyStatisticsRepository);

  return app;
};
