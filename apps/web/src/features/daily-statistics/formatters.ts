export const energyFormat = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const priceFormat = new Intl.NumberFormat('fi-FI', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export const dateFormat = new Intl.DateTimeFormat('fi-FI', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});
