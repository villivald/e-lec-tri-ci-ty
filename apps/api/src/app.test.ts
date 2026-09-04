import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildApp } from './app.js';
import { type DailyStatistic } from './modules/daily-statistics/daily-statistics.repository.js';

const dailyStatistic: DailyStatistic = {
  averagePrice: 43.5,
  date: '2024-05-06',
  longestNegativePriceStreak: 2,
  totalConsumption: 218_100,
  totalProduction: 11_678,
};

const createDependencies = () => ({
  closeDatabaseConnection: async () => undefined,
  dailyStatisticsRepository: {
    findAll: async () => [dailyStatistic],
  },
});

test('GET /health reports that the process is running', async (context) => {
  const app = buildApp({ dependencies: createDependencies(), logger: false });
  context.after(() => app.close());

  const response = await app.inject({ method: 'GET', url: '/health' });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: 'ok' });
});

test('GET /api/daily-statistics returns daily statistics', async (context) => {
  const app = buildApp({ dependencies: createDependencies(), logger: false });
  context.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/api/daily-statistics',
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { data: [dailyStatistic] });
});
