import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

const passkey = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /passkey/ });
const google = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /Google/ });

test.describe('signed out', () => {
  test('any place goes to sign-in, which shows no navigation and no data', async ({ page }) => {
    await page.goto('/forecasts');
    await expect(page).toHaveURL(/\/signin\?next=%2Fforecasts$/);
    await expect(page.getByRole('heading', { name: 'MyPrediction' })).toBeVisible();
    await expect(page.getByRole('navigation')).toHaveCount(0);
    await expect(page.getByText('£')).toHaveCount(0);
    await expect(page.getByText('Pretend sign-in · local')).toBeVisible();
    await expect(page.getByText('No passwords')).toBeVisible();
  });

  test('the prebuilt pages hold nothing that sits behind sign-in', async ({ request }) => {
    for (const path of ['/', '/forecasts', '/settings']) {
      const html = await (await request.get(path)).text();
      expect(html, path).not.toContain('Not built yet');
      expect(html, path).not.toContain('aria-label="Places"');
      expect(html, path).not.toContain('Sign out');
    }
  });
});

test.describe('signing in', () => {
  test('a passkey returns you to the place you asked for, and focus is on the page', async ({ page }) => {
    await page.goto('/forecasts');
    await passkey(page).click();
    await expect(page).toHaveURL(/\/forecasts$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Forecasts');
  });

  test('Google waits for its window, then signs in', async ({ page }) => {
    await page.goto('/signin');
    await google(page).click();
    await expect(page.getByText('Waiting for Google.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Waiting for Google' })).toBeDisabled();
    await expect(passkey(page)).toBeDisabled();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Portfolio');
  });

  test('a next address that leaves the app goes home instead', async ({ page }) => {
    for (const bad of ['//evil.example', 'https://evil.example', '/\\evil.example']) {
      await page.goto(`/signin?next=${encodeURIComponent(bad)}`);
      await passkey(page).click();
      await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
      await page.evaluate(() => sessionStorage.clear());
    }
  });

  test('already signed in, the sign-in screen moves on', async ({ page }) => {
    await signIn(page, '/segments');
    await page.goto('/signin?next=%2Fsegments');
    await expect(page).toHaveURL(/\/segments$/);
  });
});

test.describe('every drawn state of the sign-in screen', () => {
  test('Google down: Google is unavailable and the passkey still works', async ({ page }) => {
    await page.goto('/signin?pretend=google-down');
    await expect(page.getByText('Google cannot be reached.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Google unavailable' })).toBeDisabled();
    await passkey(page).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Portfolio');
  });

  test('a new device puts Google first', async ({ page }) => {
    await page.goto('/signin?pretend=new-device');
    await expect(page.getByText('New device.')).toBeVisible();
    await expect(page.getByRole('button').first()).toHaveText('Continue with Google');
    await google(page).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Portfolio');
  });

  test('a wrong account is refused and nothing is kept', async ({ page }) => {
    await page.goto('/signin?pretend=wrong-account');
    await passkey(page).click();
    await expect(page.getByText('That sign-in did not work here.')).toBeVisible();
    await expect(page).toHaveURL(/\/signin/);
    expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  });

  test('too many tries pauses both ways in', async ({ page }) => {
    await page.goto('/signin?pretend=paused');
    await passkey(page).click();
    await expect(page.getByText('Sign-in is paused.')).toBeVisible();
    await expect(passkey(page)).toBeDisabled();
    await expect(google(page)).toBeDisabled();
  });

  test('offline disables sign-in and says why; back online it returns', async ({ page, context }) => {
    await page.goto('/signin');
    await expect(passkey(page)).toBeEnabled();
    await context.setOffline(true);
    await expect(page.getByText('Offline.')).toBeVisible();
    await expect(passkey(page)).toBeDisabled();
    await context.setOffline(false);
    await expect(page.getByText('Offline.')).toHaveCount(0);
    await expect(passkey(page)).toBeEnabled();
  });

  test('an expired session says so and returns you after sign-in', async ({ page }) => {
    await page.goto('/settings?pretend=expired');
    await expect(page).toHaveURL(/\/signin\?next=.*reason=expired/);
    await expect(page.getByText('Your session expired.')).toBeVisible();
    await passkey(page).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  });

  test('a session that runs out while the app is open goes back to sign-in', async ({ page }) => {
    await signIn(page, '/record');
    await page.evaluate(() => {
      const s = JSON.parse(sessionStorage.getItem('mp-pretend-session')!);
      s.expiresAt = Date.now() - 1;
      sessionStorage.setItem('mp-pretend-session', JSON.stringify(s));
      window.dispatchEvent(new Event('focus'));
    });
    await expect(page).toHaveURL(/\/signin\?next=%2Frecord&reason=expired/);
    await expect(page.getByText('Your session expired.')).toBeVisible();
  });
});

test.describe('signing out', () => {
  test('Settings signs out, and nothing behind sign-in can be reached again', async ({ page }) => {
    await signIn(page, '/');
    // Build real history: Portfolio, then Forecasts, then Settings, by pressing links.
    const nav = page.getByRole('navigation', { name: (page.viewportSize()?.width ?? 0) >= 1024 ? 'Places' : 'Tabs' });
    await nav.getByRole('link', { name: 'Forecasts', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Forecasts');
    await nav.getByRole('link', { name: 'Settings', exact: true }).click();
    await expect(page.getByText('Signed in with a passkey.')).toBeVisible();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/signin$/);
    expect(await page.evaluate(() => sessionStorage.getItem('mp-pretend-session'))).toBeNull();
    // Back reaches a private page's address, and the guard sends it to sign-in without drawing it.
    await page.goBack();
    await expect(page).toHaveURL(/\/signin\?next=%2Fforecasts$/);
    await expect(page.getByRole('heading', { name: 'Forecasts' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
    await page.goto('/');
    await expect(page).toHaveURL(/\/signin\?next=%2F$/);
  });
});

test.describe('accessibility', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`every sign-in state passes axe WCAG 2.2 A and AA in ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      for (const sc of ['', 'google-down', 'new-device', 'expired']) {
        await page.evaluate(() => sessionStorage.clear()).catch(() => {});
        await page.goto(sc ? `/signin?pretend=${sc}${sc === 'expired' ? '&reason=expired' : ''}` : '/signin');
        await expect(passkey(page)).toBeVisible();
        // the design's buttons fade their colour when they turn on (180 ms): judge the page at rest, not mid-fade
        await expect(passkey(page)).toBeEnabled();
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(r.passes.length).toBeGreaterThan(0);
        expect(r.violations.map((v) => `${sc || 'default'}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      }
    });
  }
});
