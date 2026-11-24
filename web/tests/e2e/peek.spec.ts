import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers';

/*
 * Tap to show, option A, the owner's pick of 24 Nov 2026 (MP-205; docs/design/journeys/src/journeys/peek.js): with amounts
 * hidden, a press on a masked amount shows every amount on the screen for 30 seconds; Hide now, leaving the screen or the
 * app going to the background masks them again at once. Privacy mode stays on, and nothing is stored or sent.
 */
const SHOWN = '£90,155.25';
const total = (page: Page) => page.getByTestId('total').filter({ visible: true }).first();
const totalIs = (page: Page, want: string) => expect.poll(async () => (await total(page).innerText()).replace(/\s+/g, '')).toBe(want);
const heard = (page: Page) => page.locator('[role="status"].sr');
const showing = (page: Page) => page.getByText('Showing amounts.', { exact: true });
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

async function hidden(page: Page, path = '/') {
  await page.clock.install();
  await signIn(page);
  await page.evaluate(() => localStorage.setItem('mp-hide-amounts', '1'));
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
}

test('a press on the headline amount shows every amount for 30 seconds, then they hide again', async ({ page }) => {
  await hidden(page);
  await totalIs(page, '£••');
  const sent: string[] = [];
  page.on('request', (r) => { if (r.method() !== 'GET') sent.push(`${r.method()} ${r.url()}`); });
  await page.getByRole('button', { name: 'Amount hidden. Show amounts for 30 seconds' }).filter({ visible: true }).first().click();
  await totalIs(page, SHOWN);
  await expect(showing(page)).toBeVisible();
  await expect(page.getByText('They hide again in 30 seconds, or when you leave this screen.')).toBeVisible();
  await expect(heard(page)).toHaveText('Amounts showing for 30 seconds');
  await page.clock.runFor(6_000);
  await expect(page.getByText('They hide again in 24 seconds, or when you leave this screen.')).toBeVisible();
  await page.clock.runFor(25_000);
  await totalIs(page, '£••');
  await expect(showing(page)).toHaveCount(0);
  await expect(heard(page)).toHaveText('Amounts hidden again');
  // privacy mode stayed on throughout, and the tap wrote nothing anywhere
  expect(await page.evaluate(() => localStorage.getItem('mp-hide-amounts'))).toBe('1');
  expect(sent).toEqual([]);
});

test('the headline amount is a button from the keyboard too', async ({ page }) => {
  await hidden(page);
  const b = page.getByRole('button', { name: 'Amount hidden. Show amounts for 30 seconds' }).filter({ visible: true }).first();
  await b.focus();
  await page.keyboard.press('Enter');
  await totalIs(page, SHOWN);
});

test('leaving the screen hides them again at once', async ({ page }) => {
  await hidden(page);
  await page.getByRole('button', { name: 'Amount hidden. Show amounts for 30 seconds' }).filter({ visible: true }).first().click();
  await totalIs(page, SHOWN);
  // leave through the app itself, as a person does: no reload, so only the app can mask them again
  await page.getByRole('navigation', { name: wide(page) ? 'Places' : 'Tabs' }).getByRole('link', { name: /^Segments( \d|$)/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Segments' }).filter({ visible: true })).toBeVisible();
  await expect(showing(page)).toHaveCount(0);
  await expect(heard(page)).toHaveText('Amounts hidden again');
  await page.getByRole('navigation', { name: wide(page) ? 'Places' : 'Tabs' }).getByRole('link', { name: /^Portfolio( \d|$)/ }).click();
  await totalIs(page, '£••');
});

test('the app going to the background hides them again at once', async ({ page }) => {
  await hidden(page);
  await page.getByRole('button', { name: 'Amount hidden. Show amounts for 30 seconds' }).filter({ visible: true }).first().click();
  await totalIs(page, SHOWN);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await totalIs(page, '£••');
});

test('on Holdings a tap on a row\'s amount shows them all without opening the row, and the eye becomes Hide now', async ({ page }) => {
  await hidden(page, '/holdings');
  const row = page.getByTestId('row-AAPL').filter({ visible: true }).first();
  await row.getByText('••••').first().click();
  await expect(page).toHaveURL(/\/holdings$/);
  await expect(showing(page)).toBeVisible();
  const hide = wide(page)
    ? page.getByRole('button', { name: 'Hide now · 30 s' })
    : page.getByRole('button', { name: 'Hide now, 30 seconds left' });
  await expect(hide.filter({ visible: true }).first()).toBeVisible();
  await hide.filter({ visible: true }).first().click();
  await expect(showing(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Hide amounts' }).filter({ visible: true }).first()).toHaveAttribute('aria-pressed', 'true');
});

test('with amounts not hidden, nothing is a button and a press shows nothing new', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('button', { name: /Show amounts for 30 seconds/ })).toHaveCount(0);
  await totalIs(page, SHOWN);
});
