import { type FastifyInstance } from 'fastify';

import {
  dailyStatisticsSortColumns,
  type DailyStatisticsQuery,
  type DailyStatisticsRepository,
} from './daily-statistics.repository.js';

const dateSchema = {
  type: 'string',
  format: 'date',
  pattern: '^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$',
} as const;

const querySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    page: { type: 'integer', minimum: 1, maximum: 1_000_000, default: 1 },
    pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: {
      type: 'string',
      enum: dailyStatisticsSortColumns,
      default: 'date',
    },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    search: {
      type: 'string',
      anyOf: [
        { pattern: '^(?!0000)[0-9]{4}(-(?:0[1-9]|1[0-2]))?$' },
        dateSchema,
      ],
    },
    dateFrom: dateSchema,
    dateTo: dateSchema,
    hasNegativePrices: { type: 'boolean' },
  },
} as const;

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
  app.get<{ Querystring: DailyStatisticsQuery }>(
    '/api/daily-statistics',
    {
      schema: {
        querystring: querySchema,
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['data', 'pagination'],
            properties: {
              data: {
                type: 'array',
                items: dailyStatisticSchema,
              },
              pagination: {
                type: 'object',
                additionalProperties: false,
                required: ['page', 'pageSize', 'total', 'totalPages'],
                properties: {
                  page: { type: 'integer' },
                  pageSize: { type: 'integer' },
                  total: { type: 'integer' },
                  totalPages: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize, dateFrom, dateTo } = request.query;

      if (dateFrom && dateTo && dateFrom > dateTo) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'dateFrom must be on or before dateTo',
        });
      }

      const result = await repository.findAll(request.query);

      return {
        data: result.data,
        pagination: {
          page,
          pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / pageSize),
        },
      };
    },
  );
};
