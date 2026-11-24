import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers';

// The decision journal, option A "Timeline", viewing only (MP-158, MP-205). Sample data, illustrative.
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
const h1 = (page: Page) => page.getByRole('heading', { level: 1 });
const main = (page: Page) => page.getByRole('main');
const rows = (page: Page) => main(page).locator('.journal-e');
const NAMES = ['NVIDIA', 'SPDR S&P 500 ETF Trust', 'Reliance', 'Apple', 'NVIDIA', 'HSBC', 'AstraZeneca'];
const WHEN = ['Today · 6 months', '21 Aug 2026 · 3 months', '2 Jun 2026 · 3 months', '12 May 2026 · 6 months', '28 Apr 2026 · 6 months', '14 Apr 2026 · 6 months', '3 Mar 2026 · 6 months'];
const OPENS = [['nvda', 'NVIDIA 28 Apr 2026', 'NVIDIA · 28 Apr'], ['aapl', 'Apple 12 May 2026', 'Apple · 12 May'], ['hsba', 'HSBC 14 Apr 2026', 'HSBC · 14 Apr'], ['azn', 'AstraZeneca 3 Mar 2026', 'AstraZeneca · 3 Mar']] as const;

async function open(page: Page, path: string, title: string | RegExp = 'Journal') {
  await page.goto(path);
  await expect(h1(page)).toHaveText(title);
}

test.beforeEach(async ({ page }) => signIn(page, '/record'));

test.describe('the timeline', () => {
  test('shows every entry, newest first, with its evidence and outcome', async ({ page }) => {
    await expect(h1(page)).toHaveText('Journal');
    await expect(rows(page)).toHaveCount(7);
    await expect(rows(page).locator('.m b')).toHaveText(NAMES);
    await expect(rows(page).locator('.m span')).toHaveText(WHEN);
    await expect(rows(page).locator('.badge')).toHaveText(['Trim', 'Add', 'Add', 'Hold', 'Trim', 'Pause', 'Hold']);
    await expect(rows(page).locator('.o')).toHaveText([
      'Nothing is scored before 3 May 2027.', 'Outcome due 20 Nov 2026.', 'Rose 5.1%, inside its 80% range.', 'Outcome due 12 Nov 2026.',
      'Rose 12.4%, inside its 80% range.', 'A dividend is disputed, so nothing is scored yet. It is never a zero.', 'Fell 11.6%, outside its 80% range.'
    ]);
    await expect(rows(page).getByText('Differed')).toHaveCount(4);
    await expect(main(page).getByText('Decision support, not advice. MyPrediction places no trades. Illustrative.')).toBeVisible();
    await expect(main(page).getByText('You differed from the ranked action 4 times in 7 decisions. 3 have scored so far, too few to show a rate.')).toBeVisible();
    await expect(main(page).getByText('Twelve Data · Fresh')).toBeVisible();
    // only the decisions the design draws opened are links
    await expect(main(page).locator('a.journal-e')).toHaveCount(4);
  });

  test('offers no write and does not promise the Track record', async ({ page }) => {
    await expect(rows(page)).toHaveCount(7);
    await expect(main(page).getByRole('button', { name: /record a decision|add a correction|buy|sell|order/i })).toHaveCount(0);
    await expect(main(page).getByRole('link', { name: /record a decision|add a correction|buy|sell|order/i })).toHaveCount(0);
    const track = main(page).getByRole('group', { name: 'Record' }).getByRole('button', { name: 'Track record' });
    await expect(track).toBeDisabled();
    await expect(track).toHaveAccessibleDescription('The Track record view is not built yet.');
    await expect(main(page).getByRole('button', { name: 'Journal' })).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('one decision', () => {
  test('each drawn entry opens, and back returns focus to it', async ({ page }) => {
    for (const [id, name, title] of OPENS) {
      await main(page).getByRole('link', { name: new RegExp(name) }).click();
      await expect(page).toHaveURL(new RegExp(`/record\\?entry=${id}$`));
      await expect(h1(page)).toHaveText(title);
      await expect(main(page).getByText('What you recorded')).toBeVisible();
      await main(page).getByRole('link', { name: 'Journal', exact: true }).click();
      await expect(page).toHaveURL(/\/record$/);
      await expect(h1(page)).toHaveText('Journal');
      await expect(page.locator(`#entry-${id}`)).toBeFocused();
    }
  });

  test('opens by keyboard, and the browser back returns to the list and forward to the entry', async ({ page }) => {
    await expect(rows(page)).toHaveCount(7);
    await page.locator('#entry-azn').focus();
    await page.keyboard.press('Enter');
    await expect(h1(page)).toHaveText('AstraZeneca · 3 Mar');
    await page.goBack();
    await expect(h1(page)).toHaveText('Journal');
    await expect(page.locator('#entry-azn')).toBeFocused();
    await page.goForward();
    await expect(h1(page)).toHaveText('AstraZeneca · 3 Mar');
    // pressed again after a change of state: back, then open another
    await main(page).getByRole('link', { name: 'Journal', exact: true }).click();
    await page.locator('#entry-hsba').press('Enter');
    await expect(h1(page)).toHaveText('HSBC · 14 Apr');
  });

  test('a scored decision lands its outcome on the range you saw, beside the evidence frozen', async ({ page }) => {
    await open(page, '/record?entry=nvda', 'NVIDIA · 28 Apr');
    await expect(main(page).getByText('Scored on 28 Oct 2026')).toBeVisible();
    await expect(main(page).getByRole('img', { name: 'Forecast of 28 April: median +7.8%, 80% range −16.2% to +30.1%. Outcome +12.4%, inside the range. Illustrative.' })).toBeVisible();
    await expect(main(page).getByText('I chose not to. Kept all 60 units. Long-term position. I accept the wider range for now.')).toBeVisible();
    await expect(main(page).getByText('What you saw on 28 Apr')).toBeVisible();
    await expect(main(page).getByText('28 Apr 22:00')).toBeVisible();
    await expect(main(page).getByText('NVIDIA rose 12.4% in the 6 months.')).toBeVisible();
    await expect(main(page).getByText('The model today. This entry cites R2-HGB v2, the version you saw.')).toBeVisible();
    await open(page, '/record?entry=azn', 'AstraZeneca · 3 Mar');
    await expect(main(page).getByRole('img', { name: /Outcome −11\.6%, outside the range/ })).toBeVisible();
    await expect(main(page).getByText('Outside its range')).toBeVisible();
  });

  test('a waiting and an unresolved decision say so, with no score', async ({ page }) => {
    await open(page, '/record?entry=aapl', 'Apple · 12 May');
    await expect(main(page).getByText('Outcome due 12 Nov 2026', { exact: true })).toBeVisible();
    await expect(main(page).getByText('What happened')).toHaveCount(0);
    await open(page, '/record?entry=hsba', 'HSBC · 14 Apr');
    await expect(main(page).getByText('Horizon passed 14 Oct, one input missing')).toBeVisible();
    await expect(main(page).getByText('Unresolved')).toBeVisible();
  });

  test('an entry the design does not draw opened stays on the list', async ({ page }) => {
    await open(page, '/record?entry=spy');
    await expect(rows(page)).toHaveCount(7);
  });
});

test.describe('where you differed', () => {
  test('counts, not a rate, and back returns focus to the link', async ({ page }) => {
    await main(page).getByRole('link', { name: 'See where you differed' }).click();
    await expect(h1(page)).toHaveText('Where you differed');
    await expect(main(page).locator('.journal-ba .v')).toHaveText(['3', '4']);
    await expect(main(page).locator('.journal-ba .n')).toHaveText(['0 scored · 2 waiting · 1 unresolved', '3 scored · 1 waiting']);
    await expect(main(page).getByText('Too few scored decisions to show a rate. A scored outcome grades the forecast, not you.')).toBeVisible();
    await expect(rows(page).locator('.m b')).toHaveText(['NVIDIA', 'Reliance', 'NVIDIA', 'AstraZeneca']);
    await expect(rows(page).getByText('Differed')).toHaveCount(0);
    await expect(main(page).getByText('Of the 3 scored, 2 landed inside their 80% range and 1 outside.', { exact: false })).toBeVisible();
    await main(page).getByRole('link', { name: 'Journal', exact: true }).click();
    await expect(h1(page)).toHaveText('Journal');
    await expect(main(page).getByRole('link', { name: 'See where you differed' })).toBeFocused();
  });
});

test.describe('data states', () => {
  test('loading holds until the page is pressed, then the journal is ready', async ({ page }) => {
    await open(page, '/record?data=loading');
    await expect(main(page).getByText('Last good 22:15', { exact: true })).toHaveCount(5);
    await expect(main(page).getByText('Refreshing · last good 22:15')).toBeVisible();
    await expect(rows(page)).toHaveCount(0);
    await h1(page).click();
    await expect(rows(page)).toHaveCount(7);
    await expect(main(page).getByText('Refreshing · last good 22:15')).toHaveCount(0);
  });

  test('empty says how an entry arrives, and leads to the ranked actions', async ({ page }) => {
    await open(page, '/record?data=empty');
    await expect(main(page).getByText('No decisions yet')).toBeVisible();
    await expect(rows(page)).toHaveCount(0);
    await expect(main(page).getByRole('link', { name: 'See ranked actions' })).toHaveAttribute('href', '/forecasts');
    await expect(main(page).getByText('You and the ranking')).toHaveCount(0);
  });

  test('error keeps the entries, and a retry keeps focus', async ({ page }) => {
    await open(page, '/record?data=error');
    await expect(main(page).getByText('The journal did not load')).toBeVisible();
    await expect(rows(page)).toHaveCount(7);
    const again = main(page).getByRole('button', { name: 'Try again' });
    await again.click();
    await expect(again).toBeFocused();
    await expect(main(page).getByText('The journal did not load')).toBeVisible();
    // a failed read is not a failed price: the price chips stay
    await expect(main(page).getByText('Yahoo · HSBC late')).toBeVisible();
  });

  test('stale says outcomes are behind, with the settled limit', async ({ page }) => {
    await open(page, '/record?data=stale');
    await expect(main(page).getByText('Outcomes and rankings are behind.')).toBeVisible();
    await expect(main(page).getByText('Settled · OWN-07')).toBeVisible();
    await expect(main(page).getByText('Yahoo · HSBC stale')).toBeVisible();
    await expect(rows(page)).toHaveCount(7);
  });

  test('offline from the address, and when the browser really goes offline', async ({ page, context }) => {
    await open(page, '/record?data=offline');
    await expect(main(page).getByText('Showing your journal from 22:15. New entries stay as drafts until you reconnect.')).toBeVisible();
    await expect(main(page).getByText('How a browser protects saved records is unverified.')).toBeVisible();
    await expect(main(page).getByText('Offline · from 22:15')).toBeVisible();
    await open(page, '/record');
    await context.setOffline(true);
    await expect(main(page).getByText('Offline · from 22:15')).toBeVisible();
    await expect(rows(page)).toHaveCount(7);
    await context.setOffline(false);
    await expect(main(page).getByText('Offline · from 22:15')).toHaveCount(0);
  });

  test('one decision in each state keeps the entry and says what is missing', async ({ page }) => {
    await open(page, '/record?entry=nvda&data=loading', 'NVIDIA · 28 Apr');
    await expect(main(page).getByText('Joining the outcome')).toBeVisible();
    await expect(main(page).getByText('What you recorded')).toBeVisible();
    await open(page, '/record?entry=nvda&data=error', 'NVIDIA · 28 Apr');
    await expect(main(page).getByText('The score did not arrive')).toBeVisible();
    await expect(main(page).getByRole('button', { name: 'Check again' })).toBeVisible();
    await expect(main(page).getByText('What happened')).toHaveCount(0);
    await open(page, '/record?entry=nvda&data=offline', 'NVIDIA · 28 Apr');
    await expect(main(page).getByText('Showing this entry and its score from 22:15.')).toBeVisible();
    await open(page, '/record?entry=aapl&data=error', 'Apple · 12 May');
    await expect(main(page).getByText('The journal did not load')).toBeVisible();
    await expect(main(page).getByText('Outcome due 12 Nov 2026', { exact: true })).toBeVisible();
    await open(page, '/record?entry=nvda&data=empty');
    await expect(main(page).getByText('No decisions yet')).toBeVisible();
    // the data state goes along when you go back
    await open(page, '/record?entry=hsba&data=stale', 'HSBC · 14 Apr');
    await main(page).getByRole('link', { name: 'Journal', exact: true }).click();
    await expect(page).toHaveURL(/\/record\?data=stale$/);
    await expect(main(page).getByText('Outcomes and rankings are behind.')).toBeVisible();
  });

  test('where you differed, empty and loading', async ({ page }) => {
    await open(page, '/record?view=differed&data=empty', 'Where you differed');
    await expect(main(page).getByText('You have followed every ranked action')).toBeVisible();
    await expect(main(page).getByText('How the forecasts did')).toHaveCount(0);
    await open(page, '/record?view=differed&data=loading', 'Where you differed');
    await expect(main(page).locator('.journal-ba .v')).toHaveText(['3', '4']);
    await expect(main(page).getByText('Last good 22:15', { exact: true })).toHaveCount(3);
  });
});

test.describe('hidden amounts', () => {
  test('mask units on the timeline and in an entry; percentages stay (OWN-18)', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('mp-hide-amounts', '1'));
    await open(page, '/record');
    await expect(rows(page)).toHaveCount(7);
    const list = await main(page).innerText();
    expect(list).not.toMatch(/\d+ units/);
    await expect(main(page).getByText('You added ••')).toHaveCount(2);
    await expect(main(page).getByRole('link', { name: /AstraZeneca .*You added hidden units/ })).toBeVisible();
    await expect(main(page).getByText('Rose 12.4%, inside its 80% range.')).toBeVisible();
    await open(page, '/record?entry=nvda', 'NVIDIA · 28 Apr');
    expect(await main(page).innerText()).not.toMatch(/\d+ units/);
    await expect(main(page).getByText(/Kept all ••/)).toBeVisible();
    await expect(main(page).getByText('+7.8%')).toBeVisible();
    await page.evaluate(() => localStorage.removeItem('mp-hide-amounts'));
    await page.reload();
    await expect(main(page).getByText('I chose not to. Kept all 60 units. Long-term position. I accept the wider range for now.')).toBeVisible();
  });
});

test.describe('accessibility and layout', () => {
  const PAGES = [
    ['/record', 'Journal'], ['/record?entry=nvda', 'NVIDIA · 28 Apr'], ['/record?entry=aapl', 'Apple · 12 May'], ['/record?entry=hsba', 'HSBC · 14 Apr'],
    ['/record?entry=azn', 'AstraZeneca · 3 Mar'], ['/record?view=differed', 'Where you differed'], ['/record?data=loading', 'Journal'],
    ['/record?data=empty', 'Journal'], ['/record?data=error', 'Journal'], ['/record?data=stale', 'Journal'], ['/record?data=offline', 'Journal'],
    ['/record?entry=nvda&data=error', 'NVIDIA · 28 Apr'], ['/record?view=differed&data=offline', 'Where you differed']
  ] as const;

  for (const scheme of ['light', 'dark'] as const) {
    test(`every journal view and state passes axe WCAG 2.2 A and AA in ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      for (const [path, title] of PAGES) {
        await open(page, path, title);
        await page.waitForLoadState('networkidle');
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(r.passes.length, 'axe ran no checks').toBeGreaterThan(0);
        expect(r.violations.map((v) => `${path}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      }
    });
  }

  test('no journal view scrolls sideways at any width from 320 to 1440', async ({ page }) => {
    test.skip(wide(page), 'one sweep is enough; it sets its own widths');
    for (const [path, title] of [PAGES[0], PAGES[4], PAGES[5], PAGES[8]]) {
      await open(page, path, title);
      for (let w = 320; w <= 1440; w += 8) {
        await page.setViewportSize({ width: w, height: 800 });
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${path} at ${w}px`).toBeLessThanOrEqual(0);
      }
    }
  });

  test('every link and button in the journal is a 44 px target', async ({ page }) => {
    for (const [path, title] of [PAGES[0], PAGES[1], PAGES[5], PAGES[8]]) {
      await open(page, path, title);
      const small = await main(page).locator('a, button:not([disabled])').evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect(), after = getComputedStyle(e, '::after');
          // Prism's segmented control widens its 32 px buttons to 44 with an ::after laid over them
          const extra = after.content !== 'none' && after.position === 'absolute' ? -parseFloat(after.top) - parseFloat(after.bottom) : 0;
          return { t: (e.textContent ?? '').trim().slice(0, 30), w: r.width, h: r.height + extra };
        }).filter((b) => b.w < 44 || b.h < 44));
      expect(small, path).toEqual([]);
    }
  });
});
