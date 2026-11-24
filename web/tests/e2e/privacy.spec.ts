import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signIn, overflowX } from './helpers';

// The privacy centre (MP-205, Privacy option A "One privacy centre", the screen privacy-a-centre).
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const nav = (page: Page) => page.getByRole('navigation', { name: wide(page) ? 'Places' : 'Tabs' });
const hide = (page: Page) => page.getByRole('switch', { name: 'Hide amounts' });
const SHOWN = '£90,155.25';
const MASKED = '£••';
// Home draws its value card for a desktop and for a phone and shows one; the figure is the design's roll, read as drawn
const total = (page: Page) => page.getByTestId('total').filter({ visible: true }).first();
const totalIs = (page: Page, want: string) => expect.poll(async () => (await total(page).innerText()).replace(/\s+/g, '')).toBe(want);

async function openCentre(page: Page) {
  await page.goto('/settings/privacy');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy');
}

/** Goes to Portfolio by its own link, so the page is not reloaded. */
async function toPortfolio(page: Page) {
  await nav(page).getByRole('link', { name: /^Portfolio( \d|$)/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Portfolio');
}

test.beforeEach(async ({ page }) => signIn(page));

test('Settings reaches the privacy centre, and the centre goes back to Settings', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  await page.getByRole('main').getByRole('link', { name: /^Privacy/ }).click();
  await expect(page).toHaveURL(/\/settings\/privacy$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy');
  await page.getByRole('link', { name: 'Back to Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
});

test('Hide amounts masks the sample total at once and after a reload, and pressing again shows it', async ({ page }) => {
  await page.goto('/');
  await totalIs(page, SHOWN);

  // To the centre without a reload, so Portfolio's total is pressed on with the app already drawn (lesson 50).
  await nav(page).getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('main').getByRole('link', { name: /^Privacy/ })).toContainText('Hide amounts: Off');
  await page.getByRole('main').getByRole('link', { name: /^Privacy/ }).click();
  await expect(hide(page)).toHaveAttribute('aria-checked', 'false');

  const sent: string[] = [];
  page.on('request', (r) => sent.push(`${r.method()} ${r.url()}`));
  await hide(page).click();
  await expect(hide(page)).toHaveAttribute('aria-checked', 'true');
  await expect(hide(page)).toBeFocused();
  await expect(page.getByText('Amounts hidden. Money and units are masked. Percentages and ranges stay visible. Tap to show for 30 seconds.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('mp-hide-amounts'))).toBe('1');
  expect(sent, 'the switch writes nothing to any server').toEqual([]);

  await toPortfolio(page);
  await totalIs(page, MASKED);
  await expect(total(page).getByLabel('Amount hidden')).toBeVisible();
  await expect(page.getByText(SHOWN)).toHaveCount(0);

  await page.reload();
  await totalIs(page, MASKED);

  // After the reload, the switch reads the kept choice, and a second press shows amounts again.
  await openCentre(page);
  await expect(hide(page)).toHaveAttribute('aria-checked', 'true');
  await hide(page).click();
  await expect(hide(page)).toHaveAttribute('aria-checked', 'false');
  await expect(hide(page)).toBeFocused();
  await expect(page.getByText('Hide amounts masks money and units, and percentages stay.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('mp-hide-amounts'))).toBeNull();
  await toPortfolio(page);
  await totalIs(page, SHOWN);
  await page.reload();
  await totalIs(page, SHOWN);
});

test('the switch works from the keyboard and keeps focus', async ({ page }) => {
  await openCentre(page);
  await hide(page).focus();
  await page.keyboard.press('Space');
  await expect(hide(page)).toHaveAttribute('aria-checked', 'true');
  await expect(hide(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(hide(page)).toHaveAttribute('aria-checked', 'false');
  await expect(hide(page)).toBeFocused();
});

test('the less private options, phone notifications and notices never change anything, and say their act comes later', async ({ page }) => {
  await openCentre(page);
  const sent: string[] = [];
  page.on('request', (r) => sent.push(`${r.method()} ${r.url()}`));
  const stored = () => page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));
  const before = await stored();
  // the five switches the design draws, and only Hide amounts turns
  await expect(page.getByRole('switch')).toHaveCount(5);
  for (const name of ['Holding names on the lock screen', 'Holdings in widgets', 'Values in shared content']) {
    const sw = page.getByRole('switch', { name });
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await sw.click();
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await sw.press('Space');
    await expect(sw).toHaveAttribute('aria-checked', 'false');
  }
  await expect(page.getByRole('status').filter({ hasText: 'Turning this on comes in a later build step.' })).toHaveCount(3);
  const phone = page.getByRole('switch', { name: 'Phone notifications' });
  await expect(phone).toHaveAttribute('aria-checked', 'true');
  await phone.click();
  await expect(phone).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('status').filter({ hasText: 'Changing phone notifications comes in a later build step.' })).toBeVisible();
  const notice = page.getByRole('button', { name: /Morning brief/ });
  await notice.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Opening a notice comes in a later build step.' })).toBeVisible();
  await expect(hide(page)).toHaveAttribute('aria-checked', 'false');
  expect(await stored(), 'nothing is kept by a press').toBe(before);
  expect(sent, 'nothing is sent by a press').toEqual([]);
  await expect(page.getByText(/turning one on asks for a fresh sign-in/)).toHaveCount(0);
  // Devices, your data and deleting are not on this page.
  for (const gone of ['Devices and sessions', 'Your data', 'Delete']) await expect(page.getByRole('main').getByText(gone, { exact: true })).toHaveCount(0);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`the privacy centre passes axe WCAG 2.2 A and AA in ${scheme}, with amounts shown and hidden`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await openCentre(page);
    await page.waitForLoadState('networkidle');
    for (const pressed of [false, true]) {
      if (pressed) await hide(page).click();
      await expect(hide(page)).toHaveAttribute('aria-checked', String(pressed));
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(r.passes.length, 'axe ran no checks').toBeGreaterThan(0);
      expect(r.violations.map((v) => `${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    }
  });
}

test('the privacy centre and Settings never scroll sideways from 320 to 1440', async ({ page }) => {
  test.setTimeout(300_000); // a whole sweep on a slow CI runner (lesson 55)
  test.skip(wide(page), 'one sweep is enough; it sets its own widths');
  for (const [path, label] of [['/settings/privacy', 'Privacy'], ['/settings', 'Settings']] as const) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(label);
    for (let w = 320; w <= 1440; w += 8) {
      await page.setViewportSize({ width: w, height: 800 });
      const over = await overflowX(page);
      expect(over, `${path} at ${w}px`).toBeLessThanOrEqual(0);
    }
  }
});
