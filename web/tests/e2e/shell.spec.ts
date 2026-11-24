import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signIn, overflowX } from './helpers';

const PLACES = [
  ['/', 'Portfolio'], ['/forecasts', 'Forecasts'], ['/segments', 'Segments'], ['/record', 'Track record'], ['/research', 'Research'],
  ['/approvals', 'Approvals'], ['/imports', 'Imports'], ['/sources', 'Data sources'], ['/settings', 'Settings']
] as const;
// A page's own title where it differs from its place's name: Record opens on the Journal (MP-205).
const H1: Record<string, string> = { '/record': 'Journal' };
const TABS = ['Portfolio', 'Forecasts', 'Segments', 'Record', 'Settings'];
const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

test.beforeEach(async ({ page }) => signIn(page));

test.describe('navigation', () => {
  test('the sidebar on desktop, the tab bar on a phone, never both', async ({ page }) => {
    await page.goto('/');
    const side = page.getByRole('navigation', { name: 'Places' });
    const tabs = page.getByRole('navigation', { name: 'Tabs' });
    if (wide(page)) {
      await expect(side).toBeVisible();
      await expect(tabs).toBeHidden();
      // the design's counts sit beside Portfolio and Segments, and are heard with what they count
      await expect(side.getByRole('link')).toHaveText(['MyPrediction', ...PLACES.map(([, l]) => (l === 'Portfolio' ? 'Portfolio 7' : l === 'Segments' ? 'Segments 8' : l))]);
      await expect(side.getByRole('link', { name: 'Portfolio 7 holdings', exact: true })).toBeVisible();
      await expect(side.getByRole('link', { name: 'Segments 8 segments', exact: true })).toBeVisible();
    } else {
      await expect(side).toBeHidden();
      await expect(tabs).toBeVisible();
      await expect(tabs.getByRole('link')).toHaveText(TABS);
    }
  });

  test('pressing each place opens it, marks it current and moves focus to the page', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: wide(page) ? 'Places' : 'Tabs' });
    const targets = wide(page) ? PLACES.map(([p, l]) => [p, l, l] as const) : PLACES.filter(([, l]) => TABS.includes(l) || l === 'Track record').map(([p, l]) => [p, l, l === 'Track record' ? 'Record' : l] as const);
    for (const [path, heading, link] of targets) {
      await nav.getByRole('link', { name: new RegExp(`^${link}( \\d|$)`) }).click();
      await expect(page).toHaveURL(new RegExp(path === '/' ? '/$' : `${path}$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(H1[path] ?? heading);
      await expect(page.locator('main')).toBeFocused();
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(nav.locator('[aria-current="page"]')).toHaveText(new RegExp(`^${link}( \\d+)?$`));
    }
  });

  test('on a phone, Research lights Portfolio and Imports lights Settings (OWN-02)', async ({ page }) => {
    test.skip(wide(page), 'phone only');
    // The design reaches Research from Home through the brief pill, and the brief is a later build step; the place keeps its tab.
    await page.goto('/research');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Research');
    await expect(page.getByRole('navigation', { name: 'Tabs' }).locator('[aria-current="page"]')).toHaveText('Portfolio');
    await page.goto('/settings');
    for (const name of ['Approvals', 'Imports', 'Data sources']) await expect(page.getByRole('main').getByRole('link', { name })).toBeVisible();
    await page.getByRole('main').getByRole('link', { name: 'Imports' }).click();
    await expect(page.getByRole('navigation', { name: 'Tabs' }).locator('[aria-current="page"]')).toHaveText('Settings');
  });

  test('the skip link takes focus to the page', async ({ page }) => {
    await page.goto('/forecasts');
    // The shell is drawn only once the session is confirmed in the browser; wait for it before pressing keys.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Forecasts');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
});

test.describe('the sample total', () => {
  test('reads in the browser and says it is sample data', async ({ page }) => {
    await page.goto('/');
    // Home draws the value card for desktop and for phone and shows one; the shown one carries the figure
    const total = page.getByTestId('total').filter({ visible: true });
    await expect.poll(async () => (await total.innerText()).replace(/\s+/g, '')).toBe('£90,155.25');
    await expect(page.getByText('Illustrative', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  });

  test('is not in the prebuilt page', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).not.toContain('90,155');
  });
});

test.describe('theme', () => {
  test('a press changes the page already drawn, survives a reload, then follows the device again', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/settings');
    const ground = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const light = await ground();
    await page.getByRole('button', { name: 'Dark' }).click();
    await expect(page.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await ground()).not.toBe(light);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('link', { name: wide(page) ? 'Forecasts' : 'Forecasts', exact: true }).first().click();
    expect(await ground()).not.toBe(light);
    await page.goto('/settings');
    await page.getByRole('button', { name: 'Device' }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
    expect(await ground()).toBe(light);
  });
});

test.describe('accessibility and layout', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`every place passes axe WCAG 2.2 A and AA in ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      for (const [path, label] of PLACES) {
        await page.goto(path);
        // Check the drawn page, never the blank one before the session is confirmed.
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(H1[path] ?? label);
        await page.waitForLoadState('networkidle');
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(r.passes.length, 'axe ran no checks').toBeGreaterThan(0);
        expect(r.violations.map((v) => `${path}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      }
    });
  }

  test('every page\'s browser title names the page its heading names (WCAG 2.4.2)', async ({ page }) => {
    const paths = [...PLACES.map(([p]) => p), '/holdings', '/holdings/NVDA', '/holdings/RELIANCE', '/settings/privacy',
      '/record/track', '/record/track/slice', '/record/track/holding', '/record/track/model', '/record/track/regime'];
    for (const path of paths) {
      await page.goto(path);
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toBeVisible();
      // the design titles one holding "One holding" on a desktop and by its ticker on a phone; the browser title names the holding
      const ticker = /^\/holdings\/([A-Z]+)$/.exec(path)?.[1];
      await expect(page, path).toHaveTitle(`${ticker ?? (await h1.innerText()).trim()} · MyPrediction`);
    }
  });

  test('no place scrolls sideways at any width from 320 to 1440', async ({ page }) => {
    test.setTimeout(300_000); // a whole sweep on a slow CI runner (lesson 55)
    test.skip(wide(page), 'one sweep is enough; it sets its own widths');
    for (const [path, label] of PLACES) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(H1[path] ?? label);
      for (let w = 320; w <= 1440; w += 8) {
        await page.setViewportSize({ width: w, height: 800 });
        const over = await overflowX(page);
        expect(over, `${path} at ${w}px`).toBeLessThanOrEqual(0);
      }
    }
  });
});

test('the manifest and the service worker are served', async ({ page, request }) => {
  const m = await (await request.get('/manifest.webmanifest')).json();
  expect(m.display).toBe('standalone');
  for (const icon of m.icons) expect((await request.get(icon.src)).ok(), icon.src).toBe(true);
  await page.goto('/');
  const sw = await page.evaluate(async () => (await navigator.serviceWorker.ready).active?.scriptURL);
  expect(sw).toMatch(/\/service-worker\.js$/);
});
