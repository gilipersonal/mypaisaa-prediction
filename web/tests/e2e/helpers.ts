import { expect, type Page } from '@playwright/test';

/** Signs in with the pretend passkey and waits for the app. */
export async function signIn(page: Page, path = '/'): Promise<void> {
  await page.goto(`/signin?next=${encodeURIComponent(path)}`);
  await page.getByRole('button', { name: 'Continue with a passkey' }).click();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page).not.toHaveURL(/\/signin/);
}

/**
 * How far the page runs past the window sideways, in pixels, on the frame the browser paints. It reads the document and
 * the pane: from 1024 wide the pane (main) scrolls on its own, as the design's does, so a too-wide card would scroll the
 * pane and never the document.
 */
export async function overflowX(page: Page): Promise<number> {
  return page.evaluate(() => new Promise<number>((done) => requestAnimationFrame(() => {
    const els = [document.documentElement, document.querySelector('main')].filter((e): e is HTMLElement => !!e);
    done(Math.max(...els.map((e) => e.scrollWidth - e.clientWidth)));
  })));
}
