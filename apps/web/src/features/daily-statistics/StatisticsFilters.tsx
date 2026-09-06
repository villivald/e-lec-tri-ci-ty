import { useState, type FormEvent } from 'react';
import { Button, TextField } from '@mui/material';

import styles from './DailyStatistics.module.css';

export interface StatisticsFiltersValue {
  search: string;
  dateFrom: string;
  dateTo: string;
  hasNegativePrices: string;
}

export const StatisticsFilters = ({
  onApply,
}: {
  onApply: (filters: StatisticsFiltersValue) => void;
}) => {
  const [error, setError] = useState<string>();

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const filters = {
      search: String(values.get('search') ?? '').trim(),
      dateFrom: String(values.get('dateFrom') ?? ''),
      dateTo: String(values.get('dateTo') ?? ''),
      hasNegativePrices: String(values.get('hasNegativePrices') ?? ''),
    };

    if (
      filters.dateFrom &&
      filters.dateTo &&
      filters.dateFrom > filters.dateTo
    ) {
      setError('The start date must be on or before the end date.');
      return;
    }

    setError(undefined);
    onApply(filters);
  };

  return (
    <form
      id="statistics-filters"
      className={styles.filters}
      aria-label="Filter daily statistics"
      onSubmit={applyFilters}
      onReset={() => {
        setError(undefined);
        onApply({
          search: '',
          dateFrom: '',
          dateTo: '',
          hasNegativePrices: '',
        });
      }}
    >
      <div className={styles.filterFields}>
        <div>
          <label htmlFor="search-dates">Search dates</label>
          <TextField
            id="search-dates"
            type="search"
            name="search"
            placeholder="e.g. 2024-05"
            helperText="Year, month, or YYYY-MM-DD"
            slotProps={{ htmlInput: { maxLength: 10 } }}
            autoComplete="off"
            className={styles.input}
          />
        </div>

        <div>
          <label htmlFor="date-from">From</label>
          <TextField
            id="date-from"
            type="date"
            name="dateFrom"
            slotProps={{ htmlInput: { min: '2020-12-31', max: '2024-10-01' } }}
            className={styles.input}
          />
        </div>

        <div>
          <label htmlFor="date-to">To</label>
          <TextField
            id="date-to"
            type="date"
            name="dateTo"
            slotProps={{ htmlInput: { min: '2020-12-31', max: '2024-10-01' } }}
            className={styles.input}
          />
        </div>

        <div>
          <label htmlFor="negative-prices">Negative-price hours</label>
          <TextField
            id="negative-prices"
            name="hasNegativePrices"
            select
            defaultValue=""
            slotProps={{ select: { native: true } }}
            className={styles.input}
          >
            <option value="">All days</option>
            <option value="true">With negative prices</option>
            <option value="false">Without negative prices</option>
          </TextField>
        </div>
      </div>

      <div className={styles.filterActions}>
        <Button type="reset">Clear filters</Button>
        <Button type="submit" className={styles.primaryButton}>
          Apply filters
        </Button>
      </div>

      {error && (
        <p className={styles.filterError} role="alert">
          {error}
        </p>
      )}
    </form>
  );
};
