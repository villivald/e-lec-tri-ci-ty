import { LineChart } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';

import { type HourlyReading } from './DayDetailsDialog';
import { energyFormat, priceFormat } from './formatters';
import styles from './HourlyCharts.module.css';

const axisFormat = new Intl.NumberFormat('fi-FI', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const HourlyCharts = ({ hours }: { hours: HourlyReading[] }) => {
  const readings = hours.flatMap((reading, index) => {
    // Source timestamps have no timezone; keep their original hour labels.
    const hour = Number(reading.startTime.slice(11, 13));
    const point = {
      hour,
      consumption:
        reading.consumptionAmount === null
          ? null
          : reading.consumptionAmount / 1000,
      production: reading.productionAmount,
      price: reading.hourlyPrice,
    };
    const previous = hours[index - 1];
    const previousHour = previous
      ? Number(previous.startTime.slice(11, 13))
      : hour;

    // Break the lines when an entire hourly record is absent, too.
    return hour - previousHour > 1
      ? [
          {
            hour: previousHour + 1,
            consumption: null,
            production: null,
            price: null,
          },
          point,
        ]
      : [point];
  });
  const hasEnergy = readings.some(
    ({ consumption, production }) =>
      consumption !== null || production !== null,
  );
  const hasPrices = readings.some(({ price }) => price !== null);
  const xAxis = [
    {
      dataKey: 'hour',
      scaleType: 'linear' as const,
      min: 0,
      max: 23,
      tickInterval: [0, 4, 8, 12, 16, 20, 23],
      valueFormatter: (hour: number) => `${String(hour).padStart(2, '0')}:00`,
    },
  ];

  return (
    <div className={styles.charts}>
      <section aria-labelledby="hourly-energy-title">
        <h3 id="hourly-energy-title">Hourly consumption and production</h3>
        {hasEnergy ? (
          <LineChart
            title="Hourly consumption and production in MWh"
            desc="Use left and right arrow keys for hours, and up and down for series. Missing readings are not plotted."
            dataset={readings}
            xAxis={xAxis}
            yAxis={[
              {
                label: 'MWh',
                min: 0,
                width: 65,
                valueFormatter: (value: number) => axisFormat.format(value),
              },
            ]}
            series={[
              {
                id: 'consumption',
                showMark: true,
                dataKey: 'consumption',
                label: 'Consumption',
                color: 'var(--color-text-strong)',
                curve: 'linear',
                valueFormatter: (value) =>
                  value === null
                    ? 'Not available'
                    : `${energyFormat.format(value)} MWh`,
              },
              {
                id: 'production',
                showMark: true,
                dataKey: 'production',
                label: 'Production',
                color:
                  'color-mix(in oklch, var(--color-accent-subtle) 50%, var(--color-text-strong))',
                curve: 'linear',
                valueFormatter: (value) =>
                  value === null
                    ? 'Not available'
                    : `${energyFormat.format(value)} MWh`,
              },
            ]}
            height={280}
            grid={{ horizontal: true }}
            skipAnimation
          />
        ) : (
          <p>No energy readings are available for this day.</p>
        )}
      </section>
      <section aria-labelledby="hourly-price-title">
        <h3 id="hourly-price-title">Hourly electricity price</h3>
        {hasPrices ? (
          <LineChart
            title="Hourly electricity price in cents per kWh"
            desc="Use left and right arrow keys to explore hourly prices. The dashed reference line marks zero."
            dataset={readings}
            xAxis={xAxis}
            yAxis={[
              {
                label: 'c/kWh',
                width: 65,
                valueFormatter: (value: number) => axisFormat.format(value),
              },
            ]}
            series={[
              {
                id: 'price',
                showMark: true,
                dataKey: 'price',
                label: 'Price',
                color: 'var(--color-text-strong)',
                curve: 'linear',
                valueFormatter: (value) =>
                  value === null
                    ? 'Not available'
                    : `${priceFormat.format(value)} c/kWh`,
              },
            ]}
            height={260}
            grid={{ horizontal: true }}
            hideLegend
            skipAnimation
          >
            <ChartsReferenceLine
              y={0}
              lineStyle={{
                stroke: 'var(--color-text)',
                strokeDasharray: '4 4',
              }}
            />
          </LineChart>
        ) : (
          <p>No price readings are available for this day.</p>
        )}
      </section>
    </div>
  );
};

export default HourlyCharts;
