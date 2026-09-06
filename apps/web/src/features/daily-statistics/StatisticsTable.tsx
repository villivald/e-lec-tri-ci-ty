import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

import { type DailyStatistic, type SortColumn } from './useDailyStatistics';
import styles from './DailyStatistics.module.css';

const columns: { key: SortColumn; label: string; unit: string }[] = [
  { key: 'date', label: 'Date', unit: 'Day / month / year' },
  { key: 'totalConsumption', label: 'Consumption', unit: 'MWh' },
  { key: 'totalProduction', label: 'Production', unit: 'MWh' },
  { key: 'averagePrice', label: 'Average price', unit: 'c/kWh' },
  {
    key: 'longestNegativePriceStreak',
    label: 'Negative-price streak',
    unit: 'Consecutive hours',
  },
];

const energyFormat = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const priceFormat = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const dateFormat = new Intl.DateTimeFormat('fi-FI', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const formatValue = (value: number | null, formatter: Intl.NumberFormat) =>
  value === null ? (
    <span aria-label="Not available">—</span>
  ) : (
    formatter.format(value)
  );

interface Props {
  rows: DailyStatistic[];
  sortBy: SortColumn;
  sortOrder: 'asc' | 'desc';
  onSort: (column: SortColumn) => void;
}

export const StatisticsTable = ({ rows, sortBy, sortOrder, onSort }: Props) => (
  <div
    className={styles.tableScroll}
    tabIndex={0}
    role="region"
    aria-label="Daily statistics table, scroll horizontally on small screens"
  >
    <Table className={styles.table} aria-label="Daily electricity statistics">
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column.key}
              scope="col"
              sortDirection={sortBy === column.key ? sortOrder : false}
              className={
                sortBy === column.key ? styles.sortedHeading : undefined
              }
            >
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onSort(column.key)}
                aria-label={`Sort by ${column.label.toLowerCase()}`}
              >
                <span>
                  {column.label}
                  <span className={styles.columnUnit}>{column.unit}</span>
                </span>
                <span className={styles.sortIndicator} aria-hidden="true">
                  {sortBy === column.key
                    ? sortOrder === 'asc'
                      ? '↑'
                      : '↓'
                    : '↕'}
                </span>
              </button>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.date}>
            <TableCell component="th" scope="row" className={styles.dateCell}>
              <time dateTime={row.date}>
                {dateFormat.format(new Date(`${row.date}T00:00:00Z`))}
              </time>
            </TableCell>

            <TableCell>
              {formatValue(
                row.totalConsumption === null
                  ? null
                  : row.totalConsumption / 1000,
                energyFormat,
              )}
            </TableCell>

            <TableCell>
              {formatValue(row.totalProduction, energyFormat)}
            </TableCell>

            <TableCell>
              <span
                className={
                  row.averagePrice !== null && row.averagePrice < 0
                    ? styles.negativePrice
                    : undefined
                }
              >
                {formatValue(row.averagePrice, priceFormat)}
              </span>
            </TableCell>

            <TableCell>
              <span
                className={
                  row.longestNegativePriceStreak > 0 ? styles.streak : undefined
                }
              >
                {row.longestNegativePriceStreak}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
