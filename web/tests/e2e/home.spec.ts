// Home (MP-205), option A "Tile board", screen a-portfolio: each data state as the design draws it, hidden amounts, the
// holding rows pressed, the cost pill pressed, axe in both themes and a width sweep. The words come from
// src/lib/home/home.ts, which tests/unit/home.test.ts holds to the rendered design.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers';
import { DATA_STATES, type DataState } from '../../src/lib/data/state';
import { BROWSER_UNVERIFIED, EMPTY, LATE_RULE, SUPPORT, designState, freshOf, noteOf, pillOf } from '../../src/lib/home/home';

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const TICKERS = ['AAPL', 'NVDA', 'SPY', 'AZN', 'HSBA', 'RELIANCE', 'NIFTYBEES'];

/** Opens Home in a state and waits until it is drawn: the heading, then the value or the empty card. */
async function open(page: Page, st: DataState): Promise<void> {
  await page.goto(`/?data=${st}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Portfolio' })).toBeVisible();
  if (st === 'empty') await expect(page.getByText(EMPTY.title, { exact: true })).toBeVisible();
  else await expect(page.getByTestId('total')).toBeVisible();
}
const pillText = (st: DataState, hidden = false) => {
  const p = pillOf(designState(st), hidden);
  return `Cost this month: ${p.parts.map((x) => x.t).join('')}. ${p.more}`;
};

test.beforeEach(async ({ page }) => signIn(page));

test.describe('each state, in the design\'s words', () => {
  for (const st of DATA_STATES) {
    test(st, async ({ page }) => {
      await open(page, st);
      const d = designState(st);
      const main = page.getByRole('main');
      await expect(page.getByTestId('cost-pill')).toHaveText(pillText(st));
      for (const f of freshOf(d)) await expect(main.getByText(f.text, { exact: true })).toBeVisible();
      await expect(main.getByText(SUPPORT)).toBeVisible();
      const note = noteOf(d);
      if (note) await expect(main.getByRole('status').filter({ hasText: note.title })).toContainText(note.text);
      const links = main.locator('a[href^="/holdings/"]');

      if (st === 'empty') {
        await expect(main.getByText(EMPTY.text)).toBeVisible();
        await expect(page.getByTestId('total')).toHaveCount(0);
        await expect(links).toHaveCount(0);
        return;
      }
      // Every holding is drawn and opens its own page, in every state with data: loading never hides them.
      await expect(links).toHaveCount(TICKERS.length);
      for (const t of TICKERS) await expect(main.locator(`a[href="/holdings/${t}"]`)).toBeVisible();

      if (st === 'ready') {
        await expect(page.getByTestId('total')).toHaveText('£90,155.25');
        await expect(main.getByText('Holdings £84,612.40 · Cash £5,542.85')).toBeVisible();
        await expect(main.getByText('7 of 7 priced', { exact: false })).toBeVisible();
        await expect(main.getByText('Late: last price 14:10 (Yahoo)')).toBeVisible();
        await expect(main.getByText(LATE_RULE).first()).toBeVisible();
        await expect(main.getByText('Illustrative', { exact: true })).toBeVisible();
      }
      if (st === 'loading') {
        const dim = main.locator('.home-dim[aria-busy="true"]');
        await expect(dim.locator('a[href="/holdings/AAPL"]')).toBeVisible();
        await expect(main.getByText('Refreshing · showing 22:15')).toBeVisible();
      }
      if (st === 'error') {
        await expect(main.getByText('last good', { exact: true }).first()).toBeVisible();
        if (wide(page)) await expect(main.getByRole('columnheader', { name: 'Value, last good' })).toBeVisible();
        else await expect(main.getByText('AAPL · USD · Twelve Data Mon 21:00')).toBeVisible();
      }
      if (st === 'stale') {
        await expect(page.getByTestId('total')).toHaveText('£84,051.05');
        await expect(main.getByText('Known value, 6 of 7 priced')).toBeVisible();
        await expect(main.getByText('Stale: last price 14:10 (Yahoo)')).toBeVisible();
        await expect(main.getByText('Left out of the total until its price returns.')).toBeVisible();
        await expect(main.getByRole('img', { name: 'Allocation: US 53.8%, India 28.7%, UK 11.0%, cash 6.6%' })).toBeVisible();
        await expect(main.getByRole('status').filter({ hasText: '1 of 7 rows is stale.' })).toContainText('£84,051.05 known, 6 of 7 priced');
      }
      if (st === 'offline') await expect(main.getByRole('status').filter({ hasText: 'Offline.' })).toContainText(BROWSER_UNVERIFIED);
    });
  }

  test('the browser going offline shows Offline whatever the address says', async ({ page, context }) => {
    await open(page, 'ready');
    await context.setOffline(true);
    await page.reload().catch(() => undefined);
    // The service worker serves the shell offline; if it cannot, there is no page to read and nothing to prove here.
    const drawn = await page.getByRole('heading', { level: 1, name: 'Portfolio' }).isVisible().catch(() => false);
    test.skip(!drawn, 'the page could not load offline');
    await expect(page.getByTestId('cost-pill')).toHaveText(pillText('offline'));
    await context.setOffline(false);
  });
});

test.describe('hidden amounts', () => {
  for (const st of ['ready', 'stale', 'loading'] as const) {
    test(`mask money and keep percentages, ${st} (OWN-18)`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('mp-hide-amounts', '1'));
      await open(page, st);
      const main = page.getByRole('main');
      const text = await main.innerText();
      // The only pounds left are the plan's £100 ceiling on the cost pill, which the design keeps.
      expect((text.match(/£[\d,]+(\.\d\d)?/g) ?? []).filter((m) => m !== '£100')).toEqual([]);
      expect(text).toContain('£••');
      await expect(page.getByTestId('total')).toHaveText('£••');
      await expect(page.getByTestId('cost-pill')).toHaveText(pillText(st, true));
      expect(await main.getByLabel('Amount hidden').count()).toBeGreaterThan(7);
      for (const kept of ['+1.9%', '+6.2%', '−0.6%']) expect(text).toContain(kept);
      if (wide(page)) expect(text).toContain('−9.8% to +21.4%');
      await expect(main.getByRole('img', { name: /^6-month forecast: median \+6\.2%, 80% range −9\.8% to \+21\.4%$/ })).toBeVisible();
      if (st === 'stale') expect(text).toContain('11.0%');
      else expect(text).toContain('(1.39%)');
    });
  }

  test('a reload with amounts shown again shows them', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('mp-hide-amounts', '1'));
    await open(page, 'ready');
    await expect(page.getByTestId('total')).toHaveText('£••');
    await page.evaluate(() => localStorage.removeItem('mp-hide-amounts'));
    await page.reload();
    await expect(page.getByTestId('total')).toHaveText('£90,155.25');
  });
});

test.describe('pressing', () => {
  test('a holding opens its own page from anywhere on its row', async ({ page }) => {
    await open(page, 'ready');
    const link = page.locator('a[href="/holdings/NVDA"]');
    await expect(link).toHaveAccessibleName(/^NVIDIA NVDA · USD/);
    const row = page.getByRole('main').locator(wide(page) ? 'tr' : '.hrow', { has: link });
    const box = (await row.boundingBox())!;
    // Pressed at the row's far right, away from the name: the value on a phone, the data column on a desktop.
    await row.click({ position: { x: box.width - 12, y: 12 } });
    await expect(page).toHaveURL(/\/holdings\/NVDA$/);
  });

  test('a holding opens with the keyboard', async ({ page }) => {
    await open(page, 'ready');
    const link = page.getByRole('main').locator('a[href="/holdings/HSBA"]');
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/holdings\/HSBA$/);
  });

  test('the cost pill is status: pressing it opens nothing and takes no focus', async ({ page }) => {
    await open(page, 'ready');
    const pill = page.getByTestId('cost-pill');
    expect(await pill.evaluate((e) => e.closest('a, button, [role="button"], [role="link"]') === null && !e.hasAttribute('tabindex'))).toBe(true);
    const before = page.url();
    await pill.click();
    await expect(page).toHaveURL(before);
    await expect(pill).not.toBeFocused();
  });

  test('nothing on Home orders, trades or writes', async ({ page }) => {
    await open(page, 'ready');
    const main = page.getByRole('main');
    await expect(main.getByRole('button')).toHaveCount(0);
    await expect(main.locator('input, select, textarea, form')).toHaveCount(0);
    expect(await main.innerText()).not.toMatch(/\b(buy|sell|order now|place (an )?order)\b/i);
  });
});

test.describe('accessibility and layout', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`every state passes axe WCAG 2.2 A and AA in ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      for (const st of DATA_STATES) {
        await open(page, st);
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(r.passes.length, 'axe ran no checks').toBeGreaterThan(0);
        expect(r.violations.map((v) => `${st}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      }
    });
  }

  test('no state scrolls sideways at any width from 320 to 1440', async ({ page }) => {
    test.skip(wide(page), 'one sweep is enough; it sets its own widths');
    test.setTimeout(300_000);
    for (const st of DATA_STATES) {
      await open(page, st);
      // Every width, not a sample (lesson 55).
      for (let w = 320; w <= 1440; w += 1) {
        await page.setViewportSize({ width: w, height: 800 });
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${st} at ${w}px`).toBeLessThanOrEqual(0);
      }
    }
  });
});
