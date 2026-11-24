import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers';

// Holdings, option A "Review desk" (MP-205): the list and one holding, viewing only, on sample data, drawn with the
// design's own markup. On desktop the list is the design's table and one holding is titled "One holding"; on a phone the
// list is rows and one holding is titled with its ticker.
const HOLDINGS = [
  ['AAPL', 'Apple', '£14,820.50'], ['NVDA', 'NVIDIA', '£11,402.10'], ['SPY', 'SPDR S&P 500 ETF Trust', '£18,960.00'],
  ['AZN', 'AstraZeneca', '£9,215.75'], ['HSBA', 'HSBC', '£6,104.20'], ['RELIANCE', 'Reliance', '£8,940.30'],
  ['NIFTYBEES', 'Nippon India Nifty 50 BeES', '£15,169.55']
] as const;
const main = (page: Page) => page.getByRole('main');
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const ready = (page: Page, title: string) => expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
/** One holding's title: "One holding" on desktop, its ticker on a phone (holdings.js, a-one). */
const readyOne = (page: Page, ticker: string) => ready(page, wide(page) ? 'One holding' : ticker);
const rows = (page: Page) => page.locator('[data-testid^="row-"]');
/** A row's value as the screen writes it: whole pounds in the desktop table, pounds and pence in a phone row. */
const shownValue = (page: Page, v: string) => (wide(page) ? v.split('.')[0]! : v);

test.beforeEach(async ({ page }) => signIn(page));

test.describe('the list', () => {
  test('shows all seven holdings, the total with its parts, and the way back to Portfolio', async ({ page }) => {
    await page.goto('/holdings');
    await ready(page, 'Holdings');
    await expect(rows(page)).toHaveCount(7);
    const card = page.getByTestId('value-card');
    await expect(card).toContainText('£90,155.25');
    await expect(card).toContainText('Holdings £84,612.40 · Cash £5,542.85');
    await expect(card).toContainText('As of 22:15 London · cutoffs US 22:00, UK 17:35, India 11:00');
    await expect(page.getByTestId('gain')).toHaveText('+£14,410.45');
    for (const [t, , v] of HOLDINGS) await expect(page.getByTestId(`row-${t}`)).toContainText(shownValue(page, v));
    const apple = page.getByTestId('row-AAPL');
    await expect(apple.getByRole('img', { name: '6-month forecast: median +6.2%, 80% range −9.8% to +21.4%' })).toBeVisible();
    if (wide(page)) {
      await expect(apple).toContainText('+6.2%');
      await expect(apple).toContainText('−9.8% to +21.4%');
      await expect(page.getByRole('columnheader')).toHaveText(['Holding', 'Value', 'Gain', 'Return', '6-month forecast', 'Evidence']);
    } else {
      await expect(apple).toContainText('+6.2% · 6M');
      await expect(apple.locator('.badge')).toHaveText('Hold');
    }
    await expect(main(page)).toContainText('Decision support: each holding gives the reasons for its action, and forecast ranges are 80%. MyPrediction never places a trade.');
    await main(page).getByRole('link', { name: 'Back to Portfolio' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('a press on a row opens its holding, and back returns to the list (lesson 32)', async ({ page }) => {
    await page.goto('/holdings');
    await ready(page, 'Holdings');
    for (const [t, name] of [HOLDINGS[1], HOLDINGS[4]]) {
      // press the row itself, away from the name: the whole row is the target
      const row = page.getByTestId(`row-${t}`);
      await row.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      const box = (await row.boundingBox())!;
      await page.mouse.click(box.x + box.width - 24, box.y + box.height - 12);
      await expect(page).toHaveURL(new RegExp(`/holdings/${t}$`));
      await readyOne(page, t);
      await expect(page.getByTestId('holding-card')).toContainText(name);
      await expect(main(page)).toBeFocused();
      await page.goBack();
      await expect(page).toHaveURL(/\/holdings$/);
      await ready(page, 'Holdings');
      await expect(rows(page)).toHaveCount(7);
    }
    // and by keyboard: each row's link opens it
    await page.getByRole('link', { name: /^Apple/ }).focus();
    await page.keyboard.press('Enter');
    await readyOne(page, 'AAPL');
    await main(page).getByRole('link', { name: 'Back to Holdings' }).click();
    await ready(page, 'Holdings');
  });

  test('Imports opens from the bar and from the rail, and nothing else on the way writes', async ({ page }) => {
    await page.goto('/holdings');
    await ready(page, 'Holdings');
    const toImports = main(page).getByRole('link', { name: /1 import is being read · 1 difference open/ });
    await expect(toImports).toHaveAttribute('href', '/imports');
    await expect(main(page).getByRole('link', { name: 'Imports', exact: true })).toHaveAttribute('href', '/imports');
    await main(page).getByRole('link', { name: 'Imports', exact: true }).click();
    await expect(page).toHaveURL(/\/imports$/);
  });

  test('on a phone the place lit is Portfolio', async ({ page }) => {
    test.skip(wide(page), 'phone only');
    for (const path of ['/holdings', '/holdings/AAPL']) {
      await page.goto(path);
      await expect(page.getByRole('navigation', { name: 'Tabs' }).locator('[aria-current="page"]')).toHaveText('Portfolio');
    }
  });
});

test.describe('each holding', () => {
  for (const [t, name, value] of HOLDINGS) {
    test(`${t} opens with its value, units, as-of and forecast or held forecast`, async ({ page }) => {
      await page.goto(`/holdings/${t}`);
      await readyOne(page, t);
      const card = page.getByTestId('holding-card');
      await expect(card).toContainText(name);
      await expect(card).toContainText(value);
      await expect(card).toContainText(/ units/);
      await expect(card).toContainText(/As of \d\d:\d\d London · data cutoff \d\d:\d\d/);
      if (t === 'HSBA') {
        await expect(card.locator('.chg')).toHaveText('Last price 14:10');
        await expect(main(page).getByRole('heading', { name: 'Forecast held' })).toBeVisible();
      } else {
        const fc = page.getByTestId('forecast');
        await expect(fc.getByRole('heading', { name: `6-month forecast · ${t}` })).toBeVisible();
        await expect(fc).toContainText('80% range');
        await expect(fc).toContainText('Data cutoff');
        await expect(fc).toContainText('Ranked action · 6 months');
        await expect(fc).toContainText('Decision support');
        await expect(fc.getByTestId('why')).not.toBeEmpty();
      }
    });
  }

  test('Apple gives the reasons for its action and its accounts add up', async ({ page }) => {
    await page.goto('/holdings/AAPL');
    await readyOne(page, 'AAPL');
    await expect(page.getByTestId('forecast')).toContainText('Protection leads, and no part is weak. Your return is not part of it.');
    await expect(main(page)).toContainText('Stocks ISA · 60 units');
    await expect(main(page)).toContainText('General account · 28 units');
  });

  test('Record decision is drawn, says it comes later when pressed, and records nothing', async ({ page }) => {
    const writes: string[] = [];
    page.on('request', (r) => { if (r.method() !== 'GET') writes.push(`${r.method()} ${r.url()}`); });
    await page.goto('/holdings/AAPL');
    await readyOne(page, 'AAPL');
    const before = await page.evaluate(() => JSON.stringify({ ...localStorage }));
    const fc = page.getByTestId('forecast');
    // at rest nothing extra is drawn
    await expect(fc.getByRole('status')).toHaveCount(0);
    await fc.getByRole('button', { name: 'Record decision' }).click();
    await expect(fc.getByRole('status')).toHaveText('Recording a decision comes in a later build step; nothing was recorded.');
    // directly after the button
    expect(await fc.getByRole('button', { name: 'Record decision' }).evaluate((b) => b.nextElementSibling?.getAttribute('role'))).toBe('status');
    expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(before);
    expect(writes).toEqual([]);
    await expect(page).toHaveURL(/\/holdings\/AAPL$/);
  });
});

test.describe('the data states', () => {
  test('loading keeps freshness and the last good figures in view', async ({ page }) => {
    await page.goto('/holdings?data=loading');
    await ready(page, 'Holdings');
    await expect(main(page)).toContainText('Refreshing · last good 22:15');
    await expect(main(page)).toContainText('Yahoo · HSBC late');
    await expect(page.getByTestId('value-card')).toContainText('Last good 22:15 · refreshing');
    await expect(rows(page)).toHaveCount(0);
    await page.goto('/holdings/AAPL?data=loading');
    await expect(page.getByTestId('holding-card')).toContainText('Last good 22:15 · refreshing');
  });

  test('empty says where holdings come from, and a snapshot holding says it has no history', async ({ page }) => {
    for (const path of ['/holdings?data=empty', '/holdings/AAPL?data=empty']) {
      await page.goto(path);
      await expect(main(page).getByRole('heading', { name: 'No holdings yet' })).toBeVisible();
      await expect(main(page)).toContainText('MyPrediction never connects to a broker.');
      await expect(main(page).getByRole('link', { name: 'Go to Imports' })).toHaveAttribute('href', '/imports');
      await expect(main(page)).toContainText('Yahoo · Fresh');
    }
    await page.goto('/holdings/NIFTYBEES?data=empty');
    await readyOne(page, 'NIFTYBEES');
    await expect(main(page).getByRole('heading', { name: 'Snapshot only' })).toBeVisible();
    await expect(main(page)).toContainText('Needs dated cash flows. Never shown as zero.');
    await expect(main(page).getByRole('link', { name: 'Go to Imports' })).toHaveAttribute('href', '/imports');
    await expect(main(page).getByRole('button', { name: 'Record decision' })).toHaveCount(0);
  });

  test('error names the failed run and keeps the last good figures', async ({ page }) => {
    await page.goto('/holdings?data=error');
    await expect(main(page).getByRole('heading', { name: 'The US run did not issue' })).toBeVisible();
    await expect(main(page)).toContainText('Twelve Data · error 21:16');
    await expect(page.getByTestId('value-card')).toContainText('US: last good run Mon 22:15 · cutoff 22:00. UK and India ran today');
    await expect(main(page)).toContainText('3 files not taken in · 1 difference open');
    await expect(rows(page)).toHaveCount(7);
    await main(page).getByRole('button', { name: 'Try again' }).click();
    await expect(rows(page)).toHaveCount(7);
    await page.goto('/holdings/AAPL?data=error');
    await expect(page.getByTestId('holding-card')).toContainText('Last good run Mon 22:15 · cutoff 22:00');
    await expect(main(page)).toContainText('Integrity failed');
    await expect(main(page)).toContainText('Not shown');
    await expect(main(page).getByRole('heading', { name: 'One measure failed' })).toBeVisible();
  });

  test('stale takes HSBC out of the known value and withholds its return', async ({ page }) => {
    await page.goto('/holdings?data=stale');
    await expect(main(page)).toContainText('HSBC is stale.');
    await expect(main(page)).toContainText('Yahoo · HSBC stale');
    const card = page.getByTestId('value-card');
    await expect(card).toContainText('Known value, 6 of 7 priced');
    await expect(card).toContainText('£84,051.05');
    await expect(card).toContainText('Holdings £78,508.20');
    await expect(page.getByTestId('gain')).toHaveText('+£13,606.25');
    const hsba = page.getByTestId('row-HSBA');
    await expect(hsba).toContainText(wide(page) ? 'Withheld' : 'Return Withheld');
    await expect(hsba).toContainText('Stale');
    await page.goto('/holdings/HSBA?data=stale');
    await expect(main(page)).toContainText('Left out of the total until its price returns.');
    await expect(main(page)).toContainText('Withheld · Stale');
    await expect(main(page)).toContainText('Yahoo · HSBC stale');
  });

  test('offline says what is shown and that nothing updates', async ({ page }) => {
    await page.goto('/holdings?data=offline');
    await expect(main(page)).toContainText('Offline · from 22:15');
    await expect(main(page)).toContainText('Showing holdings from 22:15. Imports and approvals wait until you reconnect.');
    await expect(main(page)).toContainText('How a browser protects saved records is unverified.');
    await page.goto('/holdings/RELIANCE?data=offline');
    await expect(main(page)).toContainText('Showing Reliance from 22:15. Nothing updates until you reconnect.');
    await expect(page.getByTestId('holding-card')).toContainText('From 22:15 · not updating');
  });

  test('HSBC\'s late price shows as stale in every state that shows it', async ({ page }) => {
    for (const ds of ['ready', 'loading', 'error', 'stale', 'offline']) {
      if (ds !== 'loading') {
        await page.goto(`/holdings?data=${ds}`);
        const row = page.getByTestId('row-HSBA');
        if (wide(page)) {
          await expect(row.locator('.chip.stale').first(), ds).toHaveText('Held');
        } else {
          await expect(row.locator('.chg'), ds).toHaveText('14:10');
          await expect(row.locator('.chg'), ds).toHaveCSS('color', await warn(page));
          await expect(row.locator('.chip.stale').first(), ds).toHaveText('Forecast held');
        }
      }
      await page.goto(`/holdings/HSBA?data=${ds}`);
      const late = page.getByTestId('holding-card').locator('.chg');
      await expect(late, ds).toHaveText('Last price 14:10');
      await expect(late, ds).toHaveCSS('color', await warn(page));
    }
  });
});

/** Prism's warning colour, as the page computes it. */
async function warn(page: Page): Promise<string> {
  return page.evaluate(() => {
    const s = document.createElement('span');
    s.style.color = 'var(--warn)';
    document.body.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    return c;
  });
}

test.describe('hide amounts', () => {
  test('masks money and units, keeps percentages, and holds across pages (OWN-18)', async ({ page }) => {
    await page.goto('/holdings/AAPL');
    await readyOne(page, 'AAPL');
    const hide = main(page).getByRole('button', { name: 'Hide amounts' });
    await expect(hide).toHaveAttribute('aria-pressed', 'false');
    await hide.click();
    await expect(hide).toHaveAttribute('aria-pressed', 'true');
    await expect(main(page)).toContainText('Amounts hidden.');
    let text = await main(page).innerText();
    expect(text).not.toMatch(/£\d/);
    expect(text).not.toMatch(/\d units/);
    expect(text).toContain('•• units');
    expect(text).toContain('+28.5%');
    expect(text).toContain('+6.2');
    // the choice holds when the page changes, and a second press brings the amounts back (lesson 35)
    await main(page).getByRole('link', { name: 'Back to Holdings' }).click();
    await ready(page, 'Holdings');
    text = await main(page).innerText();
    expect(text).not.toMatch(/£\d/);
    expect(text).toContain(wide(page) ? '+6.2%' : '+6.2% · 6M');
    expect(text).toContain('(1.39%)');
    await main(page).getByRole('button', { name: 'Hide amounts' }).click();
    await expect(page.getByTestId('row-AAPL')).toContainText(shownValue(page, '£14,820.50'));
    await expect(main(page)).not.toContainText('Amounts hidden.');
  });
});

test.describe('access and layout', () => {
  for (const scheme of ['light', 'dark'] as const) {
    for (const path of ['/holdings', '/holdings?data=stale', '/holdings/AAPL', '/holdings/HSBA', '/holdings/NIFTYBEES?data=error']) {
      test(`axe finds no WCAG 2.2 A or AA fault on ${path} in ${scheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        if (path.includes('/holdings/')) await readyOne(page, path.split('/')[2]!.split('?')[0]!);
        else await ready(page, 'Holdings');
        await expect(main(page).locator('[aria-busy="true"]')).toHaveCount(0);
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
      });
    }
  }

  test('axe finds no fault with amounts hidden', async ({ page }) => {
    await page.goto('/holdings/AAPL');
    await readyOne(page, 'AAPL');
    await main(page).getByRole('button', { name: 'Hide amounts' }).click();
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(r.violations.map((v) => v.id)).toEqual([]);
  });

  test('no sideways scroll at any width from 320 to 1440', async ({ page }) => {
    test.skip(!wide(page), 'one sweep is enough');
    // 1,405 resizes: CI's runner needs more than the default 30 s. The sweep stays a sweep (lesson 55), as on Home.
    test.setTimeout(300_000);
    for (const path of ['/holdings', '/holdings?data=stale', '/holdings/NIFTYBEES', '/holdings/HSBA', '/holdings/RELIANCE?data=error']) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(main(page).locator('[aria-busy="true"]')).toHaveCount(0);
      const over: number[] = [];
      for (let w = 320; w <= 1440; w += 4) {
        await page.setViewportSize({ width: w, height: 800 });
        // measured in the first frame drawn at the new width: the page switches between the table and the rows on the
        // resize, before that frame, so a width a person could see is a width measured
        const o = await page.evaluate(() => new Promise<number>((done) => requestAnimationFrame(() => done(document.documentElement.scrollWidth - document.documentElement.clientWidth))));
        if (o > 0) over.push(w);
      }
      expect(over, path).toEqual([]);
    }
  });

  test('every target is at least 44 px, counting the hit area a control draws beyond its box', async ({ page }) => {
    for (const path of ['/holdings', '/holdings/AAPL']) {
      await page.goto(path);
      await expect(main(page).locator('[aria-busy="true"]')).toHaveCount(0);
      const small = await page.evaluate(() => [...document.querySelectorAll('main a, main button')].filter((el) => (el as HTMLElement).offsetParent !== null).map((el) => {
        // a row's link opens the whole row
        const box = (el.closest('.hrow, tr') ?? el).getBoundingClientRect();
        // Prism's .tbtn::after reaches 4 px past the button on every side: that is its target
        const after = getComputedStyle(el, '::after');
        const grow = after.content !== 'none' && after.position === 'absolute' ? Math.max(0, -parseFloat(after.top) || 0) * 2 : 0;
        const w = box.width + grow, h = box.height + grow;
        return h < 44 || w < 44 ? `${el.textContent?.trim() || el.getAttribute('aria-label')} ${w}x${h}` : '';
      }).filter(Boolean));
      expect(small, path).toEqual([]);
    }
  });

  test('nothing here trades, imports or writes', async ({ page }) => {
    const writes: string[] = [];
    page.on('request', (r) => { if (r.method() !== 'GET') writes.push(`${r.method()} ${r.url()}`); });
    for (const path of ['/holdings', '/holdings/AAPL', '/holdings/NVDA']) {
      await page.goto(path);
      await expect(main(page).locator('[aria-busy="true"]')).toHaveCount(0);
      for (const name of [/buy/i, /sell/i, /order/i, /trade/i, /import/i, /approve/i]) {
        await expect(main(page).getByRole('button', { name }), `${path} ${name}`).toHaveCount(0);
      }
      // the one drawn act not built yet is Record decision, and pressing it only says so (tested above)
      const buttons = await main(page).getByRole('button').allInnerTexts();
      expect(buttons.filter((b) => b.trim() && !['Record decision', 'Try again'].includes(b.trim())), path).toEqual([]);
      await expect(main(page).locator('form, input')).toHaveCount(0);
    }
    expect(writes).toEqual([]);
  });

  test('no figure is in the prebuilt pages', async ({ request }) => {
    for (const path of ['/holdings', '/holdings/AAPL', '/holdings/HSBA']) {
      const html = await (await request.get(path)).text();
      for (const fig of ['14,820', '90,155', '84,612', '6,104', 'Protection leads']) expect(html, `${path} ${fig}`).not.toContain(fig);
    }
  });
});
