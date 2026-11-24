import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers';

// The Track record, option A "Scorecard", and the screens its rows open, viewing only (MP-187, MP-205). Sample data, illustrative.
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const h1 = (page: Page) => page.getByRole('heading', { level: 1 });
const main = (page: Page) => page.getByRole('main');
const busy = (page: Page) => main(page).locator('[aria-busy="true"]');
const PAGES = [
  ['/record/track', 'Track record', 'About the track record'],
  ['/record/track/slice', '6 months', 'About this horizon'],
  ['/record/track/holding', 'By holding', 'About this view'],
  ['/record/track/model', 'By model', 'About this view'],
  ['/record/track/regime', 'By regime', 'About this view']
] as const;
const OPENS = [['6 months in full', '/record/track/slice', '6 months', 'slice'], ['Holding', '/record/track/holding', 'By holding', 'holding'], ['Model', '/record/track/model', 'By model', 'model'], ['Regime', '/record/track/regime', 'By regime', 'regime']] as const;

async function open(page: Page, path: string, title: string) {
  await page.goto(path);
  await expect(h1(page)).toHaveText(title);
  if (!path.includes('data=loading')) await expect(busy(page)).toHaveCount(0);
}
const opener = (page: Page, name: string) => main(page).getByRole('link', { name: new RegExp(`^${name}`) });

test.beforeEach(async ({ page }) => signIn(page, '/record/track'));

test.describe('the scorecard', () => {
  test('shows each horizon with its sample, and every rate as exploratory', async ({ page }) => {
    await open(page, '/record/track', 'Track record');
    await expect(main(page).locator('.track-card h4')).toHaveText(['3 months', '6 months', '12 months', '10 sessions', '20 sessions', 'How it is counted']);
    await expect(main(page).getByText('Every rate here is exploratory.')).toBeVisible();
    await expect(main(page).locator('.track-card .chip.proposed', { hasText: 'Exploratory' })).toHaveCount(4);
    await expect(main(page).getByText('365 days · 413 scored · 9 censored · 19 abstained. 1 non-overlapping block, under the 20 a claim needs.')).toBeVisible();
    await expect(main(page).getByText('80% ranges held, 318 of 413')).toBeVisible();
    // 12 months has nothing matured: it says so and shows no rate
    await expect(main(page).getByText('Nothing has matured')).toBeVisible();
    await expect(main(page).getByText('All 1,344 forecasts since 2 Feb 2026 are pending. Nothing is scored before its horizon passes.')).toBeVisible();
    // short term sits apart, labelled
    await expect(main(page).getByText('Not long-term guidance')).toBeVisible();
    await expect(main(page).getByText('Pending, censored and abstained are counted apart, never as misses.', { exact: false })).toBeVisible();
    await expect(main(page).getByText('Live forecasts only, each scored once its horizon passed and every input was in.', { exact: false })).toBeVisible();
    await expect(main(page).getByText('Twelve Data · Fresh').filter({ visible: true })).toBeVisible();
  });

  test('the Record switch goes to the Journal', async ({ page }) => {
    await open(page, '/record/track?data=stale', 'Track record');
    const sw = main(page).getByRole('group', { name: 'Record' });
    await expect(sw.getByRole('button', { name: 'Track record' })).toHaveAttribute('aria-pressed', 'true');
    await sw.getByRole('button', { name: 'Journal' }).click();
    await expect(page).toHaveURL(/\/record\?data=stale$/);
    await expect(h1(page)).toHaveText('Journal');
  });
});

test.describe('the screens the scorecard opens', () => {
  test('every link opens its page, and back returns focus to it', async ({ page }) => {
    await open(page, '/record/track', 'Track record');
    for (const [name, path, title, id] of OPENS) {
      await opener(page, name).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(h1(page)).toHaveText(title);
      await main(page).getByRole('link', { name: 'Back to Track record' }).click();
      await expect(page).toHaveURL(/\/record\/track$/);
      await expect(h1(page)).toHaveText('Track record');
      await expect(page.locator(`#track-open-${id}`)).toBeFocused();
    }
  });

  test('opens by keyboard, and the browser back and forward work', async ({ page }) => {
    await open(page, '/record/track', 'Track record');
    await page.locator('#track-open-model').focus();
    await page.keyboard.press('Enter');
    await expect(h1(page)).toHaveText('By model');
    await page.goBack();
    await expect(h1(page)).toHaveText('Track record');
    await expect(page.locator('#track-open-model')).toBeFocused();
    await page.goForward();
    await expect(h1(page)).toHaveText('By model');
  });

  test('the data state goes along with every link and back', async ({ page }) => {
    await open(page, '/record/track?data=offline', 'Track record');
    await opener(page, 'Regime').click();
    await expect(page).toHaveURL(/\/record\/track\/regime\?data=offline$/);
    await expect(main(page).getByText('Showing the record from 22:15. Nothing updates until you reconnect.')).toBeVisible();
    await main(page).getByRole('link', { name: 'Back to Track record' }).click();
    await expect(page).toHaveURL(/\/record\/track\?data=offline$/);
  });

  test('6 months in full accounts for every forecast and names the two from the journal', async ({ page }) => {
    await open(page, '/record/track/slice', '6 months');
    await expect(main(page).locator('.track-kv').first()).toHaveText(/Issued1,344Pending, horizon not passed903Matured441· Scored413· Censored9· Abstained19/);
    await expect(main(page).getByText('Inside, +12.4%')).toBeVisible();
    await expect(main(page).getByText('Outside, −11.6%')).toBeVisible();
    await expect(main(page).getByText('Not scored, and why')).toBeVisible();
    await expect(main(page).getByText(/R2-HGB v3’s first 6-month forecast matures on 1 Apr 2027; its 168 are pending/)).toBeVisible();
  });

  test('by holding shows coverage with its sample, and the disputed dividend as censored, not a miss', async ({ page }) => {
    await open(page, '/record/track/holding', 'By holding');
    const names = ['Apple', 'NVIDIA', 'SPDR S&P 500 ETF Trust', 'AstraZeneca', 'HSBC', 'Reliance', 'Nippon India Nifty 50 BeES'];
    await expect(main(page).locator('.track-br .m b')).toHaveText([...names, ...names]);
    await expect(main(page).getByText('21 censored: a dividend is disputed, so no score yet · 4 abstained')).toBeVisible();
    await expect(main(page).getByText('Hit rate')).toHaveCount(0);
  });

  test('by model says where too few have scored, and shows no rate there', async ({ page }) => {
    await open(page, '/record/track/model', 'By model');
    await expect(main(page).locator('.track-list h3')).toHaveText(['R2-HGB v2', 'R2-HGB v3', 'Baseline']);
    await expect(main(page).getByText('Too few')).toHaveCount(1);
    await expect(main(page).getByText('A rate shows from 30.')).toBeVisible();
    await expect(main(page).getByText('Nothing matured. First due 1 Jan 2027.')).toBeVisible();
  });

  test('by regime marks the regime rule as proposed', async ({ page }) => {
    await open(page, '/record/track/regime', 'By regime');
    await expect(main(page).getByText('Proposed · SCI-D04')).toBeVisible();
    await expect(main(page).locator('.track-br .m b')).toHaveCount(8);
  });
});

test.describe('data states', () => {
  test('loading holds until the page is pressed, with freshness and the last good figures in view', async ({ page }) => {
    for (const [path, title] of PAGES) {
      await open(page, `${path}?data=loading`, title);
      await expect(main(page).getByText('Rebuilding the summaries')).toBeVisible();
      await expect(main(page).getByText('Refreshing · last good 22:15').filter({ visible: true })).toBeVisible();
      await expect(busy(page)).toHaveCount(1);
      await expect(busy(page).getByText('Exploratory').first()).toBeVisible();
      await h1(page).click();
      await expect(busy(page)).toHaveCount(0);
      await expect(main(page).getByText('Rebuilding the summaries')).toHaveCount(0);
    }
  });

  test('empty says how the record starts, and shows no figure', async ({ page }) => {
    for (const [path, title] of PAGES) {
      await open(page, `${path}?data=empty`, title);
      await expect(main(page).getByText('No forecast has been issued')).toBeVisible();
      await expect(main(page).locator('.track-trio, .track-br')).toHaveCount(0);
      await expect(main(page).locator('.track-met, .calbar')).toHaveCount(0);
      // the only percentage left is the 80% range the rules name, never a rate
      expect(((await main(page).innerText()).match(/\d+%/g) ?? []).filter((p) => p !== '80%')).toEqual([]);
    }
    await open(page, '/record/track?data=empty', 'Track record');
    await expect(main(page).getByText('How it is counted')).toBeVisible();
    await expect(main(page).getByRole('link', { name: /^Holding/ })).toHaveCount(0);
  });

  test('error keeps the record, keeps the price chips, and a retry keeps focus', async ({ page }) => {
    await open(page, '/record/track?data=error', 'Track record');
    await expect(main(page).getByText('The record did not load')).toBeVisible();
    await expect(main(page).getByText('80% ranges held, 318 of 413')).toBeVisible();
    await expect(main(page).getByText('Yahoo · HSBC late').filter({ visible: true })).toBeVisible();
    const again = main(page).getByRole('button', { name: 'Try again' });
    await again.click();
    await expect(again).toBeFocused();
    await expect(main(page).getByText('The record did not load')).toBeVisible();
  });

  test('stale says scores are behind, never a late price scored as a miss', async ({ page }) => {
    await open(page, '/record/track/slice?data=stale', '6 months');
    await expect(main(page).getByText('Scores are behind.')).toBeVisible();
    await expect(main(page).getByText(/a late price is never scored as a miss/)).toBeVisible();
    await expect(main(page).getByText('Settled · OWN-07')).toBeVisible();
    await expect(main(page).getByText('Yahoo · HSBC stale').filter({ visible: true })).toBeVisible();
  });

  test('offline from the address, and when the browser really goes offline', async ({ page, context }) => {
    await open(page, '/record/track/holding?data=offline', 'By holding');
    await expect(main(page).getByText('How a browser protects saved records is unverified.')).toBeVisible();
    await expect(main(page).getByText('Offline · from 22:15').filter({ visible: true })).toBeVisible();
    await open(page, '/record/track', 'Track record');
    await context.setOffline(true);
    await expect(main(page).getByText('Offline · from 22:15').filter({ visible: true })).toBeVisible();
    await expect(main(page).getByText('80% ranges held, 318 of 413')).toBeVisible();
    await context.setOffline(false);
    await expect(main(page).getByText('Offline · from 22:15').filter({ visible: true })).toHaveCount(0);
  });
});

test.describe('nothing writes', () => {
  test('the info button says it comes later, and nothing shows at rest', async ({ page }) => {
    for (const [path, title, about] of PAGES) {
      await open(page, path, title);
      await expect(main(page).getByText(/comes in a later build step/)).toHaveCount(0);
      await main(page).getByRole('button', { name: about }).click();
      await expect(main(page).getByRole('status').filter({ hasText: 'The note about this view comes in a later build step.' })).toBeVisible();
    }
  });

  test('nothing here trades, records or sends', async ({ page }) => {
    const writes: string[] = [];
    page.on('request', (r) => { if (r.method() !== 'GET') writes.push(`${r.method()} ${r.url()}`); });
    for (const [path, title, about] of PAGES) {
      await open(page, path, title);
      for (const name of [/buy/i, /sell/i, /order/i, /trade/i, /record a decision/i, /import/i]) {
        await expect(main(page).getByRole('button', { name }), `${path} ${name}`).toHaveCount(0);
      }
      await expect(main(page).locator('form, input, textarea, select')).toHaveCount(0);
      await main(page).getByRole('button', { name: about }).click();
    }
    await open(page, '/record/track?data=error', 'Track record');
    await main(page).getByRole('button', { name: 'Try again' }).click();
    expect(writes).toEqual([]);
  });

  test('no figure is in the prebuilt pages', async ({ request }) => {
    for (const [path] of PAGES) {
      const html = await (await request.get(path)).text();
      for (const fig of ['1,344', '413 scored', '318 of', '77%', 'R2-HGB', 'Rising, calm', ' pending']) expect(html, `${path} ${fig}`).not.toContain(fig);
    }
  });
});

test.describe('accessibility and layout', () => {
  const STATES = ['', '?data=loading', '?data=empty', '?data=error', '?data=stale', '?data=offline'];

  for (const scheme of ['light', 'dark'] as const) {
    test(`every track view and state passes axe WCAG 2.2 A and AA in ${scheme}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.emulateMedia({ colorScheme: scheme });
      for (const [path, title] of PAGES) for (const st of STATES) {
        await open(page, `${path}${st}`, title);
        await page.waitForLoadState('networkidle');
        // the design's buttons fade their colour when they turn on (180 ms): judge the page at rest, not mid-fade
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(r.passes.length, 'axe ran no checks').toBeGreaterThan(0);
        expect(r.violations.map((v) => `${path}${st}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      }
    });
  }

  test('no track view scrolls sideways at any width from 320 to 1440', async ({ page }) => {
    test.setTimeout(300_000); // a whole sweep on a slow CI runner (lesson 55)
    test.skip(wide(page), 'one sweep is enough; it sets its own widths');
    for (const [path, title] of PAGES) {
      await open(page, path, title);
      for (let w = 320; w <= 1440; w += 8) {
        await page.setViewportSize({ width: w, height: 800 });
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${path} at ${w}px`).toBeLessThanOrEqual(0);
      }
    }
  });

  test('every link and button in the track views is a 44 px target', async ({ page }) => {
    for (const [path, title] of [...PAGES, ['/record/track?data=error', 'Track record']] as const) {
      await open(page, path, title);
      const small = await main(page).locator('a, button:not([disabled])').evaluateAll((els) =>
        els.filter((e) => e.getClientRects().length > 0).map((e) => {
          const r = e.getBoundingClientRect(), after = getComputedStyle(e, '::after');
          // Prism's segmented control and top-bar buttons widen their 32 and 36 px boxes to 44 with an ::after laid over them
          const laid = after.content !== 'none' && after.position === 'absolute';
          const px = (v: string) => parseFloat(v) || 0;
          const dh = laid ? -px(after.top) - px(after.bottom) : 0, dw = laid ? -px(after.left) - px(after.right) : 0;
          return { t: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30), w: r.width + dw, h: r.height + dh };
        }).filter((b) => b.w < 44 || b.h < 44));
      expect(small, path).toEqual([]);
    }
  });
});
