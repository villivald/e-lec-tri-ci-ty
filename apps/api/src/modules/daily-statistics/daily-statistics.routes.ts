import { type FastifyInstance } from 'fastify';

import { type DailyStatisticsRepository } from './daily-statistics.repository.js';

const nullableNumberSchema = {
  anyOf: [{ type: 'number' }, { type: 'null' }],
} as const;

const dailyStatisticSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'averagePrice',
    'date',
    'longestNegativePriceStreak',
    'totalConsumption',
    'totalProduction',
  ],
  properties: {
    averagePrice: nullableNumberSchema,
    date: { type: 'string' },
    longestNegativePriceStreak: { type: 'integer', minimum: 0 },
    totalConsumption: nullableNumberSchema,
    totalProduction: nullableNumberSchema,
  },
} as const;

export const registerDailyStatisticsRoutes = (
  app: FastifyInstance,
  repository: DailyStatisticsRepository,
): void => {
  app.get(
    '/api/daily-statistics',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['data'],
            properties: {
              data: {
                type: 'array',
                items: dailyStatisticSchema,
              },
            },
          },
        },
      },
    },
    async () => ({ data: await repository.findAll() }),
  );
};
