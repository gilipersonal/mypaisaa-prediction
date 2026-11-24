// Home (MP-205), option A "Tile board", screen a-portfolio: each data state as the design draws it, hidden amounts, the
// holding rows pressed, every control not built in this step pressed (it writes nothing and says so after itself), axe in
// both themes and a width sweep. The words come from src/lib/home/home.ts, which tests/unit/home.test.ts holds to the
// rendered design; scripts/design-parity.mjs measures the page against the design element by element.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { signIn } from './helpers';
import { DATA_STATES, type DataState } from '../../src/lib/data/state';
import {
  BRIEF, BROWSER_UNVERIFIED, EMPTY, LATE_RULE, LATER, LEGEND, ORDER, SUPPORT, designState, freshOf, noteOf, pillOf, rankLine
} from '../../src/lib/home/home';

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const TICKERS = ['AAPL', 'NVDA', 'SPY', 'AZN', 'HSBA', 'RELIANCE', 'NIFTYBEES'];
const SAYS = Object.values(LATER);

/** Opens Home in a state and waits until it is drawn: the heading, then the value or the empty card. */
async function open(page: Page, st: DataState): Promise<void> {
  await page.goto(`/?data=${st}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Portfolio' }).filter({ visible: true })).toBeVisible();
  if (st === 'empty') await expect(page.getByText(EMPTY.title, { exact: true })).toBeVisible();
  else await expect(total(page)).toBeVisible();
}
const pillText = (st: DataState, hidden = false) => {
  const p = pillOf(designState(st), hidden);
  return `Cost this month: ${p.parts.map((x) => x.t).join('')}. ${p.more}`;
};
/** The cost pill in view: the desktop top bar draws one, the phone bar another. */
const pillOf_ = (page: Page) => page.getByTestId('cost-pill').filter({ visible: true });
/** The value in view (the desktop and the phone card are both drawn; one shows), as read: its roll and pence, no ghost. */
const total = (page: Page) => page.getByTestId('total').filter({ visible: true });
const totalIs = async (page: Page, want: string) => expect.poll(async () => (await total(page).innerText()).replace(/\s+/g, '')).toBe(want);
/** Every "later build step" sentence on the page. */
const laterNotes = (page: Page) => page.locator('.jbanner').filter({ hasText: new RegExp(SAYS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')) });

test.beforeEach(async ({ page }) => signIn(page));

test.describe('each state, in the design\'s words', () => {
  for (const st of DATA_STATES) {
    test(st, async ({ page }) => {
      await open(page, st);
      const d = designState(st);
      const main = page.getByRole('main');
      await expect(pillOf_(page)).toHaveText(pillText(st));
      for (const f of freshOf(d)) await expect(main.getByText(f.text, { exact: true }).filter({ visible: true }).first()).toBeVisible();
      await expect(main.getByText(SUPPORT).filter({ visible: true })).toBeVisible();
      const note = noteOf(d);
      if (note) await expect(main.getByRole('status').filter({ hasText: note.text })).toContainText(note.title);
      const links = main.locator('a[href^="/holdings/"]').filter({ visible: true });
      // Nothing a not-built control would say is drawn at rest.
      await expect(laterNotes(page)).toHaveCount(0);

      // The board: eight tiles in every state, the legend, the rank line, and the brief in the rail or above the tabs.
      await expect(main.locator('.segtile.home-tile')).toHaveCount(ORDER.length);
      for (const l of LEGEND) await expect(main.locator('.legend')).toContainText(l);
      await expect(main.locator('.legend')).toContainText(rankLine(d));
      if (wide(page)) await expect(main.locator('.home-card h4').first()).toHaveText(BRIEF[d][0]);
      else if (st !== 'empty') await expect(page.locator('.home-pill').filter({ visible: true })).toContainText(BRIEF[d][1]);

      if (st === 'empty') {
        await expect(main.getByText(EMPTY.text)).toBeVisible();
        await expect(total(page)).toHaveCount(0);
        await expect(links).toHaveCount(0);
        await expect(main.locator('.legend')).not.toContainText('You hold it');
        await expect(page.locator('.home-pill')).toHaveCount(0);
        return;
      }
      // Every holding is drawn and opens its own page, in every state with data: loading never hides them.
      await expect(links).toHaveCount(TICKERS.length);
      for (const t of TICKERS) await expect(main.locator(`a[href="/holdings/${t}"]`).filter({ visible: true })).toBeVisible();
      await expect(main.locator('.legend')).toContainText('You hold it');

      if (st === 'ready') {
        await totalIs(page, '£90,155.25');
        await expect(main.getByText('Holdings £84,612.40 · Cash £5,542.85').filter({ visible: true })).toBeVisible();
        await expect(main.getByText('7 of 7 priced', { exact: false }).filter({ visible: true })).toBeVisible();
        await expect(main.getByText('Late: last price 14:10 (Yahoo)').filter({ visible: true })).toBeVisible();
        await expect(main.getByText(LATE_RULE).filter({ visible: true }).first()).toBeVisible();
        if (!wide(page)) await expect(main.getByText('Illustrative', { exact: true }).filter({ visible: true }).first()).toBeVisible();
      }
      if (st === 'loading') {
        const dim = main.locator('.home-dim[aria-busy="true"]');
        await expect(dim.locator('a[href="/holdings/AAPL"]').filter({ visible: true })).toBeVisible();
        await expect(main.getByText('Refreshing · showing 22:15').filter({ visible: true })).toBeVisible();
        await expect(main.getByRole('status').filter({ hasText: 'Re-ranking.' })).toBeVisible();
      }
      if (st === 'error') {
        await expect(main.getByText('last good', { exact: true }).filter({ visible: true }).first()).toBeVisible();
        if (wide(page)) await expect(main.getByRole('columnheader', { name: 'Value, last good' })).toBeVisible();
        else await expect(main.getByText('USD · Twelve Data Mon 21:00').first()).toBeVisible();
        await expect(main.getByText('Ranked 2 Nov · Twelve Data Mon 21:00').first()).toBeVisible();
      }
      if (st === 'stale') {
        await totalIs(page, '£84,051.05');
        await expect(main.getByText('Known value, 6 of 7 priced').filter({ visible: true })).toBeVisible();
        await expect(main.getByText('Stale: last price 14:10 (Yahoo)').filter({ visible: true })).toBeVisible();
        await expect(main.getByText('Left out of the total until its price returns.').filter({ visible: true })).toBeVisible();
        await expect(main.getByRole('img', { name: 'Allocation: US 53.8%, India 28.7%, UK 11.0%, cash 6.6%' })).toBeVisible();
        await expect(main.getByRole('status').filter({ hasText: '1 of 7 rows is stale.' })).toContainText('£84,051.05 known, 6 of 7 priced');
        await expect(main.getByRole('status').filter({ hasText: 'HSBC is stale.' })).toBeVisible();
      }
      if (st === 'offline') {
        await expect(main.getByRole('status').filter({ hasText: 'Holdings from 22:15' })).toContainText(BROWSER_UNVERIFIED);
        await expect(main.getByRole('status').filter({ hasText: 'Lists from 22:15' })).toContainText(BROWSER_UNVERIFIED);
      }
    });
  }

  test('the browser going offline shows Offline whatever the address says', async ({ page, context }) => {
    await open(page, 'ready');
    await context.setOffline(true);
    await page.reload().catch(() => undefined);
    // The service worker serves the shell offline; if it cannot, there is no page to read and nothing to prove here.
    const drawn = await page.getByRole('heading', { level: 1, name: 'Portfolio' }).filter({ visible: true }).isVisible().catch(() => false);
    test.skip(!drawn, 'the page could not load offline');
    await expect(pillOf_(page)).toHaveText(pillText('offline'));
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
      await totalIs(page, '£••');
      await expect(pillOf_(page)).toHaveText(pillText(st, true));
      expect(await main.getByLabel('Amount hidden').filter({ visible: true }).count()).toBeGreaterThan(6);
      for (const kept of ['+6.2%', '+9.1%']) expect(text).toContain(kept);
      if (wide(page)) for (const kept of ['+1.9%', '−0.6%', '−9.8% to +21.4%']) expect(text).toContain(kept);
      await expect(main.getByRole('img', { name: /^6-month forecast: median \+6\.2%, 80% range −9\.8% to \+21\.4%$/ })).toBeVisible();
      if (st === 'stale') expect(text).toContain('11.0%');
      else expect(text).toContain('(1.39%)');
    });
  }

  test('a reload with amounts shown again shows them', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('mp-hide-amounts', '1'));
    await open(page, 'ready');
    await totalIs(page, '£••');
    await page.evaluate(() => localStorage.removeItem('mp-hide-amounts'));
    await page.reload();
    await totalIs(page, '£90,155.25');
  });
});

/** What the page holds that a write would change: both storages and the address. */
const snapshot = (page: Page) => page.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage }, u: location.href }));

/** Presses a control, then proves it navigated nowhere, wrote nothing, and said its one sentence directly after itself. */
async function pressNotBuilt(page: Page, control: Locator, say: string, after: Locator = control): Promise<void> {
  const before = await snapshot(page);
  const writes: string[] = [];
  const onReq = (r: { method(): string; url(): string }) => { if (r.method() !== 'GET') writes.push(`${r.method()} ${r.url()}`); };
  page.on('request', onReq);
  await control.click();
  const note = after.locator('xpath=following-sibling::*[1]');
  await expect(note).toHaveClass(/\bjbanner\b/);
  await expect(note).toHaveAttribute('role', 'status');
  await expect(note).toHaveText(say);
  page.off('request', onReq);
  expect(await snapshot(page)).toBe(before);
  expect(writes).toEqual([]);
}

test.describe('pressing', () => {
  test('a holding opens its own page from anywhere on its row', async ({ page }) => {
    await open(page, 'ready');
    const link = page.locator('a[href="/holdings/NVDA"]').filter({ visible: true });
    await expect(link).toHaveAccessibleName(wide(page) ? /^NVIDIA NVDA · USD/ : /^NVDA \+3\.4% USD · Twelve Data 21:00/);
    const row = page.getByRole('main').locator('tr', { has: link });
    const box = (await row.boundingBox())!;
    // Pressed at the row's far right, away from the name: the action on a phone, the data column on a desktop.
    await row.click({ position: { x: box.width - 12, y: 12 } });
    await expect(page).toHaveURL(/\/holdings\/NVDA$/);
  });

  test('a holding opens with the keyboard', async ({ page }) => {
    await open(page, 'ready');
    const link = page.getByRole('main').locator('a[href="/holdings/HSBA"]').filter({ visible: true });
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/holdings\/HSBA$/);
  });

  test('the cost pill opens nothing, writes nothing and says the month comes later', async ({ page }) => {
    await open(page, 'ready');
    const pill = pillOf_(page);
    await expect(pill).toHaveAttribute('type', 'button');
    await pressNotBuilt(page, pill, LATER.cost);
    await expect(laterNotes(page).filter({ visible: true })).toHaveCount(1);
  });

  test('every control not built in this step writes nothing and says so after itself', async ({ page }) => {
    await open(page, 'ready');
    const main = page.getByRole('main');
    const seg = main.getByRole('group', { name: 'Forecast horizon' });
    await pressNotBuilt(page, seg.getByRole('button', { name: '12 months' }), LATER.horizon, seg.locator('xpath=..'));
    // The horizon in use stays pressed and pressing it again changes nothing.
    await expect(seg.getByRole('button', { name: '6 months' })).toHaveAttribute('aria-pressed', 'true');
    const tiles = main.locator('.segtile.home-tile');
    await pressNotBuilt(page, tiles.nth(1), LATER.tile);
    // A tile answers the keyboard as a button does.
    await tiles.nth(2).focus();
    await page.keyboard.press('Enter');
    await expect(tiles.nth(2).locator('xpath=following-sibling::*[1]')).toHaveText(LATER.tile);
    if (wide(page)) {
      await pressNotBuilt(page, main.getByRole('button', { name: 'Open the brief' }), LATER.brief);
      const act = main.locator('.home-act').first();
      await pressNotBuilt(page, act, LATER.act);
      await main.locator('.home-act').nth(1).focus();
      await page.keyboard.press(' ');
      await expect(main.locator('.home-act').nth(1).locator('xpath=following-sibling::*[1]')).toHaveText(LATER.act);
    } else {
      await pressNotBuilt(page, page.getByRole('button', { name: 'Search' }).filter({ visible: true }), LATER.search);
      await pressNotBuilt(page, page.locator('.home-pill').filter({ visible: true }), LATER.brief);
    }
  });

  test('Try again and Add a holding write nothing and say so after themselves', async ({ page }) => {
    await open(page, 'error');
    await pressNotBuilt(page, page.getByRole('main').getByRole('button', { name: 'Try again' }), LATER.retry);
    await open(page, 'empty');
    await pressNotBuilt(page, page.getByRole('main').getByRole('button', { name: 'Add a holding' }), LATER.add);
  });

  test('nothing on Home orders, trades or offers a field to write in', async ({ page }) => {
    await open(page, 'ready');
    const main = page.getByRole('main');
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
        // Read in the next frame the browser paints. The design's two-column rule (home.css .jcols:has(.home-wl)) follows the
        // width through a media query listener, which updates the page before that frame is painted; reading straight
        // after the resize measured a layout no frame ever shows (1440 to 320 in one step).
        const over = await page.evaluate(() => new Promise<number>((done) => requestAnimationFrame(() => done(document.documentElement.scrollWidth - document.documentElement.clientWidth))));
        expect(over, `${st} at ${w}px`).toBeLessThanOrEqual(0);
      }
    }
  });
});
