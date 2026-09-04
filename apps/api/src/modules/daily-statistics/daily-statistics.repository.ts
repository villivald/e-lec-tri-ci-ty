import { type Pool, type QueryResultRow } from 'pg';

export interface DailyStatistic {
  averagePrice: number | null;
  date: string;
  longestNegativePriceStreak: number;
  totalConsumption: number | null;
  totalProduction: number | null;
}

export interface DailyStatisticsRepository {
  findAll: () => Promise<DailyStatistic[]>;
}

type DailyStatisticRow = QueryResultRow & DailyStatistic;

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
  )
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
  ORDER BY data.date DESC
`;

export const createDailyStatisticsRepository = (
  database: Pick<Pool, 'query'>,
): DailyStatisticsRepository => ({
  findAll: async () => {
    const result = await database.query<DailyStatisticRow>(
      DAILY_STATISTICS_QUERY,
    );

    return result.rows;
  },
});
