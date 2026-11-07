const { test, expect } = require('@playwright/test');

test('countries can disappear and reappear', async ({ page }) => {
  await page.goto('/');
  const countries = page.locator('.country');
  await expect(countries).toHaveCount(177);

  const switzerland = page.getByRole('button', { name: 'Switzerland', exact: true });
  await switzerland.click();
  await expect(switzerland).toHaveClass(/hidden/);
  await expect(page.getByRole('status')).toContainText('Switzerland disappeared');

  await switzerland.click({ force: true });
  await expect(switzerland).not.toHaveClass(/hidden/);
  await expect(page.getByRole('status')).toContainText('Switzerland is back');
});

test('show all restores hidden countries and state survives reload', async ({ page }) => {
  await page.goto('/');
  const france = page.getByRole('button', { name: 'France', exact: true });
  // France is a multipolygon, so keyboard activation avoids its Atlantic-centred bounding box.
  await france.press('Enter');
  await page.reload();
  await expect(france).toHaveClass(/hidden/);
  await page.getByRole('button', { name: 'Show all' }).click();
  await expect(page.locator('.country.hidden')).toHaveCount(0);
});

test('the full map fits inside the viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  const box = await page.locator('#map').boundingBox();
  const viewport = page.viewportSize();
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  await page.screenshot({ path: `test-results/${test.info().project.name}.png`, fullPage: true });
});
