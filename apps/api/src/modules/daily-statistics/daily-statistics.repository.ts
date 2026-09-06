import { type Pool, type QueryResultRow } from 'pg';

export interface DailyStatistic {
  averagePrice: number | null;
  date: string;
  longestNegativePriceStreak: number;
  totalConsumption: number | null;
  totalProduction: number | null;
}

export interface DailyStatisticsRepository {
  findAll: (options: DailyStatisticsQuery) => Promise<DailyStatisticsPage>;
  findByDate: (date: string) => Promise<DayDetails | null>;
}

export interface HourlyReading {
  id: number;
  startTime: string;
  consumptionAmount: number | null;
  productionAmount: number | null;
  hourlyPrice: number | null;
  consumptionProductionGapMwh: number | null;
}

export interface DayDetails extends DailyStatistic {
  hours: HourlyReading[];
  cheapestHours: HourlyReading[];
  largestConsumptionGapHour: HourlyReading | null;
}

export const dailyStatisticsSortColumns = [
  'date',
  'totalConsumption',
  'totalProduction',
  'averagePrice',
  'longestNegativePriceStreak',
] as const;

export interface DailyStatisticsQuery {
  page: number;
  pageSize: number;
  sortBy: (typeof dailyStatisticsSortColumns)[number];
  sortOrder: 'asc' | 'desc';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  hasNegativePrices?: boolean;
}

export interface DailyStatisticsPage {
  data: DailyStatistic[];
  total: number;
}

const DAILY_STATISTICS_QUERY = `
  WITH negative_price_hours AS (
    SELECT
      date,
      startTime - ROW_NUMBER() OVER (
        PARTITION BY date
        ORDER BY startTime
      ) * INTERVAL '1 hour' AS streak
    FROM electricityData
    WHERE hourlyPrice < 0
  ),
  negative_price_streaks AS (
    SELECT date, COUNT(*)::integer AS length
    FROM negative_price_hours
    GROUP BY date, streak
  ),
  longest_negative_price_streaks AS (
    SELECT date, MAX(length) AS "longestNegativePriceStreak"
    FROM negative_price_streaks
    GROUP BY date
  ),
  daily_statistics AS (
    SELECT
      TO_CHAR(data.date, 'YYYY-MM-DD') AS date,
      SUM(data.consumptionAmount)::double precision AS "totalConsumption",
      SUM(data.productionAmount)::double precision AS "totalProduction",
      AVG(data.hourlyPrice)::double precision AS "averagePrice",
      COALESCE(streaks."longestNegativePriceStreak", 0)
        AS "longestNegativePriceStreak"
    FROM electricityData AS data
    LEFT JOIN longest_negative_price_streaks AS streaks
      ON streaks.date = data.date
    GROUP BY data.date, streaks."longestNegativePriceStreak"
  )
`;

export const createDailyStatisticsRepository = (
  database: Pick<Pool, 'query'>,
): DailyStatisticsRepository => ({
  findAll: async (options) => {
    const sortBy =
      dailyStatisticsSortColumns.find((column) => column === options.sortBy) ??
      'date';
    const sortOrder = options.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const result = await database.query<QueryResultRow & DailyStatisticsPage>(
      `${DAILY_STATISTICS_QUERY}
        , filtered_statistics AS (
          SELECT *
          FROM daily_statistics
          WHERE ($1::text IS NULL OR date >= $1)
            AND ($2::text IS NULL OR date <= $2)
            AND ($3::text IS NULL OR date LIKE $3 || '%')
            AND ($4::boolean IS NULL OR ("longestNegativePriceStreak" > 0) = $4)
        )
        SELECT
          (SELECT COUNT(*)::integer FROM filtered_statistics) AS total,
          COALESCE((
            SELECT JSON_AGG(page)
            FROM (
              SELECT *
              FROM filtered_statistics
              ORDER BY "${sortBy}" ${sortOrder} NULLS LAST, date DESC
              LIMIT $5 OFFSET $6
            ) AS page
          ), '[]'::json) AS data
      `,
      [
        options.dateFrom ?? null,
        options.dateTo ?? null,
        options.search ?? null,
        options.hasNegativePrices ?? null,
        options.pageSize,
        (options.page - 1) * options.pageSize,
      ],
    );

    const page = result.rows[0];

    if (!page) {
      throw new Error('Daily statistics query returned no pagination result');
    }

    return page;
  },
  findByDate: async (date) => {
    const result = await database.query<QueryResultRow & DayDetails>(
      `${DAILY_STATISTICS_QUERY}
        , hourly_readings AS (
          SELECT
            id,
            -- Preserve the supplied timestamp without inventing a timezone.
            TO_CHAR(startTime, 'YYYY-MM-DD"T"HH24:MI:SS') AS "startTime",
            consumptionAmount::double precision AS "consumptionAmount",
            productionAmount::double precision AS "productionAmount",
            hourlyPrice::double precision AS "hourlyPrice",
            -- kWh / 1000 minus MWh for the supplied one-hour interval.
            ((consumptionAmount / 1000) - productionAmount)::double precision
              AS "consumptionProductionGapMwh"
          FROM electricityData
          WHERE date = $1::date
        )
        SELECT
          statistics.*,
          (SELECT JSON_AGG(hour ORDER BY "startTime", id)
            FROM hourly_readings AS hour) AS hours,
          COALESCE((
            SELECT JSON_AGG(hour ORDER BY "startTime", id)
            FROM hourly_readings AS hour
            WHERE "hourlyPrice" = (SELECT MIN("hourlyPrice") FROM hourly_readings)
          ), '[]'::json) AS "cheapestHours",
          (SELECT ROW_TO_JSON(hour)
            FROM hourly_readings AS hour
            WHERE "consumptionProductionGapMwh" IS NOT NULL
            ORDER BY "consumptionProductionGapMwh" DESC, "startTime", id
            LIMIT 1) AS "largestConsumptionGapHour"
        FROM daily_statistics AS statistics
        WHERE date = $1::text
      `,
      [date],
    );

    return result.rows[0] ?? null;
  },
});
