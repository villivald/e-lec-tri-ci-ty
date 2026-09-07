import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('table', { name: 'Daily electricity statistics' }),
  ).toBeVisible();
});

test('filters, sorts, paginates, and returns from a day with list state preserved', async ({
  page,
}) => {
  await page.getByLabel('Search dates').fill('2024-05');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.getByRole('status')).toHaveText('31 matching days');

  await page.getByLabel('Rows per page').selectOption('10');
  await expect(page.getByText('Showing 1–10 of 31 days')).toBeVisible();
  await page.getByRole('button', { name: 'Sort by date', exact: true }).click();
  await expect(page.locator('tbody time').first()).toHaveAttribute(
    'datetime',
    '2024-05-01',
  );
  await page.getByRole('button', { name: 'Sort by date', exact: true }).click();
  await expect(page.locator('tbody time').first()).toHaveAttribute(
    'datetime',
    '2024-05-31',
  );

  await page.getByRole('button', { name: 'Go to page 2', exact: true }).click();
  await expect(page.getByText('Showing 11–20 of 31 days')).toBeVisible();
  const dateButton = page.getByRole('button', {
    name: '21.05.2024',
    exact: true,
  });
  const row = page.getByRole('row').filter({ has: dateButton });
  const consumption = await row.getByRole('cell').first().innerText();
  await dateButton.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('Daily statistics · 21.05.2024');
  await expect(dialog.locator('dd').first()).toHaveText(`${consumption} MWh`);
  await expect(
    dialog.getByRole('heading', { name: 'Cheapest hours' }),
  ).toBeVisible();

  const energyChart = dialog.getByLabel(
    'Hourly consumption and production in MWh',
    { exact: true },
  );
  const priceChart = dialog.getByLabel(
    'Hourly electricity price in cents per kWh',
    { exact: true },
  );
  await expect(energyChart).toBeVisible();
  await expect(priceChart).toBeVisible();

  // MUI exposes keyboard data navigation through a focusable accessibility proxy.
  await energyChart.locator('[tabindex="0"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tooltip')).toContainText('MWh');

  await dialog.getByRole('button', { name: 'Back to daily overview' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByLabel('Search dates')).toHaveValue('2024-05');
  await expect(page.getByLabel('Rows per page')).toHaveValue('10');
  await expect(page.getByText('Showing 11–20 of 31 days')).toBeVisible();
  await expect(dateButton).toBeFocused();
});

test('clears empty results and retries a failed request', async ({ page }) => {
  await page.getByLabel('Search dates').fill('1900');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(
    page.getByRole('heading', { name: 'No days found' }),
  ).toBeVisible();
  await page.locator('button[form="statistics-filters"]').click();
  await expect(page.getByLabel('Search dates')).toHaveValue('');
  await expect(page.getByRole('table')).toBeVisible();

  // Only the outage is simulated; retry must reach the real backend/database.
  await page.route('**/api/daily-statistics?*', (route) =>
    route.fulfill({
      status: 500,
      json: { message: 'Simulated outage' },
    }),
  );
  await page.getByLabel('Search dates').fill('2024-05');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'We couldn’t load the statistics',
  );
  await page.unroute('**/api/daily-statistics?*');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('status')).toHaveText('31 matching days');
  await expect(page.getByRole('table')).toBeVisible();
});
