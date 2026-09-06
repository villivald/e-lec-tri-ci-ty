import { useState } from 'react';
import {
  Button,
  CircularProgress,
  Pagination,
  TextField,
  useMediaQuery,
} from '@mui/material';

import {
  StatisticsFilters,
  type StatisticsFiltersValue,
} from './StatisticsFilters';
import { StatisticsTable } from './StatisticsTable';
import { useDailyStatistics, type SortColumn } from './useDailyStatistics';
import styles from './DailyStatistics.module.css';

export const DailyStatistics = () => {
  const isSmallScreen = useMediaQuery('(width < 40rem)');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<{
    column: SortColumn;
    order: 'asc' | 'desc';
  }>({
    column: 'date',
    order: 'desc',
  });
  const [filters, setFilters] = useState<StatisticsFiltersValue>({
    search: '',
    dateFrom: '',
    dateTo: '',
    hasNegativePrices: '',
  });
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy: sort.column,
    sortOrder: sort.order,
  });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const { data, error, loading, retry } = useDailyStatistics(params.toString());
  const pagination = data?.pagination;
  const count = pagination?.total ?? 0;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, count);

  const applyFilters = (next: StatisticsFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const sortBy = (column: SortColumn) => {
    setSort({
      column,
      order: sort.column === column && sort.order === 'asc' ? 'desc' : 'asc',
    });
    setPage(1);
  };

  return (
    <section id="statistics" aria-labelledby="statistics-title" tabIndex={-1}>
      <h2 id="statistics-title" className={styles.sectionHeading}>
        Daily overview
      </h2>

      <StatisticsFilters onApply={applyFilters} />

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <p role="status">
            {loading
              ? 'Loading daily statistics…'
              : error
                ? 'Statistics unavailable'
                : `${count} matching ${count === 1 ? 'day' : 'days'}`}
          </p>
          <div className={styles.pageSize}>
            <label htmlFor="page-size">Rows per page</label>
            <TextField
              id="page-size"
              select
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.currentTarget.value));
                setPage(1);
              }}
              slotProps={{ select: { native: true } }}
              className={styles.input}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </TextField>
          </div>
        </div>

        <div aria-busy={loading}>
          {loading ? (
            <div className={styles.state}>
              <CircularProgress color="inherit" size={24} aria-hidden="true" />
              <p>Calculating daily statistics…</p>
            </div>
          ) : error ? (
            <div className={styles.state}>
              <h3>Something interrupted the loading process</h3>
              <p role="alert">{error}</p>
              <Button onClick={retry} className={styles.primaryButton}>
                Try again
              </Button>
            </div>
          ) : data && data.data.length > 0 ? (
            <StatisticsTable
              rows={data.data}
              sortBy={sort.column}
              sortOrder={sort.order}
              onSort={sortBy}
            />
          ) : (
            <div className={styles.state}>
              <h3>No days found</h3>
              <p>
                Try a different date or clear your filters to explore all
                available data.
              </p>
              <Button
                type="reset"
                form="statistics-filters"
                className={styles.primaryButton}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {pagination && count > 0 && (
          <div className={styles.paginationBar}>
            <span>
              Showing {first}–{last} of {count} days
            </span>
            <Pagination
              aria-label="Daily statistics pages"
              className={styles.pagination}
              count={pagination.totalPages}
              page={page}
              onChange={(_event, nextPage) => setPage(nextPage)}
              siblingCount={isSmallScreen ? 0 : 1}
              size={isSmallScreen ? 'small' : 'medium'}
              variant="outlined"
              shape="rounded"
            />
          </div>
        )}
      </div>
    </section>
  );
};
