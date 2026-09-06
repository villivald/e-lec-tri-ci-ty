import { useApiData } from '../../hooks/useApiData';

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

export const useDailyStatistics = (query: string) =>
  useApiData<StatisticsResponse>(`/api/daily-statistics?${query}`);
