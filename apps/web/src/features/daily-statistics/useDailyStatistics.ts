import { useEffect, useState } from 'react';

export interface DailyStatistic {
  date: string;
  totalConsumption: number | null;
  totalProduction: number | null;
  averagePrice: number | null;
  longestNegativePriceStreak: number;
}

export type SortColumn = keyof DailyStatistic;

interface StatisticsResponse {
  data: DailyStatistic[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface RequestResult {
  key: string;
  data?: StatisticsResponse;
  error?: string;
}

export const useDailyStatistics = (query: string) => {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<RequestResult>();
  const key = `${query}:${attempt}`;

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`/api/daily-statistics?${query}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 400
              ? 'Check your filters. Ensure you are using valid dates and values.'
              : 'We couldn’t load the statistics. Please try again.',
          );
        }

        const data: StatisticsResponse = await response.json();
        if (!controller.signal.aborted) setResult({ key, data });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({
            key,
            error:
              error instanceof Error && error.name !== 'TypeError'
                ? error.message
                : 'We couldn’t connect. Check your connection and try again.',
          });
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [query, key]);

  const current = result?.key === key ? result : undefined;

  return {
    data: current?.data,
    error: current?.error,
    loading: !current,
    retry: () => setAttempt((value) => value + 1),
  };
};
