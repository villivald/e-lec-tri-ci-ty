import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildApp } from './app.js';
import {
  type DailyStatistic,
  type DailyStatisticsQuery,
  type DailyStatisticsRepository,
  type DayDetails,
} from './modules/daily-statistics/daily-statistics.repository.js';

const dailyStatistic: DailyStatistic = {
  averagePrice: 43.5,
  date: '2024-05-06',
  longestNegativePriceStreak: 2,
  totalConsumption: 218_100,
  totalProduction: 11_678,
};

const createDependencies = (): {
  closeDatabaseConnection: () => Promise<void>;
  dailyStatisticsRepository: DailyStatisticsRepository;
} => ({
  closeDatabaseConnection: async () => undefined,
  dailyStatisticsRepository: {
    findAll: async () => ({ data: [dailyStatistic], total: 1 }),
    findByDate: async (): Promise<DayDetails | null> => null,
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
  assert.deepEqual(response.json(), {
    data: [dailyStatistic],
    pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
  });
});

test('query defaults and typed filters reach the repository', async (context) => {
  const queries: DailyStatisticsQuery[] = [];
  const dependencies = createDependencies();
  dependencies.dailyStatisticsRepository.findAll = async (query) => {
    queries.push(query);
    return { data: [], total: 41 };
  };
  const app = buildApp({ dependencies, logger: false });
  context.after(() => app.close());

  await app.inject('/api/daily-statistics');
  assert.deepEqual(queries[0], {
    page: 1,
    pageSize: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const response = await app.inject(
    '/api/daily-statistics?page=4&pageSize=10&sortBy=averagePrice&sortOrder=asc&search=2024-05&dateFrom=2024-05-01&dateTo=2024-05-31&hasNegativePrices=false',
  );
  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    { ...queries[1] },
    {
      page: 4,
      pageSize: 10,
      sortBy: 'averagePrice',
      sortOrder: 'asc',
      search: '2024-05',
      dateFrom: '2024-05-01',
      dateTo: '2024-05-31',
      hasNegativePrices: false,
    },
  );
  assert.deepEqual(response.json().pagination, {
    page: 4,
    pageSize: 10,
    total: 41,
    totalPages: 5,
  });
});

test('single-day endpoint validates and forwards the date and serializes hourly details', async (context) => {
  const hour = {
    id: 1,
    startTime: '2024-02-29T00:00:00',
    consumptionAmount: 3000,
    productionAmount: 2,
    hourlyPrice: -1,
    consumptionProductionGapMwh: 1,
  };
  const details: DayDetails = {
    date: '2024-02-29',
    totalConsumption: 3000,
    totalProduction: 2,
    averagePrice: -1,
    longestNegativePriceStreak: 1,
    hours: [hour],
    cheapestHours: [hour],
    largestConsumptionGapHour: hour,
  };
  const dependencies = createDependencies();
  dependencies.dailyStatisticsRepository.findByDate = async (date) => {
    assert.equal(date, '2024-02-29');
    return details;
  };
  const app = buildApp({ dependencies, logger: false });
  context.after(() => app.close());

  const response = await app.inject('/api/daily-statistics/2024-02-29');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { data: details });
});

test('single-day endpoint preserves missing measurements and empty highlights', async (context) => {
  const details: DayDetails = {
    date: '2024-01-01',
    totalConsumption: null,
    totalProduction: null,
    averagePrice: null,
    longestNegativePriceStreak: 0,
    hours: [
      {
        id: 1,
        startTime: '2024-01-01T00:00:00',
        consumptionAmount: null,
        productionAmount: null,
        hourlyPrice: null,
        consumptionProductionGapMwh: null,
      },
    ],
    cheapestHours: [],
    largestConsumptionGapHour: null,
  };
  const dependencies = createDependencies();
  dependencies.dailyStatisticsRepository.findByDate = async () => details;
  const app = buildApp({ dependencies, logger: false });
  context.after(() => app.close());

  const response = await app.inject('/api/daily-statistics/2024-01-01');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { data: details });
});

test('single-day endpoint returns 404 for a date without records', async (context) => {
  const app = buildApp({ dependencies: createDependencies(), logger: false });
  context.after(() => app.close());

  const response = await app.inject('/api/daily-statistics/1900-01-01');
  assert.equal(response.statusCode, 404);
});

test('invalid single-day dates return 400 without querying the database', async (context) => {
  const dependencies = createDependencies();
  dependencies.dailyStatisticsRepository.findByDate = async () => {
    assert.fail('Invalid date must not reach the repository');
  };
  const app = buildApp({ dependencies, logger: false });
  context.after(() => app.close());

  for (const date of ['2023-02-29', '2024-01', '123-abc']) {
    const response = await app.inject(`/api/daily-statistics/${date}`);
    assert.equal(response.statusCode, 400, date);
  }
});

test('invalid queries return 400 without querying the db', async (context) => {
  const dependencies = createDependencies();
  dependencies.dailyStatisticsRepository.findAll = async () => {
    assert.fail('Invalid input must not reach the repository');
  };
  const app = buildApp({ dependencies, logger: false });
  context.after(() => app.close());

  for (const query of [
    'page=0',
    'page=-1',
    'page=1.5',
    'page=abc',
    'page=1000001',
    'pageSize=0',
    'pageSize=101',
    'sortBy=unknown',
    'sortBy=__proto__',
    'sortBy=date%3BDROP%20TABLE%20electricityData',
    'sortOrder=sideways',
    'dateFrom=2023-02-29',
    'dateTo=2024-13-01',
    'dateFrom=0000-01-01',
    'dateFrom=2024-05-02&dateTo=2024-05-01',
    'search=2024-02-30',
    'search=2024-13',
    'search=%25',
    'search=',
    'hasNegativePrices=yes',
    'page=1&page=2',
  ]) {
    const response = await app.inject(`/api/daily-statistics?${query}`);
    assert.equal(response.statusCode, 400, query);
  }
});
