import { lazy, Suspense } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from '@mui/material';

import { useApiData } from '../../hooks/useApiData';
import { type DailyStatistic } from './useDailyStatistics';
import { dateFormat, energyFormat, priceFormat } from './formatters';
import commonStyles from './DailyStatistics.module.css';
import styles from './DayDetailsDialog.module.css';

export interface HourlyReading {
  id: number;
  startTime: string;
  consumptionAmount: number | null;
  productionAmount: number | null;
  hourlyPrice: number | null;
  consumptionProductionGapMwh: number | null;
}

const HourlyCharts = lazy(() => import('./HourlyCharts'));

interface DayDetails extends DailyStatistic {
  hours: HourlyReading[];
  cheapestHours: HourlyReading[];
  largestConsumptionGapHour: HourlyReading | null;
}

const measurement = (
  value: number | null,
  format: Intl.NumberFormat,
  unit: string,
) => (value === null ? 'Not available' : `${format.format(value)} ${unit}`);

// These timestamps have no timezone. Display the supplied one-hour intervals.
const hourRange = (startTime: string) => {
  const endHour = String(Number(startTime.slice(11, 13)) + 1).padStart(2, '0');
  return `${startTime.slice(11, 16)}–${endHour}:${startTime.slice(14, 16)}`;
};

export const DayDetailsDialog = ({
  date,
  onClose,
}: {
  date: string;
  onClose: () => void;
}) => {
  const isSmallScreen = useMediaQuery('(width < 40rem)');
  const { data, error, status, loading, retry } = useApiData<{
    data: DayDetails;
  }>(`/api/daily-statistics/${encodeURIComponent(date)}`);
  const day = data?.data;
  const gap = day?.largestConsumptionGapHour;

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isSmallScreen}
      aria-labelledby="day-details-title"
      slotProps={{ paper: { className: styles.paper } }}
    >
      <DialogTitle id="day-details-title" className={styles.title}>
        Daily statistics · {dateFormat.format(new Date(`${date}T00:00:00Z`))}
      </DialogTitle>
      <DialogContent className={styles.content} aria-busy={loading}>
        {loading ? (
          <div className={commonStyles.state}>
            <CircularProgress color="inherit" size={24} aria-hidden="true" />
            <p role="status">Loading day details…</p>
          </div>
        ) : error ? (
          <div className={commonStyles.state}>
            <p role="alert">{error}</p>
            {status !== 404 && status !== 400 && (
              <Button onClick={retry} className={commonStyles.primaryButton}>
                Try again
              </Button>
            )}
          </div>
        ) : (
          day && (
            <>
              <dl className={styles.summary}>
                <div>
                  <dt>Total consumption</dt>
                  <dd>
                    {measurement(
                      day.totalConsumption === null
                        ? null
                        : day.totalConsumption / 1000,
                      energyFormat,
                      'MWh',
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Total production</dt>
                  <dd>
                    {measurement(day.totalProduction, energyFormat, 'MWh')}
                  </dd>
                </div>
                <div>
                  <dt>Average price</dt>
                  <dd>{measurement(day.averagePrice, priceFormat, 'c/kWh')}</dd>
                </div>
                <div>
                  <dt>Longest negative-price streak</dt>
                  <dd>
                    {day.longestNegativePriceStreak}{' '}
                    {day.longestNegativePriceStreak === 1 ? 'hour' : 'hours'}
                  </dd>
                </div>
              </dl>

              <Suspense fallback={<p role="status">Loading charts…</p>}>
                <HourlyCharts hours={day.hours} />
              </Suspense>

              <section
                className={styles.highlight}
                aria-labelledby="cheapest-hours-title"
              >
                <h3 id="cheapest-hours-title">Cheapest hours</h3>
                {day.cheapestHours.length > 0 ? (
                  <ul className={styles.hours}>
                    {day.cheapestHours.map((hour) => (
                      <li key={hour.id}>
                        <time dateTime={hour.startTime}>
                          {hourRange(hour.startTime)}
                        </time>
                        <strong>
                          {measurement(hour.hourlyPrice, priceFormat, 'c/kWh')}
                        </strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No price readings are available for this day.</p>
                )}
              </section>

              <section
                className={styles.highlight}
                aria-labelledby="consumption-gap-title"
              >
                <h3 id="consumption-gap-title">
                  Largest consumption–production gap
                </h3>
                {gap && gap.consumptionProductionGapMwh !== null ? (
                  <>
                    <p className={styles.gap}>
                      <time dateTime={gap.startTime}>
                        {hourRange(gap.startTime)}
                      </time>
                      <strong>
                        {measurement(
                          gap.consumptionProductionGapMwh,
                          energyFormat,
                          'MWh',
                        )}
                      </strong>
                    </p>
                    <p>
                      Consumption:{' '}
                      {measurement(
                        gap.consumptionAmount === null
                          ? null
                          : gap.consumptionAmount / 1000,
                        energyFormat,
                        'MWh',
                      )}
                      {' · '}Production:{' '}
                      {measurement(gap.productionAmount, energyFormat, 'MWh')}
                    </p>
                  </>
                ) : (
                  <p>No hour has both consumption and production readings.</p>
                )}
              </section>
            </>
          )
        )}
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={onClose} className={commonStyles.primaryButton}>
          Back to daily overview
        </Button>
      </DialogActions>
    </Dialog>
  );
};
